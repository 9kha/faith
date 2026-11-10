import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import type { ClientType } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const client = await db.client.findFirst({
      where: { id, deletedAt: null },
      include: {
        bookings: {
          include: {
            project: { select: { id: true, name: true, slug: true, city: true } },
            property: { select: { id: true, title: true, slug: true, price: true } },
            unit: { select: { id: true, unitNo: true, tower: true } },
            payments: {
              select: { id: true, amount: true, paidAt: true, mode: true, reference: true },
            },
          },
          orderBy: { bookingDate: "desc" },
        },
        siteVisits: {
          take: 5,
          orderBy: { scheduledAt: "desc" },
          include: {
            project: { select: { id: true, name: true } },
            property: { select: { id: true, title: true } },
          },
        },
        leads: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            source: true,
            budget: true,
            message: true,
            createdAt: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error("Client fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}

const updateClientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().min(10, "Valid phone number required").optional(),
  email: z.string().email("Valid email required").optional().nullable(),
  type: z.enum(["BUYER", "TENANT", "OWNER"]).optional(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = updateClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const updated = await db.client.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.type !== undefined ? { type: data.type as ClientType } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
    });

    return NextResponse.json({ success: true, client: updated });
  } catch (error) {
    console.error("Client update error:", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    await db.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Client deleted successfully" });
  } catch (error) {
    console.error("Client delete error:", error);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}
