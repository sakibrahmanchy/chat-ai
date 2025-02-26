import { supabase } from '@/lib/supabase/client';
import { Job } from '@/app/types/job';

export async function getJobs() {
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(`
      *,
      company:company_id (
        id,
        name,
        logo
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return jobs || [];
}

export async function getJob(id: string) {
  const { data: job, error } = await supabase
    .from('jobs')
    .select(`
      *,
      company:company_id (
        id,
        name,
        logo
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!job) throw new Error('Job not found');

  return {
    ...job,
    requirements: job.requirements || [],
    company: {
      id: job.company?.id || '',
      name: job.company?.name || 'Unknown Company',
      logo: job.company?.logo
    }
  };
}

export async function applyForJob(jobId: string, userId: string, resumeId: string) {
  const { error } = await supabase
    .from('job_applications')
    .insert({
      job_id: jobId,
      user_id: userId,
      resume_id: resumeId,
      status: 'pending',
      applied_at: new Date().toISOString()
    });

  if (error) throw error;
}

export async function getUserApplications(userId: string) {
  const { data: applications, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      job:job_id (
        *,
        company:company_id (
          id,
          name,
          logo
        )
      ),
      resume:resume_id (*)
    `)
    .eq('user_id', userId)
    .order('applied_at', { ascending: false });

  if (error) throw error;
  return applications || [];
}

export async function searchJobs(query: string) {
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(`
      *,
      company:company_id (
        id,
        name,
        logo
      )
    `)
    .eq('status', 'active')
    .textSearch('title', query, {
      type: 'websearch',
      config: 'english'
    })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return jobs || [];
} 