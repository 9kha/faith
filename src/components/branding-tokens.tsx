"use client";

import { useEffect, useState } from "react";
import type { ThemeTokens } from "@/lib/theme-presets";
import { getGoogleFontUrl, getContrastTextColor, formatRadius } from "@/lib/theme-presets";

export function BrandingTokensProvider({
  children,
  tokens,
}: {
  children: React.ReactNode;
  tokens: ThemeTokens | null;
}) {
  const [currentTokens, setCurrentTokens] = useState<ThemeTokens | null>(tokens);

  // Sync if parent passes new tokens
  useEffect(() => {
    if (tokens) {
      setCurrentTokens(tokens);
    }
  }, [tokens]);

  // Listen for live theme updates dispatched from Admin Settings
  useEffect(() => {
    const handleThemeUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeTokens>;
      if (customEvent.detail) {
        setCurrentTokens(customEvent.detail);
      }
    };

    window.addEventListener("theme-tokens-updated", handleThemeUpdate);
    return () => {
      window.removeEventListener("theme-tokens-updated", handleThemeUpdate);
    };
  }, []);

  useEffect(() => {
    if (!currentTokens) return;
    const root = document.documentElement;

    const set = (name: string, value: unknown) => {
      if (typeof value !== "string" || !value.trim()) return;
      root.style.setProperty(name, value);
    };

    // Compact Mode density
    if (currentTokens.compactMode) {
      root.classList.add("compact-mode");
    } else {
      root.classList.remove("compact-mode");
    }

    // Typography
    const headingFamily =
      currentTokens.headingFont === "Geist Sans"
        ? "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif"
        : `"${currentTokens.headingFont}", var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif`;

    const bodyFamily =
      currentTokens.bodyFont === "Geist Sans"
        ? "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif"
        : `"${currentTokens.bodyFont}", var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif`;

    set("--font-sans", bodyFamily);
    set("--font-heading", headingFamily);
    set("--radius", formatRadius(currentTokens.radius));

    // Dynamic Google Fonts loading
    const fontUrl = getGoogleFontUrl(
      currentTokens.headingFont,
      currentTokens.bodyFont
    );
    if (fontUrl && typeof document !== "undefined") {
      let fontLink = document.getElementById(
        "dynamic-google-fonts"
      ) as HTMLLinkElement | null;
      if (!fontLink) {
        fontLink = document.createElement("link");
        fontLink.id = "dynamic-google-fonts";
        fontLink.rel = "stylesheet";
        document.head.appendChild(fontLink);
      }
      if (fontLink.href !== fontUrl) {
        fontLink.href = fontUrl;
      }
    }

    // Light Mode tokens
    if (currentTokens.light) {
      set("--theme-light-primary", currentTokens.light.primary);
      set(
        "--theme-light-primary-foreground",
        getContrastTextColor(currentTokens.light.primary)
      );
      set("--theme-light-secondary", currentTokens.light.secondary);
      set(
        "--theme-light-secondary-foreground",
        getContrastTextColor(currentTokens.light.secondary)
      );
      set("--theme-light-accent", currentTokens.light.accent);
      set(
        "--theme-light-accent-foreground",
        getContrastTextColor(currentTokens.light.accent)
      );
      set("--theme-light-background", currentTokens.light.background);
      set("--theme-light-card", currentTokens.light.card);
      set("--theme-light-card-foreground", currentTokens.light.foreground);
      set("--theme-light-foreground", currentTokens.light.foreground);
      set("--theme-light-muted", currentTokens.light.muted);
      set(
        "--theme-light-muted-foreground",
        `color-mix(in srgb, ${currentTokens.light.foreground} 62%, transparent)`
      );
      set("--theme-light-border", currentTokens.light.border);
      set("--theme-light-input", currentTokens.light.border);
      set("--theme-light-ring", currentTokens.light.primary);
    }

    // Dark Mode tokens
    if (currentTokens.dark) {
      set("--theme-dark-primary", currentTokens.dark.primary);
      set(
        "--theme-dark-primary-foreground",
        getContrastTextColor(currentTokens.dark.primary)
      );
      set("--theme-dark-secondary", currentTokens.dark.secondary);
      set(
        "--theme-dark-secondary-foreground",
        getContrastTextColor(currentTokens.dark.secondary)
      );
      set("--theme-dark-accent", currentTokens.dark.accent);
      set(
        "--theme-dark-accent-foreground",
        getContrastTextColor(currentTokens.dark.accent)
      );
      set("--theme-dark-background", currentTokens.dark.background);
      set("--theme-dark-card", currentTokens.dark.card);
      set("--theme-dark-card-foreground", currentTokens.dark.foreground);
      set("--theme-dark-foreground", currentTokens.dark.foreground);
      set("--theme-dark-muted", currentTokens.dark.muted);
      set(
        "--theme-dark-muted-foreground",
        `color-mix(in srgb, ${currentTokens.dark.foreground} 65%, transparent)`
      );
      set("--theme-dark-border", currentTokens.dark.border);
      set("--theme-dark-input", currentTokens.dark.border);
      set("--theme-dark-ring", currentTokens.dark.primary);
    }

    // Legacy brand custom properties
    const activePrimary = currentTokens.light?.primary || currentTokens.primary;
    const activeSecondary = currentTokens.light?.secondary || currentTokens.secondary;
    const activeBackground = currentTokens.light?.background || currentTokens.background;
    const activeText = currentTokens.light?.foreground || currentTokens.text;

    set("--brand-primary", activePrimary);
    set("--brand-secondary", activeSecondary);
    set("--brand-accent", currentTokens.light?.accent || currentTokens.accent);
    set("--brand-background", activeBackground);
    set("--brand-text", activeText);
    set("--brand-heading-font", headingFamily);
    set("--brand-body-font", bodyFamily);
    set("--brand-radius", formatRadius(currentTokens.radius));
    set("--brand-spacing", currentTokens.spacing || "1rem");
  }, [currentTokens]);

  return <>{children}</>;
}
