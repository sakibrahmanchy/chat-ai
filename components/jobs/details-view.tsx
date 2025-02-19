'use client';

import { Job } from "@/app/types/job";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Search,
  Mail,
  Users,
  Clock,
  ChevronDown,
  Star,
  Download,
  Building,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Resume } from "@/app/types/resume";

interface JobDetailsViewProps {
  job: Job;
  topCandidates: Resume[];
  metrics: {
    totalCandidates: number;
    timeToHire: number;
    matchRate: number;
  };
  skillsAnalysis: Array<{
    skill: string;
    score: number;
  }>;
}

export function JobDetailsView({ 
  job, 
  topCandidates, 
  metrics,
  skillsAnalysis 
}: JobDetailsViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const candidateDistribution = [
    { label: "Highly Qualified", percentage: 45, color: "bg-emerald-500" },
    { label: "Qualified", percentage: 32, color: "bg-blue-500" },
    { label: "Potential", percentage: 23, color: "bg-amber-500" }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            {job.title}
            <Badge variant="outline" className="bg-emerald-50 text-emerald-600">
              Active
            </Badge>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Similar Jobs
          </Button>
          <Button size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Contact Candidates
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-slate-600 mb-1">
            <Users className="h-4 w-4" />
            <span className="text-sm">Total Candidates</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold">{metrics.totalCandidates}</span>
            <span className="text-emerald-600 text-sm">↑ 12%</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-slate-600 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Time to Hire</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold">{metrics.timeToHire} days</span>
            <span className="text-blue-600 text-sm">↓ 25%</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-slate-600 mb-1">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Match Rate</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold">{metrics.matchRate}%</span>
            <span className="text-emerald-600 text-sm">↑ 5%</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Content - Top Matches */}
        <div className="col-span-8">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Top Matches</h2>
              <Link href={`${job.id}/matches`}>
                <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
                  View All
                </Button>
              </Link>
            </div>

            {topCandidates.slice(0, 3).map((candidate, index) => (
              <div 
                key={candidate.id}
                className={cn(
                  "border rounded-lg p-6 mb-4 last:mb-0",
                  expandedId === candidate.id && "border-indigo-200 bg-slate-50"
                )}
              >
                {/* Candidate Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 bg-indigo-50">
                      <AvatarFallback className="text-indigo-600">
                        {candidate.parsedContent?.full_name?.split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase() || 'NA'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{candidate.parsedContent?.full_name}</h3>
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      </div>
                      <p className="text-slate-600 text-sm">{candidate.parsedContent?.current_title || 'Marketing Manager'}</p>
                    </div>
                  </div>
                  <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === candidate.id ? null : candidate.id)}
                  >
                    <div className="text-lg font-semibold text-indigo-600">
                      {Math.round(candidate.scores?.overallScore || 0)}%
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-slate-400 transition-transform",
                      expandedId === candidate.id && "transform rotate-180"
                    )} />
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === candidate.id && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Contact Information</h4>
                        <div className="space-y-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {candidate.parsedContent?.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {candidate.parsedContent?.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {candidate.parsedContent?.location}
                          </div>
                        </div>
                      </div>

                      {/* Professional Details */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Professional Details</h4>
                        <div className="space-y-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {candidate.parsedContent?.current_company}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {candidate.parsedContent?.total_experience_in_months 
                              ? `${Math.floor(candidate.parsedContent.total_experience_in_months / 12)} years Experience`
                              : '6 years Experience'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Evaluation Scores */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Evaluation Scores</h4>
                      <div className="space-y-2">
                        {[
                          { label: "Skills Match", value: candidate.scores?.skillsScore || 95 },
                          { label: "Experience", value: candidate.scores?.experienceScore || 92 },
                          { label: "Education", value: candidate.scores?.educationScore || 88 }
                        ].map((score, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{score.label}</span>
                              <span>{score.value}%</span>
                            </div>
                            <Progress 
                              value={score.value} 
                              className="h-2 bg-indigo-100" 
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Strengths */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Strengths</h4>
                      <div className="flex flex-wrap gap-2">
                        {candidate.scores?.analysis?.matchedSkills?.map((skill, index) => (
                          <Badge 
                            key={index}
                            variant="secondary" 
                            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">Download CV</Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        Shortlist For Interview
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Card>
        </div>

        {/* Sidebar - Analysis */}
        <div className="col-span-4 space-y-6">
          {/* Skills Analysis */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Skills Analysis</h3>
            <div className="space-y-4">
              {skillsAnalysis.map((skill, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{skill.skill}</span>
                    <span>{skill.score}%</span>
                  </div>
                  <Progress value={skill.score} className="h-2" />
                </div>
              ))}
            </div>
          </Card>

          {/* Candidate Distribution */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Candidate Distribution</h3>
            <div className="space-y-4">
              {candidateDistribution.map((category, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{category.label}</span>
                    <span>{category.percentage}%</span>
                  </div>
                  <Progress value={category.percentage} className={`h-2 ${category.color}`} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 