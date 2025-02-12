import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { JobContent } from "../job-content";

export function JobDetails({ job }: { job: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{job.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ... other job details ... */}
        
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <JobContent content={job.description} />
        </div>

        <div>
          <h3 className="font-semibold mb-2">Requirements</h3>
          <JobContent content={job.requirements} />
        </div>

        {job.benefits && (
          <div>
            <h3 className="font-semibold mb-2">Benefits</h3>
            <JobContent content={job.benefits} />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 