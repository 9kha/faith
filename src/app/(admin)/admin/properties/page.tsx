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
import { Search, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const params = new URLSearchParams({
          search,
          listingType: listingTypeFilter,
          limit: "100",
        });
        const res = await fetch(`/api/properties?${params}`);
        const data = await res.json();
        if (mounted) {
          setProperties(data.properties || []);
          setTotal(data.total || 0);
        }
      } catch {
        if (mounted) {
          setProperties([]);
          setTotal(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [search, listingTypeFilter]);

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
        <Link href="/admin/admin/properties/new">
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
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={listingTypeFilter}
          onChange={(e) => setListingTypeFilter(e.target.value)}
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
                      <Link href={`/admin/admin/properties/${p.id}`} className="font-medium hover:underline">
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
                      <Link
                        href={`/admin/admin/properties/${p.id}/edit`}
                        className="text-sm text-primary hover:underline mr-2"
                      >
                        Edit
                      </Link>
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
    </div>
  );
}
