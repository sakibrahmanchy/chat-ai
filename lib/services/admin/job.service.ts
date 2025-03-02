import { supabase } from '@/lib/supabase/client';

// These are the exact values allowed by the database constraint
export type JobStatus = 'active' | 'closed' | 'draft';

export class AdminJobService {
  private static instance: AdminJobService;
  
  private constructor() {}

  public static getInstance(): AdminJobService {
    if (!AdminJobService.instance) {
      AdminJobService.instance = new AdminJobService();
    }
    return AdminJobService.instance;
  }

  async getAllJobs() {
    const { data: jobs } = await supabase
      .from('jobs')
      .select(`
        *,
        companies (
          name
        ),
        resumes: resumes(count)
      `)
      .order('created_at', { ascending: false });

    return jobs?.map(job => ({
      id: job.id,
      title: job.title,
      company: job.companies?.name || 'N/A',
      status: job.status,
      type: job.type,
      location: job.location,
      salary: {
        min: job.salary_min,
        max: job.salary_max,
        currency: job.salary_currency
      },
      candidates: job.resumes[0]?.count || 0,
      views: 0,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      description: job.description,
      requirements: job.requirements,
      companyId: job.company_id
    })) || [];
  }

  async getJobById(id: string) {
    const { data: job } = await supabase
      .from('jobs')
      .select(`
        *,
        companies (
          name,
          id
        ),
        resumes: resumes(count),
      `)
      .eq('id', id)
      .single();

    if (!job) return null;

    return {
      id: job.id,
      title: job.title,
      company: job.companies?.name,
      companyId: job.companies?.id,
      status: job.status,
      type: job.type,
      location: job.location,
      salary: {
        min: job.salary_min,
        max: job.salary_max,
        currency: job.salary_currency
      },
      candidates: job.resumes[0]?.count || 0,
      views: job.views[0]?.count || 0,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      description: job.description,
      requirements: job.requirements
    };
  }

  async updateJob(id: string, data: Job) {
    // Map 'paused' to 'draft' since paused isn't a valid database status
    if (data.status === 'paused') {
      data.status = 'draft';
    }

    // Ensure status is one of the allowed values
    if (data.status && !['active', 'closed', 'draft'].includes(data.status)) {
      data.status = 'draft';
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    console.log('Update error:', error);
    if (error) throw error;
    return job;
  }

  async getJobStats(id: string) {
    const { data: stats } = await supabase
      .from('jobs')
      .select(`
        resumes: job_resumes(count),
        qualified_resumes: job_resumes(count).gte('match_score', 70),
        views: job_views(count),
        interviews: job_interviews(count)
      `)
      .eq('id', id)
      .single();

    return {
      totalCandidates: stats?.resumes[0]?.count || 0,
      qualifiedCandidates: stats?.qualified_resumes[0]?.count || 0,
      totalViews: stats?.views[0]?.count || 0,
      totalInterviews: stats?.interviews[0]?.count || 0
    };
  }

  async getJobActivity(id: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: activities } = await supabase
      .from('job_activities')
      .select('*')
      .eq('job_id', id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    return activities || [];
  }
}

export const adminJobService = AdminJobService.getInstance(); 