import { ResumeUploader } from '@/components/smarthrflow/resume-uploader';

export default function UploadResumesPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-10">
      <ResumeUploader jobId={params.id} />
    </div>
  );
} 