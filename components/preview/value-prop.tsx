'use client';

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Target, 
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Users
} from "lucide-react";

export function ValueProposition() {
  const stats = [
    {
      value: "75%",
      label: "Time Saved",
      description: "Reduction in screening time"
    },
    {
      value: "3x",
      label: "Better Matches",
      description: "More qualified candidates"
    },
    {
      value: "60%",
      label: "Cost Reduction",
      description: "Lower recruitment costs"
    }
  ];

  const benefits = [
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Faster Hiring",
      description: "Reduce time-to-hire from weeks to days with AI-powered screening"
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Better Quality",
      description: "Find candidates that truly match your requirements"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Data-Driven Decisions",
      description: "Make informed decisions with detailed analytics"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Stats Section */}
        {/* <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="text-4xl font-bold text-indigo-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="font-medium mb-1">{stat.label}</div>
                  <div className="text-sm text-slate-600">{stat.description}</div>
                </motion.div>
              </CardContent>
            </Card>
          ))}
        </motion.div> */}

        {/* ROI Demo */}
        <div className="grid md:grid-cols-2 gap-10 items-center mb-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold">
              Clear ROI from Day One
            </h2>
            <p className="text-lg text-slate-600">
              See immediate impact on your recruitment metrics and bottom line.
            </p>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {[
                    { label: "Time Savings", value: 85 },
                    { label: "Quality of Hire", value: 92 },
                    { label: "Cost per Hire", value: 65 }
                  ].map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{metric.label}</span>
                        <span className="font-medium">
                          {metric.value}% improvement
                        </span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <div className="p-8 bg-indigo-50 rounded-lg text-indigo-600">
                  {benefit.icon}
                </div>
                <div>
                  <h4 className="font-medium">{benefit.title}</h4>
                  <p className="text-slate-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Features Grid */}
        {/* <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { icon: <CheckCircle2 />, label: "AI-Powered Screening" },
            { icon: <Users />, label: "Team Collaboration" },
            { icon: <DollarSign />, label: "Cost Effective" },
            { icon: <TrendingUp />, label: "Scalable Solution" }
          ].map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-8 rounded-lg border bg-white"
            >
              <div className="text-indigo-600">{item.icon}</div>
              <div className="font-medium">{item.label}</div>
            </div>
          ))}
        </motion.div> */}
      </div>
    </section>
  );
} 