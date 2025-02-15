'use client';

import { motion } from "framer-motion";
import { 
  FileText, 
  Sparkles, 
  Users, 
  Mail,
  Star,
  Download
} from "lucide-react";

export function UserJourney() {
  const steps = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Define Your Requirements",
      description: "Specify your ideal candidate profile and job requirements",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600"
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Matching",
      description: "Our AI instantly finds and ranks the best matching candidates",
      bgColor: "bg-violet-50",
      textColor: "text-violet-600"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Review Best Matches",
      description: "Get detailed insights about each candidate's skills and experience",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Create Shortlist",
      description: "Save and organize your preferred candidates",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Export Details",
      description: "Download candidate profiles and analysis reports",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Reach Out",
      description: "Contact promising candidates directly via email",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50/50 overflow-x-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <span className="text-indigo-600 font-medium mb-4 block">
              SmartHRFlow Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Find Your Ideal Candidates
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A streamlined process powered by SmartHRFlow's intelligent matching technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Connection Line */}
                {index !== steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-slate-200 to-transparent -translate-y-1/2 z-0" />
                )}
                
                <div className="relative bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-white border border-slate-200 text-xs font-medium flex items-center justify-center">
                    {index + 1}
                  </div>

                  <div className="space-y-4">
                    <div className={`p-3 ${step.bgColor} rounded-lg w-fit`}>
                      <div className={step.textColor}>
                        {step.icon}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">
                        {step.title}
                      </h3>
                      <p className="text-slate-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Timeline for Mobile */}
          <div className="lg:hidden mt-12">
            <div className="relative border-l-2 border-slate-200 ml-6 space-y-8 pl-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[41px] w-6 h-6 rounded-full ${step.bgColor} border-2 ${step.textColor.replace('text', 'border')} flex items-center justify-center text-xs font-medium`}>
                    {index + 1}
                  </div>
                  <div className="text-sm text-slate-600">
                    {step.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm">
              <Sparkles className="h-4 w-4" />
              Find matching candidates in minutes
            </div>
          </motion.div> */}
        </div>
      </div>
    </section>
  );
} 