import { Button } from "@/components/ui/button";
// import { SignInButton } from "@clerk/nextjs";
import { ArrowRight, Briefcase, CheckCircle2, LineChart, Rocket, Users, Sparkles, Shield, Lock, Server, Star, Mail, FileText, Download, Share, MessageSquare, ListChecks } from "lucide-react";
// import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MotionDiv } from "@/components/motion";
import { AuthButton } from "@/components/auth-button";
import { Footer } from "@/components/layout/footer";
import { DashboardPreview } from "@/components/smarthrflow/dashboard-preview";
// import { TargetBenefits } from "@/components/smarthrflow/target-benefits";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DemoCandidateListView } from "@/components/demo-candidate-list-view";
import { SupportButton } from "@/components/support-button";
import { Navbar } from "@/components/layout/navbar";

// Add FAQ data
const faqs = [
  {
    question: "How does the AI-powered candidate matching work?",
    answer: "Our AI system analyzes resumes by comparing candidate skills, experience, and qualifications against your job requirements. It uses natural language processing to understand both explicit and implicit matches, providing a score out of 10 for each candidate. The system considers factors like skill relevance, experience level, and overall profile fit."
  },
  {
    question: "What are credits and how do they work?",
    answer: "Credits are used for AI-powered resume matching and analysis. Each time you process a resume through our AI matching system, it consumes one credit. You can purchase credits as needed, and they never expire. The system automatically tracks your credit usage and provides detailed transaction history."
  },
  {
    question: "How can I manage my candidate pipeline?",
    answer: "You can manage candidates through our intuitive pipeline system with three main stages: Pending Review, Shortlisted, and Rejected. You can bulk process candidates, send emails directly through the platform, and track candidate status across all your job postings. The system also provides detailed analytics for each stage."
  },
  {
    question: "Can I customize the matching criteria?",
    answer: "Yes, you can customize matching in two ways: 'Match All Skills' (AND) or 'Match Any Skills' (OR). You can also set specific requirements for experience levels, location preferences, and adjust the importance of different skills. The system allows filtering by match scores, skills, location, and experience."
  },
  {
    question: "How do I export candidate data?",
    answer: "You can export candidate data in both CSV and Excel formats. The exports include comprehensive information such as candidate details, match scores, skills, status, and contact information. You can export data for individual jobs or across multiple positions."
  },
  {
    question: "What information is included in the match analysis?",
    answer: "The match analysis provides detailed insights including: overall match score, skills match score, experience match score, education match score, matching skills, missing skills, key strength areas, and areas for improvement. Each analysis also includes specific recommendations for candidate evaluation."
  },
  {
    question: "How secure is my recruitment data?",
    answer: "We implement enterprise-grade security measures to protect your data. All information is encrypted both in transit and at rest. We use secure cloud infrastructure, implement role-based access control, and maintain strict data privacy standards in compliance with industry regulations."
  },
  {
    question: "Can I track recruitment metrics and performance?",
    answer: "Yes, the dashboard provides comprehensive recruitment metrics including: active jobs, total candidates, average match rates, time-to-shortlist, response rates, and detailed pipeline analytics. You can track performance across individual jobs or your entire recruitment process."
  },
  {
    question: "How do I manage multiple job postings?",
    answer: "The platform allows you to manage multiple job postings simultaneously. Each job has its own candidate pipeline, matching criteria, and analytics. You can easily switch between jobs, compare candidates across positions, and maintain separate shortlists for each role."
  },
  {
    question: "What support options are available?",
    answer: "We provide multiple support channels including: in-app documentation, email support, and detailed guides for all features. Our team is available to help with technical questions, best practices, and optimization of your recruitment process."
  }
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar currentPath="/" />

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
            className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e508_1px,transparent_1px),linear-gradient(to_bottom,#4f46e508_1px,transparent_1px)] bg-[size:400px_64px]"
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
              className="inline-flex items-center gap-2 backdrop-blur-sm border border-indigo-100 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6 shadow-sm"
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>AI-powered recruitment platform for modern hiring teams.</span>
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
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mx-auto mt-20"
          >
            <DashboardPreview />
          </MotionDiv>

          {/* Product Preview Section */}
          <section className="pt-24 px-4 relative overflow-hidden">
            <div className="max-w-screen-xl mx-auto">
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-3xl mx-auto mb-16"
              >
                <h2 className="text-3xl font-bold tracking-tight">
                  Intelligence that works for you
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  A streamlined hiring process that saves you time and money, with a focus on quality and efficiency.
                </p>
              </MotionDiv>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {steps.map((step, index) => (
              <MotionDiv
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
              </MotionDiv>
            ))}
          </div>
            </div>
          </section>
        </div>
      </section>


       {/* Add new highlight section */}
       <section className="py-8 md:py-12 lg:py-24 bg-slate-50">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-[1.1] ">
            Enhanced Workflow
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Revolutionary tools to streamline your recruitment process
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="flex flex-col items-center text-center">
              <Mail className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Email Integration</h3>
              <p className="text-muted-foreground">Contact candidates directly through the platform</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <ListChecks className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Bulk Processing</h3>
              <p className="text-muted-foreground">Manage multiple candidates efficiently</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <MessageSquare className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Instant Support</h3>
              <p className="text-muted-foreground">Get help when you need it</p>
            </div>
          </div>
        </div>
      </section>

      {/* Replace or add after the Enhanced Workflow section */}
      <section className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-12">
          <h2 className="text-3xl font-bold leading-[1.1]">
            <span className="text-indigo-600">One pipeline,</span> All candidates.
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Process candidates efficiently with bulk actions, and direct communication. All in one place.
          </p>
        </div>
        <div className="md:flex md:justify-center px-4 md:px-16 md:py-4 max-w-screen">
          <DemoCandidateListView />
              </div>
      </section>      

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
                We combine cutting-edge AI technology with intuitive design to
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
              The power of AI in your hands
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Streamline your hiring process with our AI-powered platform.
            </p>
          </MotionDiv>
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <BenefitCard key={index} {...benefit} index={index} />
            ))}
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
            Get started with SmartHRFlow today and see the difference for yourself.
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

      {/* Add FAQ section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-2">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-center mb-8">
              Everything you need to know about SmartHRFlow
            </p>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Still have questions? We are here to help.
              </p>
              <SupportButton>
                <Button>Contact Support</Button>
              </SupportButton>
            </div>
          </div>
        </div>
      </section>

      
      {/* Update demo candidate list description
      <section className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-8">
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
            Powerful Candidate Management
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Process candidates efficiently with bulk actions, direct communication, and instant support
          </p>
        </div>
        <DemoCandidateList candidates={DEMO_RESUMES} />
      </section> */}

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
  },
  {
    title: "Bulk Actions",
    description: "Process multiple candidates simultaneously - shortlist, reject, or export with a single click",
    icon: ListChecks,
  },
  {
    title: "Email Integration",
    description: "Contact candidates directly through the platform with seamless email functionality",
    icon: Mail,
  },
  {
    title: "Instant Support",
    description: "Get help instantly with our integrated support system including screenshot sharing",
    icon: MessageSquare,
  },
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
    icon: <FileText className="h-6 w-6" />,
    title: "Define Your Requirements",
    description: "Specify your ideal candidate profile and job requirements",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600"
  },
  {
    title: "Share Job Postings",
    description: "Share your job postings with your team and candidates",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    icon: <Share className="h-6 w-6" />
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "AI-Powered Resume Processing",
    description: "Our AI instantly processes resumes and extracts the most relevant information",
    bgColor: "bg-violet-50",
    textColor: "text-violet-600"
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "Smart Candidate Matching",
    description: "Our AI matches candidates based on their skills and experience",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600"
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: "Filter & Shortlist",
    description: "Save and organize your preferred candidates, and filter them based on your criteria",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600"
  },
  {
    icon: <Download className="h-6 w-6" />,
    title: "Export Details",
    description: "Download candidate profiles, details and reach them out",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600"
  },
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
interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  index?: number;
}

function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index ? index * 0.1 : 0 }}
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
interface BenefitCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  index?: number;
}

function BenefitCard({ icon: Icon, title, description, index }: BenefitCardProps) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index ? index * 0.1 : 0 }}
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