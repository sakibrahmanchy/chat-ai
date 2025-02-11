'use client';

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Job } from "@/app/types/job";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Helper function for relative time
function getRelativeTimeString(date: Date): string {
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diff = date.getTime() - new Date().getTime();
  const diffInDays = Math.round(diff / (1000 * 60 * 60 * 24));
  const diffInHours = Math.round(diff / (1000 * 60 * 60));
  const diffInMinutes = Math.round(diff / (1000 * 60));

  if (Math.abs(diffInDays) >= 1) {
    return formatter.format(diffInDays, 'day');
  } else if (Math.abs(diffInHours) >= 1) {
    return formatter.format(diffInHours, 'hour');
  } else {
    return formatter.format(diffInMinutes, 'minute');
  }
}

interface JobListProps {
  userId: string;
}

export function JobList({ userId }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const jobsQuery = query(
      collection(db, "users", userId, "jobs"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(jobsQuery, (snapshot) => {
      const jobsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Job[];
      
      setJobs(jobsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <Card>
        <CardContent className="text-center py-10">
          <p className="text-muted-foreground">No jobs posted yet</p>
          <Link href="/dashboard/jobs/new" className="mt-4 inline-block">
            <Button>Post Your First Job</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job) => (
        <Card key={job.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{job.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Posted {getRelativeTimeString(job.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                {job.additionalParameters?.location && (
                  <Badge variant="secondary">
                    {job.additionalParameters.location}
                  </Badge>
                )}
                {job.additionalParameters?.yearsOfExperience && (
                  <Badge variant="secondary">
                    {job.additionalParameters.yearsOfExperience}+ years
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm line-clamp-2">{job.description}</p>
            {job.requiredSkills?.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {job.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Link href={`/dashboard/jobs/${job.id}`}>
              <Button variant="outline">View Details</Button>
            </Link>
            <Link href={`/dashboard/jobs/${job.id}/upload`}>
              <Button>Upload Resumes</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 