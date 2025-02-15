'use client';

import { motion } from "framer-motion";
import { Shield, Lock, FileCheck, Server, UserCheck } from "lucide-react";

export function SecuritySection() {
  const securityFeatures = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "GDPR & CCPA Compliant",
      description: "We adhere to the highest standards of data protection under GDPR and CCPA regulations."
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Enterprise-Grade Security",
      description: "Bank-level encryption for all data in transit and at rest using AES-256 and TLS 1.3."
    },
    {
      icon: <Server className="h-6 w-6" />,
      title: "Secure Cloud Infrastructure",
      description: "Hosted on Google Cloud Platform with SOC 2 Type II certification and ISO 27001 compliance."
    },
    {
      icon: <FileCheck className="h-6 w-6" />,
      title: "Data Privacy Controls",
      description: "Granular access controls, data retention policies, and audit logs for all operations."
    },
    {
      icon: <UserCheck className="h-6 w-6" />,
      title: "Candidate Data Rights",
      description: "Full transparency and control over personal data with right to access, modify, or delete."
    }
  ];

  return (
    <section className="py-2 bg-slate-50">
      <div className="container mx-auto ">
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 mb-4 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm">
            <Lock className="h-4 w-4" />
            Your data is protected by industry-leading security measures
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-3xl font-bold">
            Enterprise-Grade Security & Compliance
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Your data security and privacy are our top priorities. We maintain the highest standards
            of security and comply with major data protection regulations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl border hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-4">
                <div className="text-indigo-600">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 