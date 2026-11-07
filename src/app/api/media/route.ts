import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const media = await db.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ media });
  } catch {
    return NextResponse.json({ error: "Failed to load media" }, { status: 500 });
  }
}
