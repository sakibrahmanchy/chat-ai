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
}

interface PricingSliderProps {
  packages: Package[];
  selectedPackage: string | null;
  onSelect: (id: string) => void;
}

export function PricingSlider({ packages, selectedPackage, onSelect }: PricingSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const showPrevious = currentIndex > 0;
  const showNext = currentIndex < packages.length - 3;

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(packages.length - 3, prev + 1));
  };

  return (
    <div className="relative max-w-5xl mx-auto">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 33.333}%)` }}
        >
          {packages.map((pkg, index) => (
            <div key={pkg.id} className="w-1/3 flex-shrink-0 px-3">
              <PricingCard
                pkg={{
                  ...pkg,
                  is_popular: index === 1
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