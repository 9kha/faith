"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Pagination } from "@/components/ui/pagination";
import {
  Search,
  Users,
  Phone,
  MessageCircle,
  Eye,
  Download,
  TrendingUp,
  CalendarCheck,
  Trophy,
  Inbox,
  UserPlus,
  UserCheck,
  Loader2,
} from "lucide-react";

type LeadRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string;
  status: string;
  message: string | null;
  budget: number | null;
  createdAt: string;
  project: { name: string } | null;
  property: { title: string } | null;
  assignedTo: { id: string; name: string; email: string } | null;
  clientId?: string | null;
  client?: { id: string; name: string } | null;
};

const STATUS_STYLE: Record<string, string> = {
  NEW: "bg-sky-50 text-sky-700 ring-sky-600/20",
  CONTACTED: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  SITE_VISIT_SCHEDULED: "bg-violet-50 text-violet-700 ring-violet-600/20",
  SITE_VISIT_DONE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  NEGOTIATION: "bg-amber-50 text-amber-700 ring-amber-600/20",
  BOOKED: "bg-teal-50 text-teal-700 ring-teal-600/20",
  CLOSED_WON: "bg-green-50 text-green-700 ring-green-600/20",
  CLOSED_LOST: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

const ALL_STATUSES = Object.keys(STATUS_STYLE);

const DATE_RANGES = [
  { label: "All time", value: "all" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 7 days", value: "7" },
];

const PAGE_SIZE = 10;

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <Card className="flex-1 min-w-[140px]">
      <CardContent className="pt-5 pb-4 px-5">
        <div className={`inline-flex rounded-lg p-2 mb-3 ${color}`}>
          {icon}
        </div>
        <p className="text-2xl font-bold leading-none mb-1">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function leadsToCSV(leads: LeadRow[]): string {
  const headers = [
    "Name",
    "Phone",
    "Email",
    "Source",
    "Status",
    "Budget (L)",
    "Interest",
    "Assigned To",
    "Date",
  ];
  const rows = leads.map((l) => [
    `"${l.name}"`,
    l.phone,
    l.email ?? "",
    l.source,
    l.status,
    l.budget ? (l.budget / 100000).toFixed(1) : "",
    l.property?.title ?? l.project?.name ?? "",
    l.assignedTo?.name ?? "",
    new Date(l.createdAt).toLocaleDateString("en-IN"),
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Computed stats from loaded data (page-level). For full stats, a dedicated
  // /api/leads/stats endpoint would be ideal; here we derive from the total
  // counts returned when filters are cleared.
  const [stats, setStats] = useState({
    total: 0,
    newCount: 0,
    siteVisits: 0,
    closedWonMonth: 0,
  });

  const buildParams = useCallback(
    (overrides?: Record<string, string>) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (dateRange !== "all") params.set("days", dateRange);
      Object.entries(overrides ?? {}).forEach(([k, v]) => params.set(k, v));
      return params;
    },
    [page, search, status, dateRange]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads?${buildParams()}`);
      const data = await res.json() as {
        leads?: LeadRow[];
        total?: number;
        totalPages?: number;
      };
      setLeads(data.leads ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setLeads([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  // Load aggregate stats independently (no filters applied)
  const loadStats = useCallback(async () => {
    try {
      const [allRes, newRes, visitRes, wonRes] = await Promise.all([
        fetch("/api/leads?limit=1"),
        fetch("/api/leads?limit=1&status=NEW"),
        fetch("/api/leads?limit=1&status=SITE_VISIT_SCHEDULED"),
        fetch("/api/leads?limit=1&status=CLOSED_WON&days=30"),
      ]);
      const [all, newData, visit, won] = await Promise.all([
        allRes.json() as Promise<{ total?: number }>,
        newRes.json() as Promise<{ total?: number }>,
        visitRes.json() as Promise<{ total?: number }>,
        wonRes.json() as Promise<{ total?: number }>,
      ]);
      setStats({
        total: all.total ?? 0,
        newCount: newData.total ?? 0,
        siteVisits: visit.total ?? 0,
        closedWonMonth: won.total ?? 0,
      });
    } catch {
      // stats are non-critical; ignore errors
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    const t = setTimeout(() => void load(), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  async function handleStatusChange(leadId: string, newStatus: string) {
    setUpdatingId(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
        void loadStats();
      }
    } finally {
      setUpdatingId(null);
    }
  }

  const router = useRouter();
  const [convertingId, setConvertingId] = useState<string | null>(null);

  async function quickConvertToClient(lead: LeadRow) {
    if (!confirm(`Convert lead "${lead.name}" (${lead.phone}) to an official Client?`)) {
      return;
    }
    setConvertingId(lead.id);
    try {
      const res = await fetch(`/api/leads/${lead.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "BUYER",
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Conversion failed");
      void load();
      router.push(`/admin/clients/${data.clientId}`);
    } catch (e: any) {
      alert(e.message || "Failed to convert lead to client");
    } finally {
      setConvertingId(null);
    }
  }

  function handleExport() {
    if (leads.length === 0) return;
    const csv = leadsToCSV(leads);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Enquiries captured from the website, WhatsApp and campaigns
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted/60 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats cards */}
      <div className="flex flex-wrap gap-4">
        <StatCard
          icon={<Users className="h-4 w-4 text-blue-600" />}
          label="Total leads"
          value={stats.total}
          color="bg-blue-50"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4 text-sky-600" />}
          label="New enquiries"
          value={stats.newCount}
          color="bg-sky-50"
        />
        <StatCard
          icon={<CalendarCheck className="h-4 w-4 text-violet-600" />}
          label="Site visits scheduled"
          value={stats.siteVisits}
          color="bg-violet-50"
        />
        <StatCard
          icon={<Trophy className="h-4 w-4 text-green-600" />}
          label="Closed/Won this month"
          value={stats.closedWonMonth}
          color="bg-green-50"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
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
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select
          value={dateRange}
          onChange={(e) => {
            setDateRange(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {DATE_RANGES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Incoming enquiries</CardTitle>
          <CardDescription>
            {total} lead{total === 1 ? "" : "s"} found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-14 text-center text-muted-foreground"
                    >
                      Loading leads…
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-14 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Inbox className="h-10 w-10 opacity-30" />
                        <p className="text-sm font-medium">No leads found</p>
                        <p className="text-xs max-w-xs">
                          {search || status
                            ? "No leads match your current filters. Try adjusting the search or status."
                            : "Leads from your website, WhatsApp, and campaigns will appear here once captured."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/admin/leads/${l.id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors hover:underline"
                          >
                            {l.name}
                          </Link>
                          {(l.client || l.clientId) && (
                            <Link
                              href={`/admin/clients/${l.client?.id || l.clientId}`}
                              className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:underline"
                              title="Converted Client Profile"
                            >
                              <UserCheck className="h-2.5 w-2.5" />
                              <span>Client</span>
                            </Link>
                          )}
                        </div>
                        {l.message && (
                          <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {l.message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <p>{l.phone}</p>
                        {l.email && (
                          <p className="text-xs text-muted-foreground">
                            {l.email}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{l.source}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                        {l.property?.title ?? l.project?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {l.budget
                          ? `₹${(l.budget / 100000).toFixed(1)} L`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {l.assignedTo?.name ?? (
                          <span className="italic opacity-50">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <select
                          value={l.status}
                          disabled={updatingId === l.id}
                          onChange={(e) =>
                            void handleStatusChange(l.id, e.target.value)
                          }
                          className={`rounded-md border px-2 py-1 text-xs font-medium transition-opacity ring-1 ring-inset ${
                            STATUS_STYLE[l.status] ??
                            "bg-muted text-foreground ring-border"
                          } ${updatingId === l.id ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                        >
                          {ALL_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`tel:${l.phone}`}
                            title="Call"
                            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/${l.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="WhatsApp"
                            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                          {!(l.client || l.clientId) ? (
                            <button
                              type="button"
                              onClick={() => void quickConvertToClient(l)}
                              disabled={convertingId === l.id}
                              title="Convert to Client"
                              className="inline-flex items-center justify-center rounded-md p-1.5 text-primary hover:bg-primary/10 transition-colors"
                            >
                              {convertingId === l.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <UserPlus className="h-3.5 w-3.5" />
                              )}
                            </button>
                          ) : (
                            <Link
                              href={`/admin/clients/${l.client?.id || l.clientId}`}
                              title="View Client Profile"
                              className="inline-flex items-center justify-center rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/leads/${l.id}`}
                            title="View / Manage Lead"
                            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            label="leads"
            onChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
