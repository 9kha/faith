import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import type { ClientType } from "@prisma/client";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(
  req: Request,
  ctx: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await ctx.params;
    const session = await getAuthSession();
    const userId = (session?.user as any)?.id || null;

    const lead = await db.lead.findUnique({
      where: { id, deletedAt: null },
      include: { client: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const clientType = (body.type || "BUYER") as ClientType;
    const address = body.address ? String(body.address) : null;
    const additionalNotes = body.notes ? String(body.notes) : "";
    const name = body.name ? String(body.name) : lead.name;
    const phone = body.phone ? String(body.phone) : lead.phone;
    const email = body.email !== undefined ? (body.email ? String(body.email) : null) : lead.email;

    // Check if lead already linked to a client
    let client = lead.client;

    if (!client) {
      // Check if client with this phone already exists
      const existingClient = await db.client.findFirst({
        where: { phone, deletedAt: null },
      });

      if (existingClient) {
        client = existingClient;
      } else {
        // Create new client
        const initialNotes = [
          `Converted from Lead (Source: ${lead.source})`,
          lead.message ? `Requirement: ${lead.message}` : null,
          additionalNotes ? `Notes: ${additionalNotes}` : null,
        ]
          .filter(Boolean)
          .join(" | ");

        client = await db.client.create({
          data: {
            name,
            phone,
            email,
            type: clientType,
            address,
            notes: initialNotes,
          },
        });
      }

      // Link lead to client
      await db.lead.update({
        where: { id: lead.id },
        data: {
          clientId: client.id,
          status: lead.status === "NEW" ? "CONTACTED" : lead.status,
        },
      });

      // Also link any existing site visits of this lead to the client
      await db.siteVisit.updateMany({
        where: { leadId: lead.id, clientId: null },
        data: { clientId: client.id },
      });

      // Record activity
      await db.leadActivity.create({
        data: {
          leadId: lead.id,
          userId,
          type: "CONVERTED_TO_CLIENT",
          content: `Converted to Client: ${client.name} (${client.type})`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      clientId: client.id,
      client,
    });
  } catch (error) {
    console.error("Lead conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert lead to client" },
      { status: 500 }
    );
  }
}
