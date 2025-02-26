export async function POST(req: Request) {
  try {
    const hasCredits = await creditService.hasEnoughCredits(
      user.company_id,
      'share_job'
    );

    if (!hasCredits) {
      return new NextResponse('Insufficient credits', { status: 402 });
    }

    // Generate share link...

    await creditService.useCredits(
      user.company_id,
      'share_job',
      'job',
      jobId
    );

    return NextResponse.json({ shareLink });
  } catch (error) {
    console.error('Error sharing job:', error);
    return new NextResponse('Error sharing job', { status: 500 });
  }
} 