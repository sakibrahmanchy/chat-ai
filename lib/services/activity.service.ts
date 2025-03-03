import { supabase } from '@/lib/supabase/client';
// import { Sentry } from '@/lib/sentry';

export enum ActivityType {
  // User actions
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_SETTINGS_UPDATED = 'user_settings_updated',
  
  // Job related
  JOB_CREATED = 'job_created',
  JOB_UPDATED = 'job_updated',
  JOB_DELETED = 'job_deleted',
  JOB_STATUS_CHANGED = 'job_status_changed',
  
  // Candidate related
  RESUME_UPLOADED = 'resume_uploaded',
  RESUME_PARSED = 'resume_parsed',
  CANDIDATE_MATCHED = 'candidate_matched',
  CANDIDATE_STATUS_UPDATED = 'candidate_status_updated',
  CANDIDATE_SHORTLISTED = 'candidate_shortlisted',
  
  // Credit related
  CREDITS_ADDED = 'credits_added',
  CREDITS_USED = 'credits_used',
  
  // Error events
  ERROR_OCCURRED = 'error_occurred',
  API_ERROR = 'api_error'
}

export interface ActivityLog {
  id?: string;
  user_id: string;
  company_id: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, string | number | boolean>;
  created_at?: string;
  ip_address?: string;
  user_agent?: string;
}

class ActivityService {
  private static instance: ActivityService;
  
  private constructor() {}

  public static getInstance(): ActivityService {
    if (!ActivityService.instance) {
      ActivityService.instance = new ActivityService();
    }
    return ActivityService.instance;
  }

  /**
   * Log an activity
   */
  async logActivity(activity: Omit<ActivityLog, 'id' | 'created_at'>) {
    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          ...activity,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // For error events, also log to Sentry
      // if (activity.type === ActivityType.ERROR_OCCURRED || activity.type === ActivityType.API_ERROR) {
      //   Sentry.captureEvent({
      //     message: activity.description,
      //     level: "error",
      //     extra: activity.metadata
      //   });
      // }
    } catch (error) {
      console.error('Error logging activity:', error);
      // Log to Sentry if activity logging fails
      // Sentry.captureException(error);
    }
  }

  /**
   * Get activities for a company
   */
  async getCompanyActivities(companyId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Sentry.captureException(error);
      return [];
    }
  }

  /**
   * Get activities for a user
   */
  async getUserActivities(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      // Sentry.captureException(error);
      return [];
    }
  }

  /**
   * Get activities related to a specific entity (job, candidate, etc.)
   */
  async getEntityActivities(entityType: string, entityId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('metadata->entity_type', entityType)
        .eq('metadata->entity_id', entityId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching entity activities:', error);
      // Sentry.captureException(error);
      return [];
    }
  }
}

export const activityService = ActivityService.getInstance(); 