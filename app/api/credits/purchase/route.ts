import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { pricingService } from '@/lib/services/pricing.service';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { packageId } = await req.json();

    if (!packageId || !userId) {
      return new NextResponse('Invalid request', { status: 400 });
    }

    // Get user's company
    const { data: user } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', userId)
      .single();
    
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const session = await pricingService.createCheckoutSession(
      user.company_id,
      packageId,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/success`,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/cancel`
    );

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new NextResponse('Error processing purchase', { status: 500 });
  }
}