import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { JobList } from "@/components/smarthrflow/job-list";
import { adminDb } from "@/firebase-admin";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Suspense } from "react";

async function getJobs(userId: string) {
  const jobsRef = adminDb.collection("users").doc(userId).collection("jobs");
  const snapshot = await jobsRef.orderBy("createdAt", "desc").get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  }));
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