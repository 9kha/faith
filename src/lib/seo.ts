import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function getSeoMeta(entityType: string, entityId: string) {
  return db.seoMeta.findUnique({
    where: { entityType_entityId: { entityType, entityId } },
  });
}

export async function upsertSeoMeta(
  entityType: string,
  entityId: string,
  data: {
    title?: string;
    description?: string;
    focusKeyword?: string;
    canonical?: string;
    robots?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImageId?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImageId?: string;
    schemaJson?: unknown;
  }
) {
  return db.seoMeta.upsert({
    where: { entityType_entityId: { entityType, entityId } },
    update: data as unknown as Prisma.SeoMetaUpdateInput,
    create: ({ entityType, entityId, ...data } as unknown) as Prisma.SeoMetaCreateInput,
  });
}

export function generateJsonLdSchema(
  type: "Organization" | "RealEstateListing" | "Product" | "BreadcrumbList" | "FAQPage" | "Article",
  data: Record<string, unknown>
) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };
}
