// import { supabase } from '@/lib/supabase/client';

// export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
// export type LogService = 'auth' | 'jobs' | 'users' | 'ai' | 'system';
// export type LogType = 'system' | 'user' | 'api' | 'security';

// interface Log {
//   id: string;
//   level: LogLevel;
//   service: LogService;
//   type: LogType;
//   message: string;
//   metadata: any;
//   created_at: string;
//   user_id?: string;
// }

// export class AdminLogService {
//   private static instance: AdminLogService;
  
//   private constructor() {}

//   public static getInstance(): AdminLogService {
//     if (!AdminLogService.instance) {
//       AdminLogService.instance = new AdminLogService();
//     }
//     return AdminLogService.instance;
//   }

//   async getSystemLogs(filters?: {
//     level?: LogLevel;
//     service?: LogService;
//     type?: LogType;
//     startDate?: Date;
//     endDate?: Date;
//     search?: string;
//   }) {
//     let query = supabase
//       .from('system_logs')
//       .select('*')
//       .order('created_at', { ascending: false });

//     if (filters) {
//       if (filters.level && filters.level !== 'all') {
//         query = query.eq('level', filters.level);
//       }
//       if (filters.service && filters.service !== 'all') {
//         query = query.eq('service', filters.service);
//       }
//       if (filters.type && filters.type !== 'all') {
//         query = query.eq('type', filters.type);
//       }
//       if (filters.startDate) {
//         query = query.gte('created_at', filters.startDate.toISOString());
//       }
//       if (filters.endDate) {
//         query = query.lte('created_at', filters.endDate.toISOString());
//       }
//       if (filters.search) {
//         query = query.ilike('message', `%${filters.search}%`);
//       }
//     }

//     const { data: logs } = await query;
//     return logs || [];
//   }

//   async createLog(data: {
//     level: LogLevel;
//     service: LogService;
//     type: LogType;
//     message: string;
//     metadata?: any;
//     user_id?: string;
//   }) {
//     const { data: log, error } = await supabase
//       .from('system_logs')
//       .insert({
//         ...data,
//         created_at: new Date().toISOString()
//       })
//       .select()
//       .single();

//     if (error) throw error;
//     return log;
//   }

//   async getLogById(id: string) {
//     const { data: log } = await supabase
//       .from('system_logs')
//       .select('*')
//       .eq('id', id)
//       .single();

//     return log;
//   }

//   async deleteLog(id: string) {
//     const { error } = await supabase
//       .from('system_logs')
//       .delete()
//       .eq('id', id);

//     if (error) throw error;
//   }

//   async clearLogs(olderThan?: Date) {
//     let query = supabase
//       .from('system_logs')
//       .delete();

//     if (olderThan) {
//       query = query.lte('created_at', olderThan.toISOString());
//     }

//     const { error } = await query;
//     if (error) throw error;
//   }

//   async getLogStats() {
//     const { data: stats } = await supabase
//       .from('system_logs')
//       .select('level, count(*)')
//       .group('level');

//     return stats || [];
//   }
// }

// export const adminLogService = AdminLogService.getInstance(); 