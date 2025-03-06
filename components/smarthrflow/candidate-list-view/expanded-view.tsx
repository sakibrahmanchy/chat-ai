import { Resume } from "@/app/types/resume";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";
import { SkillsWithYoe } from "@/app/types/resume";
import { Education } from "@/app/types/resume";
import { Progress } from "@/components/ui/progress";


const getMatchScore = (resume: Resume) => {
    return resume?.overall_score || 0;
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

export default function ExpandedView({
    resume,
}: {
    resume: Resume;
}) {
    return (
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
    );
}