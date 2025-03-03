"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Users,
  Star,
  Zap,
  CreditCard,
  LayoutDashboard,
  FileText,
  Search,
  Upload
} from "lucide-react";

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem("hasVisitedBefore");
    if (!hasVisited) {
      setOpen(true);
      localStorage.setItem("hasVisitedBefore", "true");
    }
  }, []);

  const features = [
    {
      icon: Star,
      title: "AI-Powered Matching",
      description: "Smart candidate matching using advanced AI algorithms"
    },
    {
      icon: Users,
      title: "Candidate Management",
      description: "Organize and track candidates efficiently"
    },
    {
      icon: Zap,
      title: "Quick Analysis",
      description: "Get instant insights from resumes and applications"
    }
  ];

  const pages = [
    {
      icon: LayoutDashboard,
      title: "Dashboard",
      description: "Overview of your recruitment activities, stats, and recent updates"
    },
    {
      icon: Briefcase,
      title: "Jobs",
      description: "Create and manage job postings, view candidates per job"
    },
    {
      icon: FileText,
      title: "Candidates",
      description: "View all candidates, their profiles, and match scores"
    },
    {
      icon: Search,
      title: "Search",
      description: "Advanced search through candidates with AI-powered filters"
    }
  ];

  const creditActions = [
    {
      icon: Upload,
      title: "Resume Upload",
      credits: 1,
      description: "Upload and parse a new resume"
    },
    {
      icon: Star,
      title: "Match Analysis",
      credits: 1,
      description: "Run AI matching against a job posting"
    },
    {
      icon: Zap,
      title: "Combined (Upload + Match) - this happens when you upload a resume for a job",
      credits: 2,
      description: "Perform an AI-powered candidate search"
    }
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Welcome to SmartHR Flow</DialogTitle>
              <DialogDescription className="pt-2">
                Your AI-powered recruitment assistant that makes hiring smarter and faster.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="mt-1">
                    <feature.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      case 2:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Navigate with Ease</DialogTitle>
              <DialogDescription className="pt-2">
                Everything you need, organized in intuitive sections.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-6">
              {pages.map((page, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="mt-1">
                    <page.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{page.title}</h3>
                    <p className="text-sm text-muted-foreground">{page.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      case 3:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Credit System</DialogTitle>
              <DialogDescription className="pt-2">
                Understanding how credits work in SmartHR Flow.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="mb-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-medium">About Credits</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Credits are used for AI-powered actions. Each action costs a specific number of credits.
                    You can purchase more credits or upgrade your plan at any time.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {creditActions.map((action, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 rounded-lg border">
                    <div className="mt-1">
                      <action.icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{action.title}</h3>
                        <span className="text-sm font-medium text-indigo-600">
                          {action.credits} {action.credits === 1 ? 'credit' : 'credits'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 mt-4 text-xl bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-medium text-indigo-900">Welcome Gift: 10 Free Credits!</h3>
                </div>
                <p className="text-sm text-indigo-700">
                  We are giving you 10 credits to get started. Use them to try out our AI-powered features
                  and experience the full potential of SmartHR Flow.
                </p>
              </div>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Ready to Start?</DialogTitle>
              <DialogDescription className="pt-2">
                You are all set to start using SmartHR Flow.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="p-4 rounded-lg bg-slate-50 space-y-3">
                <h3 className="font-medium">Quick Tips:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Start by posting your first job</li>
                  <li>• Use your 10 free credits to try out AI features</li>
                  <li>• Upload candidate resumes to see AI matching in action</li>
                  <li>• Share job links with candidates to let them apply.</li>
                  <li>• Check your credit balance in the settings page</li>
                  <li>• Use the dashboard to track your recruitment progress</li>
                </ul>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        {renderStepContent()}
        <DialogFooter className="flex justify-between gap-2">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </div>
          </div>
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            {step < totalSteps ? (
              <Button onClick={() => setStep(step + 1)}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => setOpen(false)}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 