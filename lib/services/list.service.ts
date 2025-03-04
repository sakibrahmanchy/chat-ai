import { supabase } from '@/lib/supabase/client';

export class ListService {
  private static instance: ListService;
  
  private constructor() {}

  public static getInstance(): ListService {
    if (!ListService.instance) {
      ListService.instance = new ListService();
    }
    return ListService.instance;
  }

  async createList(data: {
    name: string;
    description?: string;
    companyId: string;
    jobId?: string;
    createdBy: string;
    isSystem?: boolean;
  }) {
    const { data: list, error } = await supabase
      .from('candidate_lists')
      .insert({
        name: data.name,
        description: data.description,
        company_id: data.companyId,
        created_by: data.createdBy,
        job_id: data.jobId,
        is_system: data.isSystem
      })
      .select()
      .single();

    if (error) throw error;
    return list;
  }

  async getLists(jobId: string) {
    const { data: lists, error } = await supabase
      .from('candidate_lists')
      .select(`
        *,
        items:list_items(count)
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to get the count directly
    return lists.map(list => ({
      ...list,
      items: list.items?.[0]?.count || 0
    }));
  }

  async getListNamesByCandidateIds( candidateIds: number[]) {
    const { data: groupedLists, error } = await supabase
      .rpc('group_resume_lists', { candidate_ids: candidateIds });

    if (error) throw error;

    return groupedLists;
  }

  async addToList(data: {
    listId: string;
    resumeId: string;
    notes?: string;
    addedBy: string;
  }) {
    // Check if resume already exists in list
    const { data: existing } = await supabase
      .from('list_items')
      .select()
      .eq('list_id', data.listId)
      .eq('resume_id', data.resumeId)
      .single();

    if (existing) {
      throw new Error('Resume already exists in this list');
    }

    const { error } = await supabase
      .from('list_items')
      .insert({
        list_id: data.listId,
        resume_id: data.resumeId,
        notes: data.notes,
        added_by: data.addedBy
      });

    if (error) throw error;
  }

  async removeFromList(listId: string, resumeId: string) {
    const { error } = await supabase
      .from('list_items')
      .delete()
      .eq('list_id', listId)
      .eq('resume_id', resumeId);

    if (error) throw error;
  }

  async getListItems(listId: string) {
    const { data: items, error } = await supabase
      .from('list_items')
      .select(`
        id,
        list_id,
        resume_id,
        notes,
        created_at,
        resume:resumes (
          id,
          parsed_content,
          searchable_skills
        ),
        added_by:users (
          id,
          first_name,
          last_name
        )
      `)
      .eq('list_id', listId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return items;
  }

  async getList(id: string) {
    const { data: list, error } = await supabase
      .from('candidate_lists')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return list;
  }

  async getShortlistedAndRejectedLists(jobId: string) {
    const { data: shortlistedCandidates, error: shortlistedError } = await supabase
    .from('job_resume_matches')
    .select('resume_id')
    .eq('job_id', jobId)
    .eq('status', 'approved')

    const { data: rejectedCandidates, error: rejectedError } = await supabase
    .from('job_resume_matches')
    .select('resume_id')
    .eq('job_id', jobId)
    .eq('status', 'rejected')

    return {
      shortlistedCandidates,
      rejectedCandidates
    };
  }

  async addCandidateToJobMatch(resumeId: number, jobId: string, status: string) {

    const { data: existingMatch, error: existingMatchError } = await supabase
    .from('job_resume_matches')
    .select('*')
    .eq('resume_id', resumeId)
    .eq('job_id', jobId)
    .maybeSingle();

    if (existingMatch) {
      const { error } = await supabase
      .from('job_resume_matches')
      .update({ status: status })
      .eq('resume_id', resumeId)
      .eq('job_id', jobId);

      if (error) throw error;
    } else {
      const { error } = await supabase
      .from('job_resume_matches')
      .insert({ resume_id: resumeId, job_id: jobId, status: status });
  
      if (error) throw error;
    }

  }

  async approveCandidate(resumeId: number, jobId: string) {  
    const { data: shortlistedCandidate, error: shortlistedError } = await supabase
      .from('job_resume_matches')
      .select('*')
      .eq('resume_id', resumeId)
      .eq('job_id', jobId)
      .maybeSingle()

    console.log({ shortlistedCandidate, shortlistedError });

    if (shortlistedCandidate) { 
      const { error } = await supabase
      .from('job_resume_matches')
      .update({ status: 'accepted' })
      .eq('resume_id', resumeId)
      .eq('job_id', jobId);

      if (error) throw error;
      return true;
    } else {
      const { error } = await supabase
      .from('job_resume_matches')
      .insert({ resume_id: resumeId, job_id: jobId, status: 'accepted' });
      console.log({ error });
      if (error) throw error;
      return true;
    }
  }

  async rejectCandidate(resumeId: number, jobId: string) {
    const { data: candidate, error: rejectedError } = await supabase
      .from('job_resume_matches')
      .select('*')
      .eq('resume_id', resumeId)
      .eq('job_id', jobId)
      .maybeSingle();

    if (rejectedError) { 
      throw rejectedError;
    }

    if (candidate) { 
      const { error } = await supabase
      .from('job_resume_matches')
      .update({ status: 'rejected' })
      .eq('resume_id', resumeId)
      .eq('job_id', jobId);

      if (error) throw error;
      return true;
    } else {
      const { error } = await supabase
      .from('job_resume_matches')
      .insert({ resume_id: resumeId, job_id: jobId, status: 'rejected' });

      if (error) throw error;
      return true;
    }
  }

  async moveToList(candidateId: string, listName: string, jobId: string, companyId: string) {
    // First get or create the list
    const { data: list } = await supabase
      .from('candidate_lists')
      .select('id')
      .eq('name', listName)
      .eq('job_id', jobId)
      .single();

    if (!list) {
      throw new Error(`List ${listName} not found`);
    }

    // Remove from other system lists if needed
    await supabase
      .from('list_items')
      .delete()
      .eq('resume_id', candidateId)
      .eq('list_id', list.id);

    // Add to new list
    await this.addToList({
      listId: list.id,
      resumeId: candidateId,
      notes: `Moved to ${listName}`,
      userId: '', // Add user ID here
    });
  }
}

export const listService = ListService.getInstance(); 