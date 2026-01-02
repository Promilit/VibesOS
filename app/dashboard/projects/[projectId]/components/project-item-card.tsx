"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

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

interface ProjectItemCardProps {
  item: Item;
  isDragging?: boolean;
  onClick?: () => void;
}

export function ProjectItemCard({ item, isDragging = false, onClick }: ProjectItemCardProps) {
  return (
    <Card
      className={`${isDragging ? "opacity-50" : ""} cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors`}
      onClick={(e) => {
        // Only trigger onClick if not dragging
        if (onClick && !isDragging) {
          onClick();
        }
      }}
    >
      <CardContent className="p-3 space-y-2">
        <h4 className="font-medium text-sm leading-tight">{item.title}</h4>
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" />
            <span>{item.voteCount}</span>
          </div>
          {item.commentCount > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{item.commentCount}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
