import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { ArrowRight, BrainCircuit, Briefcase, CheckCircle2, LineChart, Rocket, Users, Sparkles, Shield, Lock, Server, Star, Mail, Phone, MapPin, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MotionDiv } from "@/components/motion";
import { AuthButton } from "@/components/auth-button";
import { FeaturesSection } from "@/components/features-section";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { DemoCandidateList } from "@/components/demo-candidate-list";
import { Logo } from "@/components/preview/logo";
import { Footer } from "@/components/layout/footer";
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between p-4">
          <Link href="/" className="flex items-center space-x-3">
              <Logo size={40} animated />

            {/* <span className="text-xl tracking-tight">
              <span className="font-light">Smart</span>
              <span className="font-bold text-indigo-600">HR</span>
              <span className="font-medium">Flow</span>
            </span> */}
          </Link>
          <div className="flex items-center gap-4">
            <AuthButton 
              variant="ghost" 
              size="sm"
              signInText="Sign In"
              loadingText="Loading..."
              redirectText="Taking you to dashboard..."
              redirectDelay={500}
              showLoadingText
              shouldTrackRedirect
              trackingEvent="signin_redirect"
              className="hover:bg-indigo-50"
            >
              Sign In
            </AuthButton>
            <AuthButton 
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/50 transition-all duration-200"
              size="sm"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </AuthButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50" />
          
          {/* Animated floating orbs */}
          <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-200/20 to-purple-200/20 blur-3xl animate-float-slow" />
          <div className="absolute bottom-40 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-blue-200/20 to-indigo-200/20 blur-3xl animate-float" />
          
          {/* Animated grid */}
          <div 
            className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e508_1px,transparent_1px),linear-gradient(to_bottom,#4f46e508_1px,transparent_1px)] bg-[size:64px_64px]"
            style={{
              maskImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, black 40%, transparent 72%)',
              animation: 'gridMove 20s linear infinite'
            }}
          />
          
          {/* Animated particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-indigo-500/10"
                style={{
                  width: Math.random() * 4 + 2 + 'px',
                  height: Math.random() * 4 + 2 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  animation: `float ${Math.random() * 6 + 4}s linear infinite`
                }}
              />
            ))}
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto relative">
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Badge */}
            <MotionDiv
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-medium mb-6 shadow-sm"
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>AI-powered hiring with next-gen technology</span>
            </MotionDiv>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 pb-4">
              Streamline your hiring process with next-gen AI
            </h1>
            
            {/* Subheading */}
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your hiring process with AI-powered candidate screening, automated resume parsing, 
              and intelligent matching technology. Hire smarter, not harder.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <AuthButton 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-purple-500/50 transition-all duration-300 h-12 px-8"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </AuthButton>
              <Button variant="outline" className="h-12 px-8 bg-white/80 backdrop-blur-sm border-indigo-100">
                Watch Demo
              </Button>
            </div>

            {/* Feature List */}
            <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 max-w-4xl mx-auto">
              {[               
                "Job Post Management", 
                "Complex Resume Parsing",
                "Smart Candidate Matching",
                "Detailed Candidate Profiles",
                "Sorting and filtering",
                "Analytics Dashboard",
                "Candidate list management"
              ].map((feature, index) => (
                <MotionDiv 
                  key={feature}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-50 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-gray-700">{feature}</span>
                </MotionDiv>
              ))}
            </div>
          </MotionDiv>

          {/* Product Preview Section */}
          <section className="py-24 px-4 relative overflow-hidden">
            <div className="max-w-screen-xl mx-auto">
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-3xl mx-auto mb-16"
              >
                <h2 className="text-3xl font-bold tracking-tight">
                  Try Our Interactive Demo
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Click on candidates below to see their detailed profiles, skills, and match scores. 
                  Use the search and filters to find specific candidates.
                </p>
              </MotionDiv>

              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative">
                  <DemoCandidateList />
                </div>
              </MotionDiv>
            </div>
          </section>
        </div>
      </section>

      <FeaturesSection />

      {/* Enhanced About Section */}
      <section className="py-24 bg-slate-50/50 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] -z-10" />
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <MotionDiv
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tight">
                The Future of Recruitment is Here
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                SmartHRFlow combines cutting-edge AI technology with intuitive design to 
                help businesses find and hire the best talent efficiently. Our platform 
                automates time-consuming tasks, provides deep insights, and ensures you 
                never miss out on the perfect candidate.
              </p>
            </MotionDiv>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50/50">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">
              Built with Security in Mind
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              We prioritize the security and privacy of your data with industry-standard 
              security measures and best practices.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <MotionDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm border"
              >
                <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Benefits Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-transparent -z-10" />
        <div className="max-w-screen-xl mx-auto">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight">
              Why Choose SmartHRFlow?
            </h2>
          </MotionDiv>
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <BenefitCard key={index} {...benefit} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center">
            How It Works
          </h2>
          <div className="mt-16">
            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2 text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4">
        <div className="max-w-screen-xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of companies using SmartHRFlow to hire better, faster, and smarter.
          </p>
          <div className="mt-10">
            <AuthButton 
              size="lg"
              className="group relative bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/50 transition-all duration-200"
            >
              <span className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-0 group-hover:opacity-20 transition duration-200 blur" />
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </AuthButton>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Add features constant
const features = [
  {
    icon: Briefcase,
    title: "Smart Job Posting",
    description: "Create and manage job postings with AI-powered requirements analysis."
  },
  {
    icon: Users,
    title: "Candidate Matching",
    description: "Automatically match candidates to jobs based on skills and experience."
  },
  {
    icon: LineChart,
    title: "Analytics & Insights",
    description: "Get detailed insights into your recruitment process and performance."
  },
  {
    icon: Rocket,
    title: "Automated Screening",
    description: "Save time with AI-powered resume screening and ranking."
  }
];

