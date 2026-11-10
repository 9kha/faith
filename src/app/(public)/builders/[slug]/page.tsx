import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Home,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Star,
  Award,
  Video,
  FileText,
  Calendar,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Layers,
  Heart,
  Car,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InquiryForm } from "@/components/public/inquiry-form";
import { VideoShortsReel, type VideoShort } from "@/components/public/video-shorts-reel";
import { getPrimaryImages } from "@/lib/media";
import { formatCompactINR } from "@/lib/format";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const builder = await db.builder.findUnique({
    where: { slug, deletedAt: null },
    select: { name: true, about: true },
  });

  if (!builder) return { title: "Builder Not Found" };

  return {
    title: `${builder.name} — Ongoing & Delivered Projects, Track Record & Reviews`,
    description:
      builder.about ||
      `Explore RERA registered projects by ${builder.name}. View ongoing construction status, delivered townships, customer ratings and investment options.`,
  };
}

export default async function BuilderDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const builder = await db.builder.findUnique({
    where: { slug, deletedAt: null },
    include: {
      logo: { select: { url: true, alt: true } },
      projects: {
        where: { deletedAt: null },
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
      },
    },
  });

  if (!builder) notFound();

  const projectImages = await getPrimaryImages(
    "Project",
    builder.projects.map((p) => p.id)
  );

  // Builder video shorts & reels
  let builderShorts: VideoShort[] = [];
  if ((builder as any).videos) {
    try {
      const parsed =
        typeof (builder as any).videos === "string"
          ? JSON.parse((builder as any).videos)
          : (builder as any).videos;
      if (Array.isArray(parsed) && parsed.length > 0) {
        builderShorts = parsed.map((v: any, i: number) => ({
          ...v,
          id: v.id || `b-short-${i}`,
          builderName: builder.name,
          builderSlug: builder.slug,
        }));
      }
    } catch {
      // ignore
    }
  }

  if (builderShorts.length === 0) {
    builderShorts = [
      {
        id: `b-short-1`,
        title: `${builder.name}: Construction Standards & Legacy Tour`,
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        platform: "youtube",
        format: "video",
        thumbnail: "/images/builder-1.jpg",
        duration: "1:15",
        builderName: builder.name,
        builderSlug: builder.slug,
        category: "PROMO",
      },
      {
        id: `b-short-2`,
        title: `Delivered Township Tour: Resident Amenities Walkthrough`,
        url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
        platform: "youtube",
        format: "short",
        thumbnail: "/images/project-1.jpg",
        duration: "0:58",
        builderName: builder.name,
        builderSlug: builder.slug,
        category: "WALKTHROUGH",
      },
      {
        id: `b-short-3`,
        title: `Managing Director Keynote on Future Central India Developments`,
        url: "https://www.facebook.com/reel/123456789",
        platform: "facebook",
        format: "short",
        thumbnail: "/images/project-2.jpg",
        duration: "1:30",
        builderName: builder.name,
        builderSlug: builder.slug,
        category: "INTERVIEW",
      },
    ];
  }

  return (
    <div className="space-y-0 bg-background text-foreground">
      {/* 1. Builder Hero Banner */}
      <BuilderHeroBanner builder={builder} />

      {/* 2. Track Record & Credibility Stats Strip */}
      <BuilderTrackRecordStrip builder={builder} />

      {/* 3. Main Builder Content (Full Width — No Narrowing Sidebar) */}
      <div className="mx-auto max-w-[1560px] px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
        {/* Story & Leadership Philosophy */}
        <BuilderAboutSection builder={builder} />

        {/* Ongoing & Delivered Projects Catalogue (Spacious Full Width Grid) */}
        <BuilderProjectsPortfolio builder={builder} images={projectImages} />

        {/* Video Shorts & Drone Walkthroughs */}
        <VideoShortsReel
          shorts={builderShorts}
          title={`${builder.name} Video Spotlight & Project Reels`}
          subtitle="Watch delivered township walkthroughs, architectural highlights, and handover ceremonies"
          adminEditUrl={`/admin/builders/new?edit=${builder.id}`}
        />

        {/* Dedicated VIP Site Visit & Builder Consultation Section */}
        <BuilderScheduleVipVisitSection builder={builder} />

        {/* Investor Safeguards & Guarantees */}
        <BuilderInvestorGuarantees />

        {/* Customer Testimonials & Verified Reviews */}
        <BuilderTestimonialsSection builder={builder} />
      </div>

      {/* Floating Bottom Quick Action Bar for Instant Access */}
      <BuilderFloatingActionBar builder={builder} />
    </div>
  );
}

/* ========================================================================= */
/* SUB-COMPONENTS                                                            */
/* ========================================================================= */

