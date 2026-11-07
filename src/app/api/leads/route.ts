import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required").optional(),
  source: z.enum(["WEBSITE", "WHATSAPP", "CALL", "REFERRAL", "WALK_IN", "CAMPAIGN", "PARTNER"]).default("WEBSITE"),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  refCode: z.string().optional(),
  projectId: z.string().optional(),
  propertyId: z.string().optional(),
  message: z.string().optional(),
  budget: z.number().optional(),
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Get client IP for logging
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";

    const lead = await db.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        source: data.source,
        utmSource: data.utmSource || null,
        utmMedium: data.utmMedium || null,
        utmCampaign: data.utmCampaign || null,
        refCode: data.refCode || null,
        projectId: data.projectId || null,
        propertyId: data.propertyId || null,
        message: data.message || null,
        budget: data.budget || null,
      },
      include: {
        project: { select: { name: true, slug: true } },
        property: { select: { title: true, slug: true } },
      },
    });

    // TODO: Send email notifications to admin and assigned staff
    // TODO: Send auto-reply email to visitor
    // TODO: Fire GA/Pixel conversion event

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: "Lead captured successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Lead capture error:", error);
    return NextResponse.json(
      { error: "Failed to capture lead" },
      { status: 500 }
    );
  }
}
