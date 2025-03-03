'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Mail, MoreVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface CandidateBulkActionsProps {
  listName: string;
  candidates: Array<{
    id: string;
    name: string;
    email?: string;
  }>;
}

export function CandidateBulkActions({ listName, candidates }: CandidateBulkActionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Implement export logic here
      const csvContent = candidates.map(c => 
        `${c.name},${c.email || ''}`
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${listName}-candidates.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${candidates.length} candidates from ${listName}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the candidates",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkEmail = async () => {
    setIsSendingEmail(true);
    try {
      // Implement email logic here
      toast({
        title: "Emails Queued",
        description: `Emails will be sent to ${candidates.length} candidates`,
      });
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "There was an error sending the emails",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={isExporting || candidates.length === 0}
      >
        <Download className="h-4 w-4 mr-2" />
        Export {listName}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleBulkEmail}
        disabled={isSendingEmail || candidates.length === 0}
      >
        <Mail className="h-4 w-4 mr-2" />
        Email All
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExport}>
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleBulkEmail}>
            Send Bulk Email
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 