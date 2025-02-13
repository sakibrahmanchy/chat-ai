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
  // Core job details
  title: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  skills: string[];
  description: string;
  requirements: string;
  benefits: string;
  applicationDeadline: string;
  createdAt: Date;
  
  // Location
  city: string;
  state: string;
  country: string;
  
  // Employment details
  employmentType: string;
  experienceRequired: number;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  
  // Skills and requirements
  responsibilities: string;
  qualifications: string;
  
  // Additional info
  department?: string;
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
    city: '',
    state: '',
    country: '',
    employmentType: '',
    experienceRequired: 0,
    salaryMin: 0,
    salaryMax: 0,
    salaryCurrency: 'USD',
    responsibilities: '',
    qualifications: '',
    department: '',
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

      // Structure job data for new schema while keeping old format
      const jobData = {
        // Keep existing fields
        title: job.title,
        company: job.company,
        location: job.location, // Keep for backward compatibility
        type: job.type,
        experience: job.experience,
        salary: job.salary,
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
        applicationDeadline: job.applicationDeadline,
        
        // Add new structured fields
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',

        // Structured location
        location: {
          city: job.city || job.location.split(',')[0]?.trim(),
          state: job.state,
          country: job.country
        },

        // Structured employment details
        employmentType: job.employmentType || job.type,
        experienceRequired: job.experienceRequired || parseInt(job.experience) || 0,
        salaryRange: {
          min: job.salaryMin || 0,
          max: job.salaryMax || 0,
          currency: job.salaryCurrency || 'USD'
        },

        // Skills and requirements
        requiredSkills: job.skills.map(s => s.toLowerCase()),
        responsibilities: job.responsibilities || job.requirements, // Use requirements if responsibilities not set
        qualifications: job.qualifications || job.requirements,

        // Additional fields
        department: job.department,
        
        // Metrics
        totalApplications: 0,
        totalViews: 0
      };

      // Add document to Firestore under the user's jobs collection
      const docRef = await addDoc(collection(db, 'jobs'), jobData);

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
    <Card className="mx-auto">
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium">City</label>
              <Input
                id="city"
                value={job.city}
                onChange={(e) => setJob({ ...job, city: e.target.value })}
                placeholder="City"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="state" className="text-sm font-medium">State</label>
              <Input
                id="state"
                value={job.state}
                onChange={(e) => setJob({ ...job, state: e.target.value })}
                placeholder="State"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="country" className="text-sm font-medium">Country</label>
              <Input
                id="country"
                value={job.country}
                onChange={(e) => setJob({ ...job, country: e.target.value })}
                placeholder="Country"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="employmentType" className="text-sm font-medium">Employment Type</label>
              <Input
                id="employmentType"
                value={job.employmentType}
                onChange={(e) => setJob({ ...job, employmentType: e.target.value })}
                placeholder="e.g. Full-time, Part-time"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="experienceRequired" className="text-sm font-medium">Years of Experience</label>
              <Input
                id="experienceRequired"
                type="number"
                value={job.experienceRequired}
                onChange={(e) => setJob({ ...job, experienceRequired: Number(e.target.value) })}
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="salaryMin" className="text-sm font-medium">Minimum Salary</label>
              <Input
                id="salaryMin"
                type="number"
                value={job.salaryMin}
                onChange={(e) => setJob({ ...job, salaryMin: Number(e.target.value) })}
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="salaryMax" className="text-sm font-medium">Maximum Salary</label>
              <Input
                id="salaryMax"
                type="number"
                value={job.salaryMax}
                onChange={(e) => setJob({ ...job, salaryMax: Number(e.target.value) })}
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="salaryCurrency" className="text-sm font-medium">Currency</label>
              <Input
                id="salaryCurrency"
                value={job.salaryCurrency}
                onChange={(e) => setJob({ ...job, salaryCurrency: e.target.value })}
                placeholder="USD"
                required
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
            <label htmlFor="responsibilities" className="text-sm font-medium">Responsibilities</label>
            <JobEditor
              content={job.responsibilities}
              onChange={(value) => setJob({ ...job, responsibilities: value })}
              placeholder="Enter job responsibilities..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="qualifications" className="text-sm font-medium">Qualifications</label>
            <JobEditor
              content={job.qualifications}
              onChange={(value) => setJob({ ...job, qualifications: value })}
              placeholder="Enter job qualifications..."
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