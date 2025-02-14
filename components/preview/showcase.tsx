'use client';

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, Download, Star } from "lucide-react";

export function ProductShowcase() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  // Sample candidate data
  const candidates = [
    {
      id: '1',
      name: 'John Developer',
      role: 'Senior Software Engineer',
      scores: {
        skillsScore: 8.5,
        experienceScore: 9.0,
        overallScore: 8.8,
        analysis: {
          matchedSkills: ['React', 'Node.js', 'TypeScript'],
          strengthAreas: ['Frontend Development', 'System Architecture']
        }
      }
    },
    {
      id: '2',
      name: 'Sarah Smith',
      role: 'Full Stack Developer',
      scores: {
        skillsScore: 8.0,
        experienceScore: 7.5,
        overallScore: 7.8,
        analysis: {
          matchedSkills: ['React', 'Python', 'AWS'],
          strengthAreas: ['Cloud Infrastructure', 'API Development']
        }
      }
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="space-y-20"
        >
          {/* Candidate Matching UI */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border bg-white p-6 shadow-lg"
          >
            <div className="space-y-6">
              {candidates.map((candidate, index) => (
                <div 
                  key={candidate.id}
                  className={`p-4 rounded-lg border ${index === 0 ? 'border-l-4 border-l-indigo-500' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Star className="h-4 w-4 text-yellow-400" />}
                        <h3 className="font-medium">{candidate.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{candidate.role}</p>
                    </div>
                    
                    <div className="w-[200px]">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Match Score</span>
                          <span className="font-medium">{candidate.scores.overallScore}/10</span>
                        </div>
                        <Progress value={candidate.scores.overallScore * 10} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {index === 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-2">Matched Skills</div>
                        <div className="flex flex-wrap gap-1">
                          {candidate.scores.analysis.matchedSkills.map(skill => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2">Key Strengths</div>
                        <div className="flex flex-wrap gap-1">
                          {candidate.scores.analysis.strengthAreas.map(area => (
                            <Badge key={area} variant="outline">{area}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skills Analysis UI */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border bg-white p-6 shadow-lg"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Skills Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { skill: 'React', score: 90 },
                      { skill: 'Node.js', score: 85 },
                      { skill: 'TypeScript', score: 80 },
                      { skill: 'AWS', score: 75 }
                    ].map(item => (
                      <div key={item.skill} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.skill}</span>
                          <span>{item.score}%</span>
                        </div>
                        <Progress value={item.score} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Experience Analysis</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Years of Experience</span>
                          <Badge>5+ years</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Seniority Level</span>
                          <Badge variant="secondary">Senior</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Leadership</span>
                          <Badge variant="outline">Team Lead</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 