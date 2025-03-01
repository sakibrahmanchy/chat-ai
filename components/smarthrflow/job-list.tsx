'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRelativeTimeString } from "@/lib/utils";
import Link from "next/link";
import { Eye, MapPin, Upload, Pause, Play } from "lucide-react";
import { Job } from "@/app/types/job";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface JobListProps {
  jobs: Job[];
}

function stripHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent?.replace(/\s+/g, ' ').trim() || '';
}

export function JobList({ jobs: initialJobs }: JobListProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    try {
      setUpdatingId(jobId);
      const newStatus = currentStatus === 'active' ? 'draft' : 'active';

      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;

      setJobs(jobs.map(job => 
        job.id === jobId 
          ? { ...job, status: newStatus }
          : job
      ));

      toast({
        title: `Job ${newStatus === 'active' ? 'activated' : 'paused'} successfully`,
        description: `The job posting is now ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "Error updating job status",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="line-clamp-2 flex gap-2 items-center">
                    {job.title}
                    <Badge className={cn(
                      "hidden sm:inline-flex",
                      job.status === 'active' ? "bg-violet-500" :
                      job.status === 'draft' ? "bg-yellow-500" :
                      "text-white"
                    )}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </CardTitle>
                </div>
                <CardDescription>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {job.location ? 
                        `${job.location.city}${job.location.state ? `, ${job.location.state}` : ''}${job.location.country ? `, ${job.location.country}` : ''}` 
                        : job.location}
                    </span>
                    <span>•</span>
                    <span>{job.type}</span>
                    {job.total_applications !== undefined && (
                      <>
                        <span>Applicants:</span>
                        <span>{job.total_applications} applicants</span>
                      </>
                    )}
                  </div>
                </CardDescription>
              </div>
              <Badge variant="secondary" className="self-start sm:hidden">
                {job.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {stripHtml(job.description)}
              </p>

              {/* {job.salary_min && job.salary_max && (
                <p className="text-sm">
                  💰 {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                </p>
              )} */}

              {job.required_skills && job.required_skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Posted {getRelativeTimeString(job.created_at)}
                    {job.experience && ` • ${job.experience}+ years experience`} required
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleJobStatus(job.id, job.status)}
                    disabled={updatingId === job.id}
                  >
                    {updatingId === job.id ? (
                      <span className="animate-spin">⏳</span>
                    ) : job.status === 'active' ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Job
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Activate Job
                      </>
                    )}
                  </Button>
                  <Link href={`/dashboard/jobs/${job.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/dashboard/jobs/${job.id}/upload`}>
                    <Button size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Resume
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {jobs.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No jobs found.
          </CardContent>
        </Card>
      )}
    </div>
  );
} 