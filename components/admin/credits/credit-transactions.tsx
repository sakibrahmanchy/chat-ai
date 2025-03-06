'use client';

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Transaction {
  id: string;
  company_id: string;
  amount: number;
  type: string;
  notes: string;
  created_at: string;
  credits_used: number;
  credits_added: number;
  companies?: {
    name: string;
  };
}

interface TransactionsProps {
  transactions: Transaction[];
}

export function CreditTransactions({ transactions: initialTransactions }: TransactionsProps) {
  const [transactions] = useState(initialTransactions);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    dateRange: 'all'
  });

  const getTransactionColor = (amount: number) => {
    if (amount > 0) return 'bg-green-100 text-green-800';
    if (amount < 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.companies?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.notes.toLowerCase().includes(filters.search.toLowerCase());

    const matchesType = filters.type === 'all' || 
      (filters.type === 'credit' && transaction.amount > 0) ||
      (filters.type === 'debit' && transaction.amount < 0);

    const matchesDate = filters.dateRange === 'all' || (() => {
      const txDate = new Date(transaction.created_at);
      const now = new Date();
      switch (filters.dateRange) {
        case 'today':
          return txDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          return txDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          return txDate >= monthAgo;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">
            Search Transactions
          </Label>
          <Input
            id="search"
            placeholder="Search by company or notes..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="credit">Credits Added</SelectItem>
              <SelectItem value="debit">Credits Deducted</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.dateRange}
            onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Credits Used</TableHead>
            <TableHead>Credits Added</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.companies?.name}</TableCell>
              <TableCell>
                <Badge className={getTransactionColor(transaction.credits_used)}>
                  {transaction.credits_used > 0 ? '+' : ''}{transaction.credits_used}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getTransactionColor(transaction.credits_added)}>
                  {transaction.credits_added > 0 ? '+' : ''}{transaction.credits_added}
                </Badge>
              </TableCell>
              <TableCell>
                {transaction.type === 'admin_assignment' ? 'Manual Assignment' : 
                 transaction.type === 'purchase' ? 'Package Purchase' : 
                 transaction.type === 'usage' ? 'Usage' : 
                 transaction.type}
              </TableCell>
              <TableCell className="max-w-xs truncate">{transaction.notes}</TableCell>
              <TableCell>{formatDate(transaction.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 