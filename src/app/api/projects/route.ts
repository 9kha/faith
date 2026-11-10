import { NextResponse } from "next/server";
import { getProjects } from "@/modules/project/service";

export const runtime = "nodejs";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;
    const city = searchParams.get("city") || undefined;
    const builderId = searchParams.get("builderId") || undefined;
    const featured = searchParams.get("featured");

    const limit = clampInt(searchParams.get("limit"), DEFAULT_LIMIT, 1, MAX_LIMIT);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

    const { projects, total } = await getProjects({
      search,
      status,
      type,
      city,
      builderId,
      featured: featured === null ? undefined : featured === "true",
      limit,
      offset: (page - 1) * limit,
    });

    return NextResponse.json({
      projects,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error("Projects list error:", error);
    return NextResponse.json(
      { error: "Failed to load projects" },
      { status: 500 }
    );
  }
}

function clampInt(raw: string | null, fallback: number, min: number, max: number) {
  const n = parseInt(raw || "", 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
