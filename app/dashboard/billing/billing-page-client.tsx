'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { pricingService } from '@/lib/services/pricing.service';
import { PricingCard } from '@/components/pricing/pricing-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PricingSlider } from '@/components/pricing/pricing-slider';

interface Package {
  id: string;
  name: string;
  price: number;
  credits: number;
  description?: string;
}

interface BillingPageClientProps {
  packages: Package[];
}

export function BillingPageClient({ packages }: BillingPageClientProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  async function handleRequest(packageId: string) {
    setIsSubmitting(true);
    try {
      await pricingService.requestCredits({
        companyId: user?.publicMetadata?.companyId as string,
        userId: user?.id as string,
        packageId,
        message
      });

      toast({
        title: "Request Submitted",
        description: "We'll contact you soon about your credit request.",
      });
      
      setSelectedPackage(null);
      setMessage('');
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    setShowForm(true);
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

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Additional Information</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Add any additional information or questions..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="h-32 mb-4"
              />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleRequest(selectedPackage!)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
} 