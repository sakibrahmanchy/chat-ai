import { supabase } from '@/lib/supabase/client';

export class AdminSettingsService {
  private static instance: AdminSettingsService;
  
  private constructor() {}

  public static getInstance(): AdminSettingsService {
    if (!AdminSettingsService.instance) {
      AdminSettingsService.instance = new AdminSettingsService();
    }
    return AdminSettingsService.instance;
  }

  async getSettings() {
    const { data: settings } = await supabase
      .from('system_settings')
      .select('*')
      .single();

    return {
      system: {
        siteName: settings?.site_name || 'SmartHR Flow',
        maintenanceMode: settings?.maintenance_mode || false,
        defaultLanguage: settings?.default_language || 'en',
        allowedFileTypes: settings?.allowed_file_types || ['pdf', 'docx'],
        maxFileSize: settings?.max_file_size || 10, // MB
        defaultCredits: settings?.default_credits || 100,
      },
      api: {
        openaiApiKey: settings?.openai_api_key || '',
        openaiModel: settings?.openai_model || 'gpt-4',
        maxTokens: settings?.max_tokens || 2000,
        temperature: settings?.temperature || 0.7,
        rateLimits: settings?.rate_limits || {
          requests: 100,
          duration: 'minute'
        },
      },
      email: {
        fromEmail: settings?.from_email || 'no-reply@example.com',
        smtpHost: settings?.smtp_host || '',
        smtpPort: settings?.smtp_port || 587,
        smtpUser: settings?.smtp_user || '',
        smtpPass: settings?.smtp_pass || '',
        emailTemplates: settings?.email_templates || {
          welcome: '',
          resetPassword: '',
          jobAlert: '',
        },
      }
    };
  }

  // async updateSettings(section: string, settings: any) {
  //   const { data, error } = await supabase
  //     .from('system_settings')
  //     .update({ [section]: settings })
  //     .eq('id', 1) // Assuming single settings row
  //     .select()
  //     .single();

  //   if (error) throw error;
  //   return data;
  // }

  async updateEmailTemplate(templateName: string, content: string) {
    const { data: settings } = await supabase
      .from('system_settings')
      .select('email_templates')
      .single();

    const updatedTemplates = {
      ...settings?.email_templates,
      [templateName]: content
    };

    const { data, error } = await supabase
      .from('system_settings')
      .update({ email_templates: updatedTemplates })
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // async testEmailSettings(settings: any) {
  //   try {
  //     // Implement email testing logic
  //     return { success: true, message: 'Email settings tested successfully' };
  //   } catch (error) {
  //     return { success: false, message: error.message };
  //   }
  // }
}

export const adminSettingsService = AdminSettingsService.getInstance(); 