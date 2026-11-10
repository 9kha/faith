import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  Eye,
  Home,
  Layers,
  MessageSquare,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  formatCompactINR,
  formatDate,
  formatNumber,
  humanize,
  timeAgo,
} from "@/lib/format";
import { getPrimaryImages } from "@/lib/media";

export const dynamic = "force-dynamic";

const LEAD_STATUS_STYLE: Record<string, string> = {
  NEW: "bg-sky-50 text-sky-700 ring-sky-600/20",
  CONTACTED: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  SITE_VISIT_SCHEDULED: "bg-violet-50 text-violet-700 ring-violet-600/20",
  SITE_VISIT_DONE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  NEGOTIATION: "bg-amber-50 text-amber-700 ring-amber-600/20",
  BOOKED: "bg-teal-50 text-teal-700 ring-teal-600/20",
  CLOSED_WON: "bg-green-50 text-green-700 ring-green-600/20",
  CLOSED_LOST: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export default async function DashboardPage() {
  // eslint-disable-next-line react-hooks/purity -- server component: evaluated per request
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalProperties,
    availableProperties,
    totalProjects,
    activeProjects,
    totalUnits,
    availableUnits,
    totalLeads,
    newLeads30d,
    leadsByStatus,
    siteVisitsScheduled,
    recentLeads,
    recentProperties,
    inventoryValue,
    builders,
    blogPosts,
    totalClients,
    newClients30d,
  ] = await Promise.all([
    db.property.count({ where: { deletedAt: null } }),
    db.property.count({ where: { deletedAt: null, status: "AVAILABLE" } }),
    db.project.count({ where: { deletedAt: null } }),
    db.project.count({
      where: { deletedAt: null, status: { in: ["NEW_LAUNCH", "UNDER_CONSTRUCTION"] } },
    }),
    db.unit.count({ where: { deletedAt: null } }),
    db.unit.count({ where: { deletedAt: null, status: "AVAILABLE" } }),
    db.lead.count({ where: { deletedAt: null } }),
    db.lead.count({ where: { deletedAt: null, createdAt: { gte: since30d } } }),
    db.lead.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
    db.siteVisit.count({
      where: { status: "SCHEDULED" },
    }),
    db.lead.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        phone: true,
        source: true,
        status: true,
        createdAt: true,
        budget: true,
        property: { select: { title: true } },
        project: { select: { name: true } },
      },
    }),
    db.property.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, price: true, rent: true, status: true, listingType: true, city: true, locality: true },
    }),
    db.unit.aggregate({
      where: { deletedAt: null, status: "AVAILABLE", price: { not: null } },
      _sum: { price: true },
    }),
    db.builder.count({ where: { deletedAt: null } }),
    db.blogPost.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    db.client.count({ where: { deletedAt: null } }),
    db.client.count({ where: { deletedAt: null, createdAt: { gte: since30d } } }),
  ]);

  const propertyImages = await getPrimaryImages(
    "Property",
    recentProperties.map((p) => p.id)
  );

  const statusCounts = new Map<string, number>(
    leadsByStatus.map((r) => [r.status as string, r._count])
  );
  const pipelineTotal = totalLeads || 1;

  const kpis = [
    {
      label: "Available properties",
      value: `${formatNumber(availableProperties)}`,
      sub: `${formatNumber(totalProperties)} total listings`,
      href: "/admin/properties",
      icon: Home,
      tone: "text-blue-600 bg-blue-50",
    },
    {
      label: "Active projects",
      value: `${formatNumber(activeProjects)}`,
      sub: `${formatNumber(totalProjects)} projects · ${formatNumber(builders)} builders`,
      href: "/admin/projects",
      icon: Building2,
      tone: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Leads (30 days)",
      value: formatNumber(newLeads30d),
      sub: `${formatNumber(totalLeads)} lifetime enquiries`,
      href: "/admin/leads",
      icon: UserPlus,
      tone: "text-violet-600 bg-violet-50",
    },
    {
      label: "Active clients",
      value: formatNumber(totalClients),
      sub: `${formatNumber(newClients30d)} registered this month`,
      href: "/admin/clients",
      icon: Users,
      tone: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Available units",
      value: formatNumber(availableUnits),
      sub: `Inventory ${formatCompactINR(inventoryValue._sum.price)}`,
      href: "/admin/inventory",
      icon: Layers,
      tone: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {formatDate(new Date())}
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Live inventory, pipeline and conversion snapshot
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/admin/properties/new">
              <Plus className="mr-1.5 h-4 w-4" /> New property
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/leads">
              <MessageSquare className="mr-1.5 h-4 w-4" /> Leads
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {k.label}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {k.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{k.sub}</p>
              </div>
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${k.tone}`}
              >
                <k.icon className="h-5 w-5" />
              </span>
            </div>
            <span className="mt-3 flex items-center text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Lead pipeline
            </CardTitle>
            <CardDescription>
              {formatNumber(totalLeads)} enquiries across all sources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.keys(LEAD_STATUS_STYLE).map((status) => {
              const count = statusCounts.get(status) ?? 0;
              const pct = Math.round((count / pipelineTotal) * 100);
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-sm text-muted-foreground">
                    {humanize(status)}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        status === "CLOSED_LOST"
                          ? "bg-rose-400"
                          : status === "CLOSED_WON"
                            ? "bg-emerald-500"
                            : "bg-primary"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm font-medium tabular-nums">
                    {count}
                  </span>
                </div>
              );
            })}
            <div className="flex flex-wrap gap-4 border-t pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4" />
                {siteVisitsScheduled} site visits scheduled
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" /> {formatNumber(blogPosts)} published
                articles
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest enquiries</CardTitle>
            <CardDescription>Most recent leads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leads yet.</p>
            ) : (
              recentLeads.map((l) => (
                <div
                  key={l.id}
                  className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {l.property?.title || l.project?.name || l.phone}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgo(l.createdAt)}
                    </p>
                  </div>
                  <Badge
                    className={`shrink-0 ring-1 ring-inset ${LEAD_STATUS_STYLE[l.status] || "bg-muted text-foreground ring-border"}`}
                  >
                    {humanize(l.status)}
                  </Badge>
                </div>
              ))
            )}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/admin/leads">
                All leads <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Newest listings</CardTitle>
              <CardDescription>Recently added properties</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/properties">
                Manage <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProperties.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No properties yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentProperties.map((p) => {
                    const img = propertyImages.get(p.id);
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Link
                            href={`/admin/properties/new?edit=${p.id}`}
                            className="flex items-center gap-3 hover:text-primary"
                          >
                            <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                              {img ? (
                                <Image
                                  src={img}
                                  alt={p.title}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              ) : null}
                            </span>
                            <span className="font-medium">{p.title}</span>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {p.listingType === "SALE"
                              ? "Sale"
                              : p.listingType === "RENT"
                                ? "Rent"
                                : "Lease"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {p.locality}, {p.city}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCompactINR(
                            p.listingType === "SALE" ? p.price : p.rent
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              p.status === "AVAILABLE"
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                                : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                            }
                          >
                            {humanize(p.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
