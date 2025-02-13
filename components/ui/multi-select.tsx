'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options = [],
  selected,
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter(item => item !== value));
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className={cn(
          "w-full justify-between min-h-[2.5rem] h-auto",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 pr-4">
          {selected.length === 0 && (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {selected.map((value) => (
            <Badge
              key={value}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-0.5"
            >
              <span className="truncate">
                {options.find(opt => opt.value === value)?.label}
              </span>
              <button
                className="rounded-full hover:bg-muted/50 p-0.5"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove(value);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 absolute right-3" />
      </Button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md overflow-hidden">
          <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  selected.includes(option.value) && "bg-accent/50"
                )}
                onClick={() => handleSelect(option.value)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex-shrink-0 h-4 w-4 border rounded flex items-center justify-center">
                    {selected.includes(option.value) && (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                  <span className="truncate">{option.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 