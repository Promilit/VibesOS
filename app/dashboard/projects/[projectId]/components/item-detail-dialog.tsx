"use client";

import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Calendar } from "lucide-react";
import { CommentsSection } from "./comments-section";
import { formatDistanceToNow } from "date-fns";

interface Item {
  _id: Id<"projectItems">;
  title: string;
  description?: string;
  voteCount: number;
  commentCount: number;
  position: number;
  status: "backlog" | "in-progress" | "review" | "done";
  createdAt: number;
}

interface ItemDetailDialogProps {
  item: Item | null;
  projectId: Id<"projects">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemDetailDialog({ item, projectId, open, onOpenChange }: ItemDetailDialogProps) {
  if (!item) return null;

  const statusColors = {
    backlog: "bg-gray-500",
    "in-progress": "bg-blue-500",
    review: "bg-yellow-500",
    done: "bg-green-500",
  };

  const statusLabels = {
    backlog: "Backlog",
    "in-progress": "In Progress",
    review: "Review",
    done: "Done",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{item.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-3 pt-2">
            <Badge className={statusColors[item.status]}>
              {statusLabels[item.status]}
            </Badge>
            <span className="flex items-center gap-1 text-xs">
              <ThumbsUp className="h-3 w-3" />
              {item.voteCount} {item.voteCount === 1 ? "vote" : "votes"}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              Created {formatDistanceToNow(item.createdAt, { addSuffix: true })}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {item.description && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {item.description}
              </p>
            </div>
          )}

          <CommentsSection itemId={item._id} projectId={projectId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
