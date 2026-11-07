import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || undefined;

    const units = await db.unit.findMany({
      where: {
        deletedAt: null,
        ...(projectId ? { projectId } : {}),
      },
      include: {
        tower: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ tower: { name: "asc" } }, { floor: "asc" }, { unitNo: "asc" }],
    });

    return NextResponse.json({ units });
  } catch {
    return NextResponse.json(
      { error: "Failed to load inventory" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { unitId, status } = body;

    const unit = await db.unit.update({
      where: { id: unitId },
      data: { status },
    });

    return NextResponse.json({ unit });
  } catch {
    return NextResponse.json(
      { error: "Failed to update unit" },
      { status: 500 }
    );
  }
}
