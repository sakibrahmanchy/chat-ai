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
  Users,
  Brain,
  Zap,
  LineChart
} from "lucide-react";

export function ValueProposition() {
  const benefits = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Screening",
      description: "Reduce screening time by 75% with intelligent candidate evaluation",
      color: "indigo"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Precision Matching",
      description: "Find candidates that perfectly align with your requirements",
      color: "violet"
    },
    {
      icon: <LineChart className="h-6 w-6" />,
      title: "Data-Driven Insights",
      description: "Make confident decisions with comprehensive analytics",
      color: "blue"
    }
  ];

  const metrics = [
    { 
      label: "Time to Hire", 
      value: 85,
      improvement: "75% faster screening",
      icon: <Clock className="h-5 w-5" />
    },
    { 
      label: "Match Quality", 
      value: 92,
      improvement: "92% accuracy rate",
      icon: <CheckCircle2 className="h-5 w-5" />
    },
    { 
      label: "Cost Efficiency", 
      value: 70,
      improvement: "60% cost reduction",
      icon: <DollarSign className="h-5 w-5" />
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <Badge className="px-4 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
              Why SmartHRFlow
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Transform Your Hiring Process
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Experience the power of AI-driven recruitment that delivers real results
            </p>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className={`p-3 bg-${benefit.color}-50 rounded-lg w-fit`}>
                      <div className={`text-${benefit.color}-600`}>
                        {benefit.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold">{benefit.title}</h3>
                    <p className="text-slate-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Metrics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-8 sm:p-10"
          >
            <div className="grid md:grid-cols-3 gap-8">
              {metrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                      {metric.icon}
                    </div>
                    <h4 className="font-medium">{metric.label}</h4>
                  </div>
                  <div className="space-y-2">
                    <Progress value={metric.value} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{metric.improvement}</span>
                      <span className="font-medium">{metric.value}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 