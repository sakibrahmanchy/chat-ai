'use client';

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashboardPreview } from "./dashboard-preview";

export function PreviewHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center py-12 sm:py-20 overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-white to-violet-50/40" />
        <motion.div 
          className="absolute top-20 -left-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-violet-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 text-sm font-medium shadow-sm border border-indigo-100">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse mr-2" />
                SmartHRFlow Early Access Program Now Open
              </span>
            </motion.div>

            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight sm:leading-tight md:leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                SmartHRFlow
              </span>
            </motion.h1>

            <motion.p 
              className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Experience the next generation of intelligent talent matching with SmartHRFlow.
              <br className="hidden sm:block" />
              Built for modern businesses and hiring teams.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/early-access/apply" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto h-12 sm:h-14 sm:px-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 group"
                >
                  Join Early Access Program
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto h-12 sm:h-14 sm:px-8 border-slate-300 hover:bg-slate-50"
              >
                Schedule a Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Product Preview with Enhanced Shadow */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="mt-16 sm:mt-20 relative"
          >
            <div className="absolute inset-0 -bottom-10 bg-gradient-to-b from-transparent to-white pointer-events-none" />
            <div className="relative rounded-xl shadow-2xl shadow-indigo-200/20">
              <DashboardPreview />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 