'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { pricingService } from '@/lib/services/pricing.service';

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

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Request Credits</h1>
        <p className="text-gray-600 mb-8">
          Select a package below and submit a request. Our team will contact you to process your credit purchase.
        </p>
        
        <div className="grid gap-6">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`border rounded-lg p-6 cursor-pointer transition-colors ${
                selectedPackage === pkg.id ? 'border-indigo-500 bg-indigo-50' : 'hover:border-gray-300'
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              <h2 className="text-xl font-semibold">{pkg.name}</h2>
              <p className="text-3xl font-bold mt-4">${pkg.price}</p>
              <p className="text-gray-600 mt-2">{pkg.credits} Credits</p>
              <p className="text-sm text-gray-500 mt-2">{pkg.description}</p>
            </div>
          ))}
        </div>

        {selectedPackage && (
          <div className="mt-8 space-y-4">
            <Textarea
              placeholder="Add any additional information or questions..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-32"
            />
            <Button 
              className="w-full"
              onClick={() => handleRequest(selectedPackage)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 