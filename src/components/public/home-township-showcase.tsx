"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  TownshipCad3DViewer,
  type TownshipCadFile,
} from "@/components/public/township-cad-3d-viewer";

export type HomeShowcaseProject = {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string;
  towers: number | null;
  description: string | null;
  cadFiles: TownshipCadFile[];
};

function acreageLabel(project: HomeShowcaseProject): string {
  return project.type === "TOWNSHIP"
    ? "Integrated Master Township"
    : `${project.towers || 3} Towers · ${project.city}`;
}

export function HomeTownshipShowcase({
  projects,
  heading,
  subheading,
}: {
  projects: HomeShowcaseProject[];
  heading: string | null;
  subheading: string | null;
}) {
  const [activeSlug, setActiveSlug] = useState<string>(
    projects[0]?.slug ?? ""
  );
  const active = projects.find((p) => p.slug === activeSlug) ?? projects[0];

  if (!active) return null;

  const description =
    subheading ||
    active.description ||
    "Explore the development in interactive 3D and technical AutoCAD mode.";

  return (
    <section className="relative bg-background py-16 lg:py-24 overflow-hidden border-t border-b border-border transition-colors">
      <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Flagship Master Township Experience</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              {heading || active.name}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/projects/${active.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all"
            >
              <span>Explore Full Project Details</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {projects.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            {projects.map((project) => {
              const isActive = project.slug === active.slug;
              return (
                <button
                  key={project.slug}
                  type="button"
                  onClick={() => setActiveSlug(project.slug)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isActive ? "bg-primary" : "bg-muted-foreground/40"
                    }`}
                  />
                  {project.name}
                </button>
              );
            })}
          </div>
        )}

        <TownshipCad3DViewer
          key={active.slug}
          title={`${active.name} · 3D Model & AutoCAD`}
          projectName={active.name}
          totalAcreage={acreageLabel(active)}
          cadFiles={active.cadFiles}
        />
      </div>
    </section>
  );
}