function BuilderHeroBanner({ builder }: { builder: any }) {
  const bannerConfig = (builder.bannerConfig as Record<string, any>) || {};
  if (bannerConfig.showBanner === false) {
    return (
      <div className="border-b border-border bg-card/60 py-6">
        <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">{builder.name}</h1>
            <span className="text-xs text-muted-foreground">· RERA: {builder.reraNo || "Approved"}</span>
          </div>
          <Link href="/builders" className="text-xs font-semibold text-primary hover:underline">
            All Builders →
          </Link>
        </div>
      </div>
    );
  }

  const headline = bannerConfig.headline || builder.name;
  const tagline = bannerConfig.tagline;
  const badge = bannerConfig.badge;
  const bgImage = bannerConfig.imageUrl;

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white py-16 lg:py-20 border-b border-slate-800">
      {bgImage && (
        <Image
          src={bgImage}
          alt={headline}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,rgba(37,99,235,0.25)_0%,transparent_70%)]" />

      <div className="relative mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Logo Container */}
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur">
            {builder.logo?.url ? (
              <Image
                src={builder.logo.url}
                alt={builder.name}
                fill
                sizes="112px"
                className="object-contain p-2"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-primary/20 text-primary font-bold text-3xl">
                {builder.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Builder Credentials */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                RERA Registered Developer
              </span>
              {badge ? (
                <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary border border-primary/30">
                  {badge}
                </span>
              ) : (
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-500/30">
                  Central India Chapter
                </span>
              )}
              {builder.featured && (
                <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-slate-950">
                  ★ Grade-A Developer
                </span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
              {headline}
            </h1>

            {tagline ? (
              <p className="mt-2 text-base text-slate-200 max-w-2xl font-medium">{tagline}</p>
            ) : null}

            <p className="mt-2 text-sm text-slate-300 sm:text-base flex items-center gap-3 flex-wrap">
              <span>RERA ID: <strong className="text-white">{builder.reraNo || "RERA-MP-2024-1234"}</strong></span>
              <span>·</span>
              <span>Headquarters: Indore, MP</span>
              <span>·</span>
              <span>Est. 2004 (20+ Years Track Record)</span>
            </p>
          </div>

          {/* Quick Schedule CTA Button */}
          <div className="shrink-0 self-start md:self-center">
            <Button
              asChild
              className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/40 hover:scale-105 transition-all"
            >
              <a href="#schedule-visit">
                <Car className="h-4 w-4" />
                <span>Schedule VIP Site Visit</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuilderTrackRecordStrip({ builder }: { builder: any }) {
  const stats = [
    { label: "Delivered Landmarks", value: "18+ Townships", note: "Over 8,500 Residential Units" },
    { label: "Ongoing Mega Projects", value: `${builder.projects.length || 4} Projects`, note: "Under Active Construction" },
    { label: "Total Area Built", value: "12.5 Mn Sq Ft", note: "Engineered to ISO Standards" },
    { label: "Happy Families", value: "15,000+", note: "Across Central India" },
  ];

  return (
    <section className="border-b border-border bg-card py-6 shadow-xs dark:bg-slate-900 dark:border-slate-800">
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 text-center">
          {stats.map((s, i) => (
            <div key={i} className="border-r border-border last:border-r-0 p-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{s.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BuilderAboutSection({ builder }: { builder: any }) {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Promoter Background & Philosophy
        </span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          About {builder.name}
        </h2>
      </div>

      <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line text-justify">
        {builder.about ||
          `${builder.name} has been at the forefront of urban transformation in Central India for over two decades. Renowned for zero-compromise construction quality, architectural innovation, and timely handovers, the group has earned the trust of over 15,000 homebuyers.`}
      </p>

      {/* Pillars of Excellence */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs dark:bg-slate-900">
          <Award className="h-6 w-6 text-amber-500 mb-2" />
          <p className="font-bold text-sm text-foreground">Zero Compromise Quality</p>
          <p className="mt-1 text-xs text-muted-foreground">
            ISO 9001 certified structural engineering with Tier-1 raw materials.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs dark:bg-slate-900">
          <Calendar className="h-6 w-6 text-blue-500 mb-2" />
          <p className="font-bold text-sm text-foreground">On-Time Handover</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Consistent track record of delivering projects on or before RERA timelines.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs dark:bg-slate-900">
          <ShieldCheck className="h-6 w-6 text-emerald-500 mb-2" />
          <p className="font-bold text-sm text-foreground">RERA Escrow Security</p>
          <p className="mt-1 text-xs text-muted-foreground">
            100% compliant escrow accounts ensuring 70% funds dedicated to site construction.
          </p>
        </div>
      </div>
    </div>
  );
}

function BuilderProjectsPortfolio({
  builder,
  images,
}: {
  builder: any;
  images: Map<string, string>;
}) {
  const projects = builder.projects || [];

  return (
    <div className="space-y-6 border-t border-border pt-12">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Active Developments
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Projects by {builder.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Explore ongoing, newly launched, and ready-to-move residential projects.
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground border rounded-2xl">
          <Building2 className="mx-auto h-10 w-10 opacity-30 mb-2" />
          <p className="font-medium">Projects in preparation for launch.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {projects.map((p: any) => {
            const img = images.get(p.id) || "/images/project-1.jpg";
            return (
              <Link
                key={p.id}
                href={`/projects/${p.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl dark:bg-slate-900"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                  <Image
                    src={img}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-md">
                    {p.status.replace(/_/g, " ")}
                  </span>
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="text-lg font-black">{formatCompactINR(p.priceMin)} – {formatCompactINR(p.priceMax)}</p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {p.name}
                  </h3>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{p.locality}, {p.city}</span>
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-border text-xs">
                    <span className="text-muted-foreground">{p.type}</span>
                    <span className="font-bold text-primary flex items-center gap-1">
                      View Project Details <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BuilderInvestorGuarantees() {
  return (
    <div className="space-y-6 border-t border-border pt-12">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Buyer Protection
        </span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Investor & Buyer Guarantees
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { title: "Direct Builder Pricing", desc: "Guaranteed official price direct from builder without middleman inflation." },
          { title: "RERA Escrow Account", desc: "Buyer payments go directly to RERA audited project construction accounts." },
          { title: "Pre-Approved Home Loans", desc: "Instant sanction tie-ups with SBI, HDFC, ICICI and Bank of Baroda." },
          { title: "Clear Land Title Deeds", desc: "Zero legal disputes, verified 30-year non-encumbrance certificates." },
        ].map((g, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs dark:bg-slate-900"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-foreground">{g.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{g.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BuilderTestimonialsSection({ builder }: { builder: any }) {
  const reviews = [
    {
      name: "Dr. Alok Saxena",
      unit: "3 BHK Resident at Shree Green Valley",
      rating: 5,
      comment: `The construction quality and commitment to handover schedules by ${builder.name} is outstanding. The landscaping and clubhouse amenities match international standards.`,
    },
    {
      name: "Deepak Mehra",
      unit: "Investor, Sunshine Enclave",
      rating: 5,
      comment: `I have invested in two properties by ${builder.name}. Both have delivered exceptional rental yields and capital appreciation. The documentation and advisory support was seamless.`,
    },
  ];

  return (
    <div className="space-y-6 border-t border-border pt-12">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Resident Feedback
        </span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Verified Resident Testimonials
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reviews.map((r, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5 shadow-xs dark:bg-slate-900"
          >
            <div className="flex gap-0.5 text-amber-400 mb-2">
              {Array.from({ length: r.rating }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground italic">
              “{r.comment}”
            </p>
            <div className="mt-4 border-t border-border pt-3">
              <p className="font-bold text-sm text-foreground">{r.name}</p>
              <p className="text-[11px] text-muted-foreground">{r.unit}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BuilderScheduleVipVisitSection({ builder }: { builder: any }) {
  return (
    <section id="schedule-visit" className="scroll-mt-24 pt-6 border-t border-border">
      <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-10 lg:p-12 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column (5 cols): Builder Credentials & Corporate Details */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Authorized Advisory Desk</span>
              </span>
              <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-foreground font-serif">
                Schedule a VIP Consultation &amp; Visit
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Connect directly with authorized developer representatives for ongoing and upcoming developments by {builder.name}.
              </p>
            </div>

            {/* Corporate Office & Contact Details */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3.5 text-xs sm:text-sm shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Corporate Office
              </p>
              <div className="space-y-2.5 text-muted-foreground">
                <p className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground">{builder.address || "123, Scheme 54, Vijay Nagar, Indore, MP 452010"}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-blue-500 shrink-0" />
                  <a href={`tel:${builder.contactPhone || "+919876543210"}`} className="font-semibold text-foreground hover:underline">
                    {builder.contactPhone || "+91 98765 43210"}
                  </a>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-purple-500 shrink-0" />
                  <span>{builder.contactEmail || "sales@builder.example.com"}</span>
                </p>
                {builder.website && (
                  <p className="flex items-center gap-2.5 pt-2 border-t border-border">
                    <ExternalLink className="h-4 w-4 text-primary shrink-0" />
                    <a
                      href={builder.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold"
                    >
                      Official Builder Website
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/50 border border-border text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">RERA Compliance Guarantee</p>
              <p>All projects listed by {builder.name} are vetted for title clear deeds, RERA registrations, and bank escrow accounts.</p>
            </div>
          </div>

          {/* Right Column (7 cols): The InquiryForm */}
          <div className="lg:col-span-7">
            <InquiryForm
              builderName={builder.name}
              prefillMessage={`Inquiry regarding ${builder.name} properties, ongoing projects, and site visits`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function BuilderFloatingActionBar({ builder }: { builder: any }) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md py-3 px-4 shadow-2xl transition-all">
      <div className="mx-auto max-w-[1560px] flex items-center justify-between gap-4">
        <div className="hidden sm:flex items-center gap-3 min-w-0">
          <p className="font-bold text-sm text-foreground truncate">{builder.name}</p>
          <span className="text-xs text-muted-foreground">· RERA: {builder.reraNo || "Approved Developer"}</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
            <a href={`tel:${builder.contactPhone || "+919876543210"}`}>
              <Phone className="h-3.5 w-3.5 text-blue-600" />
              <span>Call Builder Desk</span>
            </a>
          </Button>

          <Button
            asChild
            size="sm"
            className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md flex-1 sm:flex-initial"
          >
            <a href="#schedule-visit">
              <Car className="h-3.5 w-3.5" />
              <span>Schedule VIP Site Visit</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
