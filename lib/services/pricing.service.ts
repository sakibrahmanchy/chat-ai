import { supabase } from '@/lib/supabase/client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export class PricingService {
  private static instance: PricingService;
  
  private constructor() {}

  public static getInstance(): PricingService {
    if (!PricingService.instance) {
      PricingService.instance = new PricingService();
    }
    return PricingService.instance;
  }

  async getAvailablePackages(isAddon: boolean = false): Promise<any[]> {
    const { data: packages } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('is_active', true)
      .eq('is_addon', isAddon)
      .order('credits', { ascending: true });
    
    return packages || [];
  }

  async createCheckoutSession(
    companyId: string,
    packageId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    // Get package details
    const { data: package_ } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (!package_) {
      throw new Error('Package not found');
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: package_.name,
              description: `${package_.credits} Credits`,
            },
            unit_amount: Math.round(package_.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        companyId,
        packageId,
        credits: package_.credits.toString(),
      },
    });

    // Record the pending purchase
    await supabase.from('credit_purchases').insert({
      company_id: companyId,
      package_id: packageId,
      amount_paid: package_.price,
      credits_purchased: package_.credits,
      payment_status: 'pending',
      payment_intent_id: session.payment_intent as string,
    });

    return session;
  }

  async handleSuccessfulPayment(paymentIntentId: string) {
    // Get purchase record
    const { data: purchase } = await supabase
      .from('credit_purchases')
      .select('*')
      .eq('payment_intent_id', paymentIntentId)
      .single();

    if (!purchase) {
      throw new Error('Purchase not found');
    }

    // Update purchase status
    await supabase
      .from('credit_purchases')
      .update({ payment_status: 'completed' })
      .eq('id', purchase.id);

    // Add credits to company balance
    const creditService = (await import('./credits.service')).creditService;
    await creditService.addCredits(purchase.company_id, purchase.credits_purchased);

    return purchase;
  }

  async getPurchaseHistory(companyId: string) {
    const { data: purchases } = await supabase
      .from('credit_purchases')
      .select(`
        *,
        credit_packages (
          name,
          credits
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    return purchases || [];
  }
}

export const pricingService = PricingService.getInstance(); 