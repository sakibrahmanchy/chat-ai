'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Building2, MapPin, Clock, Wrench, } from 'lucide-react';
import { resumeProcessor } from '@/lib/ai/resume-processor';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { ResumeUploader } from '../smarthrflow/resume-uploader';

interface Job {
  id: string;
  title: string;
  company: { id: string; name: string; logo?: string };
  location: string;
  type: string;
  description: string;
  requirements: string[];
  created_at: string;
}

interface PublicJobViewProps {
  job: Job;
  userId?: string;
  disabledApplication?: boolean;
}

export function PublicJobView({ job, userId, disabledApplication }: PublicJobViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resumes', file);

      const response = await fetch(`/api/jobs/${job.id}/resumes`, {
        method: 'POST',
        body: formData,
      });
      console.log(response)
      if (!response.ok) {
        throw new Error('Upload failed');
      }


      // // Create job application record
      // const { error: applicationError } = await supabase
      //   .from('job_applications')
      //   .insert({
      //     job_id: job.id,
      //     user_id: userId,
      //     resume_id: resumeId,
      //     status: 'pending',
      //     applied_at: new Date().toISOString()
      //   });

      // if (applicationError) throw applicationError;

      // // Track job view/application
      // await supabase.from('job_views').insert({
      //   job_id: job.id,
      //   user_id: userId,
      //   action: 'apply',
      //   created_at: new Date().toISOString()
      // });

      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully.",
      });

      // router.push('/jobs/applied');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sanitizeHtml = (html: string) => ({
    __html: html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
  });

  console.log(job)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <div className="space-y-6">
          {/* Job Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{job.company.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{job.location.city}, {job.location.state}, {job.location.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{job.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                {job.required_skills.map((requirement) => (
                  <Badge key={requirement}>{requirement}</Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Tabbed Content */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description">Job Details</TabsTrigger>
              <TabsTrigger value="apply">Apply Now</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-6 mt-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <div 
                  className="text-sm leading-relaxed text-slate-600 prose max-w-none"
                  dangerouslySetInnerHTML={sanitizeHtml(job.description)}
                />
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-semibold mb-3">Requirements</h2>
                <div 
                  className="text-sm leading-relaxed text-slate-600 prose max-w-none"
                  dangerouslySetInnerHTML={sanitizeHtml(job.requirements)}
                />
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-semibold mb-3">Responsibilities</h2>
                <div 
                  className="text-sm leading-relaxed text-slate-600 prose max-w-none"
                  dangerouslySetInnerHTML={sanitizeHtml(job.responsibilities)}
                />
              </div>

              <Separator />
            </TabsContent>

            <TabsContent value="apply" className="mt-6">
              {disabledApplication ? (
                <div className="text-center text-slate-600 p-4">
                  <div className="text-lg font-semibold mb-3">Sorry, this job is not accepting applications right now.</div>
                </div>
              ) : (
                <ResumeUploader jobId={job.id} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
} 