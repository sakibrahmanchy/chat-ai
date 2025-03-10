'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PricingCard } from './pricing-card';
import { cn } from '@/lib/utils';

interface Package {
  id: string;
  name: string;
  price: number;
  credits: number;
  description: string;
  stripePriceId?: string;
  is_popular?: boolean;
  features?: string[] | undefined;
}

interface PricingSliderProps {
  packages: Package[];
  selectedPackage: string | null;
  onSelect: (packageId: string) => void;
}

export function PricingSlider({ packages, selectedPackage, onSelect }: PricingSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const showPrevious = currentIndex > 0;
  const showNext = currentIndex < packages.length - 1;

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(packages.length - 1, prev + 1));
  };

  return (
    <div className="relative max-w-5xl mx-auto flex justify-around px-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden max-w-4xl w-full">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)` 
          }}
        >
          {(packages || []).filter((pkg) => pkg.price > 0).map((pkg, index) => (
            <div 
              key={pkg.id} 
              className={cn(
                "flex-shrink-0 px-3",
                "w-full md:w-1/3"
              )}
            >
              <PricingCard
                pkg={{
                  ...pkg,
                }}
                onSelect={() => onSelect(pkg.id)}
                isSelected={selectedPackage === pkg.id}
                index={index}
              />
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full",
          !showPrevious && "hidden"
        )}
        onClick={handlePrevious}
        disabled={!showPrevious}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full",
          !showNext && "hidden"
        )}
        onClick={handleNext}
        disabled={!showNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
} 