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
import { collection, query, orderBy, limit, getDocs, startAfter, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { scoreResume } from "@/lib/ai/resume-scorer";
import { toast } from "@/hooks/use-toast";
import { Job } from "@/app/types/job";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

export function CandidateListView({ 
  initialResumes, 
  jobId, 
  jobTitle,
  userId,
  jobDescription,
  requiredSkills,
  requirements,
  showFiltersDefault = false
}: CandidateListViewProps) {
  const [resumes, setResumes] = useState(initialResumes);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    matchScore: [0, 10],
    skills: [],
    experiences: 'any',
    location: 'any',
    showFilters: showFiltersDefault
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [showDescription, setShowDescription] = useState(false);
  const [showCheckMatch, setShowCheckMatch] = useState(false);
  const [isCalculating, setIsCalculating] = useState<string | null>(null);
  const [showJobDescription, setShowJobDescription] = useState(false);
  const [formattedDates, setFormattedDates] = useState<{[key: string]: string}>({});
  const datesNeedUpdate = useRef(true);

  const calculateTotalYears = (resume: Resume) => {
    return Math.floor((resume.parsedContent?.total_experience_in_months || 0) / 12);
  };

  // Move filtered resumes to useMemo
  const filteredResumes = useMemo(() => {
    return resumes.filter(resume => {
      try {
        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const fullName = resume.parsedContent?.full_name?.toLowerCase() || '';
          const occupation = resume.parsedContent?.occupation?.toLowerCase() || '';
          const role = resume.parsedContent?.role?.toLowerCase() || '';
          const skills = resume.parsedContent?.skills?.join(' ').toLowerCase() || '';
          
          if (!fullName.includes(searchLower) && 
              !occupation.includes(searchLower) && 
              !role.includes(searchLower) && 
              !skills.includes(searchLower)) {
            return false;
          }
        }

        // Match score filter
        if (filters.matchScore) {
          const score = resume.scores?.averageScore || 0;
          if (score < filters.matchScore[0] || score > filters.matchScore[1]) {
            return false;
          }
        }

        // Skills filter
        if (filters.skills.length > 0) {
          // Safely get all possible skills from the resume
          const candidateSkills = [
            ...(resume.parsedContent?.skills || []),
            ...(resume.parsedContent?.experiences?.flatMap(exp => exp?.technologies || []) || []),
            ...(resume.parsedContent?.skills_with_yoe?.map(s => s.skill) || [])
          ].map(s => s.toLowerCase());

          // If no skills found at all, return false
          if (candidateSkills.length === 0) return false;

          const requiredSkills = filters.skills.map(s => s.toLowerCase());
          
          // Check if candidate has all selected required skills
          if (!requiredSkills.every(skill => 
            candidateSkills.some(candidateSkill => 
              candidateSkill.includes(skill) || skill.includes(candidateSkill)
            )
          )) {
            return false;
          }
        }

        // experiences filter
        if (filters.experiences !== 'any') {
          const totalYears = calculateTotalYears(resume);
          
          switch (filters.experiences) {
            case 'entry':
              if (totalYears > 2) return false;
              break;
            case 'mid':
              if (totalYears < 2 || totalYears > 5) return false;
              break;
            case 'senior':
              if (totalYears < 5 || totalYears > 8) return false;
              break;
            case 'lead':
              if (totalYears < 8) return false;
              break;
          }
        }

        // Location filter
        if (filters.location !== 'any') {
          const location = resume.parsedContent?.experiences?.[0]?.location?.toLowerCase() || '';
          const workType = resume.parsedContent?.work_type?.toLowerCase() || '';
          
          switch (filters.location) {
            case 'remote':
              if (!location.includes('remote') && !workType.includes('remote')) return false;
              break;
            case 'onsite':
              if (location.includes('remote') || workType.includes('remote')) return false;
              break;
            case 'hybrid':
              if (!location.includes('hybrid') && !workType.includes('hybrid')) return false;
              break;
          }
        }

        return true;
      } catch (error) {
        console.error('Error filtering resume:', error);
        return true;
      }
    });
  }, [resumes, filters]); // Only recompute when resumes or filters change

  // Update the dates effect
  useEffect(() => {
    if (!datesNeedUpdate.current) return;
    
    const dates: {[key: string]: string} = {};
    filteredResumes.forEach(resume => {
      dates[resume.id] = getRelativeTimeString(resume.createdAt);
    });
    setFormattedDates(dates);
    datesNeedUpdate.current = false;
  }, [filteredResumes]);

  // Reset the dates flag when resumes change
  useEffect(() => {
    datesNeedUpdate.current = true;
  }, [resumes]);

  // Infinite scroll setup
  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    const loadMoreResumes = async () => {
      if (!inView || !hasMore || isLoading) return;

      try {
        setIsLoading(true);
        
        const resumesRef = collection(db, 'users', userId, 'jobs', jobId, 'resumes');
        let resumesQuery = query(
          resumesRef,
          orderBy('createdAt', 'desc'),
          limit(CANDIDATES_PER_PAGE)
        );

        if (lastDoc) {
          resumesQuery = query(
            resumesRef,
            orderBy('createdAt', 'desc'),
            startAfter(lastDoc),
            limit(CANDIDATES_PER_PAGE)
          );
        }

        const snapshot = await getDocs(resumesQuery);
        
        if (snapshot.empty) {
          setHasMore(false);
          return;
        }

        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

        const newResumes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate().toISOString(),
        })) as Resume[];

        // Prevent duplicates by checking IDs
        setResumes(prev => {
          const existingIds = new Set(prev.map(r => r.id));
          const uniqueNewResumes = newResumes.filter(r => !existingIds.has(r.id));
          return [...prev, ...uniqueNewResumes];
        });
        
        if (snapshot.docs.length < CANDIDATES_PER_PAGE) {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error loading more resumes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMoreResumes();
  }, [inView, hasMore, isLoading, jobId, userId, lastDoc]);

  const getSkills = (resume: Resume) => {
    const skills = resume.parsedContent?.skills;
    if (!skills) return [];
    // Handle different possible formats
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') return skills.split(',').map(s => s.trim());
    return [];
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleDownload = (downloadUrl: string) => {
    window.open(downloadUrl, '_blank');
  };

  const handleCheckMatch = async (resume: Resume) => {
    try {
      setIsCalculating(resume.id);
      
      // Create proper job object structure matching what's expected by scoreResume
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
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
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
                {filteredResumes.length} candidates
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
              value={filters.search}
              onChange={(e) => handleFilterChange({ 
                ...filters, 
                search: e.target.value 
              })}
            />
          </div>
        </div>

        {/* Candidates List - Only scroll this section */}
        <div className="flex-1 overflow-auto">
          <div className="p-2 space-y-1">
            {filteredResumes
              .sort((a, b) => (b.scores?.averageScore || 0) - (a.scores?.averageScore || 0))
              .map((resume, index) => (
                <div key={`${resume.id}-${index}`}>
                  {/* Collapsed/Expanded View Combined */}
                  <div 
                    className={cn(
                      "bg-white rounded border transition-all duration-200 w-full",
                      expandedId === resume.id && "border-indigo-500 bg-slate-50",
                      index < 3 && "border-l-4",
                      index === 0 && "border-l-indigo-500",
                      index === 1 && "border-l-emerald-500",
                      index === 2 && "border-l-amber-500"
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
                          {index < 3 && (
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
                            <span>{formattedDates[resume.id] || ''}</span>
                          </div>
                          {resume.scores && (
                            <div className="col-span-2 space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Match Score</span>
                                <span>{resume.scores.overallScore}/10</span>
                              </div>
                              <Progress value={resume.scores.overallScore * 10} className="h-1" />
                            </div>
                          )}
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
                              <span>{formattedDates[resume.id] || ''}</span>
                            </div>
                          </div>

                          {/* Scores */}
                          {resume.scores && (
                            <div className="w-[120px] min-w-[120px]">
                              <div className="space-y-0.5">
                                <div className="flex justify-between text-xs">
                                  <span>Match Score</span>
                                  <span className={cn(
                                    index < 3 && "text-indigo-600"
                                  )}>{resume.scores.overallScore}/10</span>
                                </div>
                                <Progress value={resume.scores.overallScore * 10} className="h-1" />
                              </div>
                            </div>
                          )}

                          {/* Skills */}
                          <div className="flex-1 min-w-[200px]">
                            <div className="flex flex-wrap gap-1">
                              {(() => {
                                const skillsList = getSkills(resume);
                                const displaySkills = skillsList.slice(0, 3);
                                
                                return (
                                  <>
                                    {displaySkills.map(skill => (
                                      <Badge 
                                        key={`${resume.id}-${skill}`} 
                                        variant="secondary" 
                                        className="text-xs px-1.5 py-0"
                                      >
                                        {skill}
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
                      <div className="border-t px-3 py-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                          {/* Left Column */}
                          <div className="w-full lg:w-1/3 space-y-4">
                            {/* Contact Info */}
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              {resume.parsedContent?.personal_emails?.[0] && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {resume.parsedContent.personal_emails[0]}
                                </div>
                              )}
                              {resume.parsedContent?.personal_numbers?.[0] && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {resume.parsedContent.personal_numbers[0]}
                                </div>
                              )}
                            </div>

                            {/* Latest Experience */}
                            {resume.parsedContent?.experiences?.[0] && (
                              <div className="text-sm">
                                <div className="font-medium">Latest Experience</div>
                                <div className="text-muted-foreground">
                                  {resume.parsedContent.experiences[0].title} at {resume.parsedContent.experiences[0].company}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {resume.parsedContent.experiences[0].location}
                                  {resume.parsedContent.experiences[0].starts_at && (
                                    <> • {formatDate(resume.parsedContent.experiences[0].starts_at)} - {
                                      resume.parsedContent.experiences[0].ends_at 
                                        ? formatDate(resume.parsedContent.experiences[0].ends_at)
                                        : 'Present'
                                    }</>
                                  )}
                                </div>
                                {resume.parsedContent.experiences[0].technologies?.length > 0 && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Technologies: {resume.parsedContent.experiences[0].technologies.join(', ')}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Right Column - All Scores */}
                          {resume.scores && (
                            <div className="w-full lg:w-2/3 space-y-3">
                              {/* Main Scores */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Overall Match</span>
                                    <span className="font-medium">{resume.scores.overallScore}/10</span>
                                  </div>
                                  <Progress value={resume.scores.overallScore * 10} className="h-1" />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Skills Match</span>
                                    <span>{resume.scores.skillsScore}/10</span>
                                  </div>
                                  <Progress value={resume.scores.skillsScore * 10} className="h-1" />
                                </div>
                              </div>

                              {/* Detailed Scores */}
                              <div className="space-y-2">
                                <div className="text-xs font-medium">Detailed Scores</div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {/* experiences Score */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span>experiences</span>
                                      <span>{resume.scores.experienceScore}/10</span>
                                    </div>
                                    <Progress value={resume.scores.experienceScore * 10} className="h-1" />
                                  </div>

                                  {/* Education Score */}
                                  {resume.scores.educationScore && (
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span>Education</span>
                                        <span>{resume.scores.educationScore}/10</span>
                                      </div>
                                      <Progress value={resume.scores.educationScore * 10} className="h-1" />
                                    </div>
                                  )}

                                  {/* Technical Match */}
                                  {resume.scores.technicalScore && (
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span>Technical</span>
                                        <span>{resume.scores.technicalScore}/10</span>
                                      </div>
                                      <Progress value={resume.scores.technicalScore * 10} className="h-1" />
                                    </div>
                                  )}

                                  {/* Role Alignment */}
                                  {resume.scores.roleAlignmentScore && (
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span>Role Fit</span>
                                        <span>{resume.scores.roleAlignmentScore}/10</span>
                                      </div>
                                      <Progress value={resume.scores.roleAlignmentScore * 10} className="h-1" />
                                    </div>
                                  )}

                                  {/* Industry Knowledge */}
                                  {resume.scores.industryKnowledgeScore && (
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span>Industry</span>
                                        <span>{resume.scores.industryKnowledgeScore}/10</span>
                                      </div>
                                      <Progress value={resume.scores.industryKnowledgeScore * 10} className="h-1" />
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Analysis Summary */}
                              {resume.scores.analysis && (
                                <div className="space-y-2">
                                  <div className="text-xs font-medium">Analysis</div>
                                  <div className="text-xs text-muted-foreground space-y-1">
                                    <p>{resume.scores.analysis.overallFeedback}</p>
                                    {resume.scores.analysis.strengthAreas?.length > 0 && (
                                      <p className="text-green-600">
                                        Strengths: {resume.scores.analysis.strengthAreas.join(', ')}
                                      </p>
                                    )}
                                    {resume.scores.analysis.improvementAreas?.length > 0 && (
                                      <p className="text-amber-600">
                                        Areas for improvement: {resume.scores.analysis.improvementAreas.join(', ')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

            {/* Loading indicator */}
            <div ref={ref} className="py-4 flex justify-center">
              {isLoading && (
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