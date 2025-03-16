'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { FileText, Brain, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from 'zod';
import { Job } from '@/app/types/job';
import { ResumeProcessingAnimation } from './resume-processing-animation';

interface ResumeData {
  full_name: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  personal_emails: string[];
  personal_numbers: string[];
  city: string;
  state: string;
  country: string;
  role: string;
  occupation: string;
  summary: string;
  headline: string;
  total_experience_in_months: number;
  skills: string[];
  skills_with_yoe: {
    name: string;
    yoe: number;
  }[];
  education: {
    school: string;
    degree_name: string;
    field_of_study: string;
    starts_at: {
      year: number;
      month: number;
      day: number;
    };
    ends_at: {
      year: number;
      month: number;
      day: number;
    } | null;
    grade: string | null;
    description: string | null;
    achievements: string[];
  }[];
  experiences: {
    title: string;
    company: string;
    location: string;
    description: string;
    starts_at: {
      year: number;
      month: number;
      day: number;
    };
    ends_at: {
      year: number;
      month: number;
      day: number;
    } | null;
    achievements: string[];
    technologies: string[];
  }[];
  certifications: {
    name: string;
    authority: string;
    url: string | null;
    starts_at: string | null;
    ends_at: string | null;
    license_number: string | null;
  }[];
  languages: string[];
}

// Add availability options
const AVAILABILITY_OPTIONS = [
  { value: '1', label: 'Immediate (1 week)' },
  { value: '2', label: '2 weeks' },
  { value: '4', label: '1 month' },
  { value: '8', label: '2 months' },
  { value: '12', label: '3 months' },
  { value: '24', label: 'More than 3 months' }
];

// Define validation schema
const resumeSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  personal_emails: z.array(z.string().email("Invalid email format")).min(1, "Email is required"),
  personal_numbers: z.array(z.string().regex(/^\+?[\d\s-()]+$/, "Invalid phone number format")).min(1, "Phone number is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  occupation: z.string().min(1, "Current position is required"),
  summary: z.string().min(50, "Professional summary must be at least 50 characters"),
  total_experience_in_months: z.number().min(0, "Experience must be a positive number"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
});

