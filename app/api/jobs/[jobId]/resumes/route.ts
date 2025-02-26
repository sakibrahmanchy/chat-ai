import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from "../../../../../firebase-admin";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from 'uuid';
import { processResume } from '../../../../../lib/ai/resume-processor';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  getDocs,
  Query,
  DocumentData
} from 'firebase/firestore';
import { scoreResume } from '@/lib/ai/resume-scorer';
import { supabase } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { activityService } from '@/lib/services/activity.service';
import { createHash } from 'crypto';
import { creditService } from '@/lib/services/credits.service';

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
// export const dynamic = 'force-dynamic'

// export async function GET() {
//   return new Response("API X Debug is working");
// }

// const RESUMES_PER_PAGE = 20;

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { jobId: string } }
// ) {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const cursor = searchParams.get('cursor');
//     const skills = searchParams.getAll('skills[]');
//     const experience = searchParams.get('experience') || 'any';
//     const matchScoreMin = Number(searchParams.get('matchScoreMin')) || 0;
//     const matchScoreMax = Number(searchParams.get('matchScoreMax')) || 10;
//     const searchQuery = searchParams.get('search')?.toLowerCase();

//     // Build query
//     let query = adminDb
//       .collection('resumes')
//       .where('jobId', '==', params.jobId)
//       .orderBy('createdAt', 'desc')
//       .limit(RESUMES_PER_PAGE);

//     // Apply cursor pagination
//     if (cursor) {
//       const cursorDoc = await adminDb
//         .collection('resumes')
//         .doc(cursor)
//         .get();
//       if (cursorDoc.exists) {
//         query = query.startAfter(cursorDoc);
//       }
//     }

//     // Get resumes
//     const snapshot = await query.get();

//     // Process results
//     const resumes = snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     }));

//     // Apply filters in memory
//     const filteredResumes = resumes.filter(resume => {
//       // Experience filter
//       if (experience !== 'any') {
//         const experienceRanges = {
//           entry: [0, 36],
//           mid: [36, 72],
//           senior: [72, 120],
//           lead: [120, Infinity]
//         };
//         const range = experienceRanges[experience as keyof typeof experienceRanges];
//         if (!range || resume.experienceMonths < range[0] || resume.experienceMonths >= range[1]) {
//           return false;
//         }
//       }

//       // Match score filter
//       if (resume.matchScore < matchScoreMin || resume.matchScore > matchScoreMax) {
//         return false;
//       }

//       // Skills filter
//       if (skills.length > 0 && !skills.every(skill => 
//         resume.searchableSkills.includes(skill.toLowerCase())
//       )) {
//         return false;
//       }

//       // Search filter
//       if (searchQuery && !resume.searchableText.includes(searchQuery)) {
//         return false;
//       }

//       return true;
//     });

//     return NextResponse.json({
//       resumes: filteredResumes,
//       hasMore: filteredResumes.length === RESUMES_PER_PAGE,
//       nextCursor: snapshot.docs[snapshot.docs.length - 1]?.id
//     });
//   } catch (error) {
//     console.error('Error fetching resumes:', error);
//     return new NextResponse('Error fetching resumes', { status: 500 });
//   }
// }

// Main POST handler
export async function POST(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    let { userId } = await auth();
    if (!userId) {
      const { error: companyIdError, data } = await supabase.from('jobs')
      .select('company_id')
      .eq('id', params.jobId)
      .single();
      if (companyIdError) throw companyIdError;
      const companyId = data.company_id;
      const { data: userData, error: userError } = await supabase.from('users').select('id').eq('company_id', companyId).single();
      if (userError) throw userError;
      userId = userData.id;

      if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    const hasCredits = await creditService.hasEnoughCredits(
      userId,
      'process_resume'
    );

    if (!hasCredits) {
      return new NextResponse('Insufficient credits', { status: 402 });
    }

    const formData = await req.formData();
    const file = formData.get('resume') as File;
    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 });
    }

    // Process resume and get parsed data
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { parsedData, hash, id } = await processResume(fileBuffer, params.jobId, userId);

    const { data: job, error: jobError } = await supabase.from('jobs').select('*').eq('id', params.jobId).single(); 
    if (jobError) throw jobError;

    // Score resume using only IDs
    const scores = await scoreResume(id, params.jobId);

    // Update resume with scores
    const { error: updateError } = await supabase
      .from('resumes')
      .update({ 
        scores,
        overall_score: scores.overallScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Generate a UUID for activity logging
    const activityId = uuidv4();

    // Log activity with UUID instead of hash
    await activityService.logActivity({
      userId,
      companyId: job.company_id,
      type: 'resume_uploaded',
      description: activityService.getActivityDescription('resume_uploaded', {
        jobTitle: job.title
      }),
      entityType: 'resume',
      entityId: activityId,
      metadata: {
        jobTitle: job.title,
        jobId: job.id,
        resumeId: hash,
        candidateName: parsedData.full_name
      }
    });

    await creditService.useCredits(
      userId,
      'process_resume',
      'resume',
      id
    );

    return NextResponse.json({ success: true, data: parsedData, id: hash });
  } catch (error) {
    console.error('Error processing resume:', error);
    return new NextResponse('Error processing resume', { status: 500 });
  }
} 