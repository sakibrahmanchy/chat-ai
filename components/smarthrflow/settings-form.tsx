'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Package, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CreditPackage } from "@/app/types/credits";
import { cn } from "@/lib/utils";
import TransactionHistory from "./transaction-history";
import { AvailableCredits } from "./available-credits";

interface Transaction {
  id: string;
  action_type: string;
  credits_added: number;
  credits_used: number;
  created_at: string;
  description?: string;
}

interface SettingsFormProps {
  initialData: {
    company: {
      credits: {
        credits_balance: number;
        last_topped_up: Date;
        credits_used: number;
      }[];
      purchases: {
        credit_packages: CreditPackage;
        credits_purchased: number;
        created_at: string;
      }[];
      transactions: Transaction[];
    };
  };
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const { credits, purchases } = initialData.company;
  const { credits_balance = 0, credits_used = 0 } = credits[0] || [{ credit_balance: 0, credits_used: 0 }];
  const creditBalance = Number(credits_balance);
  const creditsUsed = Number(credits_used);
  const creditsUsedPercentage = (creditsUsed / (creditBalance + creditsUsed)) * 100 || 0;

  const lastPurchase = purchases[purchases.length - 1];
  const creditPackage = lastPurchase?.credit_packages;

  if (!creditPackage) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center space-y-8 py-12">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Get Started with Credits</h1>
          <p className="text-muted-foreground text-lg">
            Unlock full access to our AI-powered recruitment tools with credits
          </p>
        </div>

        <div className="flex justify-center">
          <Package className="h-32 w-32 text-indigo-500 animate-bounce-slow" />
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span>AI Resume Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span>Bulk Resume Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span>Advanced Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span>Email Campaigns</span>
            </div>
          </div>
        </div>

        <Link href="/dashboard/billing" className="inline-block">
          <Button size="lg" className="font-semibold">
            <Package className="mr-2 h-5 w-5" />
            Upgrade Package
          </Button>
        </Link>
      </div>
    )
  }
  return (
    <div className="w-full">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-3xl font-bold pb-4">Credits & Packages</h1>
        {/* <Link href="/dashboard/billing">
          <Button>
            <CreditCard className="mr-2 h-4 w-4" />
            Manage Billing
          </Button>
        </Link> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Credits & Package Info */}
        <motion.div
          className="lg:col-span-4 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AvailableCredits />
          {/* Credits Card */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Available Credits
              </CardTitle>
              <CardDescription>
                Your current credit usage and limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end">
                <div className={cn(
                  "flex flex-col gap-2",
                  creditsUsedPercentage > 50 ? "text-red-500" : "text-muted-foreground"
                )}>
                  <p className="text-3xl font-bold">{credits_balance}</p>
                  <p className="text-sm text-muted-foreground">credits remaining</p>
                </div>
              </div>

              <div className="space-y-2">
                <Progress value={creditsUsedPercentage} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {creditsUsedPercentage.toFixed(1)}% used ({creditsUsed} used of {(creditBalance + creditsUsed)} credits)
                </p>
              </div>
            </CardContent>
          </Card> */}

          {/* Package Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                Last Package Bought
              </CardTitle>
              <CardDescription>
                Your subscription package details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{creditPackage.name}</h3>
                {/* <p className="text-sm text-muted-foreground">{creditPackage.description}</p> */}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Credits</span>
                  <span className="font-medium">{creditPackage.credits}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price</span>
                  <span className="font-medium">
                    ${creditPackage.price}
                  </span>
                </div>
                {creditPackage.features?.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/dashboard/billing" className="block mt-4">
                <Button className="w-full">
                  Upgrade Package
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column - Transaction History */}
        <div className="lg:col-span-8">
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
} 