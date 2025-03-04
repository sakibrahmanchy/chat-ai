import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from 'uuid';
import { processResume } from '../../../../../lib/ai/resume-processor';
import { scoreResume } from '@/lib/ai/resume-scorer';
import { supabase } from '@/lib/supabase/client';
import { activityService } from '@/lib/services/activity.service';
import { listService } from '@/lib/services/list.service';

// Main POST handler
export async function POST(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    let { userId } = await auth();
    let companyId = '';
    if (!userId) {
      const { error: companyIdError, data } = await supabase.from('jobs')
      .select('company_id')
      .eq('id', params.jobId)
      .single();
      if (companyIdError) throw companyIdError;
      companyId = data.company_id;
      const { data: userData, error: userError } = await supabase.from('users').select('id').eq('company_id', companyId).single();
      if (userError) throw userError;
      userId = userData.id;

      if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    } else {
      const { data: userData, error: companyError } = await supabase.from('users')
      .select('company_id').eq('id', userId).single();
      console.log({ userData, userId })
      if (!userData || companyError) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      companyId = userData.company_id;
    }

    const formData = await req.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 });
    }

    // Process resume and get parsed data
    // const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { parsedData, hash, id } = await processResume(file, params.jobId, userId, companyId);

    const { data: job, error: jobError } = await supabase.from('jobs').select('*').eq('id', params.jobId).single(); 
    if (jobError) throw jobError;

    // Score resume using only IDs
    await scoreResume(id, params.jobId, companyId);

    await supabase.from('jobs').update({
      total_applications: job.total_applications + 1
    }).eq('id', params.jobId);

    await listService.addCandidateToJobMatch(id, params.jobId, 'pending');

    // Generate a UUID for activity logging
    // const activityId = uuidv4();

    // Log activity with UUID instead of hash
    // await activityService.logActivity({
    //   userId,
    //   companyId: job.company_id,
    //   type: 'resume_uploaded',
    //   description: activityService.getActivityDescription('resume_uploaded', {
    //     jobTitle: job.title
    //   }),
    //   entityType: 'resume',
    //   entityId: activityId,
    //   metadata: {
    //     jobTitle: job.title,
    //     jobId: job.id,
    //     resumeId: hash,
    //     candidateName: parsedData.full_name
    //   }
    // });

    return NextResponse.json({ success: true, data: parsedData, id: hash });
  } catch (error) {
    console.error('Error processing resume:', error);
    return new NextResponse('Error processing resume', { status: 500 });
  }
} 