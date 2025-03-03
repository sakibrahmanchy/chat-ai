'use client';

import { useState, useEffect, useMemo } from "react";
import { Education, Resume, SkillsWithYoe } from "@/app/types/resume";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CandidateFilters } from "./candidate-filters";
import {
  Star,
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
  Sparkles,
  Info,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useInView } from 'react-intersection-observer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { scoreResume } from "@/lib/ai/resume-scorer";
import { useToast } from "@/hooks/use-toast";
import { resumeSearch } from '@/lib/services/resume-search.service';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AddToListDialog } from "./add-to-list-dialog";
import { useCompany } from "@/hooks/use-company";
import { exportData } from '@/lib/utils/export';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { listService } from "@/lib/services/list.service";
import { CandidateBulkActions } from "./candidate-bulk-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmailCandidatesDialog } from "./email-candidates-dialog";

interface CandidateListViewProps {
  initialResumes: Resume[];
  jobId: string;
  jobTitle: string;
  userId: string;
  jobDescription: string;
  requiredSkills: string[];
  requirements: string;
  responsibilities: string;
  showFiltersDefault: boolean;
  initialFilters?: {
    search?: string;
    skills?: string[];
    experienceLevel?: string;
    matchScore?: [number, number];
  };
  skipDataFetch?: boolean;
}

const getMatchScore = (resume: Resume) => {
  return resume?.overall_score || 0;
};

