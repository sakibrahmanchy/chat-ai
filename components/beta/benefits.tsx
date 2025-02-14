import { Check } from "lucide-react";

export function BetaBenefits() {
  const benefits = [
    {
      title: "Save Time and Resources",
      description: "Reduce resume screening time by up to 75% with AI-powered automation.",
      points: [
        "Automated resume parsing and analysis",
        "Instant candidate scoring and ranking",
        "Bulk resume processing capability"
      ]
    },
    {
      title: "Make Better Hiring Decisions",
      description: "Use data-driven insights to identify the best candidates quickly.",
      points: [
        "Objective skill-based matching",
        "Detailed candidate analytics",
        "Standardized evaluation criteria"
      ]
    },
    {
      title: "Improve Team Collaboration",
      description: "Streamline your hiring process with built-in collaboration tools.",
      points: [
        "Real-time team feedback",
        "Centralized candidate management",
        "Customizable hiring workflows"
      ]
    }
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Benefits for Your Business
          </h2>
          <p className="text-xl text-muted-foreground">
            Transform your recruitment process with our intelligent platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground mb-6">{benefit.description}</p>
              <ul className="space-y-3">
                {benefit.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 