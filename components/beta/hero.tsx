import { Button } from "@/components/ui/button";
import Link from "next/link";

export function BetaHero() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Transform Your Hiring Process with AI-Powered Talent Matching
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Join our exclusive beta program and be among the first to experience the future of recruitment. 
            Designed specifically for HR professionals and growing businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/beta/feedback">
              <Button size="lg" className="w-full sm:w-auto">
                Join Beta Program
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
} 