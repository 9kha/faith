"use client";

import { useState } from "react";
import {
  THEME_PRESETS,
  FONT_OPTIONS,
  RADIUS_OPTIONS,
  getContrastTextColor,
} from "@/lib/theme-presets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Palette,
  Type,
  Sun,
  Moon,
  Sparkles,
  RotateCcw,
  Check,
  Building2,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Sliders,
  Minimize2,
  Maximize2,
} from "lucide-react";

interface ThemeStudioProps {
  formValues: Record<string, string>;
  onBatchChange: (updates: Record<string, string>) => void;
  onFieldChange: (key: string, value: string) => void;
}

export function ThemeStudio({
  formValues,
  onBatchChange,
  onFieldChange,
}: ThemeStudioProps) {
  const [activePaletteTab, setActivePaletteTab] = useState<"light" | "dark">("light");
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");

  // Read current values or resolve to default
  const activePreset = formValues["theme.preset"] || "default";
  const headingFont =
    formValues["theme.headingFont"] ||
    formValues["brand.headingFont"] ||
    THEME_PRESETS.default.headingFont;
  const bodyFont =
    formValues["theme.bodyFont"] ||
    formValues["brand.bodyFont"] ||
    THEME_PRESETS.default.bodyFont;
  const radius =
    formValues["theme.radius"] ||
    formValues["brand.radius"] ||
    THEME_PRESETS.default.radius;

  const compactMode =
    String(formValues["theme.compactMode"]) === "true" ||
    String(formValues["site.compactMode"]) === "true";

  const handleToggleCompactMode = (enabled: boolean) => {
    onFieldChange("theme.compactMode", enabled ? "true" : "false");
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("theme-tokens-updated", {
          detail: {
            compactMode: enabled,
          },
        })
      );
      if (enabled) {
        document.documentElement.classList.add("compact-mode");
      } else {
        document.documentElement.classList.remove("compact-mode");
      }
    }
  };

  // Light Mode values
  const lightPrimary =
    formValues["theme.light.primary"] ||
    formValues["brand.accentColor"] ||
    formValues["brand.primaryColor"] ||
    THEME_PRESETS.default.light.primary;
  const lightSecondary =
    formValues["theme.light.secondary"] ||
    formValues["brand.secondaryColor"] ||
    THEME_PRESETS.default.light.secondary;
  const lightAccent =
    formValues["theme.light.accent"] ||
    formValues["brand.accentColor"] ||
    THEME_PRESETS.default.light.accent;
  const lightBackground =
    formValues["theme.light.background"] ||
    formValues["brand.backgroundColor"] ||
    THEME_PRESETS.default.light.background;
  const lightCard =
    formValues["theme.light.card"] || THEME_PRESETS.default.light.card;
  const lightForeground =
    formValues["theme.light.foreground"] ||
    formValues["brand.textColor"] ||
    THEME_PRESETS.default.light.foreground;
  const lightBorder =
    formValues["theme.light.border"] || THEME_PRESETS.default.light.border;

  // Dark Mode values
  const darkPrimary =
    formValues["theme.dark.primary"] || THEME_PRESETS.default.dark.primary;
  const darkSecondary =
    formValues["theme.dark.secondary"] || THEME_PRESETS.default.dark.secondary;
  const darkAccent =
    formValues["theme.dark.accent"] || THEME_PRESETS.default.dark.accent;
  const darkBackground =
    formValues["theme.dark.background"] || THEME_PRESETS.default.dark.background;
  const darkCard =
    formValues["theme.dark.card"] || THEME_PRESETS.default.dark.card;
  const darkForeground =
    formValues["theme.dark.foreground"] || THEME_PRESETS.default.dark.foreground;
  const darkBorder =
    formValues["theme.dark.border"] || THEME_PRESETS.default.dark.border;

  // Handle preset selection
  const handleSelectPreset = (presetId: string) => {
    const preset = THEME_PRESETS[presetId];
    if (!preset) return;

    onBatchChange({
      "theme.preset": preset.id,
      "theme.headingFont": preset.headingFont,
      "theme.bodyFont": preset.bodyFont,
      "theme.radius": preset.radius,
      // Light
      "theme.light.primary": preset.light.primary,
      "theme.light.secondary": preset.light.secondary,
      "theme.light.accent": preset.light.accent,
      "theme.light.background": preset.light.background,
      "theme.light.card": preset.light.card,
      "theme.light.foreground": preset.light.foreground,
      "theme.light.muted": preset.light.muted,
      "theme.light.border": preset.light.border,
      // Dark
      "theme.dark.primary": preset.dark.primary,
      "theme.dark.secondary": preset.dark.secondary,
      "theme.dark.accent": preset.dark.accent,
      "theme.dark.background": preset.dark.background,
      "theme.dark.card": preset.dark.card,
      "theme.dark.foreground": preset.dark.foreground,
      "theme.dark.muted": preset.dark.muted,
      "theme.dark.border": preset.dark.border,
      // Sync legacy brand keys
      "brand.primaryColor": preset.light.primary,
      "brand.secondaryColor": preset.light.secondary,
      "brand.accentColor": preset.light.accent,
      "brand.backgroundColor": preset.light.background,
      "brand.textColor": preset.light.foreground,
      "brand.headingFont": preset.headingFont,
      "brand.bodyFont": preset.bodyFont,
      "brand.radius": preset.radius,
    });
  };

  const handleCustomColorChange = (key: string, value: string) => {
    const updates: Record<string, string> = {
      [key]: value,
      "theme.preset": "custom",
    };

    // Keep legacy brand keys in sync
    if (key === "theme.light.primary") {
      updates["brand.primaryColor"] = value;
      updates["brand.accentColor"] = value;
    } else if (key === "theme.light.secondary") {
      updates["brand.secondaryColor"] = value;
    } else if (key === "theme.light.accent") {
      updates["brand.accentColor"] = value;
    } else if (key === "theme.light.background") {
      updates["brand.backgroundColor"] = value;
    } else if (key === "theme.light.foreground") {
      updates["brand.textColor"] = value;
    }

    onBatchChange(updates);
  };

  const handleFontChange = (type: "heading" | "body", font: string) => {
    if (type === "heading") {
      onBatchChange({
        "theme.headingFont": font,
        "brand.headingFont": font,
      });
    } else {
      onBatchChange({
        "theme.bodyFont": font,
        "brand.bodyFont": font,
      });
    }
  };

  const handleRadiusChange = (newRadius: string) => {
    onBatchChange({
      "theme.radius": newRadius,
      "brand.radius": newRadius,
    });
  };

  // Compute live preview colors based on preview mode
  const previewColors =
    previewMode === "light"
      ? {
          primary: lightPrimary,
          primaryFg: getContrastTextColor(lightPrimary),
          secondary: lightSecondary,
          secondaryFg: getContrastTextColor(lightSecondary),
          accent: lightAccent,
          bg: lightBackground,
          card: lightCard,
          text: lightForeground,
          border: lightBorder,
        }
      : {
          primary: darkPrimary,
          primaryFg: getContrastTextColor(darkPrimary),
          secondary: darkSecondary,
          secondaryFg: darkForeground,
          accent: darkAccent,
          bg: darkBackground,
          card: darkCard,
          text: darkForeground,
          border: darkBorder,
        };

  return (
    <div className="space-y-8">
      {/* Introduction banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-bold tracking-tight">
              Theme & Typography Studio
            </h2>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Global Site Styling
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure custom theme palettes for both Bright/Light and Dark mode,
            choose high-performance Google Fonts, and adjust corner radius.
            Changes apply seamlessly across all public pages and the admin portal.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSelectPreset("default")}
          className="shrink-0 gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to Default Theme
        </Button>
      </div>

      {/* 1. Theme Presets Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4 text-primary" />
            1. Curated Theme Presets
          </CardTitle>
          <CardDescription>
            Select a designer-crafted palette to automatically configure matching
            colors for both Bright and Dark modes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.values(THEME_PRESETS).map((preset) => {
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition-all hover:scale-[1.02] hover:shadow-md ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-sm"
                      : "border-border hover:border-primary/40 bg-card"
                  }`}
                >
                  {/* Top Gradient Accent Bar */}
                  <div
                    className="h-2 w-full"
                    style={{
                      background:
                        preset.gradient ||
                        `linear-gradient(135deg, ${preset.light.primary} 0%, ${preset.light.accent} 100%)`,
                    }}
                  />
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-foreground">
                          {preset.name}
                        </span>
                        {isSelected && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {preset.description}
                      </p>
                    </div>

                    {/* Swatch indicators: Primary, Accent, Light BG, Dark BG */}
                    <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-border/50">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">
                        Palette:
                      </span>
                      <span
                        className="h-4 w-4 rounded-full border shadow-xs"
                        style={{ backgroundColor: preset.light.primary }}
                        title="Primary"
                      />
                      <span
                        className="h-4 w-4 rounded-full border shadow-xs"
                        style={{ backgroundColor: preset.light.accent }}
                        title="Accent"
                      />
                      <span
                        className="h-4 w-4 rounded-full border shadow-xs"
                        style={{ backgroundColor: preset.light.background }}
                        title="Light Mode Background"
                      />
                      <span
                        className="h-4 w-4 rounded-full border shadow-xs"
                        style={{ backgroundColor: preset.dark.background }}
                        title="Dark Mode Background"
                      />
                      {preset.gradient && (
                        <span
                          className="ml-auto inline-block h-3.5 w-8 rounded-full border shadow-xs"
                          style={{ background: preset.gradient }}
                          title="Gradient Preview"
                        />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Custom Theme Card indicator */}
            <div
              className={`flex flex-col rounded-xl border p-4 text-left ${
                activePreset === "custom"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/40"
                  : "border-dashed border-border/80 bg-muted/20 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-primary" />
                  Custom Theme
                </span>
                {activePreset === "custom" && (
                  <Badge variant="outline" className="border-primary text-primary text-[10px]">
                    Active
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Custom color palette created using the color pickers below.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Typography Studio (Font Selector) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Type className="h-4 w-4 text-primary" />
            2. Typography Studio (Font Selector)
          </CardTitle>
          <CardDescription>
            Choose font families for Headings and Body text. Google Fonts are
            automatically loaded and rendered across all pages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Heading Font */}
            <div className="space-y-2">
              <Label htmlFor="heading-font-select" className="text-sm font-medium">
                Heading Font Family
              </Label>
              <select
                id="heading-font-select"
                value={headingFont}
                onChange={(e) => handleFontChange("heading", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.category})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Applied to all page titles, hero headings, card titles, and section headers (h1–h6).
              </p>
            </div>

            {/* Body Font */}
            <div className="space-y-2">
              <Label htmlFor="body-font-select" className="text-sm font-medium">
                Body Font Family
              </Label>
              <select
                id="body-font-select"
                value={bodyFont}
                onChange={(e) => handleFontChange("body", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.category})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Applied to body paragraphs, buttons, navigation links, forms, and tables.
              </p>
            </div>
          </div>

          {/* Typography Preview Banner */}
          <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Live Typography Combination Preview:
            </span>
            <h3
              className="text-2xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: headingFont === "Geist Sans" ? "inherit" : `"${headingFont}", sans-serif` }}
            >
              Luxury Real Estate & Verified Township Living
            </h3>
            <p
              className="text-sm leading-relaxed text-muted-foreground max-w-2xl"
              style={{ fontFamily: bodyFont === "Geist Sans" ? "inherit" : `"${bodyFont}", sans-serif` }}
            >
              Discover architecturally curated residences, odd-even cantilevered sky balconies,
              and prime commercial spaces across Central India with 100% RERA verification.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Corner Radius (Roundness) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sliders className="h-4 w-4 text-primary" />
            3. Corner Rounding (Border Radius)
          </CardTitle>
          <CardDescription>
            Controls the curvature applied to property cards, dialogs, buttons, and inputs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2.5">
            {RADIUS_OPTIONS.map((r) => {
              const isSelected = radius === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => handleRadiusChange(r.value)}
                  className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  <span
                    className="inline-block h-3.5 w-3.5 border-2 border-current"
                    style={{ borderRadius: r.value }}
                  />
                  {r.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Compact Design Mode (Spacing & Density) */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Minimize2 className="h-4 w-4 text-primary" />
                4. Compact Design Mode (Spacing & Layout Density)
              </CardTitle>
              <CardDescription>
                Reduces whitespace, section padding, and container margins across all pages so users can see more properties and data effortlessly.
              </CardDescription>
            </div>
            <Badge variant={compactMode ? "default" : "outline"} className="w-fit text-xs">
              {compactMode ? "High-Density Compact Active" : "Standard Spacing Active"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleToggleCompactMode(false)}
              className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
                !compactMode
                  ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-xs"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className="flex items-center gap-2 font-semibold text-sm text-foreground">
                  <Maximize2 className="h-4 w-4 text-muted-foreground" />
                  Standard (Comfortable View)
                </span>
                {!compactMode && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Spacious layout with standard breathing room and comfortable padding across all sections.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleToggleCompactMode(true)}
              className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
                compactMode
                  ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-xs"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className="flex items-center gap-2 font-semibold text-sm text-foreground">
                  <Minimize2 className="h-4 w-4 text-primary" />
                  Compact (High-Density View)
                </span>
                {compactMode && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tighter padding, reduced section spacing, and compact cards so users see more properties with minimal scrolling.
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 5. Color Palette Studio (Bright / Light Mode & Dark Mode) */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4 text-primary" />
                5. Color Palette Studio (Light & Dark Modes)
              </CardTitle>
              <CardDescription>
                Customize individual color tokens. Changes automatically update
                the overall look in both Bright mode and Dark mode.
              </CardDescription>
            </div>

            {/* Mode switch pills */}
            <div className="flex items-center rounded-xl border border-border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => setActivePaletteTab("light")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activePaletteTab === "light"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                Bright / Light Mode
              </button>
              <button
                type="button"
                onClick={() => setActivePaletteTab("dark")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activePaletteTab === "dark"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="h-3.5 w-3.5 text-blue-400" />
                Dark Mode
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activePaletteTab === "light" ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Sun className="h-4 w-4" />
                Active Bright / Light Mode Palette
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ColorField
                  id="theme.light.primary"
                  label="Primary Brand Color"
                  description="Main identity color for primary buttons, active links, and prominent badges"
                  value={lightPrimary}
                  onChange={(v) => handleCustomColorChange("theme.light.primary", v)}
                />
                <ColorField
                  id="theme.light.accent"
                  label="Accent Highlight Color"
                  description="Vibrant secondary highlight for CTAs and tags"
                  value={lightAccent}
                  onChange={(v) => handleCustomColorChange("theme.light.accent", v)}
                />
                <ColorField
                  id="theme.light.secondary"
                  label="Secondary / Muted Surface"
                  description="Subtle background for pills, secondary buttons, and chips"
                  value={lightSecondary}
                  onChange={(v) => handleCustomColorChange("theme.light.secondary", v)}
                />
                <ColorField
                  id="theme.light.background"
                  label="Page Background (Light)"
                  description="Overall canvas background color across all public and admin pages"
                  value={lightBackground}
                  onChange={(v) => handleCustomColorChange("theme.light.background", v)}
                />
                <ColorField
                  id="theme.light.card"
                  label="Card & Container Surface"
                  description="Surface color for property cards, dialogs, forms, and sidebars"
                  value={lightCard}
                  onChange={(v) => handleCustomColorChange("theme.light.card", v)}
                />
                <ColorField
                  id="theme.light.foreground"
                  label="Text / Heading Color"
                  description="Main text and heading color for high-contrast legibility"
                  value={lightForeground}
                  onChange={(v) => handleCustomColorChange("theme.light.foreground", v)}
                />
                <ColorField
                  id="theme.light.border"
                  label="Border & Divider Color"
                  description="Color for card borders, input outlines, and dividers"
                  value={lightBorder}
                  onChange={(v) => handleCustomColorChange("theme.light.border", v)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400">
                <Moon className="h-4 w-4" />
                Active Dark Mode Palette
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ColorField
                  id="theme.dark.primary"
                  label="Dark Primary Color"
                  description="Prominent brand color adapted for dark backgrounds"
                  value={darkPrimary}
                  onChange={(v) => handleCustomColorChange("theme.dark.primary", v)}
                />
                <ColorField
                  id="theme.dark.accent"
                  label="Dark Accent Color"
                  description="Vibrant highlight for dark mode badges and links"
                  value={darkAccent}
                  onChange={(v) => handleCustomColorChange("theme.dark.accent", v)}
                />
                <ColorField
                  id="theme.dark.secondary"
                  label="Dark Secondary Surface"
                  description="Secondary surface color for secondary buttons and tags"
                  value={darkSecondary}
                  onChange={(v) => handleCustomColorChange("theme.dark.secondary", v)}
                />
                <ColorField
                  id="theme.dark.background"
                  label="Page Background (Dark)"
                  description="Deep background canvas color for night / dark mode"
                  value={darkBackground}
                  onChange={(v) => handleCustomColorChange("theme.dark.background", v)}
                />
                <ColorField
                  id="theme.dark.card"
                  label="Card & Container (Dark)"
                  description="Elevated card and surface color for dark mode cards and dialogs"
                  value={darkCard}
                  onChange={(v) => handleCustomColorChange("theme.dark.card", v)}
                />
                <ColorField
                  id="theme.dark.foreground"
                  label="Text / Heading (Dark)"
                  description="Primary light text color in dark mode"
                  value={darkForeground}
                  onChange={(v) => handleCustomColorChange("theme.dark.foreground", v)}
                />
                <ColorField
                  id="theme.dark.border"
                  label="Border & Divider (Dark)"
                  description="Dark mode divider and card border line color"
                  value={darkBorder}
                  onChange={(v) => handleCustomColorChange("theme.dark.border", v)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Interactive Live Simulation Preview */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                5. Interactive Live Theme Preview
              </CardTitle>
              <CardDescription>
                Test your chosen fonts, colors, and curvature in real-time. Toggle
                between Light and Dark mode to review both experiences.
              </CardDescription>
            </div>

            {/* Preview mode toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">
                Preview Mode:
              </span>
              <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1">
                <button
                  type="button"
                  onClick={() => setPreviewMode("light")}
                  className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold ${
                    previewMode === "light"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground"
                  }`}
                >
                  <Sun className="h-3 w-3 text-amber-500" /> Light
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("dark")}
                  className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold ${
                    previewMode === "dark"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground"
                  }`}
                >
                  <Moon className="h-3 w-3 text-blue-400" /> Dark
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-2xl border transition-all duration-300 p-6 space-y-6 shadow-sm overflow-hidden"
            style={{
              backgroundColor: previewColors.bg,
              borderColor: previewColors.border,
              color: previewColors.text,
              fontFamily:
                bodyFont === "Geist Sans"
                  ? "inherit"
                  : `"${bodyFont}", sans-serif`,
              borderRadius: radius,
            }}
          >
            {/* Mock Navigation Bar */}
            <div
              className="flex items-center justify-between border-b pb-4"
              style={{ borderColor: previewColors.border }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="grid h-8 w-8 place-items-center rounded-lg"
                  style={{
                    backgroundColor: previewColors.primary,
                    color: previewColors.primaryFg,
                    borderRadius: `calc(${radius} * 0.8)`,
                  }}
                >
                  <Building2 className="h-4 w-4" />
                </span>
                <span
                  className="font-bold text-sm tracking-tight"
                  style={{
                    fontFamily:
                      headingFont === "Geist Sans"
                        ? "inherit"
                        : `"${headingFont}", sans-serif`,
                  }}
                >
                  Faith Venture Realty
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span
                  className="font-semibold underline underline-offset-4"
                  style={{ color: previewColors.primary }}
                >
                  Explore Projects
                </span>
                <span style={{ opacity: 0.7 }}>Builders</span>
                <span style={{ opacity: 0.7 }}>About Us</span>
                <span style={{ opacity: 0.7 }}>Contact</span>
              </div>
            </div>

            {/* Mock Hero Segment */}
            <div className="grid gap-6 md:grid-cols-2 items-center">
              <div className="space-y-4">
                <div
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
                  style={{
                    borderColor: previewColors.border,
                    backgroundColor: previewColors.secondary,
                    color: previewColors.text,
                  }}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  100% RERA Verified Residences
                </div>

                <h1
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
                  style={{
                    fontFamily:
                      headingFont === "Geist Sans"
                        ? "inherit"
                        : `"${headingFont}", sans-serif`,
                  }}
                >
                  Find Your Dream Home with Architectural Elegance
                </h1>

                <p className="text-xs sm:text-sm leading-relaxed" style={{ opacity: 0.8 }}>
                  Transparent builder pricing, cantilevered sky balconies, and verified builder
                  advisory desks across Central India.
                </p>

                {/* Button showcase */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-transform hover:scale-105"
                    style={{
                      backgroundColor: previewColors.primary,
                      color: previewColors.primaryFg,
                      borderRadius: radius,
                    }}
                  >
                    View 3D Township
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 border px-4 py-2 text-xs font-semibold"
                    style={{
                      backgroundColor: previewColors.secondary,
                      borderColor: previewColors.border,
                      color: previewColors.text,
                      borderRadius: radius,
                    }}
                  >
                    Download Brochure
                  </button>
                </div>
              </div>

              {/* Mock Property Card */}
              <div
                className="overflow-hidden border p-4 shadow-sm"
                style={{
                  backgroundColor: previewColors.card,
                  borderColor: previewColors.border,
                  borderRadius: radius,
                }}
              >
                <div
                  className="relative h-32 w-full rounded-lg bg-cover bg-center overflow-hidden flex items-end p-3"
                  style={{
                    backgroundColor: previewColors.secondary,
                    borderRadius: `calc(${radius} * 0.7)`,
                  }}
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                  />
                  <span
                    className="relative text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: previewColors.accent,
                      color: getContrastTextColor(previewColors.accent),
                    }}
                  >
                    New Launch
                  </span>
                  <span className="relative ml-auto text-xs font-bold text-white">
                    ₹1.45 Cr onwards
                  </span>
                </div>

                <div className="mt-3 space-y-1.5">
                  <h4
                    className="font-bold text-sm"
                    style={{
                      fontFamily:
                        headingFont === "Geist Sans"
                          ? "inherit"
                          : `"${headingFont}", sans-serif`,
                    }}
                  >
                    Evara 27-Acre Luxury Township
                  </h4>
                  <p
                    className="flex items-center gap-1 text-xs"
                    style={{ opacity: 0.7 }}
                  >
                    <MapPin className="h-3 w-3" />
                    Super Corridor, Indore
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t pt-2" style={{ borderColor: previewColors.border }}>
                    <span className="text-[11px]" style={{ opacity: 0.7 }}>
                      3 & 4 BHK Sky Villas
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: previewColors.primary }}
                    >
                      Explore →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ColorField({
  id,
  label,
  description,
  value,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <input
          id={`${id}-picker`}
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-md border border-input p-1"
        />
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono text-xs uppercase"
        />
      </div>
      <p className="text-[11px] text-muted-foreground leading-tight">
        {description}
      </p>
    </div>
  );
}
