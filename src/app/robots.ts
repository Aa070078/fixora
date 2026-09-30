import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/technician", "/api/", "/signin"],
      },
    ],
    sitemap: "https://fixora.example.com/sitemap.xml",
  };
}