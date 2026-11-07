import { NextResponse } from "next/server";
import { getProperties } from "@/modules/property/service";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const listingType = searchParams.get("listingType") || undefined;
    const status = searchParams.get("status") || undefined;
    const builderId = searchParams.get("builderId") || undefined;

    const { properties, total } = await getProperties({
      search,
      listingType,
      status,
      builderId,
      limit: 100,
    });

    return NextResponse.json({ properties, total });
  } catch {
    return NextResponse.json(
      { error: "Failed to load properties" },
      { status: 500 }
    );
  }
}
