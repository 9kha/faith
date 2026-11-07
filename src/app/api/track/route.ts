import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const {
      sessionId,
      path,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      device,
      country,
    } = body;

    if (!sessionId || !path) {
      return NextResponse.json(
        { error: "sessionId and path are required" },
        { status: 400 }
      );
    }

    await db.visit.create({
      data: {
        sessionId,
        path,
        referrer: referrer || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        device: device || null,
        country: country || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track visit" },
      { status: 500 }
    );
  }
}
