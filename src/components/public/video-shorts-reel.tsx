"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Video,
  Sparkles,
  Building2,
  ExternalLink,
} from "lucide-react";
import { processVideoUrl, type VideoPlatform, type VideoFormat } from "@/lib/video-utils";

export type VideoShort = {
  id: string;
  title: string;
  url: string;
  embedUrl?: string;
  platform?: VideoPlatform;
  format?: VideoFormat;
  thumbnail?: string;
  duration?: string;
  projectName?: string;
  projectSlug?: string;
  builderName?: string;
  builderSlug?: string;
  category?: string;
};

export const SAMPLE_SHORTS: VideoShort[] = [
  {
    id: "short-1",
    title: "Luxury 3 BHK Sample Flat Walkthrough",
    url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    platform: "youtube",
    format: "short",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    duration: "0:52",
    projectName: "Evara 27-Acre Luxury Township",
    projectSlug: "evara-27-acre-luxury-township",
    builderName: "Shree Group",
    category: "SAMPLE_FLAT",
  },
  {
    id: "short-2",
    title: "Drone Elevation & Skyline View at Dusk",
    url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    platform: "youtube",
    format: "short",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    duration: "0:45",
    projectName: "Sunshine Enclave",
    projectSlug: "evara-27-acre-luxury-township",
    builderName: "Sunshine Realty",
    category: "DRONE",
  },
  {
    id: "short-3",
    title: "Grand Clubhouse & Olympic Pool Amenities",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    platform: "youtube",
    format: "video",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    duration: "1:10",
    projectName: "Royal Palms Township",
    projectSlug: "evara-27-acre-luxury-township",
    builderName: "Royal Developers",
    category: "WALKTHROUGH",
  },
  {
    id: "short-4",
    title: "Fast-Track Construction Milestone Update",
    url: "https://www.facebook.com/reel/123456789",
    platform: "facebook",
    format: "short",
    thumbnail: "/images/property-2.jpg",
    duration: "0:38",
    projectName: "Evara 27-Acre Luxury Township",
    projectSlug: "evara-27-acre-luxury-township",
    builderName: "Shree Group",
    category: "PROMO",
  },
];

export function VideoShortsReel({
  shorts = SAMPLE_SHORTS,
  title = "Trending Property Shorts & Video Tours",
  subtitle = "Quick video tours, drone vistas, sample flats, and Facebook reels",
  adminEditUrl,
}: {
  shorts?: VideoShort[];
  title?: string;
  subtitle?: string;
  adminEditUrl?: string;
}) {
  const [activeVideo, setActiveVideo] = useState<VideoShort | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setIsAdmin(true);
      })
      .catch(() => {});
  }, []);

  const openVideo = (short: VideoShort, index: number) => {
    setActiveVideo(short);
    setActiveIndex(index);
  };

  const handlePrev = () => {
    const nextIdx = (activeIndex - 1 + shorts.length) % shorts.length;
    setActiveIndex(nextIdx);
    setActiveVideo(shorts[nextIdx]);
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % shorts.length;
    setActiveIndex(nextIdx);
    setActiveVideo(shorts[nextIdx]);
  };

  if (!shorts || shorts.length === 0) return null;

  const currentProcessed = activeVideo
    ? processVideoUrl(activeVideo.url, activeVideo.format, activeVideo.platform)
    : null;

  const isWideVideo = activeVideo?.format === "video";

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 bg-background text-foreground transition-colors border-y border-border">
      <div className="container-page">
        {/* Section Header */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-500 dark:text-rose-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real Estate Video Hub</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1 rounded-full bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20 px-2.5 py-1">
              YouTube
            </span>
            <span className="flex items-center gap-1 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2.5 py-1">
              Facebook
            </span>
            {isAdmin && adminEditUrl && (
              <Link
                href={adminEditUrl}
                className="flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary/30 px-3 py-1 hover:bg-primary hover:text-white transition-all font-medium"
                title="Manage Videos in Admin"
              >
                <Video className="h-3.5 w-3.5" />
                <span>+ Add / Edit Videos (Admin)</span>
              </Link>
            )}
          </div>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {shorts.map((short, idx) => {
            const proc = processVideoUrl(short.url, short.format, short.platform);
            const thumb = short.thumbnail || proc.defaultThumbnail;
            const isShort = proc.format === "short";

            return (
              <div
                key={short.id || idx}
                onClick={() => openVideo(short, idx)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-card border border-border shadow-md transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 ${
                  isShort ? "aspect-[9/15]" : "aspect-[9/13]"
                }`}
              >
                {/* Thumbnail Image */}
                <div className="relative h-full w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb}
                    alt={short.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                </div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-xs ${
                      proc.platform === "facebook"
                        ? "bg-blue-600"
                        : "bg-red-600"
                    }`}
                  >
                    {proc.platform === "facebook"
                      ? isShort
                        ? "FB Reel"
                        : "FB Video"
                      : isShort
                      ? "YT Short"
                      : "YT Video"}
                  </span>
                  {short.duration && (
                    <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-mono text-white backdrop-blur-xs">
                      {short.duration}
                    </span>
                  )}
                </div>

                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid size-12 place-items-center rounded-full bg-white/90 text-slate-950 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white">
                  {short.category && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                      {short.category.replace("_", " ")}
                    </span>
                  )}
                  <h3 className="line-clamp-2 text-xs font-bold leading-tight drop-shadow-xs group-hover:text-primary transition-colors">
                    {short.title}
                  </h3>
                  {short.projectName && (
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-300 truncate">
                      <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                      <span className="truncate">{short.projectName}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Modal Player */}
      {activeVideo && currentProcessed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div
            className={`relative w-full overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl transition-all ${
              isWideVideo ? "max-w-2xl" : "max-w-md"
            }`}
          >
            {/* Header / Close */}
            <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 text-white">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                      currentProcessed.platform === "facebook"
                        ? "bg-blue-600"
                        : "bg-red-600"
                    }`}
                  >
                    {currentProcessed.platform === "facebook"
                      ? isWideVideo
                        ? "Facebook Video"
                        : "Facebook Reel"
                      : isWideVideo
                      ? "YouTube Video"
                      : "YouTube Short"}
                  </span>
                  <p className="truncate text-xs font-semibold text-slate-400">
                    {activeVideo.projectName || "Property Walkthrough"}
                  </p>
                </div>
                <p className="truncate text-sm font-bold mt-0.5">{activeVideo.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Container (Responsive Aspect) */}
            <div
              className={`relative w-full bg-black ${
                isWideVideo ? "aspect-video" : "aspect-[9/15]"
              }`}
            >
              {currentProcessed.platform === "direct" ? (
                <video
                  src={activeVideo.url}
                  controls
                  autoPlay
                  className="h-full w-full object-cover"
                />
              ) : (
                <iframe
                  src={currentProcessed.embedUrl}
                  title={activeVideo.title}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}

              {/* Prev / Next buttons */}
              {shorts.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous video"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition-colors cursor-pointer shadow-md"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next video"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition-colors cursor-pointer shadow-md"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Footer details */}
            <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
              <span className="text-xs text-slate-400 truncate max-w-[180px]">
                {activeVideo.builderName || "Faith Venture Realty"}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(
                    `Hi, I watched the video for ${activeVideo.title} (${activeVideo.projectName || "Property"}). Please share pricing and brochure.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <span>Inquire on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
