"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";
import { SortableItemCard } from "./sortable-item-card";

interface Column {
  _id: Id<"kanbanColumns">;
  name: string;
  slug: string;
  order: number;
  canAddItems: boolean;
}

interface Item {
  _id: Id<"kanbanItems">;
  title: string;
  description?: string;
  voteCount: number;
  position: number;
  status: "backlog" | "in-progress" | "review" | "done";
  createdAt: number;
}

interface KanbanColumnProps {
  column: Column;
  items: Item[];
  boardId: Id<"kanbanBoards">;
}

export function KanbanColumn({ column, items, boardId }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column._id,
  });

  const itemIds = items.map((item) => item._id);

  return (
    <Card ref={setNodeRef} className="flex flex-col h-[calc(100vh-300px)] min-h-[500px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{column.name}</CardTitle>
          <Badge variant="secondary" className="ml-2">
            {items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-2 px-3 pb-3">
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItemCard key={item._id} item={item} boardId={boardId} />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            Drop items here
          </div>
        )}
      </CardContent>
    </Card>
  );
}
