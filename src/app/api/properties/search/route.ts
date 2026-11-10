import { NextResponse } from "next/server";
import { getProperties } from "@/modules/property/service";

export const runtime = "nodejs";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 60;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const listingType = searchParams.get("listingType") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = clampInt(searchParams.get("limit"), DEFAULT_LIMIT, 1, MAX_LIMIT);

    const keyword = searchParams.get("keyword") || undefined;
    const location = searchParams.get("location") || searchParams.get("city") || undefined;
    const { properties, total } = await getProperties({
      search: keyword,
      location,
      listingType,
      city: searchParams.get("city") || undefined,
      locality: searchParams.get("locality") || undefined,
      bhk: searchParams.get("bhk") || undefined,
      category: searchParams.get("category") || undefined,
      status: searchParams.get("status") || undefined,
      builderId: searchParams.get("builder") || undefined,
      verified: searchParams.get("reraOnly") === "true" ? true : undefined,
      priceMin: intOrNull(searchParams.get("priceMin")),
      priceMax: intOrNull(searchParams.get("priceMax")),
      sort: searchParams.get("sort") || undefined,
      limit,
      offset: (page - 1) * limit,
    });

    return NextResponse.json({
      properties: properties.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        listingType: p.listingType,
        category: p.category,
        bhk: p.bhk,
        area: p.area,
        price: p.price,
        rent: p.rent,
        city: p.city,
        locality: p.locality,
        status: p.status,
        featured: p.featured,
        verified: p.verified,
        imageUrl: p.imageUrl ?? null,
        builder: p.builder ?? null,
        lat: p.lat,
        lng: p.lng,
      })),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search properties" },
      { status: 500 }
    );
  }
}

function clampInt(raw: string | null, fallback: number, min: number, max: number) {
  const n = parseInt(raw || "", 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function intOrNull(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? undefined : n;
}
