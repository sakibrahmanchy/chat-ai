'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminCreditActionService } from "@/lib/services/admin/credit-actions.service";
import { toast } from "@/hooks/use-toast";

interface ActionFormProps {
  onSuccess?: () => void;
}

export function ActionForm({ onSuccess }: ActionFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    action_type: '',
    credits_required: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminCreditActionService.createAction({
        ...formData,
        credits_required: parseInt(formData.credits_required)
      });

      toast({
        title: "Success",
        description: "Credit action created successfully.",
      });

      setOpen(false);
      onSuccess?.();
      setFormData({
        action_type: '',
        credits_required: '',
        description: ''
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to create credit action.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Action</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Credit Action</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="action_type">Action Type</Label>
            <Input
              id="action_type"
              value={formData.action_type}
              onChange={(e) => setFormData(prev => ({ ...prev, action_type: e.target.value }))}
              placeholder="e.g., view_resume"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credits_required">Credits Required</Label>
            <Input
              id="credits_required"
              type="number"
              value={formData.credits_required}
              onChange={(e) => setFormData(prev => ({ ...prev, credits_required: e.target.value }))}
              placeholder="1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Action description..."
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Action"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 