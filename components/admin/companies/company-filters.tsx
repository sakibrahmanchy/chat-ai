'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CompanyFiltersProps {
  onFilterChange?: (filters: {
    search: string;
    status: string;
    creditRange: string;
    dateRange: string;
  }) => void;
}

export function CompanyFilters({ onFilterChange }: CompanyFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    creditRange: 'all',
    dateRange: 'all'
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleReset = () => {
    const defaultFilters = {
      search: '',
      status: 'all',
      creditRange: 'all',
      dateRange: 'all'
    };
    setFilters(defaultFilters);
    onFilterChange?.(defaultFilters);
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">
            Search Companies
          </Label>
          <Input
            id="search"
            placeholder="Search companies..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.creditRange}
            onValueChange={(value) => handleFilterChange('creditRange', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Credits" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Credits</SelectItem>
              <SelectItem value="0-100">0-100 Credits</SelectItem>
              <SelectItem value="101-500">101-500 Credits</SelectItem>
              <SelectItem value="501+">501+ Credits</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.dateRange}
            onValueChange={(value) => handleFilterChange('dateRange', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="shrink-0"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
} 