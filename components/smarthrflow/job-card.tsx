'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRelativeTimeString } from "@/lib/utils";

function stripHtml(html: string) {
  // Create a temporary element
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Get text content and normalize whitespace
  return doc.body.textContent?.replace(/\s+/g, ' ').trim() || '';
}

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    company: string;
    location: string;
    type: string;
    requiredSkills?: string[];
    createdAt: Date;
  };
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="line-clamp-2">{job.title}</CardTitle>
            <CardDescription className="mt-1">
              {job.company} • {job.location}
            </CardDescription>
          </div>
          <Badge variant="secondary">{job.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
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

          <p className="text-xs text-muted-foreground">
            Posted {getRelativeTimeString(job.createdAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 