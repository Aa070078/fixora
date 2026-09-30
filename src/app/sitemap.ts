import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://fixora.example.com";
  const [products, repairs] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    prisma.repairRequest.findMany({ take: 200, select: { trackingToken: true, updatedAt: true } }),
  ]);

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/repair`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/shop`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/track`, changeFrequency: "monthly", priority: 0.4 },
    ...products.map((p) => ({
      url: `${base}/shop/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...repairs.map((r) => ({
      url: `${base}/track/${r.trackingToken}`,
      lastModified: r.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.3,
    })),
  ];
}