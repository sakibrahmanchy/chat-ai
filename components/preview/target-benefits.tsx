'use client';

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Rocket,
  Clock,
  DollarSign,
  Target,
  LineChart,
  Briefcase,
  Building,
  CheckCircle2,
  Zap,
  PieChart,
  TrendingUp
} from "lucide-react";

export function TargetBenefits() {
  const benefits = {
    recruiters: [
      {
        icon: <Clock className="h-5 w-5" />,
        title: "80% Faster Screening",
        description: "AI-powered screening reduces candidate evaluation time from hours to minutes"
      },
      {
        icon: <Target className="h-5 w-5" />,
        title: "Better Match Quality",
        description: "Advanced matching algorithms ensure candidates truly fit your requirements"
      },
      {
        icon: <Users className="h-5 w-5" />,
        title: "Manage More Requisitions",
        description: "Handle 3x more job requisitions with automated screening and ranking"
      },
      {
        icon: <LineChart className="h-5 w-5" />,
        title: "Data-Driven Decisions",
        description: "Make confident decisions with detailed candidate analytics and insights"
      }
    ],
    startups: [
      {
        icon: <DollarSign className="h-5 w-5" />,
        title: "Reduce Hiring Costs",
        description: "Cut recruitment costs by up to 60% with automated screening"
      },
      {
        icon: <Rocket className="h-5 w-5" />,
        title: "Scale Quickly",
        description: "Efficiently handle high-volume hiring during growth phases"
      },
      {
        icon: <Zap className="h-5 w-5" />,
        title: "Compete for Talent",
        description: "Level the playing field with enterprise-grade recruitment tools"
      },
      {
        icon: <PieChart className="h-5 w-5" />,
        title: "Resource Optimization",
        description: "Make the most of your limited HR resources with automation"
      }
    ]
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-20">
          {/* Recruiters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="text-center space-y-4">
              <Badge className="px-4 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
                For Recruiters
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Supercharge Your Recruitment Process
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Transform your workflow with AI-powered tools designed specifically for professional recruiters
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.recruiters.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="p-3 bg-indigo-50 rounded-lg w-fit">
                          <div className="text-indigo-600">
                            {benefit.icon}
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg">{benefit.title}</h3>
                        <p className="text-slate-600">{benefit.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Startups Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="text-center space-y-4">
              <Badge className="px-4 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                For Startups & Small Businesses
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Enterprise-Grade Hiring, Startup-Friendly
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Get the power of AI recruitment without the enterprise price tag
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.startups.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="p-3 bg-emerald-50 rounded-lg w-fit">
                          <div className="text-emerald-600">
                            {benefit.icon}
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg">{benefit.title}</h3>
                        <p className="text-slate-600">{benefit.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Success Metrics */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-8 sm:p-10">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  value: "60%",
                  label: "Cost Reduction",
                  description: "Average reduction in cost-per-hire"
                },
                {
                  value: "75%",
                  label: "Time Saved",
                  description: "Reduction in screening time"
                },
                {
                  value: "3x",
                  label: "More Efficient",
                  description: "Increase in recruiter productivity"
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center space-y-2"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="font-medium text-lg">{stat.label}</div>
                  <div className="text-slate-600">{stat.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 