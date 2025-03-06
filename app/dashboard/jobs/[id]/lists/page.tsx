import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { listService } from "@/lib/services/list.service";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default async function ListsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
  const { id: jobId } = await params;
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  // Get user's company ID
  const { data: user } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', userId)
    .single();

  if (!user?.company_id) {
    redirect("/onboarding");
  }

  const lists = await listService.getLists(jobId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Candidate Lists for <a href={`/dashboard/jobs/${jobId}`} className="text-blue-500">{job?.title}</a></h1>
        <Button asChild>
          <Link href="/dashboard/lists/new">
            <Plus className="h-4 w-4 mr-2" />
            Create New List
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {lists.map((list) => (
          <Link key={list.id} href={`/dashboard/jobs/${jobId}/lists/${list.id}`}>
            <Card className="p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold">{list.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {list.description}
              </p>
              <p className="text-sm mt-4">
                {list.items || 0} candidates
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 