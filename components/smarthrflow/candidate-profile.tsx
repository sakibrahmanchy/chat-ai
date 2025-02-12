'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Download, 
  Building2, 
  GraduationCap,
  Award,
  Briefcase,
  Languages,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { getRelativeTimeString } from "@/lib/utils";

interface CandidateProfileProps {
  candidate: any; // Replace with proper type
}

export function CandidateProfile({ candidate }: CandidateProfileProps) {
  const { parsedContent } = candidate;

  const handleDownload = () => {
    window.open(candidate.downloadUrl, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/candidates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Candidates
          </Button>
        </Link>
      </div>

      {/* Basic Info Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{parsedContent?.full_name || candidate.fileName}</CardTitle>
              <p className="text-muted-foreground mt-1">{parsedContent?.occupation}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Resume
              </Button>
              <Button>Contact Candidate</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Info */}
            <div className="space-y-2">
              {parsedContent?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{parsedContent.email}</span>
                </div>
              )}
              {parsedContent?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{parsedContent.phone}</span>
                </div>
              )}
              {parsedContent?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{parsedContent.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Applied {getRelativeTimeString(new Date(candidate.createdAt))}</span>
              </div>
            </div>

            {/* Match Scores */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Skills Match</span>
                  <span>{parsedContent?.skillMatch}%</span>
                </div>
                <Progress value={parsedContent?.skillMatch} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Experience Match</span>
                  <span>{parsedContent?.experienceMatch}%</span>
                </div>
                <Progress value={parsedContent?.experienceMatch} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Overall Fit</span>
                  <span>{parsedContent?.overallFit}%</span>
                </div>
                <Progress value={parsedContent?.overallFit} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Info Tabs */}
      <Tabs defaultValue="experience" className="space-y-4">
        <TabsList>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="job">Job Details</TabsTrigger>
        </TabsList>

        <TabsContent value="experience" className="space-y-4">
          {parsedContent?.experiences?.map((exp: any, index: number) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium">{exp.title}</h3>
                    <p className="text-muted-foreground">{exp.company}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(exp.starts_at).toLocaleDateString()} - 
                      {exp.ends_at ? new Date(exp.ends_at).toLocaleDateString() : 'Present'}
                    </p>
                    <p className="mt-2">{exp.description}</p>
                    {exp.technologies && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {exp.technologies.map((tech: string) => (
                          <Badge key={tech} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          {parsedContent?.education?.map((edu: any, index: number) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <GraduationCap className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <h3 className="font-medium">{edu.degree_name}</h3>
                    <p className="text-muted-foreground">{edu.school}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.field_of_study} • {new Date(edu.starts_at).getFullYear()} - 
                      {edu.ends_at ? new Date(edu.ends_at).getFullYear() : 'Present'}
                    </p>
                    {edu.grade && (
                      <p className="text-sm mt-1">Grade: {edu.grade}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Technical Skills</h3>
                  <div className="flex gap-2 flex-wrap">
                    {parsedContent?.skills?.map((skill: string) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                {parsedContent?.languages && (
                  <div>
                    <h3 className="font-medium mb-2">Languages</h3>
                    <div className="flex gap-2 flex-wrap">
                      {parsedContent.languages.map((lang: string) => (
                        <Badge key={lang} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {parsedContent?.certifications && (
                  <div>
                    <h3 className="font-medium mb-2">Certifications</h3>
                    <div className="space-y-2">
                      {parsedContent.certifications.map((cert: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span>{cert.name}</span>
                          {cert.authority && (
                            <span className="text-muted-foreground">• {cert.authority}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Applied Position</h3>
                  <p className="text-muted-foreground">{candidate.jobTitle}</p>
                </div>
                <div>
                  <h3 className="font-medium">Job Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {candidate.jobDescription}
                  </p>
                </div>
                {candidate.requiredSkills && (
                  <div>
                    <h3 className="font-medium">Required Skills</h3>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {candidate.requiredSkills.map((skill: string) => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 