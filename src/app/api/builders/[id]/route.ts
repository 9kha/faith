import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deleteBuilder } from "@/modules/builder/service";

export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const existing = await db.builder.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Builder not found" }, { status: 404 });
    }

    await deleteBuilder(id);

    return NextResponse.json({
      success: true,
      message: "Builder deleted successfully",
    });
  } catch (error) {
    console.error("Builder delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete builder" },
      { status: 500 }
    );
  }
}
