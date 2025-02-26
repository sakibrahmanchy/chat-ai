'use client';

import { useState, useEffect, useMemo, useRef } from "react";
import { Resume } from "@/app/types/resume";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CandidateFilters } from "./candidate-filters";
import {
  Star,
  Eye,
  Download,
  Filter,
  X,
  ArrowLeft,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Search,
  Loader2,
  Upload,
  RefreshCw,
  Sparkles,
  Info
} from "lucide-react";
import Link from "next/link";
import { cn, getRelativeTimeString } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useInView } from 'react-intersection-observer';
import { collection, query as firestoreQuery, orderBy, limit, getDocs, startAfter, doc, updateDoc, where, Query } from "firebase/firestore";
import { db } from "@/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { scoreResume } from "@/lib/ai/resume-scorer";
import { toast } from "@/hooks/use-toast";
import { Job } from "@/app/types/job";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { resumeSearch } from '@/lib/services/resume-search.service';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRouter } from "next/navigation";
import { AddToListDialog } from "./add-to-list-dialog";
import { useCompany } from "@/hooks/use-company";

const CANDIDATES_PER_PAGE = 20;

interface CandidateListViewProps {
  initialResumes: Resume[];
  jobId: string;
  jobTitle: string;
  userId: string;
  jobDescription: string;
  requiredSkills: string[];
  requirements: string;
  showFiltersDefault: boolean;
  initialFilters?: {
    search?: string;
    skills?: string[];
    experienceLevel?: string;
    matchScore?: [number, number];
  };
}

// Add proper filter type
interface Filters {
  search: string;
  matchScore: [number, number];
  skills: string[];
  experiences: 'any' | 'entry' | 'mid' | 'senior' | 'lead';
  location: 'any' | 'remote' | 'onsite' | 'hybrid';
  showFilters: boolean;
}

// First, let's define proper types for our Supabase data structure
interface ParsedContent {
  full_name: string;
  occupation: string;
  education: Array<{
    degree_name: string;
    school: string;
    starts_at?: string;
    ends_at?: string;
  }>;
  experiences: Array<{
    title: string;
    company: string;
    starts_at: string;
    ends_at?: string;
  }>;
  skills: string[];
  total_experience_in_months: number;
  city?: string;
  state?: string;
  country?: string;
  personal_emails?: string[];
  personal_numbers?: string[];
  skills_with_yoe?: Record<string, { name: string; years: number }>;
}

interface ResumeScores {
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  roleMatchScore?: number;
  analysis: {
    matchedSkills: string[];
    missingSkills: string[];
    strengthAreas: string[];
    improvementAreas: string[];
    experienceAnalysis: string;
    educationAnalysis: string;
    overallFeedback: string;
  };
  metadata: {
    processing_time: number;
    confidence_score: number;
    processed_at: string;
    file_url: string;
  };
}

interface Resume {
  id: string;
  hash: string;
  parsed_content: ParsedContent;
  scores: ResumeScores;
  searchable_skills: string[];
  experience_months: number;
  current_position: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  created_at: string;
  updated_at: string;
  metadata: {
    processing_time: number;
    confidence_score: number;
    processed_at: string;
    file_url: string;
  };
}

// Update the helper functions to use the new types
const getEducation = (resume: Resume) => {
  const education = resume.parsed_content?.education;
  if (!education) return [];
  return Array.isArray(education) ? education : [education];
};

const getMatchScore = (resume: Resume) => {
  return resume?.overall_score || 0;
};

// Update the search function to use the new data structure
const searchResumes = (resumes: Resume[], searchTerm: string) => {
  const searchLower = searchTerm.toLowerCase();
  return resumes.filter(resume => {
    const name = resume.parsed_content?.full_name?.toLowerCase() || '';
    const skills = resume.searchable_skills?.map(s => s.toLowerCase()) || [];
    const content = resume.parsed_content?.experiences?.map(e =>
      `${e.title} ${e.company}`.toLowerCase()
    ).join(' ') || '';

    return name.includes(searchLower) ||
      skills.some(skill => skill.includes(searchLower)) ||
      content.includes(searchLower);
  });
};

