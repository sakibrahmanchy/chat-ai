'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreditAction, Package } from '@/lib/services/pricing.service';
import { MotionDiv } from '@/components/motion';
import { Calculator, Info, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CreditCalculatorProps {
  creditActions: CreditAction[];
  packages: Package[];
}

export function CreditCalculator({ creditActions, packages }: CreditCalculatorProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [totalCredits, setTotalCredits] = useState(0);
  const [recommendedPackage, setRecommendedPackage] = useState<Package | null>(null);

  useEffect(() => {
    // Calculate total credits needed
    const total = creditActions.reduce((sum, action) => {
      return sum + (action.credits_required * (quantities[action.id] || 0));
    }, 0);
    setTotalCredits(total);

    // Find recommended package
    const recommended = packages
      .filter(p => p.credits >= total)
      .sort((a, b) => a.credits - b.credits)[0];
    setRecommendedPackage(recommended);
  }, [quantities, creditActions, packages]);

  const handleQuantityChange = (actionId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setQuantities(prev => ({
      ...prev,
      [actionId]: Math.max(0, numValue)
    }));
  };

  return (
    <Card className="p-6 bg-white shadow-lg">
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="h-6 w-6 text-indigo-600" />
          <h3 className="text-xl font-semibold">Credit Calculator</h3>
        </div>

        {/* Credit Actions */}
        <div className="grid gap-4">
          {creditActions.map((action) => (
            <div key={action.id} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label>{action.description}</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white text-black border-2 border-indigo-600">
                        <p>{action.description}</p>
                        <p className="font-semibold mt-1">
                          {action.credits_required} credits per action
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  min="0"
                  value={quantities[action.id] || ''}
                  onChange={(e) => handleQuantityChange(action.id, e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="w-24 text-right">
                <span className="text-sm text-muted-foreground">
                  {((quantities[action.id] || 0) * action.credits_required).toLocaleString()} credits
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Credits */}
        <div className="border-t pt-4 mt-6">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Credits Needed:</span>
            <span className="text-xl font-bold text-indigo-600">
              {totalCredits.toLocaleString()} credits
            </span>
          </div>
        </div>

        {/* Recommended Package */}
        {recommendedPackage && totalCredits > 0 && (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-indigo-50 rounded-lg"
          >
            <h4 className="font-semibold mb-2">Recommended Package</h4>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-indigo-600">{recommendedPackage.name}</p>
                <p className="text-sm text-muted-foreground">{recommendedPackage.credits.toLocaleString()} credits</p>
              </div>
              <Button className="bg-indigo-600">
                ${recommendedPackage.price} - Buy Now
              </Button>
            </div>
          </MotionDiv>
        )}

        {/* Credit Policy Information */}
        <div className="mt-6 space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="h-3 w-3 text-green-600" />
            </div>
            <p>Credits never expire - use them at your own pace</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="h-3 w-3 text-green-600" />
            </div>
            <p>Unused credits automatically roll over when you purchase a new package</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="h-3 w-3 text-green-600" />
            </div>
            <p>Transparent pricing - no hidden fees or monthly commitments</p>
          </div>
        </div>
      </div>
    </Card>
  );
} 