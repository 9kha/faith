import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Clock,
  Compass,
  FileCheck,
  Quote,
  HelpCircle,
  BarChart3,
  ExternalLink,
  Layers,
} from "lucide-react";
import { InquiryForm } from "@/components/public/inquiry-form";
import type { PageBlock } from "@/app/(admin)/admin/pages/page-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await db.page.findUnique({
    where: { slug, deletedAt: null, status: "PUBLISHED" },
  });

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: `${page.seoTitle || page.title} | Faith Venture Realty`,
    description:
      page.seoDescription ||
      "Exclusive property guides, investor insights, and township developments.",
  };
}

export default async function DynamicCustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await db.page.findUnique({
    where: { slug, deletedAt: null, status: "PUBLISHED" },
  });

  if (!page) notFound();

  // Parse blocks or legacy content
  let blocks: PageBlock[] = [];
  let isBlockLayout = false;

  if (page.content) {
    if (typeof page.content === "object" && page.content !== null) {
      const c = page.content as any;
      if (Array.isArray(c.blocks) && c.blocks.length > 0) {
        blocks = c.blocks;
        isBlockLayout = true;
      } else if (Array.isArray(c) && c.length > 0) {
        blocks = c;
        isBlockLayout = true;
      }
    }
  }

  // Legacy layout variables
  let legacySubtitle = "";
  let legacyBadge = "";
  let legacyBodyText = "";
  let legacyFeatures: string[] = [];
  let legacyCalloutBox = "";
  let legacyCtaText = "Schedule VIP Consultation";
  let legacyCtaLink = "/contact";

  if (!isBlockLayout && page.content) {
    if (typeof page.content === "object" && page.content !== null) {
      const c = page.content as any;
      legacySubtitle = c.subtitle || "";
      legacyBadge = c.badge || "";
      legacyBodyText = c.bodyText || "";
      legacyFeatures = Array.isArray(c.features) ? c.features : [];
      legacyCalloutBox = c.calloutBox || "";
      legacyCtaText = c.ctaText || legacyCtaText;
      legacyCtaLink = c.ctaLink || legacyCtaLink;
    } else if (typeof page.content === "string") {
      legacyBodyText = page.content;
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors pb-24">
      {/* If Modular Block Layout is active, render blocks in sequence */}
      {isBlockLayout ? (
        <div className="space-y-16">
          {blocks.map((block, idx) => (
            <div key={block.id || idx}>
              {/* 1. HERO BLOCK */}
              {block.type === "HERO" && (
                <section className="relative overflow-hidden border-b border-border bg-muted/20 py-16 lg:py-24">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-25 dark:opacity-15 bg-gradient-to-b from-primary/20 to-transparent" />
                  <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
                    {block.badge && (
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6 shadow-xs animate-float">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{block.badge}</span>
                      </div>
                    )}
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                      {block.title || page.title}
                    </h1>
                    {block.subtitle && (
                      <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
                        {block.subtitle}
                      </p>
                    )}
                    {block.ctaText && block.ctaLink && (
                      <div className="flex justify-center">
                        <Link
                          href={block.ctaLink}
                          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all text-sm group"
                        >
                          <span>{block.ctaText}</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* 2. TEXT BLOCK */}
              {block.type === "TEXT" && (
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className={`space-y-4 ${block.align === "center" ? "text-center" : "text-left"}`}>
                    {block.title && (
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        {block.title}
                      </h2>
                    )}
                    {block.content && (
                      <div className="prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-base sm:text-lg whitespace-pre-line text-justify">
                        {block.content}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* 3. FEATURES BLOCK */}
              {block.type === "FEATURES" && (
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                  {(block.title || block.subtitle) && (
                    <div className="text-center space-y-2 max-w-2xl mx-auto">
                      {block.title && (
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                          {block.title}
                        </h2>
                      )}
                      {block.subtitle && (
                        <p className="text-sm sm:text-base text-muted-foreground">
                          {block.subtitle}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(block.items || []).map((item, fIdx) => (
                      <div
                        key={fIdx}
                        className="hover-lift rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <h3 className="text-base font-bold text-foreground">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 4. MEDIA BLOCK */}
              {block.type === "MEDIA" && (
                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-md">
                    {block.mediaType === "video" && block.mediaUrl ? (
                      <div className="relative aspect-video w-full">
                        <iframe
                          src={block.mediaUrl.replace("watch?v=", "embed/")}
                          title={block.title || "Video"}
                          className="h-full w-full"
                          allowFullScreen
                        />
                      </div>
                    ) : block.mediaUrl ? (
                      <div className="relative h-80 sm:h-[450px] w-full">
                        <Image
                          src={block.mediaUrl}
                          alt={block.title || "Media preview"}
                          fill
                          sizes="(max-width: 1200px) 100vw, 1200px"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    {(block.title || block.mediaCaption) && (
                      <div className="p-4 border-t border-border bg-muted/30">
                        {block.title && (
                          <p className="text-sm font-bold text-foreground">{block.title}</p>
                        )}
                        {block.mediaCaption && (
                          <p className="text-xs text-muted-foreground mt-0.5">{block.mediaCaption}</p>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* 5. STATS BLOCK */}
              {block.type === "STATS" && (
                <section className="border-y border-border bg-muted/40 py-12">
                  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    {block.title && (
                      <h2 className="text-center text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        {block.title}
                      </h2>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {(block.stats || []).map((stat, sIdx) => (
                        <div
                          key={sIdx}
                          className="hover-lift rounded-2xl border border-border/80 bg-card p-6 text-center shadow-xs"
                        >
                          <div className="text-3xl sm:text-4xl font-extrabold text-foreground">
                            {stat.value}
                          </div>
                          <div className="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* 6. FAQ BLOCK */}
              {block.type === "FAQ" && (
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                  {block.title && (
                    <div className="text-center space-y-1">
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        {block.title}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Answers to commonly asked questions
                      </p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {(block.faqs || []).map((faq, fIdx) => (
                      <div
                        key={fIdx}
                        className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-2"
                      >
                        <h3 className="text-sm sm:text-base font-bold text-foreground flex items-start gap-2.5">
                          <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{faq.question}</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground pl-6 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 7. QUOTE BLOCK */}
              {block.type === "QUOTE" && (
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="relative rounded-3xl border border-primary/20 bg-primary/5 p-8 sm:p-10 shadow-sm text-center">
                    <Quote className="h-8 w-8 text-primary/40 mx-auto mb-4" />
                    <blockquote className="text-lg sm:text-xl font-medium text-foreground italic leading-relaxed max-w-2xl mx-auto">
                      "{block.quoteText}"
                    </blockquote>
                    {(block.authorName || block.authorRole) && (
                      <div className="mt-6 pt-4 border-t border-border/60">
                        {block.authorName && (
                          <p className="text-sm font-bold text-foreground">{block.authorName}</p>
                        )}
                        {block.authorRole && (
                          <p className="text-xs text-muted-foreground mt-0.5">{block.authorRole}</p>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* 8. CTA BLOCK */}
              {block.type === "CTA" && (
                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="rounded-3xl border border-border bg-gradient-to-br from-card to-muted/50 p-8 sm:p-12 shadow-xl">
                    <div className="max-w-2xl mx-auto text-center space-y-4">
                      {block.title && (
                        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                          {block.title}
                        </h2>
                      )}
                      {block.subtitle && (
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {block.subtitle}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        {block.ctaText && block.ctaLink && (
                          <Link
                            href={block.ctaLink}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-md transition-all text-sm"
                          >
                            <span>{block.ctaText}</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                        {block.secondaryCtaText && block.secondaryCtaLink && (
                          <a
                            href={block.secondaryCtaLink}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-border bg-background hover:bg-muted text-foreground transition-all text-sm"
                          >
                            <PhoneCall className="h-4 w-4 text-emerald-500" />
                            <span>{block.secondaryCtaText}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {block.showForm && (
                      <div className="mt-8 pt-8 border-t border-border max-w-xl mx-auto">
                        <InquiryForm
                          projectName={block.title || page.title}
                          prefillMessage={`Inquiry regarding: ${block.title || page.title}`}
                        />
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Legacy Layout Fallback */
        <div>
          {/* Hero Header Section */}
          <section className="relative overflow-hidden border-b border-border bg-muted/20 py-16 lg:py-24">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1720px] h-96 bg-primary/5 dark:bg-primary/10 blur-3xl pointer-events-none rounded-full" />
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              {legacyBadge ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{legacyBadge}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-6 shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified Advisory &amp; Investor Guide</span>
                </div>
              )}

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                {page.title}
              </h1>

              {legacySubtitle ? (
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {legacySubtitle}
                </p>
              ) : page.seoDescription ? (
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {page.seoDescription}
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-primary" />
                  <span>Direct Builder Desk</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-emerald-500" />
                  <span>100% RERA Verified</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>
          </section>

          {/* Main Content Grid */}
          <section className="py-12 lg:py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              {legacyCalloutBox && (
                <div className="p-6 sm:p-7 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-foreground shadow-sm flex items-start gap-4">
                  <div className="h-9 w-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 font-bold">
                    !
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm tracking-wide uppercase text-amber-600 dark:text-amber-400">
                      Important Notice &amp; Advisory
                    </p>
                    <p className="text-sm sm:text-base leading-relaxed opacity-95">
                      {legacyCalloutBox}
                    </p>
                  </div>
                </div>
              )}

              {legacyBodyText && (
                <div className="bg-card rounded-2xl p-6 sm:p-10 border border-border shadow-sm">
                  <div className="prose max-w-none text-foreground/90 leading-relaxed text-base sm:text-lg whitespace-pre-line text-justify">
                    {legacyBodyText}
                  </div>
                </div>
              )}

              {legacyFeatures.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    Key Highlights &amp; Investor Benefits
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {legacyFeatures.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-xl bg-card border border-border hover:border-primary/50 transition-all shadow-sm flex items-start gap-3.5 group"
                      >
                        <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6">
                <div className="lg:col-span-7 bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-xl space-y-6">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      VIP Priority Concierge
                    </span>
                    <h3 className="text-2xl font-bold text-foreground mt-1">
                      Connect with a Dedicated Investment Specialist
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Get personalized unit allocations, ROI spreadsheets, and direct builder inventory access.
                    </p>
                  </div>

                  <InquiryForm
                    projectName={page.title}
                    prefillMessage={`Inquiry regarding custom guide: ${page.title}`}
                  />
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-primary/5 p-6 sm:p-8 rounded-3xl border border-primary/20 shadow-md space-y-5">
                    <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                      <PhoneCall className="h-6 w-6" />
                    </div>
                    <h4 className="text-xl font-bold text-foreground">
                      Direct Advisory Desk
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Call or WhatsApp our Senior Property Strategists for verified title deeds, floor plans, and preferential pre-launch rates.
                    </p>

                    <div className="pt-2">
                      <Link
                        href={legacyCtaLink || "/contact"}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all text-sm group"
                      >
                        <span>{legacyCtaText}</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
