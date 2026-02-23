// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Copy, Code2, Eye, Sun, Moon, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmbedSectionProps {
  projectId: Id<"projects">;
}

export function EmbedSection({ projectId }: EmbedSectionProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');
  const { toast } = useToast();

  const project = useQuery(api.projects.admin.queries.getProject, { projectId });
  const publicEmbedSlug = project?.publicEmbedSlug;
  const isPublicEmbedEnabled = project?.isPublicEmbedEnabled;

  const enablePublicEmbed = useMutation(api.projects.admin.mutations.enablePublicEmbed);
  const disablePublicEmbed = useMutation(api.projects.admin.mutations.disablePublicEmbed);
  const regenerateSlug = useMutation(api.projects.admin.mutations.regenerateEmbedSlug);

  const handleTogglePublicEmbed = async (enabled: boolean) => {
    try {
      if (enabled) {
        const slug = await enablePublicEmbed({ projectId });
        toast({ title: "Public embed enabled", description: `Embed slug: ${slug}` });
      } else {
        await disablePublicEmbed({ projectId });
        toast({ title: "Public embed disabled" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRegenerateSlug = async () => {
    try {
      const newSlug = await regenerateSlug({ projectId });
      toast({ title: "Embed URL regenerated", description: "Previous embed URLs will no longer work" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Get API keys to show in embed code
  const apiKeys = useQuery(api.apiKeys.getUserApiKeys);
  const firstApiKey = apiKeys && apiKeys.length > 0 ? apiKeys[0] : null;
  const apiKeyDisplay = firstApiKey ? firstApiKey.keyPrefix + "..." : "your-api-key";

  // Get the base URL for embed links
  const baseUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "https://your-domain.com";
  }, []);

  // Convex URL for the widget
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://your-convex-url.convex.cloud";

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const embedMethods = [
    {
      name: "iframe - Anonymous",
      description: "Simplest embed - no authentication required",
      code: `<iframe
  src="${baseUrl}/embed?apiKey=${apiKeyDisplay}&theme=light"
  width="100%"
  height="800px"
  frameborder="0"
  allow="clipboard-write">
</iframe>`,
    },
    {
      name: "iframe - Authenticated",
      description: "Pass user ID from your auth system (optional)",
      code: `<iframe
  src="${baseUrl}/embed?apiKey=${apiKeyDisplay}&userId=YOUR_USER_ID&theme=light"
  width="100%"
  height="800px"
  frameborder="0"
  allow="clipboard-write">
</iframe>

<!-- Optional: Pass user ID from your auth system -->
<script>
  const iframe = document.querySelector('iframe');
  const userId = getCurrentUserId(); // Your auth function
  if (userId) {
    iframe.src = iframe.src.replace('YOUR_USER_ID', userId);
  } else {
    // Remove userId param if not authenticated
    iframe.src = iframe.src.replace('&userId=YOUR_USER_ID', '');
  }
</script>`,
    },
    {
      name: "Web Component",
      description: "Direct script integration",
      code: `<script src="${baseUrl}/widget/uservibes-widget.umd.js"></script>
<uservibes-kanban
  api-key="${apiKeyDisplay}"
  convex-url="${convexUrl}"
  theme="light">
</uservibes-kanban>

<!-- Optional: Set user ID from your auth system -->
<script>
  const widget = document.querySelector('uservibes-kanban');
  const userId = getCurrentUserId(); // Your auth function
  if (userId) {
    widget.setAttribute('user-id', userId);
  }
</script>`,
    },
    {
      name: "Public Embed",
      description: "Read-only public roadmap",
      code: isPublicEmbedEnabled && publicEmbedSlug
        ? `<iframe
  src="${baseUrl}/widget-preview?embedSlug=${publicEmbedSlug}&theme=light"
  width="100%"
  height="800px"
  frameborder="0">
</iframe>`
        : "Enable public embed below to generate code"
    },
    {
      name: "NPM Package",
      description: "For React developers",
      code: `# Install
npm install @uservibes/kanban-widget

# Use in your React app
import { KanbanWidget } from '@uservibes/kanban-widget';

function RoadmapPage() {
  // Optional: get user ID from your auth
  const { userId } = useAuth(); // Your auth hook (optional)

  return (
    <KanbanWidget
      apiKey="${apiKeyDisplay}"
      convexUrl="${convexUrl}"
      userId={userId} // Optional
      theme="light"
    />
  );
}`,
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              <CardTitle>Widget Embed</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview Widget
            </Button>
          </div>
          <CardDescription>
            Copy and paste these code snippets to embed the widget on your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!firstApiKey ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                You need an API key to embed the widget. Create one in the API Keys section.
              </p>
              <Button asChild variant="outline">
                <a href="/dashboard/api-keys">Create API Key</a>
              </Button>
            </div>
          ) : (
            <>
              <Tabs defaultValue="0" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  {embedMethods.map((method, index) => (
                    <TabsTrigger key={index} value={index.toString()}>
                      {method.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {embedMethods.map((method, index) => (
                  <TabsContent key={index} value={index.toString()} className="space-y-2">
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                        <code>{method.code}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(method.code, index)}
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🔓 Authentication Options</p>
                <p className="text-blue-800 dark:text-blue-200 mb-2">
                  <strong>Anonymous mode (default):</strong> No authentication required. Users can vote, comment, and submit items anonymously. Each browser gets a unique anonymous ID stored in localStorage.
                </p>
                <p className="text-blue-800 dark:text-blue-200 mb-2">
                  <strong>Authenticated mode (optional):</strong> Pass your user's ID to track actions by authenticated users. Useful for preventing duplicate votes and attributing submissions.
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-xs mb-2">
                  Example auth systems (optional):
                </p>
                <ul className="text-blue-700 dark:text-blue-300 text-xs list-disc list-inside space-y-1">
                  <li>Auth0: use <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">user.sub</code></li>
                  <li>Firebase: use <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">user.uid</code></li>
                  <li>Supabase: use <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">user.id</code></li>
                  <li>Custom auth: use your unique user identifier</li>
                  <li>No auth: widget generates anonymous IDs automatically</li>
                </ul>
              </div>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                <p className="font-medium mb-1">Note:</p>
                <p className="text-muted-foreground">
                  The widget will automatically use your customization settings (colors, branding, fonts) when embedded.
                  Click "Preview Widget" to test it before deploying.
                </p>
              </div>

              {/* Public Embed Settings */}
              <div className="mt-6 p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Public Embed Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Enable public embed access</p>
                      <p className="text-xs text-muted-foreground">
                        Allows anyone with the embed URL to view your widget
                      </p>
                    </div>
                    <Switch
                      checked={isPublicEmbedEnabled || false}
                      onCheckedChange={handleTogglePublicEmbed}
                    />
                  </div>
                  {isPublicEmbedEnabled && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleRegenerateSlug}
                        variant="outline"
                        size="sm"
                      >
                        Regenerate Embed URL
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        This will invalidate the current embed URL
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal - Nearly Full Screen */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] flex flex-col p-4">
          <DialogHeader className="pb-2 shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>Widget Preview</DialogTitle>
              <div className="flex items-center gap-1 mr-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewTheme(t => t === 'light' ? 'dark' : 'light')}
                >
                  {previewTheme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={`/widget-preview?projectId=${projectId}&theme=${previewTheme}&standalone=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-hidden rounded-xl border shadow-sm flex flex-col">
            {/* Browser chrome bar */}
            <div className="bg-muted border-b px-4 py-2 flex items-center gap-3 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-background/60 rounded-full px-3 py-1 text-xs text-muted-foreground text-center">
                widget preview
              </div>
            </div>
            <iframe
              src={`/widget-preview?projectId=${projectId}&theme=${previewTheme}`}
              className="w-full flex-1 border-0"
              title="Widget Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
