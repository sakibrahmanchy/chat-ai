import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function SupportTicketsPage() {
  const { data: tickets, error } = await supabase
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
    .order('created_at', { ascending: false });


  if (error) {
    console.error('Error fetching support tickets:', error);
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Support Tickets</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium">Subject</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">User</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Created</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Screenshot</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {tickets?.map((ticket) => {
                  const statusColors = {
                    open: "yellow",
                    in_progress: "blue",
                    resolved: "green",
                    closed: "gray",
                  };
                  const status = ticket.status as keyof typeof statusColors;

                  return (
                    <tr
                      key={ticket.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle">{ticket.subject}</td>
                      <td className="p-4 align-middle">
                        <div>
                          <div>{ticket.users?.first_name} {ticket.users?.last_name} ({ticket.users?.company_id?.name})</div>
                          <div className="text-sm text-muted-foreground">
                            {ticket.users?.email}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant="outline" className={`bg-${statusColors[status]}-50 text-${statusColors[status]}-700 border-${statusColors[status]}-200`}>
                          {status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                      </td>
                      <td className="p-4 align-middle">
                        {ticket.screenshot_url && (
                          <a 
                            href={ticket.screenshot_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/admin/support/${ticket.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 