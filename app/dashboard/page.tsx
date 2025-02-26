import { Briefcase, Users, FileText, TrendingUp, Clock, 
  Upload, UserPlus, Star, MessageSquare, CheckCircle2,
  Calendar, Mail, Phone, FileCheck
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from '@supabase/supabase-js';
import { formatDistanceToNow } from 'date-fns';

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DashboardStats {
  metrics: {
    activeJobs: number;
    totalCandidates: number;
    averageMatchRate: number;
    totalViews: number;
    interviewsScheduled: number;
    hiringRate: number;
  };
  recentJobs: {
    id: string;
    title: string;
    candidateCount: number;
    createdAt: string;
  }[];
  recentActivities: {
    id: string;
    type: string;
    description: string;
    createdAt: string;
    metadata: {
      jobTitle?: string;
      candidateName?: string;
      [key: string]: any;
    };
  }[];
  topJobs: {
    id: string;
    title: string;
    matchRate: number;
    candidateCount: number;
  }[];
}

// Add activity type icons mapping
const activityIcons: Record<string, React.ComponentType<any>> = {
  resume_uploaded: Upload,
  candidate_added: UserPlus,
  interview_scheduled: Calendar,
  feedback_added: MessageSquare,
  status_updated: CheckCircle2,
  candidate_shortlisted: Star,
  email_sent: Mail,
  call_scheduled: Phone,
  document_reviewed: FileCheck,
  default: FileText
};

async function getJobStats(userId: string) {
  try {
    // Get user's company_id first
    const { data: user } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', userId)
      .single();

    if (!user?.company_id) return null;

    // Get active jobs count
    const { count: activeJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', user.company_id)
      .eq('status', 'active');

    // Get total candidates count
    const { count: totalCandidates } = await supabase
      .from('jobs')
      .select('resumes(*)', { count: 'exact', head: true })
      .eq('company_id', user.company_id);

    // Get recent jobs with candidate count using join
    const { data: recentJobs } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        created_at,
        resumes(count)
      `)
      .eq('company_id', user.company_id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent activities with proper ordering and limit
    const { data: recentActivities } = await supabase
      .from('activities')
      .select(`
        id,
        type,
        description,
        created_at,
        metadata
      `)
      .eq('company_id', user.company_id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get top performing jobs with proper joins and scoring
    const { data: topJobs } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        status,
        resumes (
          id,
          overall_score
        )
      `)
      .eq('company_id', user.company_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      metrics: {
        activeJobs: activeJobs || 0,
        totalCandidates: totalCandidates || 0,
        averageMatchRate: 0,
        totalViews: 0,
        interviewsScheduled: 0,
        hiringRate: 0
      },
      recentJobs: recentJobs?.map(job => ({
        id: job.id,
        title: job.title,
        candidateCount: job.resumes?.length || 0,
        createdAt: job.created_at
      })) || [],
      recentActivities: recentActivities?.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        createdAt: activity.created_at,
        metadata: activity.metadata || {}
      })) || [],
      topJobs: topJobs?.map(job => ({
        id: job.id,
        title: job.title,
        matchRate: Math.round(
          (job.resumes?.reduce((acc, r) => acc + (r.overall_score || 0), 0) || 0) / 
          (job.resumes?.length || 1)
        ),
        candidateCount: job.resumes?.length || 0
      })).filter(job => job.candidateCount > 0) || []
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
}

export default async function Dashboard() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const stats = await getJobStats(userId);
  
  if (!stats) {
    redirect("/onboarding");
  }

  return (
    <div className="mx-auto space-y-8">
      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-muted-foreground">Here's what's happening with your recruitment</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/jobs/new">
            <Button>
              <Briefcase className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </Link>
          <Link href="/dashboard/jobs">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              View Jobs
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.metrics.activeJobs}</div>
            <p className="text-xs text-muted-foreground">Total active jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.metrics.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">Across all jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.metrics.interviewsScheduled}</div>
            <p className="text-xs text-muted-foreground">Upcoming interviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hiring Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.metrics.hiringRate}%</div>
            <p className="text-xs text-muted-foreground">Average hiring rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Recent Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentJobs.map((job) => (
                <Link 
                  key={job.id} 
                  href={`/dashboard/jobs/${job.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div>
                      <h3 className="font-medium">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {job.candidateCount} candidates • Posted {formatDate(job.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card className="col-span-full lg:col-span-2 h-[400px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Latest updates from your recruitment process</p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0">
              View All
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-2">
              {stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity) => {
                  const IconComponent = activityIcons[activity.type] || activityIcons.default;
                  return (
                    <div 
                      key={activity.id} 
                      className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-600 line-clamp-2">{activity.description}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {activity.metadata?.jobTitle && (
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              {activity.metadata.jobTitle}
                            </span>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <FileText className="h-8 w-8 mb-2 text-slate-300" />
                  <p>No recent activity</p>
                  <p className="text-xs text-slate-400 mt-1">Activities will appear here as you use the system</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Jobs Card */}
        <Card className="col-span-full lg:col-span-1 h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle>Top Performing Jobs</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-2">
              {stats.topJobs.length > 0 ? (
                stats.topJobs.map((job) => (
                  <Link 
                    key={job.id} 
                    href={`/dashboard/jobs/${job.id}`}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{job.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Match rate: {job.matchRate}%
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">
                        {job.candidateCount} {job.candidateCount === 1 ? 'candidate' : 'candidates'}
                      </span>
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No active jobs with candidates</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatDate(date: string) {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minutes ago`;
    }
    return `${hours} hours ago`;
  }
  
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  
  return d.toLocaleDateString();
}