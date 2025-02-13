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
// export const dynamic = 'force-dynamic'

// export async function GET() {
//   return new Response("API X Debug is working");
// }

const RESUMES_PER_PAGE = 20;

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const skills = searchParams.getAll('skills[]');
    const experience = searchParams.get('experience') || 'any';
    const matchScoreMin = Number(searchParams.get('matchScoreMin')) || 0;
    const matchScoreMax = Number(searchParams.get('matchScoreMax')) || 10;
    const searchQuery = searchParams.get('search')?.toLowerCase();

    // Build query
    let query = adminDb
      .collection('resumes')
      .where('jobId', '==', params.jobId)
      .orderBy('createdAt', 'desc')
      .limit(RESUMES_PER_PAGE);

    // Apply cursor pagination
    if (cursor) {
      const cursorDoc = await adminDb
        .collection('resumes')
        .doc(cursor)
        .get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    // Get resumes
    const snapshot = await query.get();

    // Process results
    const resumes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply filters in memory
    const filteredResumes = resumes.filter(resume => {
      // Experience filter
      if (experience !== 'any') {
        const experienceRanges = {
          entry: [0, 36],
          mid: [36, 72],
          senior: [72, 120],
          lead: [120, Infinity]
        };
        const range = experienceRanges[experience as keyof typeof experienceRanges];
        if (!range || resume.experienceMonths < range[0] || resume.experienceMonths >= range[1]) {
          return false;
        }
      }

      // Match score filter
      if (resume.matchScore < matchScoreMin || resume.matchScore > matchScoreMax) {
        return false;
      }

      // Skills filter
      if (skills.length > 0 && !skills.every(skill => 
        resume.searchableSkills.includes(skill.toLowerCase())
      )) {
        return false;
      }

      // Search filter
      if (searchQuery && !resume.searchableText.includes(searchQuery)) {
        return false;
      }

      return true;
    });

    return NextResponse.json({
      resumes: filteredResumes,
      hasMore: filteredResumes.length === RESUMES_PER_PAGE,
      nextCursor: snapshot.docs[snapshot.docs.length - 1]?.id
    });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return new NextResponse('Error fetching resumes', { status: 500 });
  }
}

// Main POST handler
export async function POST(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('resumes') as File;
    
    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Process resume
    const parsedData = await processResume(buffer, params.jobId, userId);
    
    // Get job details for scoring
    const jobDoc = await adminDb.collection('jobs').doc(params.jobId).get();
    if (!jobDoc.exists) {
      return new NextResponse('Job not found', { status: 404 });
    }

    // Score resume against job
    const scores = await scoreResume(parsedData, jobDoc.data());

    // Update resume document with scores
    await adminDb
      .collection('resumes')
      .where('parsedContent.full_name', '==', parsedData.full_name)
      .where('jobId', '==', params.jobId)
      .limit(1)
      .get()
      .then(async (snapshot) => {
        if (!snapshot.empty) {
          await snapshot.docs[0].ref.update({
            scores,
            matchScore: scores.averageScore,
            updatedAt: new Date().toISOString()
          });
        }
      });

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    console.error('Error processing resume:', error);
    return new NextResponse('Error processing resume', { status: 500 });
  }
} 