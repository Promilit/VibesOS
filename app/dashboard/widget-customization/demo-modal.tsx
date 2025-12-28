"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Sun, Copy, Check, ArrowBigUp, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoModal({ open, onOpenChange }: DemoModalProps) {
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const customization = useQuery(api.kanban.admin.queries.getCustomization);
  const boards = useQuery(api.kanban.admin.queries.getBoards);
  const apiKeys = useQuery(api.apiKeys.getUserApiKeys);

  const apiKey = apiKeys && apiKeys.length > 0 ? apiKeys[0].keyPrefix + "..." : "your-api-key";

  const embedCode = `<script src="https://cdn.uservibes.com/widget/v1/uservibes-widget.umd.js"></script>
<uservibes-kanban api-key="${apiKey}" theme="${isDark ? "dark" : "light"}"></uservibes-kanban>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({ title: "Copied!", description: "Embed code copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  // Get colors based on theme
  const colors = isDark
    ? {
        primary: customization?.darkPrimaryColor || "#60a5fa",
        secondary: customization?.darkSecondaryColor || "#94a3b8",
        background: customization?.darkBackgroundColor || "#0f172a",
        cardBackground: customization?.darkCardBackgroundColor || "#1e293b",
        text: customization?.darkTextColor || "#f8fafc",
        border: customization?.darkBorderColor || "#334155",
      }
    : {
        primary: customization?.primaryColor || "#3b82f6",
        secondary: customization?.secondaryColor || "#64748b",
        background: customization?.backgroundColor || "#ffffff",
        cardBackground: customization?.cardBackgroundColor || "#f8fafc",
        text: customization?.textColor || "#0f172a",
        border: customization?.borderColor || "#e2e8f0",
      };

  const fontFamily = customization?.fontFamily || "Inter, system-ui, sans-serif";
  const borderRadius = customization?.borderRadius || "8px";
  const widgetTitle = customization?.widgetTitle || "Feedback";
  const companyName = customization?.companyName;
  const logoUrl = customization?.logoUrl;

  // Sample data for demo
  const sampleItems = [
    { title: "Dark mode support", description: "Add dark mode to the application", votes: 12, isUser: true },
    { title: "Export to CSV", description: "Allow exporting data to CSV files", votes: 8, isUser: false },
    { title: "Mobile app", description: "Native mobile application for iOS and Android", votes: 5, isUser: true },
    { title: "API access", description: "Public API for integrations", votes: 3, isUser: false },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Widget Demo</DialogTitle>
          <DialogDescription>
            This is how your widget will look when embedded on a website
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* Theme Toggle */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              Toggle between light and dark mode to preview both themes
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDark(!isDark)}
              className="gap-2"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDark ? "Light Mode" : "Dark Mode"}
            </Button>
          </div>

          {/* Widget Demo */}
          <div
            className="rounded-lg overflow-hidden border min-h-[400px]"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              fontFamily,
            }}
          >
            {/* Widget Header */}
            <div
              className="p-4 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${colors.border}` }}
            >
              <div className="flex items-center gap-3">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-8 h-8 rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <h2
                  className="text-lg font-semibold"
                  style={{ color: colors.text }}
                >
                  {widgetTitle}
                </h2>
              </div>
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                  borderColor: colors.border,
                }}
              >
                Demo Mode
              </Badge>
            </div>

            {/* Board Tabs */}
            <div className="p-4">
              <Tabs defaultValue="features">
                <TabsList
                  className="w-full justify-start gap-2 bg-transparent h-auto p-0"
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                >
                  {["features", "bugs", "roadmap"].map((tab) => (
                    <button
                      key={tab}
                      className="px-4 py-2 text-sm font-medium transition-colors rounded-t-lg"
                      style={{
                        backgroundColor: tab === "features" ? colors.primary : "transparent",
                        color: tab === "features" ? "#fff" : colors.secondary,
                        borderRadius: `${borderRadius} ${borderRadius} 0 0`,
                      }}
                    >
                      {tab === "features" ? "Feature Requests" : tab === "bugs" ? "Bug Reports" : "Roadmap"}
                    </button>
                  ))}
                </TabsList>

                <TabsContent value="features" className="mt-4 space-y-3">
                  {sampleItems.map((item, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: colors.cardBackground,
                        borderRadius,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3
                            className="font-medium mb-1"
                            style={{ color: colors.text }}
                          >
                            {item.title}
                          </h3>
                          <p
                            className="text-sm"
                            style={{ color: colors.secondary }}
                          >
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {item.isUser ? (
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: colors.border,
                                  color: colors.text,
                                }}
                              >
                                <User className="h-3 w-3 mr-1" />
                                User
                              </Badge>
                            ) : (
                              <Badge
                                className="text-xs"
                                style={{
                                  backgroundColor: colors.secondary + "30",
                                  color: colors.text,
                                }}
                              >
                                Admin
                              </Badge>
                            )}
                          </div>
                        </div>
                        <button
                          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: colors.primary + "20",
                            color: colors.primary,
                            borderRadius,
                          }}
                        >
                          <ArrowBigUp className="h-5 w-5" />
                          <span className="text-sm font-medium">{item.votes}</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Item Button */}
                  <button
                    className="w-full py-3 text-sm font-medium rounded-lg transition-colors"
                    style={{
                      backgroundColor: colors.primary,
                      color: "#fff",
                      borderRadius,
                    }}
                  >
                    + Add Feature Request
                  </button>
                </TabsContent>
              </Tabs>
            </div>

            {/* Widget Footer */}
            {companyName && (
              <div
                className="p-3 text-center text-sm"
                style={{
                  borderTop: `1px solid ${colors.border}`,
                  color: colors.secondary,
                }}
              >
                Powered by {companyName}
              </div>
            )}
          </div>

          {/* Embed Code */}
          <div className="mt-6 space-y-2">
            <h3 className="font-medium">Embed Code</h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                <code>{embedCode}</code>
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={handleCopy}
              >
                {copied ? (
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
