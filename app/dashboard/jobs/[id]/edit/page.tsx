'use client'
import JobPostingForm from "@/components/smarthrflow/job-posting-form";
import HeaderView from "@/components/smarthrflow/header-view";
import { useParams } from "next/navigation";
export default function EditJobPage() {
  const { id } = useParams();

  if (!id) {
    return <div>No job id found</div>;
  }

  return (
    <HeaderView
      title="Edit Job"
      description="Edit the job details and post it again."
      backText="Back to Jobs"
      link="/dashboard/jobs"
    >
      <JobPostingForm jobId={id as string} />
    </HeaderView>
  )
}

