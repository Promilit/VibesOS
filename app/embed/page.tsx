"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

/**
 * Embed Page for iframe distribution
 *
 * Usage:
 * <iframe src="https://yourdomain.com/embed?apiKey=your-api-key&theme=light" />
 *
 * Query Parameters:
 * - apiKey: Required. The API key for authentication
 * - theme: Optional. "light" | "dark" | "auto" (default: "light")
 */

function EmbedWidget() {
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);

  const apiKey = searchParams.get("apiKey") || "";
  const theme = (searchParams.get("theme") as "light" | "dark" | "auto") || "light";

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-xl font-semibold text-red-600 mb-2">
            Missing API Key
          </h1>
          <p className="text-gray-600">
            Please provide an apiKey parameter in the URL.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Example: /embed?apiKey=your-api-key&theme=light
          </p>
        </div>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-400">Loading widget...</div>
      </div>
    );
  }

  // Get environment variables for Convex and Clerk
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: theme === "dark" ? "#0f0f0f" : "#fafafa",
      }}
    >
      {/*
        The widget web component will be rendered here.
        For now, we render a placeholder that loads the widget dynamically.
      */}
      <WidgetLoader
        apiKey={apiKey}
        theme={theme}
        convexUrl={convexUrl}
        clerkKey={clerkPublishableKey}
      />
    </div>
  );
}

interface WidgetLoaderProps {
  apiKey: string;
  theme: "light" | "dark" | "auto";
  convexUrl: string;
  clerkKey: string;
}

function WidgetLoader({ apiKey, theme, convexUrl, clerkKey }: WidgetLoaderProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For production, load the widget script from CDN
    // For development, we'll render inline since widget is in same repo

    // Check if custom element is already defined
    if (customElements.get("uservibes-kanban")) {
      setLoaded(true);
      return;
    }

    // In development, dynamically import the widget
    // In production, this would load from CDN
    const loadWidget = async () => {
      try {
        // Try to dynamically import the widget (works in dev)
        // For production, replace with script tag loading
        const widgetModule = await import("../../widget/src/index");
        widgetModule.registerWidget();
        setLoaded(true);
      } catch (err) {
        console.error("Failed to load widget:", err);
        setError("Failed to load widget. Please try again later.");
      }
    };

    loadWidget();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-xl font-semibold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Render the web component
  return (
    <div className="w-full h-full min-h-screen">
      {/* @ts-expect-error - Custom element not recognized by TypeScript */}
      <uservibes-kanban
        api-key={apiKey}
        theme={theme}
        convex-url={convexUrl}
        clerk-key={clerkKey}
        style={{ width: "100%", minHeight: "100vh", display: "block" }}
      />
    </div>
  );
}

export default function EmbedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      }
    >
      <EmbedWidget />
    </Suspense>
  );
}
