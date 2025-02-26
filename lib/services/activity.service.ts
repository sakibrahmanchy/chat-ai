import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type ActivityType = 
  | 'job_created'
  | 'job_updated'
  | 'resume_uploaded'
  | 'candidate_scored'
  | 'candidate_shortlisted'
  | 'candidate_rejected';

interface ActivityData {
  userId: string;
  companyId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  entityType?: string;
  entityId?: string;
}

export class ActivityService {
  async logActivity(data: ActivityData) {
    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          user_id: data.userId,
          company_id: data.companyId,
          type: data.type,
          description: data.description,
          metadata: data.metadata || {},
          entity_type: data.entityType,
          entity_id: data.entityId,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  getActivityDescription(type: ActivityType, metadata: Record<string, any> = {}): string {
    switch (type) {
      case 'job_created':
        return `Posted a new job: ${metadata.jobTitle}`;
      case 'job_updated':
        return `Updated job: ${metadata.jobTitle}`;
      case 'resume_uploaded':
        return `New resume uploaded for ${metadata.jobTitle}`;
      case 'candidate_scored':
        return `Candidate scored ${metadata.score}% match for ${metadata.jobTitle}`;
      case 'candidate_shortlisted':
        return `Shortlisted candidate for ${metadata.jobTitle}`;
      case 'candidate_rejected':
        return `Rejected candidate for ${metadata.jobTitle}`;
      default:
        return 'Unknown activity';
    }
  }
}

export const activityService = new ActivityService(); 