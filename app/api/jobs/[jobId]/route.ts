import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    return new Response("API X Debug is working");
  }

export async function PATCH(
  req: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { scoring_instructions } = await req.json();

    const { error } = await supabase
      .from('jobs')
      .update({ 
        scoring_instructions,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.jobId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Error updating job' },
      { status: 500 }
    );
  }
}
  