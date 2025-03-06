'use client';

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Eye, MoreVertical, Pause, Play, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminJobService } from "@/lib/services/admin/job.service";
import { toast } from "@/hooks/use-toast";

type JobStatus = 'active' | 'closed' | 'draft';
type DisplayStatus = 'active' | 'paused' | 'closed' | 'draft';

interface Location {
  city?: string;
  state?: string;
  country?: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  type: string;
  location: Location | string;
  candidates: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  department?: string;
}

interface JobListProps {
  jobs: Job[];
}

export function JobList({ jobs }: JobListProps) {
  const [jobList, setJobList] = useState<Job[]>(jobs);

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisplayStatus = (status: JobStatus): DisplayStatus => {
    if (status === 'draft') return 'paused';
    return status as DisplayStatus;
  };

  const formatLocation = (location: Location | string) => {
    if (typeof location === 'string') {
      return location;
    }
    
    const { city, state, country } = location;
    return [city, state, country]
      .filter(Boolean)
      .join(', ');
  };

  const handleStatusChange = async (id: string, newStatus: DisplayStatus) => {
    try {
      // Map display status to database status
      const dbStatus: JobStatus = newStatus === 'paused' ? 'draft' : newStatus as JobStatus;
      
      await adminJobService.updateJob(id, { status: dbStatus });
      setJobList(prev =>
        prev.map(job =>
          job.id === id ? { ...job, status: dbStatus } : job
        )
      );
      toast({
        title: "Job updated",
        description: `Job status has been changed to ${newStatus}.`,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to update job status.",
        variant: "destructive",
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job Title</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Candidates</TableHead>
          <TableHead>Views</TableHead>
          <TableHead>Posted</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobList.map((job) => (
          <TableRow key={job.id}>
            <TableCell className="font-medium">{job.title}</TableCell>
            <TableCell>{job.company}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(job.status)}>
                {getDisplayStatus(job.status).charAt(0).toUpperCase() + getDisplayStatus(job.status).slice(1)}
              </Badge>
            </TableCell>
            <TableCell>{job.type}</TableCell>
            <TableCell>{formatLocation(job.location)}</TableCell>
            <TableCell>{job.candidates}</TableCell>
            <TableCell>{job.views}</TableCell>
            <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Job
                  </DropdownMenuItem>
                  {getDisplayStatus(job.status) === 'active' ? (
                    <DropdownMenuItem onClick={() => handleStatusChange(job.id, 'paused')}>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause Job
                    </DropdownMenuItem>
                  ) : getDisplayStatus(job.status) === 'paused' ? (
                    <DropdownMenuItem onClick={() => handleStatusChange(job.id, 'active')}>
                      <Play className="mr-2 h-4 w-4" />
                      Activate Job
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => handleStatusChange(job.id, 'closed')}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Close Job
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 