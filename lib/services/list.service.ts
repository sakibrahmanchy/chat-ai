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
    createdBy: string;
  }) {
    const { data: list, error } = await supabase
      .from('candidate_lists')
      .insert({
        name: data.name,
        description: data.description,
        company_id: data.companyId,
        created_by: data.createdBy
      })
      .select()
      .single();

    if (error) throw error;
    return list;
  }

  async getLists(companyId: string) {
    const { data: lists, error } = await supabase
      .from('candidate_lists')
      .select(`
        *,
        items:list_items(count)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to get the count directly
    return lists.map(list => ({
      ...list,
      items: list.items?.[0]?.count || 0
    }));
  }

  async addToList(data: {
    listId: string;
    resumeId: string;
    notes?: string;
    addedBy: string;
  }) {
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
          name
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
}

export const listService = ListService.getInstance(); 