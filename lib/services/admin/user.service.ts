import { User } from '@/app/types/user';
import { supabase } from '@/lib/supabase/client';

export class AdminUserService {
  private static instance: AdminUserService;
  
  private constructor() {}

  public static getInstance(): AdminUserService {
    if (!AdminUserService.instance) {
      AdminUserService.instance = new AdminUserService();
    }
    return AdminUserService.instance;
  }

  async getAllUsers() {
    const { data: users } = await supabase
      .from('users')
      .select(`
        *,
        companies (
          name
        )
      `)
      .order('created_at', { ascending: false });

    return users?.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.role,
      status: user.status,
      company: user.companies?.name || 'N/A',
      lastActive: user.last_active_at,
      createdAt: user.created_at,
      avatarUrl: user.avatar_url,
      companyId: user.company_id
    })) || [];
  }

  async getUserById(id: string) {
    const { data: user } = await supabase
      .from('users')
      .select(`
        *,
        companies (
          name,
          id
        )
      `)
      .eq('id', id)
      .single();

    if (!user) return null;

    return {
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      status: user.status,
      company: user.companies?.name,
      companyId: user.companies?.id,
      lastActive: user.last_active_at,
      createdAt: user.created_at,
      avatarUrl: user.avatar_url,
      phone: user.phone,
      settings: user.settings
    };
  }

  async updateUser(id: string, data: User) {
    const { data: user, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return user;
  }

  async getUserActivity(id: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: activities } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    return activities || [];
  }

  // async resetPassword(userId: string) {
  //   // Implement password reset logic
  //   // This might involve sending a reset email or generating a temporary password
  //   try {
  //     // Example implementation
  //     const tempPassword = Math.random().toString(36).slice(-8);
  //     await this.updateUser(userId, {
  //       password_reset_required: true,
  //       // You might want to hash the temporary password before storing
  //       temporary_password: tempPassword
  //     });

  //     // You might want to send an email with the temporary password
  //     return {
  //       success: true,
  //       message: 'Password reset initiated successfully'
  //     };
  //   } catch (e) {
  //     console.error(e);
  //     return {
  //       success: false,
  //       message: 'Failed to reset password'
  //     };
  //   }
  // }

  // async getUserStats(id: string) {
  //   const { data: stats } = await supabase
  //     .from('users')
  //     .select(`
  //       jobs_created: jobs(count),
  //       active_jobs: jobs(count).eq('status', 'active'),
  //       total_candidates: resumes(count),
  //       total_interviews: interviews(count)
  //     `)
  //     .eq('id', id)
  //     .single();

  //   return {
  //     jobsCreated: stats?.jobs_created[0]?.count || 0,
  //     activeJobs: stats?.active_jobs[0]?.count || 0,
  //     totalCandidates: stats?.total_candidates[0]?.count || 0,
  //     totalInterviews: stats?.total_interviews[0]?.count || 0
  //   };
  // }
}

export const adminUserService = AdminUserService.getInstance(); 