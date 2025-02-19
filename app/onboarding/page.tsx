import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/onboarding/signup-form";
import Header from "@/components/header";

export default async function OnboardingPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div>
      <Header />
      <main className="container max-w-2xl mx-auto py-8 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Complete Your Profile</h1>
            <p className="text-muted-foreground">
              Please provide some additional information to complete your account setup.
            </p>
          </div>
          
          <SignupForm userId={userId} userEmail="" />
        </div>
      </main>
    </div>
  );
} 