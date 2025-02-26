import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { listService } from "@/lib/services/list.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Metadata } from "next";

interface PageProps {
  params: {
    listId: string;
  };
}

export const metadata: Metadata = {
  title: "List Details",
  description: "View and manage your candidate list",
};

export default async function ListPage({ params }: PageProps): Promise<JSX.Element> {
  const { listId } = params;
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Get user's company ID
  const { data: user } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', userId)
    .single();

  if (!user?.company_id) {
    redirect("/onboarding");
  }

  // Get list details and items
  const list = await listService.getList(listId);
  const items = await listService.getListItems(listId);

  // Verify user has access to this list
  if (list.company_id !== user.company_id) {
    redirect("/dashboard/lists");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/lists">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{list.name}</h1>
            <p className="text-sm text-muted-foreground">{list.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete List
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{item.resume.parsed_content.full_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.resume.parsed_content.current_position}
                </p>
                <div className="flex gap-2 mt-2">
                  {item.resume.searchable_skills.slice(0, 5).map((skill, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Added by {item.added_by.name} on {new Date(item.created_at).toLocaleDateString()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 