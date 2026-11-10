import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import { MobileBottomBar } from "@/components/public/mobile-bottom-bar";
import { OnSiteAdminEditor } from "@/components/admin/on-site-editor";
import { getHeaderConfig, getFooterConfig, getAllLiveContent } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Faith Venture Realty",
  description: "Your Trusted Real Estate Partner",
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerConfig, footerConfig, liveContent] = await Promise.all([
    getHeaderConfig(),
    getFooterConfig(),
    getAllLiveContent(),
  ]);

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <PublicHeader initialConfig={headerConfig} />
      <main className="flex-1">{children}</main>
      <PublicFooter initialConfig={footerConfig} />
      <MobileBottomBar />
      <OnSiteAdminEditor initialLiveContent={liveContent} />
    </div>
  );
}
