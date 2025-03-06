'use client';
import { Separator } from '@/components/ui/separator';
import { Building2, MapPin, Clock, Wrench, } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { ResumeUploader } from '../smarthrflow/resume-uploader';
import { Job } from '@/app/types/job';


interface PublicJobViewProps {
  job: Job;
  userId?: string;
  disabledApplication?: boolean;
}

export function PublicJobView({ job, disabledApplication }: PublicJobViewProps) {
  const sanitizeHtml = (html: string) => ({
    __html: html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
  });

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
                <span>{job.company?.name}</span>
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