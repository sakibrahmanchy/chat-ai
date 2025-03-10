'use client';

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  pkg: {
    id: string;
    name: string;
    price: number;
    credits: number;
    features?: string[] | undefined;
  };
  onSelect: () => void;
  isSelected: boolean;
  index: number;
}

export function PricingCard({ pkg, onSelect, isSelected, index }: PricingCardProps) {
  return (
    <div
      className={cn(
        "cursor-pointer hover:bg-indigo-50 hover:border-indigo-600 relative rounded-xl border p-4 shadow-sm transition-all hover:shadow-md h-[32rem] flex flex-col",
        isSelected ? "border-indigo-600 bg-indigo-50" : "border-gray-200",
      )}
    >
      <div className="mt-2">
        <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>

        <div className="mt-3 mb-4">
          <p className="flex items-baseline">
            {index < 5 && <span className="text-2xl font-bold tracking-tight text-gray-900">${pkg.price}</span>}  
            {index > 4 && <span className="text-2xl font-bold tracking-tight text-gray-900">Contact us</span>}
            {index < 5 && <span className="ml-1 text-xs text-gray-500">/one-time</span>}
          </p>
          {index < 5 && <p className="mt-1 text-xs text-gray-500">{pkg.credits} credits included</p>}
          {index > 4 && <p className="mt-1 text-xs text-gray-500">Contact us for custom packages</p>}
        </div>
      </div>

      <div className="mt-auto">
        <ul className="space-y-2 mb-4">
          {(pkg?.features || []).map((feature) => (
            <li className="flex text-xs" key={feature}>
              <Check className="h-4 w-4 text-indigo-600 mr-1.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className={cn(
            "w-full text-sm py-2 h-auto mb-4"
          )}
          onClick={onSelect}
        >
          {isSelected ? "Selected" : "Get Started"}
        </Button>
      </div>
    </div>
  );
} 