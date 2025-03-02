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
    description: string;
    is_popular?: boolean;
  };
  onSelect: () => void;
  isSelected: boolean;
  index: number;
}

export function PricingCard({ pkg, onSelect, isSelected, index }: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border p-4 shadow-sm transition-all hover:shadow-md h-[32rem] flex flex-col",
        isSelected ? "border-indigo-600 bg-indigo-50" : "border-gray-200",
        pkg.is_popular ? "border-indigo-600" : ""
      )}
    >
      {pkg.is_popular && (
        <div className="absolute -top-2.5 left-0 right-0 mx-auto w-fit rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-medium text-white">
          Popular
        </div>
      )}

      <div className="mt-2">
        <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
        {/* <div className="mt-1.5 text-xs text-gray-600 overflow-y-auto max-h-64"
          dangerouslySetInnerHTML={{ __html: pkg.description }}>
        </div> */}
      </div>

      <div className="mt-auto">
        <div className="mt-3 mb-4">
          <p className="flex items-baseline">
            {index < 5 && <span className="text-2xl font-bold tracking-tight text-gray-900">${pkg.price}</span>}  
            {index > 4 && <span className="text-2xl font-bold tracking-tight text-gray-900">Contact us</span>}
            {index < 5 && <span className="ml-1 text-xs text-gray-500">/one-time</span>}
          </p>
          {index < 5 && <p className="mt-1 text-xs text-gray-500">{pkg.credits} credits included</p>}
          {index > 4 && <p className="mt-1 text-xs text-gray-500">Contact us for custom packages</p>}
        </div>
        <ul className="space-y-2 mb-4">
          <li className="flex text-xs">
            <Check className="h-4 w-4 text-indigo-600 mr-1.5 flex-shrink-0" />
            <span>Process resumes automatically</span>
          </li>
          <li className="flex text-xs">
            <Check className="h-4 w-4 text-indigo-600 mr-1.5 flex-shrink-0" />
            <span>AI-powered candidate matching</span>
          </li>
          <li className="flex text-xs">
            <Check className="h-4 w-4 text-indigo-600 mr-1.5 flex-shrink-0" />
            <span>Smart candidate ranking</span>
          </li>
        </ul>
        <Button
          className={cn(
            "w-full text-sm py-2 h-auto mb-4",
            pkg.is_popular ? "bg-indigo-600 hover:bg-indigo-700" : ""
          )}
          onClick={onSelect}
        >
          {isSelected ? "Selected" : "Get Started"}
        </Button>
      </div>
    </div>
  );
} 