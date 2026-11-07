import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import type { Project, ProjectType, ProjectStatus } from "@prisma/client";

export async function getProjects(params?: {
  search?: string;
  builderId?: string;
  status?: string;
  type?: string;
  city?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const {
    search,
    builderId,
    status,
    type,
    city,
    featured,
    limit = 50,
    offset = 0,
  } = params || {};

  const [projects, total] = await Promise.all([
    db.project.findMany({
      where: {
        deletedAt: null,
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { city: { contains: search } },
                { locality: { contains: search } },
              ],
            }
          : {}),
        ...(builderId ? { builderId } : {}),
        ...(status ? { status: status as ProjectStatus } : {}),
        ...(type ? { type: type as ProjectType } : {}),
        ...(city ? { city } : {}),
        ...(featured !== undefined ? { featured } : {}),
      },
      include: {
        builder: { select: { id: true, name: true, slug: true } },
        _count: { select: { units: true } },
      },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      take: limit,
      skip: offset,
    }),
    db.project.count({
      where: {
        deletedAt: null,
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { city: { contains: search } },
                { locality: { contains: search } },
              ],
            }
          : {}),
        ...(builderId ? { builderId } : {}),
        ...(status ? { status: status as ProjectStatus } : {}),
        ...(type ? { type: type as ProjectType } : {}),
        ...(city ? { city } : {}),
        ...(featured !== undefined ? { featured } : {}),
      },
    }),
  ]);

  return { projects, total };
}

export async function getProjectById(id: string) {
  return db.project.findUnique({
    where: { id },
    include: {
      builder: true,
      towersRel: { include: { units: true } },
      units: true,
      amenities: { include: { amenity: true } },
    },
  });
}

export async function getProjectBySlug(slug: string) {
  return db.project.findUnique({
    where: { slug },
    include: {
      builder: true,
      amenities: { include: { amenity: true } },
    },
  });
}

export async function createProject(
  data: Record<string, unknown>,
  userId?: string,
  ip?: string
) {
  const project = await db.project.create({
    data: {
      name: String(data.name || ""),
      slug: String(data.slug || ""),
      builderId: String(data.builderId || ""),
      type: (data.type as ProjectType) || "APARTMENT",
      status: (data.status as ProjectStatus) || "UPCOMING",
      city: String(data.city || ""),
      locality: String(data.locality || ""),
      pincode: (data.pincode as string | undefined) || null,
      lat: (data.lat as number | undefined) || null,
      lng: (data.lng as number | undefined) || null,
      reraNo: (data.reraNo as string | undefined) || null,
      priceMin: (data.priceMin as number | undefined) || null,
      priceMax: (data.priceMax as number | undefined) || null,
      areaMin: (data.areaMin as number | undefined) || null,
      areaMax: (data.areaMax as number | undefined) || null,
      possessionDate: (data.possessionDate as string | undefined)
        ? new Date(String(data.possessionDate))
        : null,
      launchDate: (data.launchDate as string | undefined)
        ? new Date(String(data.launchDate))
        : null,
      totalUnits: (data.totalUnits as number | undefined) || null,
      towers: (data.towers as number | undefined) || null,
      description: (data.description as string | undefined) || null,
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
      entity: "Project",
      entityId: project.id,
      after: project,
      ip,
    });
  }

  return project;
}

export async function updateProject(
  id: string,
  data: Record<string, unknown>,
  userId?: string,
  ip?: string
) {
  const before = await db.project.findUnique({ where: { id } });

  const project = await db.project.update({
    where: { id },
    data: {
      name: String(data.name || ""),
      slug: String(data.slug || ""),
      builderId: String(data.builderId || ""),
      type: (data.type as ProjectType) || "APARTMENT",
      status: (data.status as ProjectStatus) || "UPCOMING",
      city: String(data.city || ""),
      locality: String(data.locality || ""),
      pincode: (data.pincode as string | undefined) || null,
      lat: (data.lat as number | undefined) || null,
      lng: (data.lng as number | undefined) || null,
      reraNo: (data.reraNo as string | undefined) || null,
      priceMin: (data.priceMin as number | undefined) || null,
      priceMax: (data.priceMax as number | undefined) || null,
      areaMin: (data.areaMin as number | undefined) || null,
      areaMax: (data.areaMax as number | undefined) || null,
      possessionDate: (data.possessionDate as string | undefined)
        ? new Date(String(data.possessionDate))
        : null,
      launchDate: (data.launchDate as string | undefined)
        ? new Date(String(data.launchDate))
        : null,
      totalUnits: (data.totalUnits as number | undefined) || null,
      towers: (data.towers as number | undefined) || null,
      description: (data.description as string | undefined) || null,
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
      entity: "Project",
      entityId: id,
      before,
      after: project,
      ip,
    });
  }

  return project;
}

export async function deleteProject(
  id: string,
  userId?: string,
  ip?: string
) {
  const before = await db.project.findUnique({ where: { id } });

  const project = await db.project.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  if (userId) {
    await logActivity({
      userId,
      action: "DELETE",
      entity: "Project",
      entityId: id,
      before,
      after: project,
      ip,
    });
  }

  return project;
}

export async function slugExists(slug: string, excludeId?: string) {
  const existing = await db.project.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  return !!existing;
}

export async function getSmartAddSuggestions(builderId?: string) {
  const builders = await db.builder.findMany({
    where: { deletedAt: null, ...(builderId ? { id: builderId } : {}) },
    take: 10,
    orderBy: { name: "asc" },
  });

  return { builders };
}

export type ProjectWithBuilder = Project & {
  builder: { id: string; name: string; slug: string };
  _count: { units: number };
};
