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
import { CreditCard, Loader2, Info, Check } from 'lucide-react';

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
  features: string[];
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
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {packages.find(pkg => pkg.id === selectedPackage)?.name}
                    </h3>
                    <p className="text-sm text-gray-500">One-time purchase</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${packages.find(pkg => pkg.id === selectedPackage)?.price}
                    </div>
                    <div className="text-sm text-gray-500">
                      {packages.find(pkg => pkg.id === selectedPackage)?.credits} credits
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm font-medium text-gray-900 mb-3">What's included:</div>
                  <div className="space-y-2">
                    {packages.find(pkg => pkg.id === selectedPackage)?.features.map((line, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Important Information</p>
                      <ul className="space-y-2">
                        <li>• All purchases are non-refundable</li>
                        <li>• Credits never expire</li>
                        <li>• Purchase additional packages anytime</li>
                      </ul>
                    </div>
                  </div>
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