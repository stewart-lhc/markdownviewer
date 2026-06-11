import { render, screen } from "@testing-library/react";
import { SiteInfoPageContent } from "@/components/site-info/site-info-page-content";
import { buildSiteInfoMetadata, contactEmail } from "@/lib/site-info-pages";

describe("site info pages", () => {
  it("renders the English contact page with the personal contact email", () => {
    render(<SiteInfoPageContent slug="contact" />);

    expect(screen.getByRole("heading", { level: 1, name: /contact markdownviewer\.run/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /email contact/i })).toHaveAttribute("href", `mailto:${contactEmail}`);
    expect(screen.getByText(new RegExp(contactEmail))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");
  });

  it("renders the Chinese privacy page with localized legal navigation", () => {
    render(<SiteInfoPageContent locale="zh-CN" slug="privacy" />);

    expect(screen.getByRole("heading", { level: 1, name: "隐私政策" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "发送邮件" })).toHaveAttribute("href", `mailto:${contactEmail}`);
    expect(screen.getByRole("link", { name: "服务条款" })).toHaveAttribute("href", "/zh-CN/terms");
  });

  it("builds canonical and alternate metadata for site info pages", () => {
    const metadata = buildSiteInfoMetadata("terms", "zh-CN");

    expect(metadata.alternates?.canonical).toBe("https://markdownviewer.run/zh-CN/terms");
    expect(metadata.alternates?.languages).toMatchObject({
      en: "https://markdownviewer.run/terms",
      "zh-CN": "https://markdownviewer.run/zh-CN/terms",
      "x-default": "https://markdownviewer.run/terms"
    });
  });
});
