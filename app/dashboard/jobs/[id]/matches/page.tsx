import { CandidateListView } from "@/components/smarthrflow/candidate-list-view";
import { createClient } from '@supabase/supabase-js';
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { listService } from "@/lib/services/list.service";

// Create a server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CANDIDATES_PER_PAGE = 20;

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: jobId } = await params;
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  try {
    // Get user's company_id
    const { data: user } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', userId)
      .single();

    if (!user?.company_id) {
      redirect("/dashboard");
    }

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        description,
        requirements,
        responsibilities,
        required_skills,
        company_id,
        created_at,
        updated_at
      `)
      .eq('id', jobId)
      .eq('company_id', user.company_id)
      .single();

    if (jobError || !job) {
      redirect("/dashboard/jobs");
    }

    return (
      <CandidateListView
        jobId={jobId} 
        jobTitle={job.title}
        userId={userId}
        jobDescription={job.description}
        requiredSkills={job.required_skills || []}
        requirements={job.requirements}
        responsibilities={job.responsibilities}
      />
    );
  } catch (error) {
    console.error('Error fetching job and resumes:', error);
    return null;
  }
} 