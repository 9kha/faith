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
import { Search, Plus, Trash2, Loader2 } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

type PropertyRow = {
  id: string;
  title: string;
  slug: string;
  listingType: string;
  category: string;
  status: string;
  city: string;
  price: number | null;
  rent: number | null;
  bhk: string | null;
  featured: boolean;
  builder?: { name: string } | null;
  project?: { name: string } | null;
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [listingTypeFilter, setListingTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        listingType: listingTypeFilter,
        page: String(page),
        limit: "10",
      });
      const res = await fetch(`/api/properties?${params}`);
      const data = await res.json();
      setProperties(data.properties || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setProperties([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [search, listingTypeFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProperties();
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [loadProperties, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await loadProperties();
    } catch {
      alert("Failed to delete property");
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
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-muted-foreground">
            Manage individual properties for sale and rent
          </p>
        </div>
        <Link href="/admin/properties/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <select
          value={listingTypeFilter}
          onChange={(e) => {
            setListingTypeFilter(e.target.value);
            setPage(1);
          }}
          className="border border-input bg-background px-3 py-2 rounded-md text-sm"
        >
          <option value="">All Types</option>
          <option value="SALE">Sale</option>
          <option value="RENT">Rent</option>
          <option value="LEASE">Lease</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
          <CardDescription>{total} property(ies) found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>BHK</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price / Rent</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/admin/properties/new?edit=${p.id}`} className="font-medium hover:underline">
                        {p.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.listingType}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.category}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.bhk || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.city}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.listingType === "RENT"
                        ? `₹${(p.rent || 0) / 100000}/mo`
                        : `₹${(p.price || 0) / 10000000}Cr`}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default">{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/properties/new?edit=${p.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          Edit
                        </Link>
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          disabled={deletingId === p.id}
                          onClick={() => void handleDelete(p.id)}
                          aria-label="Delete property"
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
                {properties.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      No properties found
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
        label="properties"
        onChange={setPage}
      />
    </div>
  );
}
