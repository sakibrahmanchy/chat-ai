export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  credits: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  features: string[];
} 

export interface CreditTransaction {
  id: string;
  company_id: string;
  action_type: string;
  credits_added: number;
  credits_used: number;
  created_at: string;
  description?: string;
  entity_id?: string;
  entity_type?: string;
}

export interface CreditPurchases {
  amount_paid: number;
  credits_purchased: number;
  created_at: string;
  package: CreditPackage;
}

export interface CompanyCredits {
  id: string;
  company_id: string;
  credits_balance: number;
  last_topped_up: string;
  trial_given: boolean;
}