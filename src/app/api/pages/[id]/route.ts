import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { PageStatus, PageTemplate } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const page = await db.page.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        deletedAt: null,
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error("Page GET error:", error);
    return NextResponse.json({ error: "Failed to load page" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      title,
      slug,
      template,
      content,
      status,
      seoTitle,
      seoDescription,
    } = body;

    const existing = await db.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    let cleanSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      cleanSlug = slug
        .toLowerCase()
        .trim()
        .replace(/^\/+|\/+$/g, "")
        .replace(/[^a-z0-9-_]/g, "-")
        .replace(/-+/g, "-");

      const duplicate = await db.page.findFirst({
        where: { slug: cleanSlug, id: { not: id }, deletedAt: null },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: `URL "/${cleanSlug}" is already in use by another page.` },
          { status: 400 }
        );
      }
    }

    const updated = await db.page.update({
      where: { id },
      data: {
        ...(title ? { title: title.trim() } : {}),
        slug: cleanSlug,
        ...(template ? { template: template as PageTemplate } : {}),
        content: content !== undefined ? content : existing.content,
        draftContent: content !== undefined ? content : existing.draftContent,
        ...(status
          ? {
              status: status as PageStatus,
              publishedAt:
                status === "PUBLISHED" && !existing.publishedAt
                  ? new Date()
                  : existing.publishedAt,
            }
          : {}),
        seoTitle: seoTitle !== undefined ? seoTitle?.trim() : existing.seoTitle,
        seoDescription:
          seoDescription !== undefined
            ? seoDescription?.trim()
            : existing.seoDescription,
      },
    });

    return NextResponse.json({ page: updated, message: "Page updated successfully" });
  } catch (error) {
    console.error("Page PUT error:", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.page.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Page deleted successfully" });
  } catch (error) {
    console.error("Page DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
