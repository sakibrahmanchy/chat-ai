import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { pricingService } from "@/lib/services/pricing.service";
import { Footer } from "@/components/layout/footer";
import { MotionDiv } from "@/components/motion";

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

export default async function PricingPage() {
  const packages = await pricingService.getAvailablePackages();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar currentPath="/pricing" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50" />
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

        {/* Pricing Cards */}
        <section className="py-24 bg-white relative z-10">
          <div className="container">
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
                    className={`relative flex flex-col p-8 h-full ${
                      plan.is_popular 
                        ? 'border-2 border-indigo-600 shadow-xl' 
                        : 'hover:border-indigo-200 hover:shadow-lg'
                    } transition-all duration-300`}
                  >
                    {plan.is_popular && (
                      <div className="absolute -top-5 left-0 right-0 mx-auto w-fit rounded-full bg-indigo-600 px-4 py-1 text-sm font-medium text-white">
                        Most Popular
                      </div>
                    )}

                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        {packageDetails[plan.id as keyof typeof packageDetails]?.description}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">
                          {plan.price === 0 ? 'Free' : `$${plan.price}`}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-muted-foreground">/month</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 mb-8">
                      <div className="space-y-4">
                        {packageDetails[plan.id as keyof typeof packageDetails]?.features.map((feature) => (
                          <div key={feature} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link href={`/sign-up${plan.price > 0 ? `?plan=${plan.id}` : ''}`} className="block">
                      <Button 
                        className={`w-full ${plan.is_popular ? 'bg-gradient-to-r from-indigo-600 to-indigo-500' : ''}`}
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

        {/* FAQ Section */}
        <section className="py-24 bg-slate-50">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Frequently Asked Questions
              </h2>
              {/* Add FAQ Accordion component here */}
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