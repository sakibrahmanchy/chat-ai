import { Resume } from "@/app/types/resume";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Check, Sparkles, Star } from "lucide-react";
import { MapPin, Calendar, Download, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ExpandedView from "./candidate-list-view/expanded-view";
import NoItems from "./candidate-list-view/no-items";

interface CandidateListTabContentProps {
    resumes: Resume[];
    expandedId: number | null;
    selectedCandidates: number[];
    setExpandedId: (id: number | null) => void;
    handleSelectCandidate: (id: number, checked: boolean) => void;
    handleAccept: (id: number, e: React.MouseEvent) => void;
    handleReject: (id: number, e: React.MouseEvent) => void;
    handleCalculateScore: (resume: Resume) => void;
    loadingScores: Record<number, boolean>;
    hasMore: boolean;
    loading: boolean;
    loadMoreRef: React.RefObject<HTMLDivElement>;
}

const handleDownload = (downloadUrl: string) => {
    console.log(downloadUrl)
    window.open(downloadUrl, '_blank');
};

const candidateStatus = (resume: Resume) => {
    if (resume.job_resume_matches && resume.job_resume_matches.length > 0) {
        return resume.job_resume_matches[0].status;
    }
    return 'pending';
}

const getMatchScore = (resume: Resume) => {
    return resume?.overall_score || 0;
};

const getJobMatchStatus = (resume: Resume) => {
    const { job_resume_matches } = resume;

    const [{
        status = 'pending'
    } = {}] = job_resume_matches || [{ status: 'pending' }];
    if (status === 'accepted') {
        return 'Shortlisted';
    } else if (status === 'rejected') {
        return 'Rejected';
    }
    return 'Pending';
}

export const CandidateListTabContent = ({
    resumes,
    expandedId,
    selectedCandidates,
    setExpandedId,
    handleSelectCandidate,
    handleAccept,
    handleReject,
    handleCalculateScore,
    loadingScores,
    hasMore,
    loading,
    loadMoreRef,
}: CandidateListTabContentProps) => {

    if (resumes.length === 0) {
        return <NoItems />
    }

    return (
        <div className="p-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto"> {/* Add padding to inner container */}
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
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {getJobMatchStatus(resume) !== 'Pending' ? (
                                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                                                {getJobMatchStatus(resume)}
                                            </Badge>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={cn(
                                                        "shrink-0",
                                                        "bg-indigo-600 text-white"
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
                                                        "bg-red-50 border-red-200 text-red-600"
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

                            {expandedId === resume.id && (
                                <ExpandedView resume={resume} />
                            )}
                        </div>

                    </div>
                ))}

                {hasMore && (
                    <div
                        ref={loadMoreRef}
                        className="h-10 flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
                        ) : (
                            <span className="text-sm text-muted-foreground">Loading more...</span>
                        )}
                    </div>
                )}

                {/* End of list message */}
                {/* {!hasMore && resumes.length > 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No more candidates to load
                    </div>
                )} */}
            </div>
        </div>
    );
};
