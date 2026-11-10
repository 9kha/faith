"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, MapPin, Search, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";

type ProjectCardData = {
  id: string;
  name: string;
  slug: string;
  city: string;
  locality: string;
  type: string;
  status: string;
  priceMin: number | null;
  priceMax: number | null;
  areaMin: number | null;
  areaMax: number | null;
  featured: boolean;
  imageUrl: string | null;
  reraNo: string | null;
  builder: { name: string; slug: string } | null;
  _count?: { units: number };
};

const PAGE_SIZE = 9;

const STATUS_STYLE: Record<string, string> = {
  NEW_LAUNCH: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/80 dark:text-emerald-300 dark:ring-emerald-500/30",
  UNDER_CONSTRUCTION: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/80 dark:text-amber-300 dark:ring-amber-500/30",
  READY_TO_MOVE: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950/80 dark:text-sky-300 dark:ring-sky-500/30",
  UPCOMING: "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-950/80 dark:text-violet-300 dark:ring-violet-500/30",
  SOLD_OUT: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/80 dark:text-rose-300 dark:ring-rose-500/30",
};

export default function ProjectsIndexPage() {
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (search) params.set("search", search);
      const res = await fetch(`/api/projects?${params}`);
      const data = await res.json();
      setProjects(data.projects || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setProjects([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(() => void load(), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  return (
    <div className="mx-auto max-w-[1720px] space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-12 text-white sm:px-10 lg:py-16">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5" /> New launches & ready homes
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Explore Our Projects
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            RERA-registered townships, apartments and villas across Indore and
            Bhopal — with transparent pricing and verified possession timelines.
          </p>
        </div>
      </header>

      <div className="relative max-w-xl">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by project, city or locality…"
          className="h-11 pl-10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border bg-white">
              <div className="h-44 rounded-t-2xl bg-muted" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
                <div className="h-3 w-1/3 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <Building2 className="mb-4 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No projects found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search term or clear the filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        label="projects"
        onChange={setPage}
      />
    </div>
  );
}

function formatPrice(v: number | null) {
  if (!v) return null;
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)} L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

function ProjectCard({ project }: { project: ProjectCardData }) {
  const price =
    formatPrice(project.priceMin) && formatPrice(project.priceMax)
      ? `${formatPrice(project.priceMin)} – ${formatPrice(project.priceMax)}`
      : formatPrice(project.priceMin) || formatPrice(project.priceMax);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          src={project.imageUrl || "/images/project-1.jpg"}
          alt={project.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <Badge
          className={`absolute left-3 top-3 ring-1 ring-inset ${STATUS_STYLE[project.status] || "bg-white/90 text-slate-700 dark:bg-slate-800 dark:text-slate-200 ring-slate-600/20"}`}
        >
          {project.status.replace(/_/g, " ")}
        </Badge>
        {project.featured && (
          <Badge className="absolute right-3 top-3 bg-amber-400 text-amber-950 ring-1 ring-inset ring-amber-600/20">
            Featured
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-semibold leading-snug tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors">
          {project.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {project.builder?.name || "Builder"}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {project.locality}, {project.city}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-dashed border-border dark:border-slate-800 pt-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Price range
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-white">{price || "On request"}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Config
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {project.areaMin && project.areaMax
                ? `${project.areaMin}–${project.areaMax} sq ft`
                : "—"}
            </p>
          </div>
        </div>
        {project.reraNo && (
          <p className="mt-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            RERA {project.reraNo}
          </p>
        )}
      </div>
    </Link>
  );
}
