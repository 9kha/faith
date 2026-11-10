import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { getPrimaryImages } from "@/lib/media";
import type { Property, PropertyListingType, PropertyCategory, PropertyStatus } from "@prisma/client";

type SortOption = "newest" | "price_asc" | "price_desc" | "area_desc";

function buildWhere(params: {
  search?: string;
  location?: string;
  builderId?: string;
  projectId?: string;
  listingType?: string;
  category?: string;
  status?: string;
  city?: string;
  locality?: string;
  bhk?: string;
  verified?: boolean;
  priceMin?: number;
  priceMax?: number;
  featured?: boolean;
}) {
  const {
    search,
    location,
    builderId,
    projectId,
    listingType,
    category,
    status,
    city,
    locality,
    bhk,
    verified,
    priceMin,
    priceMax,
    featured,
  } = params;

  const andConditions: any[] = [{ deletedAt: null }];

  const price =
    priceMin !== undefined || priceMax !== undefined
      ? {
          ...(priceMin !== undefined ? { gte: priceMin } : {}),
          ...(priceMax !== undefined ? { lte: priceMax } : {}),
        }
      : undefined;

  if (price) {
    andConditions.push({ OR: [{ price }, { rent: price }] });
  }

  if (search) {
    andConditions.push({
      OR: [
        { title: { contains: search } },
        { city: { contains: search } },
        { locality: { contains: search } },
        { description: { contains: search } },
      ],
    });
  }

  const effectiveLoc = location?.trim();
  if (effectiveLoc) {
    andConditions.push({
      OR: [
        { city: { contains: effectiveLoc } },
        { locality: { contains: effectiveLoc } },
        { title: { contains: effectiveLoc } },
        { description: { contains: effectiveLoc } },
      ],
    });
  } else {
    if (city?.trim()) {
      const c = city.trim();
      andConditions.push({
        OR: [
          { city: { contains: c } },
          { locality: { contains: c } },
        ],
      });
    }
    if (locality?.trim()) {
      andConditions.push({ locality: { contains: locality.trim() } });
    }
  }

  if (builderId) andConditions.push({ builderId });
  if (projectId) andConditions.push({ projectId });
  if (listingType) andConditions.push({ listingType: listingType as PropertyListingType });
  if (category) andConditions.push({ category: category as PropertyCategory });
  if (status) andConditions.push({ status: status as PropertyStatus });
  if (bhk) andConditions.push({ bhk: { contains: bhk } });
  if (verified !== undefined) andConditions.push({ verified });
  if (featured !== undefined) andConditions.push({ featured });

  return { AND: andConditions };
}

const SORT_ORDER: Record<SortOption, Array<Record<string, "asc" | "desc">>> = {
  newest: [{ featured: "desc" }, { createdAt: "desc" }],
  price_asc: [{ price: "asc" }, { rent: "asc" }],
  price_desc: [{ price: "desc" }, { rent: "desc" }],
  area_desc: [{ area: "desc" }],
};

export async function getProperties(params?: {
  search?: string;
  location?: string;
  builderId?: string;
  projectId?: string;
  listingType?: string;
  category?: string;
  status?: string;
  city?: string;
  locality?: string;
  bhk?: string;
  verified?: boolean;
  priceMin?: number;
  priceMax?: number;
  featured?: boolean;
  sort?: string;
  limit?: number;
  offset?: number;
}) {
  const {
    search,
    location,
    builderId,
    projectId,
    listingType,
    category,
    status,
    city,
    locality,
    bhk,
    verified,
    priceMin,
    priceMax,
    featured,
    sort,
    limit = 50,
    offset = 0,
  } = params || {};

  const where = buildWhere({
    search,
    location,
    builderId,
    projectId,
    listingType,
    category,
    status,
    city,
    locality,
    bhk,
    verified,
    priceMin,
    priceMax,
    featured,
  });

  const orderBy =
    SORT_ORDER[(sort as SortOption) ?? "newest"] ?? SORT_ORDER.newest;

  const [properties, total] = await Promise.all([
    db.property.findMany({
      where,
      include: {
        builder: { select: { id: true, name: true, slug: true } },
        project: { select: { id: true, name: true, slug: true } },
      },
      orderBy,
      take: limit,
      skip: offset,
    }),
    db.property.count({ where }),
  ]);

  const images = await getPrimaryImages(
    "Property",
    properties.map((p) => p.id)
  );

  return {
    properties: properties.map((p) => ({
      ...p,
      imageUrl: images.get(p.id) ?? null,
    })),
    total,
  };
}

export async function getPropertyById(id: string) {
  return db.property.findUnique({
    where: { id },
    include: {
      builder: true,
      project: true,
    },
  });
}

export async function getPropertyBySlug(slug: string) {
  return db.property.findUnique({
    where: { slug },
    include: {
      builder: true,
      project: true,
    },
  });
}

