'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Zap, Download, Eye, Upload } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features for Smart Hiring</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to streamline your recruitment process
          </p>
        </div>

        <div className="space-y-24">
          {/* Feature 1: AI Resume Scoring */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <Badge className="mb-4">AI-Powered</Badge>
              <h3 className="text-2xl font-bold">Intelligent Resume Scoring</h3>
              <p className="text-muted-foreground text-lg">
                Automatically score and rank candidates based on their match with your job requirements. 
                Our AI analyzes skills, experience, and overall fit.
              </p>
            </div>
            <div className="rounded-xl border bg-white p-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">John Developer</h4>
                    <p className="text-sm text-muted-foreground">Senior Software Engineer</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">8.5/10</div>
                    <p className="text-sm text-muted-foreground">Match Score</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Skills Match</span>
                      <span>9/10</span>
                    </div>
                    <Progress value={90} className="bg-slate-100" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Experience Match</span>
                      <span>8/10</span>
                    </div>
                    <Progress value={80} className="bg-slate-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Resume Processing */}
          <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
            <div className="space-y-4 md:order-2">
              <Badge className="mb-4">Smart Processing</Badge>
              <h3 className="text-2xl font-bold">Automated Resume Processing</h3>
              <p className="text-muted-foreground text-lg">
                Upload resumes in any format. Our system automatically extracts and organizes key information, 
                making it easy to review candidates.
              </p>
            </div>
            <div className="rounded-xl border bg-white p-6 shadow-lg md:order-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Upload className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">resume_john.pdf</h4>
                      <p className="text-sm text-muted-foreground">Processing complete</p>
                    </div>
                  </div>
                  <Badge variant="success">Processed</Badge>
                </div>
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm text-muted-foreground">John Developer</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Experience</p>
                      <p className="text-sm text-muted-foreground">5 years</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">React</Badge>
                        <Badge variant="outline" className="text-xs">Node.js</Badge>
                        <Badge variant="outline" className="text-xs">TypeScript</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Candidate Management */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <Badge className="mb-4">Organized</Badge>
              <h3 className="text-2xl font-bold">Efficient Candidate Management</h3>
              <p className="text-muted-foreground text-lg">
                Keep all candidate information organized and accessible. Compare candidates, 
                track applications, and make informed decisions.
              </p>
            </div>
            <div className="rounded-xl border bg-white p-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Recent Candidates</h4>
                    <p className="text-sm text-muted-foreground">Frontend Developer Position</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Sarah Smith", role: "Senior Frontend Dev", score: 9.2 },
                    { name: "Mike Johnson", role: "Frontend Engineer", score: 8.7 },
                    { name: "Anna Lee", role: "UI Developer", score: 8.5 },
                  ].map((candidate) => (
                    <div key={candidate.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <h5 className="font-medium">{candidate.name}</h5>
                        <p className="text-sm text-muted-foreground">{candidate.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{candidate.score}/10</Badge>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 