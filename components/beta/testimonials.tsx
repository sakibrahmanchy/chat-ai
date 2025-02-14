import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export function BetaTestimonials() {
  const testimonials = [
    {
      quote: "This platform has completely transformed how we handle recruitment. The AI-powered screening saves us countless hours.",
      author: "Sarah Johnson",
      role: "HR Director",
      company: "TechCorp Inc.",
      avatar: "/avatars/sarah.jpg"
    },
    {
      quote: "The candidate matching accuracy is impressive. We're finding better candidates faster than ever before.",
      author: "Michael Chen",
      role: "Talent Acquisition Manager",
      company: "Growth Startup",
      avatar: "/avatars/michael.jpg"
    },
    {
      quote: "Finally, a recruitment tool that actually understands the technical requirements of our industry.",
      author: "David Rodriguez",
      role: "Technical Recruiter",
      company: "Software Solutions Ltd",
      avatar: "/avatars/david.jpg"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            What Early Users Are Saying
          </h2>
          <p className="text-xl text-muted-foreground">
            Join these forward-thinking companies in revolutionizing recruitment
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-lg italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback>
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 