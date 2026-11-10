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

type BuilderRow = {
  id: string;
  name: string;
  slug: string;
  reraNo: string | null;
  contactName: string | null;
  contactPhone: string | null;
  logoId: string | null;
  logoUrl: string | null;
  _count?: { projects: number };
  status: string;
};

export default function BuildersPage() {
  const [builders, setBuilders] = useState<BuilderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadBuilders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        page: String(page),
        limit: "10",
      });
      const res = await fetch(`/api/builders?${params}`);
      const data = await res.json();
      setBuilders(data.builders || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setBuilders([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadBuilders();
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [loadBuilders, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this builder?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/builders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await loadBuilders();
    } catch {
      alert("Failed to delete builder");
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
          <h1 className="text-2xl font-bold">Builders</h1>
          <p className="text-muted-foreground">
            Manage builder profiles and their projects
          </p>
        </div>
        <Link href="/admin/builders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Builder
          </Button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search builders..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Builders</CardTitle>
          <CardDescription>{total} builder(s) found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>RERA No.</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {builders.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="w-10">
                      {b.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={b.logoUrl}
                          alt={b.name}
                          className="h-8 w-8 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/builders/new?edit=${b.id}`} className="font-medium hover:underline">
                        {b.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {b.slug}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {b.reraNo || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {b.contactName || "—"}
                      <br />
                      {b.contactPhone || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {b._count?.projects || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={b.status === "active" ? "default" : "secondary"}>
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/builders/new?edit=${b.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          Edit
                        </Link>
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          disabled={deletingId === b.id}
                          onClick={() => void handleDelete(b.id)}
                          aria-label="Delete builder"
                        >
                          {deletingId === b.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {builders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      No builders found
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
        label="builders"
        onChange={setPage}
      />
    </div>
  );
}
