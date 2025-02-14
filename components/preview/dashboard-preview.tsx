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
  Search
} from "lucide-react";

export function DashboardPreview() {
  const expandedCandidate = {
    name: "Sarah Anderson",
    role: "Marketing Manager",
    score: 95,
    email: "s.anderson@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    experience: "6 years",
    education: "MBA Marketing",
    company: "Global Brands Inc.",
    availability: "1 month notice",
    skills: ["Brand Strategy", "Team Leadership", "Digital Marketing", "Project Management", "Content Strategy"],
    scores: {
      skillsScore: 95,
      experienceScore: 92,
      educationScore: 88,
      overallScore: 92,
      analysis: {
        strengths: ["Strategic Planning", "Team Management", "Campaign Development"],
        experience: {
          relevantYears: 6,
          teamSize: "10+ members",
          leadership: "Department Head"
        }
      }
    }
  };

  return (
    <div className="rounded-xl border bg-white shadow-2xl overflow-hidden max-w-[1400px] mx-auto backdrop-blur-sm backdrop-saturate-150">
      {/* Enhanced Header */}
      <div className="border-b bg-gradient-to-r from-slate-50 to-white p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <h3 className="font-semibold text-lg text-slate-800">Marketing Manager Position</h3>
            <Badge variant="success" className="h-6 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
              Active
            </Badge>
          </div>
          <div className="flex gap-2 self-end sm:self-auto">
            <button 
              className="inline-flex items-center text-xs sm:text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
              <span className="hidden sm:inline">Similar Jobs</span> 
            </button>
            <button 
              className="inline-flex items-center text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
              <span className="hidden sm:inline">Contact Candidates</span> 
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Main Content */}
        <div className="lg:col-span-8 p-4 sm:p-6">C
          {/* Stats Grid - Enhanced Mobile Layout */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              { 
                label: "Total Candidates",
                value: "124",
                icon: <Users className="h-4 w-4" />,
                change: "+12%",
                color: "text-emerald-600"
              },
              {
                label: "Time to Hire",
                value: "12 days",
                icon: <Clock className="h-4 w-4" />,
                change: "-25%",
                color: "text-blue-600"
              },
              {
                label: "Match Rate",
                value: "85%",
                icon: <BarChart className="h-4 w-4" />,
                change: "+5%",
                color: "text-violet-600"
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
                  <div className="text-lg sm:text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-slate-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Candidate Card - Improved Mobile Layout */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Top Matches</h4>
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                View All
              </Button>
            </div>
            
            <div className="rounded-lg border bg-white">
              <div className="p-4 border-b bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium shrink-0">
                      {expandedCandidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {expandedCandidate.name}
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="text-sm text-slate-600">{expandedCandidate.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">Match Score</div>
                      <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                        {expandedCandidate.score}%
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {/* Contact & Professional Info - Better Mobile Layout */}
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-1">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-slate-600">Contact Information</h4>
                        <div className="grid gap-2">
                          {[
                            { icon: <Mail className="h-4 w-4" />, value: expandedCandidate.email },
                            { icon: <Phone className="h-4 w-4" />, value: expandedCandidate.phone },
                            { icon: <MapPin className="h-4 w-4" />, value: expandedCandidate.location }
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <span className="text-slate-400">{item.icon}</span>
                              <span className="truncate">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-slate-600">Professional Details</h4>
                        <div className="grid gap-2">
                          {[
                            { icon: <Briefcase className="h-4 w-4" />, value: `${expandedCandidate.experience} Experience` },
                            { icon: <Building2 className="h-4 w-4" />, value: `Current: ${expandedCandidate.company}` },
                            { icon: <GraduationCap className="h-4 w-4" />, value: expandedCandidate.education },
                            { icon: <Calendar className="h-4 w-4" />, value: `Available in ${expandedCandidate.availability}` }
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <span className="text-slate-400">{item.icon}</span>
                              <span className="truncate">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-slate-600">Key Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {expandedCandidate.skills.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-slate-600">Evaluation Scores</h4>
                      <div className="space-y-2">
                        {[
                          { label: "Skills Match", value: expandedCandidate.scores.skillsScore },
                          { label: "Experience", value: expandedCandidate.scores.experienceScore },
                          { label: "Education", value: expandedCandidate.scores.educationScore }
                        ].map((score, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{score.label}</span>
                              <span className="font-medium">{score.value}%</span>
                            </div>
                            <Progress value={score.value} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-slate-600">Key Strengths</h4>
                      <div className="space-y-1">
                        {expandedCandidate.scores.analysis.strengths.map((strength, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center justify-center py-2">
                        Schedule Interview
                      </button>
                      <button className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center justify-center py-2">
                        Download CV
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Panel - Improved Mobile Layout */}
        <div className="lg:col-span-4 p-4 sm:p-6 bg-slate-50/50">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Skills Analysis</h4>
              <div className="space-y-3">
                {[
                  { skill: "Strategic Planning", match: 95 },
                  { skill: "Team Management", match: 88 },
                  { skill: "Campaign Development", match: 82 },
                  { skill: "Budget Management", match: 75 }
                ].map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.skill}</span>
                      <span className="font-medium">{item.match}%</span>
                    </div>
                    <Progress value={item.match} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">Candidate Distribution</h4>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {[
                      { label: "Highly Qualified", value: 45, color: "bg-emerald-500" },
                      { label: "Qualified", value: 32, color: "bg-blue-500" },
                      { label: "Potential", value: 23, color: "bg-amber-500" }
                    ].map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.label}</span>
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 