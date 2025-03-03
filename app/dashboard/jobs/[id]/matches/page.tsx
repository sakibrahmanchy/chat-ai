import { CandidateListView } from "@/components/smarthrflow/candidate-list-view";
import { createClient } from '@supabase/supabase-js';
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Resume } from "@/app/types/resume";
import { listService } from "@/lib/services/list.service";

// Create a server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CANDIDATES_PER_PAGE = 20;

export default async function JobPage({
  params: { id: jobId },
}: {
  params: { id: string };
}) {
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

    const { shortlistedCandidates, rejectedCandidates } = await listService.getShortlistedAndRejectedLists(jobId);

    console.log(shortlistedCandidates);
    console.log(rejectedCandidates);

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

    // Get resumes for this job
    // join with job_resume_matches to get the status, we will always have one row per resume
    const { data: resumes = [], error: resumesError } = await supabase
      .from('resumes')
      .select(`
        id,
        hash,
        parsed_content,
        scores,
        searchable_skills,
        experience_months,
        current_position,
        overall_score,
        metadata,
        location,
        created_at,
        updated_at,
        job_resume_matches (
          status
        )
      `)
      .eq('job_id', jobId)
      .order('overall_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(CANDIDATES_PER_PAGE);
    console.log({ resumes });
    if (resumesError) {
      console.error('Error fetching resumes:', resumesError);
      return null;
    }

    return (
      <CandidateListView 
        initialResumes={resumes as Resume[]} 
        jobId={jobId} 
        jobTitle={job.title}
        userId={userId}
        companyId={user.company_id}
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