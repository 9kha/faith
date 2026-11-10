"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Building2, Trash2, Loader2 } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

type ProjectRow = {
  id: string;
  name: string;
  slug: string;
  reraNo: string | null;
  status: string;
  type: string;
  city: string;
  priceMin: number | null;
  priceMax: number | null;
  featured: boolean;
  builder?: { name: string } | null;
  _count?: { units: number };
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [builderFilter, setBuilderFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        builderId: builderFilter,
        page: String(page),
        limit: "10",
      });
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
  }, [search, statusFilter, builderFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProjects();
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [loadProjects, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await loadProjects();
    } catch {
      alert("Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage real estate projects and their inventory
          </p>
        </div>
        <Link href="/admin/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border border-input bg-background px-3 py-2 rounded-md text-sm"
        >
          <option value="">All Status</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="NEW_LAUNCH">New Launch</option>
          <option value="UNDER_CONSTRUCTION">Under Construction</option>
          <option value="READY_TO_MOVE">Ready to Move</option>
          <option value="SOLD_OUT">Sold Out</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>{total} project(s) found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Builder</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>RERA No.</TableHead>
                  <TableHead>Price Range</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/admin/projects/new?edit=${p.id}`} className="font-medium hover:underline">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.builder?.name || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.type}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.city}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.reraNo || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.priceMin && p.priceMax
                        ? `₹${(p.priceMin / 10000000).toFixed(1)}Cr - ₹${(p.priceMax / 10000000).toFixed(1)}Cr`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default">
                        {p.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/projects/new?edit=${p.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          Edit
                        </Link>
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          disabled={deletingId === p.id}
                          onClick={() => void handleDelete(p.id)}
                          aria-label="Delete project"
                        >
                          {deletingId === p.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {projects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      No projects found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
