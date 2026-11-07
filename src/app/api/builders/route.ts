import { NextResponse } from "next/server";
import { getBuilders } from "@/modules/builder/service";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    const { builders, total } = await getBuilders({
      search,
      status,
      limit: 100,
    });

    return NextResponse.json({ builders, total });
  } catch {
    return NextResponse.json(
      { error: "Failed to load builders" },
      { status: 500 }
    );
  }
}
