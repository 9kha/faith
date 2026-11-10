import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import type { LeadStatus } from "@prisma/client";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _req: Request,
  ctx: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await ctx.params;

    const lead = await db.lead.findUnique({
      where: { id, deletedAt: null },
      include: {
        project: { select: { id: true, name: true, slug: true, city: true, locality: true } },
        property: { select: { id: true, title: true, slug: true, city: true, locality: true, price: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        client: { select: { id: true, name: true, phone: true, email: true, type: true } },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        siteVisits: {
          orderBy: { scheduledAt: "desc" },
          take: 5,
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Lead GET error:", error);
    return NextResponse.json(
      { error: "Failed to load lead" },
      { status: 500 }
    );
  }
}

const patchSchema = z.object({
  status: z
    .enum([
      "NEW",
      "CONTACTED",
      "SITE_VISIT_SCHEDULED",
      "SITE_VISIT_DONE",
      "NEGOTIATION",
      "BOOKED",
      "CLOSED_WON",
      "CLOSED_LOST",
    ])
    .optional(),
  assignedToId: z.string().nullable().optional(),
  nextFollowUpAt: z.string().datetime().nullable().optional(),
  lostReason: z.string().nullable().optional(),
  budget: z.number().nullable().optional(),
  message: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  ctx: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await ctx.params;

    const existing = await db.lead.findUnique({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status as LeadStatus;
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
    if (data.nextFollowUpAt !== undefined)
      updateData.nextFollowUpAt = data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null;
    if (data.lostReason !== undefined) updateData.lostReason = data.lostReason;
    if (data.budget !== undefined) updateData.budget = data.budget;
    if (data.message !== undefined) updateData.message = data.message;

    const lead = await db.lead.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { name: true, slug: true } },
        property: { select: { title: true, slug: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("Lead PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await ctx.params;

    const existing = await db.lead.findUnique({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    await db.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
