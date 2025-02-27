'use client';

import { useEffect, useState } from "react";
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
import { listService } from "@/lib/services/list.service";
import { toast } from "@/hooks/use-toast";
import { Plus, ListPlus } from "lucide-react";

interface AddToListDialogProps {
  resumeId: string;
  userId: string;
  companyId: string;
  onSuccess?: () => void;
}

interface List {
  id: string;
  name: string;
  description?: string;
  items: number;
  companyId: string;
  jobId?: string;
}

export function AddToListDialog({ resumeId, userId, companyId, jobId, onSuccess }: AddToListDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState<List[]>([]);
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newList, setNewList] = useState({ name: '', description: '' });
  const [selectedList, setSelectedList] = useState('');
  const [notes, setNotes] = useState('');

  const loadLists = async () => {
    try {
      const lists = await listService.getLists(jobId);
      setLists(lists);
    } catch (error) {
      console.error('Error loading lists:', error);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const list = await listService.createList({
        name: newList.name,
        description: newList.description,
        companyId,
        createdBy: userId,
        jobId
      });

      setLists([...lists, list]);
      setSelectedList(list.id);
      setShowNewListForm(false);
      setNewList({ name: '', description: '' });

      toast({
        title: "List created",
        description: "New list has been created successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create list.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async () => {
    if (!selectedList) return;
    setLoading(true);

    try {
      await listService.addToList({
        listId: selectedList,
        resumeId,
        notes,
        addedBy: userId
      });

      toast({
        title: "Added to list",
        description: "Candidate has been added to the selected list."
      });

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add candidate to list:" + error,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <ListPlus className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to List</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!showNewListForm ? (
            <>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Select List</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowNewListForm(true)}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New List
                  </Button>
                </div>
                <select
                  value={selectedList}
                  onChange={(e) => setSelectedList(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select a list...</option>
                  {lists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name} ({list.items || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this candidate..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddToList} 
                  disabled={!selectedList || loading}
                >
                  {loading ? "Adding..." : "Add to List"}
                </Button>
              </div>
            </>
          ) : (
            <form onSubmit={handleCreateList} className="space-y-4">
              <div className="space-y-2">
                <Label>List Name</Label>
                <Input
                  value={newList.name}
                  onChange={(e) => setNewList(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter list name..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newList.description}
                  onChange={(e) => setNewList(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter list description..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewListForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create List"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 