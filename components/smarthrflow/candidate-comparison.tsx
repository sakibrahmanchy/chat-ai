'use client';

import { useState } from "react";
import { Resume } from "@/app/types/resume";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CandidateFilters } from "./candidate-filters";
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Eye, 
  Download, 
  Filter,
  X,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CandidateComparisonProps {
  resumes: Resume[];
  jobId: string;
  jobTitle: string;
}

export function CandidateComparison({ resumes: initialResumes, jobId, jobTitle }: CandidateComparisonProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [resumes, setResumes] = useState(initialResumes);
  const [filteredResumes, setFilteredResumes] = useState(initialResumes);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const getSkills = (resume: Resume) => {
    const skills = resume.parsedContent?.skills;
    if (!skills) return [];
    return Array.isArray(skills) ? skills : typeof skills === 'string' ? [skills] : [];
  };

  const handleFilterChange = (filters: any) => {
    let filtered = [...resumes];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(resume => 
        resume.parsedContent?.full_name?.toLowerCase().includes(searchLower) ||
        resume.parsedContent?.occupation?.toLowerCase().includes(searchLower)
      );
    }

    // Apply match score filter
    filtered = filtered.filter(resume => {
      const score = resume.scores?.averageScore || 0;
      return score >= filters.matchScore[0] && score <= filters.matchScore[1];
    });

    // Apply skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(resume => {
        const candidateSkills = getSkills(resume);
        return filters.skills.every((skill: string) => 
          candidateSkills.includes(skill)
        );
      });
    }

    // Apply experience filter
    if (filters.experience !== 'any') {
      // Add experience filtering logic based on your data structure
    }

    // Apply location filter
    if (filters.location !== 'any') {
      // Add location filtering logic based on your data structure
    }

    setFilteredResumes(filtered);
  };

  const handleDownload = (downloadUrl: string) => {
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Collapsible Sidebar */}
      <div 
        className={cn(
          "bg-white border-r transition-all duration-300",
          showFilters ? "w-[320px]" : "w-0"
        )}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CandidateFilters onFilterChange={handleFilterChange} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/jobs/${jobId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h2 className="font-semibold">{jobTitle}</h2>
              <p className="text-sm text-muted-foreground">
                {filteredResumes.length} candidates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline">Export</Button>
          </div>
        </div>

        {/* Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Candidate List */}
          <div className="w-[320px] border-r bg-slate-50/50">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {filteredResumes
                  .sort((a, b) => (b.scores?.averageScore || 0) - (a.scores?.averageScore || 0))
                  .map((resume, index) => (
                    <div
                      key={resume.id}
                      className={cn(
                        "p-3 rounded-lg border bg-white cursor-pointer hover:border-indigo-500 transition-colors",
                        selectedIds.includes(resume.id) && "border-indigo-500 bg-indigo-50/50"
                      )}
                      onClick={() => {
                        if (selectedIds.includes(resume.id)) {
                          setSelectedIds(selectedIds.filter(id => id !== resume.id));
                        } else {
                          setSelectedIds([...selectedIds, resume.id]);
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        {index < 3 && (
                          <Star className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {resume.parsedContent?.full_name || 'Unnamed Candidate'}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {resume.parsedContent?.occupation || 'No title specified'}
                          </div>
                          {resume.scores && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className={cn(
                                "text-sm font-semibold",
                                index < 3 && "text-indigo-600"
                              )}>
                                {resume.scores.averageScore}/10
                              </div>
                              <Progress 
                                value={resume.scores.averageScore * 10} 
                                className="flex-1 h-1.5"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>

          {/* Comparison View */}
          <div className="flex-1 bg-slate-50">
            <ScrollArea className="h-full">
              <div className="p-6">
                {selectedIds.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Select candidates to compare
                  </div>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
                    {selectedIds.map(id => {
                      const resume = resumes.find(r => r.id === id);
                      if (!resume) return null;
                      
                      const skills = getSkills(resume);
                      
                      return (
                        <div key={resume.id} className="space-y-6 bg-white p-6 rounded-lg border">
                          {/* Candidate Details */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">
                                  {resume.parsedContent?.full_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {resume.parsedContent?.occupation}
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setSelectedIds(selectedIds.filter(i => i !== id))}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Score Details */}
                            {resume.scores && (
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Skills Match</span>
                                    <span>{resume.scores.skillsScore}/10</span>
                                  </div>
                                  <Progress value={resume.scores.skillsScore * 10} />
                                </div>
                                {/* ... other scores ... */}
                              </div>
                            )}

                            {/* Skills */}
                            <div>
                              <h4 className="text-sm font-medium mb-2">Skills</h4>
                              <div className="flex flex-wrap gap-1">
                                {skills.map(skill => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Link href={`/dashboard/candidates/${resume.id}`} className="flex-1">
                                <Button className="w-full" variant="outline" size="sm">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Profile
                                </Button>
                              </Link>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-1"
                                onClick={() => handleDownload(resume.downloadUrl)}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
} 