// @ts-nocheck
"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: Id<"kanbanBoards">;
}

export function CreateItemDialog({ open, onOpenChange, boardId }: CreateItemDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColumnId, setSelectedColumnId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const boardData = useQuery(api.kanban.admin.queries.getBoardWithColumns, { boardId });
  const createItem = useMutation(api.kanban.admin.mutations.createItem);

  // Set default column to Backlog when board loads
  if (boardData && !selectedColumnId) {
    const backlogColumn = boardData.columns.find((c: any) => c.slug === "backlog");
    if (backlogColumn) {
      setSelectedColumnId(backlogColumn._id);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    if (!selectedColumnId) {
      toast({
        title: "Error",
        description: "Please select a column",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createItem({
        boardId,
        columnId: selectedColumnId as Id<"kanbanColumns">,
        title: title.trim(),
        description: description.trim() || undefined,
      });

      toast({
        title: "Success",
        description: "Item created successfully",
      });

      // Reset form
      setTitle("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create item",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
            <DialogDescription>
              Add a new item to your kanban board
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter item title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter item description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="column">Column *</Label>
              <Select
                value={selectedColumnId}
                onValueChange={setSelectedColumnId}
                disabled={isSubmitting || !boardData}
              >
                <SelectTrigger id="column">
                  <SelectValue placeholder="Select a column" />
                </SelectTrigger>
                <SelectContent>
                  {boardData?.columns.map((column: any) => (
                    <SelectItem key={column._id} value={column._id}>
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
