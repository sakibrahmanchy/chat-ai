import { CreditPackage } from '@/app/types/credits';
import { supabase } from '@/lib/supabase/client';

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
    const { data } = await supabase
      .from('credit_packages')
      .select('*')
      .order('credits', { ascending: true });
    
    return data || [];
  }

  async createPackage(packageData: CreditPackage) {
    const { data, error } = await supabase
      .from('credit_packages')
      .insert(packageData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePackage(id: string, packageData: CreditPackage) {
    const { data, error } = await supabase
      .from('credit_packages')
      .update(packageData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTransactionHistory() {
    const { data } = await supabase
      .from('credit_transactions')
      .select(`
        *,
        companies (name),
        users (email)
      `)
      .order('created_at', { ascending: false });
    
    return data || [];
  }
}

export const adminCreditService = AdminCreditService.getInstance(); 