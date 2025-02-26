import { supabase } from '@/lib/supabase/client';

export class AdminStatsService {
  private static instance: AdminStatsService;
  
  private constructor() {}

  public static getInstance(): AdminStatsService {
    if (!AdminStatsService.instance) {
      AdminStatsService.instance = new AdminStatsService();
    }
    return AdminStatsService.instance;
  }

  async getOverviewStats() {
    try {
      // Get total companies
      const { count: totalCompanies } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      // Get active companies (with recent activity)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeCompanies } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .gt('last_active', thirtyDaysAgo.toISOString());

      // Get total revenue
      const { data: purchases } = await supabase
        .from('credit_purchases')
        .select('amount_paid')
        .eq('payment_status', 'completed');

      const totalRevenue = purchases?.reduce((sum, purchase) => sum + (purchase.amount_paid || 0), 0) || 0;

      // Get monthly revenue
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyPurchases } = await supabase
        .from('credit_purchases')
        .select('amount_paid')
        .eq('payment_status', 'completed')
        .gte('created_at', startOfMonth.toISOString());

      const monthlyRevenue = monthlyPurchases?.reduce((sum, purchase) => sum + (purchase.amount_paid || 0), 0) || 0;

      // Get total jobs
      const { count: totalJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

      // Get total resumes processed
      const { count: totalResumes } = await supabase
        .from('resumes')
        .select('*', { count: 'exact', head: true });

      // Get total credits used
      const { data: creditUsage } = await supabase
        .from('credit_transactions')
        .select('credits_used');

      const totalCreditsUsed = creditUsage?.reduce((sum, tx) => sum + (tx.credits_used || 0), 0) || 0;

      return {
        totalCompanies: totalCompanies || 0,
        activeCompanies: activeCompanies || 0,
        totalRevenue,
        monthlyRevenue,
        totalJobs: totalJobs || 0,
        totalResumes: totalResumes || 0,
        totalCreditsUsed,
        // Add more metrics as needed
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        totalCompanies: 0,
        activeCompanies: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalJobs: 0,
        totalResumes: 0,
        totalCreditsUsed: 0
      };
    }
  }

  async getRevenueHistory(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: purchases } = await supabase
      .from('credit_purchases')
      .select('amount_paid, created_at')
      .eq('payment_status', 'completed')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    return purchases || [];
  }

  async getActivityStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: activities } = await supabase
      .from('activities')
      .select('type, created_at')
      .gte('created_at', startDate.toISOString());

    // Group activities by type
    const stats = (activities || []).reduce((acc: Record<string, number>, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    return stats;
  }
}

export const adminStatsService = AdminStatsService.getInstance(); 