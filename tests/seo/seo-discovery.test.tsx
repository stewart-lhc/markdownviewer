import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import sitemap from "@/app/sitemap";
import { seoLandingPages } from "@/lib/seo/landing-pages";

const siteUrl = "https://markdownviewer.run";

describe("seo discovery surfaces", () => {
  it("adds every long-tail landing page to sitemap.xml", () => {
    const urls = sitemap().map((entry) => entry.url);

    for (const page of seoLandingPages) {
      expect(urls).toContain(`${siteUrl}${page.path}`);
    }
  });

  it("links every long-tail landing page from the homepage", () => {
    render(<HomePage />);

    for (const page of seoLandingPages) {
      expect(screen.getAllByRole("link", { name: page.h1 })[0]).toHaveAttribute("href", page.path);
    }
  });
});
