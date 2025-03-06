'use client';

import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { CardHeader } from "../ui/card";
import { CardTitle } from "../ui/card";
import { CardDescription } from "../ui/card";
import { CardContent } from "../ui/card";
// import { Badge } from "../ui/badge";
import { Table } from "../ui/table";
import { TableHeader } from "../ui/table";
import { TableRow } from "../ui/table";
import { TableHead } from "../ui/table";
import { TableBody } from "../ui/table";
import { TableCell } from "../ui/table";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
// import { useParams } from "next/navigation";
import { creditService } from "@/lib/services/credits.service";
import { useState, useEffect } from "react";
import { Skeleton } from "../ui/skeleton";
import { formatDate } from "date-fns";
import { useCompany } from "@/hooks/use-company";
// import { Button } from "../ui/button";
interface Transaction {
    id: string;
    action_type: string;
    credits_added: number;
    credits_used: number;
    created_at: string;
    description?: string;
}

export default function TransactionHistory({
    className,
    title,
    description
}: {
    className?: string;
    title?: string;
    description?: string;
}) {
    const { companyId } = useCompany();
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [currentBalance, setCurrentBalance] = useState(0);

    const getDescriptionFromActionType = (actionType: string) => {
        switch (actionType) {
            case 'package_purchase':
                return 'Package Purchase';
            case 'match_resume':
                return 'Matched Resume';
            case 'submit_resume':
                return 'Submitted Resume';
            default:
                return actionType;
        }
    }

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!companyId) return;
            try {
                const transactions = await creditService.getTransactions(companyId);
                setTransactions(transactions);

                const currentBalance = await creditService.getCurrentBalance(companyId);
                setCurrentBalance(currentBalance);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, [companyId]);


    if (!companyId || isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-8 w-[200px] bg-gray-200" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="h-4 w-[300px] bg-gray-200" />
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full bg-gray-200" />
                        <Skeleton className="h-10 w-full bg-gray-200" />
                        <Skeleton className="h-10 w-full bg-gray-200" />
                        <Skeleton className="h-10 w-full bg-gray-200" />
                        <Skeleton className="h-10 w-full bg-gray-200" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <Card className={cn(className)}>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex flex-col">
                            <span className="flex items-center gap-2 text-xl">
                                {title || 'Credit History'}

                            </span>
                            <span className="text-xs font-normal">
                                {description || 'Track your credit usage and purchases'}
                            </span>
                        </span>
                        <span className="flex flex-col items-end ml-2 text-xs">
                            <span className="text-xl">{currentBalance} </span>
                            <span className="text-xs font-normal">credits remaining</span>
                            <span><a href="/dashboard/settings" className="text-xs">
                                More details
                            </a></span>
                        </span>
                    </CardTitle>
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
                                                        <span
                                                            className={cn(
                                                                "w-20 justify-center",
                                                                isCredit ? "text-green-600" : "text-red-600"
                                                            )}
                                                        >
                                                            {getDescriptionFromActionType(transaction.action_type)}
                                                        </span>
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
    )
}

