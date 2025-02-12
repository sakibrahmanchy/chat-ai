import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { JobPostingForm } from "@/components/smarthrflow/job-posting-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewJobPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/jobs">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-semibold">Create New Job</h1>
          <p className="text-muted-foreground">
            Fill in the details below to create a new job posting
          </p>
        </div>
      </div>

      <JobPostingForm />
    </div>
  );
} 