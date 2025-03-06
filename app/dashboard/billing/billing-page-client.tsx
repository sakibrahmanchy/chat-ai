'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PricingSlider } from '@/components/pricing/pricing-slider';
import { CreditCard, Loader2 } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Package {
  id: string;
  name: string;
  price: number;
  credits: number;
  description: string;
  stripe_price_id?: string; // Add this field for Stripe integration
  stripe_price_id_test?: string; 
}

interface BillingPageClientProps {
  packages: Package[];
  currentCredits?: number;
  currentPlan?: string;
}

export function BillingPageClient({ packages, currentCredits = 0, currentPlan }: BillingPageClientProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();
  const handlePurchase = async (packageId: string) => {
    setIsProcessing(true);
    try {
      const selectedPkg = packages.find(pkg => pkg.id === packageId);

      const isProduction = process.env.NODE_ENV === 'production';
      const stripePriceId = isProduction ? selectedPkg?.stripe_price_id : selectedPkg?.stripe_price_id_test;

      if (!stripePriceId) {
        throw new Error('No Stripe price ID found for this package');
      }

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: stripePriceId,
          successUrl: `${window.location.origin}/dashboard/billing?success=true&priceId=${stripePriceId}&packageId=${packageId}`,
          cancelUrl: `${window.location.origin}/dashboard/billing?canceled=true&priceId=${stripePriceId}&packageId=${packageId}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error initiating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setShowDialog(false);
    }
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    setShowDialog(true);
  };

  return (
    <div>
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-base text-gray-600">
          Choose the perfect credit package for your hiring needs. All packages include our full suite of AI-powered recruitment tools.
        </p>
      </div>

      {/* Current Credits Display */}
      {currentCredits !== undefined && (
        <div className="max-w-2xl mx-auto mb-8 p-6 bg-gradient-to-br from-indigo-50 to-white rounded-lg border border-indigo-100">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Current Balance</h2>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-3xl font-bold text-indigo-600">{currentCredits}</span>
              <span className="text-lg text-indigo-600/80">credits</span>
            </div>
            {currentPlan && (
              <p className="mt-2 text-sm text-muted-foreground">
                Current Plan: {currentPlan}
              </p>
            )}
          </div>
        </div>
      )}

      <PricingSlider
        packages={packages}
        selectedPackage={selectedPackage}
        onSelect={handlePackageSelect}
      />

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedPackage && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">
                  {packages.find(pkg => pkg.id === selectedPackage)?.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {packages.find(pkg => pkg.id === selectedPackage)?.description}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    ${packages.find(pkg => pkg.id === selectedPackage)?.price}
                  </span>
                  <span className="text-muted-foreground">
                    for {packages.find(pkg => pkg.id === selectedPackage)?.credits} credits
                  </span>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handlePurchase(selectedPackage!)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Purchase Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 