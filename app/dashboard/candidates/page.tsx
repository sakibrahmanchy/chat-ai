import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { adminDb } from "@/firebase-admin";
import { CandidateList } from "@/components/smarthrflow/candidate-list";
import { Timestamp } from "firebase-admin/firestore";

// Add a type for the candidate
interface Candidate {
  id: string;
  jobId: string;
  jobTitle: string;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  status: string;
  createdAt: string; // ISO string
  parsedContent?: {
    full_name?: string;
    occupation?: string;
    email?: string;
    phone?: string;
    overallFit?: number;
    createdAt?: string; // Add this if parsedContent has timestamps
  };
}

// Helper function to convert Firestore data to plain objects
function serializeData(data: any): any {
  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }
  
  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }
  
  if (data && typeof data === 'object') {
    return Object.keys(data).reduce((result, key) => {
      result[key] = serializeData(data[key]);
      return result;
    }, {} as any);
  }
  
  return data;
}

async function getCandidates(userId: string): Promise<Candidate[]> {
  const jobsRef = adminDb.collection("users").doc(userId).collection("jobs");
  const jobsSnapshot = await jobsRef.get();
  
  const candidates = await Promise.all(
    jobsSnapshot.docs.map(async (jobDoc) => {
      const resumesSnapshot = await jobDoc.ref.collection("resumes").get();
      return resumesSnapshot.docs.map(resumeDoc => {
        const data = serializeData(resumeDoc.data());
        const jobData = serializeData(jobDoc.data());

        return {
          id: resumeDoc.id,
          jobId: jobDoc.id,
          jobTitle: jobData.title,
          fileName: data.fileName,
          fileSize: data.fileSize,
          downloadUrl: data.downloadUrl,
          status: data.status,
          createdAt: data.createdAt,
          parsedContent: data.parsedContent,
        } as Candidate;
      });
    })
  );

  // Flatten and sort by date
  return candidates
    .flat()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default async function CandidatesPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const candidates = await getCandidates(userId);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Candidates</h1>
          <p className="text-muted-foreground">
            Manage and track all your candidates
          </p>
        </div>
      </div>

      <CandidateList candidates={candidates} />
    </div>
  );
} 