import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { adminDb } from '@/firebase-admin';
import { scoreResume } from '@/lib/ai/resume-scorer';
import { updateResumeInIndex } from '@/lib/algolia';

export async function POST(
  req: NextRequest,
  { params }: { params: { jobId: string; resumeId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get resume and job documents
    const [resumeDoc, jobDoc] = await Promise.all([
      adminDb.collection('resumes').doc(params.resumeId).get(),
      adminDb.collection('jobs').doc(params.jobId).get()
    ]);

    if (!resumeDoc.exists || !jobDoc.exists) {
      return new NextResponse('Resume or job not found', { status: 404 });
    }

    const resumeData = resumeDoc.data();
    const jobData = jobDoc.data();

    // Score resume
    const scores = await scoreResume(resumeData, jobData);

    // Update resume document
    await resumeDoc.ref.update({
      scores,
      matchScore: scores.averageScore,
      updatedAt: new Date().toISOString(),
      lastScoredAt: new Date().toISOString()
    });

    // Update Algolia index
    await updateResumeInIndex(params.resumeId, {
      scores,
      matchScore: scores.averageScore,
      updatedAt: new Date().toISOString(),
      lastScoredAt: new Date().toISOString()
    });

    // Track scoring history
    await adminDb.collection('resumeScores').add({
      resumeId: params.resumeId,
      jobId: params.jobId,
      userId,
      scores,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true, scores });
  } catch (error) {
    console.error('Error scoring resume:', error);
    return new NextResponse('Error scoring resume', { status: 500 });
  }
} 