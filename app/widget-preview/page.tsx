"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useMemo } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Lightbulb, Bug, Map, ChevronUp, MessageSquare, Moon, Sun, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Board type display configuration
const BOARD_CONFIG: Record<string, { name: string; icon: React.ComponentType<{ className?: string }> }> = {
  "feature-requests": { name: "Feature Requests", icon: Lightbulb },
  "bug-reports": { name: "Bug Reports", icon: Bug },
  "internal-roadmap": { name: "Internal Roadmap", icon: Map },
};

// Default customization values
const DEFAULTS = {
  colors: {
    light: {
      primary: "#3b82f6",
      secondary: "#64748b",
      background: "#ffffff",
      cardBackground: "#f8fafc",
      text: "#0f172a",
      border: "#e2e8f0",
    },
    dark: {
      primary: "#60a5fa",
      secondary: "#94a3b8",
      background: "#0f172a",
      cardBackground: "#1e293b",
      text: "#f8fafc",
      border: "#334155",
    },
  },
  typography: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    headingFontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "14px",
  },
  layout: {
    borderRadius: "8px",
    spacing: "16px",
  },
};

function WidgetPreviewContent() {
  const searchParams = useSearchParams();
  const embedSlug = searchParams.get("embedSlug");
  const projectId = searchParams.get("projectId") as Id<"projects"> | null;
  const apiKey = searchParams.get("apiKey");
  const [theme, setTheme] = useState(searchParams.get("theme") || "light");
  const standalone = searchParams.get("standalone") === "true";

  const authMode = embedSlug ? 'embedSlug' : projectId && !apiKey ? 'adminPreview' : 'apiKey';

  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [apiKeyHash, setApiKeyHash] = useState<string | null>(null);
  const [projectBoards, setProjectBoards] = useState<any>(undefined);
  const [customization, setCustomization] = useState<any>(undefined);

  // Admin preview mode — use reactive useQuery hooks directly (user is already authenticated)
  const adminBoards = useQuery(
    api.projects.admin.queries.getProjectBoards,
    authMode === 'adminPreview' && projectId ? { projectId } : "skip"
  );
  const adminCustomization = useQuery(
    api.projects.admin.queries.getCustomization,
    authMode === 'adminPreview' && projectId ? { projectId } : "skip"
  );

  const getProjectBoardsAction = authMode === 'embedSlug'
    ? useAction(api.projects.widget.publicActions.getProjectBoardsByEmbedSlug)
    : useAction(api.projects.widget.actions.getProjectBoards);

  const getCustomizationAction = authMode === 'embedSlug'
    ? useAction(api.projects.widget.publicActions.getCustomizationByEmbedSlug)
    : useAction(api.projects.widget.actions.getCustomization);

  useEffect(() => {
    if (authMode === 'apiKey' && !apiKey) {
      setAuthError("No API key provided");
      return;
    }
    if (authMode === 'apiKey' && apiKey) {
      hashApiKey(apiKey).then(setApiKeyHash).catch(() => {
        setAuthError("Failed to process API key");
      });
    }
  }, [authMode, apiKey]);

  useEffect(() => {
    if (authMode === 'embedSlug' && embedSlug) {
      Promise.all([
        getProjectBoardsAction({ embedSlug }),
        getCustomizationAction({ embedSlug })
      ]).then(([boards, custom]) => {
        setProjectBoards(boards);
        setCustomization(custom);
      }).catch((error) => {
        setAuthError(error.message || "Failed to load project data");
        setProjectBoards(null);
        setCustomization(null);
      });
    } else if (authMode === 'apiKey' && apiKeyHash && projectId) {
      Promise.all([
        getProjectBoardsAction({ apiKeyHash, projectId }),
        getCustomizationAction({ apiKeyHash, projectId })
      ]).then(([boards, custom]) => {
        setProjectBoards(boards);
        setCustomization(custom);
      }).catch((error) => {
        setAuthError(error.message || "Failed to load project data");
        setProjectBoards(null);
        setCustomization(null);
      });
    }
  }, [authMode, embedSlug, apiKeyHash, projectId, getProjectBoardsAction, getCustomizationAction]);

  // Sync adminPreview query results into shared state
  useEffect(() => {
    if (authMode === 'adminPreview') {
      if (adminBoards !== undefined) setProjectBoards(adminBoards ?? null);
      if (adminCustomization !== undefined) setCustomization(adminCustomization);
    }
  }, [authMode, adminBoards, adminCustomization]);

  const isDark = theme === "dark";

  // Compute all styles based on customization
  const styles = useMemo(() => {
    const colorDefaults = isDark ? DEFAULTS.colors.dark : DEFAULTS.colors.light;

    // Colors
    const colors = customization ? {
      primary: isDark
        ? (customization.darkPrimaryColor || customization.primaryColor || colorDefaults.primary)
        : (customization.primaryColor || colorDefaults.primary),
      secondary: isDark
        ? (customization.darkSecondaryColor || customization.secondaryColor || colorDefaults.secondary)
        : (customization.secondaryColor || colorDefaults.secondary),
      background: isDark
        ? (customization.darkBackgroundColor || colorDefaults.background)
        : (customization.backgroundColor || colorDefaults.background),
      cardBackground: isDark
        ? (customization.darkCardBackgroundColor || colorDefaults.cardBackground)
        : (customization.cardBackgroundColor || colorDefaults.cardBackground),
      text: isDark
        ? (customization.darkTextColor || colorDefaults.text)
        : (customization.textColor || colorDefaults.text),
      border: isDark
        ? (customization.darkBorderColor || colorDefaults.border)
        : (customization.borderColor || colorDefaults.border),
    } : colorDefaults;

    // Typography
    const typography = {
      fontFamily: customization?.fontFamily || DEFAULTS.typography.fontFamily,
      headingFontFamily: customization?.headingFontFamily || customization?.fontFamily || DEFAULTS.typography.headingFontFamily,
      fontSize: customization?.fontSize || DEFAULTS.typography.fontSize,
    };

    // Layout
    const layout = {
      borderRadius: customization?.borderRadius || DEFAULTS.layout.borderRadius,
      spacing: customization?.spacing || DEFAULTS.layout.spacing,
    };

    // Branding
    const branding = {
      logoUrl: customization?.logoUrl || null,
      companyName: customization?.companyName || null,
      widgetTitle: customization?.widgetTitle || null,
    };

    return { colors, typography, layout, branding };
  }, [customization, isDark]);

  // Determine effective board ID
  const effectiveBoardId = selectedBoardId || (projectBoards && projectBoards.length > 0 ? projectBoards[0]._id : null);

  const [boardData, setBoardData] = useState<any>(undefined);
  const getBoardItemsAction = authMode === 'embedSlug'
    ? useAction(api.projects.widget.publicActions.getBoardItemsByEmbedSlug)
    : useAction(api.projects.widget.actions.getBoardItems);

  // Admin preview board items via reactive useQuery
  const adminBoardItems = useQuery(
    api.projects.admin.queries.getBoardItems,
    authMode === 'adminPreview' && projectId && effectiveBoardId
      ? { projectId, boardId: effectiveBoardId as Id<"projectBoards"> }
      : "skip"
  );

  useEffect(() => {
    if (authMode === 'adminPreview') {
      if (adminBoardItems !== undefined) setBoardData(adminBoardItems ?? null);
      return;
    }
    if (authMode === 'embedSlug' && embedSlug && effectiveBoardId) {
      getBoardItemsAction({
        embedSlug,
        boardId: effectiveBoardId as Id<"projectBoards">
      }).then(setBoardData).catch(() => {
        setBoardData(null);
      });
    } else if (authMode === 'apiKey' && apiKeyHash && projectId && effectiveBoardId) {
      getBoardItemsAction({
        apiKeyHash,
        projectId,
        boardId: effectiveBoardId as Id<"projectBoards">
      }).then(setBoardData).catch(() => {
        setBoardData(null);
      });
    } else {
      setBoardData(undefined);
    }
  }, [authMode, embedSlug, apiKeyHash, projectId, effectiveBoardId, getBoardItemsAction, adminBoardItems]);

  // Loading state - show for max 5 seconds then show helpful message
  const [loadingTooLong, setLoadingTooLong] = useState(false);
  useEffect(() => {
    if (projectBoards === undefined && !authError) {
      const timer = setTimeout(() => setLoadingTooLong(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [projectBoards, authError]);

  // Base container style
  const containerStyle: React.CSSProperties = {
    backgroundColor: styles.colors.background,
    color: styles.colors.text,
    fontFamily: styles.typography.fontFamily,
    fontSize: styles.typography.fontSize,
  };

  if (authError) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={containerStyle}>
        <div className="text-center">
          <p className="text-amber-500 mb-2">Configuration Error</p>
          <p className="text-sm" style={{ color: styles.colors.secondary }}>{authError}</p>
        </div>
      </div>
    );
  }

  if (authMode === 'apiKey' && !projectId) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={containerStyle}>
        <div className="text-center">
          <p style={{ color: styles.colors.secondary }}>No project ID specified</p>
        </div>
      </div>
    );
  }

  if (authMode === 'apiKey' && !apiKey) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={containerStyle}>
        <div className="text-center">
          <p className="text-amber-500 mb-2">API Key Required</p>
          <p className="text-sm" style={{ color: styles.colors.secondary }}>
            Please include your API key in the widget URL
          </p>
        </div>
      </div>
    );
  }

  if (authMode === 'adminPreview' && !projectId) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={containerStyle}>
        <div className="text-center">
          <p style={{ color: styles.colors.secondary }}>No project ID specified</p>
        </div>
      </div>
    );
  }

  if (authMode === 'embedSlug' && !embedSlug) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={containerStyle}>
        <div className="text-center">
          <p className="text-amber-500 mb-2">Embed Slug Required</p>
          <p className="text-sm" style={{ color: styles.colors.secondary }}>
            Please include the embed slug in the widget URL
          </p>
        </div>
      </div>
    );
  }

  if (projectBoards === undefined) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={containerStyle}
      >
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 mb-4"
          style={{ borderColor: styles.colors.primary }}
        />
        {loadingTooLong && (
          <p className="text-sm" style={{ color: styles.colors.secondary }}>
            Loading widget...
          </p>
        )}
      </div>
    );
  }

  if (!projectBoards || projectBoards.length === 0) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={containerStyle}>
        <div className="text-center">
          <p style={{ color: styles.colors.secondary }}>No boards configured for this project</p>
        </div>
      </div>
    );
  }

  const columns = boardData?.columns || [];
  const itemsByColumn = boardData?.itemsByColumn || {};

  const widgetInner = (
    <div
      className="border shadow-sm w-full"
      style={{
        borderColor: styles.colors.border,
        backgroundColor: styles.colors.cardBackground,
        borderRadius: styles.layout.borderRadius,
        padding: styles.layout.spacing,
      }}
    >
          {/* Header with Branding */}
          {(styles.branding.logoUrl || styles.branding.companyName || styles.branding.widgetTitle) && (
            <div
              className="mb-4 pb-4 border-b flex items-center gap-3"
              style={{ borderColor: styles.colors.border }}
            >
              {styles.branding.logoUrl && (
                <Image
                  src={styles.branding.logoUrl}
                  alt={styles.branding.companyName || "Logo"}
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{ borderRadius: `calc(${styles.layout.borderRadius} / 2)` }}
                />
              )}
              <div>
                {styles.branding.companyName && (
                  <div
                    className="font-semibold"
                    style={{
                      fontFamily: styles.typography.headingFontFamily,
                      color: styles.colors.text
                    }}
                  >
                    {styles.branding.companyName}
                  </div>
                )}
                {styles.branding.widgetTitle && (
                  <div
                    className="text-sm"
                    style={{ color: styles.colors.secondary }}
                  >
                    {styles.branding.widgetTitle}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Board Tabs */}
          <div
            className="border-b mb-4"
            style={{ borderColor: styles.colors.border }}
          >
            <div className="flex gap-1 overflow-x-auto">
              {projectBoards.map((board: any) => {
                const config = BOARD_CONFIG[board.boardType];
                const Icon = config?.icon || Lightbulb;
                const isSelected = board._id === effectiveBoardId;
                return (
                  <button
                    key={board._id}
                    onClick={() => setSelectedBoardId(board._id)}
                    className="px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap"
                    style={{
                      borderColor: isSelected ? styles.colors.primary : "transparent",
                      color: isSelected ? styles.colors.primary : styles.colors.secondary,
                      fontFamily: styles.typography.fontFamily,
                    }}
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
            <div className="flex items-center justify-center min-h-[400px]">
              <div
                className="animate-spin rounded-full h-6 w-6 border-b-2"
                style={{ borderColor: styles.colors.primary }}
              />
            </div>
          ) : columns.length === 0 ? (
            <div className="text-center py-12" style={{ color: styles.colors.secondary }}>
              No columns found for this board
            </div>
          ) : (
            /* Columns Grid */
            <div
              className="grid gap-4 overflow-x-auto"
              style={{
                gridTemplateColumns: `repeat(${Math.min(columns.length, 4)}, minmax(220px, 1fr))`,
                gap: styles.layout.spacing,
              }}
            >
              {columns.map((column: any) => {
                const items = itemsByColumn[column._id] || [];
                return (
                  <div
                    key={column._id}
                    className="p-3 min-h-[250px]"
                    style={{
                      backgroundColor: styles.colors.background,
                      borderRadius: styles.layout.borderRadius,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3
                        className="font-medium"
                        style={{ fontFamily: styles.typography.headingFontFamily }}
                      >
                        {column.name}
                      </h3>
                      <span
                        className="text-xs px-2 py-0.5"
                        style={{
                          backgroundColor: styles.colors.border,
                          color: styles.colors.secondary,
                          borderRadius: `calc(${styles.layout.borderRadius} / 2)`,
                        }}
                      >
                        {items.length}
                      </span>
                    </div>
                    <div
                      className="space-y-2"
                      style={{ gap: `calc(${styles.layout.spacing} / 2)` }}
                    >
                      {items.length === 0 ? (
                        <p className="text-xs text-center py-4" style={{ color: styles.colors.secondary }}>
                          No items
                        </p>
                      ) : (
                        items.map((item: any) => (
                          <div
                            key={item._id}
                            className="p-3 border shadow-sm"
                            style={{
                              backgroundColor: styles.colors.cardBackground,
                              borderColor: styles.colors.border,
                              borderRadius: styles.layout.borderRadius,
                            }}
                          >
                            <div
                              className="font-medium"
                              style={{ fontFamily: styles.typography.headingFontFamily }}
                            >
                              {item.title}
                            </div>
                            {item.description && (
                              <div
                                className="text-sm mt-1 line-clamp-2"
                                style={{ color: styles.colors.secondary }}
                              >
                                {item.description}
                              </div>
                            )}
                            <div
                              className="flex items-center gap-3 mt-2 text-sm"
                              style={{ color: styles.colors.secondary }}
                            >
                              <span
                                className="flex items-center gap-1"
                                style={{ color: styles.colors.primary }}
                              >
                                <ChevronUp className="h-4 w-4" />
                                {item.voteCount || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
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

        {/* Footer */}
        <div
          className="mt-4 text-center text-xs"
          style={{ color: styles.colors.secondary }}
        >
          {styles.branding.companyName
            ? `Powered by ${styles.branding.companyName}`
            : "Widget Preview - Powered by UserVibes"
          }
        </div>
      </div>
  );

  if (standalone && authMode === 'adminPreview') {
    return (
      <div className="min-h-screen bg-[#e8eaed] flex flex-col items-center p-6 gap-4">
        <div className="w-full max-w-5xl flex items-center justify-between">
          <Link href="/dashboard/projects" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" /> Back to projects
          </Link>
          <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            Admin Preview
          </span>
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="p-2 rounded hover:bg-gray-200 text-gray-600">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-300">
          <div className="bg-[#dee1e6] border-b border-gray-300 px-4 py-2.5 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 bg-white/80 rounded-md px-3 py-1 text-xs text-gray-500 text-center max-w-xs mx-auto">
              widget preview
            </div>
          </div>
          <div className="overflow-auto p-2" style={{ ...containerStyle, maxHeight: 'calc(100vh - 180px)' }}>
            {widgetInner}
          </div>
        </div>
        {customization?.customCss && (
          <style dangerouslySetInnerHTML={{ __html: customization.customCss }} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-2 overflow-auto" style={containerStyle}>
      {widgetInner}
      {customization?.customCss && (
        <style dangerouslySetInnerHTML={{ __html: customization.customCss }} />
      )}
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