const benefits = [
  {
    icon: CheckCircle2,
    title: "Time-Saving Automation",
    description: "Reduce manual work by up to 80% with AI-powered resume parsing and candidate screening."
  },
  {
    icon: Users,
    title: "Better Candidate Matches",
    description: "Find the perfect candidates faster with intelligent matching algorithms."
  },
  {
    icon: LineChart,
    title: "Data-Driven Decisions",
    description: "Make informed hiring decisions with comprehensive analytics and insights."
  }
];

const steps = [
  {
    title: "Post a Job",
    description: "Create detailed job listings with custom requirements and skills."
  },
  {
    title: "Upload Resumes",
    description: "Bulk upload resumes or receive applications directly."
  },
  {
    title: "AI Analysis",
    description: "Our AI analyzes and matches candidates to your requirements."
  },
  {
    title: "Hire the Best",
    description: "Review matches, schedule interviews, and make great hires."
  }
];

// Update security features with more appropriate messaging
const securityFeatures = [
  {
    icon: Shield,
    title: "Security First",
    description: "Built with modern security practices and regular security updates"
  },
  {
    icon: Lock,
    title: "Data Privacy",
    description: "Your data is encrypted and handled according to industry standards"
  },
  {
    icon: Server,
    title: "Reliable Infrastructure",
    description: "Hosted on enterprise-grade cloud infrastructure for reliability"
  }
];

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, index }: any) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group hover:shadow-md transition-all duration-300 border-none shadow-sm">
        <div className="p-6">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 bg-indigo-100 rounded-lg group-hover:scale-110 transition-transform duration-300" />
            <Icon className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="mt-4 font-semibold group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {description}
          </p>
              </div>
      </Card>
    </MotionDiv>
  );
}

// Benefit Card Component
function BenefitCard({ icon: Icon, title, description, index }: any) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="absolute -inset-1 rounded-full bg-indigo-100/50 group-hover:scale-110 blur transition-transform duration-300 -z-10" />
        </div>
        <h3 className="mt-4 text-xl font-semibold group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-muted-foreground">
          {description}
        </p>
      </div>
    </MotionDiv>
  );
}
