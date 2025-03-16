'use client';
import { Separator } from '@/components/ui/separator';
import { Building2, MapPin, Clock, ChevronLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '../ui/badge';
import { ResumeUploader } from '../smarthrflow/resume-uploader';
import { Job } from '@/app/types/job';
import Link from 'next/link';
import { Button } from '../ui/button';
import Image from 'next/image';

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

  const getEmploymentType = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'Full Time';
      case 'part-time':
        return 'Part Time';
      case 'contract':
        return 'Contract';
      case 'temporary':
        return 'Temporary';
      case 'internship':
        return 'Internship';
      default:
        return type;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* <div className="h-16 flex items-center">
            <Link href="/jobs" className="flex items-center text-sm text-gray-500 hover:text-gray-900">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to jobs
            </Link>
          </div> */}
          <div className="h-16 flex items-center">
            {job.company?.logo && (
              <Image src={job.company.logo} alt={job.company.name} width={32} height={32} />
            )}
            <h1 className="text-2xl font-semibold text-gray-900">{job.company?.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {job.location.city}, {job.location.state}, {job.location.country}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Employment Type</h3>
                  <p className="mt-1 text-sm text-gray-900">{getEmploymentType(job.type)}</p>
                </div>
                {job.should_ask_expected_salary && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Salary Range</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {job?.salary_currency || 'USD'} {job?.salary_min?.toLocaleString()} - {job?.salary_max?.toLocaleString()} / year
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Department</h3>
                  <p className="mt-1 text-sm text-gray-900">{job.department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Required Skills</h3>
                  <p className="mt-1 text-sm text-gray-900 flex gap-1">
                  {job.required_skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-gray-100 text-gray-700 text-center">
                      {skill}
                    </Badge>
                  ))}
                  </p>
                </div>
                {!disabledApplication && (
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => document.getElementById('application-tab')?.click()}
                  >
                    Apply Now
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        
              {/* Job Content */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full flex border-b-1">
                  <TabsTrigger
                    value="overview"
                    className="text-sm font-medium data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    id="application-tab"
                    value="application"
                    className="text-sm font-medium border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600"
                  >
                    Application
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-8">
                  <section>
                    <div
                      className="prose prose-gray max-w-none text-gray-600"
                      dangerouslySetInnerHTML={sanitizeHtml(job.description)}
                    />
                  </section>

                  <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
                    <div
                      className="prose prose-gray max-w-none text-gray-600"
                      dangerouslySetInnerHTML={sanitizeHtml(job.requirements)}
                    />
                  </section>

                  <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Responsibilities</h2>
                    <div
                      className="prose prose-gray max-w-none text-gray-600"
                      dangerouslySetInnerHTML={sanitizeHtml(job.responsibilities)}
                    />
                  </section>
                </TabsContent>

                <TabsContent value="application" className="mt-6">
                  {disabledApplication ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        This position is no longer accepting applications
                      </h3>
                      <p className="text-gray-500">
                        Please check our other open positions or check back later.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="rounded-lg p-6">
                        <ResumeUploader jobId={job.id} />
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 