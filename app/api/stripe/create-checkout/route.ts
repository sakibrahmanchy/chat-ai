import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { StripeService } from '@/lib/services/stripe.service';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
 
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await currentUser();
    const { priceId, successUrl, cancelUrl } = await req.json();

    if (!user) {
      return new NextResponse('User not found', { status: 401 });
    }

    if (!priceId || !successUrl || !cancelUrl) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const customer = await StripeService.getOrCreateCustomer(
      user.emailAddresses[0].emailAddress,
      user.fullName || ''
    );

    const { sessionId } = await StripeService.createCheckoutSession(
      priceId,
      customer.id,
      successUrl,
      cancelUrl
    );

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 