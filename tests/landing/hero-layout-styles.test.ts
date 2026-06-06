import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("D:/GitHub/markdownviewer/app/globals.css", "utf8");

function getRule(selector: string) {
  const pattern = new RegExp(`\\${selector} \\{[\\s\\S]*?\\n\\}`, "m");
  return css.match(pattern)?.[0] ?? "";
}

describe("landing hero layout styles", () => {
  it("keeps the desktop hero viewport-aware without forcing content to overlap", () => {
    const heroRule = getRule(".hero");
    const heroCopyRule = getRule(".hero-copy");
    const heroPreviewRule = getRule(".hero-preview");
    const previewWindowRule = getRule(".preview-window");

    expect(css).toContain("--hero-panel-height: 600px;");
    expect(heroRule).toContain("height: var(--hero-panel-height);");
    expect(heroRule).toContain("min-height: 0;");
    expect(heroCopyRule).toContain("grid-template-rows: auto auto;");
    expect(heroCopyRule).toContain("justify-items: start;");
    expect(heroCopyRule).toContain("align-content: space-between;");
    expect(heroCopyRule).toContain("height: 100%;");
    expect(heroCopyRule).toContain("overflow: visible;");
    expect(heroPreviewRule).toContain("height: 100%;");
    expect(heroPreviewRule).not.toContain("background:");
    expect(previewWindowRule).toContain("border-radius: var(--radius-xl);");
    expect(previewWindowRule).toContain("box-shadow: var(--shadow);");
  });

  it("lets the landing preview window fill the hero card while keeping the scroll inside the card", () => {
    const previewWindowRule = getRule(".preview-window");
    const previewWindowScrollRule = getRule(".preview-window-scroll");

    expect(previewWindowRule).toContain("flex: 1;");
    expect(previewWindowRule).toContain("height: 100%;");
    expect(previewWindowRule).toContain("padding: 20px 10px 20px 22px;");
    expect(previewWindowRule).toContain("overflow: hidden;");
    expect(previewWindowScrollRule).toContain("height: 100%;");
    expect(previewWindowScrollRule).toContain("padding: 0 10px 0 0;");
    expect(previewWindowScrollRule).toContain("overflow: auto;");
    expect(previewWindowScrollRule).toContain("scrollbar-gutter: stable;");
    expect(previewWindowRule).not.toContain("max-height:");
    expect(css).toContain(".preview-window .markdown-body--compact {");
    expect(css).toContain("overflow: visible;");
    expect(css).not.toContain(".preview-window .markdown-body--compact::-webkit-scrollbar");
  });

  it("keeps supported source labels compact on a single desktop row", () => {
    const supportStripRule = getRule(".support-strip");
    const supportPillRule = getRule(".support-pill");

    expect(supportStripRule).toContain("flex-wrap: wrap;");
    expect(supportStripRule).toContain("justify-content: flex-start;");
    expect(supportStripRule).toContain("width: min(100%, 580px);");
    expect(supportStripRule).toContain("overflow: visible;");
    expect(supportPillRule).toContain("white-space: nowrap;");
    expect(supportPillRule).toContain("font-size: clamp(0.68rem, 0.78vw, 0.78rem);");
  });

  it("styles the landing preview scrollbar as a dark control without arrow buttons", () => {
    expect(css).toContain(".preview-window-scroll {");
    expect(css).toContain("scrollbar-width: thin;");
    expect(css).toContain("scrollbar-color:");
    expect(css).toContain(".preview-window-scroll::-webkit-scrollbar-track {");
    expect(css).toContain(".preview-window-scroll::-webkit-scrollbar-thumb {");
    expect(css).toContain(".preview-window-scroll::-webkit-scrollbar-button {");
    expect(css).toContain("display: none;");
  });

  it("adds a formal landing footer with legal sections", () => {
    expect(css).toContain(".site-footer {");
    expect(css).toContain(".site-footer__nav {");
    expect(css).toContain(".site-footer__workflows {");
    expect(css).toContain(".site-footer__legal {");
    expect(css).toContain(".site-footer__bottom {");
    expect(css).toContain(".site-footer__launch-badges {");
    expect(css).toContain(".site-footer__launch-badge {");
    expect(css).toContain(".site-footer__uneed-badge {");
    expect(css).not.toContain(".workflow-link-bar {");
  });

  it("keeps the landing navigation sticky and styles the changelog sections", () => {
    const topbarRule = getRule(".topbar");

    expect(topbarRule).toContain("position: sticky;");
    expect(topbarRule).toContain("top: 0;");
    expect(topbarRule).toContain("width: 100%;");
    expect(topbarRule).toContain("margin: 0 0 18px;");
    expect(topbarRule).toContain("padding: 10px max(16px, calc((100% - 1200px) / 2));");
    expect(css).toContain(".update-grid {");
    expect(css).toContain(".changelog-hero {");
    expect(css).toContain(".release-card {");
    expect(css).toContain(".github-mark {");
    expect(css).toContain(".ghost-link--primary {");
    expect(css).toContain("min-width: 118px;");
  });
});
