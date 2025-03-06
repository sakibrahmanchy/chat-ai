import { getJob } from "@/lib/jobs";
import { notFound } from "next/navigation";
import { PublicJobView } from "@/components/jobs/public-job-view";
import { supabase } from "@/lib/supabase/client";

export default async function PublicJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const job = await getJob(jobId);
  
  if (!job || job.status !== 'active') {
    notFound();
  }

  console.log({ job })
  // check credits
  const { data: userCredits, error: userCreditsError } = await supabase
    .from('company_credits')
    .select('credits_balance')
    .eq('company_id', job.company_id)
    .single();


  return (
    <main className="min-h-screen bg-slate-50">
      <PublicJobView job={job} disabledApplication={!!userCreditsError || !userCredits || !userCredits.credits_balance || job.status !== 'active'}/>
    </main>
  );
} 