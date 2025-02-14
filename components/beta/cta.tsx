import { Button } from "@/components/ui/button";
import Link from "next/link";

export function BetaCTA() {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join our beta program today and get early access to all premium features.
            Limited spots available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/beta/feedback">
              <Button 
                size="lg" 
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Join Beta Program
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto bg-transparent text-white hover:bg-white/10"
            >
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm opacity-75 mt-6">
            No credit card required. Free during beta period.
          </p>
        </div>
      </div>
    </section>
  );
} 