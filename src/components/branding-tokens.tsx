"use client";

import { useEffect, useState } from "react";
import { BrandingTokens } from "@/lib/settings";

export function BrandingTokensProvider({
  children,
  tokens,
}: {
  children: React.ReactNode;
  tokens: BrandingTokens | null;
}) {
  const [loadedTokens] = useState<BrandingTokens | null>(tokens);

  useEffect(() => {
    if (!loadedTokens) return;
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", loadedTokens.primary);
    root.style.setProperty("--brand-secondary", loadedTokens.secondary);
    root.style.setProperty("--brand-accent", loadedTokens.accent);
    root.style.setProperty("--brand-background", loadedTokens.background);
    root.style.setProperty("--brand-text", loadedTokens.text);
    root.style.setProperty(
      "--brand-heading-font",
      loadedTokens.headingFont
    );
    root.style.setProperty("--brand-body-font", loadedTokens.bodyFont);
    root.style.setProperty("--brand-radius", loadedTokens.radius);
    root.style.setProperty("--brand-spacing", loadedTokens.spacing);
  }, [loadedTokens]);

  return <>{children}</>;
}
