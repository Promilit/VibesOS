"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Id } from "@/convex/_generated/dataModel";
import { ProjectItemCard } from "./project-item-card";

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

interface SortableProjectItemCardProps {
  item: Item;
  projectId: Id<"projects">;
  onClick?: () => void;
}

export function SortableProjectItemCard({ item, projectId, onClick }: SortableProjectItemCardProps) {
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
      <ProjectItemCard item={item} isDragging={isDragging} onClick={onClick} />
    </div>
  );
}
