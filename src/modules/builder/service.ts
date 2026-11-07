import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import type { Builder } from "@prisma/client";

export async function getBuilders(params?: {
  search?: string;
  status?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const { search, status, featured, limit = 50, offset = 0 } = params || {};

  const [builders, total] = await Promise.all([
    db.builder.findMany({
      where: {
        deletedAt: null,
        ...(search
          ? {
              OR: [{ name: { contains: search } }],
            }
          : {}),
        ...(status ? { status } : {}),
        ...(featured !== undefined ? { featured } : {}),
      },
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      take: limit,
      skip: offset,
    }),
    db.builder.count({
      where: {
        deletedAt: null,
        ...(search
          ? {
              OR: [{ name: { contains: search } }],
            }
          : {}),
        ...(status ? { status } : {}),
        ...(featured !== undefined ? { featured } : {}),
      },
    }),
  ]);

  return { builders, total };
}

export async function getBuilderById(id: string) {
  return db.builder.findUnique({
    where: { id },
    include: {
      _count: { select: { projects: true } },
      projects: {
        where: { deletedAt: null },
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getBuilderBySlug(slug: string) {
  return db.builder.findUnique({
    where: { slug },
    include: {
      projects: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function createBuilder(
  data: Record<string, unknown>,
  userId?: string,
  ip?: string
) {
  const builder = await db.builder.create({
    data: {
      name: String(data.name || ""),
      slug: String(data.slug || ""),
      about: (data.about as string | undefined) || null,
      reraNo: (data.reraNo as string | undefined) || null,
      website: (data.website as string | undefined) || null,
      contactName: (data.contactName as string | undefined) || null,
      contactPhone: (data.contactPhone as string | undefined) || null,
      contactEmail: (data.contactEmail as string | undefined) || null,
      address: (data.address as string | undefined) || null,
      commissionTerms: (data.commissionTerms as string | undefined) || null,
      status: (data.status as string) || "active",
      featured: Boolean(data.featured),
      sortOrder: Number(data.sortOrder) || 0,
      seoTitle: (data.seoTitle as string | undefined) || null,
      seoDescription: (data.seoDescription as string | undefined) || null,
    },
  });

  if (userId) {
    await logActivity({
      userId,
      action: "CREATE",
      entity: "Builder",
      entityId: builder.id,
      after: builder,
      ip,
    });
  }

  return builder;
}

export async function updateBuilder(
  id: string,
  data: Record<string, unknown>,
  userId?: string,
  ip?: string
) {
  const before = await db.builder.findUnique({ where: { id } });

  const builder = await db.builder.update({
    where: { id },
    data: {
      name: String(data.name || ""),
      slug: String(data.slug || ""),
      about: (data.about as string | undefined) || null,
      reraNo: (data.reraNo as string | undefined) || null,
      website: (data.website as string | undefined) || null,
      contactName: (data.contactName as string | undefined) || null,
      contactPhone: (data.contactPhone as string | undefined) || null,
      contactEmail: (data.contactEmail as string | undefined) || null,
      address: (data.address as string | undefined) || null,
      commissionTerms: (data.commissionTerms as string | undefined) || null,
      status: (data.status as string),
      featured: Boolean(data.featured),
      sortOrder: Number(data.sortOrder) || 0,
      seoTitle: (data.seoTitle as string | undefined) || null,
      seoDescription: (data.seoDescription as string | undefined) || null,
    },
  });

  if (userId) {
    await logActivity({
      userId,
      action: "UPDATE",
      entity: "Builder",
      entityId: id,
      before,
      after: builder,
      ip,
    });
  }

  return builder;
}

export async function deleteBuilder(
  id: string,
  userId?: string,
  ip?: string
) {
  const before = await db.builder.findUnique({ where: { id } });

  const builder = await db.builder.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  if (userId) {
    await logActivity({
      userId,
      action: "DELETE",
      entity: "Builder",
      entityId: id,
      before,
      after: builder,
      ip,
    });
  }

  return builder;
}

export async function slugExists(slug: string, excludeId?: string) {
  const existing = await db.builder.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  return !!existing;
}

export type BuilderWithCounts = Builder & {
  _count: { projects: number };
};
