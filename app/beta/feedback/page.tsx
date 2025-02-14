import { BetaFeedbackForm } from "@/components/beta/feedback-form";

export default function BetaFeedbackPage() {
  return (
    <div className="min-h-screen py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-4">
              Help Shape the Future of Recruitment
            </h1>
            <p className="text-lg text-muted-foreground">
              We value your expertise and would love to hear your thoughts on our platform
            </p>
          </div>
          <BetaFeedbackForm />
        </div>
      </div>
    </div>
  );
} 