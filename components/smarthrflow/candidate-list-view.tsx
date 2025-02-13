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

// Helper function to ensure education is an array
const getEducation = (resume: Resume) => {
  const education = resume.parsedContent?.education;
  if (!education) return [];
  return Array.isArray(education) ? education : [education];
};

// Add this helper function near the top of the file
const formatYearsOfExperience = (months: number) => {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${remainingMonths} months`;
  if (remainingMonths === 0) return `${years} years`;
  return `${years} years ${remainingMonths} months`;
};

// Add this helper function at the top of the file
const getMatchScore = (resume: Resume) => {
  if (resume.scores?.overallScore) {
    return resume.scores.overallScore;
  }
  if (resume.scores?.averageScore) {
    return resume.scores.averageScore;
  }
  return 0;
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
  const { toast } = useToast();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score');

  // Add filters state back
  const [filters, setFilters] = useState<Filters>({
    search: initialFilters?.search || '',
    matchScore: initialFilters?.matchScore || [0, 100],
    skills: initialFilters?.skills || [],
    experiences: 'any',
    location: 'any',
    showFilters: showFiltersDefault
  });

  const { ref, inView } = useInView({
    threshold: 0,
  });

  // Function to build Firestore query
  const buildQuery = (startAfterDoc?: any) => {
    const resumesRef = collection(db, 'resumes');
    let queryConstraints = [
      where('jobId', '==', jobId)
    ];

    if (statusFilter !== 'all') {
      queryConstraints.push(where('status', '==', statusFilter));
    }

    if (scoreFilter !== 'all') {
      let minScore = 0, maxScore = 100;
      switch (scoreFilter) {
        case 'high':
          minScore = 80;
          break;
        case 'medium':
          minScore = 60;
          maxScore = 79;
          break;
        case 'low':
          maxScore = 59;
          break;
      }
      queryConstraints.push(where('scores.overallScore', '>=', minScore));
      queryConstraints.push(where('scores.overallScore', '<=', maxScore));
    }

    // Add sorting
    queryConstraints.push(orderBy(sortBy === 'score' ? 'scores.overallScore' : 'createdAt', 'desc'));

    // Add pagination
    queryConstraints.push(limit(CANDIDATES_PER_PAGE));
    if (startAfterDoc) {
      queryConstraints.push(startAfter(startAfterDoc));
    }

    return firestoreQuery(resumesRef, ...queryConstraints);
  };

  // Function to load more resumes
  const loadMore = async () => {
    if (!hasMore || loading) return;
    setLoading(true);

    try {
      const q = buildQuery(lastVisible);
      const snapshot = await getDocs(q);
      
      const newResumes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resume[];

      setResumes(prev => [...prev, ...newResumes]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === CANDIDATES_PER_PAGE);
    } catch (error) {
      console.error('Error loading more resumes:', error);
      toast({
        title: "Error",
        description: "Failed to load more resumes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load initial data when filters change
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const q = buildQuery();
        const snapshot = await getDocs(q);
        
        const newResumes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Resume[];

        setResumes(newResumes);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === CANDIDATES_PER_PAGE);
      } catch (error) {
        console.error('Error loading resumes:', error);
        toast({
          title: "Error",
          description: "Failed to load resumes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [scoreFilter, statusFilter, sortBy]);

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
      const name = resume.parsedContent?.full_name?.toLowerCase() || '';
      const skills = resume.parsedContent?.skills?.map(s => s.toLowerCase()) || [];
      const content = resume.parsedContent?.raw_text?.toLowerCase() || '';

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

  const calculateTotalYears = (resume: Resume) => {
    return Math.floor((resume.parsedContent?.total_experience_in_months || 0) / 12);
  };

  const getSkills = (resume: Resume) => {
    const skills = resume.parsedContent?.skills_with_yoe;
    if (!skills) return [];

    if (Array.isArray(skills)) return skills;
    else return Object.values(skills).slice(0, 3).map((s: any) => s.name);
  };

  const handleDownload = (downloadUrl: string) => {
    window.open(downloadUrl, '_blank');
  };

  const handleCheckMatch = async (resume: Resume) => {
    try {
      setIsCalculating(resume.id);
  
      const job: Job = {
        id: jobId,
        title: jobTitle,
        description: jobDescription,
        requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
        requirements: requirements || '',
        status: 'active', // Add any required fields from Job type
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: userId,
        company: '',
        location: '',
        type: 'full-time',
        salary: '',
        category: '',
        experiences: '',
        education: '',
        skills: Array.isArray(requiredSkills) ? requiredSkills : [],
      };

      // Pass the properly structured job object
      const newScores = await scoreResume(resume, job);

      // Update the resume with new scores in Firestore
      const resumeRef = doc(db, 'users', userId, 'jobs', jobId, 'resumes', resume.id);
      await updateDoc(resumeRef, {
        scores: newScores,
        updatedAt: new Date()
      });

      // Update local state
      setResumes(prev => prev.map(r => 
        r.id === resume.id 
          ? { ...r, scores: newScores, updatedAt: new Date().toISOString() }
          : r
      ));

      toast({
        title: "Match Score Updated",
        description: "The candidate's match score has been recalculated.",
      });
    } catch (error) {
      console.error('Error calculating match score:', error);
      toast({
        title: "Error",
        description: "Failed to calculate match score. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(null);
    }
  };

  const getLocation = (resume: Resume) => {
    const { city, state, country } = resume.parsedContent || {};
    const parts = [city, state, country].filter(Boolean);
    return parts.join(', ') || 'No location';
  };

  const formatDate = (date: { month: number; year: number }) => {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short'
    }).format(new Date(date.year, date.month - 1));
  };

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
          <CandidateFilters 
            filters={filters}
            onFilterChange={setFilters}
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
            {filteredResumes
              .sort((a, b) => getMatchScore(b) - getMatchScore(a))
              .map((resume) => (
                <div key={resume.objectID}>
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
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium truncate text-sm">
                              {resume.parsedContent?.full_name || 'Unnamed Candidate'}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {resume.parsedContent?.occupation || 'No title specified'}
                            </p>
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
                            <span>{resume.parsedContent?.total_experience_in_months / 12 || "Not specified"}</span>
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
                        <div className="hidden sm:flex items-center gap-3 flex-1 w-full">
                          {/* Middle: Location & Date */}
                          <div className="flex gap-3 text-xs text-muted-foreground w-[180px] min-w-[180px]">
                            {resume.parsedContent?.country && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{resume.parsedContent.country}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{Math.floor(resume.parsedContent?.total_experience_in_months / 12) + 'y' || "0"}</span>
                            </div>
                          </div>

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
                                    {displaySkills.map((skill) => (
                                      <Badge 
                                        key={`${resume.id}-${skill.name || skill}`}
                                        variant="secondary" 
                                        className="text-xs px-1.5 py-0"
                                      >
                                        {skill.name || skill}
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
                                handleCheckMatch(resume);
                              }}
                              disabled={isCalculating === resume.id}
                            >
                              {isCalculating === resume.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3" />
                              )}
                            </Button>
                            <Link href={`/dashboard/candidates/${resume.id}`}>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleDownload(resume.downloadUrl)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
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
                            {resume.parsedContent?.experiences?.[0] && (
                              <div>
                                <div className="text-sm font-medium mb-2">Current Position</div>
                                <div className="space-y-1">
                                  <div className="text-sm">{resume.parsedContent.experiences[0].title}</div>
                                  <div className="text-sm text-muted-foreground">{resume.parsedContent.experiences[0].company}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatDate(resume.parsedContent.experiences[0].starts_at)} - 
                                    {resume.parsedContent.experiences[0].ends_at ? formatDate(resume.parsedContent.experiences[0].ends_at) : 'Present'}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Skills with Experience */}
                            <div>
                              <div className="text-sm font-medium mb-2">Skills & Experience</div>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.values(resume.parsedContent?.skills_with_yoe || {}).map((skill: any) => (
                                  <div 
                                    key={skill.name} 
                                    className="flex items-center justify-between text-sm p-2 bg-white rounded border"
                                  >
                                    <span>{skill.name}</span>
                                    <span className="text-xs text-muted-foreground">{skill.yoe}y</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Education */}
                            {resume.parsedContent?.education?.length > 0 && (
                              <div>
                                <div className="text-sm font-medium mb-2">Education</div>
                                <div className="space-y-2">
                                  {resume.parsedContent.education.map((edu: any, index: number) => (
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
                                {resume.parsedContent?.personal_emails?.map((email: string, index: number) => (
                                  <div key={index} className="text-sm flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span>{email}</span>
                                  </div>
                                ))}
                                {resume.parsedContent?.personal_numbers?.map((phone: string, index: number) => (
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
                                    <span className="font-medium">{resume.scores?.skillsScore?.toFixed(1)}/10</span>
                                  </div>
                                  <Progress value={resume.scores?.skillsScore * 10} className="h-2" />
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {resume.scores?.analysis?.skillsAnalysis}
                                  </div>
                                </div>

                                {/* Experience Score */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Experience Match</span>
                                    <span className="font-medium">{resume.scores?.experienceScore?.toFixed(1)}/10</span>
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
                                    <span className="font-medium">{resume.scores?.educationScore?.toFixed(1)}/10</span>
                                  </div>
                                  <Progress value={resume.scores?.educationScore * 10} className="h-2" />
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {resume.scores?.analysis?.educationAnalysis}
                                  </div>
                                </div>

                                {/* Role Match Score */}
                                {resume.scores?.roleMatchScore && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>Role Fit</span>
                                      <span className="font-medium">{resume.scores.roleMatchScore.toFixed(1)}/10</span>
                                    </div>
                                    <Progress value={resume.scores.roleMatchScore * 10} className="h-2" />
                                  </div>
                                )}
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

                              {/* Strengths and Improvements */}
                              <div className="grid grid-cols-2 gap-4">
                                {/* Strengths */}
                                <div>
                                  <div className="text-sm font-medium text-green-600 mb-1">Key Strengths</div>
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
                            {resume.scores?.lastUpdated && (
                              <div className="text-xs text-muted-foreground mt-2">
                                Last analyzed: {new Date(resume.scores.lastUpdated).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

            {/* Loading indicator */}
            <div ref={ref} className="py-4 flex justify-center">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading more candidates...
                </div>
              )}
            </div>
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