export function CandidateListView({
  initialResumes,
  jobId,
  jobTitle,
  userId,
  jobDescription,
  requiredSkills,
  requirements,
  responsibilities,
  showFiltersDefault = false,
  initialFilters,
  skipDataFetch = false,
}: CandidateListViewProps) {
  const [resumes, setResumes] = useState<Resume[]>(initialResumes);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadingScores, setLoadingScores] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const { companyId, companyName } = useCompany();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');

  // Update the filters state with more sensible defaults
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  // Load available locations when component mounts
  useEffect(() => {
    if (userId && jobId) {
      resumeSearch.getUniqueLocations(jobId).then(locations => {
        setAvailableLocations(locations);
      });
    }
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

  const { inView } = useInView({
    threshold: 0,
  });

  const [activeTab, setActiveTab] = useState('all');

  // Add this after the existing state declarations
  const [selectedTab, setSelectedTab] = useState('all');

  // Add this function to get filtered candidates based on tab
  const getTabCandidates = (tab: string) => {
    switch (tab) {
      case 'pending':
        return resumes.filter(r => !r.job_resume_matches?.[0]?.status);
      case 'shortlisted':
        return resumes.filter(r => r.job_resume_matches?.[0]?.status === 'accepted');
      case 'rejected':
        return resumes.filter(r => r.job_resume_matches?.[0]?.status === 'rejected');
      default:
        return resumes;
    }
  };

  const loadInitialData = async (status?: string) => {
    if (skipDataFetch) return;

    setLoading(true);
    try {
      const searchFilters = {
        searchTerm: filters.searchTerm || '',
        skills: filters.skills,
        status: status, // Add status to filters
        location: filters.location === 'all' ? undefined : filters.location,
        experienceMonths: filters.experienceMonths,
        scoreRange: filters.scoreRange,
        showFilters: filters.showFilters,
        matchType: filters.matchType,
        sortBy: filters.sortBy
      };

      const result = await resumeSearch.searchResumes(jobId, searchFilters);
      setResumes(result.resumes);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Modified score calculation function
  const handleCalculateScore = async (resume: Resume) => {
    try {
      setLoadingScores(prev => ({ ...prev, [resume.id]: true }));

      // Only pass IDs to scoring function
      await scoreResume(resume.id, jobId, companyId);

      loadInitialData();

      toast({
        title: "Success",
        description: "Match score updated successfully",
      });
    } catch (error) {
      console.error('Error calculating score:', error);
      toast({
        title: "Error",
        description: "Failed to update match score: " + error,
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
  }, [inView, loading]);

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
        skills.some(skill => (skill || '').includes(searchLower)) ||
        content.includes(searchLower);
    });
  }, [resumes, searchTerm]);

  // UI state
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  const handleExport = async (format: 'csv' | 'excel') => {
    const exportColumns = [
      { header: 'Name', key: 'name' },
      { header: 'Role', key: 'role' },
      { header: 'Email', key: 'email' },
      { header: 'Phone', key: 'phone' },
      { header: 'Location', key: 'location' },
      { header: 'Experience', key: 'experience' },
      { header: 'Current Company', key: 'company' },
      { header: 'Education', key: 'education' },
      { header: 'Match Score', key: 'score' },
      { header: 'Skills', key: 'skills' },
      { header: 'Status', key: 'status' }
    ];

    const dataToExport = filteredResumes.map(candidate => ({
      ...candidate,
      skills: candidate.searchable_skills.join(', '),
      score: `${Math.round(candidate.scores?.overallScore * 10)}%`
    }));

    await exportData(dataToExport, {
      filename: `candidates-${new Date().toISOString().split('T')[0]}`,
      format,
      columns: exportColumns
    });
  };

  const handleAccept = async (candidateId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the row click
    try {
      await listService.approveCandidate(candidateId, jobId);
      toast({
        title: "Candidate Shortlisted",
        description: "Candidate has been added to the shortlist",
      });
      loadInitialData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to shortlist candidate",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (candidateId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the row click
    try {
      await listService.rejectCandidate(candidateId, jobId);
      toast({
        title: "Candidate Rejected",
        description: "Candidate has been added to the rejected list",
      });
      loadInitialData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject candidate",
        variant: "destructive",
      });
    }
  };

  // Add state for selected candidates
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  // Get shortlisted and rejected candidates
  const shortlistedCandidates = resumes.filter(c => c.lists?.includes('Shortlisted'));
  const rejectedCandidates = resumes.filter(c => c.lists?.includes('Rejected'));

  const handleSelectCandidate = (candidateId: string, checked: boolean) => {
    setSelectedCandidates(prev =>
      checked
        ? [...prev, candidateId]
        : prev.filter(id => id !== candidateId)
    );
  };

  // Modify the handleSelectAll function
  const handleSelectAll = (checked: boolean) => {
    const tabCandidates = getTabCandidates(selectedTab);
    setSelectedCandidates(checked ? tabCandidates.map(c => c.id.toString()) : []);
  };

  const handleBulkAccept = async () => {
    try {
      setLoading(true);
      await Promise.all(
        selectedCandidates.map(id =>
          listService.approveCandidate(id, jobId)
        )
      );
      loadInitialData();
      toast({
        title: "Candidates Shortlisted",
        description: `${selectedCandidates.length} candidates have been shortlisted`,
      });
      setSelectedCandidates([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to shortlist candidates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkReject = async () => {
    try {
      await Promise.all(
        selectedCandidates.map(id =>
          listService.rejectCandidate(id, jobId)
        )
      );
      toast({
        title: "Candidates Rejected",
        description: `${selectedCandidates.length} candidates have been rejected`,
      });
      setSelectedCandidates([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject candidates",
        variant: "destructive",
      });
    }
  };


  const candidateStatus = (resume: Resume) => {
    if (resume.job_resume_matches && resume.job_resume_matches.length > 0) {
      return resume.job_resume_matches[0].status;
    }
    return 'pending';
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const status = value === 'all' ? undefined :
      value === 'shortlisted' ? 'accepted' :
        value === 'rejected' ? 'rejected' : '';
    loadInitialData(status);
  };

  // Modify the TabsList section to track selected tab
  const tabsList = (
    <div className="bg-white px-4">
      <TabsList>
        <TabsTrigger value="all" onClick={() => setSelectedTab('all')}>
          All Candidates
          <Badge variant="secondary" className="ml-2">
            {resumes.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="pending" onClick={() => setSelectedTab('pending')}>
          Pending Review
          <Badge variant="secondary" className="ml-2">
            {resumes.filter(r => !r.job_resume_matches?.[0]?.status).length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="shortlisted" onClick={() => setSelectedTab('shortlisted')}>
          Shortlisted
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
            {resumes.filter(r => r.job_resume_matches?.[0]?.status === 'accepted').length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="rejected" onClick={() => setSelectedTab('rejected')}>
          Rejected
          <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
            {resumes.filter(r => r.job_resume_matches?.[0]?.status === 'rejected').length}
          </Badge>
        </TabsTrigger>
      </TabsList>
    </div>
  );

  // Modify the bulk actions header to show correct count and use filtered candidates
  const bulkActionsHeader = (
    <div className="bg-white">
      <div className="flex items-center justify-between bg-white p-4 border mb-4 rounded-lg">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectedCandidates.length === getTabCandidates(selectedTab).length}
            onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
          />
          <span className="text-sm text-muted-foreground">
            {selectedCandidates.length} selected
          </span>
        </div>

        {selectedCandidates.length > 0 && (
          <div className="flex gap-2">
            <EmailCandidatesDialog
              candidates={resumes.filter(r => selectedCandidates.includes(r.id.toString()))}
              jobTitle={jobTitle}
              companyName={companyName}
              companyId={companyId || ''}
              jobId={jobId}
            />
            {selectedTab !== 'shortlisted' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkAccept}
                className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
              >
                <Check className="h-4 w-4 mr-2" />
                Shortlist Selected
              </Button>
            )}
            {selectedTab !== 'rejected' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkReject}
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
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* Filters sidebar */}
      {filters.showFilters && (
        <div className="w-[300px] border-r bg-white p-4 overflow-y-auto">
          <div className="flex items-center justify-between p-4">
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

      {/* Main content area - flex column to allow proper content scrolling */}
      <div className="flex-1 flex flex-col min-h-0"> {/* Add min-h-0 to allow proper flex behavior */}
        {/* Fixed header section */}
        <div className="bg-white p-4">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

        {/* Tabs container - flex column for proper tab content scrolling */}
        <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0"> {/* Add min-h-0 */}
          {/* Fixed tabs header */}
          {tabsList}

          {/* Scrollable tab content */}
          <TabsContent
            value="all"
            className="flex-1 overflow-y-auto m-0" // Remove padding here
          >
            <div className="p-4 space-y-4"> {/* Add padding to inner container */}
              {/* Bulk actions header - will scroll with content */}
              {bulkActionsHeader}

              {/* Candidates list */}
              <div className="space-y-2">
                {resumes.map((resume) => (
                  <div key={resume.id}>
                    {/* Collapsed/Expanded View Combined */}

                    <div
                      className={cn(
                        "bg-white rounded border transition-all duration-200 w-full",
                        expandedId === resume.id && "border-indigo-500 bg-slate-50",
                        resumes.indexOf(resume) < 3 && "border-l-4",
                        resumes.indexOf(resume) === 0 && "border-l-indigo-500",
                        resumes.indexOf(resume) === 1 && "border-l-emerald-500",
                        resumes.indexOf(resume) === 2 && "border-l-amber-500",
                        candidateStatus(resume) === 'accepted' && "bg-green-50",
                        candidateStatus(resume) === 'rejected' && "bg-red-50"
                      )}
                    >
                      {/* Main Row - Always Visible */}
                      <div
                        className="p-3 cursor-pointer w-full"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
                          {/* Basic Info */}
                          <Checkbox
                            checked={selectedCandidates.includes(resume.id)}
                            onCheckedChange={(checked) => handleSelectCandidate(resume.id, checked as boolean)}
                          />
                          <div className="flex sm:flex-row items-center gap-2 w-full sm:w-[200px] sm:min-w-[200px]" onClick={() => setExpandedId(expandedId === resume.id ? null : resume.id)}>
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
                          <div className="grid grid-cols-2 gap-2 w-full sm:hidden  mt-2">
                            {/* <div className="flex">
                              <div className="text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {getLocation(resume)}
                              </div>
                              <div className="flex gaps-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{Math.floor(resume.experience_months / 12) + 'y' || "Not specified"}</span>
                              </div>
                            </div> */}
                            <div className="col-span-2 space-y-1" onClick={() => setExpandedId(expandedId === resume.id ? null : resume.id)}>
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
                            <div className="hidden lg:flex min-w-[200px]">
                              <div className="flex flex-wrap gap-1 max-w-[300px]">
                                {resume.searchable_skills?.slice(0, 3).map((skill, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0 truncate max-w-[150px]"
                                    title={skill}
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                                {(resume.searchable_skills?.length || 0) > 3 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1.5 py-0"
                                  >
                                    +{(resume.searchable_skills?.length || 0) - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title="Check Match Score (Requires 1 credit)"
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
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDownload(resume.metadata.file_url);
                                }}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <AddToListDialog
                                resumeId={resume.id}
                                userId={userId}
                                companyId={companyId || ''}
                                jobId={jobId}
                                onSuccess={() => {
                                  toast({
                                    title: "Success",
                                    description: "Candidate added to list successfully"
                                  });
                                }}
                              />
                              {resume.job_resume_matches && resume.job_resume_matches.length > 0 ? (
                                <Badge variant="outline" className="text-xs px-1.5 py-0">
                                  {resume.job_resume_matches[0].status === 'accepted' ? <span className="text-green-600">Shortlisted</span> : <span className="text-red-600">Rejected</span>}
                                </Badge>
                              ) : (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                      "shrink-0",
                                      resume.lists?.includes('Shortlisted') && "bg-green-50 border-green-200 text-green-600"
                                    )}
                                    onClick={(e) => handleAccept(resume.id, e)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                      "shrink-0",
                                      resume.lists?.includes('Rejected') && "bg-red-50 border-red-200 text-red-600"
                                    )}
                                    onClick={(e) => handleReject(resume.id, e)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
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
                                <div className="text-sm font-medium mb-2 ">Skills & Experience</div>
                                <div className="flex flex-wrap gap-2">
                                  {Object.values(resume.parsed_content?.skills_with_yoe || {}).map((skill: SkillsWithYoe) => (
                                    <div
                                      key={skill.name}
                                      className="flex text-sm gap-2"
                                    >
                                      <Badge className="flex gap-1">
                                        <span>{skill.name}</span> |
                                        {skill.yoe && <span >{skill.yoe}y</span>}
                                      </Badge>
                                      {/* {skill.yoe && <span >| {skill.yoe}y</span>} */}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Education */}
                              {resume.parsed_content?.education?.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-2">Education</div>
                                  <div className="space-y-2">
                                    {resume.parsed_content.education.map((edu: Education, index: number) => (
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
                                      <span className="font-medium">{(resume.scores?.skills_score || 0).toFixed(1)}/10</span>
                                    </div>
                                    <Progress value={resume.scores?.skills_score * 10} className="h-2" />
                                  </div>

                                  {/* Experience Score */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>Experience Match</span>
                                      <span className="font-medium">{(resume.scores?.experience_score || 0)?.toFixed(1)}/10</span>
                                    </div>
                                    <Progress value={resume.scores?.experience_score * 10} className="h-2" />
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {resume.scores?.analysis?.experience_analysis}
                                    </div>
                                  </div>

                                  {/* Education Score */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>Education Match</span>
                                      <span className="font-medium">{(resume.scores?.education_score || 0)?.toFixed(1)}/10</span>
                                    </div>
                                    <Progress value={resume.scores?.education_score * 10} className="h-2" />
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {resume.scores?.analysis?.education_analysis}
                                    </div>
                                  </div>

                                  {/* Role Match Score */}
                                  {/* {resume.scores?.roleMatchScore && ( */}
                                  {/* <div className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span>Role Fit</span>
                                        <span className="font-medium">{(resume?.scores?.roleMatchScore || 0)?.toFixed(1)}/10</span>
                                      </div>
                                      <Progress value={resume?.scores?.roleMatchScore  || 0 * 10} className="h-2" />
                                    </div> */}
                                  {/* )} */}
                                </div>
                              </div>

                              {/* Detailed Analysis */}
                              <div className="space-y-4">
                                {/* Overall Feedback */}
                                {resume.scores?.analysis?.education_analysis && (
                                  <div>
                                    <div className="text-sm font-medium mb-1">Overall Analysis</div>
                                    <p className="text-sm text-muted-foreground">
                                      {resume.scores.analysis.education_analysis}
                                    </p>
                                  </div>
                                )}

                                {/* Skill Analysis */}
                                <div className="flex flex-col gap-2">


                                  <div className="flex flex-row justify-evenly">
                                    <div className="flex-1">
                                      <h3 className="font-semibold">Matching Skills</h3>
                                      <div className="flex flex-wrap gap-1.5">
                                        {resume?.scores?.analysis?.matched_skills?.length > 0 ? (
                                          resume?.scores?.analysis?.matched_skills?.map((skill, index) => (
                                            <Badge
                                              key={index}
                                              variant="secondary"
                                              className="text-sm px-2 py-0.5"
                                              title={skill}
                                            >
                                              {skill}
                                            </Badge>
                                          ))) : (
                                          <p className="text-xs text-muted-foreground">No matching skills</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-semibold">Missing Skills</h3>
                                      <div className="flex flex-wrap gap-1.5">
                                        {resume?.scores?.analysis?.missing_skills?.length > 0 ? (
                                          resume?.scores?.analysis?.missing_skills?.map((skill, index) => (
                                            <Badge
                                              key={index}
                                              variant="secondary"
                                              className="text-sm px-2 py-0.5"
                                              title={skill}
                                            >
                                              {skill}
                                            </Badge>
                                          ))) : (
                                          <p className="text-xs text-muted-foreground">No missing skills</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* strengthAreas and improvementAreas */}
                                <div className="grid grid-cols-2 gap-4">
                                  {/* strengthAreas */}
                                  <div>
                                    <div className="text-sm font-medium text-green-600 mb-1">Key strength areas</div>
                                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                      {resume.scores?.analysis?.strengths?.map((strength: string, index: number) => (
                                        <li key={index}>{strength}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Areas for Improvement */}
                                  <div>
                                    <div className="text-sm font-medium text-amber-600 mb-1">Areas for Improvement</div>
                                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                      {resume.scores?.analysis?.weaknesses?.map((area: string, index: number) => (
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
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="pending"
            className="flex-1 overflow-y-auto m-0"
          >
            <div className="p-4 space-y-4">
              {resumes
                .filter(r => !r.job_resume_matches?.[0]?.status)
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
                        resumes.indexOf(resume) === 2 && "border-l-amber-500",
                        candidateStatus(resume) === 'accepted' && "bg-green-50",
                        candidateStatus(resume) === 'rejected' && "bg-red-50"
                      )}
                    >
                      {/* Main Row - Always Visible */}
                      <div
                        className="p-3 cursor-pointer w-full"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
                          {/* Basic Info */}
                          <div className="flex sm:flex-row items-center gap-2 w-full sm:w-[200px] sm:min-w-[200px]" onClick={() => setExpandedId(expandedId === resume.id ? null : resume.id)}>
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
                          <div className="grid grid-cols-2 gap-2 w-full sm:hidden  mt-2">
                            {/* <div className="flex">
                              <div className="text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {getLocation(resume)}
                              </div>
                              <div className="flex gaps-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{Math.floor(resume.experience_months / 12) + 'y' || "Not specified"}</span>
                              </div>
                            </div> */}
                            <div className="col-span-2 space-y-1" onClick={() => setExpandedId(expandedId === resume.id ? null : resume.id)}>
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
                            <div className="hidden lg:flex min-w-[200px]">
                              <div className="flex flex-wrap gap-1 max-w-[300px]">
                                {resume.searchable_skills?.slice(0, 3).map((skill, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0 truncate max-w-[150px]"
                                    title={skill}
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                                {(resume.searchable_skills?.length || 0) > 3 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1.5 py-0"
                                  >
                                    +{(resume.searchable_skills?.length || 0) - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title="Check Match Score (Requires 1 credit)"
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
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDownload(resume.metadata.file_url);
                                }}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <AddToListDialog
                                resumeId={resume.id}
                                userId={userId}
                                companyId={companyId || ''}
                                jobId={jobId}
                                onSuccess={() => {
                                  toast({
                                    title: "Success",
                                    description: "Candidate added to list successfully"
                                  });
                                }}
                              />
                              {resume.job_resume_matches && resume.job_resume_matches.length > 0 ? (
                                <Badge variant="outline" className="text-xs px-1.5 py-0">
                                  {resume.job_resume_matches[0].status === 'accepted' ? <span className="text-green-600">Shortlisted</span> : <span className="text-red-600">Rejected</span>}
                                </Badge>
                              ) : (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                      "shrink-0",
                                      resume.lists?.includes('Shortlisted') && "bg-green-50 border-green-200 text-green-600"
                                    )}
                                    onClick={(e) => handleAccept(resume.id, e)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                      "shrink-0",
                                      resume.lists?.includes('Rejected') && "bg-red-50 border-red-200 text-red-600"
                                    )}
                                    onClick={(e) => handleReject(resume.id, e)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
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
                                <div className="text-sm font-medium mb-2 ">Skills & Experience</div>
                                <div className="flex flex-wrap gap-2">
                                  {Object.values(resume.parsed_content?.skills_with_yoe || {}).map((skill: SkillsWithYoe) => (
                                    <div
                                      key={skill.name}
                                      className="flex text-sm gap-2"
                                    >
                                      <Badge className="flex gap-1">
                                        <span>{skill.name}</span> |
                                        {skill.yoe && <span >{skill.yoe}y</span>}
                                      </Badge>
                                      {/* {skill.yoe && <span >| {skill.yoe}y</span>} */}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Education */}
                              {resume.parsed_content?.education?.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-2">Education</div>
                                  <div className="space-y-2">
                                    {resume.parsed_content.education.map((edu: Education, index: number) => (
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
                                      <span className="font-medium">{(resume.scores?.skills_score || 0).toFixed(1)}/10</span>
                                    </div>
                                    <Progress value={resume.scores?.skills_score * 10} className="h-2" />
                                  </div>

                                  {/* Experience Score */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>Experience Match</span>
                                      <span className="font-medium">{(resume.scores?.experience_score || 0)?.toFixed(1)}/10</span>
                                    </div>
                                    <Progress value={resume.scores?.experience_score * 10} className="h-2" />
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {resume.scores?.analysis?.experience_analysis}
                                    </div>
                                  </div>

                                  {/* Education Score */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>Education Match</span>
                                      <span className="font-medium">{(resume.scores?.education_score || 0)?.toFixed(1)}/10</span>
                                    </div>
                                    <Progress value={resume.scores?.education_score * 10} className="h-2" />
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {resume.scores?.analysis?.education_analysis}
                                    </div>
                                  </div>

                                  {/* Role Match Score */}
                                  {/* {resume.scores?.roleMatchScore && ( */}
                                  {/* <div className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span>Role Fit</span>
                                        <span className="font-medium">{(resume?.scores?.roleMatchScore || 0)?.toFixed(1)}/10</span>
                                      </div>
                                      <Progress value={resume?.scores?.roleMatchScore  || 0 * 10} className="h-2" />
                                    </div> */}
                                  {/* )} */}
                                </div>
                              </div>

                              {/* Detailed Analysis */}
                              <div className="space-y-4">
                                {/* Overall Feedback */}
                                {resume.scores?.analysis?.education_analysis && (
                                  <div>
                                    <div className="text-sm font-medium mb-1">Overall Analysis</div>
                                    <p className="text-sm text-muted-foreground">
                                      {resume.scores.analysis.education_analysis}
                                    </p>
                                  </div>
                                )}

                                {/* Skill Analysis */}
                                <div className="flex flex-col gap-2">


                                  <div className="flex flex-row justify-evenly">
                                    <div className="flex-1">
                                      <h3 className="font-semibold">Matching Skills</h3>
                                      <div className="flex flex-wrap gap-1.5">
                                        {resume?.scores?.analysis?.matched_skills?.length > 0 ? (
                                          resume?.scores?.analysis?.matched_skills?.map((skill, index) => (
                                            <Badge
                                              key={index}
                                              variant="secondary"
                                              className="text-sm px-2 py-0.5"
                                              title={skill}
                                            >
                                              {skill}
                                            </Badge>
                                          ))) : (
                                          <p className="text-xs text-muted-foreground">No matching skills</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-semibold">Missing Skills</h3>
                                      <div className="flex flex-wrap gap-1.5">
                                        {resume?.scores?.analysis?.missing_skills?.length > 0 ? (
                                          resume?.scores?.analysis?.missing_skills?.map((skill, index) => (
                                            <Badge
                                              key={index}
                                              variant="secondary"
                                              className="text-sm px-2 py-0.5"
                                              title={skill}
                                            >
                                              {skill}
                                            </Badge>
                                          ))) : (
                                          <p className="text-xs text-muted-foreground">No missing skills</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* strengthAreas and improvementAreas */}
                                <div className="grid grid-cols-2 gap-4">
                                  {/* strengthAreas */}
                                  <div>
                                    <div className="text-sm font-medium text-green-600 mb-1">Key strength areas</div>
                                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                      {resume.scores?.analysis?.strengths?.map((strength: string, index: number) => (
                                        <li key={index}>{strength}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Areas for Improvement */}
                                  <div>
                                    <div className="text-sm font-medium text-amber-600 mb-1">Areas for Improvement</div>
                                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                      {resume.scores?.analysis?.weaknesses?.map((area: string, index: number) => (
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
            </div>
          </TabsContent>

          <TabsContent
            value="shortlisted"
            className="flex-1 overflow-y-auto m-0"
          >
            <div className="p-4 space-y-4">
              {resumes
                .filter(r => r.job_resume_matches?.[0]?.status === 'accepted')
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
                        resumes.indexOf(resume) === 2 && "border-l-amber-500",
                        candidateStatus(resume) === 'accepted' && "bg-green-50",
                        candidateStatus(resume) === 'rejected' && "bg-red-50"
                      )}
                    >
                      {/* Main Row - Always Visible */}
                      <div
                        className="p-3 cursor-pointer w-full"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
                          {/* Basic Info */}
                          <div className="flex sm:flex-row items-center gap-2 w-full sm:w-[200px] sm:min-w-[200px]" onClick={() => setExpandedId(expandedId === resume.id ? null : resume.id)}>
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
                          <div className="grid grid-cols-2 gap-2 w-full sm:hidden  mt-2">
                            {/* <div className="flex">
                              <div className="text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {getLocation(resume)}
                              </div>
                              <div className="flex gaps-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{Math.floor(resume.experience_months / 12) + 'y' || "Not specified"}</span>
                              </div>
                            </div> */}
                            <div className="col-span-2 space-y-1" onClick={() => setExpandedId(expandedId === resume.id ? null : resume.id)}>
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
                            <div className="hidden lg:flex min-w-[200px]">
                              <div className="flex flex-wrap gap-1 max-w-[300px]">
                                {resume.searchable_skills?.slice(0, 3).map((skill, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0 truncate max-w-[150px]"
                                    title={skill}
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                                {(resume.searchable_skills?.length || 0) > 3 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1.5 py-0"
                                  >
                                    +{(resume.searchable_skills?.length || 0) - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title="Check Match Score (Requires 1 credit)"
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
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDownload(resume.metadata.file_url);
                                }}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <AddToListDialog
                                resumeId={resume.id}
                                userId={userId}
                                companyId={companyId || ''}
                                jobId={jobId}
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
                                <div className="text-sm font-medium mb-2 ">Skills & Experience</div>
                                <div className="flex flex-wrap gap-2">
                                  {Object.values(resume.parsed_content?.skills_with_yoe || {}).map((skill: SkillsWithYoe) => (
                                    <div
                                      key={skill.name}
                                      className="flex text-sm gap-2"
                                    >
                                      <Badge className="flex gap-1">
                                        <span>{skill.name}</span> |
                                        {skill.yoe && <span >{skill.yoe}y</span>}
                                      </Badge>
                                      {/* {skill.yoe && <span >| {skill.yoe}y</span>} */}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Education */}
                              {resume.parsed_content?.education?.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-2">Education</div>
                                  <div className="space-y-2">
                                    {resume.parsed_content.education.map((edu: Education, index: number) => (
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
                                      <span className="font-medium">{(resume.scores?.skills_score || 0).toFixed(1)}/10</span>
                                    </div>
                                    <Progress value={resume.scores?.skills_score * 10} className="h-2" />
                                  </div>

                                  {/* Experience Score */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>Experience Match</span>
                                      <span className="font-medium">{(resume.scores?.experience_score || 0)?.toFixed(1)}/10</span>
                                    </div>
                                    <Progress value={resume.scores?.experience_score * 10} className="h-2" />
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {resume.scores?.analysis?.experience_analysis}
                                    </div>
                                  </div>

                                  {/* Education Score */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>Education Match</span>
                                      <span className="font-medium">{(resume.scores?.education_score || 0)?.toFixed(1)}/10</span>
                                    </div>
                                    <Progress value={resume.scores?.education_score * 10} className="h-2" />
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {resume.scores?.analysis?.education_analysis}
                                    </div>
                                  </div>

                                  {/* Role Match Score */}
                                  {/* {resume.scores?.roleMatchScore && ( */}
                                  {/* <div className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span>Role Fit</span>
                                        <span className="font-medium">{(resume?.scores?.roleMatchScore || 0)?.toFixed(1)}/10</span>
                                      </div>
                                      <Progress value={resume?.scores?.roleMatchScore  || 0 * 10} className="h-2" />
                                    </div> */}
                                  {/* )} */}
                                </div>
                              </div>

                              {/* Detailed Analysis */}
                              <div className="space-y-4">
                                {/* Overall Feedback */}
                                {resume.scores?.analysis?.education_analysis && (
                                  <div>
                                    <div className="text-sm font-medium mb-1">Overall Analysis</div>
                                    <p className="text-sm text-muted-foreground">
                                      {resume.scores.analysis.education_analysis}
                                    </p>
                                  </div>
                                )}

                                {/* Skill Analysis */}
                                <div className="flex flex-col gap-2">


                                  <div className="flex flex-row justify-evenly">
                                    <div className="flex-1">
                                      <h3 className="font-semibold">Matching Skills</h3>
                                      <div className="flex flex-wrap gap-1.5">
                                        {resume?.scores?.analysis?.matched_skills?.length > 0 ? (
                                          resume?.scores?.analysis?.matched_skills?.map((skill, index) => (
                                            <Badge
                                              key={index}
                                              variant="secondary"
                                              className="text-sm px-2 py-0.5"
                                              title={skill}
                                            >
                                              {skill}
                                            </Badge>
                                          ))) : (
                                          <p className="text-xs text-muted-foreground">No matching skills</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-semibold">Missing Skills</h3>
                                      <div className="flex flex-wrap gap-1.5">
                                        {resume?.scores?.analysis?.missing_skills?.length > 0 ? (
                                          resume?.scores?.analysis?.missing_skills?.map((skill, index) => (
                                            <Badge
                                              key={index}
                                              variant="secondary"
                                              className="text-sm px-2 py-0.5"
                                              title={skill}
                                            >
                                              {skill}
                                            </Badge>
                                          ))) : (
                                          <p className="text-xs text-muted-foreground">No missing skills</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* strengthAreas and improvementAreas */}
                                <div className="grid grid-cols-2 gap-4">
                                  {/* strengthAreas */}
                                  <div>
                                    <div className="text-sm font-medium text-green-600 mb-1">Key strength areas</div>
                                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                      {resume.scores?.analysis?.strengths?.map((strength: string, index: number) => (
                                        <li key={index}>{strength}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Areas for Improvement */}
                                  <div>
                                    <div className="text-sm font-medium text-amber-600 mb-1">Areas for Improvement</div>
                                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                      {resume.scores?.analysis?.weaknesses?.map((area: string, index: number) => (
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
            </div>
          </TabsContent>

          <TabsContent
            value="rejected"
            className="flex-1 overflow-y-auto m-0"
          >
            <div className="p-4 space-y-4">
              {resumes
                .filter(r => r.job_resume_matches?.[0]?.status === 'rejected')
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
                        resumes.indexOf(resume) === 2 && "border-l-amber-500",
                        candidateStatus(resume) === 'accepted' && "bg-green-50",
                        candidateStatus(resume) === 'rejected' && "bg-red-50"
                      )}
                    >
                      {/* Main Row - Always Visible */}
                      <div
                        className="p-3 cursor-pointer w-full"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
                          {/* Basic Info */}
                          <div className="flex sm:flex-row items-center gap-2 w-full sm:w-[200px] sm:min-w-[200px]" onClick={() => setExpandedId(expandedId === resume.id ? null : resume.id)}>
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
                          <div className="grid grid-cols-2 gap-2 w-full sm:hidden  mt-2">
                            {/* <div className="flex">
                              <div className="text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {getLocation(resume)}
                              </div>
                              <div className="flex gaps-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{Math.floor(resume.experience_months / 12) + 'y' || "Not specified"}</span>
                              </div>
                            </div> */}
                            <div className="col-span-2 space-y-1" onClick={() => setExpandedId(expandedId === resume.id ? null : resume.id)}>
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
                            <div className="hidden lg:flex min-w-[200px]">
                              <div className="flex flex-wrap gap-1 max-w-[300px]">
                                {resume.searchable_skills?.slice(0, 3).map((skill, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0 truncate max-w-[150px]"
                                    title={skill}
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                                {(resume.searchable_skills?.length || 0) > 3 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1.5 py-0"
                                  >
                                    +{(resume.searchable_skills?.length || 0) - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title="Check Match Score (Requires 1 credit)"
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
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDownload(resume.metadata.file_url);
                                }}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <AddToListDialog
                                resumeId={resume.id}
                                userId={userId}
                                companyId={companyId || ''}
                                jobId={jobId}
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
                                <div className="text-sm font-medium mb-2 ">Skills & Experience</div>
                                <div className="flex flex-wrap gap-2">
                                  {Object.values(resume.parsed_content?.skills_with_yoe || {}).map((skill: SkillsWithYoe) => (
                                    <div
                                      key={skill.name}
                                      className="flex text-sm gap-2"
                                    >
                                      <Badge className="flex gap-1">
                                        <span>{skill.name}</span> |
                                        {skill.yoe && <span >{skill.yoe}y</span>}
                                      </Badge>
                                      {/* {skill.yoe && <span >| {skill.yoe}y</span>} */}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Education */}
                              {resume.parsed_content?.education?.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-2">Education</div>
                                  <div className="space-y-2">
                                    {resume.parsed_content.education.map((edu: Education, index: number) => (
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
                                      <span className="font-medium">{(resume.scores?.skills_score || 0).toFixed(1)}/10</span>
                                    </div>
                                    <Progress value={resume.scores?.skills_score * 10} className="h-2" />
                                  </div>

                                  {/* Experience Score */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>Experience Match</span>
                                      <span className="font-medium">{(resume.scores?.experience_score || 0)?.toFixed(1)}/10</span>
                                    </div>
                                    <Progress value={resume.scores?.experience_score * 10} className="h-2" />
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {resume.scores?.analysis?.experience_analysis}
                                    </div>
                                  </div>

                                  {/* Education Score */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>Education Match</span>
                                      <span className="font-medium">{(resume.scores?.education_score || 0)?.toFixed(1)}/10</span>
                                    </div>
                                    <Progress value={resume.scores?.education_score * 10} className="h-2" />
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {resume.scores?.analysis?.education_analysis}
                                    </div>
                                  </div>

                                  {/* Role Match Score */}
                                  {/* {resume.scores?.roleMatchScore && ( */}
                                  {/* <div className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span>Role Fit</span>
                                        <span className="font-medium">{(resume?.scores?.roleMatchScore || 0)?.toFixed(1)}/10</span>
                                      </div>
                                      <Progress value={resume?.scores?.roleMatchScore  || 0 * 10} className="h-2" />
                                    </div> */}
                                  {/* )} */}
                                </div>
                              </div>

                              {/* Detailed Analysis */}
                              <div className="space-y-4">
                                {/* Overall Feedback */}
                                {resume.scores?.analysis?.education_analysis && (
                                  <div>
                                    <div className="text-sm font-medium mb-1">Overall Analysis</div>
                                    <p className="text-sm text-muted-foreground">
                                      {resume.scores.analysis.education_analysis}
                                    </p>
                                  </div>
                                )}

                                {/* Skill Analysis */}
                                <div className="flex flex-col gap-2">


                                  <div className="flex flex-row justify-evenly">
                                    <div className="flex-1">
                                      <h3 className="font-semibold">Matching Skills</h3>
                                      <div className="flex flex-wrap gap-1.5">
                                        {resume?.scores?.analysis?.matched_skills?.length > 0 ? (
                                          resume?.scores?.analysis?.matched_skills?.map((skill, index) => (
                                            <Badge
                                              key={index}
                                              variant="secondary"
                                              className="text-sm px-2 py-0.5"
                                              title={skill}
                                            >
                                              {skill}
                                            </Badge>
                                          ))) : (
                                          <p className="text-xs text-muted-foreground">No matching skills</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-semibold">Missing Skills</h3>
                                      <div className="flex flex-wrap gap-1.5">
                                        {resume?.scores?.analysis?.missing_skills?.length > 0 ? (
                                          resume?.scores?.analysis?.missing_skills?.map((skill, index) => (
                                            <Badge
                                              key={index}
                                              variant="secondary"
                                              className="text-sm px-2 py-0.5"
                                              title={skill}
                                            >
                                              {skill}
                                            </Badge>
                                          ))) : (
                                          <p className="text-xs text-muted-foreground">No missing skills</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* strengthAreas and improvementAreas */}
                                <div className="grid grid-cols-2 gap-4">
                                  {/* strengthAreas */}
                                  <div>
                                    <div className="text-sm font-medium text-green-600 mb-1">Key strength areas</div>
                                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                      {resume.scores?.analysis?.strengths?.map((strength: string, index: number) => (
                                        <li key={index}>{strength}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Areas for Improvement */}
                                  <div>
                                    <div className="text-sm font-medium text-amber-600 mb-1">Areas for Improvement</div>
                                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                      {resume.scores?.analysis?.weaknesses?.map((area: string, index: number) => (
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
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Description Dialog */}
      <Dialog open={showJobDescription} onOpenChange={setShowJobDescription}>
        <DialogContent className="sm:max-w-[600px] bg-white overflow-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{jobTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: jobDescription }}>
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
                <p className="text-sm text-muted-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: requirements }}>
                </p>
              </div>
            )}
            {responsibilities && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Responsibilities</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: responsibilities }}>
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>

  );
}