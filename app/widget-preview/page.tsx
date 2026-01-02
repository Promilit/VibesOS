"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Lightbulb, Bug, Map, ChevronUp, MessageSquare } from "lucide-react";

// Board type display configuration
const BOARD_CONFIG: Record<string, { name: string; icon: React.ComponentType<{ className?: string }> }> = {
  "feature-requests": { name: "Feature Requests", icon: Lightbulb },
  "bug-reports": { name: "Bug Reports", icon: Bug },
  "internal-roadmap": { name: "Internal Roadmap", icon: Map },
};

function WidgetPreviewContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") as Id<"projects"> | null;
  const theme = searchParams.get("theme") || "light";

  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch project boards - uses authenticated admin query
  const projectBoards = useQuery(
    api.projects.admin.queries.getProjectBoards,
    projectId ? { projectId } : "skip"
  );

  // Track auth errors
  useEffect(() => {
    // If query returns null (not undefined which means loading), check for auth issues
    if (projectBoards === null) {
      setAuthError("Unable to load project data. Please ensure you're logged in.");
    }
  }, [projectBoards]);

  // Determine effective board ID
  const effectiveBoardId = selectedBoardId || (projectBoards && projectBoards.length > 0 ? projectBoards[0]._id : null);

  // Fetch board data
  const boardData = useQuery(
    api.projects.admin.queries.getBoardItems,
    projectId && effectiveBoardId
      ? { projectId, boardId: effectiveBoardId as Id<"projectBoards"> }
      : "skip"
  );

  const isDark = theme === "dark";

  // Loading state - show for max 5 seconds then show helpful message
  const [loadingTooLong, setLoadingTooLong] = useState(false);
  useEffect(() => {
    if (projectBoards === undefined) {
      const timer = setTimeout(() => setLoadingTooLong(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [projectBoards]);

  if (projectBoards === undefined) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? "bg-gray-900" : "bg-white"}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        {loadingTooLong && (
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Loading preview... Make sure you&apos;re logged in.
          </p>
        )}
      </div>
    );
  }

  // Auth error state
  if (authError) {
    return (
      <div className={`min-h-screen p-4 flex items-center justify-center ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
        <div className="text-center">
          <p className="text-amber-500 mb-2">Authentication Required</p>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{authError}</p>
        </div>
      </div>
    );
  }

  // No project ID
  if (!projectId) {
    return (
      <div className={`min-h-screen p-4 flex items-center justify-center ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
        <div className="text-center">
          <p className="text-muted-foreground">No project ID specified</p>
        </div>
      </div>
    );
  }

  // No boards
  if (!projectBoards || projectBoards.length === 0) {
    return (
      <div className={`min-h-screen p-4 flex items-center justify-center ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
        <div className="text-center">
          <p className="text-muted-foreground">No boards configured for this project</p>
        </div>
      </div>
    );
  }

  const columns = boardData?.columns || [];
  const itemsByColumn = boardData?.itemsByColumn || {};

  return (
    <div className={`min-h-screen p-4 ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <div className="max-w-6xl mx-auto">
        <div className={`border rounded-lg p-4 shadow-sm ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
          {/* Board Tabs */}
          <div className={`border-b mb-4 ${isDark ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex gap-1">
              {projectBoards.map((board: any) => {
                const config = BOARD_CONFIG[board.boardType];
                const Icon = config?.icon || Lightbulb;
                const isSelected = board._id === effectiveBoardId;
                return (
                  <button
                    key={board._id}
                    onClick={() => setSelectedBoardId(board._id)}
                    className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 ${
                      isSelected
                        ? isDark
                          ? "border-blue-400 text-blue-400"
                          : "border-blue-500 text-blue-600"
                        : isDark
                        ? "border-transparent text-gray-400 hover:text-gray-200"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {config?.name || board.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading board data */}
          {boardData === undefined ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : columns.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No columns found for this board
            </div>
          ) : (
            /* Columns Grid */
            <div className="grid grid-cols-4 gap-4">
              {columns.map((column: any) => {
                const items = itemsByColumn[column._id] || [];
                return (
                  <div
                    key={column._id}
                    className={`rounded-lg p-3 min-h-[300px] ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-sm">{column.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
                        {items.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {items.length === 0 ? (
                        <p className={`text-xs text-center py-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          No items
                        </p>
                      ) : (
                        items.map((item: any) => (
                          <div
                            key={item._id}
                            className={`p-3 rounded border shadow-sm ${isDark ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}
                          >
                            <div className="font-medium text-sm">{item.title}</div>
                            {item.description && (
                              <div className={`text-xs mt-1 line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {item.description}
                              </div>
                            )}
                            <div className={`flex items-center gap-3 mt-2 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                              <span className="flex items-center gap-1">
                                <ChevronUp className="h-3 w-3" />
                                {item.voteCount || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {item.commentCount || 0}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className={`mt-4 text-center text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Widget Preview - Powered by UserVibes
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WidgetPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <WidgetPreviewContent />
    </Suspense>
  );
}
