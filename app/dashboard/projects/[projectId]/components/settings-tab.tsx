"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Settings2, Palette, Code2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { WidgetCustomization } from "./widget-customization";
import { EmbedSection } from "./embed-section";

interface SettingsTabProps {
  projectId: Id<"projects">;
  project: any;
}

export function SettingsTab({ projectId, project }: SettingsTabProps) {
  const router = useRouter();
  const renameProject = useMutation(api.projects.admin.mutations.renameProject);
  const updateDescription = useMutation(api.projects.admin.mutations.updateProjectDescription);
  const togglePublicStatus = useMutation(api.projects.admin.mutations.toggleProjectPublicStatus);

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    isPublicViewOnly: project.isPublicViewOnly,
  });

  const hasChanges =
    formData.name !== project.name ||
    formData.description !== (project.description || "") ||
    formData.isPublicViewOnly !== project.isPublicViewOnly;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update name if changed
      if (formData.name !== project.name) {
        await renameProject({ projectId, name: formData.name });
      }

      // Update description if changed
      if (formData.description !== (project.description || "")) {
        await updateDescription({
          projectId,
          description: formData.description || undefined,
        });
      }

      // Update public status if changed
      if (formData.isPublicViewOnly !== project.isPublicViewOnly) {
        await togglePublicStatus({
          projectId,
          isPublicViewOnly: formData.isPublicViewOnly,
        });
      }

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            <CardTitle>Project Settings</CardTitle>
          </div>
          <CardDescription>Update your project information and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Feature Requests"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectDescription">Description</Label>
            <Textarea
              id="projectDescription"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this project for?"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="viewOnly" className="font-medium">
                View-Only Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                When enabled, users can vote but cannot submit new items
              </p>
            </div>
            <Switch
              id="viewOnly"
              checked={formData.isPublicViewOnly}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPublicViewOnly: checked })
              }
            />
          </div>

          {hasChanges && (
            <Button onClick={handleSave} disabled={isSaving || !formData.name.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Widget Customization */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Widget Customization</CardTitle>
          </div>
          <CardDescription>
            Customize how this project appears in the embedded widget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WidgetCustomization projectId={projectId} />
        </CardContent>
      </Card>

      {/* Widget Embed & Preview */}
      <EmbedSection projectId={projectId} />
    </div>
  );
}
