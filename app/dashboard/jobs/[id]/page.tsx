import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { JobDetail } from "@/components/smarthrflow/job-detail";

interface JobDetailPageProps {
  params: {
    id: string;
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container py-10">
      <JobDetail jobId={params.id} userId={userId} />
    </div>
  );
} 