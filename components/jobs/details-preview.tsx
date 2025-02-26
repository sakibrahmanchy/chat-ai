'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Users,
  Clock,
  ChevronUp,
  Star,
  FileText,
  Mail,
  ChevronDown,
  Building2,
  GraduationCap,
  Briefcase,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2,
  Search,
  Share2,
  Check,
  Copy,
  Loader2,
  Pencil,
  PlusCircle
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import CandidateSingleView from "../smarthrflow/candidate-single-view";
import CandidatesExpandableListView from "../smarthrflow/candidates-expandable-list-view";

interface JobDetailsPreviewProps {
  job: any;
  metrics: {
    totalCandidates: number;
    timeToHire: string | number;
    matchRate: number;
  };
  candidates: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    location: string;
    experience: string;
    company: string;
    education: string;
    availability: string;
    score: number;
    skills: string[];
    scores: {
      skillsScore: number;
      experienceScore: number;
      educationScore: number;
      analysis: {
        strengths: string[];
      };
    };
  }>;
  skillsAnalysis: Array<{
    skill: string;
    score: number;
    matchRate: number;
    candidateCount: number;
  }>;
  distribution?: Array<{
    label: string;
    value: number;
    color: string;
    count: number;
  }>;
  isLoading?: boolean;
}

export function JobDetailsPreview({ 
  job,
  metrics,
  candidates,
  skillsAnalysis,
  distribution = [],
  isLoading = false,
}: JobDetailsPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [instructions, setInstructions] = useState(job.scoring_instructions || '');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleCopyLink = async () => {
    const publicLink = `${window.location.origin}/jobs/apply/${job.id}`;
    await navigator.clipboard.writeText(publicLink);
    setCopied(true);
    toast({
      title: "Link copied",
      description: "Job application link has been copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveInstructions = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoring_instructions: instructions })
      });

      if (!response.ok) {
        throw new Error('Failed to update instructions');
      }

      setIsEditingInstructions(false);
      router.refresh();
      
      toast({
        title: "Success",
        description: "Scoring instructions updated successfully",
      });
    } catch (error) {
      console.error('Error saving instructions:', error);
      toast({
        title: "Error",
        description: "Failed to save scoring instructions",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Format deadline date
  const formatDeadlineDate = (date: string) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  return (
    <div className="rounded-xl border bg-white shadow-2xl overflow-hidden max-w-[1400px] mx-auto backdrop-blur-sm backdrop-saturate-150">
      {/* Enhanced Header */}
      <div className="border-b bg-gradient-to-r from-slate-50 to-white p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <h3 className="font-semibold text-lg text-slate-800">{job.title}</h3>
            <Badge variant="success" className="h-6 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
              {job.status}
            </Badge>
          </div>
          <div className="flex gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              className="gap-2"
              size="sm"
              asChild
            >
              <Link href={`/dashboard/jobs/${job.id}/upload`}>
                <PlusCircle className="h-4 w-4" />
                <span>Add Candidates</span>
              </Link>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleCopyLink}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  <span>Share Job</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Scoring Instructions</h4>
            {!isEditingInstructions && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditingInstructions(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Add custom instructions
              </Button>
            )}
          </div>
          
          {isEditingInstructions ? (
            <div className="space-y-4">
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Add specific instructions for scoring candidates..."
                className="min-h-[100px]"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditingInstructions(false);
                    setInstructions(job.scoring_instructions || '');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveInstructions}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Instructions'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-slate-50 p-4">
              {job.scoring_instructions ? (
                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                  {job.scoring_instructions}
                </p>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  No specific scoring instructions added yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Main Content */}
        <div className="lg:col-span-8 p-4 sm:p-6">
          {/* Stats Grid - Enhanced Mobile Layout */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              {
                label: "Total Candidates",
                value: metrics.totalCandidates,
                icon: <Users className="h-4 w-4" />,
                change: "+12%",
                color: "text-emerald-600",
                format: (v: number) => v
              },
              {
                label: "Time to Hire",
                value: metrics.timeToHire,
                icon: <Clock className="h-4 w-4" />,
                change: "-25%",
                color: "text-blue-600",
                format: (v: number) => (
                    <TooltipProvider>
                    <div className="flex items-center gap-2 mt-4">
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger>
                          {v}
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-white p-2 text-sm shadow-lg">
                          <p>Deadline: {formatDeadlineDate(job.application_deadline)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                )
              },
              {
                label: "Match Score",
                value: metrics.matchRate,
                icon: <BarChart className="h-4 w-4" />,
                change: "+5%",
                color: "text-violet-600",
                format: (v: number) => v.toFixed(1) + "/10"
              }
            ].map((stat, index) => (
              <Card key={index} className="border-slate-200 hover:border-slate-300 transition-colors">
                <CardContent className="p-4 sm:pt-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className={`p-2 rounded-lg ${stat.color.replace('text', 'bg')}/10`}>
                      <div className={stat.color}>{stat.icon}</div>
                    </div>
                    <div className={`flex items-center text-emerald-600 text-xs sm:text-sm ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-blue-600'}`}>
                      <ChevronUp className="h-3 w-3" />
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-lg sm:text-2xl font-bold mb-1">
                    {stat.format(stat.value)}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Top Candidates Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Top Candidates</h4>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={`/dashboard/jobs/${job.id}/matches`}>
                  View All Candidates
                </Link>
              </Button>
            </div>
            {candidates.length > 0 ? (
              <div className="grid gap-4">
                <CandidatesExpandableListView candidates={candidates} initialExpandedCandidateId={candidates[0]?.id } />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                  <Users className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-slate-900">
                  No candidates yet
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Share your job posting to start receiving applications.
                </p>
                <div className="mt-6">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleCopyLink()}
                  >
                    Share Job Post
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Panel - Improved Mobile Layout */}
        <div className="lg:col-span-4 p-4 sm:p-6 bg-slate-50/50">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Skills Analysis</h4>
              <div className="space-y-3">
                {skillsAnalysis.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {item.skill}
                        <span className="text-xs text-muted-foreground">
                          ({item.candidateCount} candidates)
                        </span>
                      </span>
                      <span className="font-medium">{(item.score / 10).toFixed(1)}/10</span>
                    </div>
                    <Progress value={item.score} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {item.matchRate}% of candidates have this skill
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">Candidate Distribution</h4>
              <Card>
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : distribution.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <p>No distribution data available</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {distribution.map((item, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                              {item.label}
                              <span className="text-xs text-muted-foreground">
                                ({item.count} candidates)
                              </span>
                            </span>
                            <span>{item.value}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200">
                            <div
                              className={`h-full rounded-full ${item.color}`}
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 