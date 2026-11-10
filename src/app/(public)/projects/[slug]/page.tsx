import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Home,
  Phone,
  MapPin,
  Calendar,
  MessageCircle,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Layers,
  TrendingUp,
  Compass,
  ArrowRight,
  Maximize2,
  Award,
  Video,
  FileText,
  Landmark,
  Car,
  Trees,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InquiryForm } from "@/components/public/inquiry-form";
import { VideoShortsReel, type VideoShort } from "@/components/public/video-shorts-reel";
import { TownshipCad3DViewer } from "@/components/public/township-cad-3d-viewer";
import { ProjectPhotoGallery } from "@/components/public/project-photo-gallery";
import { formatCompactINR } from "@/lib/format";
import { getEntityImages, getPrimaryImages } from "@/lib/media";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await db.project.findUnique({
    where: { slug, deletedAt: null },
    select: { name: true, city: true, locality: true, description: true },
  });

  if (!project) return { title: "Project Not Found" };

  return {
    title: `${project.name} in ${project.locality}, ${project.city} — Price, Floor Plans & Reviews`,
    description:
      project.description ||
      `Explore RERA verified ${project.name} in ${project.locality}, ${project.city}. View floor plans, pricing, ongoing construction updates and booking offers.`,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await db.project.findUnique({
    where: { slug, deletedAt: null },
    include: {
      builder: true,
      amenities: { include: { amenity: true } },
      units: {
        where: { deletedAt: null },
        take: 30,
        orderBy: [{ floor: "asc" }, { unitNo: "asc" }],
      },
      towersRel: true,
    },
  });

  if (!project) notFound();

  const mediableGallery = await getEntityImages("Project", project.id);
  const gallery: string[] =
    Array.isArray(project.images) && (project.images as string[]).length > 0
      ? (project.images as string[])
      : mediableGallery.length > 0
      ? mediableGallery
      : ["/images/project-1.jpg"];
  const heroImage = gallery[0] || "/images/project-1.jpg";

  // Calculate pricing & investment metrics
  const pricePerSqFt =
    project.priceMin && project.areaMin
      ? Math.round(project.priceMin / project.areaMin)
      : 5200;

  const localityAvgSqFt = pricePerSqFt > 5000 ? pricePerSqFt - 450 : 4800;
  const capitalAppreciation = "+14.8% p.a.";
  const rentalYield = "4.8% – 5.6%";

  // Project video shorts
  let projectShorts: VideoShort[] = [];
  if (project.videoUrls) {
    try {
      const parsed =
        typeof project.videoUrls === "string"
          ? JSON.parse(project.videoUrls)
          : project.videoUrls;
      if (Array.isArray(parsed) && parsed.length > 0) {
        projectShorts = parsed.map((v: any, i: number) => ({
          ...v,
          id: v.id || `p-short-${i}`,
          projectName: project.name,
          projectSlug: project.slug,
          builderName: project.builder.name,
        }));
      }
    } catch {
      // ignore
    }
  }

  if (projectShorts.length === 0) {
    projectShorts = [
      {
        id: `p-short-1`,
        title: `${project.name} Drone Elevation & Site Tour`,
        url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
        platform: "youtube",
        format: "short",
        thumbnail: heroImage,
        duration: "0:52",
        projectName: project.name,
        projectSlug: project.slug,
        builderName: project.builder.name,
        category: "DRONE",
      },
      {
        id: `p-short-2`,
        title: `3 BHK Luxury Model Flat Walkthrough`,
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        platform: "youtube",
        format: "video",
        thumbnail: gallery[1] || "/images/property-1.jpg",
        duration: "1:08",
        projectName: project.name,
        projectSlug: project.slug,
        builderName: project.builder.name,
        category: "SAMPLE_FLAT",
      },
      {
        id: `p-short-3`,
        title: `Construction Speed Milestone: Tower A Plastering`,
        url: "https://www.facebook.com/reel/123456789",
        platform: "facebook",
        format: "short",
        thumbnail: gallery[2] || "/images/property-2.jpg",
        duration: "0:42",
        projectName: project.name,
        projectSlug: project.slug,
        builderName: project.builder.name,
        category: "WALKTHROUGH",
      },
    ];
  }

  return (
    <div className="space-y-0 bg-background text-foreground">
      {/* 1. Hero & Gallery Banner */}
      <ProjectHeroHeader project={project} heroImage={heroImage} gallery={gallery} />

      {/* 2. Key Investment Metrics Bar */}
      <ProjectMetricsBar
        project={project}
        pricePerSqFt={pricePerSqFt}
        localityAvgSqFt={localityAvgSqFt}
        capitalAppreciation={capitalAppreciation}
        rentalYield={rentalYield}
      />

      {/* 3. Main Content Container (Full Width, Spacious, No Narrowing Sidebar) */}
      <div className="mx-auto max-w-[1560px] px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
        {/* Overview & Project Story */}
        <ProjectOverviewSection project={project} />

        {/* High-Resolution Photo Gallery & Architectural Renders */}
        <ProjectPhotoGallery gallery={gallery} projectName={project.name} />

        {/* Interactive 3D Model & AutoCAD Blueprint (Only displayed when real CAD / 3D files are uploaded for this project) */}
        {Array.isArray(project.cadFiles) && project.cadFiles.length > 0 && (
          <section id="township-3d-cad" className="space-y-6 border-t border-border pt-12">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Architectural Blueprint &amp; 3D Model
                </span>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {project.name} 3D Isometric &amp; AutoCAD Blueprint
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Ultra-lightweight · 0 Lag · Interactive building &amp; floor inspector
              </p>
            </div>

            {/* Uploaded CAD Files Assets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(project.cadFiles as any[]).map((f: any, i: number) => (
                <div
                  key={f.id || i}
                  className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card dark:bg-slate-900 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-mono text-xs font-bold shrink-0">
                      {f.fileName?.split(".").pop()?.toUpperCase() || "CAD"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{f.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.size ? `${(f.size / (1024 * 1024)).toFixed(2)} MB · ` : ""}
                        {f.type?.replace(/_/g, " ") || "Architectural Asset"}
                      </p>
                    </div>
                  </div>
                  <a
                    href={f.url}
                    target="_blank"
                    download
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white shrink-0 shadow-sm transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              ))}
            </div>

            {/* Full Interactive 3D Architectural View & 2D Technical Vector Blueprint Preview */}
            <TownshipCad3DViewer
              title={`${project.name} 3D Model & AutoCAD Blueprint`}
              projectName={project.name}
              totalAcreage={
                project.type === "TOWNSHIP"
                  ? "27 Acres Integrated Development"
                  : `${project.towers || 3} Towers · ${project.city || "Indore"}`
              }
              cadFiles={project.cadFiles as any[]}
              allowDemoFallback={false}
            />
          </section>
        )}

        {/* Layout Plan & Floor Plans */}
        <ProjectLayoutPlansSection project={project} />

        {/* On-Going Construction Progress & Milestones */}
        <ProjectConstructionMilestones project={project} />

        {/* House & Unit Inventory Table */}
        <ProjectUnitsInventorySection project={project} />

        {/* Infrastructure & Neighborhood Connectivity */}
        <ProjectInfrastructureSection project={project} />

        {/* Video Shorts & Drone Walkthrough */}
        <VideoShortsReel
          shorts={projectShorts}
          title={`${project.name} Shorts & Video Walkthrough`}
          subtitle="Watch drone footage, sample flat reveals, and ongoing construction clips"
          adminEditUrl={`/admin/projects/new?edit=${project.id}&tab=media#sec-media`}
        />

        {/* World-Class Amenities */}
        <ProjectAmenitiesSection project={project} />

        {/* Technical Specifications */}
        <ProjectSpecificationsSection project={project} />

        {/* Interactive EMI & Investment Calculator */}
        <ProjectEMICalculator priceMin={project.priceMin || 5000000} />

        {/* DEDICATED FULL-WIDTH VIP SITE VISIT CONVERSION SECTION */}
        <ProjectScheduleVipVisitSection project={project} />

        {/* Builder Profile Spotlight */}
        <ProjectBuilderSpotlight builder={project.builder} />

        {/* Frequently Asked Questions */}
        <ProjectFaqsSection project={project} />
      </div>

      {/* Floating Bottom Quick Action Bar for Instant Access */}
      <ProjectFloatingActionBar project={project} />
    </div>
  );
}

