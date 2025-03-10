import { CompanyCredits, CreditPackage, CreditPurchases, CreditTransaction } from '@/app/types/credits';
import { supabase } from '@/lib/supabase/client';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

export enum CreditAction {
  SUBMIT_RESUME = 'submit_resume',
  MATCH_RESUME = 'match_resume',
  SEND_EMAIL = 'email_candidate',
}

export enum CreditEntity {
  RESUME = 'resume',
  PACKAGE = 'credit_package',
}

export interface CreditsData {
  credits_balance: number;
  credits_used: number;
  credits_remaining: number;
  credits_used_percentage: number;
}

interface CursorPaginationParams {
  cursor?: string | null;
  pageSize: number;
}

interface TransactionsResponse {
  data: CreditTransaction[];
  next_cursor: string | null;
}

export class CreditService {
  private static instance: CreditService;
  
  private constructor() {}

  public static getInstance(): CreditService {
    if (!CreditService.instance) {
      CreditService.instance = new CreditService();
    }
    return CreditService.instance;
  }

  async getCreditPackageByIdentifier(packageIdentifier: string): Promise<CreditPackage> {
    const { data: creditPackage, error }: PostgrestSingleResponse<CreditPackage> = await supabase
      .from('credit_packages')
      .select('*')
      .eq('package_identifier', packageIdentifier)
      .single();

    if (error) throw error;

    return creditPackage;
  }

  async getCreditsRequired(actionType: CreditAction): Promise<number> {
    const { data: action } = await supabase
      .from('credit_actions')
      .select('credits_required')
      .eq('action_type', actionType)
      .eq('is_active', true)
      .single();
    
    return action?.credits_required || 0;
  }

  async hasEnoughCredits(companyId: string, actionType: CreditAction): Promise<boolean> {
    const creditsRequired = await this.getCreditsRequired(actionType);
    
    const creditsData = await this.getCreditsData(companyId);

    return creditsData.credits_remaining >= creditsRequired;
  }

  async useCredits(
    companyId: string, 
    actionType: CreditAction, 
    entityType?: CreditEntity,
    entityId?: string
  ): Promise<boolean> {
    const creditsRequired = await this.getCreditsRequired(actionType);
    // Start transaction
    const { data: company, error: balanceError } = await supabase
      .from('company_credits')
      .select('credits_balance, credits_used')
      .eq('company_id', companyId)
      .single();

    const creditsData = await this.getCreditsData(companyId);

    if (creditsData.credits_remaining < creditsRequired || !company) {
      return false;
    }

    // Update balance and record transaction
    const { error: updateError } = await supabase
      .from('company_credits')
      .update({ 
        credits_balance: creditsData.credits_balance - creditsRequired,
        credits_used: creditsData.credits_used + creditsRequired,
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
    
    if (transactionError) {
      throw transactionError;
    }

    return true;
  }

  // async addCredits(companyId: string, credits: number): Promise<boolean> {
  //   const { error } = await supabase
  //     .from('company_credits')
  //     .update({ 
  //       credits_balance: supabase.raw(`credits_balance + ${credits}`),
  //       last_topped_up: new Date().toISOString()
  //     })
  //     .eq('company_id', companyId);

  //   return !error;
  // }

  async addCreditPackageToCompany(companyId: string, packageId: string, freeTier: boolean = false) {
    const { data: companyCredits }: PostgrestSingleResponse<CompanyCredits> = await supabase.from('company_credits')
    .select('*')
    .eq('company_id', companyId)
    .single();

    const creditsData = await this.getCreditsData(companyId);

    const { error, data: creditPackage } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (error) throw error;

    if (companyCredits && companyCredits.trial_given) {
      if (freeTier || creditPackage.type === 'free_tier') { 
        throw new Error('Trial already given');
      }
    }
      
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
    
    if (companyCredits) {
      await supabase.from('company_credits').update({
        credits_balance: creditsData.credits_remaining + creditPackage.credits,
        last_topped_up: new Date().toISOString(),
        credits_used: 0,
      }).eq('company_id', companyId);
    } else {
      await supabase.from('company_credits').insert({
        company_id: companyId,
        credits_balance: creditsData.credits_remaining + creditPackage.credits,
        last_topped_up: new Date().toISOString(),
        credits_used: 0,
      });
    }


    if (freeTier) {
      await supabase.from('companies').update({
        trial_given: true
      }).eq('id', companyId);
    }

    // Update credit_transactions table
    const { error: transactionError } = await supabase.from('credit_transactions').insert({
      company_id: companyId,
      action_type: 'package_purchase',
      credits_added: creditPackage.credits,
      entity_type: CreditEntity.PACKAGE,
      entity_id: creditPackage.name,
    });

    if (transactionError) throw transactionError;

    return creditPackage;
  }

  async getTransactions(
    companyId: string, 
    pagination: CursorPaginationParams
  ): Promise<TransactionsResponse> {
    let query = supabase
      .from('credit_transactions')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(pagination.pageSize + 1); // fetch one extra to determine if there's more

    // Add cursor condition if provided
    if (pagination.cursor) {
      query = query.lt('created_at', pagination.cursor);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // If we got more items than pageSize, there are more items to load
    const hasMore = data && data.length > pagination.pageSize;
    // Remove the extra item we fetched
    const items = data ? data.slice(0, pagination.pageSize) : [];
    
    // Get the cursor for the next page
    const nextCursor = hasMore && items.length > 0 
      ? items[items.length - 1].created_at 
      : null;

    return {
      data: items,
      next_cursor: nextCursor
    };
  }

  async getCurrentBalance(companyId: string): Promise<number> {
    const creditsData = await this.getCreditsData(companyId);
    return creditsData.credits_remaining;
  }

  async getCreditsBalance(companyId: string): Promise<number> {
    const { data: balance, error } = await supabase
      .from('company_credits')
      .select('credits_balance')
      .eq('company_id', companyId)
      .single();

    if (error) throw error;

    return balance?.credits_balance || 0;
  }

  async getCreditsData(companyId: string): Promise<CreditsData> {
    const { data, error } = await supabase
      .rpc('get_company_credits_data', {
        company_id_param: companyId
      });

    if (error) {  
      throw error;
    }

    return data as CreditsData;
  }
  
}

export const creditService = CreditService.getInstance(); 