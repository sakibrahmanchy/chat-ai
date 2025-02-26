import { supabase } from '@/lib/supabase/client';

export interface CreditAction {
  id: string;
  action_type: string;
  credits_required: number;
  is_active: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

export class AdminCreditActionService {
  private static instance: AdminCreditActionService;
  
  private constructor() {}

  public static getInstance(): AdminCreditActionService {
    if (!AdminCreditActionService.instance) {
      AdminCreditActionService.instance = new AdminCreditActionService();
    }
    return AdminCreditActionService.instance;
  }

  async getAllActions() {
    const { data: actions } = await supabase
      .from('credit_actions')
      .select('*')
      .order('created_at', { ascending: false });

    return actions || [];
  }

  async createAction(data: {
    action_type: string;
    credits_required: number;
    description: string;
  }) {
    const { data: action, error } = await supabase
      .from('credit_actions')
      .insert({
        ...data,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return action;
  }

  async updateAction(id: string, data: Partial<CreditAction>) {
    const { data: action, error } = await supabase
      .from('credit_actions')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return action;
  }

  async toggleActionStatus(id: string, isActive: boolean) {
    return this.updateAction(id, { is_active: isActive });
  }

  async getActionCost(actionType: string): Promise<number> {
    const { data: action } = await supabase
      .from('credit_actions')
      .select('credits_required')
      .eq('action_type', actionType)
      .eq('is_active', true)
      .single();

    return action?.credits_required || 0;
  }
}

export const adminCreditActionService = AdminCreditActionService.getInstance(); 