export function ResumeUploader({ jobId }: { jobId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [availability, setAvailability] = useState<string>('');
  const [expectedSalary, setExpectedSalary] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [job, setJob] = useState<Job | null>(null);

  // Add this effect to handle loading state rotation

  useEffect(() => {
    const fetchJob = async () => {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) {
        console.error('Error fetching job:', jobError);
      } else {
        setJob(jobData);
      }
    }

    fetchJob();
  }, [jobId]);

  const validateForm = () => {
    if (!resumeData) return false;

    try {
      resumeSchema.parse(resumeData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      return;
    }

    setFile(file);
    setParsing(true);
    setErrors({});

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch(`/api/jobs/${jobId}/resumes`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to parse resume');

      const data = await response.json();
      setResumeData(data.data);
      setHash(data.id);

      toast({
        title: "Resume parsed successfully",
        description: "Please review and edit the information before submitting.",
      });
    } catch (error) {
      console.error('Error parsing resume:', error);
      toast({
        title: "Error",
        description: "Failed to parse resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit');

    // Check for required file
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a resume file",
        variant: "destructive",
      });
      return;
    }

    // Check for parsed data
    if (!resumeData) {
      toast({
        title: "Error",
        description: "Please wait for resume processing to complete",
        variant: "destructive",
      });
      return;
    }

    // Validate availability
    if (!availability) {
      setErrors(prev => ({ ...prev, availability: "Notice period is required" }));
      return;
    }

    // Validate form data
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('resumes')
        .update({
          parsed_content: resumeData,
          job_id: jobId,
          searchable_skills: resumeData.skills,
          updated_at: new Date().toISOString(),
          availability_weeks: availability,
          location: resumeData.city + ', ' + resumeData.state + ', ' + resumeData.country,
          full_name: resumeData.full_name,
          email: resumeData.personal_emails[0],
          phone: resumeData.personal_numbers[0],
          current_position: resumeData.occupation,
          experience_months: resumeData.total_experience_in_months,
        })
        .eq('hash', hash);

      if (error) throw error;
        console.log('resume uploaded successfully');
      toast({
        title: "Success",
        description: "Resume uploaded successfully.",
      });

      // Reset form
      setFile(null);
      setResumeData(null);
      setAvailability('');
      setErrors({});
      // (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Error",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="p-0 pb-6">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <h1 className="text-xl font-semibold text-indigo-600">Smart Apply</h1>
        </CardTitle>
        <CardDescription className="text-base">
        Easily upload your resume, and we'll extract key details to speed up your job application. Just drag, drop, and apply in seconds!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {parsing && (
          <ResumeProcessingAnimation />
        )}
        {!parsing && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg p-6 border-2 border-dashed border-indigo-500 text-indigo-600">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <FileText className="h-12 w-12" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium ">
                    {file ? 'Resume Selected' : 'Upload Your Resume'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {file 
                      ? `Selected file: ${file.name}`
                      : 'Drag and drop your resume here, or click to browse'}
                  </p>
                </div>
                <div className="flex justify-center">
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    disabled={parsing || submitting}
                    className="opacity-0 absolute h-0 w-0"
                    aria-hidden="true"
                  />
                  <label
                    htmlFor="resume"
                    className="cursor-pointer inline-flex items-center"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-white hover:bg-indigo-200"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('resume')?.click();
                      }}
                    >
                      {file ? 'Change File' : 'Select File'}
                    </Button>
                  </label>
                </div>
                <p className="text-sm text-gray-500 text-center">Accepted formats: PDF, DOC, DOCX</p>
              </div>
            </div>

            {file && (
              <div className="space-y-8">
                <div className="bg-white rounded-lg p-6 border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Application Details</h3>
                  <div className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="availability" className="required">Notice Period</Label>
                      <Select value={availability} onValueChange={setAvailability}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {AVAILABILITY_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.availability && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.availability}
                        </p>
                      )}
                    </div>

                    {job?.should_ask_expected_salary && (
                      <div className="space-y-2">
                        <Label htmlFor="expectedSalary" className="required">Expected Salary (USD per year)</Label>
                        <Input
                          id="expectedSalary"
                          type="number"
                          value={expectedSalary}
                          onChange={(e) => setExpectedSalary(e.target.value)}
                          required
                          className="bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {resumeData && (
                  <div className="bg-white rounded-lg p-6 border space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="required">Full Name</Label>
                        <Input
                          id="fullName"
                          value={resumeData.full_name}
                          onChange={(e) => setResumeData(prev => ({ ...prev!, full_name: e.target.value }))}
                          required
                          className="bg-white"
                        />
                        {errors.full_name && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.full_name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="required">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={resumeData.personal_emails[0]}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev!,
                            personal_emails: [e.target.value]
                          }))}
                          required
                          className="bg-white"
                        />
                        {errors.personal_emails && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.personal_emails}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="required">Phone</Label>
                        <Input
                          id="phone"
                          value={resumeData.personal_numbers[0]}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev!,
                            personal_numbers: [e.target.value]
                          }))}
                          required
                          className="bg-white"
                        />
                        {errors.personal_numbers && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.personal_numbers}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="occupation" className="required">Current Position</Label>
                        <Input
                          id="occupation"
                          value={resumeData.occupation}
                          onChange={(e) => setResumeData(prev => ({ ...prev!, occupation: e.target.value }))}
                          required
                          className="bg-white"
                        />
                        {errors.occupation && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.occupation}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city" className="required">City</Label>
                        <Input
                          id="city"
                          value={resumeData.city}
                          onChange={(e) => setResumeData(prev => ({ ...prev!, city: e.target.value }))}
                          required
                          className="bg-white"
                        />
                        {errors.city && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.city}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state" className="required">State</Label>
                        <Input
                          id="state"
                          value={resumeData.state}
                          onChange={(e) => setResumeData(prev => ({ ...prev!, state: e.target.value }))}
                          required
                          className="bg-white"
                        />
                        {errors.state && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.state}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country" className="required">Country</Label>
                        <Input
                          id="country"
                          value={resumeData.country}
                          onChange={(e) => setResumeData(prev => ({ ...prev!, country: e.target.value }))}
                          required
                          className="bg-white"
                        />
                        {errors.country && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.country}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="experience" className="required">Total Experience (months)</Label>
                        <Input
                          id="experience"
                          type="number"
                          min="0"
                          value={resumeData.total_experience_in_months}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev!,
                            total_experience_in_months: parseInt(e.target.value)
                          }))}
                          required
                          className="bg-white"
                        />
                        {errors.total_experience_in_months && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.total_experience_in_months}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {resumeData && (
                  <div className="bg-white rounded-lg p-6 border space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Professional Information</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="summary" className="required">Professional Summary</Label>
                        <Textarea
                          id="summary"
                          value={resumeData.summary}
                          onChange={(e) => setResumeData(prev => ({ ...prev!, summary: e.target.value }))}
                          required
                          minLength={50}
                          className="bg-white min-h-[120px]"
                        />
                        {errors.summary && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.summary}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="skills" className="required">Skills</Label>
                        <Textarea
                          id="skills"
                          value={resumeData.skills.join(', ')}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev!,
                            skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          }))}
                          required
                          placeholder="Enter skills separated by commas"
                          className="bg-white min-h-[100px]"
                        />
                        {errors.skills && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.skills}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFile(null);
                      setResumeData(null);
                      setAvailability('');
                      setExpectedSalary('');
                    }}
                  >
                    Start Over
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting} 
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
} 