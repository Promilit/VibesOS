"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function EmbedInstructions() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  // Get API keys to show in embed code
  const apiKeys = useQuery(api.apiKeys.getUserApiKeys);
  const apiKey = apiKeys && apiKeys.length > 0 ? apiKeys[0].keyPrefix + "..." : "your-api-key";

  // Get the base URL for embed links
  const baseUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "https://your-domain.com";
  }, []);

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
      name: "Web Component",
      description: "Easiest way to embed - just paste this HTML",
      code: `<script src="${baseUrl}/widget/uservibes-widget.umd.js"></script>
<uservibes-kanban api-key="${apiKey}" theme="light"></uservibes-kanban>`,
    },
    {
      name: "iframe",
      description: "Maximum isolation with iframe",
      code: `<iframe
  src="${baseUrl}/embed?apiKey=${apiKey}&theme=light"
  width="100%"
  height="800px"
  frameborder="0"
  allow="clipboard-write">
</iframe>`,
    },
    {
      name: "NPM Package",
      description: "For React developers",
      code: `# Install
npm install @uservibes/kanban-widget

# Use in your React app
import { KanbanWidget } from '@uservibes/kanban-widget';

<KanbanWidget apiKey="${apiKey}" theme="light" />`,
    },
    {
      name: "Script Tag",
      description: "Initialize with JavaScript",
      code: `<div id="kanban-widget"></div>
<script src="${baseUrl}/widget/uservibes-widget.umd.js"></script>
<script>
  UserVibes.init({
    apiKey: '${apiKey}',
    container: '#kanban-widget',
    theme: 'light'
  });
</script>`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5" />
          <CardTitle>Embed Widget</CardTitle>
        </div>
        <CardDescription>
          Copy and paste these code snippets to embed the kanban widget on your website
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="0" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
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

        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
          <p className="font-medium mb-1">Note:</p>
          <p className="text-muted-foreground">
            The widget will automatically use your customization settings (colors, branding, fonts) when embedded.
            Test it in the Widget Customization page before deploying.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
