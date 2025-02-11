import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { JobList } from "@/components/smarthrflow/job-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function JobsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Job Listings</h1>
        <Link href="/dashboard/jobs/new">
          <Button>Post New Job</Button>
        </Link>
      </div>
      <JobList userId={userId} />
    </div>
  );
} 