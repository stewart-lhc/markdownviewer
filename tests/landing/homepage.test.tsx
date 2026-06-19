import { render, screen, within } from "@testing-library/react";
import HomePage from "@/app/page";
import ChineseHomePage from "@/app/zh-CN/page";

describe("homepage", () => {
  it("shows direct actions for file, url, and sample import", () => {
    const { container } = render(<HomePage />);

    expect(screen.getByRole("button", { name: /paste/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^file$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open sample/i })).toHaveAttribute(
      "href",
      "/workspace?sample=starter"
    );
    expect(screen.getByLabelText(/markdown source url/i)).toHaveAttribute("name", "source");
    expect(screen.getByRole("button", { name: /^open$/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /updates/i }).some((link) => link.getAttribute("href") === "/changelog")).toBe(true);
    expect(screen.getAllByRole("link", { name: /pricing/i }).some((link) => link.getAttribute("href") === "/pricing")).toBe(true);
    expect(screen.getAllByRole("group", { name: /color mode/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /system/i })[0]).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("button", { name: /light/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /dark/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /open navigation breadcrumbs/i })).toBeInTheDocument();
    expect(container.querySelector(".topbar-actions .github-mark")).not.toBeNull();
    expect(container.querySelector(".topbar-actions > .ghost-link.ghost-link--primary")).not.toBeNull();
    expect(container.querySelector(".topbar-actions > .ghost-link.ghost-link--primary + .topbar-breadcrumbs")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: /recent features/i })).toBeInTheDocument();
    expect(screen.getByText("26.619")).toBeInTheDocument();
    expect(screen.getAllByText(/workspace chrome, reader controls, and mermaid stability/i).length).toBeGreaterThan(0);
    expect(container.querySelector(".workflow-link-bar")).not.toBeInTheDocument();
    expect(container.querySelector(".site-footer__workflows")).toBeInTheDocument();
    expect(within(container.querySelector(".site-footer__workflows") as HTMLElement).getByRole("link", { name: /readme viewer online/i })).toHaveAttribute(
      "href",
      "/use-cases/readme-viewer"
    );
    const preview = container.querySelector(".hero-preview .markdown-body--compact");

    expect(preview).toBeInTheDocument();
    expect(within(preview as HTMLElement).getByRole("heading", { level: 1, name: /markdown feature atlas/i })).toBeInTheDocument();
    expect(container.querySelector(".hero-preview .code-frame")).toBeInTheDocument();
    expect(container.querySelector(".hero-preview .mermaid-compact")).toBeInTheDocument();

    const featureScreenshots = Array.from(container.querySelectorAll(".feature-card__media img"));
    expect(featureScreenshots).toHaveLength(8);
    expect(featureScreenshots.every((image) => image.getAttribute("loading") === "eager")).toBe(true);
    expect(featureScreenshots.map((image) => image.getAttribute("src"))).toEqual([
      "/feature-screenshots/live-preview.webp",
      "/feature-screenshots/folder-workspace.webp",
      "/feature-screenshots/pwa-file-open.webp",
      "/feature-screenshots/persistent-tabs.webp",
      "/feature-screenshots/document-conversion.webp",
      "/feature-screenshots/technical-rendering.webp",
      "/feature-screenshots/share-export.webp",
      "/feature-screenshots/readme-ai-workspace.webp"
    ]);
  });

  it("renders a formal site footer with company and legal links", () => {
    render(<HomePage />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /about us/i })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: /terms of service/i })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: /contact/i })).toHaveAttribute("href", "/contact");
    const friendlyLinks = screen.getByLabelText(/friendly links/i);
    expect(friendlyLinks.closest(".site-footer__friends-card")).not.toBeNull();
    expect(screen.queryByText(/use the viewer responsibly/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/local files and pasted markdown stay/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /launched on tiny startups/i })).toHaveAttribute(
      "href",
      "https://www.tinystartups.com/startup/markdown-viewer"
    );
    expect(within(friendlyLinks).getByRole("link", { name: /launched on tiny startups/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /launching soon on uneed/i })).toHaveAttribute(
      "href",
      "https://www.uneed.best/tool/markdown-viewer"
    );
    expect(document.querySelector(".site-footer__bottom .site-footer__launch-badges")).toBeNull();
    expect(screen.getByAltText(/launching soon on uneed/i)).toHaveAttribute(
      "src",
      "https://www.uneed.best/EMBED3B.png"
    );
    expect(screen.getByText(/© 2026 markdownviewer\.run/i)).toBeInTheDocument();
  });

  it("renders the Chinese landing page copy and localized workspace links", () => {
    render(<ChineseHomePage />);

    expect(screen.getByRole("heading", { level: 1, name: /在线 markdown 查看器/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /工作区/i })[0]).toHaveAttribute("href", "/zh-CN/workspace");
    expect(screen.getAllByRole("link", { name: "en" }).some((link) => link.getAttribute("href") === "/")).toBe(true);
    expect(screen.getAllByRole("link", { name: /更新/i })[0]).toHaveAttribute("href", "/zh-CN/changelog");
    expect(screen.getAllByRole("link", { name: /定价/i }).some((link) => link.getAttribute("href") === "/zh-CN/pricing")).toBe(true);
    expect(screen.getAllByRole("group", { name: /颜色模式/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /^打开$/i })).toBeInTheDocument();
  });
});
