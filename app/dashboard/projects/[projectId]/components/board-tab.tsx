"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Lightbulb, Bug, Map } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ProjectColumn } from "./project-column";
import { ProjectItemCard } from "./project-item-card";
import { CreateItemDialog } from "./create-item-dialog";
import { ItemDetailDialog } from "./item-detail-dialog";

// Board type display configuration
const BOARD_CONFIG = {
  "feature-requests": { name: "Feature Requests", icon: Lightbulb },
  "bug-reports": { name: "Bug Reports", icon: Bug },
  "internal-roadmap": { name: "Internal Roadmap", icon: Map },
};

interface BoardTabProps {
  projectId: Id<"projects">;
  project: any;
}

export function BoardTab({ projectId, project }: BoardTabProps) {
  // Fetch project boards
  const projectBoards = useQuery(api.projects.admin.queries.getProjectBoards, { projectId });

  // State for selected board tab
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  // Set initial board when data loads
  const effectiveBoardId = useMemo(() => {
    if (selectedBoardId) return selectedBoardId;
    if (projectBoards && projectBoards.length > 0) {
      return projectBoards[0]._id;
    }
    return null;
  }, [selectedBoardId, projectBoards]);

  // Fetch board data for selected board
  const boardData = useQuery(
    api.projects.admin.queries.getBoardItems,
    effectiveBoardId ? { projectId, boardId: effectiveBoardId as Id<"projectBoards"> } : "skip"
  );

  const moveItem = useMutation(api.projects.admin.mutations.moveItem);
  const reorderItem = useMutation(api.projects.admin.mutations.reorderItem);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);

  // Get the current version of the selected item from the reactive query
  // This ensures the dialog shows updated data (e.g., comment count) when it changes
  const selectedItem = useMemo(() => {
    if (!selectedItemId || !boardData) return null;
    for (const column of boardData.columns) {
      const items = boardData.itemsByColumn[column._id] || [];
      const item = items.find((i: any) => i._id === selectedItemId);
      if (item) return item;
    }
    return null;
  }, [selectedItemId, boardData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Loading state
  if (projectBoards === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No boards - legacy project without board structure
  if (projectBoards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          This project doesn't have any boards configured.
        </p>
      </div>
    );
  }

  const columns = boardData?.columns || [];
  const itemsByColumn = boardData?.itemsByColumn || {};

  const handleItemClick = (item: any) => {
    setSelectedItemId(item._id);
    setIsItemDialogOpen(true);
  };

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
      const item = items.find((i: any) => i._id === activeId);
      if (item) {
        draggedItem = item;
        sourceColumnId = column._id;
        break;
      }
    }

    if (!draggedItem || !sourceColumnId) return;

    // Determine if we're dropping on a column or an item
    const targetColumn = columns.find((c: any) => c._id === overId);
    const isColumnDrop = !!targetColumn;

    if (isColumnDrop) {
      // Dropped on a column - move to end of that column
      const targetColumnId = overId as Id<"projectColumns">;
      const targetItems = itemsByColumn[targetColumnId] || [];

      // Calculate new position at the end
      const maxPosition =
        targetItems.length > 0
          ? Math.max(...targetItems.map((item: any) => item.position))
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
        const item = items.find((i: any) => i._id === overId);
        if (item) {
          targetItem = item;
          targetColumnId = column._id;
          break;
        }
      }

      if (!targetItem || !targetColumnId) return;

      const targetItems = itemsByColumn[targetColumnId] || [];
      const targetIndex = targetItems.findIndex((i: any) => i._id === targetItem!._id);

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
          targetColumnId: targetColumnId as Id<"projectColumns">,
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
      const item = items.find((i: any) => i._id === activeId);
      if (item) {
        activeItem = item;
        break;
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Board Tabs */}
      <Tabs
        value={effectiveBoardId || undefined}
        onValueChange={(value) => setSelectedBoardId(value)}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            {projectBoards.map((board: any) => {
              const config = BOARD_CONFIG[board.boardType as keyof typeof BOARD_CONFIG];
              const Icon = config?.icon || Lightbulb;
              return (
                <TabsTrigger key={board._id} value={board._id} className="gap-2">
                  <Icon className="h-4 w-4" />
                  {config?.name || board.name}
                </TabsTrigger>
              );
            })}
          </TabsList>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {projectBoards.map((board: any) => (
          <TabsContent key={board._id} value={board._id} className="mt-0">
            {boardData === undefined ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop items between columns to update their status
                </p>
                <DndContext
                  sensors={sensors}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {columns.map((column: any) => {
                      const items = itemsByColumn[column._id] || [];
                      return (
                        <ProjectColumn
                          key={column._id}
                          column={column}
                          items={items}
                          projectId={projectId}
                          onItemClick={handleItemClick}
                        />
                      );
                    })}
                  </div>

                  <DragOverlay>
                    {activeItem ? (
                      <div className="opacity-50">
                        <ProjectItemCard item={activeItem} isDragging />
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <CreateItemDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectId={projectId}
        boardId={effectiveBoardId as Id<"projectBoards">}
        columns={columns}
      />

      <ItemDetailDialog
        item={selectedItem}
        projectId={projectId}
        open={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
      />
    </div>
  );
}
