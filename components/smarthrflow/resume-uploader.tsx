'use client';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";


interface ResumeUploaderProps {
  jobId: string;
}

export function ResumeUploader({ jobId }: ResumeUploaderProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('Uploading files to job:', jobId);
    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('resumes', file);
    });

    try {
      const url = `/api/jobs/${jobId}/resumes`;
      console.log('Making request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Upload successful:', data);
    } catch (error) {
      console.error('Error uploading resumes:', error);
    }
  }, [jobId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Card>
      <CardContent>
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer",
            "hover:border-primary/50 transition-colors",
            isDragActive && "border-primary bg-primary/5"
          )}
        >
          <input {...getInputProps()} />
          <p className="text-sm text-muted-foreground text">
            {isDragActive
              ? 'Drop the resumes here...'
              : 'Drag and drop resumes here, or click to select files'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 