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
import { Search, Plus, Building2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const params = new URLSearchParams({
          search,
          status: statusFilter,
          builderId: builderFilter,
          limit: "100",
        });
        const res = await fetch(`/api/projects?${params}`);
        const data = await res.json();
        if (mounted) {
          setProjects(data.projects || []);
          setTotal(data.total || 0);
        }
      } catch {
        if (mounted) {
          setProjects([]);
          setTotal(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [search, statusFilter, builderFilter]);

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
        <Link href="/admin/admin/projects/new">
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
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
                      <Link href={`/admin/admin/projects/${p.id}`} className="font-medium hover:underline">
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
                      <Link
                        href={`/admin/admin/projects/${p.id}/edit`}
                        className="text-sm text-primary hover:underline mr-2"
                      >
                        Edit
                      </Link>
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
    </div>
  );
}
