import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type {
  PropertyListingType,
  PropertyCategory,
  PropertyStatus,
} from "@prisma/client";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const listingType = searchParams.get("listingType") || "SALE";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    const city = searchParams.get("city") || undefined;
    const priceMin = searchParams.get("priceMin")
      ? parseInt(searchParams.get("priceMin")!, 10)
      : undefined;
    const priceMax = searchParams.get("priceMax")
      ? parseInt(searchParams.get("priceMax")!, 10)
      : undefined;
    const bhk = searchParams.get("bhk") || undefined;
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;
    const builder = searchParams.get("builder") || undefined;
    const reraOnly = searchParams.get("reraOnly") === "true";
    const keyword = searchParams.get("keyword") || undefined;

    const [properties, total] = await Promise.all([
      db.property.findMany({
        where: {
          deletedAt: null,
          listingType: listingType as PropertyListingType,
          ...(city ? { city } : {}),
          ...(priceMin !== undefined ? { price: { gte: priceMin } } : {}),
          ...(priceMax !== undefined ? { price: { lte: priceMax } } : {}),
          ...(bhk ? { bhk } : {}),
          ...(category ? { category: category as PropertyCategory } : {}),
          ...(status ? { status: status as PropertyStatus } : {}),
          ...(reraOnly ? { reraNo: { not: null } } : {}),
          ...(keyword
            ? {
                OR: [
                  { title: { contains: keyword } },
                  { city: { contains: keyword } },
                  { locality: { contains: keyword } },
                  { description: { contains: keyword } },
                ],
              }
            : {}),
        },
        include: {
          builder: { select: { name: true, slug: true } },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: limit,
        skip,
      }),
      db.property.count({
        where: {
          deletedAt: null,
          listingType: listingType as PropertyListingType,
          ...(city ? { city } : {}),
          ...(priceMin !== undefined ? { price: { gte: priceMin } } : {}),
          ...(priceMax !== undefined ? { price: { lte: priceMax } } : {}),
          ...(bhk ? { bhk } : {}),
          ...(category ? { category: category as PropertyCategory } : {}),
          ...(status ? { status: status as PropertyStatus } : {}),
          ...(builder ? { builder } : {}),
          ...(reraOnly ? { reraNo: { not: null } } : {}),
          ...(keyword
            ? {
                OR: [
                  { title: { contains: keyword } },
                  { city: { contains: keyword } },
                  { locality: { contains: keyword } },
                  { description: { contains: keyword } },
                ],
              }
            : {}),
        },
      }),
    ]);

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
        imageUrl: null, // Will be populated from media in future
        lat: p.lat,
        lng: p.lng,
      })),
      total,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search properties" },
      { status: 500 }
    );
  }
}
