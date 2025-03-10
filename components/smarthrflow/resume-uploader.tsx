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

// Update the loadingStates array with more engaging messages and colors
const loadingStates: Array<{
  icon: React.ComponentType<{ className?: string }>;
  message: string;
  color: string;
  bgColor: string;
}> = [
  { 
    icon: FileText, 
    message: 'Preparing your resume...', 
    color: 'text-blue-500',
    bgColor: 'bg-blue-50'
  },
  { 
    icon: Brain, 
    message: 'AI is analyzing your experience...', 
    color: 'text-purple-500',
    bgColor: 'bg-purple-50'
  },
  { 
    icon: Sparkles, 
    message: 'Extracting your unique skills...', 
    color: 'text-amber-500',
    bgColor: 'bg-amber-50'
  },
];

const loadingDetails = [
  'This can take upto 20-30 seconds at max.',
  'Identifying key qualifications',
  'Analyzing work experience',
  'Extracting relevant skills',
  'Matching with job requirements'
];

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
  const [progress, setProgress] = useState(0);
  const [loadingStateIndex, setLoadingStateIndex] = useState(0);
  const [detailIndex, setDetailIndex] = useState(0);
  const [availability, setAvailability] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Add this effect to handle loading state rotation
  useEffect(() => {
    if (parsing) {
      // Rotate loading states
      const stateInterval = setInterval(() => {
        setLoadingStateIndex(prev => (prev + 1) % loadingStates.length);
      }, 3000);

      // Rotate detail messages
      const detailInterval = setInterval(() => {
        setDetailIndex(prev => (prev + 1) % loadingDetails.length);
      }, 2000);

      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 1;
        });
      }, 200);

      return () => {
        clearInterval(stateInterval);
        clearInterval(detailInterval);
        clearInterval(progressInterval);
      };
    }
  }, [parsing]);

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
    if (!file || !resumeData) return;

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
    setProgress(0);
    setLoadingStateIndex(0);
    setDetailIndex(0);

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

      toast({
        title: "Success",
        description: "Resume uploaded successfully.",
      });

      // Reset form
      setFile(null);
      setResumeData(null);
      setAvailability('');
      setErrors({});
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Error",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Resume</CardTitle>
        <CardDescription>Upload a resume to parse and edit candidate information. All fields are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="resume" className="required">Upload Resume</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              disabled={parsing || submitting}
              required
            />
            <p className="text-sm text-slate-500">Accepted formats: PDF, DOC, DOCX</p>
          </div>

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
          </div>

          {resumeData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="required">Full Name</Label>
                  <Input
                    id="fullName"
                    value={resumeData.full_name}
                    onChange={(e) => setResumeData(prev => ({ ...prev!, full_name: e.target.value }))}
                    required
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
                  />
                  {errors.total_experience_in_months && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.total_experience_in_months}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary" className="required">Professional Summary</Label>
                <Textarea
                  id="summary"
                  value={resumeData.summary}
                  onChange={(e) => setResumeData(prev => ({ ...prev!, summary: e.target.value }))}
                  required
                  minLength={50}
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
                />
                {errors.skills && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.skills}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Uploading..." : "Submit"}
              </Button>
            </>
          )}

          {parsing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 py-8"
            >
              <motion.div
                className={`mx-auto max-w-md rounded-2xl p-6 shadow-lg transition-colors duration-500 ${loadingStates[loadingStateIndex].bgColor}`}
                animate={{
                  scale: [1, 1.02, 1],
                  transition: { duration: 2, repeat: Infinity }
                }}
              >
                <div className="flex items-center justify-center space-x-4">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1, repeat: Infinity }
                    }}
                    className={`rounded-full p-3 ${loadingStates[loadingStateIndex].bgColor}`}
                  >
                    {(() => {
                      const IconComponent = loadingStates[loadingStateIndex].icon;
                      return (
                        <IconComponent 
                          className={`h-6 w-6 ${loadingStates[loadingStateIndex].color}`}
                        />
                      );
                    })()}
                  </motion.div>
                  <motion.span 
                    className={`text-lg font-medium ${loadingStates[loadingStateIndex].color}`}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {loadingStates[loadingStateIndex].message}
                  </motion.span>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                      <motion.div
                        className="transition-all duration-300 shadow-lg rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500"
                        style={{ width: `${progress}%` }}
                        animate={{
                          background: [
                            'linear-gradient(to right, #3B82F6, #8B5CF6, #F59E0B)',
                            'linear-gradient(to right, #F59E0B, #3B82F6, #8B5CF6)',
                            'linear-gradient(to right, #8B5CF6, #F59E0B, #3B82F6)',
                          ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    </div>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={detailIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center"
                    >
                      <motion.div 
                        className="text-sm text-gray-600 font-medium"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {loadingDetails[detailIndex]}
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>

                  <motion.div 
                    className="flex justify-center space-x-1 pt-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="w-2 h-2 bg-gray-400 rounded-full" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full" />
                  </motion.div>
        </div>
              </motion.div>
            </motion.div>
          )}
        </form>
      </CardContent>
    </Card>
  );
} 