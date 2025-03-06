import { createClient } from '@supabase/supabase-js';
// import { EmailTemplate, EmailVariables } from '@/app/types/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export class EmailService {
  private static instance: EmailService;
  
  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(data: {
    to: string;
    subject: string;
    body: string;
    jobId: string;
    candidateId: number;
    companyId: string;
    templateId?: string;
  }) {
    try {
      // First log the email to our database
      const { data: emailLog, error: logError } = await supabase
        .from('email_logs')
        .insert({
          to_email: data.to,
          subject: data.subject,
          body: data.body,
          job_id: data.jobId,
          candidate_id: data.candidateId,
          company_id: data.companyId,
          template_id: data.templateId,
          status: 'pending',
          provider: 'sendgrid'
        })
        .select()
        .single();

      if (logError) throw logError;

      // Send email using SendGrid
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: data.to,
          subject: data.subject,
          body: data.body,
        }),
      });

      if (!response.ok) {
        // Update email log with error status
        await supabase
          .from('email_logs')
          .update({ 
            status: 'failed',
            error_message: 'Failed to send email'
          })
          .eq('id', emailLog.id);

        throw new Error('Failed to send email');
      }

      // Update email log with success status
      await supabase
        .from('email_logs')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', emailLog.id);

      return emailLog;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async getEmailTemplates(companyId: string) {
    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return templates;
  }

  async saveTemplate(data: {
    name: string;
    subject: string;
    body: string;
    variables: string[];
    companyId: string;
  }) {
    const { data: template, error } = await supabase
      .from('email_templates')
      .insert({
        name: data.name,
        subject: data.subject,
        body: data.body,
        variables: data.variables,
        company_id: data.companyId
      })
      .select()
      .single();

    if (error) throw error;
    return template;
  }

  async getEmailHistory(filters: {
    jobId?: string;
    candidateId?: string;
    companyId: string;
  }) {
    let query = supabase
      .from('email_logs')
      .select('*')
      .eq('company_id', filters.companyId);

    if (filters.jobId) {
      query = query.eq('job_id', filters.jobId);
    }

    if (filters.candidateId) {
      query = query.eq('candidate_id', filters.candidateId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}

export const emailService = EmailService.getInstance(); 