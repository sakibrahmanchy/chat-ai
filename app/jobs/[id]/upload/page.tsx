import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ResumeUploader } from "@/components/resume/resume-uploader";
import { supabase } from "@/lib/supabase/client";

export default async function UploadResumePage({
  params: { id: jobId }
}: {
  params: { id: string }
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Verify user has access to this job
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, title, company_id')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    redirect("/dashboard/jobs");
  }

  // Verify user belongs to the company
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', userId)
    .single();

  if (userError || user?.company_id !== job.company_id) {
    redirect("/dashboard/jobs");
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Upload Resume</h1>
          <p className="text-muted-foreground">
            Upload candidate resumes for {job.title}
          </p>
        </div>

        <ResumeUploader jobId={jobId} />
      </div>
    </div>
  );
} 