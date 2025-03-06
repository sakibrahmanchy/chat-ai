'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Resume } from "@/app/types/resume";
import { EmailTemplate, EmailVariables } from "@/app/types/email";
import { emailService } from "@/lib/services/email.service";

interface EmailCandidatesDialogProps {
  candidates: Resume[] | Partial<Resume>[];
  jobTitle: string;
  companyName: string;
  companyId: string;
  jobId: string;
}

const SAMPLE_TEMPLATES: EmailTemplate[] = [
  {
    id: "b3111f96-6154-43dc-9eff-0f6948396444",
    name: "Shortlisted Notification",
    subject: "You've been shortlisted for {{JOB_TITLE}}",
    body: `Dear {{CANDIDATE_NAME}},

We're pleased to inform you that you've been shortlisted for the {{JOB_TITLE}} position at {{COMPANY_NAME}}.

We would like to schedule an interview with you. The details are as follows:
Date: {{INTERVIEW_DATE}}
Time: {{INTERVIEW_TIME}}
Location: {{INTERVIEW_LOCATION}}

Please confirm your availability.

Best regards,
{{COMPANY_NAME}} Team`,
    variables: ["CANDIDATE_NAME", "JOB_TITLE", "COMPANY_NAME", "INTERVIEW_DATE", "INTERVIEW_TIME", "INTERVIEW_LOCATION"]
  },
  {
    id: "rejected",
    name: "Rejection Notice",
    subject: "Update regarding your application for {{JOB_TITLE}}",
    body: `Dear {{CANDIDATE_NAME}},

Thank you for your interest in the {{JOB_TITLE}} position at {{COMPANY_NAME}}.

After careful consideration, we have decided to move forward with other candidates whose qualifications better match our current needs.

We appreciate your time and wish you success in your job search.

Best regards,
{{COMPANY_NAME}} Team`,
    variables: ["CANDIDATE_NAME", "JOB_TITLE", "COMPANY_NAME"]
  }
];

export function EmailCandidatesDialog({ candidates, jobTitle, companyName, companyId, jobId }: EmailCandidatesDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [variables, setVariables] = useState<EmailVariables>({
    INTERVIEW_DATE: "",
    INTERVIEW_TIME: "",
    INTERVIEW_LOCATION: ""
  });
  const [loading, setLoading] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    const template = SAMPLE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const parseTemplate = (text: string, candidateData: Resume | Partial<Resume>) => {
    let parsed = text;
    const allVariables = {
      ...variables,
      CANDIDATE_NAME: candidateData.full_name ?? "",
      CANDIDATE_EMAIL: candidateData.email ?? "",
      JOB_TITLE: jobTitle,
      COMPANY_NAME: companyName,
    };

    Object.entries(allVariables).forEach(([key, value]) => {
      parsed = parsed.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    });

    return parsed;
  };

  const handleSend = async () => {
    try {
      setLoading(true);
      
      for (const candidate of candidates) {
        if (!candidate.id || !candidate.email) continue;
        
        const parsedSubject = parseTemplate(subject, candidate);
        const parsedBody = parseTemplate(body, candidate);
        
        await emailService.sendEmail({
          to: candidate.email,
          subject: parsedSubject,
          body: parsedBody,
          jobId: jobId,
          candidateId: candidate.id,
          companyId: companyId,
          templateId: selectedTemplate?.id
        });
      }

      toast({
        title: "Emails Sent",
        description: `Successfully sent emails to ${candidates.length} candidates`,
      });
      setOpen(false);
    } catch (error) {
      console.error('Error sending emails:', error);
      toast({
        title: "Error",
        description: "Failed to send emails",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Contact Selected
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Email to Candidates</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email Template</Label>
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {SAMPLE_TEMPLATES.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Body</Label>
            <Textarea 
              value={body} 
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[200px]"
            />
          </div>

          {selectedTemplate && (
            <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
              <h4 className="font-medium">Template Variables</h4>
              <div className="grid grid-cols-2 gap-4">
                {selectedTemplate.variables
                  .filter(v => !["CANDIDATE_NAME", "CANDIDATE_EMAIL", "JOB_TITLE", "COMPANY_NAME"].includes(v))
                  .map(variable => (
                    <div key={variable} className="space-y-2">
                      <Label>{variable.replace(/_/g, ' ')}</Label>
                      <Input
                        value={variables[variable] || ''}
                        onChange={(e) => setVariables(prev => ({
                          ...prev,
                          [variable]: e.target.value
                        }))}
                      />
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Emails'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 