'use client';

import { Job } from "@/app/types/job";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { 
  MoreVertical, 
  Users, 
  Calendar,
  MapPin,
  Building,
  DollarSign 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JobListProps {
  jobs: Job[];
}

export function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No jobs found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/jobs/new">Create a Job</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div key={job.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
          <div className="space-y-2 mb-4 md:mb-0">
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/jobs/${job.id}`}>
                <h3 className="font-semibold hover:text-primary">{job.title}</h3>
              </Link>
              <Badge variant={
                job.status === 'active' ? 'success' :
                job.status === 'draft' ? 'secondary' :
                'destructive'
              }>
                {job.status}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span>{job.department || 'No department'}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location.city}, {job.location.state}, {job.location.country}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>{job.salary_range || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{job.total_applications || 0} applications</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/jobs/${job.id}/matches`}>
                View Matches
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/jobs/${job.id}`}>
                    Edit Job
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/jobs/${job.id}/applications`}>
                    View Applications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
} 