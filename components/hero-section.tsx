import { DemoCandidateList } from "./demo-candidate-list";

export function HeroSection() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            AI-Powered Resume Screening & Candidate Matching
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Find the perfect candidates faster with our intelligent matching system
          </p>
        </div>

        <div className="mt-16">
          <DemoCandidateList />
        </div>
      </div>
    </section>
  );
} 