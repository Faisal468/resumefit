import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://resumefit.com";

  const staticRoutes = [
    { url: "", priority: 1, changeFrequency: "weekly" as const },
    { url: "/analyze", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/pricing", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/blog", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/about", priority: 0.5, changeFrequency: "yearly" as const },
  ];

  return staticRoutes.map((route) => ({
    url: `${base}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}