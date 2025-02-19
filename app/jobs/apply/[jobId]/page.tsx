import { getJob } from "@/lib/jobs";
import { notFound } from "next/navigation";
import { PublicJobView } from "@/components/jobs/public-job-view";

export default async function PublicJobPage({
  params: { jobId },
}: {
  params: { jobId: string };
}) {
  const job = await getJob(jobId);
  
  if (!job || job.status !== 'active') {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <PublicJobView job={job} />
    </main>
  );
} 