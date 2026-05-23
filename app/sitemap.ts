import type { MetadataRoute } from "next";

const siteUrl = "https://markdownviewer.run";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-04-29");

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${siteUrl}/workspace`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8
    }
  ];
}
