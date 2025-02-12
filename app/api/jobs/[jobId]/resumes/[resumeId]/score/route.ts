import { NextResponse } from 'next/server';
import { adminDb } from '@/firebase-admin';
import { auth } from "@clerk/nextjs/server";
import { scoreResume } from '@/lib/ai/resume-scorer';

export async function POST(
  req: Request,
  { params }: { params: { jobId: string; resumeId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { jobId, resumeId } = params;

    // Get job and resume data
    const jobDoc = await adminDb
      .collection('users')
      .doc(userId)
      .collection('jobs')
      .doc(jobId)
      .get();

    const resumeDoc = await jobDoc.ref
      .collection('resumes')
      .doc(resumeId)
      .get();

    if (!jobDoc.exists || !resumeDoc.exists) {
      return new NextResponse("Not found", { status: 404 });
    }

    const job = { id: jobDoc.id, ...jobDoc.data() };
    const resume = { id: resumeDoc.id, ...resumeDoc.data() };

    // Score the resume
    const scoreResult = await scoreResume(resume, job);

    // Update the resume document with scores
    await resumeDoc.ref.update({
      scores: scoreResult,
      lastScored: new Date(),
    });

    return NextResponse.json(scoreResult);
  } catch (error) {
    console.error('Error scoring resume:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 