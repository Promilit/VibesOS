// @ts-nocheck
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { KanbanColumn } from "./kanban-column";
import { ItemCard } from "./item-card";

interface KanbanBoardProps {
  boardId: Id<"kanbanBoards">;
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const boardData = useQuery(api.kanban.admin.queries.getBoardItems, { boardId });
  const moveItem = useMutation(api.kanban.admin.mutations.moveItem);
  const reorderItem = useMutation(api.kanban.admin.mutations.reorderItem);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (boardData === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { columns, itemsByColumn } = boardData;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the item being dragged
    let draggedItem = null;
    let sourceColumnId = null;

    for (const column of columns) {
      const items = itemsByColumn[column._id] || [];
      const item = items.find((i) => i._id === activeId);
      if (item) {
        draggedItem = item;
        sourceColumnId = column._id;
        break;
      }
    }

    if (!draggedItem || !sourceColumnId) return;

    // Determine if we're dropping on a column or an item
    const targetColumn = columns.find((c) => c._id === overId);
    const isColumnDrop = !!targetColumn;

    if (isColumnDrop) {
      // Dropped on a column - move to end of that column
      const targetColumnId = overId as Id<"kanbanColumns">;
      const targetItems = itemsByColumn[targetColumnId] || [];

      // Calculate new position at the end
      const maxPosition = targetItems.length > 0
        ? Math.max(...targetItems.map((item) => item.position))
        : 0;
      const newPosition = maxPosition + 1000;

      if (sourceColumnId !== targetColumnId) {
        await moveItem({
          itemId: draggedItem._id,
          targetColumnId,
          targetPosition: newPosition,
        });
      }
    } else {
      // Dropped on an item - insert before/after
      let targetItem = null;
      let targetColumnId = null;

      for (const column of columns) {
        const items = itemsByColumn[column._id] || [];
        const item = items.find((i) => i._id === overId);
        if (item) {
          targetItem = item;
          targetColumnId = column._id;
          break;
        }
      }

      if (!targetItem || !targetColumnId) return;

      const targetItems = itemsByColumn[targetColumnId] || [];
      const targetIndex = targetItems.findIndex((i) => i._id === targetItem!._id);

      // Calculate new position (insert before target)
      let newPosition: number;
      if (targetIndex === 0) {
        // Insert at beginning
        newPosition = targetItem.position - 1000;
      } else {
        // Insert between items
        const beforeItem = targetItems[targetIndex - 1];
        newPosition = (beforeItem.position + targetItem.position) / 2;
      }

      if (sourceColumnId === targetColumnId) {
        // Reorder within same column
        await reorderItem({
          itemId: draggedItem._id,
          newPosition,
        });
      } else {
        // Move to different column
        await moveItem({
          itemId: draggedItem._id,
          targetColumnId: targetColumnId as Id<"kanbanColumns">,
          targetPosition: newPosition,
        });
      }
    }
  };

  // Find the active item for drag overlay
  let activeItem = null;
  if (activeId) {
    for (const column of columns) {
      const items = itemsByColumn[column._id] || [];
      const item = items.find((i) => i._id === activeId);
      if (item) {
        activeItem = item;
        break;
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const items = itemsByColumn[column._id] || [];
          return (
            <KanbanColumn
              key={column._id}
              column={column}
              items={items}
              boardId={boardId}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="opacity-50">
            <ItemCard item={activeItem} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
