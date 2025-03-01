import { supabase } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';

export class CreditService {
  private static instance: CreditService;
  
  private constructor() {}

  public static getInstance(): CreditService {
    if (!CreditService.instance) {
      CreditService.instance = new CreditService();
    }
    return CreditService.instance;
  }

  async getCreditsRequired(actionType: string): Promise<number> {
    const { data: action } = await supabase
      .from('credit_actions')
      .select('credits_required')
      .eq('action_type', actionType)
      .eq('is_active', true)
      .single();
    
    return action?.credits_required || 0;
  }

  async hasEnoughCredits(companyId: string, actionType: string): Promise<boolean> {
    const creditsRequired = await this.getCreditsRequired(actionType);
    const { data: balance } = await supabase
      .from('company_credits')
      .select('credits_balance')
      .eq('company_id', companyId)
      .single();

    return (balance?.credits_balance || 0) >= creditsRequired;
  }

  async useCredits(
    companyId: string, 
    actionType: string, 
    entityType?: string,
    entityId?: string
  ): Promise<boolean> {
    const creditsRequired = await this.getCreditsRequired(actionType);
    
    // Start transaction
    const { data: company, error: balanceError } = await supabase
      .from('company_credits')
      .select('credits_balance, credits_used')
      .eq('company_id', companyId)
      .single();

    if (balanceError || (company?.credits_balance || 0) < creditsRequired) {
      return false;
    }

    // Update balance and record transaction
    const { error: updateError } = await supabase
      .from('company_credits')
      .update({ 
        credits_balance: company.credits_balance - creditsRequired,
        credits_used: company.credits_used + creditsRequired,
        updated_at: new Date().toISOString()
      })
      .eq('company_id', companyId);

    if (updateError) return false;

    // Record transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        company_id: companyId,
        action_type: actionType,
        credits_used: creditsRequired,
        entity_type: entityType,
        entity_id: entityId
      });

    return !transactionError;
  }

  async addCredits(companyId: string, credits: number): Promise<boolean> {
    const { error } = await supabase
      .from('company_credits')
      .update({ 
        credits_balance: supabase.raw(`credits_balance + ${credits}`),
        last_topped_up: new Date().toISOString()
      })
      .eq('company_id', companyId);

    return !error;
  }

  async addCreditPackageToCompany(companyId: string, packageId: string) {
    const { error, data: creditPackage } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (error) throw error;
      
    if (!creditPackage) throw new Error('Credit package not found');
    const { error: insertError } = await supabase
      .from('credit_purchases')
      .insert({
        company_id: companyId,
        package_id: packageId,
        amount_paid: Number(creditPackage.price),
        credits_purchased: creditPackage.credits,
        payment_status: 'paid',
        payment_intent_id: null,
      });
      

    if (insertError) throw insertError;
    
    const { error: companyCreditsError, data: companyCredits } = await supabase.from('company_credits')
    .select('*')
    .eq('company_id', companyId)
    .single();

   
    await supabase.from('company_credits').upsert({
      company_id: companyId,
      credits_balance: companyCredits?.credits_balance || 0 + creditPackage.credits,
      last_topped_up: new Date().toISOString()
    }).eq('company_id', companyId);

    // Update credit_transactions table
    const { error: transactionError } = await supabase.from('credit_transactions').insert({
      company_id: companyId,
      action_type: 'package_purchase',
      credits_added: creditPackage.credits,
    });

    if (transactionError) throw transactionError;

    return creditPackage;
  }
}

export const creditService = CreditService.getInstance(); 