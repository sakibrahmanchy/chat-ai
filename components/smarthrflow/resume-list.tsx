'use client';

import { Resume } from "@/app/types/resume";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { getRelativeTimeString } from "@/lib/utils";
import { Zap, Loader2, Eye, Download, Calendar, MapPin, ChevronDown, ChevronRight, Star, SplitSquareHorizontal } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CandidateFilters } from "./candidate-filters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ResumeListProps {
  resumes: Resume[];
  jobId: string;
  jobTitle: string;
}

const TOP_CANDIDATE_STYLES = [
  "border-indigo-500 bg-indigo-50/50", // 1st place
  "border-emerald-500 bg-emerald-50/50", // 2nd place
  "border-amber-500 bg-amber-50/50", // 3rd place
] as const;

export function ResumeList({ resumes: initialResumes, jobId, jobTitle }: ResumeListProps) {
  const [resumes, setResumes] = useState(initialResumes);
  const [filteredResumes, setFilteredResumes] = useState(initialResumes);
  const [scoringId, setScoringId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const handleScore = async (resumeId: string) => {
    try {
      setScoringId(resumeId);
      const response = await fetch(`/api/jobs/${jobId}/resumes/${resumeId}/score`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Scoring failed');
      
      const scoreResult = await response.json();
      
      // Update the resume with new scores
      setResumes(prevResumes => 
        prevResumes.map(resume => 
          resume.id === resumeId 
            ? { ...resume, scores: scoreResult }
            : resume
        )
      );

      toast({
        title: "Success",
        description: "Resume scored successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to score resume",
        variant: "destructive",
      });
    } finally {
      setScoringId(null);
    }
  };

  const handleDownload = (downloadUrl: string) => {
    window.open(downloadUrl, '_blank');
  };

  const getCardStyle = (index: number) => {
    if (index < 3) {
      return `border-2 ${TOP_CANDIDATE_STYLES[index]}`;
    }
    return "shadow-sm hover:shadow-md";
  };

  const getScoreStyle = (index: number) => {
    switch (index) {
      case 0:
        return "text-indigo-600";
      case 1:
        return "text-emerald-600";
      case 2:
        return "text-amber-600";
      default:
        return "text-indigo-600";
    }
  };

  const getProgressStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-indigo-600";
      case 1:
        return "bg-emerald-600";
      case 2:
        return "bg-amber-600";
      default:
        return "bg-indigo-600";
    }
  };

  const handleFilterChange = (filters: any) => {
    let filtered = [...resumes];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(resume => 
        resume.parsedContent?.full_name.toLowerCase().includes(searchLower) ||
        resume.parsedContent?.occupation.toLowerCase().includes(searchLower)
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
        const candidateSkills = resume.parsedContent?.skills || [];
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

    // Apply status filter
    if (filters.status !== 'any') {
      filtered = filtered.filter(resume => resume.status === filters.status);
    }

    setFilteredResumes(filtered);
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-0 bg-white py-4 -mt-4 mb-4 border-b z-10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-xl font-semibold">
              Candidates ({filteredResumes.length})
            </h2>
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/jobs/${jobId}/compare`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <SplitSquareHorizontal className="h-4 w-4" />
                  Compare View
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </div>
          <CandidateFilters onFilterChange={handleFilterChange} />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[30px]"></TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Match Score</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResumes
              .sort((a, b) => (b.scores?.averageScore || 0) - (a.scores?.averageScore || 0))
              .map((resume, index) => (
                <>
                  <TableRow 
                    key={resume.id}
                    className={cn(
                      "cursor-pointer hover:bg-slate-50",
                      expandedId === resume.id && "bg-slate-50"
                    )}
                    onClick={() => setExpandedId(expandedId === resume.id ? null : resume.id)}
                  >
                    <TableCell>
                      {expandedId === resume.id ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        {index < 3 && (
                          <Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-medium">{resume.parsedContent?.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {resume.parsedContent?.occupation}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {resume.scores ? (
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "text-lg font-semibold",
                            index < 3 && "text-indigo-600"
                          )}>
                            {resume.scores.averageScore}
                          </div>
                          <Progress 
                            value={resume.scores.averageScore * 10} 
                            className="w-20 h-2"
                          />
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScore(resume.id);
                          }}
                          disabled={scoringId === resume.id}
                        >
                          {scoringId === resume.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Scoring...
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-4 w-4" />
                              Score
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {resume.parsedContent?.skills?.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {(resume.parsedContent?.skills?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(resume.parsedContent?.skills?.length || 0) - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      EXPericen {resume.parsedContent?.total_experience_in_months || "Not specified"}
                    </TableCell>
                    <TableCell>
                      {getRelativeTimeString(resume.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/candidates/${resume.id}`}>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(resume.downloadUrl);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedId === resume.id && resume.scores && (
                    <TableRow className="bg-slate-50">
                      <TableCell colSpan={7} className="p-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="font-medium">Detailed Scores</h4>
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Skills Match</span>
                                  <span>{resume.scores.skillsScore}/10</span>
                                </div>
                                <Progress value={resume.scores.skillsScore * 10} />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Experience Match</span>
                                  <span>{resume.scores.experienceScore}/10</span>
                                </div>
                                <Progress value={resume.scores.experienceScore * 10} />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Overall Match</span>
                                  <span>{resume.scores.overallScore}/10</span>
                                </div>
                                <Progress value={resume.scores.overallScore * 10} />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="font-medium">Analysis</h4>
                            <div className="space-y-4 text-sm">
                              <div>
                                <div className="font-medium mb-1">Matched Skills</div>
                                <div className="flex flex-wrap gap-1">
                                  {resume.scores.analysis.matchedSkills.map((skill) => (
                                    <Badge key={skill} variant="secondary">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="font-medium mb-1">Missing Skills</div>
                                <div className="flex flex-wrap gap-1">
                                  {resume.scores.analysis.missingSkills.map((skill) => (
                                    <Badge key={skill} variant="outline" className="text-red-500">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 