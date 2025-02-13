import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { JobList } from "@/components/smarthrflow/job-list";
import { adminDb } from "@/firebase-admin";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Suspense } from "react";

interface Job {
  id: string;
  // Core job details
  title: string;
  company: string;
  description: string;
  location: string; // Keep old format
  type: string; // Keep old format
  
  // New structured data
  location_structured: {
    city: string;
    state: string;
    country: string;
  };
  employmentType: string;
  experienceRequired: number;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  
  // Skills and requirements
  requiredSkills: string[];
  skills: string[]; // Keep old format
  
  // Metadata
  status: string;
  createdAt: string;
  updatedAt: string;
  totalApplications: number;
  totalViews: number;
}

async function getJobs(userId: string) {
  const jobsRef = adminDb
    .collection("jobs");
    
  const snapshot = await jobsRef
    .orderBy("createdAt", "desc")
    .get();
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Convert Firestore timestamps to ISO strings
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
      // Ensure required fields exist
      requiredSkills: data.requiredSkills || data.skills || [],
      location_structured: data.location_structured || {
        city: data.location?.city,
        state: data.location?.state,
        country: data.location?.country
      },
      employmentType: data.employmentType || data.type,
      totalApplications: data.totalApplications || 0,
      totalViews: data.totalViews || 0,
      status: data.status || 'active'
    } as Job;
  });
}

export default async function JobsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const jobs = await getJobs(userId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Job Listings</h1>
          <p className="text-muted-foreground">
            Manage and track all your job postings
          </p>
        </div>
        <Link href="/dashboard/jobs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }>
        <JobList jobs={jobs} />
      </Suspense>
    </div>
  );
} 