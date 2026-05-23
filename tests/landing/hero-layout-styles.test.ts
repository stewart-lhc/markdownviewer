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

    expect(css).toContain("--hero-panel-height: 560px;");
    expect(heroRule).toContain("height: var(--hero-panel-height);");
    expect(heroRule).toContain("min-height: 0;");
    expect(heroCopyRule).toContain("grid-template-rows: auto auto;");
    expect(heroCopyRule).toContain("align-content: space-between;");
    expect(heroCopyRule).toContain("height: 100%;");
    expect(heroCopyRule).toContain("overflow: hidden;");
    expect(heroPreviewRule).toContain("height: 100%;");
    expect(heroPreviewRule).not.toContain("background:");
    expect(previewWindowRule).toContain("border-radius: var(--radius-xl);");
    expect(previewWindowRule).toContain("box-shadow: var(--shadow);");
  });

  it("lets the landing preview window fill the hero card while keeping the scroll inside the card", () => {
    const previewWindowRule = getRule(".preview-window");

    expect(previewWindowRule).toContain("flex: 1;");
    expect(previewWindowRule).toContain("height: 100%;");
    expect(previewWindowRule).toContain("overflow: auto;");
    expect(previewWindowRule).not.toContain("max-height:");
  });

  it("keeps supported source labels compact on a single desktop row", () => {
    const supportStripRule = getRule(".support-strip");
    const supportPillRule = getRule(".support-pill");

    expect(supportStripRule).toContain("flex-wrap: nowrap;");
    expect(supportStripRule).toContain("overflow: hidden;");
    expect(supportPillRule).toContain("white-space: nowrap;");
    expect(supportPillRule).toContain("font-size: clamp(0.72rem, 0.85vw, 0.86rem);");
  });

  it("styles the landing preview scrollbar as a dark control without arrow buttons", () => {
    expect(css).toContain(".preview-window {");
    expect(css).toContain("scrollbar-width: thin;");
    expect(css).toContain("scrollbar-color:");
    expect(css).toContain(".preview-window::-webkit-scrollbar-track,");
    expect(css).toContain(".preview-window::-webkit-scrollbar-thumb,");
    expect(css).toContain(".preview-window::-webkit-scrollbar-button,");
    expect(css).toContain("display: none;");
  });

  it("adds a formal landing footer with legal sections", () => {
    expect(css).toContain(".site-footer {");
    expect(css).toContain(".site-footer__nav {");
    expect(css).toContain(".site-footer__legal {");
    expect(css).toContain(".site-footer__bottom {");
  });
});
