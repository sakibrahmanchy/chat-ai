import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    // Fetch activities
    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    // ... other stats fetching ...

    return NextResponse.json({
      metrics: {
        activeJobs: activeJobsCount,
        totalCandidates: totalCandidatesCount,
        averageMatchRate: averageMatchRate,
        totalViews: totalViews,
        interviewsScheduled: interviewsScheduled,
        hiringRate: hiringRate
      },
      recentActivities: activities || [],
      // ... other data
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return new NextResponse('Error fetching dashboard data', { status: 500 });
  }
} 