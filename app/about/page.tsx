import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MotionDiv } from "@/components/motion";
import { ArrowRight, Users, Target, Clock, Shield } from "lucide-react";
import Link from "next/link";

const values = [
  {
    icon: Users,
    title: "People First",
    description: "We believe in putting people at the center of recruitment, using technology to enhance human connections, not replace them."
  },
  {
    icon: Target,
    title: "Innovation",
    description: "Continuously pushing boundaries to create smarter, more efficient recruitment solutions."
  },
  {
    icon: Clock,
    title: "Efficiency",
    description: "Dedicated to saving our customers time and resources while improving hiring outcomes."
  },
  {
    icon: Shield,
    title: "Trust",
    description: "Committed to maintaining the highest standards of security and privacy in handling sensitive data."
  }
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar currentPath="/about" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-12 md:pt-32 md:pb-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                Transforming Recruitment Through Innovation
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                We are on a mission to make hiring smarter, faster, and more human.
              </p>
              <Link href="/sign-up">
                <Button size="lg" className="gap-2">
                  Join Us Today
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 bg-slate-50">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <MotionDiv
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-6 text-center h-full hover:shadow-lg transition-shadow">
                    <div className="mx-auto relative w-12 h-12 mb-6">
                      <div className="absolute inset-0 bg-indigo-100 rounded-lg" />
                      <value.icon className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </Card>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-8">
                To empower organizations to build great teams by making recruitment more efficient, 
                intelligent, and human-centric. We believe that the right match between talent and 
                opportunity can transform both businesses and careers.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 