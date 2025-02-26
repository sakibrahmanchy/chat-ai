import { supabase } from '@/lib/supabase/client';

export type CreditPackageType = 'one_time' | 'subscription';

interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  type: CreditPackageType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class AdminCreditService {
  private static instance: AdminCreditService;
  
  private constructor() {}

  public static getInstance(): AdminCreditService {
    if (!AdminCreditService.instance) {
      AdminCreditService.instance = new AdminCreditService();
    }
    return AdminCreditService.instance;
  }

  async getAllPackages() {
    const { data: packages } = await supabase
      .from('credit_packages')
      .select('*')
      .order('created_at', { ascending: false });

    return packages || [];
  }

  async createPackage(data: {
    name: string;
    description: string;
    credits: number;
    price: number;
    type: CreditPackageType;
  }) {
    const { data: pkg, error } = await supabase
      .from('credit_packages')
      .insert({
        ...data,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    console.log(error)
    if (error) throw error;
    return pkg;
  }

  async updatePackage(id: string, data: Partial<CreditPackage>) {
    const { data: pkg, error } = await supabase
      .from('credit_packages')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return pkg;
  }

  async assignCreditsToCompany(companyId: string, credits: number, notes?: string) {
    const { data: transaction, error } = await supabase
      .from('credit_transactions')
      .insert({
        company_id: companyId,
        amount: credits,
        type: 'admin_assignment',
        notes,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update company credits
    const { error: updateError } = await supabase.rpc('add_company_credits', {
      p_company_id: companyId,
      p_amount: credits
    });

    if (updateError) throw updateError;

    return transaction;
  }

  async getCompanyCredits(companyId: string) {
    const { data: company } = await supabase
      .from('companies')
      .select('credits, credit_transactions(*)')
      .eq('id', companyId)
      .single();

    return company;
  }

  async getCreditTransactions(filters?: {
    companyId?: string;
    startDate?: Date;
    endDate?: Date;
    type?: string;
  }) {
    let query = supabase
      .from('credit_transactions')
      .select(`
        *,
        companies (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (filters) {
      if (filters.companyId) {
        query = query.eq('company_id', filters.companyId);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
    }

    const { data: transactions } = await query;
    return transactions || [];
  }
}

export const adminCreditService = AdminCreditService.getInstance(); 