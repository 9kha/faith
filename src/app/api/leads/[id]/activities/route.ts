import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

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
      select: { id: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const body = await req.json();
    const content = body.content ? String(body.content).trim() : "";
    const type = body.type ? String(body.type) : "NOTE";

    if (!content) {
      return NextResponse.json(
        { error: "Note content cannot be empty" },
        { status: 400 }
      );
    }

    const activity = await db.leadActivity.create({
      data: {
        leadId: id,
        userId,
        type,
        content,
      },
    });

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error("Lead activity error:", error);
    return NextResponse.json(
      { error: "Failed to add activity" },
      { status: 500 }
    );
  }
}