export async function createProperty(
  data: Record<string, unknown>,
  userId?: string,
  ip?: string
) {
  const property = await db.property.create({
    data: {
      title: String(data.title || ""),
      slug: String(data.slug || ""),
      projectId: (data.projectId as string | undefined) || null,
      builderId: (data.builderId as string | undefined) || null,
      listingType: (data.listingType as PropertyListingType) || "SALE",
      category: (data.category as PropertyCategory) || "FLAT",
      price: (data.price as number | undefined) || null,
      rent: (data.rent as number | undefined) || null,
      deposit: (data.deposit as number | undefined) || null,
      maintenance: (data.maintenance as number | undefined) || null,
      bhk: (data.bhk as string | undefined) || null,
      baths: (data.baths as number | undefined) || null,
      area: (data.area as number | undefined) || null,
      areaUnit: (data.areaUnit as string | undefined) || null,
      floor: (data.floor as number | undefined) || null,
      totalFloors: (data.totalFloors as number | undefined) || null,
      facing: (data.facing as string | undefined) || null,
      furnishing: (data.furnishing as string | undefined) || null,
      ageYears: (data.ageYears as number | undefined) || null,
      possession: (data.possession as string | undefined) || null,
      city: String(data.city || ""),
      locality: String(data.locality || ""),
      lat: (data.lat as number | undefined) || null,
      lng: (data.lng as number | undefined) || null,
      description: (data.description as string | undefined) || null,
      ownerName: (data.ownerName as string | undefined) || null,
      ownerPhone: (data.ownerPhone as string | undefined) || null,
      status: (data.status as PropertyStatus) || "AVAILABLE",
      featured: Boolean(data.featured),
      verified: Boolean(data.verified),
      seoTitle: (data.seoTitle as string | undefined) || null,
      seoDescription: (data.seoDescription as string | undefined) || null,
    },
  });

  if (userId) {
    await logActivity({
      userId,
      action: "CREATE",
      entity: "Property",
      entityId: property.id,
      after: property,
      ip,
    });
  }

  return property;
}

export async function updateProperty(
  id: string,
  data: Record<string, unknown>,
  userId?: string,
  ip?: string
) {
  const before = await db.property.findUnique({ where: { id } });

  const property = await db.property.update({
    where: { id },
    data: {
      title: String(data.title || ""),
      slug: String(data.slug || ""),
      projectId: (data.projectId as string | undefined) || null,
      builderId: (data.builderId as string | undefined) || null,
      listingType: (data.listingType as PropertyListingType) || "SALE",
      category: (data.category as PropertyCategory) || "FLAT",
      price: (data.price as number | undefined) || null,
      rent: (data.rent as number | undefined) || null,
      deposit: (data.deposit as number | undefined) || null,
      maintenance: (data.maintenance as number | undefined) || null,
      bhk: (data.bhk as string | undefined) || null,
      baths: (data.baths as number | undefined) || null,
      area: (data.area as number | undefined) || null,
      areaUnit: (data.areaUnit as string | undefined) || null,
      floor: (data.floor as number | undefined) || null,
      totalFloors: (data.totalFloors as number | undefined) || null,
      facing: (data.facing as string | undefined) || null,
      furnishing: (data.furnishing as string | undefined) || null,
      ageYears: (data.ageYears as number | undefined) || null,
      possession: (data.possession as string | undefined) || null,
      city: String(data.city || ""),
      locality: String(data.locality || ""),
      lat: (data.lat as number | undefined) || null,
      lng: (data.lng as number | undefined) || null,
      description: (data.description as string | undefined) || null,
      ownerName: (data.ownerName as string | undefined) || null,
      ownerPhone: (data.ownerPhone as string | undefined) || null,
      status: (data.status as PropertyStatus) || "AVAILABLE",
      featured: Boolean(data.featured),
      verified: Boolean(data.verified),
      seoTitle: (data.seoTitle as string | undefined) || null,
      seoDescription: (data.seoDescription as string | undefined) || null,
    },
  });

  if (userId) {
    await logActivity({
      userId,
      action: "UPDATE",
      entity: "Property",
      entityId: id,
      before,
      after: property,
      ip,
    });
  }

  return property;
}

export async function deleteProperty(
  id: string,
  userId?: string,
  ip?: string
) {
  const before = await db.property.findUnique({ where: { id } });

  const property = await db.property.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  if (userId) {
    await logActivity({
      userId,
      action: "DELETE",
      entity: "Property",
      entityId: id,
      before,
      after: property,
      ip,
    });
  }

  return property;
}

export async function slugExists(slug: string, excludeId?: string) {
  const existing = await db.property.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  return !!existing;
}

export type PropertyWithRelations = Property & {
  builder: { id: string; name: string; slug: string } | null;
  project: { id: string; name: string; slug: string } | null;
};
