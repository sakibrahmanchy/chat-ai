'use client';

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Job } from "@/app/types/job";
import { Resume } from "@/app/types/resume";
import { Loader2Icon } from 'lucide-react';
import { JobDescription } from "./job-description";
import { ResumeList } from "./resume-list";

interface JobDetailProps {
  jobId: string;
  userId: string;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-background to-white">
      <div className="lg:w-1/2 min-h-[50vh] lg:min-h-screen lg:max-h-screen overflow-y-auto">
        <div className="p-4 pb-20">
          <JobDescription job={job} />
        </div>
      </div>

      <div className="lg:w-1/2 min-h-[50vh] lg:min-h-screen lg:max-h-screen overflow-y-auto border-t lg:border-t-0 lg:border-l bg-white/50">
        <div className="p-4 pb-20">
          <ResumeList resumes={resumes} jobId={jobId} />
        </div>
      </div>
    </div>
  );
} 