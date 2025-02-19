'use client';

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Zap,
  LineChart,
  Users,
  Clock,
  Search,
  ArrowRight
} from "lucide-react";

export function ProductFeatures() {
  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Analysis",
      description: "Intelligent resume parsing and candidate evaluation"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Matching",
      description: "Real-time candidate scoring and ranking"
    },
    {
      icon: <LineChart className="h-6 w-6" />,
      title: "Deep Analytics",
      description: "Comprehensive insights and reporting"
    }
  ];

  return (
    <section className="py-4 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="relative h-full hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-indigo-50 rounded-lg w-fit">
                      <div className="text-indigo-600">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Interactive Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-10 items-center"
        >
          {/* Live Feature Demo */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">
                Smart Candidate Evaluation
              </h2>
              <p className="text-lg text-slate-600">
                Experience how our AI analyzes and scores candidates in real-time.
              </p>
            </div>

            {/* Interactive Demo UI */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Candidate Score */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Match Score</h4>
                        <p className="text-sm text-slate-500">Based on job requirements</p>
                      </div>
                      <div className="text-2xl font-bold text-indigo-600">8.5/10</div>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>

                  {/* Skill Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Key Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-sm">React</Badge>
                      <Badge variant="secondary" className="text-sm">Node.js</Badge>
                      <Badge variant="secondary" className="text-sm">TypeScript</Badge>
                      <Badge variant="outline" className="text-sm">AWS</Badge>
                      <Badge variant="outline" className="text-sm">Docker</Badge>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button className="w-full" variant="outline">
                      View Details
                    </Button>
                    <Button className="w-full">
                      Contact Candidate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature List */}
          <div className="space-y-6">
            <div className="space-y-6">
              {[
                {
                  icon: <Clock className="h-5 w-5" />,
                  title: "Save Time",
                  description: "Reduce screening time by up to 75%"
                },
                {
                  icon: <Search className="h-5 w-5" />,
                  title: "Better Matches",
                  description: "Find candidates that truly fit your requirements"
                },
                {
                  icon: <Users className="h-5 w-5" />,
                  title: "Team Collaboration",
                  description: "Streamline your hiring process with your team"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="flex gap-4 items-start"
                >
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-slate-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button variant="ghost" className="group">
              Learn more about our features
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 