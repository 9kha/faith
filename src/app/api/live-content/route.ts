import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export const runtime = "nodejs";

// Clean pathname helper
function sanitizePathname(pathname?: string | null): string {
  if (!pathname || pathname === "") return "/";
  let clean = pathname.trim().split("?")[0].split("#")[0];
  if (!clean.startsWith("/")) clean = "/" + clean;
  // normalize trailing slash except for root
  if (clean.length > 1 && clean.endsWith("/")) {
    clean = clean.slice(0, -1);
  }
  return clean;
}

/**
 * GET /api/live-content?pathname=/
 * Returns the live edited content overrides for the specified pathname (or all if not specified).
 */
export async function GET(req: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const pathname = searchParams.get("pathname");

    if (pathname) {
      const cleanPath = sanitizePathname(pathname);
      const setting = await db.setting.findUnique({
        where: { key: `live_content:${cleanPath}` },
      });

      if (!setting) {
        return NextResponse.json({ pathname: cleanPath, edits: {} });
      }

      const parsed =
        typeof setting.value === "string"
          ? JSON.parse(setting.value)
          : setting.value;

      return NextResponse.json({
        pathname: cleanPath,
        updatedAt: parsed?.updatedAt,
        edits: parsed?.edits || {},
      });
    }

    // Return all pages' live edits
    const settings = await db.setting.findMany({
      where: { key: { startsWith: "live_content:" } },
    });

    const pages: Record<string, unknown> = {};
    for (const s of settings) {
      const p = s.key.replace("live_content:", "");
      const parsed =
        typeof s.value === "string" ? JSON.parse(s.value) : s.value;
      pages[p] = parsed?.edits || {};
    }

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Live content GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch live content" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/live-content
 * Body: { pathname: string, edits: Record<string, LiveEditItem> }
 * Saves live edits permanently to database (db.setting) and revalidates page cache.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { pathname, edits } = body as {
      pathname?: string;
      edits?: Record<string, unknown>;
    };

    if (!pathname || typeof pathname !== "string") {
      return NextResponse.json(
        { error: "Invalid pathname provided" },
        { status: 400 }
      );
    }

    const cleanPath = sanitizePathname(pathname);
    const validEdits = edits && typeof edits === "object" ? edits : {};

    const payload = JSON.stringify({
      updatedAt: new Date().toISOString(),
      edits: validEdits,
    });

    await db.setting.upsert({
      where: { key: `live_content:${cleanPath}` },
      create: {
        key: `live_content:${cleanPath}`,
        value: payload,
        group: "SYSTEM",
      },
      update: {
        value: payload,
      },
    });

    // Purge server cache so next SSR returns fresh data
    try {
      revalidatePath(cleanPath);
      revalidatePath("/", "layout");
    } catch (e) {
      console.warn("Revalidation notice:", e);
    }

    return NextResponse.json({
      success: true,
      pathname: cleanPath,
      count: Object.keys(validEdits).length,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Live content POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save live edits" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/live-content?pathname=/
 * Resets live edits for a specified pathname.
 */
export async function DELETE(req: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const pathname = searchParams.get("pathname");

    if (!pathname) {
      return NextResponse.json(
        { error: "Missing pathname parameter" },
        { status: 400 }
      );
    }

    const cleanPath = sanitizePathname(pathname);

    try {
      await db.setting.delete({
        where: { key: `live_content:${cleanPath}` },
      });
    } catch {
      // Record might already not exist
    }

    try {
      revalidatePath(cleanPath);
      revalidatePath("/", "layout");
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, pathname: cleanPath });
  } catch (error) {
    console.error("Live content DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to reset live content" },
      { status: 500 }
    );
  }
}
