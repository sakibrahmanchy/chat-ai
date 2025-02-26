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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminCreditService } from "@/lib/services/admin/credit.service";
import { toast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
  credits: number;
}

interface CreditAssignmentProps {
  companies: Company[];
  onSuccess?: () => void;
}

export function CreditAssignment({ companies, onSuccess }: CreditAssignmentProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyId: '',
    credits: '',
    notes: '',
    type: 'addition' as 'addition' | 'deduction'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const credits = parseInt(formData.credits) * (formData.type === 'deduction' ? -1 : 1);
      
      await adminCreditService.assignCreditsToCompany(
        formData.companyId,
        credits,
        formData.notes
      );

      toast({
        title: "Success",
        description: `Credits ${formData.type === 'addition' ? 'added to' : 'deducted from'} company successfully.`,
      });

      setOpen(false);
      onSuccess?.();
      setFormData({
        companyId: '',
        credits: '',
        notes: '',
        type: 'addition'
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign credits.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Assign Credits</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Credits to Company</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Select
              value={formData.companyId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, companyId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name} (Current Credits: {company.credits})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Action Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'addition' | 'deduction') => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="addition">Add Credits</SelectItem>
                <SelectItem value="deduction">Deduct Credits</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="credits">Number of Credits</Label>
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Reason for credit assignment..."
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Assign Credits"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 