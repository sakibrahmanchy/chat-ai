  "use client";

  import { Button } from "@/components/ui/button";
  // import { Card } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { Checkbox } from "@/components/ui/checkbox";
  import { Search, Filter, Download, Star, Sparkles, Calendar, Check, X } from "lucide-react";
  import { Input } from "@/components/ui/input";
  // import Link from "next/link";
import { EmailCandidatesDialog } from "./smarthrflow/email-candidates-dialog";

  const demoData = [
    {
      id: 1,
      name: "Sophia Martinez",
      role: "Software Engineer",
      matchScore: 8.3,
      skills: ["JavaScript", "TypeScript", "Go"],
      additionalSkills: 13,
      experience_years: 6,
      status: "shortlisted",
      starred: true,
      selected: false
    },
    {
      id: 2,
      name: "James Wilson",
      role: "Senior Frontend Developer",
      matchScore: 9.1,
      skills: ["React", "Vue", "Angular"],
      additionalSkills: 8,
      experience_years: 8,
      status: "pending",
      starred: false,
      selected: false
    },
    {
      id: 3,
      name: "Emily Chen",
      role: "Full Stack Developer",
      matchScore: 8.8,
      skills: ["Python", "Django", "React"],
      additionalSkills: 10,
      experience_years: 5,
      status: "shortlisted",
      starred: true,
      selected: false
    },
    {
      id: 4,
      name: "Michael Brown",
      role: "Backend Engineer",
      matchScore: 7.9,
      skills: ["Java", "Spring", "MySQL"],
      additionalSkills: 11,
      experience_years: 4,
      status: "rejected",
      starred: false,
      selected: false
    },
    {
      id: 5,
      name: "Sarah Johnson",
      role: "DevOps Engineer",
      matchScore: 8.5,
      skills: ["Docker", "Kubernetes", "AWS"],
      additionalSkills: 9,
      experience_years: 7,
      status: "pending",
      starred: true,
      selected: true
    },
    {
      id: 6,
      name: "David Lee",
      role: "Mobile Developer",
      matchScore: 8.0,
      skills: ["Swift", "Kotlin", "React Native"],
      additionalSkills: 7,
      experience_years: 5,
      status: "shortlisted",
      starred: false,
      selected: false
    },
    {
      id: 7,
      name: "Rachel Garcia",
      role: "UI/UX Developer",
      matchScore: 8.7,
      skills: ["Figma", "JavaScript", "CSS"],
      additionalSkills: 12,
      experience_years: 6,
      status: "pending",
      starred: true,
      selected: false
    },
    {
      id: 8,
      name: "Thomas Anderson",
      role: "Systems Architect",
      matchScore: 9.3,
      skills: ["C++", "Python", "Cloud Architecture"],
      additionalSkills: 15,
      experience_years: 10,
      status: "shortlisted",
      starred: true,
      selected: false
    }
  ].sort((a, b) => b.matchScore - a.matchScore);
  
  ;

  export function DemoCandidateListView() {
    const selectedCandidates = demoData.filter(candidate => candidate.selected === true);
    const bulkActionsHeader = (
      <div className="bg-white pt-4 pb-0">
        <div className="flex items-center justify-between bg-white p-4 border rounded-lg pl-4">
          <div className="flex items-center gap-4">
            <Checkbox
              checked
            />
            <span className="text-sm text-muted-foreground">
              {selectedCandidates.length} selected
            </span>
          </div>
  
          {selectedCandidates.length > 0 && (
            <div className="flex gap-2">
              <EmailCandidatesDialog
                candidates={demoData.filter(r => selectedCandidates.map(c => c.id).includes(r.id))}
                jobTitle="Senior Software Engineer"
                companyName="Tech Solutions"
                companyId="123456"
                jobId="7890"
              />
              {(
                <Button
                  variant="outline"
                  size="sm"
                  // onClick={handleBulkAccept}
                  className="bg-indigo-600 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Shortlist Selected
                </Button>
              )}
              {(
                <Button
                  variant="outline"
                  size="sm"
                  // onClick={handleBulkReject}
                  className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject Selected
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div className="flex-1 flex flex-col min-h-0 rounded-xl border bg-white shadow-2xl p-4">
        {/* Header */}
        <div className="bg-white p-4">
          <div className="flex flex-col sm:flex-row items-start justify-between sm:items-center gap-4">
            <div className="flex flex-2">
              {/* <Link href="#">
                <Button variant="ghost" size="sm" className="hidden sm:flex h-9 w-9">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link> */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold truncate text-wrap">Senior Software Engineer</h2>
                  <Button variant="ghost" size="sm" className="h-6 w-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">1 candidates</p>
              </div>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search candidates..." />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none gap-2">
                <Filter className="h-4 w-4" />
                <span className="sm:hidden">Filters</span>
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white pb-8 sm:!pb-0 sm:px-4">
          <div className="h-9 items-center rounded-lg bg-muted p-1 text-muted-foreground w-full flex flex-wrap gap-2 sm:flex-nowrap justify-start">
            {[
              {
                label: "All Candidates",    
                count: demoData.length
              },
              {
                label: "Pending Review",
                count: demoData.filter(candidate => candidate.status === 'pending').length
              },
              {   
                label: "Shortlisted",
                count: demoData.filter(candidate => candidate.status === 'shortlisted').length
              },
              {
                label: "Rejected",
                count: demoData.filter(candidate => candidate.status === 'rejected').length
              }
            ].map((tab, i) => (
              <Button
                key={tab.label}
                variant={i === 0 ? "default" : "ghost"}
                className={`flex-1 min-w-[120px] whitespace-nowrap ${i === 0 ? 'bg-indigo-600 text-white border-indigo-600 border' : 'hover:bg-indigo-50 border'
                  }`}
              >
                <span className="truncate">{tab.label}</span>
                <Badge variant="secondary" className="ml-2 shrink-0">
                  {tab.count}
                </Badge>
              </Button>
            ))}
          </div>
          {bulkActionsHeader}
        </div>

        {/* Candidate List */}
        <div className="p-4 space-y-4">
          {demoData.map((candidate, index) => (
            <div key={candidate.id} className={`rounded border transition-all duration-200 w-full border-l-4 border-l-indigo-500 ${candidate.status === 'shortlisted' ? 'bg-green-50' : candidate.status === 'rejected' ? 'bg-red-50' : 'bg-white'}`}>
              <div className="p-3 cursor-pointer w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
                  <Checkbox className="peer h-4 w-4" checked={candidate.selected} />
                  <div className="flex sm:flex-row items-center gap-2 w-full sm:w-[200px] sm:min-w-[200px]">
                    {index < 3 && (
                      <Star className="h-3 w-3 text-yellow-400 flex-shrink-0" fill="currentColor" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium truncate text-sm">{candidate.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{candidate.role}</p>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground w-[180px] min-w-[180px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{candidate.experience_years}y</span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-3 flex-1 w-full justify-end">
                    <div className="w-[120px] min-w-[120px]">
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-xs">
                          <span>Match Score</span>
                          <span className="text-indigo-600">{candidate.matchScore}/10</span>
                        </div>
                        <div className="relative w-full overflow-hidden rounded-full bg-slate-100 h-1">
                          <div className="h-full w-full flex-1 bg-indigo-600 transition-all"
                            style={{ transform: `translateX(-${(10 - candidate.matchScore) * 10}%)` }} />
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:flex min-w-[200px]">
                      <div className="flex flex-wrap gap-1 max-w-[300px]">
                        {candidate.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs px-1.5 py-0 truncate max-w-[150px]">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.additionalSkills > 0 && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            +{candidate.additionalSkills}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7" title="Check Match Score (Requires 1 credit)">
                        <Sparkles className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs px-1.5 py-0 capitalize">
                      {candidate.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } 