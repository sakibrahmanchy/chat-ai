'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Resume } from "@/app/types/resume";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CandidateFilters, FilterCriteria } from "./candidate-filters";
import {
  Download,
  Filter,
  X,
  Search,
  Info,
  Check,
  Loader2,
  User2Icon,
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
import { useCompany } from "@/hooks/use-company";
import { exportData } from '@/lib/utils/export';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { listService } from "@/lib/services/list.service";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmailCandidatesDialog } from "./email-candidates-dialog";
import { CandidateListTabContent } from "./candidate-list-tab-content";

interface CandidateListViewProps {
  jobId: string;
  jobTitle: string;
  userId: string;
  jobDescription: string;
  requiredSkills: string[];
  requirements: string;
  responsibilities: string;
  showFiltersDefault?: boolean;
  initialFilters?: {
    search?: string;
    skills?: string[];
    experienceLevel?: string;
    matchScore?: [number, number];
    matchType?: 'AND' | 'OR';
  };
  skipDataFetch?: boolean;
}

export function CandidateListView({
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
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    all: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });
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


  const [filters, setFilters] = useState<FilterCriteria>({
    showFilters: showFiltersDefault,
    skills: initialFilters?.skills || [],
    scoreRange: initialFilters?.matchScore || [0, 10],
    experienceMonths: [0, 999] as [number, number],
    matchType: initialFilters?.matchType || 'OR' as 'AND' | 'OR',
    sortBy: 'score' as 'score' | 'date',
    location: "all",
    searchTerm: initialFilters?.search || '',
    availability: 1,
    fetchStatusCount: true
  });

  const { inView } = useInView({
    threshold: 0,
  });

  // Add this after the existing state declarations
  const [selectedTab, setSelectedTab] = useState('all');

  const getStatusNameFromSelectedTab = (tab: string) => {
    switch (tab) {
      case 'pending':
        return 'pending';
      case 'shortlisted':
        return 'accepted';
      case 'rejected':
        return 'rejected';
      default:
        return '';
    }
  }

  const loadInitialData = useCallback(async () => {
    if (skipDataFetch) return;

    setLoading(true);
    try {
      const searchFilters = {
        searchTerm: filters.searchTerm || '',
        skills: filters.skills,
        status: getStatusNameFromSelectedTab(selectedTab),
        location: filters.location === 'all' ? undefined : filters.location,
        experienceMonths: filters.experienceMonths,
        scoreRange: filters.scoreRange ? [filters.scoreRange[0], filters.scoreRange[1]] as [number, number] : [0, 10] as [number, number],
        showFilters: filters.showFilters,
        matchType: filters.matchType,
        sortBy: filters.sortBy,
        fetchStatusCount: filters.fetchStatusCount
      };

      const result = await resumeSearch.searchResumes(jobId, searchFilters);

      setResumes(result.resumes);
      setStatusCounts(result.statusCounts || {
        all: 0,
        pending: 0,
        accepted: 0,
        rejected: 0
      });
      setSelectedCandidates([])
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [skipDataFetch, filters, selectedTab, jobId]);

  // Modified score calculation function
  const handleCalculateScore = async (resume: Resume) => {
    try {
      setLoadingScores(prev => ({ ...prev, [resume.id]: true }));

      if (!companyId || !jobId) {
        throw new Error('Company ID or Job ID is missing');
      }

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
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);

    try {
      const searchFilters = {
        ...filters,
        searchTerm: searchTerm,
        skills: (filters?.skills || [])?.length > 0 ? filters.skills : [],
        location: filters.location === "all" ? undefined : filters.location,
        experienceMonths: (filters?.experienceMonths || [0, 999])[0] === 0 && (filters?.experienceMonths || [0, 999])[1] === 999
          ? undefined
          : filters.experienceMonths,
        scoreRange: (filters?.scoreRange || [0, 10])[0] === 0 && (filters?.scoreRange || [0, 10])[1] === 10 ? undefined : filters.scoreRange
      };

      const result = await resumeSearch.searchResumes(
        jobId,
        searchFilters as unknown as FilterCriteria,
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
    }
  }, [hasMore, loading, searchTerm, filters, jobId]);

  // Update initial data loading
  useEffect(() => {
    if (!skipDataFetch) {
      console.log('loading initial data')
      loadInitialData();
    }
  }, [skipDataFetch, loadInitialData]);

  // Handle infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading, loadMore]);

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
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showJobDescription, setShowJobDescription] = useState(false);

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
      { header: 'Job Role', key: 'role' },
      { header: 'Name', key: 'full_name' },
      { header: 'Email', key: 'email' },
      { header: 'Phone', key: 'phone' },
      { header: 'Location', key: 'location' },
      { header: 'Experience', key: 'experience_months', transform: (value: number) => `${value / 12} years` },
      { header: 'Current Position', key: 'current_position' },
      { header: 'Availability', key: 'availability_weeks', transform: (value: number) => `${value} weeks` },
      { header: 'Match Score', key: 'overall_score' },
      { header: 'Skills', key: 'skills' },
      { header: 'Status', key: 'status' },
      { header: 'Resume', key: 'resume_url' }
    ];

    const dataToExport = filteredResumes.map(candidate => ({
      id: candidate.id,
      full_name: candidate.full_name,
      email: candidate.email,
      phone: candidate.phone,
      location: `${candidate.location.city}, ${candidate.location.state}, ${candidate.location.country}`,
      experience_months: candidate.experience_months,
      searchable_skills: candidate.searchable_skills.join(', '),
      score: candidate.scores?.overall_score?.toString() || '0',
      resume_url: candidate.metadata.file_url,
      status: candidate?.job_resume_matches?.[0]?.status || 'pending',
      role: jobTitle,
      current_position: `${candidate.parsed_content.experiences[0].title} at ${candidate.parsed_content.experiences[0].company}`,
    }));

    await exportData(dataToExport, {
      filename: `candidates-${new Date().toISOString().split('T')[0]}`,
      format,
      columns: exportColumns
    });
  };

  const handleAccept = async (candidateId: number, e: React.MouseEvent) => {
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
        description: "Failed to shortlist candidate: " + error,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (candidateId: number, e: React.MouseEvent) => {
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
        description: "Failed to reject candidate: " + error,
        variant: "destructive",
      });
    }
  };

  // Add state for selected candidates
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);

  const handleSelectCandidate = (candidateId: number, checked: boolean) => {
    console.log({ candidateId, checked })
    setSelectedCandidates(prev =>
      checked
        ? [...prev, candidateId]
        : prev.filter(id => id !== candidateId)
    );
  };

  // Modify the handleSelectAll function
  const handleSelectAll = (checked: boolean) => {
    setSelectedCandidates(checked ? resumes.map(c => c.id) : []);
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
        description: "Failed to shortlist candidates: " + error,
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
        description: "Failed to reject candidates: " + error,
        variant: "destructive",
      });
    }
  };

  // Modify the TabsList section to track selected tab
  const tabsList = (
    <div className="bg-white pb-8 sm:!pb-0 sm:px-4">
      <TabsList className="w-full flex flex-wrap gap-2 sm:flex-nowrap justify-end">
        {[{
          label: 'All Candidates',
          value: 'all',
          count: statusCounts.all
        }, {
          label: 'Pending Review',
          value: 'pending',
          count: statusCounts.pending
        }, {
          label: 'Shortlisted',
          value: 'shortlisted',
          count: statusCounts.accepted
        }, {
          label: 'Rejected',
          value: 'rejected',
          count: statusCounts.rejected
        }].map(tab => (
          <TabsTrigger
            key={tab.value}
            className={cn(
              'flex-1 min-w-[120px] whitespace-nowrap',
              selectedTab === tab.value && 'bg-indigo-600 text-white border-indigo-600',
              selectedTab !== tab.value && 'hover:bg-indigo-50',
              'border'
            )}
            value={tab.value}
            onClick={() => setSelectedTab(tab.value)}
          >
            <span className="truncate">{tab.label}</span>
            <Badge variant="secondary" className="ml-2 shrink-0">
              {tab.count}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );

  // Modify the bulk actions header to show correct count and use filtered candidates
  const bulkActionsHeader = (
    <div className="bg-white p-4 pb-0">
      <div className="flex items-center justify-between bg-white p-4 border rounded-lg pl-4">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectedCandidates.length === statusCounts[getStatusNameFromSelectedTab(selectedTab)]}
            onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
          />
          <span className="text-sm text-muted-foreground">
            {selectedCandidates.length} selected
          </span>
        </div>

        {selectedCandidates.length > 0 && (
          <div className="flex gap-2">
            <EmailCandidatesDialog
              candidates={resumes.filter(r => selectedCandidates.includes(r.id))}
              jobTitle={jobTitle}
              companyName={companyName || ''}
              companyId={companyId || ''}
              jobId={jobId}
            />
            {selectedTab !== 'shortlisted' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkAccept}
                className="bg-indigo-600 text-white"
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
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row rounded-xl border bg-white shadow-2xl overflow-hidden max-w-[1400px] mx-auto">
      {/* Filters sidebar */}
      {filters.showFilters && (
        <div className="w-full lg:w-[300px] border-r bg-white p-4 overflow-y-auto">
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
            onFilterChange={(newFilters) => setFilters({...filters, ...newFilters})}
            availableLocations={availableLocations}
          />
        </div>
      )}

      {/* Main content area - flex column to allow proper content scrolling */}
      <div className="flex-1 flex flex-col min-h-0 p-4"> {/* Add min-h-0 to allow proper flex behavior */}
        {/* Fixed header section */}
        <div className="bg-white p-4">
          <div className="flex flex-col sm:flex-row items-start justify-between sm:items-center gap-4">
            <div className="flex flex-2">
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold truncate text-wrap">
                    <Link href={`/dashboard/jobs/${jobId}`} className={cn(jobId === 'demo' && 'pointer-events-none')}>
                      <span className="text-indigo-600">{jobTitle}</span>
                    </Link>
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowJobDescription(true)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                <p className="flex text-sm text-muted-foreground items-center">
                  <User2Icon className="h-4 w-4 mr-2" />
                  Total candidates: {resumes.length} 
                </p>
              </div>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                <DropdownMenuContent className="bg-white">
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

        </div>

        {/* Tabs container - flex column for proper tab content scrolling */}
        <Tabs defaultValue="pending" className="flex-1 flex flex-col min-h-0"> {/* Add min-h-0 */}
          {/* Fixed tabs header */}

          {tabsList}
          {selectedCandidates.length > 0 && bulkActionsHeader}

          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {!loading && ['all', 'pending', 'shortlisted', 'rejected'].map(tab => (
            <TabsContent
              key={tab}
              value={tab}
              className="flex-1 overflow-y-auto m-0" // Remove padding here
            >
              <CandidateListTabContent
                resumes={resumes}
                selectedCandidates={selectedCandidates}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                handleSelectCandidate={handleSelectCandidate}
                handleAccept={handleAccept}
                handleReject={handleReject}
                handleCalculateScore={handleCalculateScore}
                loadingScores={loadingScores}
              />
            </TabsContent>
          ))}
          {/* Scrollable tab content */}

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