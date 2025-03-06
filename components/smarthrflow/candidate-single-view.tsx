import { Button } from "../ui/button";
import { Mail, Phone, MapPin, Briefcase, Building2, GraduationCap, Star, ChevronUp, ChevronDown, CheckCircle2, Calendar, CheckCircle, Download, ListCheck, X } from "lucide-react";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Candidate } from "./candidates-expandable-list-view";

const CandidateSingleView = ({
    candidate,
    expandedCandidateId,
    handleExpandCandidate,
}: {
    candidate: Candidate;
    expandedCandidateId: number | null;
    handleExpandCandidate: (id: number) => void;
    lists: string[];
    jobId: string;
    companyId: string;
}) => {
    return (
        <div
            key={candidate.id}
            className="rounded-lg border bg-white transition-all duration-200"
        >
            <div className="p-4 border-b bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium shrink-0">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <div className="font-medium flex items-center gap-2">
                                {candidate.name}
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            </div>
                            <div className="text-sm text-slate-600">{candidate.role}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-sm font-medium">Match Score</div>
                            <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                                {candidate.score.toFixed(1)}/10
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={() => handleExpandCandidate(candidate.id)}
                        >
                            {expandedCandidateId === candidate.id ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {expandedCandidateId === candidate.id && (
                <div className="p-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-1">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-slate-600">Contact Information</h4>
                                    <div className="grid gap-2">
                                        {[
                                            { icon: <Mail className="h-4 w-4" />, value: candidate.email },
                                            { icon: <Phone className="h-4 w-4" />, value: candidate.phone },
                                            { icon: <MapPin className="h-4 w-4" />, value: candidate.location }
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
                                            { icon: <Briefcase className="h-4 w-4" />, value: `${candidate.experience} Experience` },
                                            { icon: <Building2 className="h-4 w-4" />, value: `Current: ${candidate.company}` },
                                            { icon: <GraduationCap className="h-4 w-4" />, value: candidate.education },
                                            { icon: <Calendar className="h-4 w-4" />, value: `Available in ${candidate.availability}` }
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
                                    {candidate.skills.map((skill: string, i: number) => (
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
                                        { label: "Skills Match", value: candidate.scores.skillsScore },
                                        { label: "Experience", value: candidate.scores.experienceScore },
                                        { label: "Education", value: candidate.scores.educationScore }
                                    ].map((score, index) => (
                                        <div key={index} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>{score.label}</span>
                                                <span className="font-medium">{score.value.toFixed(1)}/10</span>
                                            </div>
                                            <Progress
                                                value={score.value * 10}
                                                className="h-2"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {candidate.score > 4 && <div className="space-y-2">
                                <h4 className="font-medium text-sm text-slate-600">Key Strengths</h4>
                                <div className="space-y-1">
                                    {candidate.scores.analysis.strengths.map((strength: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                            <span>{strength}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>}

                            {candidate.score < 4 && <div className="space-y-2">
                                <h4 className="font-medium text-sm text-slate-600">Overall Feedback</h4>
                                <div className="space-y-1">
                                   {candidate.scores.analysis.overall_feedback}
                                </div>
                            </div>}


                            <div className="flex justify-start items-center gap-1">
                                <div >
                                    {candidate.status === 'pending' ? (
                                            <Button variant="outline">
                                                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> 
                                                Shortlist
                                            </Button>
                                    ) : candidate.status === 'accepted' ? (
                                        <div className="flex items-center gap-2 bg-green-50 rounded-md p-2 font-bold">
                                            <ListCheck className="h-4 w-4 text-green-500 shrink-0" />
                                            <span className="text-slate-600 text-xs sm:text-sm ">Shortlisted</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 bg-red-50 rounded-md p-2 font-bold">
                                            <X className="h-4 w-4 text-red-500 shrink-0" />
                                            <span className="text-slate-600 text-xs sm:text-sm ">Rejected</span>
                                        </div>
                                    )}
                                </div>
                                <Button 
                                    className="flex gap-2 text-xs sm:text-sm transition-colors inline-flex items-center justify-center py-2"
                                    onClick={() => {/* Download handler */}}
                                >
                                    <Download className="h-4 w-4 text-slate-600 shrink-0" color="white" />
                                    Download CV
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CandidateSingleView;
