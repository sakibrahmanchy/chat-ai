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

    const { jobId, resumeId } = params;
    if (!jobId || !resumeId) {
      return new NextResponse('Resume or job not found', { status: 404 });
    }
    // Score resume
    const scores = await scoreResume(resumeId, jobId);

    return NextResponse.json({ success: true, scores });
  } catch (error) {
    console.error('Error scoring resume:', error);
    return new NextResponse('Error scoring resume', { status: 500 });
  }
} 