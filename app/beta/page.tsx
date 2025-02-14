import { BetaHero } from "@/components/beta/hero";
import { BetaFeatures } from "@/components/beta/features";
import { BetaBenefits } from "@/components/beta/benefits";
import { BetaCTA } from "@/components/beta/cta";
import { BetaTestimonials } from "@/components/beta/testimonials";

export default function BetaPage() {
  return (
    <main className="min-h-screen">
      <BetaHero />
      <BetaFeatures />
      <BetaBenefits />
      <BetaTestimonials />
      <BetaCTA />
    </main>
  );
} 