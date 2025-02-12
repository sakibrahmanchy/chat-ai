'use client';
import React, { useState } from 'react';
import { Button } from "../ui/button";
import { JobEditor } from "@/components/job-editor";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";

interface JobFormData {
  title: string;
  company: string;
  location: string;
  type: string; // Full-time, Part-time, Contract, etc.
  experience: string;
  salary: string;
  skills: string[];
  description: string;
  requirements: string;
  benefits: string;
  applicationDeadline: string;
  createdAt: Date;
}

export const JobPostingForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSkill, setCurrentSkill] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const { userId } = useAuth();

  const [job, setJob] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    type: '',
    experience: '',
    salary: '',
    skills: [],
    description: '',
    requirements: '',
    benefits: '',
    applicationDeadline: '',
    createdAt: new Date(),
  });

  const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentSkill.trim()) {
      e.preventDefault();
      if (!job.skills.includes(currentSkill.trim())) {
        setJob({ ...job, skills: [...job.skills, currentSkill.trim()] });
      }
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setJob({
      ...job,
      skills: job.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!userId) {
        throw new Error('Not authenticated');
      }

      // Add document to Firestore under the user's jobs collection
      const docRef = await addDoc(collection(db, 'users', userId, 'jobs'), {
        ...job,
        createdAt: new Date(),
        status: 'active',
        requiredSkills: job.skills,
      });

      toast({
        title: "Success",
        description: "Job posting created successfully",
      });

      router.push(`/dashboard/jobs/${docRef.id}`);
    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        title: "Error",
        description: "Failed to create job posting",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className=" mx-auto">
      <CardHeader>
        <CardTitle>Post a New Job</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Job Title</label>
              <Input
                id="title"
                value={job.title}
                onChange={(e) => setJob({ ...job, title: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="company" className="text-sm font-medium">Company</label>
              <Input
                id="company"
                value={job.company}
                onChange={(e) => setJob({ ...job, company: e.target.value })}
                placeholder="Company name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">Location</label>
              <Input
                id="location"
                value={job.location}
                onChange={(e) => setJob({ ...job, location: e.target.value })}
                placeholder="e.g. New York, NY (Remote)"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">Job Type</label>
              <Input
                id="type"
                value={job.type}
                onChange={(e) => setJob({ ...job, type: e.target.value })}
                placeholder="e.g. Full-time, Part-time"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="experience" className="text-sm font-medium">Experience Level</label>
              <Input
                id="experience"
                value={job.experience}
                onChange={(e) => setJob({ ...job, experience: e.target.value })}
                placeholder="e.g. 3-5 years"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="salary" className="text-sm font-medium">Salary Range</label>
              <Input
                id="salary"
                value={job.salary}
                onChange={(e) => setJob({ ...job, salary: e.target.value })}
                placeholder="e.g. $80,000 - $120,000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="skills" className="text-sm font-medium">Required Skills</label>
            <Input
              id="skills"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyDown={handleSkillAdd}
              placeholder="Type a skill and press Enter"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {job.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Job Description</label>
            <JobEditor
              content={job.description}
              onChange={(value) => setJob({ ...job, description: value })}
              placeholder="Enter detailed job description..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="requirements" className="text-sm font-medium">Requirements</label>
            <JobEditor
              content={job.requirements}
              onChange={(value) => setJob({ ...job, requirements: value })}
              placeholder="Enter job requirements..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="benefits" className="text-sm font-medium">Benefits</label>
            <JobEditor
              content={job.benefits}
              onChange={(value) => setJob({ ...job, benefits: value })}
              placeholder="Enter job benefits..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="deadline" className="text-sm font-medium">Application Deadline</label>
            <Input
              id="deadline"
              type="date"
              value={job.applicationDeadline}
              onChange={(e) => setJob({ ...job, applicationDeadline: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Job
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 