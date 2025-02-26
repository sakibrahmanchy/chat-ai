'use client';

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminCreditService } from "@/lib/services/admin/credit.service";
import { adminCreditActionService, CreditAction } from "@/lib/services/admin/credit-actions.service";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface PackageFormProps {
  onSuccess?: () => void;
}

export function PackageForm({ onSuccess }: PackageFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState<CreditAction[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    credits: '',
    price: '',
    type: 'one_time' as const,
    included_actions: [] as string[]
  });

  useEffect(() => {
    const loadActions = async () => {
      const actionsList = await adminCreditActionService.getAllActions();
      setActions(actionsList);
    };
    loadActions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminCreditService.createPackage({
        ...formData,
        credits: parseInt(formData.credits),
        price: parseFloat(formData.price)
      });

      toast({
        title: "Success",
        description: "Credit package created successfully.",
      });

      setOpen(false);
      onSuccess?.();
      setFormData({
        name: '',
        description: '',
        credits: '',
        price: '',
        type: 'one_time',
        included_actions: []
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create credit package.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAction = (actionId: string) => {
    setFormData(prev => ({
      ...prev,
      included_actions: prev.included_actions.includes(actionId)
        ? prev.included_actions.filter(id => id !== actionId)
        : [...prev.included_actions, actionId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Package</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Credit Package</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Package Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Basic Package"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Package description..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData(prev => ({ ...prev, credits: e.target.value }))}
                placeholder="100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="99.99"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Package Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'one_time' | 'subscription') => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one_time">One Time</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Included Actions</Label>
            <div className="grid grid-cols-1 gap-2 border rounded-lg p-4">
              {actions.map(action => (
                <div key={action.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={action.id}
                    checked={formData.included_actions.includes(action.id)}
                    onCheckedChange={() => toggleAction(action.id)}
                  />
                  <Label htmlFor={action.id} className="flex-1">
                    <div className="font-medium">{action.action_type}</div>
                    <div className="text-sm text-gray-500">{action.description}</div>
                  </Label>
                  <span className="text-sm text-gray-500">
                    {action.credits_required} credits
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Package"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 