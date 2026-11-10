import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { getPrimaryImages } from "@/lib/media";
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

  const images = await getPrimaryImages(
    "Project",
    projects.map((p) => p.id)
  );

  return {
    projects: projects.map((p) => ({
      ...p,
      imageUrl: images.get(p.id) ?? null,
    })),
    total,
  };
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

async function syncProjectMediable(projectId: string, imageUrls: unknown) {
  if (!Array.isArray(imageUrls)) return;
  const urls = imageUrls.filter((u): u is string => typeof u === "string" && u.trim().length > 0);

  try {
    await db.mediable.deleteMany({
      where: { entityType: "Project", entityId: projectId },
    });

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      let media = await db.media.findFirst({ where: { url } });
      if (!media) {
        media = await db.media.create({
          data: {
            url,
            path: url,
            type: "IMAGE",
            mime: "image/webp",
            size: 1024,
            alt: `Project image ${i + 1}`,
          },
        });
      }
      await db.mediable.create({
        data: {
          mediaId: media.id,
          entityType: "Project",
          entityId: projectId,
          role: i === 0 ? "image" : "gallery",
          sortOrder: i,
        },
      });
    }
  } catch (err) {
    console.error("Failed to sync project mediables:", err);
  }
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
      builder: { connect: { id: String(data.builderId) } },
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
      highlights: data.highlights !== undefined ? (data.highlights as any) : null,
      paymentPlan: data.paymentPlan !== undefined ? (data.paymentPlan as any) : null,
      faqs: data.faqs !== undefined ? (data.faqs as any) : null,
      videoUrls: data.videoUrls !== undefined ? (data.videoUrls as any) : null,
      specifications: data.specifications !== undefined ? (data.specifications as any) : null,
      cadFiles: data.cadFiles !== undefined ? (data.cadFiles as any) : null,
      documents: data.documents !== undefined ? (data.documents as any) : null,
      commission: data.commission !== undefined ? (data.commission as any) : null,
      images: data.images !== undefined ? (data.images as any) : null,
      bannerConfig: data.bannerConfig !== undefined ? (data.bannerConfig as any) : null,
      virtualTourUrl: (data.virtualTourUrl as string | undefined) || null,
      ...(data.brochureId ? { brochure: { connect: { id: String(data.brochureId) } } } : {}),
      featured: Boolean(data.featured),
      sortOrder: Number(data.sortOrder) || 0,
      seoTitle: (data.seoTitle as string | undefined) || null,
      seoDescription: (data.seoDescription as string | undefined) || null,
    },
  });

  if (data.images !== undefined) {
    await syncProjectMediable(project.id, data.images);
  }

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
      builder: { connect: { id: String(data.builderId) } },
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
      highlights: data.highlights !== undefined ? (data.highlights as any) : null,
      paymentPlan: data.paymentPlan !== undefined ? (data.paymentPlan as any) : null,
      faqs: data.faqs !== undefined ? (data.faqs as any) : null,
      videoUrls: data.videoUrls !== undefined ? (data.videoUrls as any) : null,
      specifications: data.specifications !== undefined ? (data.specifications as any) : null,
      cadFiles: data.cadFiles !== undefined ? (data.cadFiles as any) : null,
      documents: data.documents !== undefined ? (data.documents as any) : null,
      commission: data.commission !== undefined ? (data.commission as any) : null,
      images: data.images !== undefined ? (data.images as any) : null,
      bannerConfig: data.bannerConfig !== undefined ? (data.bannerConfig as any) : null,
      virtualTourUrl: (data.virtualTourUrl as string | undefined) || null,
      ...(data.brochureId
        ? { brochure: { connect: { id: String(data.brochureId) } } }
        : data.brochureId === null
        ? { brochure: { disconnect: true } }
        : {}),
      featured: Boolean(data.featured),
      sortOrder: Number(data.sortOrder) || 0,
      seoTitle: (data.seoTitle as string | undefined) || null,
      seoDescription: (data.seoDescription as string | undefined) || null,
    },
  });

  if (data.images !== undefined) {
    await syncProjectMediable(id, data.images);
  }

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
