"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  Globe,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";

type PageItem = {
  id: string;
  title: string;
  slug: string;
  template: string;
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

export default function AdminPagesListPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [publishedCount, setPublishedCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);

  const loadPages = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/pages?${params.toString()}`);
      const data = await res.json();
      setPages(data.pages || []);
      setPublishedCount(data.publishedCount || 0);
      setDraftCount(data.draftCount || 0);
    } catch (err) {
      console.error("Failed to load pages", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the page "${title}"?`)) return;
    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPages((prev) => prev.filter((p) => p.id !== id));
        loadPages();
      }
    } catch (err) {
      console.error("Failed to delete page", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Custom Pages & URL Builder
            </h1>
            <Badge variant="outline" className="text-xs">
              No Developer Needed
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, launch, and manage custom marketing landing pages, investor charters, and policies with custom URLs.
          </p>
        </div>

        <Button asChild className="gap-1.5 shadow">
          <Link href="/admin/pages/new">
            <Plus className="h-4 w-4" />
            <span>Create Custom Page</span>
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Custom Pages
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-foreground">{pages.length}</p>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Live & Published
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-emerald-700 dark:text-emerald-400">
            {publishedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Drafts
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-amber-700 dark:text-amber-400">
            {draftCount}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pages by title or URL slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-border dark:border-slate-800 bg-muted/30 p-1">
          {["ALL", "PUBLISHED", "DRAFT"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === st
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {st === "ALL" ? "All Pages" : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Pages Table */}
      <div className="overflow-hidden rounded-2xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border dark:border-slate-800 bg-muted/40 dark:bg-slate-800/40 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Page Title</th>
                <th className="px-5 py-3.5">Public URL</th>
                <th className="px-5 py-3.5">Template</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Updated</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    Loading pages...
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                    <h3 className="text-base font-bold text-foreground">No custom pages found</h3>
                    <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                      Create your first custom page to launch campaigns, investor charters, or special policy showcases without touching code.
                    </p>
                    <Button asChild size="sm" className="mt-4">
                      <Link href="/admin/pages/new">
                        <Plus className="mr-1.5 h-4 w-4" /> Create Custom Page
                      </Link>
                    </Button>
                  </td>
                </tr>
              ) : (
                pages.map((p) => {
                  const isPublished = p.status === "PUBLISHED";
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-muted/30 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-foreground">{p.title}</p>
                        {p.seoTitle && p.seoTitle !== p.title && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {p.seoTitle}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <a
                          href={`/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <span>/{p.slug}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="outline" className="text-xs font-normal">
                          {p.template}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            isPublished
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          {isPublished ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        {new Date(p.updatedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit Page">
                            <Link href={`/admin/pages/${p.id}`}>
                              <Edit2 className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="View Public Page"
                          >
                            <a href={`/${p.slug}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(p.id, p.title)}
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
