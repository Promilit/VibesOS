// @ts-nocheck
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowBigUp, Edit, Trash2, User } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { EditItemDialog } from "./edit-item-dialog";

interface Item {
  _id: Id<"kanbanItems">;
  title: string;
  description?: string;
  voteCount: number;
  position: number;
  status: "backlog" | "in-progress" | "review" | "done";
  createdAt: number;
  createdByUserId?: string; // Clerk user ID
  createdByAdminId?: string;
}

interface ItemCardProps {
  item: Item;
  isDragging?: boolean;
  boardId?: Id<"kanbanBoards">;
}

export function ItemCard({ item, isDragging = false, boardId }: ItemCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const isUserCreated = !!item.createdByUserId;

  return (
    <>
      <Card
        className={`cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
          isDragging ? "opacity-50" : ""
        }`}
      >
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm leading-tight flex-1">{item.title}</h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              {boardId && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {item.description}
            </p>
          )}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isUserCreated ? (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <User className="h-3 w-3" />
                  User
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Admin
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowBigUp className="h-4 w-4" />
              <span className="font-medium">{item.voteCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {boardId && (
        <EditItemDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          item={item}
          boardId={boardId}
        />
      )}
    </>
  );
}
