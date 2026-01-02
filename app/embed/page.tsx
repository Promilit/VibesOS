"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Script from "next/script";

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
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const apiKey = searchParams.get("apiKey") || "";
  const theme = (searchParams.get("theme") as "light" | "dark" | "auto") || "light";

  // Get environment variables for Convex and Clerk
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

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

  return (
    <>
      {/* Load the widget script */}
      <Script
        src="/widget/uservibes-widget.umd.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => {
          console.error("Failed to load widget script");
        }}
      />

      <div
        className="min-h-screen"
        style={{
          backgroundColor: theme === "dark" ? "#0f0f0f" : "#fafafa",
        }}
      >
        {!scriptLoaded ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="w-full h-full min-h-screen">
            <div
              ref={(el) => {
                if (el && !el.querySelector("uservibes-kanban")) {
                  const widget = document.createElement("uservibes-kanban");
                  widget.setAttribute("api-key", apiKey);
                  widget.setAttribute("theme", theme);
                  widget.setAttribute("convex-url", convexUrl);
                  widget.setAttribute("clerk-key", clerkPublishableKey);
                  widget.style.width = "100%";
                  widget.style.minHeight = "100vh";
                  widget.style.display = "block";
                  el.appendChild(widget);
                }
              }}
            />
          </div>
        )}
      </div>
    </>
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
