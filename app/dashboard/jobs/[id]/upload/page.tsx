import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ResumeUploader } from "@/components/smarthrflow/resume-uploader";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default async function UploadResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: jobId } = await params;
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Verify user has access to this job
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, title, company_id, status')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    redirect("/dashboard/jobs");
  }

  // Verify user belongs to the company
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', userId)
    .single();

  if (userError || user?.company_id !== job.company_id) {
    redirect("/dashboard/jobs");
  }

  // check credits
  const { data: userCredits, error: userCreditsError } = await supabase
    .from('company_credits')
    .select('credits_balance')
    .eq('company_id', job.company_id)
    .single();  

  if (userCreditsError || !userCredits || !userCredits.credits_balance) {
    // prompt user to buy credits with a beautiful UX
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-indigo-50" />
        <CardContent className="relative p-6">
          <div className="text-center space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-violet-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold tracking-tight">
                Credits Required
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                You will need credits to process resumes. Each resume processing uses 2 credits (1 credit for processing and 1 for matching and scoring for the job).
                Get started with our affordable credit packages.
              </p>
            </div>

            <div className="space-y-4 max-w-sm mx-auto">
              <Alert variant="default" className="bg-violet-50 border-violet-200">
                <AlertCircle className="h-4 w-4 text-violet-500" />
                <AlertTitle className="text-violet-700">Why credits?</AlertTitle>
                <AlertDescription className="text-violet-600 text-sm">
                  Credits help us maintain high-quality AI processing for your resumes, 
                  ensuring accurate candidate matching and analysis.
                </AlertDescription>
              </Alert>

              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <Link href="/dashboard/billing" className="w-full">
                  <Button className="w-full group">
                    Get Credits
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-xs text-muted-foreground">
                Need a custom package? {" "}
                <Link href="/contact" className="text-violet-600 hover:underline">
                  Contact our sales team
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Upload Resume</h1>
          <p className="text-muted-foreground">
            Upload candidate resumes for <a href={`/dashboard/jobs/${jobId}`} className="text-blue-500 hover:underline">{job.title}</a>
          </p>
        </div>

        <div className="flex flex-col items-start space-y-2 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-md font-semibold tracking-tight">
            This action will use 2 credits.
          </h3>
          <p className="text-muted-foreground text-xs flex flex-col gap-2">
            You will need credits to process resumes. Each resume processing uses 2 credits.
            <ul className="list-disc list-inside">
              <li>1 credit for processing.</li>
              <li>1 credit for matching and scoring for the job.</li>
            </ul>
            Both happens together, as we automatically match and score the resume for the job.
          </p>
        </div>
        
        {job.status === 'active' && (
          <ResumeUploader jobId={jobId} />
        )}

        {job.status !== 'active' && (
          <div>
            <p className="text-muted-foreground">
              This job is not active. Please activate it to upload resumes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 