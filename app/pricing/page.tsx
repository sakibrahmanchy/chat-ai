import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { pricingService } from "@/lib/services/pricing.service";
import { Footer } from "@/components/layout/footer";
import { MotionDiv } from "@/components/motion";
import { CreditCalculator } from "@/components/pricing/credit-calculator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Add package descriptions and features
const packageDetails = {
  'free_tier': {
    description: "Perfect for trying out SmartHRFlow",
    features: [
      "10 AI-powered candidate matches",
      "Basic candidate management",
      "Single job posting",
      "Standard resume parsing",
      "Email support"
    ]
  },
  'starter_pack': {
    description: "Great for small businesses and startups",
    features: [
      "50 AI-powered candidate matches",
      "Advanced candidate scoring",
      "Up to 3 active job postings",
      "Bulk resume upload",
      "Priority email support",
      "Basic analytics dashboard"
    ]
  },
  'growth_pack': {
    description: "Ideal for growing teams",
    features: [
      "100 AI-powered candidate matches",
      "Team collaboration features",
      "Up to 10 active job postings",
      "Custom scoring templates",
      "Advanced analytics",
      "Priority support"
    ]
  },
  'pro_recruiter': {
    description: "Perfect for professional recruiters",
    features: [
      "250 AI-powered candidate matches",
      "Unlimited job postings",
      "Advanced team management",
      "API access",
      "Custom workflow automation",
      "Dedicated success manager"
    ]
  },
  'talent_acquisition': {
    description: "For high-volume hiring needs",
    features: [
      "500 AI-powered candidate matches",
      "Enterprise-grade features",
      "Advanced integrations",
      "Custom AI model training",
      "Premium analytics",
      "24/7 priority support"
    ]
  },
  'enterprise': {
    description: "Custom solutions for large organizations",
    features: [
      "Unlimited AI matches",
      "Custom deployment options",
      "Dedicated account team",
      "Custom integrations",
      "SLA guarantees",
      "White-label options"
    ]
  }
};

// Add FAQ data specific to pricing
const pricingFaqs = [
  {
    question: "How do credits work?",
    answer: "Credits are our virtual currency used for AI-powered features. Each credit can be used for actions like resume parsing, candidate matching, or AI analysis. Credits never expire and roll over when you purchase a new package."
  },
  {
    question: "What happens when I run out of credits?",
    answer: "When your credits are running low, you'll receive a notification. You can purchase additional credits at any time. Your account remains active even with 0 credits, but AI features will be paused until you add more credits."
  },
  {
    question: "Can I upgrade my package later?",
    answer: "Yes! You can upgrade to a larger package at any time. Any unused credits from your current package will automatically roll over to your new package."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee if you're not satisfied with our service. Unused credits can be refunded within this period. After 30 days, credits cannot be refunded but never expire."
  },
  {
    question: "Can I share credits across my team?",
    answer: "Yes, credits are shared at the company level. All team members can use the available credits for their recruitment activities. You can track credit usage by team member in the analytics dashboard."
  },
  {
    question: "How do I track credit usage?",
    answer: "You can monitor your credit usage in real-time through the dashboard. We provide detailed analytics showing credit consumption by action type, team member, and job posting."
  },
  {
    question: "Are there any hidden fees?",
    answer: "No hidden fees! You only pay for the credit package you purchase. There are no monthly fees, no setup fees, and no maintenance fees. All features within your package are included in the price."
  },
  {
    question: "Can I customize a package?",
    answer: "Yes! For enterprise needs or custom requirements, contact our sales team. We can create tailored packages with custom credit amounts and special features specific to your organization's needs."
  }
];

export default async function PricingPage() {
  const packages = await pricingService.getAvailablePackages();
  const creditActions = await pricingService.getCreditActions();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar currentPath="/pricing" />

      <main className="flex-1 px-4 md:px-20 py-6">
        {/* Hero Section */}
        <section className="relative md:pt-40 md:pb-32 overflow-hidden">
          <div className="absolute inset-0" />
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 bg-gradient-to-r from-indigo-600 to-indigo-400 inline-block text-transparent bg-clip-text">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Choose the perfect plan for your recruitment needs. 
                All plans include our core AI-powered features.
              </p>
            </div>
          </div>
        </section>

        {/* Credit Calculator Section */}
        <section className="relative z-10 mb-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Calculate Your Credits</h2>
              <p className="text-lg text-muted-foreground">
                Estimate how many credits you'll need based on your recruitment activities
              </p>
            </div>
            <CreditCalculator creditActions={creditActions} packages={packages} />
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="relative z-10">
          <div>
            <div className="grid gap-8 lg:grid-cols-3">
              {packages.map((plan, index) => (
                <MotionDiv
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    className={`relative flex flex-col p-8 h-full ${plan.is_popular ? 'bg-indigo-600 text-white' : 'bg-white'} transition-all duration-300`}
                  >
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <p className={`text-sm ${plan.is_popular ? 'text-indigo-200' : 'text-muted-foreground'} mb-6`}>
                        {packageDetails[plan.id as keyof typeof packageDetails]?.description}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">
                          {plan.price === 0 ? 'Free' : `$${plan.price}`}
                        </span>
                        {plan.price > 0 && (
                          <span className={plan.is_popular ? 'text-indigo-200' : 'text-muted-foreground'}>
                            one-time payment
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 mb-8">
                      <div className="space-y-4">
                        {plan?.features.map((feature: string) => (
                          <div key={feature} className="flex items-start gap-3">
                            <Check className={`h-5 w-5 ${plan.is_popular ? 'text-white' : 'text-indigo-600'} shrink-0 mt-0.5`} />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link href={`/sign-up${plan.price > 0 ? `?plan=${plan.id}` : ''}`} className="block">
                      <Button 
                        className={`w-full ${plan.is_popular ? 'bg-white text-indigo-600 hover:bg-indigo-50' : ''}`}
                        variant={plan.is_popular ? "default" : "outline"}
                      >
                        {plan.price === 0 ? 'Get Started' : 'Start Free Trial'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </Card>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* Credit Policy Section */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Flexible Credit System</h2>
              <p className="text-lg text-muted-foreground">
                Our credit system is designed to give you maximum flexibility and value
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6">
                <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Never Expires</h3>
                <p className="text-muted-foreground">
                  Your credits will never expire. Use them at your own pace without any pressure.
                </p>
              </Card>
              <Card className="p-6">
                <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Roll Over Credits</h3>
                <p className="text-muted-foreground">
                  Unused credits automatically roll over when you purchase a new package.
                </p>
              </Card>
              <Card className="p-6">
                <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Hidden Fees</h3>
                <p className="text-muted-foreground">
                  Transparent pricing with no monthly commitments or hidden charges.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-slate-50">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground text-center mb-12">
                Everything you need to know about our pricing and credits system
              </p>

              <Accordion type="single" collapsible className="w-full">
                {pricingFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="bg-white border rounded-lg mb-4">
                    <AccordionTrigger className="px-4 hover:no-underline hover:bg-slate-50">
                      <span className="text-left font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground mb-6">
                  Still have questions about pricing or credits?
                </p>
                <Button variant="outline" size="lg" className="gap-2">
                  Contact Sales
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Enterprise CTA */}
        <section className="py-24 bg-white border-t">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Need a Custom Solution?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Contact us to discuss enterprise plans, custom features, and dedicated support.
              </p>
              <Button size="lg" variant="outline" className="px-8">
                Contact Sales
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 