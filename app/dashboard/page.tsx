import { Briefcase, Users, FileText, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { adminDb } from "@/firebase-admin";
import { DashboardMetrics } from "./dashboard-metrics";

async function getJobStats(userId: string) {
  const jobsRef = adminDb.collection("users").doc(userId).collection("jobs");
  const jobsSnapshot = await jobsRef.get();
  
  const jobs = await Promise.all(jobsSnapshot.docs.map(async (doc) => {
    const resumesSnapshot = await doc.ref.collection("resumes").count().get();
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      candidateCount: resumesSnapshot.data().count
    };
  }));

  const activeJobs = jobs.length;
  const totalCandidates = jobs.reduce((acc, job) => acc + job.candidateCount, 0);
  
  // Sort jobs by candidate count for top performing
  const topJobs = [...jobs].sort((a, b) => b.candidateCount - a.candidateCount).slice(0, 3);
  
  // Get recent jobs
  const recentJobs = [...jobs]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3);

  // Get recent activities
  const activitiesSnapshot = await adminDb
    .collection("users")
    .doc(userId)
    .collection("activities")
    .orderBy("createdAt", "desc")
    .limit(4)
    .get();

  const activities = activitiesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate()
  }));

  return {
    metrics: {
      activeJobs,
      totalCandidates,
      interviewsScheduled: 0, // You'll need to implement interview tracking
      hiringRate: 0 // You'll need to implement hire tracking
    },
    recentJobs,
    activities,
    topJobs
  };
}

export default async function Dashboard() {
  const {  userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const stats = await getJobStats(userId);
  
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
          <Link href="/dashboard/upload">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Upload Resume
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

        {/* Recent Activity */}
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(activity.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Jobs */}
        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Performing Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.matchRate ? `${job.matchRate}% match rate` : 'No matches yet'}
                    </p>
                  </div>
                  <div className="text-sm text-primary">{job.candidateCount} candidates</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
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
  
  return date.toLocaleDateString();
}