'use client';

import { Job } from "@/app/types/job";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { 
  Building2, 
  MapPin, 
  Calendar,
  Upload,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storage, db } from "@/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import DOMPurify from 'dompurify';

interface PublicJobViewProps {
  job: Job;
}

export function PublicJobView({ job }: PublicJobViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "Error",
        description: "Please upload your resume",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Upload resume
      const storageRef = ref(storage, `resumes/${job.id}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      // Add to applications collection
      await addDoc(collection(db, 'resumes'), {
        jobId: job.id,
        status: 'pending',
        downloadUrl,
        candidateInfo: formData,
        fileName: file.name,
        createdAt: new Date(),
      });

      toast({
        title: "Success",
        description: "Your application has been submitted successfully",
      });

      // Reset form
      setFile(null);
      setFormData({ name: '', email: '', phone: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a helper function to format location
  const formatLocation = (location: any) => {
    if (typeof location === 'string') return location;
    
    if (typeof location === 'object') {
      const { city, state, country } = location;
      return [city, state, country].filter(Boolean).join(', ');
    }
    
    return 'Location not specified';
  };

  // Add sanitizer function
  const sanitizeHtml = (html: string) => {
    return {
      __html: DOMPurify.sanitize(html)
    };
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="p-6">
        <div className="space-y-6">
          {/* Job Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{job.title}</h1>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-600">
                Active
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{formatLocation(job.location)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{job.type}</span>
              </div>
            </div>
          </div>

          {/* Updated Job Details section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">About the Role</h3>
              <div 
                className="text-sm leading-relaxed text-slate-600 prose max-w-none"
                dangerouslySetInnerHTML={sanitizeHtml(job.description || '')}
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Requirements</h3>
              <div 
                className="text-sm leading-relaxed text-slate-600 prose max-w-none"
                dangerouslySetInnerHTML={sanitizeHtml(job.requirements || '')}
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="secondary"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {job.benefits && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">Benefits</h3>
                  <div 
                    className="text-sm leading-relaxed text-slate-600 prose max-w-none"
                    dangerouslySetInnerHTML={sanitizeHtml(job.benefits)}
                  />
                </div>
              </>
            )}
          </div>

          {/* Application Form */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Apply for this position</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input 
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="resume"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label 
                  htmlFor="resume" 
                  className="cursor-pointer block"
                >
                  <Upload className="h-8 w-8 mx-auto mb-4 text-slate-400" />
                  <div className="text-sm font-medium mb-1">
                    {file ? file.name : "Upload your resume"}
                  </div>
                  <div className="text-xs text-slate-500">
                    PDF, DOC, DOCX (Max 10MB)
                  </div>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
} 