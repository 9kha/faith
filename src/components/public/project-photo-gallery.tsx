"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ImageIcon,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProjectPhotoGalleryProps {
  gallery: string[];
  projectName: string;
}

export function ProjectPhotoGallery({
  gallery,
  projectName,
}: ProjectPhotoGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = gallery.length > 0 ? gallery : ["/images/project-1.jpg"];

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % images.length : 0
        );
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + images.length) % images.length : 0
        );
      }
    },
    [lightboxIndex, images.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <section id="project-photo-gallery" className="space-y-6 border-t border-border pt-12">
      {/* Section Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              High-Resolution Visuals
            </span>
            <Badge variant="outline" className="text-[10px] font-semibold bg-primary/10 text-primary border-primary/20">
              {images.length} {images.length === 1 ? "Photo" : "Photos"}
            </Badge>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {projectName} Photo Gallery &amp; Architectural Renders
          </h2>
        </div>
        <p className="text-xs text-muted-foreground sm:text-right">
          Click any photograph to view high-resolution full-screen render
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory("ALL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeCategory === "ALL"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          All Visuals ({images.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("ELEVATION")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeCategory === "ELEVATION"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Exterior Elevation &amp; Facade
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("INTERIORS")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeCategory === "INTERIORS"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Interiors &amp; Living Spaces
        </button>
      </div>

      {/* Gallery Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((src, idx) => {
          const isFeatured = idx === 0;
          return (
            <div
              key={idx}
              onClick={() => setLightboxIndex(idx)}
              className={`group relative rounded-2xl overflow-hidden border border-border bg-muted cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 ${
                isFeatured && images.length >= 3 ? "sm:col-span-2 sm:row-span-2 aspect-[16/11]" : "aspect-[16/10]"
              }`}
            >
              <Image
                src={src}
                alt={`${projectName} render #${idx + 1}`}
                fill
                sizes={isFeatured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white">
                <div className="flex justify-end">
                  <span className="p-2 rounded-xl bg-black/60 backdrop-blur text-white shadow-md">
                    <Maximize2 className="h-4 w-4" />
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-mono tracking-wider uppercase text-emerald-400 font-semibold block">
                    Render #{idx + 1}
                  </span>
                  <p className="text-sm font-bold text-white drop-shadow">
                    {idx === 0 ? "Master Elevation & Architecture" : `${projectName} Visual Showcase #${idx + 1}`}
                  </p>
                </div>
              </div>

              {/* Permanent photo index badge */}
              <div className="absolute bottom-2.5 left-2.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur text-[10px] font-mono text-white group-hover:opacity-0 transition-opacity">
                {idx + 1} / {images.length}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 text-white shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-serif font-bold text-base sm:text-lg text-white">
                {projectName}
              </span>
              <Badge className="bg-white/15 text-white border-none font-mono text-xs">
                {lightboxIndex + 1} of {images.length}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={images[lightboxIndex]}
                download
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Download High-Res Render"
              >
                <Download className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors"
                title="Close Lightbox (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Central Preview Area */}
          <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
            {/* Prev Button */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
                }}
                className="absolute left-4 sm:left-6 z-10 p-3 rounded-full bg-black/60 hover:bg-primary text-white backdrop-blur transition-all shadow-xl"
                title="Previous Photo (Left Arrow)"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Current Full Image */}
            <div className="relative max-w-6xl max-h-[75vh] w-full h-full flex items-center justify-center">
              <img
                src={images[lightboxIndex]}
                alt={`${projectName} render #${lightboxIndex + 1}`}
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Next Button */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex + 1) % images.length);
                }}
                className="absolute right-4 sm:right-6 z-10 p-3 rounded-full bg-black/60 hover:bg-primary text-white backdrop-blur transition-all shadow-xl"
                title="Next Photo (Right Arrow)"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {images.length > 1 && (
            <div className="p-4 border-t border-white/10 bg-black/50 shrink-0 flex items-center justify-center gap-2 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className={`relative h-14 w-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    i === lightboxIndex
                      ? "border-primary scale-105 shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * Top Hero Photos Grid with Quick Lightbox Trigger
 */
export function ProjectHeroPhotoGrid({
  gallery,
  projectName,
  heroImage,
}: {
  gallery: string[];
  projectName: string;
  heroImage: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const images = gallery.length > 0 ? gallery : [heroImage];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[420px] sm:h-[480px] lg:h-[560px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-950">
        {/* Main Large Hero Image */}
        <div
          onClick={() => setLightboxIndex(0)}
          className={`relative group cursor-pointer overflow-hidden ${
            images.length > 1 ? "md:col-span-3" : "md:col-span-4"
          } h-full`}
        >
          <Image
            src={heroImage}
            alt={projectName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 75vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/90 text-white text-xs font-bold mb-2 shadow-md">
              <Sparkles className="h-3 w-3" />
              Main Architecture Elevation
            </span>
            <p className="text-white text-sm font-medium opacity-80">
              Click to view high-resolution full-screen gallery
            </p>
          </div>
        </div>

        {/* Side Thumbnails Column */}
        {images.length > 1 && (
          <div className="hidden md:flex flex-col gap-2 h-full">
            {images.slice(1, 4).map((src, idx) => {
              const actualIdx = idx + 1;
              const isLast = idx === 2 || actualIdx === images.length - 1;
              const remainingCount = images.length - 4;

              return (
                <div
                  key={idx}
                  onClick={() => setLightboxIndex(actualIdx)}
                  className="relative flex-1 group cursor-pointer overflow-hidden bg-slate-900 rounded-xl"
                >
                  <Image
                    src={src}
                    alt={`${projectName} thumb ${actualIdx}`}
                    fill
                    sizes="25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-transparent transition-colors" />

                  {isLast && remainingCount > 0 && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center text-white text-sm font-bold">
                      +{remainingCount} More
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating "View All Photos" Button */}
      {images.length > 1 && (
        <div className="flex justify-end mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLightboxIndex(0)}
            className="rounded-xl border-border bg-background/80 backdrop-blur text-xs font-semibold gap-1.5 shadow-sm"
          >
            <ImageIcon className="h-3.5 w-3.5 text-primary" />
            <span>View All {images.length} Photos</span>
          </Button>
        </div>
      )}

      {/* Hero Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 text-white shrink-0">
            <span className="font-serif font-bold text-base sm:text-lg">
              {projectName} · Photo {lightboxIndex + 1} of {images.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8">
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)}
                className="absolute left-4 sm:left-6 z-10 p-3 rounded-full bg-black/60 hover:bg-primary text-white backdrop-blur shadow-xl"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            <img
              src={images[lightboxIndex]}
              alt={`${projectName} render`}
              className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex + 1) % images.length)}
                className="absolute right-4 sm:right-6 z-10 p-3 rounded-full bg-black/60 hover:bg-primary text-white backdrop-blur shadow-xl"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
