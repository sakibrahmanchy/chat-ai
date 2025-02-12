'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2Icon, UploadIcon } from 'lucide-react';

interface ResumeUploaderProps {
  jobId: string;
}

export function ResumeUploader({ jobId }: ResumeUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resumes', files[0]);

    try {
      const response = await fetch(`/api/jobs/${jobId}/resumes`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Redirect to the job detail page after successful upload
      router.push(`/dashboard/jobs/${jobId}`);
      router.refresh();
    } catch (err) {
      setError('Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Upload Resume</CardTitle>
      </CardHeader>
      <CardContent>
        {isUploading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2Icon className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm text-muted-foreground">Processing resume...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <label htmlFor="resume-upload" className="cursor-pointer">
                <div className="flex flex-col items-center space-y-2 p-8 border-2 border-dashed rounded-lg hover:border-indigo-600 transition-colors">
                  <UploadIcon className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload resume (PDF)</p>
                </div>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 