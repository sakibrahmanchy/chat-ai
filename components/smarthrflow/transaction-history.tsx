'use client';

import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { CardHeader } from "../ui/card";
import { CardTitle } from "../ui/card";
import { CardDescription } from "../ui/card";
import { CardContent } from "../ui/card";
import { Table } from "../ui/table";
import { TableHeader } from "../ui/table";
import { TableRow } from "../ui/table";
import { TableHead } from "../ui/table";
import { TableBody } from "../ui/table";
import { TableCell } from "../ui/table";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { creditService } from "@/lib/services/credits.service";
import React, { useState, useEffect, useRef } from "react";
import { Skeleton } from "../ui/skeleton";
import { formatDate } from "date-fns";
import { useCompany } from "@/hooks/use-company";
import { CreditTransaction } from "@/app/types/credits";
import { useInView } from "react-intersection-observer";

// Update interface for cursor-based pagination
interface TransactionsResponse {
  data: CreditTransaction[];
  next_cursor: string | null;
}

export default function TransactionHistory({
    className,
    title,
    description,
    detailsButton = false
}: {
    className?: string;
    title?: string;
    description?: string;
    detailsButton?: boolean;
}) {
    const { companyId } = useCompany();
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 10;

    // Create intersection observer for infinite scroll
    const lastItemRef = useRef<HTMLDivElement>(null);
    const { ref, entry } = useInView({
        root: null,
        threshold: 1,
    });

    const getDescriptionFromAction = (transaction: CreditTransaction) => {
        const getTransactionName = () => {
            switch (transaction.action_type) {
                case 'package_purchase':
                    return 'Package Purchase';
                case 'match_resume':
                    return 'Matched Resume';
                case 'submit_resume':
                    return 'Submitted Resume';
                case 'email_candidate':
                    return 'Sent Email';
                default:
                    return transaction.action_type;
            }
        }

        return `${getTransactionName()} ${transaction.entity_type ? `for ${transaction.entity_id}` : ''}`;
    }

    const fetchTransactions = async (cursor?: string | null) => {
        if (!companyId) return;
        
        try {
            const isInitialFetch = !cursor;
            if (isInitialFetch) {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }

            const result = await creditService.getTransactions(companyId, {
                cursor,
                pageSize: PAGE_SIZE
            });

            if (isInitialFetch) {
                setTransactions(result.data);
            } else {
                setTransactions(prev => [...prev, ...result.data]);
            }

            setNextCursor(result.next_cursor);
            setHasMore(!!result.next_cursor);

            if (isInitialFetch) {
                const currentBalance = await creditService.getCurrentBalance(companyId);
                setCurrentBalance(currentBalance);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchTransactions();
    }, [companyId]);

    // Handle infinite scroll
    useEffect(() => {
        if (entry?.isIntersecting && hasMore && !isLoadingMore) {
            fetchTransactions(nextCursor);
        }
    }, [entry?.isIntersecting]);

    if (!companyId || isLoading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-8 w-full bg-gray-200" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="h-4 w-full bg-gray-200" />
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
                            {detailsButton && (
                                <span><a href="/dashboard/settings" className="text-xs">
                                    More details
                                </a></span>
                            )}
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
                                    {transactions.map((transaction, index) => (
                                        <TableRow
                                            key={transaction.id}
                                            className="group hover:bg-muted/50 transition-colors"
                                            ref={index === transactions.length - 1 ? ref : undefined}
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
                                                            transaction.credits_added > 0 ? "text-green-600" : "text-red-600"
                                                        )}
                                                    >
                                                        {getDescriptionFromAction(transaction)}
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
                                                    transaction.credits_added > 0 ? "text-green-600" : "text-red-600"
                                                )}>
                                                    {transaction.credits_added > 0 ? '+' : '-'}
                                                    {transaction.credits_added > 0 ? Math.abs(transaction.credits_added) : Math.abs(transaction.credits_used)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div
                                                    className={cn(
                                                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                                        transaction.credits_added > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                                    )}
                                                >
                                                    {transaction.credits_added > 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                                                    {transaction.credits_added > 0 ? Math.abs(transaction.credits_added) : Math.abs(transaction.credits_used)}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            
                            {/* Loading indicator for infinite scroll */}
                            {isLoadingMore && (
                                <div className="p-4 flex justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
                                </div>
                            )}
                            
                            {/* End of list message */}
                            {!hasMore && transactions.length > 0 && (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No more transactions to load
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

