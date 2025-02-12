'use client';

import { Job } from "@/app/types/job";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UploadIcon } from 'lucide-react';
import { getRelativeTimeString } from "@/lib/utils";
import { JobContent } from "../job-content";

interface JobDescriptionProps {
  job: Job;
}

export function JobDescription({ job }: JobDescriptionProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="space-y-2">
            <CardTitle>{job.title}</CardTitle>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>{job.company}</span>
              <span>•</span>
              <span>{job.location}</span>
              <span>•</span>
              <span>{job.type}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Posted {getRelativeTimeString(job.createdAt)}
            </p>
          </div>
          <div className="flex justify-end">
            <Link href={`/dashboard/jobs/${job.id}/upload`}>
              <Button>
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload Resume
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <div className="prose prose-sm max-w-none">
            <JobContent content={job.description} />
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Requirements</h3>
          <div className="prose prose-sm max-w-none">
            <JobContent content={job.requirements} />
          </div>
        </div>

        {job.benefits && (
          <div>
            <h3 className="font-semibold mb-2">Benefits</h3>
            <div className="prose prose-sm max-w-none">
              <JobContent content={job.benefits} />
            </div>
          </div>
        )}

        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 