import { Navbar } from "@/components/layout/navbar";
import { Card } from "@/components/ui/card";
import { MotionDiv } from "@/components/motion";
import { BrainCircuit, Users, Rocket, ListChecks, Mail, MessageSquare, Shield, Database, Star } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const mainFeatures = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Matching",
    description: "Our advanced AI algorithms analyze resumes with 95% accuracy, considering both explicit skills and implicit capabilities to find the perfect candidate match.",
    highlight: "Up to 70% faster candidate screening"
  },
  {
    icon: Rocket,
    title: "Smart Automation",
    description: "Automate repetitive tasks like resume screening, candidate communication, and interview scheduling to focus on what matters most.",
    highlight: "Save 15+ hours per week"
  },
  {
    icon: Star,
    title: "Intelligent Scoring",
    description: "Each candidate receives a comprehensive match score based on multiple factors including skills, experience, and cultural fit.",
    highlight: "93% hiring success rate"
  }
];

const additionalFeatures = [
  {
    icon: ListChecks,
    title: "Bulk Actions",
    description: "Process multiple candidates simultaneously with efficient bulk actions for shortlisting, rejecting, or exporting."
  },
  {
    icon: Mail,
    title: "Email Integration",
    description: "Send personalized emails directly through the platform with customizable templates and tracking."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption and compliance with GDPR, CCPA, and other privacy regulations."
  },
  {
    icon: Database,
    title: "Centralized Database",
    description: "Single source of truth for all candidate data with powerful search and filtering capabilities."
  },
  {
    icon: MessageSquare,
    title: "Instant Support",
    description: "Get help within minutes with our integrated support system and screenshot sharing."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work seamlessly with your team through shared pipelines, notes, and feedback systems."
  }
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar currentPath="/features" />

      <main className="flex-1">
        {/* Hero Section with Gradient Background */}
        <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50" />
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 bg-gradient-to-r from-indigo-600 to-indigo-400 inline-block text-transparent bg-clip-text">
                Recruitment Reimagined
              </h1>
              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                Powerful features that transform how you find and hire talent.
                Experience the future of recruitment today.
              </p>
              <Link href="/sign-up">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-8">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Main Features Section */}
        <section className="p-8 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Core Features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered platform streamlines your entire recruitment process
              </p>
            </div>
            <div className="grid gap-8 lg:gap-12 lg:grid-cols-3">
              {mainFeatures.map((feature, index) => (
                <MotionDiv
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-indigo-200">
                    <div className="relative w-14 h-14 mb-6">
                      <div className="absolute inset-0 bg-indigo-100 rounded-xl" />
                      <feature.icon className="h-7 w-7 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <div className="text-sm font-medium text-indigo-600">
                      {feature.highlight}
                    </div>
                  </Card>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features Grid */}
        <section className="p-12 md:py-32 bg-slate-50">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
              A comprehensive suite of tools designed to make your recruitment process more efficient
            </p>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {additionalFeatures.map((feature, index) => (
                <MotionDiv
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                    <div className="relative w-12 h-12 mb-6">
                      <div className="absolute inset-0 bg-indigo-100 rounded-lg" />
                      <feature.icon className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 bg-white border-t">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Hiring?</h2>
              <p className="text-lg text-muted-foreground mb-12">
                Join thousands of companies already hiring smarter with SmartHR · Flow.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/sign-up">
                  <Button size="lg" className="px-8">Start Free Trial</Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="px-8">View Pricing</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 