import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
});

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  stripePriceId: string;
}

export class StripeService {
  /**
   * Create a Stripe Checkout session for credit purchase
   */
  static async createCheckoutSession(
    priceId: string,
    customerId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          type: 'credit_purchase',
        },
      });

      return { sessionId: session.id };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Create or get a Stripe customer
   */
  static async getOrCreateCustomer(email: string, name: string) {
    try {
      // Search for existing customer
      const customers = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        return customers.data[0];
      }

      // Create new customer if not found
      const customer = await stripe.customers.create({
        email: email,
        name: name,
      });

      return customer;
    } catch (error) {
      console.error('Error in getOrCreateCustomer:', error);
      throw error;
    }
  }

  /**
   * Get customer's payment history
   */
  static async getPaymentHistory(customerId: string) {
    try {
      const payments = await stripe.paymentIntents.list({
        customer: customerId,
        limit: 10,
      });

      return payments.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhookEvent(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log({ session, metadata: session.metadata });
          if (session.metadata?.type === 'credit_purchase') {

            // Update user credits in your database
            // You'll need to implement this based on your database structure
          }
          break;
        }
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log({ paymentIntent });

          const fullPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id, {
            expand: ["invoice.subscription", "invoice.payment_intent", "invoice.lines"],
          });
          console.log({ fullPaymentIntent });
          // Handle successful payment
          break;
        }
        // Add more event handlers as needed
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }
} 