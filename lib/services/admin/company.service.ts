import { Company } from '@/app/types/company';
import { supabase } from '@/lib/supabase/client';

export class AdminCompanyService {
  private static instance: AdminCompanyService;
  
  private constructor() {}

  public static getInstance(): AdminCompanyService {
    if (!AdminCompanyService.instance) {
      AdminCompanyService.instance = new AdminCompanyService();
    }
    return AdminCompanyService.instance;
  }

  async getAllCompanies() {
    const { error, data: companies } = await supabase
      .from('companies')
      .select(`
        *,
        users: users(count),
        jobs: jobs(count)
      `)
      .order('created_at', { ascending: false });
    console.log(companies, error);
    return companies?.map(company => ({
      id: company.id,
      name: company.name,
      status: company.status,
    credits: company.credit_balance?.sum || 0,
      usersCount: company.users[0]?.count || 0,
      jobsCount: company.jobs[0]?.count || 0,
      createdAt: company.created_at,
      updatedAt: company.updated_at,
      industry: company.industry,
      size: company.size,
      location: company.location,
      website: company.website,
      contactEmail: company.contact_email,
      contactPhone: company.contact_phone,
      logo: company.logo_url
    })) || [];
  }

  async getCompanyById(id: string) {
    const { data: company } = await supabase
      .from('companies')
      .select(`
        *,
        users: users(count),
        jobs: jobs(count),
        credit_balance: credits(sum)
      `)
      .eq('id', id)
      .single();

    if (!company) return null;

    return {
      id: company.id,
      name: company.name,
      status: company.status,
      credits: company.credit_balance?.sum || 0,
      usersCount: company.users[0]?.count || 0,
      jobsCount: company.jobs[0]?.count || 0,
      createdAt: company.created_at,
      updatedAt: company.updated_at,
      industry: company.industry,
      size: company.size,
      location: company.location,
      website: company.website,
      contactEmail: company.contact_email,
      contactPhone: company.contact_phone,
      logo: company.logo_url
    };
  }

  async updateCompany(id: string, data: Company) {
    const { data: company, error } = await supabase
      .from('companies')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return company;
  }

  // async getCompanyStats(id: string) {
  //   const { data: stats } = await supabase
  //     .from('companies')
  //     .select(`
  //       jobs: jobs(count),
  //       active_jobs: jobs(count).eq('status', 'active'),
  //       users: users(count),
  //       credits: credits(sum),
  //       transactions: credit_transactions(count)
  //     `)
  //     .eq('id', id)
  //     .single();

  //   return {
  //     totalJobs: stats?.jobs[0]?.count || 0,
  //     activeJobs: stats?.active_jobs[0]?.count || 0,
  //     totalUsers: stats?.users[0]?.count || 0,
  //     creditBalance: stats?.credits[0]?.sum || 0,
  //     totalTransactions: stats?.transactions[0]?.count || 0
  //   };
  // }

  async getCompanyActivity(id: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: activities } = await supabase
      .from('company_activities')
      .select('*')
      .eq('company_id', id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    return activities || [];
  }
}

export const adminCompanyService = AdminCompanyService.getInstance(); 