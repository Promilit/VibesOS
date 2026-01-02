"use client";

import { useState, useEffect, use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BoardTab } from "./components/board-tab";
import { AnalyticsTab } from "./components/analytics-tab";
import { SettingsTab } from "./components/settings-tab";

export default function ProjectDetailPage({
  params
}: {
  params: Promise<{ projectId: string }>
}) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "board";

  const [activeTab, setActiveTab] = useState(defaultTab);

  const projectId = resolvedParams.projectId as Id<"projects">;
  const project = useQuery(api.projects.admin.queries.getProject, { projectId });

  // Update tab from URL params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["board", "analytics", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Loading state
  if (project === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state - project not found
  if (project === null) {
    return (
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Project Not Found</h1>
            <p className="text-muted-foreground mt-2">
              The project you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/projects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          </div>
          {project.description && (
            <p className="text-muted-foreground ml-12">{project.description}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="space-y-4">
          <BoardTab projectId={projectId} project={project} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <SettingsTab projectId={projectId} project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
