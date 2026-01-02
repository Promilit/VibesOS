"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, FolderKanban, Calendar, Trash2, Settings, Key, Lightbulb, Bug, Map } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function ProjectsPage() {
  const projects = useQuery(api.projects.admin.queries.getProjects);
  const apiKeys = useQuery(api.apiKeys.getUserApiKeys);
  const createProject = useMutation(api.projects.admin.mutations.createProject);
  const deleteProject = useMutation(api.projects.admin.mutations.deleteProject);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublicViewOnly: false,
    apiKeyId: "" as string,
    enabledBoards: ["feature-requests", "bug-reports", "internal-roadmap"] as string[],
  });

  // Filter to only show API keys that are not already linked to a project
  const availableApiKeys = apiKeys?.filter((key: any) => !key.linkedProject) || [];
  const hasApiKeys = availableApiKeys.length > 0;

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;
    if (!formData.apiKeyId) {
      alert("Please select an API key for this project");
      return;
    }
    if (formData.enabledBoards.length === 0) {
      alert("Please enable at least one board type");
      return;
    }

    setIsCreating(true);
    try {
      const projectId = await createProject({
        name: formData.name,
        description: formData.description || undefined,
        isPublicViewOnly: formData.isPublicViewOnly,
        apiKeyId: formData.apiKeyId as Id<"apiKeys">,
        enabledBoards: formData.enabledBoards,
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        isPublicViewOnly: false,
        apiKeyId: "",
        enabledBoards: ["feature-requests", "bug-reports", "internal-roadmap"],
      });
      setIsCreateDialogOpen(false);

      // Navigate to the new project
      window.location.href = `/dashboard/projects/${projectId}`;
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const toggleBoard = (boardType: string) => {
    setFormData((prev) => ({
      ...prev,
      enabledBoards: prev.enabledBoards.includes(boardType)
        ? prev.enabledBoards.filter((b) => b !== boardType)
        : [...prev.enabledBoards, boardType],
    }));
  };

  const handleDeleteProject = async (projectId: string) => {
    setIsDeleting(true);
    try {
      await deleteProject({ projectId: projectId as any });
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (projects === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your feedback boards
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Get Started with Projects</CardTitle>
              <CardDescription>
                Create your first project to start collecting feedback and managing your roadmap
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">
                  Each project is a Kanban board with:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>
                    <strong className="text-foreground">4 columns</strong> - Backlog, In Progress, Review, Done
                  </li>
                  <li>
                    <strong className="text-foreground">Customizable branding</strong> - Colors, fonts, logo per project
                  </li>
                  <li>
                    <strong className="text-foreground">Analytics dashboard</strong> - Track votes, activity, trends
                  </li>
                  <li>
                    <strong className="text-foreground">Embeddable widget</strong> - Share with your users
                  </li>
                </ul>
              </div>

              <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Projects Grid */}
        {projects.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: any) => (
              <Card key={project._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-xl">{project.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDeleteConfirmId(project._id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                  {project.description && (
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Updated {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                    </span>
                  </div>

                  {project.isPublicViewOnly && (
                    <Alert>
                      <AlertDescription className="text-xs">
                        View-only mode: Users can vote but not submit items
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/dashboard/projects/${project._id}`}>
                        Open Project
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/dashboard/projects/${project._id}?tab=settings`}>
                        <Settings className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Project Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreateProject}>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Create a new feedback board to collect user input
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* API Key Required Warning */}
                {!hasApiKeys && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <Key className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      {apiKeys && apiKeys.length > 0
                        ? "All your API keys are already linked to projects. "
                        : "You need an API key to create a project. "}
                      <Link href="/dashboard/api-keys" className="font-medium underline">
                        {apiKeys && apiKeys.length > 0 ? "Create a new API key" : "Create one first"}
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., My App Feedback"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    autoFocus
                    disabled={!hasApiKeys}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this project for?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    disabled={!hasApiKeys}
                  />
                </div>

                {/* API Key Selection */}
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key *</Label>
                  <select
                    id="apiKey"
                    value={formData.apiKeyId}
                    onChange={(e) => setFormData({ ...formData, apiKeyId: e.target.value })}
                    disabled={!hasApiKeys}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select an API key</option>
                    {availableApiKeys.map((key: any) => (
                      <option key={key.id} value={key.id}>
                        {key.name} ({key.keyPrefix}...)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    The API key is required for the widget to access this project
                  </p>
                </div>

                {/* Board Selection */}
                <div className="space-y-2">
                  <Label>Enabled Boards *</Label>
                  <div className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="feature-requests"
                        checked={formData.enabledBoards.includes("feature-requests")}
                        onCheckedChange={() => toggleBoard("feature-requests")}
                        disabled={!hasApiKeys}
                      />
                      <label htmlFor="feature-requests" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        Feature Requests
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="bug-reports"
                        checked={formData.enabledBoards.includes("bug-reports")}
                        onCheckedChange={() => toggleBoard("bug-reports")}
                        disabled={!hasApiKeys}
                      />
                      <label htmlFor="bug-reports" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Bug className="h-4 w-4 text-red-500" />
                        Bug Reports
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="internal-roadmap"
                        checked={formData.enabledBoards.includes("internal-roadmap")}
                        onCheckedChange={() => toggleBoard("internal-roadmap")}
                        disabled={!hasApiKeys}
                      />
                      <label htmlFor="internal-roadmap" className="flex items-center gap-2 text-sm cursor-pointer">
                        <Map className="h-4 w-4 text-blue-500" />
                        Internal Roadmap
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="viewOnly" className="font-medium">
                      View-Only Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Users can vote but cannot submit new items
                    </p>
                  </div>
                  <Switch
                    id="viewOnly"
                    checked={formData.isPublicViewOnly}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isPublicViewOnly: checked })
                    }
                    disabled={!hasApiKeys}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !formData.name.trim() || !formData.apiKeyId || !hasApiKeys || formData.enabledBoards.length === 0}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this project? This will permanently delete:
              </DialogDescription>
            </DialogHeader>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>All items and columns</li>
              <li>All votes and comments</li>
              <li>All customization settings</li>
              <li>All analytics data</li>
            </ul>
            <p className="text-sm font-semibold text-destructive">
              This action cannot be undone.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirmId && handleDeleteProject(deleteConfirmId)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Project"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
