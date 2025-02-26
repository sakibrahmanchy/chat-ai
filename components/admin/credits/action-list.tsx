'use client';

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, MoreVertical, Power, PowerOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminCreditActionService, CreditAction } from "@/lib/services/admin/credit-actions.service";
import { toast } from "@/hooks/use-toast";

interface ActionListProps {
  actions: CreditAction[];
}

export function ActionList({ actions }: ActionListProps) {
  const [actionList, setActionList] = useState(actions);

  const handleStatusChange = async (id: string, isActive: boolean) => {
    try {
      await adminCreditActionService.toggleActionStatus(id, isActive);
      setActionList(prev =>
        prev.map(action =>
          action.id === id ? { ...action, is_active: isActive } : action
        )
      );
      toast({
        title: "Action updated",
        description: `Action has been ${isActive ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update action status.",
        variant: "destructive",
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Action Type</TableHead>
          <TableHead>Credits Required</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {actionList.map((action) => (
          <TableRow key={action.id}>
            <TableCell className="font-medium">{action.action_type}</TableCell>
            <TableCell>{action.credits_required}</TableCell>
            <TableCell>
              <Badge variant={action.is_active ? "success" : "secondary"}>
                {action.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>{action.description}</TableCell>
            <TableCell>{new Date(action.updated_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Action
                  </DropdownMenuItem>
                  {action.is_active ? (
                    <DropdownMenuItem onClick={() => handleStatusChange(action.id, false)}>
                      <PowerOff className="mr-2 h-4 w-4" />
                      Deactivate
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => handleStatusChange(action.id, true)}>
                      <Power className="mr-2 h-4 w-4" />
                      Activate
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 