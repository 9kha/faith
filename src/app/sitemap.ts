import { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITE_URL = process.env.SITE_URL || "http://localhost:3000";

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    builders,
    projects,
    properties,
    pages,
    blogPosts,
  ] = await Promise.all([
    db.builder.findMany({
      where: { deletedAt: null, status: "active" },
      select: { slug: true, updatedAt: true },
    }),
    db.project.findMany({
      where: { deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    db.property.findMany({
      where: { deletedAt: null, status: "AVAILABLE" },
      select: { slug: true, updatedAt: true },
    }),
    db.page.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    db.blogPost.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const sitemap: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily" as ChangeFrequency,
      priority: 1,
    },
    {
      url: `${SITE_URL}/buy`,
      lastModified: new Date(),
      changeFrequency: "daily" as ChangeFrequency,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/rent`,
      lastModified: new Date(),
      changeFrequency: "daily" as ChangeFrequency,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: "daily" as ChangeFrequency,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/builders`,
      lastModified: new Date(),
      changeFrequency: "weekly" as ChangeFrequency,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as ChangeFrequency,
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as ChangeFrequency,
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as ChangeFrequency,
      priority: 0.5,
    },
    ...builders.map((b) => ({
      url: `${SITE_URL}/builders/${b.slug}`,
      lastModified: b.updatedAt ?? new Date(),
      changeFrequency: "weekly" as ChangeFrequency,
      priority: 0.7,
    })),
    ...projects.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: p.updatedAt ?? new Date(),
      changeFrequency: "weekly" as ChangeFrequency,
      priority: 0.8,
    })),
    ...properties.map((p) => ({
      url: `${SITE_URL}/properties/${p.slug}`,
      lastModified: p.updatedAt ?? new Date(),
      changeFrequency: "weekly" as ChangeFrequency,
      priority: 0.7,
    })),
    ...pages.map((p) => ({
      url: `${SITE_URL}/${p.slug}`,
      lastModified: p.updatedAt ?? new Date(),
      changeFrequency: "weekly" as ChangeFrequency,
      priority: 0.6,
    })),
    ...blogPosts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt ?? new Date(),
      changeFrequency: "weekly" as ChangeFrequency,
      priority: 0.6,
    })),
  ];

  return sitemap;
}
