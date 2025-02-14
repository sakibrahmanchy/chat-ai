import { PreviewHero } from "@/components/preview/hero";
import { ProductFeatures } from "@/components/preview/features";
import { ProductShowcase } from "@/components/preview/showcase";
import { ValueProposition } from "@/components/preview/value-prop";
import { AccessForm } from "@/components/preview/access-form";
import { TargetBenefits } from "@/components/preview/target-benefits";
import { UserJourney } from "@/components/preview/user-journey";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SmartHRFlow - AI-Powered Recruitment Platform",
  description: "SmartHRFlow - The next generation of intelligent talent matching. Transform your hiring process with AI-powered recruitment tools."
};

export default function EarlyAccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-[1400px] mx-auto">
        <PreviewHero />
        <UserJourney />
        <ProductShowcase />
        <TargetBenefits />
        <ProductFeatures />
        <ValueProposition />
        <AccessForm />
      </div>
    </main>
  );
} 