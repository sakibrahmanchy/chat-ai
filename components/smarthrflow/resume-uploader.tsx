'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, FileText, Brain, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';


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

export function ResumeUploader({ jobId }: { jobId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadingStateIndex, setLoadingStateIndex] = useState(0);
  const [detailIndex, setDetailIndex] = useState(0);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);
    setParsing(true);


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
          updated_at: new Date().toISOString()
        })
        .eq('hash', hash);

      if (error) throw new Error('Failed to upload resume');

      toast({
        title: "Success",
        description: "Resume uploaded successfully.",
      });

      // Reset form
      setFile(null);
      setResumeData(null);
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
        <CardDescription>Upload a resume to parse and edit candidate information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="resume">Upload Resume</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              disabled={parsing || submitting}
            />
            <p className="text-sm text-slate-500">Accepted formats: PDF, DOC, DOCX</p>
          </div>

          {/* {submitting && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Upl resume...</span>
            </div>
          )} */}

          {resumeData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={resumeData.full_name}
                    onChange={(e) => setResumeData(prev => ({ ...prev!, full_name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={resumeData.personal_emails[0]}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev!,
                      personal_emails: [e.target.value]
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={resumeData.personal_numbers[0]}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev!,
                      personal_numbers: [e.target.value]
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Current Position</Label>
                  <Input
                    id="occupation"
                    value={resumeData.occupation}
                    onChange={(e) => setResumeData(prev => ({ ...prev!, occupation: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={resumeData.city}
                    onChange={(e) => setResumeData(prev => ({ ...prev!, city: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={resumeData.state}
                    onChange={(e) => setResumeData(prev => ({ ...prev!, state: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={resumeData.country}
                    onChange={(e) => setResumeData(prev => ({ ...prev!, country: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Total Experience (months)</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={resumeData.total_experience_in_months}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev!,
                      total_experience_in_months: parseInt(e.target.value)
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  value={resumeData.summary}
                  onChange={(e) => setResumeData(prev => ({ ...prev!, summary: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  value={resumeData.skills.join(', ')}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev!,
                    skills: e.target.value.split(',').map(s => s.trim())
                  }))}
                />
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