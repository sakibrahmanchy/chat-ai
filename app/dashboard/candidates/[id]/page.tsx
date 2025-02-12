import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { adminDb } from "@/firebase-admin";
import { CandidateProfile } from "@/components/smarthrflow/candidate-profile";
import { serializeData } from "@/lib/server-utils";
import { notFound } from "next/navigation";

async function getCandidate(userId: string, candidateId: string) {
  // Search through all jobs to find the resume
  const jobsRef = adminDb.collection("users").doc(userId).collection("jobs");
  const jobsSnapshot = await jobsRef.get();
  
  for (const jobDoc of jobsSnapshot.docs) {
    const resumeRef = jobDoc.ref.collection("resumes").doc(candidateId);
    const resumeDoc = await resumeRef.get();
    
    if (resumeDoc.exists) {
      const data = serializeData(resumeDoc.data());
      const jobData = serializeData(jobDoc.data());
      
      return {
        id: resumeDoc.id,
        jobId: jobDoc.id,
        jobTitle: jobData.title,
        jobDescription: jobData.description,
        requiredSkills: jobData.requiredSkills,
        ...data
      };
    }
  }
  
  return null;
}

export default async function CandidateDetailsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const candidate = await getCandidate(userId, params.id);
  
  if (!candidate) {
    notFound();
  }

  return (
    <div>
      <CandidateProfile candidate={candidate} />
    </div>
  );
} 