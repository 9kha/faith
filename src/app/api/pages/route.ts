import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Prisma, PageStatus, PageTemplate } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    const where: Prisma.PageWhereInput = {
      deletedAt: null,
      ...(status ? { status: status as PageStatus } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { slug: { contains: search } },
              { seoTitle: { contains: search } },
            ],
          }
        : {}),
    };

    const pages = await db.page.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });

    const total = await db.page.count({ where });

    return NextResponse.json({
      pages,
      total,
      publishedCount: pages.filter((p) => p.status === "PUBLISHED").length,
      draftCount: pages.filter((p) => p.status === "DRAFT").length,
    });
  } catch (error) {
    console.error("Pages GET error:", error);
    return NextResponse.json({ error: "Failed to load pages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      template = "DEFAULT",
      content,
      status = "PUBLISHED",
      seoTitle,
      seoDescription,
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and URL Slug are required" },
        { status: 400 }
      );
    }

    // Clean and validate slug (lowercase, alphanum and hyphens only, no leading/trailing slashes)
    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/^\/+|\/+$/g, "")
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-");

    // Check for reserved slugs (e.g. admin, buy, rent, blog, etc.)
    const reservedSlugs = [
      "admin",
      "buy",
      "rent",
      "projects",
      "builders",
      "blog",
      "contact",
      "about",
      "partner-program",
      "emi-calculator",
      "api",
      "login",
    ];

    if (reservedSlugs.includes(cleanSlug)) {
      return NextResponse.json(
        { error: `The slug "/${cleanSlug}" is reserved for system routes.` },
        { status: 400 }
      );
    }

    // Check if slug is already used
    const existing = await db.page.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing && !existing.deletedAt) {
      return NextResponse.json(
        { error: `A page with URL "/${cleanSlug}" already exists.` },
        { status: 400 }
      );
    }

    const page = await db.page.create({
      data: {
        title: title.trim(),
        slug: cleanSlug,
        template: (template as PageTemplate) || "DEFAULT",
        content: content || null,
        draftContent: content || null,
        status: (status as PageStatus) || "PUBLISHED",
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        seoTitle: seoTitle ? seoTitle.trim() : title.trim(),
        seoDescription: seoDescription ? seoDescription.trim() : null,
      },
    });

    return NextResponse.json({ page, message: "Page created successfully" });
  } catch (error) {
    console.error("Pages POST error:", error);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
