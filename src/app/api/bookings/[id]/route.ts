import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { BookingStatus } from "@prisma/client";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await req.json();

    const data: Record<string, any> = {};
    if (body.status) data.status = body.status as BookingStatus;
    if (body.agreementValue !== undefined) data.agreementValue = Math.round(Number(body.agreementValue) || 0);
    if (body.tokenAmount !== undefined) data.tokenAmount = Math.round(Number(body.tokenAmount) || 0);

    const booking = await db.booking.update({
      where: { id },
      data,
      include: {
        project: { select: { id: true, name: true } },
        property: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Booking PATCH error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    await db.$transaction([
      db.payment.deleteMany({ where: { bookingId: id } }),
      db.paymentSchedule.deleteMany({ where: { bookingId: id } }),
      db.booking.delete({ where: { id } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Booking DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
