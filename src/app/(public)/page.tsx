import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Home as HomeIcon,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";
import {
  getSetting,
  getCityExplorerList,
  getHomeVideosList,
  getMarketPulseItems,
  getHomeStats,
  type CityExplorerItem,
  type MarketPulseItem,
  type HomeStatCard,
} from "@/lib/settings";
import { getPrimaryImages } from "@/lib/media";
import { formatCompactINR, formatDate, humanize } from "@/lib/format";
import { VideoShortsReel } from "@/components/public/video-shorts-reel";
import { HomeHeroSearch } from "@/components/public/home-hero-search";
import {
  HomeTownshipShowcase,
  type HomeShowcaseProject,
} from "@/components/public/home-township-showcase";
import type { TownshipCadFile } from "@/components/public/township-cad-3d-viewer";
import { FounderSpotlightSection } from "@/components/public/founder-spotlight";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Faith Venture Realty — RERA Verified Homes in Central India",
  description:
    "Buy, rent and invest in RERA-verified properties across Raipur, Naya Raipur, Indore and Central India. Transparent pricing, verified builders and end-to-end support from search to registry.",
};

async function getHomeData() {
  const [projects, properties, builders, testimonials, posts] =
    await Promise.all([
      db.project.findMany({
        where: { deletedAt: null, featured: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 3,
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          type: true,
          city: true,
          locality: true,
          priceMin: true,
          priceMax: true,
          areaMin: true,
          areaMax: true,
          reraNo: true,
          builder: { select: { name: true } },
        },
      }),
      db.property.findMany({
        where: { deletedAt: null, featured: true, status: "AVAILABLE" },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          title: true,
          slug: true,
          listingType: true,
          price: true,
          rent: true,
          bhk: true,
          area: true,
          city: true,
          locality: true,
        },
      }),
      db.builder.findMany({
        where: { deletedAt: null, status: "active", featured: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 6,
        select: { id: true, name: true, slug: true },
      }),
      db.testimonial.findMany({
        where: { featured: true, status: "active" },
        orderBy: { sortOrder: "asc" },
        take: 3,
        select: {
          id: true,
          name: true,
          role: true,
          content: true,
          rating: true,
        },
      }),
      db.blogPost.findMany({
        where: { deletedAt: null, status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          publishedAt: true,
          createdAt: true,
        },
      }),
    ]);

  const [projectImages, propertyImages, postImages] = await Promise.all([
    getPrimaryImages(
      "Project",
      projects.map((p) => p.id)
    ),
    getPrimaryImages(
      "Property",
      properties.map((p) => p.id)
    ),
    getPrimaryImages(
      "BlogPost",
      posts.map((p) => p.id)
    ),
  ]);

  return { projects, properties, builders, testimonials, posts, projectImages, propertyImages, postImages };
}

function parseSlugList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((v): v is string => typeof v === "string" && v.trim() !== "");
  }
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (v): v is string => typeof v === "string" && v.trim() !== ""
      );
    }
  } catch {
    // fall through to comma-separated fallback
  }
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

