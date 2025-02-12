import { ResumeUploader } from '@/components/smarthrflow/resume-uploader';

export default function UploadResumesPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <ResumeUploader jobId={params.id} />
    </div>
  );
} 