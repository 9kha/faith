import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import type { BookingStatus, PaymentMode } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: clientId } = await params;
    const bookings = await db.booking.findMany({
      where: { clientId },
      include: {
        project: {
          select: { id: true, name: true, slug: true, city: true, locality: true },
        },
        property: {
          select: { id: true, title: true, slug: true, price: true, city: true, locality: true },
        },
        unit: {
          select: { id: true, unitNo: true, tower: true, floor: true },
        },
        payments: {
          select: { id: true, amount: true, paidAt: true, mode: true, reference: true },
        },
      },
      orderBy: { bookingDate: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Client bookings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
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

    const client = await db.client.findUnique({
      where: { id: clientId, deletedAt: null },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      projectId,
      propertyId,
      unitNumber,
      agreementValue,
      tokenAmount = 0,
      discount = 0,
      bookingDate = new Date().toISOString(),
      status = "CONFIRMED",
      paymentMode,
      paymentReference,
      notes,
    } = body;

    const parsedAgreementValue = Math.round(Number(agreementValue) || 0);
    const parsedTokenAmount = Math.round(Number(tokenAmount) || 0);
    const parsedDiscount = Math.round(Number(discount) || 0);

    if (parsedAgreementValue <= 0) {
      return NextResponse.json(
        { error: "Agreement / deal value must be greater than zero" },
        { status: 400 }
      );
    }

    // Optional unit lookup or creation if unitNumber is given
    let unitId: string | null = null;
    if (unitNumber && projectId) {
      const existingUnit = await db.unit.findFirst({
        where: {
          projectId,
          unitNo: String(unitNumber).trim(),
        },
      });
      if (existingUnit) {
        unitId = existingUnit.id;
        // Mark unit as BLOCKED
        await db.unit.update({
          where: { id: existingUnit.id },
          data: { status: "BLOCKED" },
        }).catch(() => {});
      }
    }

    // Create the booking
    const booking = await db.booking.create({
      data: {
        clientId,
        projectId: projectId || null,
        propertyId: propertyId || null,
        unitId,
        agreementValue: parsedAgreementValue,
        tokenAmount: parsedTokenAmount,
        discount: parsedDiscount,
        bookingDate: new Date(bookingDate),
        status: (status as BookingStatus) || "CONFIRMED",
        assignedToId: userId,
      },
      include: {
        project: {
          select: { id: true, name: true, slug: true, city: true },
        },
        property: {
          select: { id: true, title: true, slug: true, price: true },
        },
        unit: {
          select: { id: true, unitNo: true, tower: true },
        },
        payments: true,
      },
    });

    // If token amount > 0, create an initial Payment record
    if (parsedTokenAmount > 0) {
      const validModes: PaymentMode[] = ["BANK_TRANSFER", "CHEQUE", "CASH", "CARD", "UPI", "FINANCE"];
      const resolvedMode: PaymentMode = validModes.includes(paymentMode as PaymentMode) ? (paymentMode as PaymentMode) : "BANK_TRANSFER";

      await db.payment.create({
        data: {
          bookingId: booking.id,
          amount: parsedTokenAmount,
          mode: resolvedMode,
          paidAt: new Date(bookingDate),
          reference: paymentReference || `TOKEN-${Date.now().toString().slice(-6)}`,
          notes: notes ? `Token advance: ${notes}` : "Initial booking token advance payment",
        },
      }).catch((e) => console.error("Payment create error:", e));
    }

    // Append deal notes to client if provided
    if (notes || unitNumber) {
      const newNote = [
        `Booking Created: ${new Date().toLocaleDateString("en-IN")}`,
        unitNumber ? `Unit: ${unitNumber}` : null,
        `Deal: ₹${parsedAgreementValue.toLocaleString("en-IN")}`,
        notes ? `Terms: ${notes}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      const updatedNotes = client.notes ? `${client.notes}\n• ${newNote}` : newNote;
      await db.client.update({
        where: { id: client.id },
        data: { notes: updatedNotes },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error("Client booking POST error:", error);
    return NextResponse.json(
      { error: "Failed to record booking" },
      { status: 500 }
    );
  }
}