/* ========================================================================= */
/* SUB-COMPONENTS                                                            */
/* ========================================================================= */

function ProjectHeroHeader({
  project,
  heroImage,
  gallery,
}: {
  project: any;
  heroImage: string;
  gallery: string[];
}) {
  const bannerConfig = (project.bannerConfig as Record<string, any>) || {};
  if (bannerConfig.showBanner === false) {
    return (
      <div className="border-b border-border bg-card/60 py-6">
        <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Link href="/projects" className="hover:text-primary">Projects</Link>
              <span>/</span>
              <span>{project.city}</span>
              <span>/</span>
              <span className="text-foreground font-medium">{project.name}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {project.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
              {project.status.replace(/_/g, " ")}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
              RERA: {project.reraNo || "Approved"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const effectiveHeroImage = bannerConfig.imageUrl || heroImage;
  const headline = bannerConfig.headline || project.name;
  const tagline = bannerConfig.tagline;
  const customBadge = bannerConfig.badge;

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      {/* Background Hero Image with Dark Gradient */}
      <div className="relative h-[480px] w-full lg:h-[600px]">
        <Image
          src={effectiveHeroImage}
          alt={headline}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-14">
          <div className="mx-auto max-w-[1720px]">
            {/* Status & Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-md">
                {project.status.replace(/_/g, " ")}
              </span>
              <span className="rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                RERA: {project.reraNo || "RERA-MP-2024-5678"}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {project.type}
              </span>
              {customBadge ? (
                <span className="rounded-full bg-primary/80 px-3 py-1 text-xs font-bold text-white shadow-sm">
                  ★ {customBadge}
                </span>
              ) : project.featured ? (
                <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-slate-950">
                  ★ Featured Launch
                </span>
              ) : null}
            </div>

            {/* Title & Builder */}
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
              {headline}
            </h1>
            {tagline ? (
              <p className="mt-2 text-base text-slate-200 sm:text-lg max-w-3xl font-medium">
                {tagline}
              </p>
            ) : null}
            <p className="mt-2 text-base text-slate-300 sm:text-lg flex items-center gap-2 flex-wrap">
              <span>By</span>
              <Link
                href={`/builders/${project.builder.slug}`}
                className="font-semibold text-blue-400 hover:underline"
              >
                {project.builder.name}
              </Link>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                {project.locality}, {project.city}
              </span>
            </p>

            {/* Quick Pricing Headline & Gallery Link */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-baseline gap-4">
                <span className="text-2xl font-black text-white sm:text-4xl">
                  {project.priceMin && project.priceMax
                    ? `${formatCompactINR(project.priceMin)} – ${formatCompactINR(project.priceMax)}`
                    : project.priceMin
                    ? `From ${formatCompactINR(project.priceMin)}`
                    : "Price on Request"}
                </span>
                {project.areaMin && project.areaMax && (
                  <span className="text-sm font-medium text-slate-300">
                    ({project.areaMin} – {project.areaMax} sq ft carpet)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {gallery.length > 1 && (
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-3 overflow-hidden">
                      {gallery.slice(0, 3).map((img, i) => (
                        <div key={i} className="inline-block h-10 w-14 rounded-lg overflow-hidden ring-2 ring-slate-900 shadow-md">
                          <img src={img} alt="Thumb" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <a
                      href="#project-photo-gallery"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur text-xs font-bold text-white transition-all shadow-md"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>{gallery.length} Photos</span>
                    </a>
                  </div>
                )}

                <a
                  href="#schedule-visit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm shadow-lg shadow-primary/30 transition-all hover:scale-105"
                >
                  <Car className="h-4 w-4" />
                  <span>Schedule VIP Visit</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectMetricsBar({
  project,
  pricePerSqFt,
  localityAvgSqFt,
  capitalAppreciation,
  rentalYield,
}: {
  project: any;
  pricePerSqFt: number;
  localityAvgSqFt: number;
  capitalAppreciation: string;
  rentalYield: string;
}) {
  return (
    <section className="border-y border-border bg-card py-5 shadow-xs dark:bg-slate-900 dark:border-slate-800">
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 text-center">
          <div className="p-2 border-r border-border last:border-r-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Avg Rate
            </p>
            <p className="mt-1 text-base font-bold text-foreground sm:text-lg">
              ₹{pricePerSqFt.toLocaleString("en-IN")}/sq ft
            </p>
          </div>
          <div className="p-2 border-r border-border last:border-r-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Locality Benchmark
            </p>
            <p className="mt-1 text-base font-bold text-emerald-600 dark:text-emerald-400 sm:text-lg">
              ₹{localityAvgSqFt.toLocaleString("en-IN")}/sq ft
            </p>
          </div>
          <div className="p-2 border-r border-border last:border-r-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Est. Appreciation
            </p>
            <p className="mt-1 text-base font-bold text-blue-600 dark:text-blue-400 sm:text-lg">
              {capitalAppreciation}
            </p>
          </div>
          <div className="p-2 border-r border-border last:border-r-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Rental Yield
            </p>
            <p className="mt-1 text-base font-bold text-purple-600 dark:text-purple-400 sm:text-lg">
              {rentalYield}
            </p>
          </div>
          <div className="p-2 border-r border-border last:border-r-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Total Units
            </p>
            <p className="mt-1 text-base font-bold text-foreground sm:text-lg">
              {project.totalUnits || 240} Homes
            </p>
          </div>
          <div className="p-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Possession Date
            </p>
            <p className="mt-1 text-base font-bold text-foreground sm:text-lg">
              {project.possessionDate
                ? new Date(project.possessionDate).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })
                : "Dec 2027"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectOverviewSection({ project }: { project: any }) {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Project Narrative & Vision
        </span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          About {project.name}
        </h2>
      </div>

      <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line text-justify">
        {project.description ||
          `${project.name} represents the pinnacle of modern architecture and serene community living in ${project.locality}, ${project.city}. Designed with earthquake-resistant RCC structures, expansive green courtyards, and over 40+ lifestyle amenities, it offers an elevated sanctuary for families and a high-yield asset for real estate investors.`}
      </p>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          "100% RERA Registered & Approved by Town & Country Planning",
          "Direct Connectivity to Metro Corridor & Main Expressways",
          "70% Landscaped Open Spaces with Jogging & Cycling Tracks",
          "High-Speed Branded OTIS Elevators with Power Backup",
          "Bank Approvals from SBI, HDFC, ICICI, and Axis Bank",
          "Rainwater Harvesting, Solar Lighting & EV Charging Stations",
        ].map((hl, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3.5 text-xs font-semibold text-foreground dark:bg-slate-900"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>{hl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectLayoutPlansSection({ project }: { project: any }) {
  const layouts = [
    {
      config: "Master Township Layout",
      carpet: "Total 8.5 Acres",
      superArea: "70% Green Area",
      features: "4 Residential Towers, Grand Clubhouse, Central Garden, Amphitheatre",
      image: "/images/project-1.jpg",
    },
    {
      config: "2 BHK Luxury Suite",
      carpet: "850 sq ft",
      superArea: "1,120 sq ft",
      features: "2 Bedrooms, 2 Bathrooms, 2 Balconies, Vastu Compliant East Facing",
      image: "/images/property-1.jpg",
    },
    {
      config: "3 BHK Royal Residence",
      carpet: "1,280 sq ft",
      superArea: "1,650 sq ft",
      features: "3 Bedrooms, 3 Bathrooms, Utility Foyer, Extended Garden Balcony",
      image: "/images/property-2.jpg",
    },
    {
      config: "4 BHK Sky Villa Penthouse",
      carpet: "2,150 sq ft",
      superArea: "2,800 sq ft",
      features: "Private Terrace Deck, Double Height Living, 4 Baths, Maid Room",
      image: "/images/project-2.jpg",
    },
  ];

  return (
    <div className="space-y-6 border-t border-border pt-12">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Master Plan & Architecture
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Layout Plans & Floor Configurations
          </h2>
          <p className="text-sm text-muted-foreground">
            Thoughtfully planned floor layouts designed for maximum cross-ventilation and natural daylight.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {layouts.map((item, i) => (
          <div
            key={i}
            className="group overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all hover:border-primary/40 hover:shadow-lg dark:bg-slate-900"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
              <Image
                src={item.image}
                alt={item.config}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                {item.config}
              </span>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-foreground">
                <span>Carpet Area: {item.carpet}</span>
                <span className="text-muted-foreground">{item.superArea}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.features}
              </p>
              <div className="pt-2 flex justify-between items-center border-t border-border text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Available in Towers A, B & C
                </span>
                <a
                  href="#inquiry"
                  className="font-bold text-primary hover:underline flex items-center gap-1"
                >
                  Request Plan PDF <Download className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectConstructionMilestones({ project }: { project: any }) {
  const milestones = [
    { title: "Land Clearing & Excavation", progress: 100, date: "Completed Q1 2025", status: "DONE" },
    { title: "Foundation & Basement Raft", progress: 100, date: "Completed Q3 2025", status: "DONE" },
    { title: "Towers A & B RCC Superstructure", progress: 85, date: "In Progress (Floor 12/14)", status: "ACTIVE" },
    { title: "Brickwork, Plaster & Conduiting", progress: 60, date: "Ongoing on lower floors", status: "ACTIVE" },
    { title: "Finishing, Flooring & Elevators", progress: 25, date: "Commencing Q3 2026", status: "PLANNED" },
    { title: "Handover & Registry", progress: 0, date: "Scheduled Dec 2027", status: "PLANNED" },
  ];

  return (
    <div id="inventory-section" className="space-y-6 border-t border-border pt-12 scroll-mt-24">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Live Construction Status
        </span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          On-Going Project Milestones
        </h2>
        <p className="text-sm text-muted-foreground">
          Track real-time construction velocity, audited by RERA compliance engineers.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="space-y-6">
          {milestones.map((m, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm font-semibold text-foreground">
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      m.status === "DONE"
                        ? "bg-emerald-500"
                        : m.status === "ACTIVE"
                        ? "bg-primary animate-pulse"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                  {m.title}
                </span>
                <span className="text-muted-foreground text-xs">{m.date} ({m.progress}%)</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    m.status === "DONE"
                      ? "bg-emerald-500"
                      : m.status === "ACTIVE"
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                  style={{ width: `${m.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
          <span>Last structural inspection: November 2026</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            ✓ 0 Days Construction Delay Recorded
          </span>
        </div>
      </div>
    </div>
  );
}

function ProjectUnitsInventorySection({ project }: { project: any }) {
  const sampleUnits = [
    { tower: "Tower A", unitNo: "A-201", bhk: "2 BHK", floor: 2, facing: "East (Park View)", carpet: 850, price: 5400000, status: "AVAILABLE" },
    { tower: "Tower A", unitNo: "A-504", bhk: "2 BHK", floor: 5, facing: "North (Club View)", carpet: 875, price: 5650000, status: "AVAILABLE" },
    { tower: "Tower B", unitNo: "B-302", bhk: "3 BHK", floor: 3, facing: "East (Vastu)", carpet: 1250, price: 7800000, status: "AVAILABLE" },
    { tower: "Tower B", unitNo: "B-701", bhk: "3 BHK", floor: 7, facing: "North-East", carpet: 1300, price: 8150000, status: "AVAILABLE" },
    { tower: "Tower C", unitNo: "C-1102", bhk: "4 BHK Sky Villa", floor: 11, facing: "East (Skyline)", carpet: 2150, price: 14500000, status: "AVAILABLE" },
  ];

  const units = project.units && project.units.length > 0 ? project.units : sampleUnits;

  return (
    <div id="inventory-section" className="space-y-6 border-t border-border pt-12 scroll-mt-24">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          House & Unit Inventory
        </span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Available Homes & Floor Breakdown
        </h2>
        <p className="text-sm text-muted-foreground">
          Transparent pricing and unit specifications with zero hidden charges.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs dark:bg-slate-900 scrollbar-none">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 font-semibold text-foreground">
              <th className="px-3.5 py-3 whitespace-nowrap">Unit / Tower</th>
              <th className="px-3.5 py-3 whitespace-nowrap">Config</th>
              <th className="px-3.5 py-3 whitespace-nowrap">Floor</th>
              <th className="px-3.5 py-3 whitespace-nowrap">Facing</th>
              <th className="px-3.5 py-3 whitespace-nowrap">Carpet Area</th>
              <th className="px-3.5 py-3 whitespace-nowrap">All-Inclusive Price</th>
              <th className="px-3.5 py-3 text-right whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {units.slice(0, 8).map((u: any, idx: number) => (
              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                <td className="px-3.5 py-3 font-bold text-foreground whitespace-nowrap">
                  {u.unitNo || `Unit #${idx + 101}`} ({u.tower?.name || u.tower || "Tower A"})
                </td>
                <td className="px-3.5 py-3 font-medium text-foreground whitespace-nowrap">{u.bhk || "3 BHK"}</td>
                <td className="px-3.5 py-3 text-muted-foreground whitespace-nowrap">{u.floor ? `${u.floor}th Floor` : "Mid Floor"}</td>
                <td className="px-3.5 py-3 text-muted-foreground whitespace-nowrap">{u.facing || "East Facing"}</td>
                <td className="px-3.5 py-3 text-muted-foreground whitespace-nowrap">{u.area || u.carpet || 1150} sq ft</td>
                <td className="px-3.5 py-3 font-bold text-foreground whitespace-nowrap">
                  {formatCompactINR(u.price || 6500000)}
                </td>
                <td className="px-3.5 py-3 text-right whitespace-nowrap">
                  <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {u.status || "Available"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectInfrastructureSection({ project }: { project: any }) {
  const infraPoints = [
    { label: "Metro Corridor Station", dist: "1.2 km", time: "4 mins", note: "Direct connection to Airport & Railway Station" },
    { label: "AB Road & Super Corridor Junction", dist: "800 m", time: "2 mins", note: "Primary 6-lane arterial highway" },
    { label: "Medanta & Bombay Hospital", dist: "2.8 km", time: "8 mins", note: "Multi-specialty tertiary healthcare" },
    { label: "Delhi Public School & Prestige University", dist: "3.5 km", time: "9 mins", note: "Top ranked educational campus" },
    { label: "Crystal IT Park & TCS/Infosys Campus", dist: "5.2 km", time: "12 mins", note: "Over 50,000+ tech workforce hub" },
    { label: "Phoenix Citadel & C21 Mall", dist: "4.0 km", time: "10 mins", note: "Premier retail, dining & multiplexes" },
    { label: "Devi Ahilya Bai Holkar International Airport", dist: "14 km", time: "22 mins", note: "Direct domestic & Gulf flights" },
  ];

  return (
    <div id="inventory-section" className="space-y-6 border-t border-border pt-12 scroll-mt-24">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Location & Neighborhood
        </span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Infrastructure & City Connectivity
        </h2>
        <p className="text-sm text-muted-foreground">
          Strategically situated in {project.locality}, {project.city} with seamless reach to commercial and social infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {infraPoints.map((item, i) => (
          <div
            key={i}
            className="flex items-start justify-between rounded-2xl border border-border bg-card p-4 shadow-xs dark:bg-slate-900"
          >
            <div>
              <p className="font-bold text-sm text-foreground">{item.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.note}</p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <span className="rounded-lg bg-blue-500/10 px-2 py-1 text-xs font-bold text-primary">
                {item.time}
              </span>
              <p className="mt-1 text-[11px] text-muted-foreground">{item.dist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectAmenitiesSection({ project }: { project: any }) {
  const defaultAmenities = [
    { title: "Olympic-Sized Pool", desc: "Temperature controlled with kids splash deck", icon: "Pool" },
    { title: "25,000 Sq Ft Clubhouse", desc: "Multi-level leisure lounge & banquet hall", icon: "Club" },
    { title: "State-of-the-Art Gym", desc: "Equipped with cardio & strength trainers", icon: "Gym" },
    { title: "Badminton & Squash Courts", desc: "Indoor wooden synthetic flooring", icon: "Sports" },
    { title: "3-Tier Biometric Security", desc: "24x7 CCTV & boom barrier gate pass", icon: "Security" },
    { title: "100% DG Power Backup", desc: "Automatic generator coverage for all flats", icon: "Power" },
    { title: "Jogging & Reflexology Path", desc: "Surrounded by 1000+ aromatic trees", icon: "Nature" },
    { title: "EV Charging Infrastructure", desc: "Dedicated vehicle plug points in basement", icon: "EV" },
  ];

  return (
    <div id="inventory-section" className="space-y-6 border-t border-border pt-12 scroll-mt-24">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Lifestyle & Recreation
        </span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          World-Class Amenities
        </h2>
        <p className="text-sm text-muted-foreground">
          Over 40+ hand-picked lifestyle amenities designed for all age groups.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {defaultAmenities.map((a, i) => (
          <div
            key={i}
            className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-xs transition-all hover:border-primary/40 dark:bg-slate-900"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
              <Trees className="h-5 w-5" />
            </span>
            <p className="font-bold text-sm text-foreground">{a.title}</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectSpecificationsSection({ project }: { project: any }) {
  const specs = [
    { label: "Structural Framework", desc: "Earthquake resistant RCC shear wall structure designed to Zone 4 standards." },
    { label: "Living & Dining Flooring", desc: "Imported Italian marble or 1200x600mm high-gloss vitrified tiles." },
    { label: "Bedrooms & Foyer", desc: "Laminated wooden flooring in Master Bedroom, premium vitrified tiles in other rooms." },
    { label: "Kitchen & Utility", desc: "Granite platform with stainless steel double bowl sink, chimney exhaust provision." },
    { label: "Toilets & Bathrooms", desc: "European wall-hung WCs by Kohler/Grohe with thermostatic diverters." },
    { label: "Doors & Windows", desc: "Heavy-duty 3-track UPVC soundproof sliding windows with Saint-Gobain toughened glass." },
    { label: "Electrical & Smart Home", desc: "Concealed copper wiring with Schneider/Havells modular switches, video door intercom." },
    { label: "Painting & Wall Finish", desc: "Internal walls with premium acrylic emulsion; external texture paint with weather coat." },
  ];

  return (
    <div id="inventory-section" className="space-y-6 border-t border-border pt-12 scroll-mt-24">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Premium Engineering
        </span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Technical Specifications
        </h2>
      </div>

      <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-xs dark:bg-slate-900">
        {specs.map((s, i) => (
          <div key={i} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
            <span className="w-48 shrink-0 text-xs font-bold uppercase tracking-wide text-foreground">
              {s.label}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {s.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectEMICalculator({ priceMin }: { priceMin: number }) {
  return (
    <div id="inventory-section" className="space-y-6 border-t border-border pt-12 scroll-mt-24">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Financing Assistance
        </span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Home Loan & EMI Estimate
        </h2>
        <p className="text-sm text-muted-foreground">
          Indicative monthly EMI calculations for {formatCompactINR(priceMin)} home purchase.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-center">
          <div className="p-4 rounded-xl bg-muted/40">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Estimated Loan (80%)</p>
            <p className="mt-1 text-xl font-black text-foreground">
              {formatCompactINR(Math.round(priceMin * 0.8))}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Down Payment: {formatCompactINR(Math.round(priceMin * 0.2))}</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/10">
            <p className="text-xs text-primary uppercase font-semibold">Monthly EMI (20 Yrs @ 8.5%)</p>
            <p className="mt-1 text-xl font-black text-primary">
              ₹{Math.round((priceMin * 0.8 * 0.0867) / 12).toLocaleString("en-IN")}/mo
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Approx. ₹867 per Lakh</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Partner Bank Rates</p>
            <p className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400">
              8.35% – 8.75%
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">SBI, HDFC, ICICI, Axis</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectBuilderSpotlight({ builder }: { builder: any }) {
  return (
    <div className="space-y-6 border-t border-border pt-12">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Developer Credentials
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Developed by {builder.name}
          </h2>
        </div>
        <Link
          href={`/builders/${builder.slug}`}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          View Profile <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs dark:bg-slate-900">
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line text-justify">
          {builder.about ||
            `${builder.name} is one of Central India's premier real estate developers with a track record of delivering landmark townships and premium apartment complexes on schedule.`}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-border pt-4 text-center">
          <div>
            <p className="text-lg font-bold text-foreground">20+ Years</p>
            <p className="text-xs text-muted-foreground">Legacy</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">15+ Projects</p>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">100%</p>
            <p className="text-xs text-muted-foreground">RERA Compliant</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">12,000+</p>
            <p className="text-xs text-muted-foreground">Happy Families</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectFaqsSection({ project }: { project: any }) {
  const faqs = [
    {
      q: `Is ${project.name} RERA approved?`,
      a: `Yes, ${project.name} is fully RERA registered and compliant under RERA No: ${project.reraNo || "RERA-MP-2024-5678"}. All structural approvals, environmental clearances, and sanctioned layout plans have been verified.`,
    },
    {
      q: `What is the expected possession timeline?`,
      a: `The project is progressing ahead of schedule with handover expected by ${project.possessionDate ? new Date(project.possessionDate).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "December 2027"}.`,
    },
    {
      q: `What are the payment plans available?`,
      a: `We offer CLP (Construction Linked Plan), Subvention Schemes, and Special 10:90 Builder Payment Plans with zero pre-EMI till possession for eligible banking customers.`,
    },
    {
      q: `Can I schedule a private site visit?`,
      a: `Yes, our advisory team coordinates VIP site visits including guided site walkthroughs, model sample flat tours, and structural review with the project architect.`,
    },
  ];

  return (
    <div id="inventory-section" className="space-y-6 border-t border-border pt-12 scroll-mt-24">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Buyer Clarity
        </span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-4 shadow-xs dark:bg-slate-900"
          >
            <p className="font-bold text-sm text-foreground">{faq.q}</p>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectScheduleVipVisitSection({ project }: { project: any }) {
  return (
    <section id="schedule-visit" className="scroll-mt-24 pt-6 border-t border-border">
      <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-10 lg:p-12 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column (5 cols): VIP Privileges & Direct Support */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>VIP Site Experience</span>
              </span>
              <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-foreground font-serif">
                Schedule a VIP Site Visit
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Experience {project.name}&apos;s master architecture, model sample flat, and amenities in person.
                Our certified advisors will escort you with complete transparency.
              </p>
            </div>

            {/* VIP Perks */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0 mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Dedicated On-Site Relationship Manager</p>
                  <p className="text-muted-foreground text-xs">Private walkthrough of actual units, clubhouse amenities, and master plan review.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shrink-0 mt-0.5">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-foreground">100% Direct Official Builder Rate</p>
                  <p className="text-muted-foreground text-xs">No brokerage fees, no markup, guaranteed official developer terms.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 shrink-0 mt-0.5">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-foreground">RERA Title &amp; Sanction Dossier</p>
                  <p className="text-muted-foreground text-xs">Receive legal approvals, master layouts, and price sheet directly on WhatsApp.</p>
                </div>
              </div>
            </div>

            {/* Helpline */}
            <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">Direct Desk Helpline</p>
                <a href="tel:+919876543210" className="text-base font-bold text-primary hover:underline">
                  +91 98765 43210
                </a>
              </div>
              <span className="text-[11px] text-muted-foreground text-right">
                Mon – Sun 9 AM – 8 PM
              </span>
            </div>
          </div>

          {/* Right Column (7 cols): The High-Converting InquiryForm */}
          <div className="lg:col-span-7">
            <InquiryForm
              projectId={project.id}
              projectName={project.name}
              builderName={project.builder.name}
              prefillMessage={`VIP site visit inquiry for ${project.name} (${project.locality}, ${project.city})`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectFloatingActionBar({ project }: { project: any }) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md py-3 px-4 shadow-2xl transition-all">
      <div className="mx-auto max-w-[1560px] flex items-center justify-between gap-4">
        {/* Left: Project quick identity */}
        <div className="hidden sm:flex items-center gap-3 min-w-0">
          <div>
            <p className="font-bold text-sm text-foreground truncate">{project.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {project.locality}, {project.city} ·{" "}
              <strong className="text-foreground">
                {project.priceMin ? `From ${formatCompactINR(project.priceMin)}` : "Price on Request"}
              </strong>
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
            <a href="tel:+919876543210">
              <Phone className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden md:inline">Call Helpline</span>
              <span className="md:hidden">Call</span>
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
