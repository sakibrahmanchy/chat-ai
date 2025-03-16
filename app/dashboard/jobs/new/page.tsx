'use server'
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import JobPostingForm from "@/components/smarthrflow/job-posting-form";
import HeaderView from "@/components/smarthrflow/header-view";

export default async function NewJobPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <HeaderView
      title="Create New Job"
      description="Fill in the details below to create a new job posting"
      backText="Back to Jobs"
      link="/dashboard/jobs"
    >
      <JobPostingForm />
    </HeaderView>
  );
} 