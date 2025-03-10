import { Briefcase, Users, FileText, TrendingUp, 
  // Clock, Upload, UserPlus, 
  Star,
  // MessageSquare, CheckCircle2,
  // Calendar, Mail, Phone, FileCheck,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from '@supabase/supabase-js';
import { WelcomeDialog } from "@/components/welcome-dialog";
import TransactionHistory from "@/components/smarthrflow/transaction-history";

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// interface DashboardStats {
//   metrics: {
//     activeJobs: number;
//     totalCandidates: number;
//     averageMatchRate: number;
//     totalViews: number;
//   };
//   recentJobs: {
//     id: string;
//     title: string;
//     candidateCount: number;
//     createdAt: string;
//   }[];
//   recentActivities: {
//     id: string;
//     type: string;
//     description: string;
//     createdAt: string;
//     metadata: {
//       jobTitle?: string;
//       candidateName?: string;
//       [key: string]: any;
//     };
//   }[];
//   topJobs: {
//     id: string;
//     title: string;
//     matchRate: number;
//     candidateCount: number;
//   }[];
// }

// Add activity type icons mapping
// const activityIcons: Record<string, React.ComponentType<any>> = {
//   resume_uploaded: Upload,
//   candidate_added: UserPlus,
//   interview_scheduled: Calendar,
//   feedback_added: MessageSquare,
//   status_updated: CheckCircle2,
//   candidate_shortlisted: Star,
//   email_sent: Mail,
//   call_scheduled: Phone,
//   document_reviewed: FileCheck,
//   default: FileText
// };

async function getJobStats(userId: string) {
  try {
    // Get user's company_id first
    const { data: user } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', userId)
      .single();

    if (!user?.company_id) return null;

    const { data: jobs } = await supabase
      .from('jobs')
      .select('id')
      .eq('company_id', user.company_id)
      .eq('status', 'active');

    const activeJobs = jobs?.length || 0;
    // Get total candidates and their match scores
    const { data: resumes } = await supabase
    .from('resumes')
    .select(`
      id,
      overall_score
    `)
    .in('job_id', jobs?.map(job => job.id) || []);

    // Calculate total candidates, average match rate and total views
    let totalCandidates = 0;
    let totalScore = 0;
    const totalViews = 0;

    resumes?.forEach(resume => {
      totalCandidates++;
      totalScore += resume.overall_score || 0;
      // totalViews += resume.view_count || 0
    });

    const averageMatchRate = totalCandidates > 0 
      ? Math.round((totalScore / (totalCandidates * 10)) * 100) 
      : 0;

    // // Get recent jobs with candidate count using join
    // const { data: recentJobs } = await supabase
    //   .from('jobs')
    //   .select(`
    //     id,
    //     title,
    //     created_at,
    //     resumes(count),
    //   `)
    //   .eq('company_id', user.company_id)
    //   .order('created_at', { ascending: false })
    //   .limit(5);
    console.log({ jobs })
    const { data: jobMatches } = await supabase
      .from('job_resume_matches')
      .select('status, job_id, job:job_id(title)')
      .in('job_id', jobs?.map(job => job.id) || []) as unknown as {
        data: Array<{
          status: string;
          job_id: string;
          job: {
            title: string;
          } | null;
        }> | null;
      }

    console.log({ jobMatches })
    const jobStatusCounts = jobMatches?.reduce((acc, job) => {
      if (!acc[job.job_id]) {
        acc[job.job_id] = {
          title: job.job?.title || '',
          statusCounts: {}
        };
      }
      if (!acc[job.job_id].statusCounts[job.status]) {
        acc[job.job_id].statusCounts[job.status] = 0;
      }
      acc[job.job_id].statusCounts[job.status]++;
      return acc;
    }, {} as Record<string, { title: string; statusCounts: Record<string, number> }>);


    // Get recent activities
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

    // Get top performing jobs
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
        totalCandidates,
        averageMatchRate,
        totalViews,
      },
      // recentJobs: recentJobs?.map(job => ({
      //   id: job.id,
      //   title: job.title,
      //   candidateCount: job.resumes?.length || 0,
      //   createdAt: job.created_at
      // })) || [],
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
      })).filter(job => job.candidateCount > 0) || [],
      jobStatusCounts
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

  const getJobStatusCountsForAll = async (status: string) => {
    return Object.values(stats?.jobStatusCounts || {}).reduce((acc, job) => (acc + job?.statusCounts?.[status] || 0), 0);
  }
  
  if (!stats) {
    return null;
  }

  return (
    <div className="mx-auto space-y-6">
      <WelcomeDialog />
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your recruitment</p>
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

      {/* Main Grid Layout */}
      <div className="grid gap-6">
        {/* Key Metrics Row - Always full width */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
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
              <CardTitle className="text-sm font-medium">Average Match Rate</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.metrics.averageMatchRate}%</div>
              <p className="text-xs text-muted-foreground">Across all candidates</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pending Reviews</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getJobStatusCountsForAll('pending')}</div>
              <p className="text-xs text-muted-foreground">Profile views</p>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Content Grid */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Left Column */}
          <div className="grid gap-6 content-start">
            {/* Job Statuses Card */}
            <Card className="w-full">
              <CardHeader className="flex flex-col gap-1  justify-between">
                <div className="flex gap-2">
                  <CardTitle>Job Statuses</CardTitle>
                  
                </div>
                <p className="text-xs text-muted-foreground">Here is how your job postings are progressing</p>
              </CardHeader>
              <CardContent className="">
                {Object.entries(stats?.jobStatusCounts || {}).length === 0 ? (
                  // Empty state - more compact
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="bg-muted/10 p-3 rounded-full mb-3">
                      <Briefcase className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-medium text-muted-foreground">No active jobs</h3>
                    <p className="text-sm text-muted-foreground/60 mb-3">
                      Start by posting your first job
                    </p>
                    <Link href="/dashboard/jobs/new">
                      <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Post New Job
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex">
                    {Object.entries(stats?.jobStatusCounts || {}).map(([jobId, job]) => {
                      const totalCandidates = (job.statusCounts.pending || 0) + 
                                            (job.statusCounts.accepted || 0) + 
                                            (job.statusCounts.rejected || 0);
                      
                      return (
                        <div 
                          key={jobId} 
                          className="w-full rounded-lg border hover:border-indigo-500 hover:shadow-sm transition-all duration-200 bg-white"
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="space-y-1 flex-1 min-w-0">
                                <h3 className="font-medium truncate pr-4">{job.title}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                  <Users className="h-3.5 w-3.5" />
                                  {totalCandidates} {totalCandidates === 1 ? 'candidate' : 'candidates'}
                                </p>
                              </div>
                              <Link href={`/dashboard/jobs/${jobId}`}>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 shrink-0 hover:bg-indigo-50 hover:text-indigo-600"
                                >
                                  View
                                </Button>
                              </Link>
                            </div>

                            <div className="space-y-3">
                              {/* Progress bar */}
                              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
                                {job.statusCounts.accepted > 0 && (
                                  <div 
                                    className="h-full bg-green-500 transition-all duration-500" 
                                    style={{ width: `${(job.statusCounts.accepted / totalCandidates) * 100}%` }} 
                                  />
                                )}
                                {job.statusCounts.pending > 0 && (
                                  <div 
                                    className="h-full bg-yellow-500 transition-all duration-500" 
                                    style={{ width: `${(job.statusCounts.pending / totalCandidates) * 100}%` }} 
                                  />
                                )}
                                {job.statusCounts.rejected > 0 && (
                                  <div 
                                    className="h-full bg-red-500 transition-all duration-500" 
                                    style={{ width: `${(job.statusCounts.rejected / totalCandidates) * 100}%` }} 
                                  />
                                )}
                              </div>

                              {/* Status counts */}
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="flex items-center gap-1.5">
                                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                  <span className="font-medium">{job.statusCounts.pending || 0}</span>
                                  <span className="text-muted-foreground">Pending</span>
                                </div>
                                
                                <div className="flex items-center gap-1.5">
                                  <div className="h-2 w-2 rounded-full bg-green-500" />
                                  <span className="font-medium">{job.statusCounts.accepted || 0}</span>
                                  <span className="text-muted-foreground">Shortlisted</span>
                                </div>
                                
                                <div className="flex items-center gap-1.5">
                                  <div className="h-2 w-2 rounded-full bg-red-500" />
                                  <span className="font-medium">{job.statusCounts.rejected || 0}</span>
                                  <span className="text-muted-foreground">Rejected</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* New: Recent Activity Card */}
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <p className="text-sm text-muted-foreground">Latest recruitment actions</p>
                </div>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-indigo-500" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(activity.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="grid gap-6 content-start">
            {/* Credit History */}
            <TransactionHistory 
              title="Credit History" 
              description="Track your credit usage and purchases" 
              detailsButton
            />
          </div>
        </div>

      
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