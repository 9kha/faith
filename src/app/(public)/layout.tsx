import type { Metadata } from "next";
import { BrandingTokensProvider } from "@/components/branding-tokens";
import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import { MobileBottomBar } from "@/components/public/mobile-bottom-bar";
import { getBrandingTokens } from "@/lib/settings";

export const metadata: Metadata = {
  title: "ChannelPartner Pro",
  description: "Your Trusted Real Estate Partner",
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tokens = await getBrandingTokens().catch(() => null);

  return (
    <html
      lang="en"
      className={
        tokens
          ? `h-full antialiased`
          : `h-full antialiased`
      }
    >
      <body
        className={
          tokens
            ? `min-h-full flex flex-col bg-white text-gray-900`
            : `min-h-full flex flex-col bg-white text-gray-900`
        }
      >
        <BrandingTokensProvider tokens={tokens}>
          <PublicHeader />
          <main className="flex-1">{children}</main>
          <PublicFooter />
          <MobileBottomBar />
        </BrandingTokensProvider>
      </body>
    </html>
  );
}
