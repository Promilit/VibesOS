"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RotateCcw, Save } from "lucide-react";

// Default customization values
const defaultCustomization = {
  logoUrl: "",
  companyName: "",
  widgetTitle: "Feedback",
  primaryColor: "#3b82f6",
  secondaryColor: "#64748b",
  backgroundColor: "#ffffff",
  cardBackgroundColor: "#f8fafc",
  textColor: "#0f172a",
  borderColor: "#e2e8f0",
  darkPrimaryColor: "#60a5fa",
  darkSecondaryColor: "#94a3b8",
  darkBackgroundColor: "#0f172a",
  darkCardBackgroundColor: "#1e293b",
  darkTextColor: "#f8fafc",
  darkBorderColor: "#334155",
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: "14px",
  headingFontFamily: "Inter, system-ui, sans-serif",
  borderRadius: "8px",
  spacing: "16px",
  customCss: "",
};

interface WidgetCustomizationProps {
  projectId: Id<"projects">;
}

export function WidgetCustomization({ projectId }: WidgetCustomizationProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch current customization for this project
  const currentCustomization = useQuery(api.projects.admin.queries.getCustomization, { projectId });
  const saveCustomization = useMutation(api.projects.admin.mutations.saveCustomization);

  // Local state for form
  const [formData, setFormData] = useState(defaultCustomization);

  // Initialize form with current customization
  useEffect(() => {
    if (currentCustomization) {
      setFormData({
        logoUrl: currentCustomization.logoUrl || defaultCustomization.logoUrl,
        companyName: currentCustomization.companyName || defaultCustomization.companyName,
        widgetTitle: currentCustomization.widgetTitle || defaultCustomization.widgetTitle,
        primaryColor: currentCustomization.primaryColor || defaultCustomization.primaryColor,
        secondaryColor: currentCustomization.secondaryColor || defaultCustomization.secondaryColor,
        backgroundColor: currentCustomization.backgroundColor || defaultCustomization.backgroundColor,
        cardBackgroundColor: currentCustomization.cardBackgroundColor || defaultCustomization.cardBackgroundColor,
        textColor: currentCustomization.textColor || defaultCustomization.textColor,
        borderColor: currentCustomization.borderColor || defaultCustomization.borderColor,
        darkPrimaryColor: currentCustomization.darkPrimaryColor || defaultCustomization.darkPrimaryColor,
        darkSecondaryColor: currentCustomization.darkSecondaryColor || defaultCustomization.darkSecondaryColor,
        darkBackgroundColor: currentCustomization.darkBackgroundColor || defaultCustomization.darkBackgroundColor,
        darkCardBackgroundColor: currentCustomization.darkCardBackgroundColor || defaultCustomization.darkCardBackgroundColor,
        darkTextColor: currentCustomization.darkTextColor || defaultCustomization.darkTextColor,
        darkBorderColor: currentCustomization.darkBorderColor || defaultCustomization.darkBorderColor,
        fontFamily: currentCustomization.fontFamily || defaultCustomization.fontFamily,
        fontSize: currentCustomization.fontSize || defaultCustomization.fontSize,
        headingFontFamily: currentCustomization.headingFontFamily || defaultCustomization.headingFontFamily,
        borderRadius: currentCustomization.borderRadius || defaultCustomization.borderRadius,
        spacing: currentCustomization.spacing || defaultCustomization.spacing,
        customCss: currentCustomization.customCss || defaultCustomization.customCss,
      });
    }
  }, [currentCustomization]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveCustomization({
        projectId,
        logoUrl: formData.logoUrl || undefined,
        companyName: formData.companyName || undefined,
        widgetTitle: formData.widgetTitle || undefined,
        primaryColor: formData.primaryColor || undefined,
        secondaryColor: formData.secondaryColor || undefined,
        backgroundColor: formData.backgroundColor || undefined,
        cardBackgroundColor: formData.cardBackgroundColor || undefined,
        textColor: formData.textColor || undefined,
        borderColor: formData.borderColor || undefined,
        darkPrimaryColor: formData.darkPrimaryColor || undefined,
        darkSecondaryColor: formData.darkSecondaryColor || undefined,
        darkBackgroundColor: formData.darkBackgroundColor || undefined,
        darkCardBackgroundColor: formData.darkCardBackgroundColor || undefined,
        darkTextColor: formData.darkTextColor || undefined,
        darkBorderColor: formData.darkBorderColor || undefined,
        fontFamily: formData.fontFamily || undefined,
        fontSize: formData.fontSize || undefined,
        headingFontFamily: formData.headingFontFamily || undefined,
        borderRadius: formData.borderRadius || undefined,
        spacing: formData.spacing || undefined,
        customCss: formData.customCss || undefined,
      });

      setHasChanges(false);
      alert("Customization saved successfully!");
    } catch (error) {
      console.error("Failed to save customization:", error);
      alert(error instanceof Error ? error.message : "Failed to save customization");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(defaultCustomization);
    setHasChanges(true);
  };

  if (currentCustomization === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Customize how this project appears in the embedded widget
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving || !hasChanges}>
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
        </div>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Customize your widget's branding and identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Your Company"
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="widgetTitle">Widget Title</Label>
                <Input
                  id="widgetTitle"
                  placeholder="Feedback"
                  value={formData.widgetTitle}
                  onChange={(e) => updateField("widgetTitle", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  placeholder="https://example.com/logo.png"
                  value={formData.logoUrl}
                  onChange={(e) => updateField("logoUrl", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended size: 32x32px or 40x40px
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Light Mode Colors</CardTitle>
              <CardDescription>Colors used when the widget is in light mode</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <ColorPicker label="Primary Color" value={formData.primaryColor} onChange={(v) => updateField("primaryColor", v)} />
              <ColorPicker label="Secondary Color" value={formData.secondaryColor} onChange={(v) => updateField("secondaryColor", v)} />
              <ColorPicker label="Background" value={formData.backgroundColor} onChange={(v) => updateField("backgroundColor", v)} />
              <ColorPicker label="Card Background" value={formData.cardBackgroundColor} onChange={(v) => updateField("cardBackgroundColor", v)} />
              <ColorPicker label="Text Color" value={formData.textColor} onChange={(v) => updateField("textColor", v)} />
              <ColorPicker label="Border Color" value={formData.borderColor} onChange={(v) => updateField("borderColor", v)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dark Mode Colors</CardTitle>
              <CardDescription>Colors used when the widget is in dark mode</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <ColorPicker label="Primary Color" value={formData.darkPrimaryColor} onChange={(v) => updateField("darkPrimaryColor", v)} />
              <ColorPicker label="Secondary Color" value={formData.darkSecondaryColor} onChange={(v) => updateField("darkSecondaryColor", v)} />
              <ColorPicker label="Background" value={formData.darkBackgroundColor} onChange={(v) => updateField("darkBackgroundColor", v)} />
              <ColorPicker label="Card Background" value={formData.darkCardBackgroundColor} onChange={(v) => updateField("darkCardBackgroundColor", v)} />
              <ColorPicker label="Text Color" value={formData.darkTextColor} onChange={(v) => updateField("darkTextColor", v)} />
              <ColorPicker label="Border Color" value={formData.darkBorderColor} onChange={(v) => updateField("darkBorderColor", v)} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Customize fonts and text styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fontFamily">Body Font Family</Label>
                <Input
                  id="fontFamily"
                  placeholder="Inter, system-ui, sans-serif"
                  value={formData.fontFamily}
                  onChange={(e) => updateField("fontFamily", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headingFontFamily">Heading Font Family</Label>
                <Input
                  id="headingFontFamily"
                  placeholder="Inter, system-ui, sans-serif"
                  value={formData.headingFontFamily}
                  onChange={(e) => updateField("headingFontFamily", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fontSize">Base Font Size</Label>
                <Input
                  id="fontSize"
                  placeholder="14px"
                  value={formData.fontSize}
                  onChange={(e) => updateField("fontSize", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spacing & Layout</CardTitle>
              <CardDescription>Customize spacing and border radius</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="borderRadius">Border Radius</Label>
                <Input
                  id="borderRadius"
                  placeholder="8px"
                  value={formData.borderRadius}
                  onChange={(e) => updateField("borderRadius", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spacing">Base Spacing</Label>
                <Input
                  id="spacing"
                  placeholder="16px"
                  value={formData.spacing}
                  onChange={(e) => updateField("spacing", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom CSS</CardTitle>
              <CardDescription>Add custom CSS for advanced customization</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`/* Custom CSS */
.widget-container {
  /* your styles here */
}`}
                value={formData.customCss}
                onChange={(e) => updateField("customCss", e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                CSS will be scoped to the widget container
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Color Picker Component
function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded border cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    </div>
  );
}
