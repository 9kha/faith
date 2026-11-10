import { NextResponse } from "next/server";
import { getProperties } from "@/modules/property/service";

export const runtime = "nodejs";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const listingType = searchParams.get("listingType") || undefined;
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const city = searchParams.get("city") || undefined;
    const builderId = searchParams.get("builderId") || undefined;
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || undefined;

    const location = searchParams.get("location") || city || undefined;

    const limit = clampInt(searchParams.get("limit"), DEFAULT_LIMIT, 1, MAX_LIMIT);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

    const { properties, total } = await getProperties({
      search,
      location,
      listingType,
      status,
      category,
      city,
      builderId,
      featured: featured === null ? undefined : featured === "true",
      sort,
      limit,
      offset: (page - 1) * limit,
    });

    return NextResponse.json({
      properties,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error("Properties list error:", error);
    return NextResponse.json(
      { error: "Failed to load properties" },
      { status: 500 }
    );
  }
}

function clampInt(raw: string | null, fallback: number, min: number, max: number) {
  const n = parseInt(raw || "", 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
