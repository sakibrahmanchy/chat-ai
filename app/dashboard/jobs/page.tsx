import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { JobList } from "@/components/smarthrflow/job-list";
import { adminDb } from "@/firebase-admin";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase/client";

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
  
  const { data: user } = await supabase

    .from('users')

    .select('company_id')

    .eq('id', userId)

    .single();



  if (!user?.company_id) {

    return <div>No company associated with this user</div>;

  }



  // Get jobs for the user's company

  const { data: jobs = [], error } = await supabase

    .from('jobs')

    .select('*')

    .eq('company_id', user.company_id)

    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  return jobs;
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