async function getShowcaseData(): Promise<{
  enabled: boolean;
  projects: HomeShowcaseProject[];
  heading: string | null;
  subheading: string | null;
}> {
  const [enabledRaw, slugsRaw, legacySlugRaw, headingRaw, subheadingRaw] =
    await Promise.all([
      getSetting<unknown>("home.masterTownship.enabled"),
      getSetting<unknown>("home.masterTownship.projectSlugs"),
      getSetting<unknown>("home.masterTownship.projectSlug"),
      getSetting<string>("home.masterTownship.heading"),
      getSetting<string>("home.masterTownship.subheading"),
    ]);

  const enabled =
    enabledRaw === null || enabledRaw === undefined
      ? true
      : String(enabledRaw).trim().toLowerCase() === "true" || enabledRaw === true;

  if (!enabled) {
    return {
      enabled: false,
      projects: [],
      heading: null,
      subheading: null,
    };
  }

  // New multi-select key first, then the legacy single-project key.
  let slugs = parseSlugList(slugsRaw);
  if (slugs.length === 0) slugs = parseSlugList(legacySlugRaw);
  slugs = Array.from(new Set(slugs));

  const select = {
    id: true,
    name: true,
    slug: true,
    type: true,
    city: true,
    towers: true,
    description: true,
    cadFiles: true,
  } as const;

  let projects: HomeShowcaseProject[] = [];

  if (slugs.length > 0) {
    const rows = (await db.project.findMany({
      where: { slug: { in: slugs }, deletedAt: null },
      select,
    })) as Array<
      Omit<HomeShowcaseProject, "cadFiles"> & { cadFiles: unknown }
    >;
    const bySlug = new Map(rows.map((r) => [r.slug, r]));
    // Preserve the admin's chosen order, skipping missing/unpublished rows.
    projects = slugs
      .map((slug) => bySlug.get(slug))
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .map((row) => ({
        ...row,
        cadFiles: Array.isArray(row.cadFiles)
          ? (row.cadFiles as TownshipCadFile[])
          : [],
      }));
  }

  if (projects.length === 0) {
    // Auto-pick: prefer a published project that actually has an uploaded
    // 3D model / CAD file so the home page never shows the template demo.
    const candidates = (await db.project.findMany({
      where: { deletedAt: null, publishedAt: { not: null } },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      take: 12,
      select,
    })) as Array<
      Omit<HomeShowcaseProject, "cadFiles"> & { cadFiles: unknown }
    >;

    const withFiles = candidates.find(
      (p) => Array.isArray(p.cadFiles) && (p.cadFiles as unknown[]).length > 0
    );
    const pick = withFiles ?? candidates[0];
    if (pick) {
      projects = [
        {
          ...pick,
          cadFiles: Array.isArray(pick.cadFiles)
            ? (pick.cadFiles as TownshipCadFile[])
            : [],
        },
      ];
    }
  }

  return {
    enabled,
    projects,
    heading:
      typeof headingRaw === "string" && headingRaw.trim()
        ? headingRaw.trim()
        : null,
    subheading:
      typeof subheadingRaw === "string" && subheadingRaw.trim()
        ? subheadingRaw.trim()
        : null,
  };
}

function formatProjectPrice(priceMin: number | null, priceMax: number | null) {
  if (priceMin && priceMax) {
    return `${formatCompactINR(priceMin)} – ${formatCompactINR(priceMax)}`;
  }
  return formatCompactINR(priceMin ?? priceMax);
}

export default async function HomePage() {
  const [homeData, showcase, cities, homeVideos, marketPulse, homeStats] = await Promise.all([
    getHomeData(),
    getShowcaseData(),
    getCityExplorerList(),
    getHomeVideosList(),
    getMarketPulseItems(),
    getHomeStats(),
  ]);
  const { projects, properties, builders, testimonials, posts, projectImages, propertyImages, postImages } =
    homeData;

  return (
    <div>
      <HeroSection />
      <MarketTickerSection items={marketPulse} />
      <StatsSection stats={homeStats} />
      {showcase.enabled && showcase.projects.length > 0 && (
        <HomeTownshipShowcase
          projects={showcase.projects}
          heading={showcase.heading}
          subheading={showcase.subheading}
        />
      )}
      <FeaturedProjectsSection projects={projects} images={projectImages} />
      <FeaturedPropertiesSection properties={properties} images={propertyImages} />
      <VideoShortsReel
        shorts={homeVideos}
        adminEditUrl="/admin/settings?tab=home-videos"
      />
      <WhyChooseUsSection />
      <FounderSpotlightSection />
      <BuildersStripSection builders={builders} />
      <CityExplorerSection cities={cities} />
      <TestimonialsSection testimonials={testimonials} />
      <LatestBlogSection posts={posts} images={postImages} />
      <CTASection />
    </div>
  );
}

