import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  MapPin,
  Building2,
  Home,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Phone,
  Sparkles,
  Calendar,
  Compass,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCityExplorerList, type CityExplorerItem } from "@/lib/settings";
import { getPrimaryImages } from "@/lib/media";
import { formatCompactINR } from "@/lib/format";
import { InquiryForm } from "@/components/public/inquiry-form";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cities = await getCityExplorerList();
  const city = cities.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
  const cityName = city?.name || slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: `Properties & Projects in ${cityName} | Faith Venture Realty`,
    description:
      city?.description ||
      `Find the best flats, luxury villas, and plots for sale in ${cityName}. RERA verified developers, direct pricing, and end-to-end guidance.`,
  };
}

export default async function CityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cities = await getCityExplorerList();
  const cityConfig = cities.find(
    (c) => c.slug.toLowerCase() === slug.toLowerCase()
  );

  const cityName =
    cityConfig?.name || slug.charAt(0).toUpperCase() + slug.slice(1);

  // Query projects and properties for this city
  const [projects, properties] = await Promise.all([
    db.project.findMany({
      where: {
        deletedAt: null,
        city: {
          contains: cityName,
        },
      },
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        builder: { select: { name: true, slug: true } },
      },
    }),
    db.property.findMany({
      where: {
        deletedAt: null,
        status: "AVAILABLE",
        city: {
          contains: cityName,
        },
      },
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        builder: { select: { name: true, slug: true } },
      },
    }),
  ]);

  // Extract unique localities
  const localities = Array.from(
    new Set([
      ...projects.map((p) => p.locality).filter(Boolean),
      ...properties.map((p) => p.locality).filter(Boolean),
    ])
  ) as string[];

  // Extract unique builders
  const builderMap = new Map<string, { name: string; slug: string }>();
  for (const p of projects) {
    if (p.builder) builderMap.set(p.builder.slug, p.builder);
  }
  for (const p of properties) {
    if (p.builder) builderMap.set(p.builder.slug, p.builder);
  }
  const builders = Array.from(builderMap.values());

  const [projectImages, propertyImages] = await Promise.all([
    getPrimaryImages(
      "Project",
      projects.map((p) => p.id)
    ),
    getPrimaryImages(
      "Property",
      properties.map((p) => p.id)
    ),
  ]);

  return (
    <div className="space-y-0 bg-background text-foreground transition-colors">
      {/* City Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-muted/20 py-16 lg:py-24">
        <div className="container-page relative z-10">
          <div className="mx-auto max-w-4xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <MapPin className="h-3.5 w-3.5" />
              <span>Real Estate City Guide</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
              Properties &amp; Projects in{" "}
              <span className="text-primary">{cityName}</span>
            </h1>

            {cityConfig?.tagline && (
              <p className="text-base font-semibold text-primary sm:text-lg">
                {cityConfig.tagline}
              </p>
            )}

            <p className="mx-auto max-w-2xl text-sm sm:text-base leading-relaxed text-muted-foreground">
              {cityConfig?.description ||
                `Explore handpicked residential townships, premium apartments, and investment plots across ${cityName} with RERA verified credentials.`}
            </p>

            {/* Stats badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-2xs">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Active Listings:</span>
                <span className="text-xs font-bold text-foreground">
                  {cityConfig?.count || `${projects.length + properties.length}+ Available`}
                </span>
              </div>

              {cityConfig?.avgPrice && (
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-2xs">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-muted-foreground">Avg. Price:</span>
                  <span className="text-xs font-bold text-foreground">{cityConfig.avgPrice}</span>
                </div>
              )}

              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-2xs">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">100% RERA Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Localities in this City */}
      {localities.length > 0 && (
        <section className="border-b border-border bg-card py-6">
          <div className="container-page">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2 flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-primary" /> Top Localities:
              </span>
              {localities.map((loc) => (
                <Link
                  key={loc}
                  href={`/buy?city=${encodeURIComponent(cityName)}&search=${encodeURIComponent(loc)}`}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary hover:bg-primary/5"
                >
                  {loc}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content: Projects, Properties & Inquiry */}
      <section className="py-16 lg:py-24">
        <div className="container-page space-y-16">
          {/* Featured Projects Grid */}
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  New Launches &amp; Townships
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Featured Projects in {cityName}
                </h2>
              </div>
              <Link
                href={`/projects?city=${encodeURIComponent(cityName)}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2 transition-all"
              >
                All {cityName} Projects <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
                <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  New projects in {cityName} are being verified
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Contact our advisory desk to get off-market pre-launch allocations.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.slug}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <Image
                        src={projectImages.get(p.id) || "/images/project-hero.jpg"}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-base font-bold text-white">
                          {p.priceMin ? formatCompactINR(p.priceMin) : "Price on Request"}
                          {p.priceMax ? ` – ${formatCompactINR(p.priceMax)}` : ""}
                        </p>
                        <p className="text-xs text-white/80 line-clamp-1">{p.locality}, {cityName}</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {p.name}
                      </h3>
                      {p.builder && (
                        <p className="text-xs text-muted-foreground">
                          By <span className="font-semibold text-foreground">{p.builder.name}</span>
                        </p>
                      )}
                      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary text-[10px]">
                          {p.type}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:gap-1.5 transition-all">
                          View Township <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Properties for Sale in this City */}
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Ready &amp; Resale Units
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Properties for Sale in {cityName}
                </h2>
              </div>
              <Link
                href={`/buy?city=${encodeURIComponent(cityName)}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2 transition-all"
              >
                All {cityName} Properties <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {properties.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
                <Home className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  No individual properties listed yet in {cityName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Check back soon or explore featured projects above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((p) => (
                  <Link
                    key={p.id}
                    href={`/properties/${p.slug}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <Image
                        src={propertyImages.get(p.id) || "/images/hero-home.jpg"}
                        alt={p.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 text-white">
                        <p className="text-lg font-bold text-white">
                          {p.price ? formatCompactINR(p.price) : "Price on Request"}
                        </p>
                        <p className="text-xs text-white/80">{p.locality}, {cityName}</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {p.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {p.bhk && <span>{p.bhk} BHK</span>}
                        {p.area && <span>{p.area} sq ft</span>}
                        <span className="capitalize">{p.category?.toLowerCase()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Active Builders in City Strip */}
          {builders.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-8 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-foreground">
                RERA-Registered Builders in {cityName}
              </h3>
              <div className="flex flex-wrap gap-3">
                {builders.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/builders/${b.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 shadow-2xs"
                  >
                    <Building2 className="h-4 w-4 text-primary" />
                    <span>{b.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* City Specific VIP Inquiry Form */}
          <div className="mx-auto max-w-2xl">
            <InquiryForm
              projectName={`Real Estate in ${cityName}`}
              prefillMessage={`I am interested in buying property in ${cityName}. Please share available options and floor plans.`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
