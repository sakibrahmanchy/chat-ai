'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRelativeTimeString } from "@/lib/utils";
import Link from "next/link";
import { Eye, Upload } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: string;
  requiredSkills?: string[];
  createdAt: Date;
  status: string;
  applicantsCount?: number;
}

interface JobListProps {
  jobs: Job[];
}

function stripHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent?.replace(/\s+/g, ' ').trim() || '';
}

export function JobList({ jobs }: JobListProps) {
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="line-clamp-2">{job.title}</CardTitle>
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    {job.status}
                  </Badge>
                </div>
                <CardDescription>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span>{job.company}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                    {job.applicantsCount !== undefined && (
                      <>
                        <span>•</span>
                        <span>{job.applicantsCount} applicants</span>
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

              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Posted {getRelativeTimeString(job.createdAt)}
                </p>
                <div className="flex gap-2">
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