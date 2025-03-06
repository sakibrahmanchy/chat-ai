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
import { JobEditor } from "@/components/job-editor";

interface PackageFormProps {
  packageId?: string;
  onSuccess?: () => void;
  setPackageId?: (id: string | null) => void;
}

export function PackageForm({ packageId, onSuccess, setPackageId }: PackageFormProps) {
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

  useEffect(() => {
    const loadPackage = async () => {
      if (!packageId) return;
      const pkg = await adminCreditService.getPackage(packageId);
      setFormData({
        name: pkg.name,
        description: pkg.description,
        credits: pkg.credits.toString(),
        price: pkg.price.toString(),
        type: pkg.type,
        included_actions: pkg.included_actions || []
      });
      setOpen(true); // Open dialog when packageId is provided
    };

    if (packageId) {
      loadPackage();
    }
  }, [packageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (packageId) {
        // Update existing package
        await adminCreditService.updatePackage(packageId, {
          ...formData,
          credits: parseInt(formData.credits),
          price: parseFloat(formData.price)
        });
      } else {
        // Create new package
        await adminCreditService.createPackage({
          ...formData,
          credits: parseInt(formData.credits),
          price: parseFloat(formData.price)
        });
      }

      toast({
        title: "Success",
        description: `Credit package ${packageId ? 'updated' : 'created'} successfully.`,
      });

      setOpen(false);
      onSuccess?.();
      
      // Only reset form if creating new package
      if (!packageId) {
        setFormData({
          name: '',
          description: '',
          credits: '',
          price: '',
          type: 'one_time',
          included_actions: []
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: `Failed to ${packageId ? 'update' : 'create'} credit package.`,
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
    <Dialog open={open} onOpenChange={(openChange) => {
      if (openChange === false) {
        setFormData({
          name: '',
          description: '',
          credits: '',
          price: '',
          type: 'one_time',
          included_actions: []
        });
        setPackageId?.(null);
        setOpen(false)
      }
    }}>
      <DialogTrigger asChild>
        {!packageId && <Button onClick={() => setOpen(true)}>Add New Package</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{packageId ? 'Edit' : 'Create'} Credit Package</DialogTitle>
        </DialogHeader>
        <div className="py-4">
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
              <JobEditor
                content={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="Package description..."
                
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
                onValueChange={(value: 'one_time') => 
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
                {loading ? "Saving..." : "Save Package"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 