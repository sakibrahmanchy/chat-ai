import { Card } from "@/components/ui/card";
import { adminJobService } from "@/lib/services/admin/job.service";
import { JobList } from "@/components/admin/jobs/job-list";
import { JobFilters } from "@/components/admin/jobs/job-filters";

export default async function AdminJobsPage() {
  const jobs = await adminJobService.getAllJobs();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Jobs</h1>
      </div>

      <Card className="p-6">
        <JobFilters />
        <JobList jobs={jobs} />
      </Card>
    </div>
  );
} 