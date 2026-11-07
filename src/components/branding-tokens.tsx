"use client";

import { useEffect, useState } from "react";
import { getBrandingTokens, BrandingTokens } from "@/lib/settings";

export function BrandingTokensProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<BrandingTokens | null>(null);

  useEffect(() => {
    getBrandingTokens().then(setTokens);
  }, []);

  useEffect(() => {
    if (!tokens) return;
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", tokens.primary);
    root.style.setProperty("--brand-secondary", tokens.secondary);
    root.style.setProperty("--brand-accent", tokens.accent);
    root.style.setProperty("--brand-background", tokens.background);
    root.style.setProperty("--brand-text", tokens.text);
    root.style.setProperty("--brand-heading-font", tokens.headingFont);
    root.style.setProperty("--brand-body-font", tokens.bodyFont);
    root.style.setProperty("--brand-radius", tokens.radius);
    root.style.setProperty("--brand-spacing", tokens.spacing);
  }, [tokens]);

  return <>{children}</>;
}
