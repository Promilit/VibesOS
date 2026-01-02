// @ts-nocheck
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Id } from "@/convex/_generated/dataModel";
import { ItemCard } from "./item-card";

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

interface SortableItemCardProps {
  item: Item;
  boardId: Id<"kanbanBoards">;
}

export function SortableItemCard({ item, boardId }: SortableItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ItemCard item={item} isDragging={isDragging} boardId={boardId} />
    </div>
  );
}
