"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

interface Customization {
  logoUrl: string;
  companyName: string;
  widgetTitle: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardBackgroundColor: string;
  textColor: string;
  borderColor: string;
  darkPrimaryColor: string;
  darkSecondaryColor: string;
  darkBackgroundColor: string;
  darkCardBackgroundColor: string;
  darkTextColor: string;
  darkBorderColor: string;
  fontFamily: string;
  fontSize: string;
  headingFontFamily: string;
  borderRadius: string;
  spacing: string;
  customCss: string;
}

interface WidgetPreviewProps {
  customization: Customization;
}

export function WidgetPreview({ customization }: WidgetPreviewProps) {
  const [isDark, setIsDark] = useState(false);

  const colors = isDark
    ? {
        primary: customization.darkPrimaryColor,
        secondary: customization.darkSecondaryColor,
        background: customization.darkBackgroundColor,
        cardBackground: customization.darkCardBackgroundColor,
        text: customization.darkTextColor,
        border: customization.darkBorderColor,
      }
    : {
        primary: customization.primaryColor,
        secondary: customization.secondaryColor,
        background: customization.backgroundColor,
        cardBackground: customization.cardBackgroundColor,
        text: customization.textColor,
        border: customization.borderColor,
      };

  return (
    <div className="space-y-3">
      {/* Theme toggle */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDark(!isDark)}
          className="gap-2"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {isDark ? "Light" : "Dark"}
        </Button>
      </div>

      {/* Widget Preview */}
      <div
        className="rounded-lg overflow-hidden border"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
          fontFamily: customization.fontFamily,
          fontSize: customization.fontSize,
        }}
      >
        {/* Header */}
        <div
          className="p-3 flex items-center gap-2"
          style={{
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          {customization.logoUrl && (
            <img
              src={customization.logoUrl}
              alt="Logo"
              className="w-6 h-6 rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span
            className="font-semibold"
            style={{
              color: colors.text,
              fontFamily: customization.headingFontFamily,
            }}
          >
            {customization.widgetTitle || "Feedback"}
          </span>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-2"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          {["Features", "Bugs", "Roadmap"].map((tab, i) => (
            <button
              key={tab}
              className="px-2 py-1 text-xs rounded transition-colors"
              style={{
                backgroundColor: i === 0 ? colors.primary : "transparent",
                color: i === 0 ? "#fff" : colors.secondary,
                borderRadius: customization.borderRadius,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          {/* Sample cards */}
          {[
            { title: "Dark mode support", votes: 12 },
            { title: "Export to CSV", votes: 8 },
            { title: "Mobile app", votes: 5 },
          ].map((item, i) => (
            <div
              key={i}
              className="p-2 rounded flex items-center justify-between"
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: customization.borderRadius,
                border: `1px solid ${colors.border}`,
              }}
            >
              <span
                className="text-xs font-medium"
                style={{ color: colors.text }}
              >
                {item.title}
              </span>
              <div className="flex items-center gap-1">
                <button
                  className="px-1.5 py-0.5 text-xs rounded"
                  style={{
                    backgroundColor: colors.primary + "20",
                    color: colors.primary,
                    borderRadius: customization.borderRadius,
                  }}
                >
                  {item.votes}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="p-3"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <button
            className="w-full py-2 text-xs font-medium rounded transition-colors"
            style={{
              backgroundColor: colors.primary,
              color: "#fff",
              borderRadius: customization.borderRadius,
            }}
          >
            + Add Feature Request
          </button>
        </div>

        {/* Branding */}
        {customization.companyName && (
          <div
            className="p-2 text-center text-xs"
            style={{
              borderTop: `1px solid ${colors.border}`,
              color: colors.secondary,
            }}
          >
            Powered by {customization.companyName}
          </div>
        )}
      </div>
    </div>
  );
}
