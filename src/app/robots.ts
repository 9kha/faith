import { MetadataRoute } from "next";

const SITE_URL = process.env.SITE_URL || "http://localhost:3000";

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/buy", "/rent", "/projects", "/builders", "/blog", "/about", "/contact"],
      disallow: ["/admin", "/api", "/uploads/private"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
