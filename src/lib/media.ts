import { db } from "@/lib/db";

export type MediaRole = "image" | "gallery" | "logo" | "thumbnail" | "floorplan";

interface EntityMediaRow {
  entityId: string;
  sortOrder: number;
  role: string | null;
  media: { url: string; alt: string | null };
}

/**
 * Resolves the primary image URL for a set of entities by looking up their
 * `Mediable` links. Returns a map of `entityId -> url`.
 */
export async function getPrimaryImages(
  entityType: string,
  entityIds: string[]
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (entityIds.length === 0) return result;

  const rows = (await db.mediable.findMany({
    where: { entityType, entityId: { in: entityIds } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      media: { select: { url: true, alt: true, deletedAt: true } },
    },
  })) as unknown as EntityMediaRow[];

  for (const row of rows) {
    if (!result.has(row.entityId) && row.media?.url) {
      result.set(row.entityId, row.media.url);
    }
  }

  return result;
}

/** Returns a gallery of image URLs for a single entity, ordered. */
export async function getEntityImages(
  entityType: string,
  entityId: string
): Promise<string[]> {
  const rows = (await db.mediable.findMany({
    where: { entityType, entityId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { media: { select: { url: true } } },
  })) as unknown as EntityMediaRow[];

  return rows.map((r) => r.media?.url).filter((u): u is string => Boolean(u));
}
