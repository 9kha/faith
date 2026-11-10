import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await req.json();

    const data: Record<string, any> = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.feedback !== undefined) data.feedback = body.feedback;
    if (body.rating !== undefined) data.rating = body.rating ? Number(body.rating) : null;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.pickupRequired !== undefined) data.pickupRequired = Boolean(body.pickupRequired);
    if (body.pickupAddress !== undefined) data.pickupAddress = body.pickupAddress;
    if (body.scheduledAt !== undefined) data.scheduledAt = new Date(body.scheduledAt);

    const updated = await db.siteVisit.update({
      where: { id },
      data,
      include: {
        project: {
          select: { id: true, name: true, slug: true, city: true },
        },
        property: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    return NextResponse.json({ success: true, visit: updated });
  } catch (error) {
    console.error("Site visit PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update site visit" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    await db.siteVisit.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Site visit DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete site visit" },
      { status: 500 }
    );
  }
}
