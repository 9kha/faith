import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Recent Leads
    const recentLeads = await db.lead.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        phone: true,
        source: true,
        status: true,
        createdAt: true,
      },
    });

    // 2. Upcoming Site Visits
    const upcomingVisits = await db.siteVisit.findMany({
      where: {
        status: "SCHEDULED",
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: {
        client: { select: { id: true, name: true } },
        lead: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    // 3. Recent Clients
    const recentClients = await db.client.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
      },
    });

    // Count new unhandled leads + scheduled visits
    const newLeadsCount = await db.lead.count({
      where: { deletedAt: null, status: "NEW" },
    });
    const scheduledVisitsCount = await db.siteVisit.count({
      where: { status: "SCHEDULED" },
    });

    const items = [
      ...recentLeads.map((l) => ({
        id: `lead-${l.id}`,
        type: "lead" as const,
        title: `New Lead: ${l.name}`,
        subtitle: `Via ${l.source} • ${l.phone}`,
        time: l.createdAt,
        status: l.status,
        href: `/admin/leads/${l.id}`,
        isNew: l.status === "NEW",
      })),
      ...upcomingVisits.map((v) => ({
        id: `visit-${v.id}`,
        type: "site_visit" as const,
        title: `Site Visit: ${v.client?.name || v.lead?.name || "Client"}`,
        subtitle: v.project?.name ? `Project: ${v.project.name}` : "Property site visit scheduled",
        time: v.scheduledAt,
        status: v.status,
        href: v.client?.id ? `/admin/clients/${v.client.id}` : `/admin/leads`,
        isNew: true,
      })),
      ...recentClients.map((c) => ({
        id: `client-${c.id}`,
        type: "client" as const,
        title: `Client Profile: ${c.name}`,
        subtitle: `${c.type} profile active`,
        time: c.createdAt,
        status: "ACTIVE",
        href: `/admin/clients/${c.id}`,
        isNew: false,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({
      unreadCount: newLeadsCount + scheduledVisitsCount,
      items: items.slice(0, 8),
    });
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json({ unreadCount: 0, items: [] });
  }
}
