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
    expect(screen.getByRole("link", { name: /updates/i })).toHaveAttribute("href", "/changelog");
    expect(container.querySelector(".topbar-actions .github-mark")).not.toBeNull();
    expect(container.querySelector(".topbar-actions > .ghost-link:last-child")).toHaveClass("ghost-link--primary");
    expect(screen.getByRole("heading", { level: 2, name: /recent features/i })).toBeInTheDocument();
    expect(screen.getByText("26.531")).toBeInTheDocument();
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
  });

  it("renders a formal site footer with company and legal links", () => {
    render(<HomePage />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /about us/i })).toHaveAttribute("href", "#about");
    expect(screen.getByRole("link", { name: /terms of service/i })).toHaveAttribute("href", "#terms");
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "#privacy");
    expect(screen.getByRole("link", { name: /contact/i })).toHaveAttribute("href", "#contact");
    expect(screen.getByText(/© 2026 markdownviewer\.run/i)).toBeInTheDocument();
  });

  it("renders the Chinese landing page copy and localized workspace links", () => {
    render(<ChineseHomePage />);

    expect(screen.getByRole("heading", { level: 1, name: /在线 markdown 查看器/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /工作区/i })[0]).toHaveAttribute("href", "/zh-CN/workspace");
    expect(screen.getByRole("link", { name: "en" })).toHaveAttribute("href", "/");
    expect(screen.getAllByRole("link", { name: /更新/i })[0]).toHaveAttribute("href", "/zh-CN/changelog");
    expect(screen.getByRole("button", { name: /^打开$/i })).toBeInTheDocument();
  });
});
