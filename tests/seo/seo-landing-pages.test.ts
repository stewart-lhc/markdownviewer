import { seoLandingPages } from "@/lib/seo/landing-pages";

describe("seo landing page data", () => {
  it("defines the first long-tail page pool with unique slugs and paths", () => {
    expect(seoLandingPages).toHaveLength(6);

    const slugs = seoLandingPages.map((page) => page.slug);
    const paths = seoLandingPages.map((page) => page.path);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.every((path) => path.startsWith("/use-cases/") || path.startsWith("/features/"))).toBe(
      true
    );
  });

  it("keeps every page complete enough to avoid thin landing pages", () => {
    for (const page of seoLandingPages) {
      expect(page.title.length).toBeGreaterThan(20);
      expect(page.description.length).toBeGreaterThan(80);
      expect(page.h1.length).toBeGreaterThan(10);
      expect(page.summary.length).toBeGreaterThan(60);
      expect(page.intro.length).toBeGreaterThan(140);
      expect(page.primaryKeywords.length).toBeGreaterThanOrEqual(4);
      expect(page.benefits).toHaveLength(3);
      expect(page.workflow).toHaveLength(3);
      expect(page.sections.length).toBeGreaterThanOrEqual(2);
      expect(page.faq.length).toBeGreaterThanOrEqual(3);
      expect(page.ctaLabel).toMatch(/preview|open|read/i);
    }
  });
});
