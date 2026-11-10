import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: clientId } = await params;
    const visits = await db.siteVisit.findMany({
      where: { clientId },
      include: {
        project: {
          select: { id: true, name: true, slug: true, city: true, locality: true },
        },
        property: {
          select: { id: true, title: true, slug: true, city: true, locality: true },
        },
        organizedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });

    return NextResponse.json({ visits });
  } catch (error) {
    console.error("Client site visits GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch site visits" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getAuthSession();
    const userId = (session?.user as any)?.id || null;
    const { id: clientId } = await params;

    const body = await req.json();
    const {
      projectId,
      propertyId,
      scheduledAt,
      status = "SCHEDULED",
      notes,
      pickupRequired = false,
      pickupAddress,
      feedback,
      rating,
    } = body;

    if (!scheduledAt) {
      return NextResponse.json(
        { error: "Scheduled date & time is required" },
        { status: 400 }
      );
    }

    const visit = await db.siteVisit.create({
      data: {
        clientId,
        projectId: projectId || null,
        propertyId: propertyId || null,
        scheduledAt: new Date(scheduledAt),
        status,
        notes: notes || null,
        pickupRequired: Boolean(pickupRequired),
        pickupAddress: pickupAddress || null,
        feedback: feedback || null,
        rating: rating ? Number(rating) : null,
        organizedById: userId,
      },
      include: {
        project: {
          select: { id: true, name: true, slug: true, city: true },
        },
        property: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    return NextResponse.json({ success: true, visit }, { status: 201 });
  } catch (error) {
    console.error("Client site visits POST error:", error);
    return NextResponse.json(
      { error: "Failed to schedule site visit" },
      { status: 500 }
    );
  }
}
