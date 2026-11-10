import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Prisma, MediaType } from "@prisma/client";

export const runtime = "nodejs";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get("search") || undefined;
    const type = searchParams.get("type") || undefined;
    const folderId = searchParams.get("folderId") || undefined;

    const limit = clampInt(searchParams.get("limit"), DEFAULT_LIMIT, 1, MAX_LIMIT);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

    const where: Prisma.MediaWhereInput = {
      deletedAt: null,
      ...(type ? { type: type as MediaType } : {}),
      ...(folderId ? { folderId } : {}),
      ...(keyword
        ? {
            OR: [
              { alt: { contains: keyword } },
              { caption: { contains: keyword } },
              { url: { contains: keyword } },
            ],
          }
        : {}),
    };

    const [media, total] = await Promise.all([
      db.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      db.media.count({ where }),
    ]);

    return NextResponse.json({
      media,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error("Media list error:", error);
    return NextResponse.json(
      { error: "Failed to load media" },
      { status: 500 }
    );
  }
}

function clampInt(raw: string | null, fallback: number, min: number, max: number) {
  const n = parseInt(raw || "", 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
