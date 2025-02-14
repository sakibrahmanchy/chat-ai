import { 
  Brain, 
  Clock, 
  UserCheck, 
  BarChart3, 
  Users, 
  Zap 
} from "lucide-react";

export function BetaFeatures() {
  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Resume Analysis",
      description: "Automatically extract and analyze key information from resumes with high accuracy."
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Time-Saving Automation",
      description: "Reduce screening time by up to 75% with automated candidate matching and ranking."
    },
    {
      icon: <UserCheck className="h-8 w-8" />,
      title: "Smart Candidate Matching",
      description: "Match candidates to jobs based on skills, experience, and cultural fit."
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Detailed Analytics",
      description: "Get insights into your hiring pipeline and make data-driven decisions."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Collaborative Hiring",
      description: "Share candidate profiles and feedback with your team in real-time."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Candidate Scoring",
      description: "Score candidates instantly against job requirements with detailed breakdowns."
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Powerful Features for Modern Recruitment
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to streamline your hiring process
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-lg border bg-white hover:shadow-lg transition-shadow"
            >
              <div className="text-primary mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 