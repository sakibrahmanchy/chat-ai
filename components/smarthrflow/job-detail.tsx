'use client';

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Job } from "@/app/types/job";
import { Resume } from "@/app/types/resume";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface JobDetailProps {
  jobId: string;
  userId: string;
}

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

export function JobDetail({ jobId, userId }: JobDetailProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch job details
    const fetchJob = async () => {
      const jobDoc = await getDoc(doc(db, "users", userId, "jobs", jobId));
      if (jobDoc.exists()) {
        setJob({
          id: jobDoc.id,
          ...jobDoc.data(),
          createdAt: jobDoc.data().createdAt?.toDate(),
        } as Job);
      }
    };

    // Subscribe to resumes
    const resumesQuery = query(
      collection(db, "users", userId, "jobs", jobId, "resumes"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(resumesQuery, (snapshot) => {
      const resumesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Resume[];
      
      setResumes(resumesData);
      setLoading(false);
    });

    fetchJob();
    return () => unsubscribe();
  }, [jobId, userId]);

  if (loading || !job) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{job.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Posted {getRelativeTimeString(job.createdAt)}
              </p>
            </div>
            <Link href={`/dashboard/jobs/${job.id}/upload`}>
              <Button>Upload More Resumes</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{job.description}</p>
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
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Candidates ({resumes.length})</h2>
        {resumes.map((resume) => (
          <Card key={resume.id}>
            <CardContent className="py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{resume.candidateName || resume.fileName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Uploaded {getRelativeTimeString(resume.createdAt)}
                  </p>
                </div>
                <Badge variant={resume.status === 'processed' ? 'success' : 'secondary'}>
                  {resume.status}
                </Badge>
              </div>

              {resume.parsedContent && (
                <div className="mt-4 space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Skills Match</span>
                      <span>{resume.parsedContent.skillMatch}%</span>
                    </div>
                    <Progress value={resume.parsedContent.skillMatch} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Experience Match</span>
                      <span>{resume.parsedContent.experienceMatch}%</span>
                    </div>
                    <Progress value={resume.parsedContent.experienceMatch} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Overall Fit</span>
                      <span>{resume.parsedContent.overallFit}%</span>
                    </div>
                    <Progress value={resume.parsedContent.overallFit} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 