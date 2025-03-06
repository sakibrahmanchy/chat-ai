import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function SupportTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      users:user_id (
        email,
        first_name,
        last_name,
        company_id (
          name
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching support ticket:', error);
    return <div>Error loading ticket</div>;
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  const statusColors = {
    open: "yellow",
    in_progress: "blue",
    resolved: "green",
    closed: "gray",
  };
  const status = ticket.status as keyof typeof statusColors;

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/support">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tickets
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Support Ticket</h2>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ticket Details</CardTitle>
              <Badge variant="outline" className={`bg-${statusColors[status]}-50 text-${statusColors[status]}-700 border-${statusColors[status]}-200`}>
                {status.replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Subject</h3>
              <p>{ticket.subject}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Message</h3>
              <p className="whitespace-pre-wrap">{ticket.message}</p>
            </div>

            {ticket.screenshot_url && (
              <div>
                <h3 className="font-semibold mb-2">Screenshot</h3>
                <a 
                  href={ticket.screenshot_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Screenshot
                </a>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">User Information</h3>
              <div className="space-y-1">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {ticket.users?.first_name} {ticket.users?.last_name}
                </p>
                <p>
                  <span className="font-medium">Company:</span>{" "}
                  {ticket.users?.company_id?.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {ticket.users?.email}
                </p>
                <p>
                  <span className="font-medium">Created:</span>{" "}
                  {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 