// Update other helper functions similarly
const calculateTotalYears = (resume: Resume) => {
  return Math.floor(resume.experience_months / 12);
};

const getSkills = (resume: Resume) => {
  return resume.searchable_skills || [];
};

const getLocation = (resume: Resume) => {
  const { city, state, country } = resume.location || {};
  const parts = [city, state, country].filter(Boolean);
  return parts.join(', ') || 'No location';
};

// Add this helper function near the top of the file
const formatYearsOfExperience = (months: number) => {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${remainingMonths} months`;
  if (remainingMonths === 0) return `${years} years`;
  return `${years} years ${remainingMonths} months`;
};

// Add this helper function to format percentages
const formatPercentage = (value: number) => {
  return `${Math.round(value)}%`;
};

export function CandidateListView({
  initialResumes,
  jobId,
  jobTitle,
  userId,
  jobDescription,
  requiredSkills,
  requirements,
  showFiltersDefault = false,
  initialFilters
}: CandidateListViewProps) {
  const [resumes, setResumes] = useState<Resume[]>(initialResumes);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadingScores, setLoadingScores] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const router = useRouter();
  const { companyId } = useCompany();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');

  // Update the filters state with more sensible defaults
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  // Load available locations when component mounts
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locations = await resumeSearch.getUniqueLocations(jobId);
        setAvailableLocations(locations);
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    };

    loadLocations();
  }, [userId, jobId]);

  
  const [filters, setFilters] = useState({
    showFilters: showFiltersDefault,
    skills: initialFilters?.skills || [],
    scoreRange: initialFilters?.matchScore || [0, 10],
    status: [],
    experienceMonths: [0, 999] as [number, number],
    matchType: initialFilters?.matchType || 'OR' as 'AND' | 'OR',
    sortBy: 'score' as 'score' | 'date',
    location: "all"
  });

  const { ref, inView } = useInView({
    threshold: 0,
  });


  const loadInitialData = async () => {
    setLoading(true);
    try {
      setIsLoading(true);
      const searchFilters = {
        ...filters,
        searchTerm: searchTerm,
        skills: filters.skills.length > 0 ? filters.skills : undefined,
        status: filters.status.length > 0 ? filters.status : undefined,
        location: filters.location === "all" ? undefined : filters.location,
        experienceMonths: filters.experienceMonths[0] === 0 && filters.experienceMonths[1] === 999
          ? undefined
          : filters.experienceMonths,
        scoreRange: filters.scoreRange[0] === 0 && filters.scoreRange[1] === 10 ? undefined : filters.scoreRange
      };

      const result = await resumeSearch.searchResumes(
        jobId,
        searchFilters
      );
      console.log('result', result);
      setResumes(result.resumes);
      setLastVisible(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading resumes:', error);
      toast({
        title: "Error",
        description: "Failed to load resumes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  // Modified score calculation function
  const handleCalculateScore = async (resume: Resume) => {
    try {
      setLoadingScores(prev => ({ ...prev, [resume.id]: true }));

      // Only pass IDs to scoring function
      await scoreResume(resume.id, jobId);

      loadInitialData();
      
      toast({
        title: "Success",
        description: "Match score updated successfully",
      });
    } catch (error) {
      console.error('Error calculating score:', error);
      toast({
        title: "Error",
        description: "Failed to update match score",
        variant: "destructive"
      });
    } finally {
      setLoadingScores(prev => ({ ...prev, [resume.id]: false }));
    }
  };


  // Update loadMore function
  const loadMore = async () => {
    if (!hasMore || loading) return;
    setLoading(true);

    try {
      setIsLoadingMore(true);
      const searchFilters = {
        ...filters,
        searchTerm: searchTerm,
        skills: filters.skills.length > 0 ? filters.skills : undefined,
        status: filters.status.length > 0 ? filters.status : undefined,
        location: filters.location === "all" ? undefined : filters.location,
        experienceMonths: filters.experienceMonths[0] === 0 && filters.experienceMonths[1] === 999
          ? undefined
          : filters.experienceMonths,
        scoreRange: filters.scoreRange[0] === 0 && filters.scoreRange[1] === 10 ? undefined : filters.scoreRange
      };

      const result = await resumeSearch.searchResumes(
        jobId,
        searchFilters,
        Math.ceil(resumes.length / 20) + 1
      );

      setResumes(prev => [...prev, ...result.resumes]);
      setLastVisible(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading more resumes:', error);
      toast({
        title: "Error",
        description: "Failed to load more resumes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Update initial data loading
  useEffect(() => {
    console.log({ filters, searchTerm })
    loadInitialData();
  }, [filters, searchTerm]); // Update dependencies

  // Handle infinite scroll
  useEffect(() => {
    if (inView && !loading) {
      loadMore();
    }
  }, [inView]);

  // Client-side search filter
  const filteredResumes = useMemo(() => {
    if (!searchTerm) return resumes;

    const searchLower = searchTerm.toLowerCase();
    return resumes.filter(resume => {
      const name = resume.parsed_content?.full_name?.toLowerCase() || '';
      const skills = resume.searchable_skills?.map(s => s?.toLowerCase() || null).filter(Boolean) || [];
      const content = resume.parsed_content?.experiences?.map(e =>
        `${e.title} ${e.company}`.toLowerCase()
      ).join(' ') || '';

      return name.includes(searchLower) ||
        skills.some(skill => skill.includes(searchLower)) ||
        content.includes(searchLower);
    });
  }, [resumes, searchTerm]);

  // UI state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState<string | null>(null);
  const [showJobDescription, setShowJobDescription] = useState(false);
  const [showCheckMatch, setShowCheckMatch] = useState(false);

  const handleDownload = (downloadUrl: string) => {
    console.log(downloadUrl)
    window.open(downloadUrl, '_blank');
  };

  const formatDate = (date: { month: number; year: number } | string | undefined) => {
    if (!date) return 'Present';
    
    if (typeof date === 'string') {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short'
      }).format(new Date(date));
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short'
    }).format(new Date(date.year, date.month - 1));
  };

  // Add a filter toggle component
  const SkillFilterToggle = () => (
    <div className="flex items-center gap-2 p-4 border-b">
      <span className="text-sm">Match Type:</span>
      <ToggleGroup type="single" value={filters.matchType} onValueChange={(value) =>
        setFilters(prev => ({ ...prev, matchType: value as 'AND' | 'OR' }))
      }>
        <ToggleGroupItem value="AND">Match All Skills</ToggleGroupItem>
        <ToggleGroupItem value="OR">Match Any Skill</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* Filters */}
      {filters.showFilters && (
        <div className="w-full lg:w-[240px] border-b lg:border-b-0 lg:border-r bg-white">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium text-sm">Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, showFilters: false }))}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SkillFilterToggle />
          <CandidateFilters
            filters={filters}
            onFilterChange={setFilters}
            availableLocations={availableLocations}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <Link href={`/dashboard/jobs/${jobId}`} className={cn(jobId === 'demo' && 'pointer-events-none')}>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold truncate text-wrap">{jobTitle}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowJobDescription(true)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {resumes.length} candidates
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex-1 sm:flex-none gap-2"
                onClick={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
              >
                <Filter className="h-4 w-4" />
                <span className="sm:hidden">Filters</span>
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none">
                Export
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Candidates List - Only scroll this section */}
        <div className="flex-1 overflow-auto">
          <div className="p-2 space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : resumes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <p>No candidates found</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredResumes
                  .sort((a, b) => getMatchScore(b) - getMatchScore(a))
                  .map((resume) => (
                    <div key={resume.id}>
                      {/* Collapsed/Expanded View Combined */}
                      <div
                        className={cn(
                          "bg-white rounded border transition-all duration-200 w-full",
                          expandedId === resume.id && "border-indigo-500 bg-slate-50",
                          resumes.indexOf(resume) < 3 && "border-l-4",
                          resumes.indexOf(resume) === 0 && "border-l-indigo-500",
                          resumes.indexOf(resume) === 1 && "border-l-emerald-500",
                          resumes.indexOf(resume) === 2 && "border-l-amber-500"
                        )}
                      >
                        {/* Main Row - Always Visible */}
                        <div
                          className="p-3 cursor-pointer w-full"
                          onClick={() => setExpandedId(expandedId === resume.id ? null : resume.id)}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
                            {/* Basic Info */}
                            <div className="flex items-center gap-2 w-full sm:w-[200px] sm:min-w-[200px]">
                              {resumes.indexOf(resume) < 3 && (
                                <Star className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <h3 className="font-medium truncate text-sm">
                                  {resume.parsed_content?.full_name || 'Unnamed Candidate'}
                                </h3>
                                <p className="text-xs text-muted-foreground truncate">
                                  {resume.parsed_content?.occupation || 'No title specified'}
                                </p>
                              </div>

                               {/* Middle: Location & Date */}
                               <div className="flex gap-3 text-xs text-muted-foreground w-[180px] min-w-[180px]">
                                {resume.location?.country && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">{resume.location.country}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{Math.floor(resume.experience_months / 12) + 'y' || "0"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Mobile Info */}
                            <div className="grid grid-cols-2 gap-2 w-full sm:hidden mt-2">
                              <div className="text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {getLocation(resume)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{resume.experience_months / 12 || "Not specified"}</span>
                              </div>
                              <div className="col-span-2 space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Match Score</span>
                                  <span>{getMatchScore(resume).toFixed(1)}/10</span>
                                </div>
                                <Progress value={getMatchScore(resume) * 10} className="h-1" />
                              </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden sm:flex items-center gap-3 flex-1 w-full justify-end">
                              {/* Scores */}
                              <div className="w-[120px] min-w-[120px]">
                                <div className="space-y-0.5">
                                  <div className="flex justify-between text-xs">
                                    <span>Match Score</span>
                                    <span className={cn(
                                      resumes.indexOf(resume) < 3 && "text-indigo-600"
                                    )}>{getMatchScore(resume).toFixed(1)}/10</span>
                                  </div>
                                  <Progress value={getMatchScore(resume) * 10} className="h-1" />
                                </div>
                              </div>

                              {/* Skills */}
                              <div className="flex min-w-[200px]">
                                <div className="flex flex-wrap gap-1">
                                  {(() => {
                                    const skillsList = getSkills(resume);
                                    const displaySkills = skillsList.slice(0, 3);
                                    return (
                                      <>
                                        {displaySkills.map((skill, index) => (
                                          <Badge
                                            key={`${resume.id}-${index}`}
                                            variant="secondary"
                                            className="text-xs px-1.5 py-0"
                                          >
                                            {skill?.name || skill}
                                          </Badge>
                                        ))}
                                        {skillsList.length > 3 && (
                                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                                            +{skillsList.length - 3}
                                          </Badge>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent row expansion
                                    handleCalculateScore(resume);
                                  }}
                                  disabled={loadingScores[resume.id]}
                                >
                                  {loadingScores[resume.id] ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    </>
                                  ) : (
                                    <Sparkles className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleDownload(resume.metadata.file_url)}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                                <AddToListDialog
                                  resumeId={resume.id}
                                  userId={userId}
                                  companyId={companyId}
                                  onSuccess={() => {
                                    toast({
                                      title: "Success",
                                      description: "Candidate added to list successfully"
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedId === resume.id && (
                          <div className="p-4 border-t bg-slate-50">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Left Column - Experience & Skills */}
                              <div className="space-y-4">
                                {/* Current Experience */}
                                {resume.parsed_content?.experiences?.[0] && (
                                  <div>
                                    <div className="text-sm font-medium mb-2">Current Position</div>
                                    <div className="space-y-1">
                                      <div className="text-sm">{resume.parsed_content.experiences[0].title}</div>
                                      <div className="text-sm text-muted-foreground">{resume.parsed_content.experiences[0].company}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {formatDate(resume.parsed_content.experiences[0].starts_at)} -
                                        {formatDate(resume.parsed_content.experiences[0].ends_at) || 'Present'}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Skills with Experience */}
                                <div>
                                  <div className="text-sm font-medium mb-2">Skills & Experience</div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {Object.values(resume.parsed_content?.skills_with_yoe || {}).map((skill: any) => (
                                      <div
                                        key={skill.name}
                                        className="flex items-center justify-between text-sm p-2 bg-white rounded border"
                                      >
                                        <span>{skill.name}</span>
                                        <span className="text-xs text-muted-foreground">{skill.years}y</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Education */}
                                {resume.parsed_content?.education?.length > 0 && (
                                  <div>
                                    <div className="text-sm font-medium mb-2">Education</div>
                                    <div className="space-y-2">
                                      {resume.parsed_content.education.map((edu: any, index: number) => (
                                        <div key={index} className="text-sm">
                                          <div>{edu.degree_name}</div>
                                          <div className="text-muted-foreground">{edu.school}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {formatDate(edu.starts_at)} - {formatDate(edu.ends_at)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Contact Information */}
                                <div>
                                  <div className="text-sm font-medium mb-2">Contact Information</div>
                                  <div className="space-y-1">
                                    {resume.parsed_content?.personal_emails?.map((email: string, index: number) => (
                                      <div key={index} className="text-sm flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        <span>{email}</span>
                                      </div>
                                    ))}
                                    {resume.parsed_content?.personal_numbers?.map((phone: string, index: number) => (
                                      <div key={index} className="text-sm flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        <span>{phone}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Right Column - Scores & Analysis */}
                              <div className="space-y-4">
                                {/* Detailed Score Breakdown */}
                                <div>
                                  <div className="text-sm font-medium mb-2">Match Score Breakdown</div>
                                  <div className="space-y-3">
                                    {/* Overall Score */}
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span>Overall Match</span>
                                        <span className="font-medium">{getMatchScore(resume).toFixed(1)}/10</span>
                                      </div>
                                      <Progress value={getMatchScore(resume) * 10} className="h-2" />
                                    </div>

                                    {/* Skills Score */}
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span>Skills Match</span>
                                        <span className="font-medium">{(resume.scores?.skillsScore || 0).toFixed(1)}/10</span>
                                      </div>
                                      <Progress value={resume.scores?.skillsScore * 10} className="h-2" />
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {resume.scores?.analysis?.matchedSkills?.join(', ')}
                                      </div>
                                    </div>

                                    {/* Experience Score */}
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span>Experience Match</span>
                                        <span className="font-medium">{(resume.scores?.experienceScore || 0)?.toFixed(1)}/10</span>
                                      </div>
                                      <Progress value={resume.scores?.experienceScore * 10} className="h-2" />
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {resume.scores?.analysis?.experienceAnalysis}
                                      </div>
                                    </div>

                                    {/* Education Score */}
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span>Education Match</span>
                                        <span className="font-medium">{(resume.scores?.educationScore || 0)?.toFixed(1)}/10</span>
                                      </div>
                                      <Progress value={resume.scores?.educationScore * 10} className="h-2" />
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {resume.scores?.analysis?.educationAnalysis}
                                      </div>
                                    </div>

                                    {/* Role Match Score */}
                                    {/* {resume.scores?.roleMatchScore && ( */}
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                          <span>Role Fit</span>
                                          <span className="font-medium">{(resume?.scores?.roleMatchScore || 0)?.toFixed(1)}/10</span>
                                        </div>
                                        <Progress value={resume?.scores?.roleMatchScore  || 0 * 10} className="h-2" />
                                      </div>
                                    {/* )} */}
                                  </div>
                                </div>

                                {/* Detailed Analysis */}
                                <div className="space-y-4">
                                  {/* Overall Feedback */}
                                  {resume.scores?.analysis?.overallFeedback && (
                                    <div>
                                      <div className="text-sm font-medium mb-1">Overall Analysis</div>
                                      <p className="text-sm text-muted-foreground">
                                        {resume.scores.analysis.overallFeedback}
                                      </p>
                                    </div>
                                  )}

                                  {/* Skill Analysis */}
                                  <div className="grid grid-cols-2 gap-4">
                                    {/* Matched Skills */}

                                      <div>
                                        <div className="text-sm font-medium text-green-600 mb-1">Matched Skills</div>
                                        <div className="flex flex-wrap gap-1">

                                          {resume.scores?.analysis?.matchedSkills?.length === 0 && <span className="text-xs text-muted-foreground space-y-1 list-disc list-inside">No skills matched.</span>}
                                          {resume.scores?.analysis?.matchedSkills?.map((skill, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                              {skill}
                                            </Badge>
                                          ))}
                                        </div>
                                    </div>
      

                                    {/* Missing Skills */}
                                    <div>
                                      <div className="text-sm font-medium text-amber-600 mb-1">Missing Skills</div>
                                      <div className="flex flex-wrap gap-1">
                                        {resume.scores?.analysis?.missingSkills?.map((skill, index) => (
                                          <Badge key={index} variant="outline" className="text-xs">
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* strengthAreas and improvementAreas */}
                                  <div className="grid grid-cols-2 gap-4">
                                    {/* strengthAreas */}
                                    <div>
                                      <div className="text-sm font-medium text-green-600 mb-1">Key strengthAreas</div>
                                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                        {resume.scores?.analysis?.strengthAreas?.map((strength, index) => (
                                          <li key={index}>{strength}</li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* Areas for Improvement */}
                                    <div>
                                      <div className="text-sm font-medium text-amber-600 mb-1">Areas for Improvement</div>
                                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                        {resume.scores?.analysis?.improvementAreas?.map((area, index) => (
                                          <li key={index}>{area}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>

                                {/* Last Updated */}
                                {resume.scores?.metadata?.processed_at && (
                                  <div className="text-xs text-muted-foreground mt-2">
                                    Last analyzed: {new Date(resume.scores.metadata.processed_at).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                {hasMore && (
                  <div className="p-4 flex justify-center">
                    <Button
                      onClick={loadMore}
                      variant="outline"
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading more...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Check Match Dialog */}
      <Dialog open={showCheckMatch} onOpenChange={setShowCheckMatch}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle>Check Resume Match</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Upload a resume to check how well it matches with this job position.
            </div>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <div className="mx-auto w-fit mb-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-sm font-medium mb-1">
                Drop your resume here or click to browse
              </div>
              <div className="text-xs text-muted-foreground">
                Supports PDF, DOCX, DOC (Max 10MB)
              </div>
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Handle file upload and matching logic
                    // You can use the same logic as in the upload page
                    // This should integrate with your AI matching system
                  }
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Description Dialog */}
      <Dialog open={showJobDescription} onOpenChange={setShowJobDescription}>
        <DialogContent className="sm:max-w-[600px] bg-white overflow-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{jobTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {jobDescription}
              </p>
            </div>
            {requiredSkills?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Required Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {requiredSkills.map(skill => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {requirements && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Requirements</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {requirements}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 