function MarketTickerSection({ items }: { items?: MarketPulseItem[] }) {
  const tickerItems = items && items.length > 0 ? items : [
    { id: "1", text: "Evara 27-Acre Township: Phase 1 Pre-launch Priority Bookings Open", highlight: true },
    { id: "2", text: "Indore Super Corridor: +16.8% YoY Property Appreciation", highlight: false },
    { id: "3", text: "Odd-Even Cantilevered Sky Balcony Towers T1–T4 Verified by RERA", highlight: false },
    { id: "4", text: "Direct Builder Desk on All Partner Launches", highlight: true },
    { id: "5", text: "NRI Real Estate Wealth Desk: Dual-Currency Repatriation Support", highlight: false },
  ];

  return (
    <div className="bg-card border-y border-border py-3 overflow-hidden select-none transition-colors">
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8 flex items-center gap-6 overflow-hidden text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-primary shrink-0 z-10 bg-card pr-2">
          <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
          Market Pulse:
        </span>
        <div className="overflow-hidden flex-1 relative">
          <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                <span className={`font-medium ${item.highlight ? "text-primary font-semibold" : "text-foreground/80"}`}>
                  {item.text}
                </span>
                <span className="text-border">/</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background border-b border-border/60 pb-24 pt-24 lg:pb-32 lg:pt-36 transition-colors">
      {/* Subtle top ambient tint with no dark circles */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-25 dark:opacity-15"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, transparent 100%)",
        }}
      />

      {/* Clean grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-sm font-medium text-foreground backdrop-blur shadow-xs animate-float">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            RERA Registered · Verified Builders Only
          </span>

          <h1 className="mt-7 text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Find Your{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--primary), var(--accent, var(--primary)))",
              }}
            >
              Dream Home
            </span>{" "}
            in Central India
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Premium residential and commercial properties from trusted builders.
            Transparent pricing, zero hidden charges, and end-to-end support
            from search to registry.
          </p>

          {/* Modern Floating Glass Search Console */}
          <HomeHeroSearch />

          {/* Trust badges */}
          <div className="mx-auto mt-10 flex flex-wrap justify-center gap-3">
            {[
              { icon: ShieldCheck, label: "RERA Verified" },
              { icon: Building2, label: "500+ Projects" },
              { icon: CheckCircle2, label: "Direct Pricing" },
              { icon: TrendingUp, label: "10+ Years" },
            ].map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-foreground/80 backdrop-blur"
              >
                <badge.icon className="h-3.5 w-3.5 text-emerald-500" />
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const STAT_ICONS: Record<string, any> = {
  Users,
  Building2,
  MapPin,
  TrendingUp,
  Award: ShieldCheck,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
};

function StatsSection({ stats }: { stats?: HomeStatCard[] }) {
  const displayStats = stats && stats.length > 0 ? stats : [
    { id: "1", number: "1200+", label: "Happy Families", icon: "Users" },
    { id: "2", number: "50+", label: "Premium Projects", icon: "Building2" },
    { id: "3", number: "15+", label: "Cities Covered", icon: "MapPin" },
    { id: "4", number: "10+", label: "Years Experience", icon: "TrendingUp" },
  ];

  return (
    <section className="bg-muted/40 border-b border-border/60 py-14 transition-colors">
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {displayStats.map((stat) => {
            const Icon = (stat.icon && STAT_ICONS[stat.icon]) || Users;
            return (
              <div
                key={stat.id || stat.label}
                className="hover-lift rounded-2xl border border-border/60 bg-card/60 p-6 text-center backdrop-blur shadow-xs"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary animate-float">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold text-foreground sm:text-4xl">
                  {stat.number}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  title,
  subtitle,
  href,
  cta,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  cta?: string;
  dark?: boolean;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          {cta || "View all"} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

type HomeData = Awaited<ReturnType<typeof getHomeData>>;

function FeaturedProjectsSection({
  projects,
  images,
}: {
  projects: HomeData["projects"];
  images: Map<string, string>;
}) {
  if (projects.length === 0) return null;

  return (
    <section className="bg-background py-16 lg:py-24 transition-colors">
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Featured Projects"
          subtitle="New launches and ready-to-move-in homes from verified builders"
          href="/projects"
          cta="View all projects"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const isNewLaunch =
              p.status === "NEW_LAUNCH" || p.status === "UNDER_CONSTRUCTION";
            return (
              <Link
                key={p.id}
                href={`/projects/${p.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-2xl"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={images.get(p.id) || "/images/project-1.jpg"}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Gradient overlay at bottom showing price */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pb-3 pt-10">
                    <div className="px-4">
                      <span className="text-lg font-bold text-white">
                        {formatProjectPrice(p.priceMin, p.priceMax)}
                      </span>
                      {p.areaMin && p.areaMax && (
                        <span className="ml-2 text-xs text-slate-300">
                          {p.areaMin}–{p.areaMax} sq ft
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Status badge */}
                  <span
                    className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white ${
                      isNewLaunch ? "bg-primary" : "bg-emerald-600"
                    }`}
                  >
                    {isNewLaunch ? "New Launch" : "Ready to Move"}
                  </span>
                </div>
                <div className="p-4">
                  {/* Builder badge + RERA badge */}
                  <div className="mb-2 flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground/80">
                      {p.builder.name}
                    </span>
                    {p.reraNo && (
                      <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        RERA ✓
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                    {p.name}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {p.locality}, {p.city}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturedPropertiesSection({
  properties,
  images,
}: {
  properties: HomeData["properties"];
  images: Map<string, string>;
}) {
  if (properties.length === 0) return null;

  return (
    <section className="bg-background py-16 lg:py-24 border-y border-border/60 transition-colors">
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Featured Properties"
          subtitle="Hand-picked listings ready for site visits"
          href="/buy"
          cta="View all properties"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {properties.map((p) => {
            const isRent = p.listingType !== "SALE";
            return (
              <Link
                key={p.id}
                href={`/properties/${p.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={images.get(p.id) || "/images/property-1.jpg"}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Listing type badge */}
                  <span
                    className={`absolute left-3 top-3 rounded-lg px-2.5 py-1 text-xs font-semibold text-white backdrop-blur ${
                      isRent ? "bg-amber-500/90" : "bg-primary/90"
                    }`}
                  >
                    {isRent ? "For Rent" : "For Sale"}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
                    {p.title}
                  </h3>
                  {/* BHK, area, floor info row */}
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    {p.bhk && (
                      <span className="flex items-center gap-1">
                        <HomeIcon className="h-3.5 w-3.5 text-primary" />
                        {p.bhk}
                      </span>
                    )}
                    {p.area && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        {p.area} sq ft
                      </span>
                    )}
                  </div>
                  {/* Location row */}
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-1">
                      {p.locality}, {p.city}
                    </span>
                  </p>
                  {/* Price */}
                  <div className="mt-3 border-t border-dashed border-border pt-3">
                    <span className="text-lg font-bold text-foreground">
                      {formatCompactINR(isRent ? p.rent : p.price)}
                      {isRent && (
                        <span className="text-xs font-medium text-muted-foreground">
                          /mo
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhyChooseUsSection() {
  const items = [
    {
      icon: ShieldCheck,
      title: "RERA Verified",
      stat: "100%",
      statLabel: "Verified listings",
      desc: "Every project and builder on this platform is RERA registered and independently checked.",
    },
    {
      icon: TrendingUp,
      title: "Best Prices",
      stat: "Direct",
      statLabel: "Builder pricing",
      desc: "Direct official builder pricing with no hidden charges and complete transaction transparency.",
    },
    {
      icon: MessageCircle,
      title: "End-to-End Support",
      stat: "10+",
      statLabel: "Years of expertise",
      desc: "From shortlisting and site visits to loan help and registry — one team, every step.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background py-16 lg:py-24 border-y border-border/60 transition-colors">
      <div
        className="pointer-events-none absolute inset-0 opacity-20 dark:opacity-15"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 100%, color-mix(in srgb, var(--primary) 25%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" /> Why us
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Why Choose Us?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Independent real estate advisory with deep market knowledge and builder
            relationships across Central India.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-6 w-6" />
              </div>
              <div className="mt-4 text-3xl font-bold text-foreground">
                {item.stat}
              </div>
              <div className="text-xs text-muted-foreground">{item.statLabel}</div>
              <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BuildersStripSection({ builders }: { builders: HomeData["builders"] }) {
  if (builders.length === 0) return null;

  return (
    <section className="bg-muted/30 py-16 lg:py-24 border-b border-border/60 transition-colors">
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Trusted Builders"
          subtitle="RERA-registered developers we work with directly"
          href="/builders"
          cta="All builders"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {builders.map((b) => (
            <Link
              key={b.id}
              href={`/builders/${b.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-4 py-6 text-center transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-foreground/80 shadow-xs transition-colors group-hover:bg-primary/10 group-hover:text-primary ring-1 ring-border">
                <Building2 className="h-7 w-7" />
              </span>
              <span className="line-clamp-2 text-sm font-medium text-foreground/90 group-hover:text-primary transition-colors">
                {b.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CityExplorerSection({ cities }: { cities: CityExplorerItem[] }) {
  const activeCities = (cities || []).filter((c) => c.enabled !== false);
  if (activeCities.length === 0) return null;

  return (
    <section className="bg-background py-16 lg:py-24 transition-colors">
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Explore Top Cities
          </h2>
          <p className="mt-3 text-muted-foreground">
            Find the perfect property in the most sought-after cities across
            Central India.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {activeCities.map((city) => (
            <Link
              key={city.slug}
              href={`/city/${city.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-foreground transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
            >
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 transition-transform group-hover:scale-150" />
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="text-xl font-bold text-foreground">{city.name}</div>
              {city.tagline && (
                <div className="text-xs text-primary font-medium line-clamp-1 mt-0.5">
                  {city.tagline}
                </div>
              )}
              <div className="mt-1 text-sm text-muted-foreground">{city.count}</div>
              <div className="mt-2 text-xs font-medium text-muted-foreground/80">
                Avg. {city.avgPrice}
              </div>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                Explore City <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({
  testimonials,
}: {
  testimonials: HomeData["testimonials"];
}) {
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-muted/30 py-16 lg:py-24 border-y border-border transition-colors">
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Star className="h-3.5 w-3.5" /> Testimonials
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What Our Clients Say
          </h2>
          <p className="mt-3 text-muted-foreground">
            Real feedback from buyers and investors we have worked with.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.id}
              className="relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              {/* Large quote mark */}
              <span className="absolute right-5 top-4 text-6xl font-serif leading-none text-muted-foreground/20 select-none">
                &ldquo;
              </span>
              <div className="flex gap-0.5 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= (t.rating ?? 5) ? "fill-amber-500 text-amber-500" : "text-muted"}`}
                  />
                ))}
              </div>
              <blockquote className="relative mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                {t.content}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                  {t.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">
                    {t.name}
                  </span>
                  {t.role && (
                    <span className="block text-xs text-muted-foreground">
                      {t.role}
                    </span>
                  )}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function LatestBlogSection({
  posts,
  images,
}: {
  posts: HomeData["posts"];
  images: Map<string, string>;
}) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-background py-16 lg:py-24 transition-colors">
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Latest from Our Blog"
          subtitle="Guides, market insights and RERA explainers"
          href="/blog"
          cta="Read all"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((b) => (
            <Link
              key={b.id}
              href={`/blog/${b.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={images.get(b.id) || "/images/blog-1.jpg"}
                  alt={b.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-5">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(b.publishedAt || b.createdAt)}
                </p>
                <h3 className="mt-2 line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-primary">
                  {b.title}
                </h3>
                {b.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {b.excerpt}
                  </p>
                )}
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                  Read more <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl p-8 shadow-2xl md:p-14 border border-white/10"
          style={{
            background:
              "radial-gradient(ellipse 120% 120% at 30% -10%, color-mix(in srgb, var(--primary) 32%, #0b0f19) 0%, #080c14 100%)",
            color: "#ffffff",
          }}
        >
          {/* Mesh overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[36rem] rounded-full blur-3xl opacity-25"
            style={{ background: "var(--primary)" }}
          />
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
              <Phone className="h-3.5 w-3.5 text-amber-400" /> Talk to an Expert
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white md:text-4xl">
              Looking for Your Dream Home?
            </h2>
            <p className="mt-3 text-white/85">
              Get personalized property recommendations and expert guidance from
              our verified advisory team — from search to final registry.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/buy"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-md transition hover:opacity-95"
                style={{ backgroundColor: "#ffffff", color: "#020617" }}
              >
                <HomeIcon className="h-4 w-4" style={{ color: "#020617" }} /> Find Properties
              </Link>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                <Phone className="h-4 w-4 text-white" /> +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
