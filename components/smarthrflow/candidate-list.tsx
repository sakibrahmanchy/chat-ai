'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { 
  Search,
  SlidersHorizontal, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { getRelativeTimeString } from "@/lib/utils";

interface Candidate {
  id: string;
  jobId: string;
  jobTitle: string;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  status: string;
  createdAt: string;
  parsedContent?: {
    full_name?: string;
    occupation?: string;
    email?: string;
    phone?: string;
    overallFit?: number;
  };
}

interface CandidateListProps {
  candidates: Candidate[];
}

export function CandidateList({ candidates }: CandidateListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCandidates = candidates.filter(candidate => 
    candidate.parsedContent?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.parsedContent?.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'success';
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {filteredCandidates.map((candidate, index) => (
          <Card key={`${candidate.id}-${index}`}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Candidate Info */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {candidate.parsedContent?.full_name || candidate.fileName}
                    </h3>
                    <Badge variant={getStatusColor(candidate.status)}>
                      {candidate.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {candidate.parsedContent?.occupation || 'Role not specified'}
                  </p>
                  
                  {/* Details */}
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    {candidate.parsedContent?.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {candidate.parsedContent.email}
                      </div>
                    )}
                    {candidate.parsedContent?.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {candidate.parsedContent.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      Applied for {candidate.jobTitle}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Applied {getRelativeTimeString(new Date(candidate.createdAt))}
                    </div>
                  </div>
                </div>

                {/* Scores */}
                {candidate.parsedContent && (
                  <div className="flex-1 lg:max-w-xs space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Match Score</span>
                        <span>{candidate.parsedContent.overallFit}%</span>
                      </div>
                      <Progress value={candidate.parsedContent.overallFit} />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(candidate.downloadUrl, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                  <Link href={`/dashboard/candidates/${candidate.id}`}>
                    <Button size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCandidates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No candidates found matching your search.
          </div>
        )}
      </div>
    </div>
  );
} 