export interface Activity {
  id: string;
  type: 'resume_upload' | 'job_posted' | 'interview_scheduled' | 'candidate_hired';
  description: string;
  jobId?: string;
  resumeId?: string;
  createdAt: Date;
} 