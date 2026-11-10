import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { setSetting } from "@/lib/settings";
import type { SettingGroup } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const settings = await db.setting.findMany({ orderBy: { key: "asc" } });
    // Group settings
    const grouped: Record<string, { key: string; value: unknown; group: string }[]> = {};
    for (const s of settings) {
      const g = s.group as string;
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push({ key: s.key, value: s.value, group: g });
    }
    return NextResponse.json({ settings, grouped });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json() as { key: string; value: unknown; group?: string }[];

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Body must be an array of { key, value } objects" }, { status: 400 });
    }

    const GROUP_MAP: Record<string, SettingGroup> = {
      brand: "BRANDING",
      header: "BRANDING",
      footer: "BRANDING",
      smtp: "SMTP",
      integrations: "INTEGRATIONS",
      social: "INTEGRATIONS",
      theme: "THEME",
      system: "SYSTEM",
      seo: "SYSTEM",
      contact: "SYSTEM",
      home: "SYSTEM",
    };

    for (const item of body) {
      if (!item.key) continue;
      const prefix = item.key.split(".")[0];
      const group = item.group || GROUP_MAP[prefix] || "SYSTEM";
      await setSetting(item.key, item.value as string, group);
    }

    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, saved: body.length });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
