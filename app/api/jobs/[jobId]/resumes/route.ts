import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from "../../../../../firebase-admin";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from 'uuid';
import { processResume } from '../../../../../lib/ai/resume-processor';
import { Timestamp } from 'firebase-admin/firestore';
// export const dynamic = 'force-dynamic'

// export async function GET() {
//   return new Response("API X Debug is working");
// }

// Main POST handler
export async function POST(
  req: Request,
  { params }: { params: { jobId: string } }
) {
  console.log("POST request received", { params });
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('resumes') as File[];
    
    if (!files.length) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    const file = files[0];
    const buffer = Buffer.from(await file.arrayBuffer());

    const parsedResume = await processResume(buffer, params.jobId, userId);
  
    const bucket = adminStorage.bucket();
    const fileId = uuidv4();
    const fileName = `${fileId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `users/${userId}/resumes/${fileName}`;
    
    // Upload original PDF
    const fileRef = bucket.file(filePath);
    await fileRef.save(buffer, {
      metadata: { 
        contentType: file.type,
        metadata: {
          parsedData: JSON.stringify(parsedResume),
          jobId: params.jobId,
          userId,
          parsedAt: new Date().toISOString()
        }
      }
    });
    
    // Get signed URL for the PDF
    const [downloadUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500',
    });

    // Save reference to Firestore
    const resumeRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("jobs")
      .doc(params.jobId)
      .collection("resumes")
      .doc(fileId);

    const resumeData = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      downloadUrl,
      storageRef: filePath,
      parsedContent: parsedResume,
      createdAt: Timestamp.now(),
      status: 'processed',
    };

    await resumeRef.set(resumeData);

    return NextResponse.json({ 
      success: true, 
      result: {
        id: fileId,
        ...resumeData
      }
    });

  } catch (error) {
    console.error('Error processing resumes:', error);
    return NextResponse.json(
      { error: 'Error in processing', details: error.message },
      { status: 500 }
    );
  }
} 