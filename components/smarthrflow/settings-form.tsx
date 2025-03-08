'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Package, Zap, ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CreditPackage } from "@/app/types/credits";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "date-fns";
import { cn } from "@/lib/utils";

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
  const { credits, purchases, transactions } = initialData.company;
  const { credits_balance = 0, credits_used = 0 } = credits[0] || [{ credit_balance: 0, credits_used: 0 }];
  console.log({ credits_balance, credits_used })
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
          {/* Credits Card */}
          <Card>
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
          </Card>

          {/* Package Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                Current Package
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
        <motion.div
          className="lg:col-span-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Credit History</span>
                <Badge variant="outline" className="ml-2">
                  {transactions.length} transactions
                </Badge>
              </CardTitle>
              <CardDescription>
                Track your credit usage and purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Credits</TableHead>
                        <TableHead className="text-right">Balance Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => {
                        const isCredit = transaction.credits_added > 0;
                        const changeAmount = isCredit 
                          ? transaction.credits_added 
                          : -transaction.credits_used;
                        
                        return (
                          <TableRow 
                            key={transaction.id}
                            className="group hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{formatDate(new Date(transaction.created_at), 'MMM dd, yyyy')}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(new Date(transaction.created_at), 'HH:mm')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={isCredit ? "default" : "destructive"}
                                  className="w-20 justify-center"
                                >
                                  {transaction.action_type}
                                </Badge>
                                {transaction.description && (
                                  <span className="text-sm text-muted-foreground">
                                    {transaction.description}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={cn(
                                "font-medium",
                                isCredit ? "text-green-600" : "text-red-600"
                              )}>
                                {isCredit ? '+' : '-'}{Math.abs(changeAmount)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                  isCredit 
                                    ? "bg-green-50 text-green-700" 
                                    : "bg-red-50 text-red-700"
                                )}
                              >
                                {isCredit ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                                {Math.abs(changeAmount)}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 