import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import type { Prisma, ClientType } from "@prisma/client";

export const runtime = "nodejs";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get("search") || undefined;
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;

    const limit = clampInt(searchParams.get("limit"), DEFAULT_LIMIT, 1, MAX_LIMIT);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

    const where: Prisma.ClientWhereInput = {
      deletedAt: null,
      ...(type ? { type: type as ClientType } : {}),
      ...(keyword
        ? {
            OR: [
              { name: { contains: keyword } },
              { phone: { contains: keyword } },
              { email: { contains: keyword } },
            ],
          }
        : {}),
    };

    const [clients, total] = await Promise.all([
      db.client.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
        include: {
          _count: {
            select: { siteVisits: true, bookings: true },
          },
        },
      }),
      db.client.count({ where }),
    ]);

    // Stats
    const [totalBuyers, totalTenants, totalOwners, newThisMonth] = await Promise.all([
      db.client.count({ where: { deletedAt: null, type: "BUYER" } }),
      db.client.count({ where: { deletedAt: null, type: "TENANT" } }),
      db.client.count({ where: { deletedAt: null, type: "OWNER" } }),
      db.client.count({
        where: {
          deletedAt: null,
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
    ]);

    return NextResponse.json({
      clients,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      stats: { totalBuyers, totalTenants, totalOwners, newThisMonth },
    });
  } catch (error) {
    console.error("Client list error:", error);
    return NextResponse.json({ error: "Failed to load clients" }, { status: 500 });
  }
}

function clampInt(raw: string | null, fallback: number, min: number, max: number) {
  const n = parseInt(raw || "", 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  type: z.enum(["BUYER", "TENANT", "OWNER"]).default("BUYER"),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const parsed = clientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const client = await db.client.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        type: data.type,
        address: data.address || null,
        notes: data.notes || null,
      },
    });

    return NextResponse.json(
      { success: true, clientId: client.id, message: "Client created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Client create error:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
