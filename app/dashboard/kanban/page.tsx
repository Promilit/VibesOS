// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus } from "lucide-react";
import { KanbanBoard } from "./kanban-board";
import { EmbedInstructions } from "./embed-instructions";
import { CreateItemDialog } from "./create-item-dialog";

export default function KanbanPage() {
  const [selectedBoardId, setSelectedBoardId] = useState<Id<"kanbanBoards"> | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Check if boards are initialized
  const boardsStatus = useQuery(api.kanban.admin.queries.areBoardsInitialized);
  const boards = useQuery(api.kanban.admin.queries.getBoards);
  const initializeBoards = useMutation(api.kanban.admin.mutations.initializeBoards);

  const [isInitializing, setIsInitializing] = useState(false);

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      await initializeBoards({});
    } catch (error) {
      console.error("Failed to initialize boards:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  // Set first board as selected when boards load
  useEffect(() => {
    if (boards && boards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(boards[0]._id);
    }
  }, [boards, selectedBoardId]);

  // Loading state
  if (boardsStatus === undefined || boards === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not initialized state
  if (!boardsStatus.initialized) {
    return (
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kanban Boards</h1>
            <p className="text-muted-foreground mt-2">
              Manage feature requests, bug reports, and your internal roadmap
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Get Started with Kanban Boards</CardTitle>
              <CardDescription>
                Initialize your kanban boards to start collecting feedback and managing your roadmap
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">
                  This will create three boards for you:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Feature Requests</strong> - Collect and prioritize feature ideas from users
                  </li>
                  <li>
                    <strong className="text-foreground">Bug Reports</strong> - Track and manage bug reports
                  </li>
                  <li>
                    <strong className="text-foreground">Internal Roadmap</strong> - Share your product roadmap (view-only for users)
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-3">
                  Each board includes 4 columns: Backlog → In Progress → Review → Done
                </p>
              </div>

              <Button
                onClick={handleInitialize}
                disabled={isInitializing}
                size="lg"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  "Initialize Boards"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kanban Boards</h1>
          <p className="text-muted-foreground mt-2">
            Manage your boards and embed them on your website
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <EmbedInstructions />

      <Tabs value={selectedBoardId || ""} onValueChange={(value) => setSelectedBoardId(value as Id<"kanbanBoards">)}>
        <TabsList className="grid w-full grid-cols-3">
          {boards.map((board) => (
            <TabsTrigger key={board._id} value={board._id}>
              {board.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {boards.map((board) => (
          <TabsContent key={board._id} value={board._id} className="mt-6">
            <KanbanBoard boardId={board._id} />
          </TabsContent>
        ))}
      </Tabs>

      {selectedBoardId && (
        <CreateItemDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          boardId={selectedBoardId}
        />
      )}
    </div>
  );
}
