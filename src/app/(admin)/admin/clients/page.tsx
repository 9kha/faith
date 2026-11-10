"use client";

import { useCallback, useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Search, Users, UserPlus, Plus, Phone, MessageCircle, Eye } from "lucide-react";
import Link from "next/link";

type ClientRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  type: string;
  address: string | null;
  notes: string | null;
  createdAt: string;
  _count?: {
    siteVisits: number;
    bookings: number;
  };
};

type Stats = {
  totalBuyers: number;
  totalTenants: number;
  totalOwners: number;
  newThisMonth: number;
};

const TYPE_STYLE: Record<string, string> = {
  BUYER: "bg-blue-50 text-blue-700 ring-blue-600/20",
  TENANT: "bg-amber-50 text-amber-700 ring-amber-600/20",
  OWNER: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

const PAGE_SIZE = 10;

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalBuyers: 0,
    totalTenants: 0,
    totalOwners: 0,
    newThisMonth: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (search) params.set("search", search);
      if (type) params.set("type", type);
      const res = await fetch(`/api/clients?${params}`);
      const data = await res.json();
      setClients(data.clients || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (data.stats) setStats(data.stats as Stats);
    } catch {
      setClients([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, search, type]);

  useEffect(() => {
    const t = setTimeout(() => void load(), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Management</h1>
          <p className="text-muted-foreground">
            Manage buyers, tenants and property owners
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="font-medium text-foreground">{total}</span> total clients
          </div>
          <Button asChild>
            <Link href="/admin/clients/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Client
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Clients</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{stats.totalBuyers + stats.totalTenants + stats.totalOwners}</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 shadow-sm transition-colors">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Buyers</p>
          <p className="mt-1.5 text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalBuyers}</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 shadow-sm transition-colors">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Tenants</p>
          <p className="mt-1.5 text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.totalTenants}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 shadow-sm transition-colors">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">This Month</p>
          <div className="flex items-baseline gap-2">
            <p className="mt-1.5 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.newThisMonth}</p>
            <span className="text-xs text-muted-foreground">new</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, phone, email…"
            className="pl-9"
          />
        </div>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All types</option>
          <option value="BUYER">Buyer</option>
          <option value="TENANT">Tenant</option>
          <option value="OWNER">Owner</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Clients
          </CardTitle>
          <CardDescription>
            {total} client{total === 1 ? "" : "s"} found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Client Type</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Loading clients…
                    </TableCell>
                  </TableRow>
                ) : clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users className="h-10 w-10 opacity-30" />
                        <p className="font-medium">No clients found</p>
                        <p className="text-sm">
                          {search || type
                            ? "Try adjusting your filters"
                            : "Add your first client to get started"}
                        </p>
                        {!search && !type && (
                          <Button asChild size="sm" className="mt-2">
                            <Link href="/admin/clients/new">
                              <Plus className="mr-1.5 h-4 w-4" />
                              Add Client
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((c) => {
                    const cleanPhone = c.phone.replace(/[^0-9]/g, "");
                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <Link
                            href={`/admin/clients/${c.id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                          >
                            <span>{c.name}</span>
                            {c._count && c._count.siteVisits > 0 && (
                              <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                {c._count.siteVisits} visit{c._count.siteVisits > 1 ? "s" : ""}
                              </span>
                            )}
                          </Link>
                          {c.notes && (
                            <p className="max-w-[220px] truncate text-xs text-muted-foreground">
                              {c.notes}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          <p>{c.phone}</p>
                          {c.email && (
                            <p className="text-xs text-muted-foreground">{c.email}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`ring-1 ring-inset ${TYPE_STYLE[c.type] || "bg-muted text-foreground ring-border"}`}
                          >
                            {c.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">
                          {c.address || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={`tel:${c.phone}`}
                              className="p-1.5 text-muted-foreground hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                              title={`Call ${c.phone}`}
                            >
                              <Phone className="h-4 w-4" />
                            </a>
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-muted-foreground hover:text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                            <Link
                              href={`/admin/clients/${c.id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline ml-1 px-2 py-1 rounded bg-primary/10"
                            >
                              <Eye className="h-3 w-3" />
                              Record
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            label="clients"
            onChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
