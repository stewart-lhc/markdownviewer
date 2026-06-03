import type { MetadataRoute } from "next";
import { seoLandingPages } from "@/lib/seo/landing-pages";

const siteUrl = "https://markdownviewer.run";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-06-03");
  const homeAlternates = {
    languages: {
      en: siteUrl,
      "zh-CN": `${siteUrl}/zh-CN`
    }
  };
  const workspaceAlternates = {
    languages: {
      en: `${siteUrl}/workspace`,
      "zh-CN": `${siteUrl}/zh-CN/workspace`
    }
  };
  const changelogAlternates = {
    languages: {
      en: `${siteUrl}/changelog`,
      "zh-CN": `${siteUrl}/zh-CN/changelog`
    }
  };

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: homeAlternates
    },
    {
      url: `${siteUrl}/zh-CN`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: homeAlternates
    },
    {
      url: `${siteUrl}/workspace`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: workspaceAlternates
    },
    {
      url: `${siteUrl}/zh-CN/workspace`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: workspaceAlternates
    },
    {
      url: `${siteUrl}/changelog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: changelogAlternates
    },
    {
      url: `${siteUrl}/zh-CN/changelog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: changelogAlternates
    },
    ...seoLandingPages.map((page) => ({
      url: `${siteUrl}${page.path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75
    }))
  ];
}
