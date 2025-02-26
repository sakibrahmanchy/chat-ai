import { creditService } from '@/lib/services/credits.service';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get company_id from user
    const { data: user } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', userId)
      .single();

    // Check credits before posting job
    const hasCredits = await creditService.hasEnoughCredits(
      user.company_id,
      'post_job'
    );

    if (!hasCredits) {
      return new NextResponse('Insufficient credits', { status: 402 });
    }

    // Create job
    const { data: job, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) throw error;

    // Use credits
    await creditService.useCredits(
      user.company_id,
      'post_job',
      'job',
      job.id
    );

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    return new NextResponse('Error creating job', { status: 500 });
  }
}
