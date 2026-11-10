import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrandingTokensProvider } from "@/components/branding-tokens";
import { ThemeProvider } from "@/components/theme-provider";
import { getThemeTokens } from "@/lib/settings";
import { generateThemeCss, getGoogleFontUrl } from "@/lib/theme-presets";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Faith Venture Realty — Premium Real Estate & Verified Projects",
  description: "Central India's trusted real estate consultancy and advisory platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tokens = await getThemeTokens().catch(() => null);
  const themeCss = tokens ? generateThemeCss(tokens) : "";
  const googleFontsUrl = tokens
    ? getGoogleFontUrl(tokens.headingFont, tokens.bodyFont)
    : null;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${tokens?.compactMode ? "compact-mode" : ""} h-full antialiased`}
    >
      <head>
        {googleFontsUrl && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin="anonymous"
            />
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link rel="stylesheet" href={googleFontsUrl} />
          </>
        )}
        {themeCss && (
          <style
            id="custom-theme-variables"
            dangerouslySetInnerHTML={{ __html: themeCss }}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <ThemeProvider>
          <TooltipProvider>
            <BrandingTokensProvider tokens={tokens}>{children}</BrandingTokensProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
