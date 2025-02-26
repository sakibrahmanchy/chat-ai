import { pricingService } from '@/lib/services/pricing.service';
import { creditService } from '@/lib/services/credits.service';
import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default async function BillingPage() {
  const packages = await pricingService.getAvailablePackages();
  const addons = await pricingService.getAvailablePackages(true);

  async function handlePurchase(packageId: string) {
    const response = await fetch('/api/credits/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId }),
    });

    const { sessionId } = await response.json();
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId });
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Credit Packages</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold">{pkg.name}</h2>
            <p className="text-3xl font-bold mt-4">${pkg.price}</p>
            <p className="text-gray-600 mt-2">{pkg.credits} Credits</p>
            <Button 
              className="w-full mt-6"
              onClick={() => handlePurchase(pkg.id)}
            >
              Purchase
            </Button>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-12 mb-6">Add-on Packages</h2>
      <div className="grid md:grid-cols-4 gap-4">
        {addons.map((addon) => (
          <div key={addon.id} className="border rounded-lg p-4">
            <h3 className="font-semibold">{addon.name}</h3>
            <p className="text-2xl font-bold mt-2">${addon.price}</p>
            <p className="text-gray-600">{addon.credits} Credits</p>
            <Button 
              variant="outline"
              className="w-full mt-4"
              onClick={() => handlePurchase(addon.id)}
            >
              Add Credits
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 