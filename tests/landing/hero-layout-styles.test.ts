import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("D:/GitHub/markdownviewer/app/globals.css", "utf8");

function getRule(selector: string) {
  const pattern = new RegExp(`\\${selector} \\{[\\s\\S]*?\\n\\}`, "m");
  return css.match(pattern)?.[0] ?? "";
}

describe("landing hero layout styles", () => {
  it("keeps both light and dark landing palettes readable", () => {
    const landingRule = getRule(".landing");
    const darkThemeRule = getRule(':is\\(html\\[data-theme="night"\\], html\\[data-theme="graphite"\\], html\\[data-theme="evergreen"\\], html\\[data-theme="terminal"\\]\\) .landing');

    expect(landingRule).toContain("color-scheme: light;");
    expect(landingRule).toContain("--ink: #17171a;");
    expect(landingRule).toContain("--muted: #5b5b62;");
    expect(landingRule).toContain("--chip-ink: var(--muted);");
    expect(landingRule).toContain("--input-ink: var(--ink);");
    expect(landingRule).toContain("--landing-surface: rgba(255, 255, 255, 0.76);");
    expect(landingRule).toContain("--landing-wash: rgba(255, 255, 255, 0.68);");
    expect(landingRule).toContain("--landing-menu-bg: #fffaf2;");
    expect(landingRule).toContain("color: var(--ink);");
    expect(landingRule).toContain("linear-gradient(120deg, var(--landing-wash), transparent 34%)");
    expect(landingRule).toContain("linear-gradient(180deg, var(--body-gradient-start), var(--body-gradient-end));");
    expect(css).toContain(":root:not([data-theme]) .landing");
    expect(css).toContain(
      ':is(html[data-theme="night"], html[data-theme="graphite"], html[data-theme="evergreen"], html[data-theme="terminal"]) .landing'
    );
    expect(darkThemeRule).toContain("color-scheme: dark;");
    expect(darkThemeRule).toContain("--ink: #f6f0e8;");
    expect(darkThemeRule).toContain("--landing-surface: rgba(23, 26, 32, 0.78);");
    expect(darkThemeRule).toContain("--landing-wash: rgba(255, 255, 255, 0.04);");
    expect(darkThemeRule).toContain("--landing-menu-bg: #20242b;");
    expect(darkThemeRule).toContain("--landing-primary-bg: #f6f0e8;");
    expect(darkThemeRule).toContain("--landing-primary-ink: #121316;");
  });

  it("keeps the desktop hero viewport-aware without forcing content to overlap", () => {
    const heroRule = getRule(".hero");
    const heroCopyRule = getRule(".hero-copy");
    const heroPreviewRule = getRule(".hero-preview");
    const previewWindowRule = getRule(".preview-window");

    expect(css).toContain("--hero-panel-height: 600px;");
    expect(heroRule).toContain("min-height: min(var(--hero-panel-height), calc(100dvh - var(--site-nav-height) - 34px));");
    expect(heroRule).toContain("height: min(var(--hero-panel-height), calc(100dvh - var(--site-nav-height) - 34px));");
    expect(heroCopyRule).toContain("display: flex;");
    expect(heroCopyRule).toContain("flex-direction: column;");
    expect(heroCopyRule).toContain("justify-content: center;");
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
    const sourceBandRule = getRule(".source-band");
    const supportStripRule = getRule(".support-strip");
    const supportPillRule = getRule(".support-pill");

    expect(sourceBandRule).toContain("grid-template-columns: minmax(180px, 0.36fr) minmax(0, 1fr);");
    expect(supportStripRule).toContain("flex-wrap: wrap;");
    expect(supportStripRule).toContain("justify-content: flex-start;");
    expect(supportStripRule).toContain("width: 100%;");
    expect(supportStripRule).toContain("overflow: visible;");
    expect(supportPillRule).toContain("white-space: nowrap;");
    expect(supportPillRule).toContain("font-size: clamp(0.68rem, 0.78vw, 0.78rem);");
  });

  it("uses varied landing section layouts instead of repeated equal card rows", () => {
    const sectionHeadRule = getRule(".section-head");
    const featureGridRule = getRule(".feature-grid");
    const updateGridRule = getRule(".update-grid");
    const intentGridRule = getRule(".intent-grid");

    expect(sectionHeadRule).toContain("display: grid;");
    expect(featureGridRule).toContain("grid-template-columns: repeat(6, minmax(0, 1fr));");
    expect(css).toContain(".feature-card--8 {");
    expect(css).toContain("grid-column: span 6;");
    expect(css).toContain("grid-template-columns: minmax(0, 0.92fr) minmax(0, 1fr);");
    expect(css).toContain(".feature-card__media {");
    expect(css).toContain(".feature-card__media img {");
    expect(css).toContain("object-fit: cover;");
    expect(updateGridRule).toContain("grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);");
    expect(css).toContain(".update-card--lead {");
    expect(intentGridRule).toContain("grid-template-columns: repeat(5, minmax(210px, 1fr));");
    expect(intentGridRule).toContain("scroll-snap-type: x proximity;");
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

  it("adds a formal landing footer with workflow links and friendly links", () => {
    expect(css).toContain(".site-footer {");
    expect(css).toContain(".site-footer__nav {");
    expect(css).toContain(".site-footer__workflows {");
    expect(css).toContain(".site-footer__friends-card {");
    expect(css).not.toContain(".site-footer__legal {");
    expect(css).toContain(".site-footer__friends {");
    expect(css).toContain(".site-footer__friends .site-footer__launch-badges {");
    expect(css).toContain("grid-template-columns: repeat(4, minmax(0, 1fr));");
    expect(css).toContain("grid-template-columns: repeat(2, minmax(0, 1fr));");
    expect(css).toContain("@media (max-width: 520px)");
    expect(css).toContain("grid-template-columns: 1fr;");
    expect(css).toContain(".site-footer__bottom {");
    expect(css).toContain(".site-footer__launch-badges {");
    expect(css).toContain(".site-footer__launch-badge {");
    expect(css).toContain(".site-footer__uneed-badge {");
    expect(css).not.toContain(".workflow-link-bar {");
  });

  it("keeps site info headings and actions within the mobile viewport", () => {
    expect(css).toContain(".site-info-hero h1 {");
    expect(css).toContain("max-width: min(100%, 13ch);");
    expect(css).toContain("overflow-wrap: anywhere;");
    expect(css).toContain(".site-info-hero .hero-actions {");
    expect(css).toContain("grid-template-columns: 1fr;");
    expect(css).toContain(".site-info-hero .button-primary,\n  .site-info-hero .button-secondary {");
    expect(css).toContain("width: 100%;");
  });

  it("keeps the landing navigation sticky and styles the changelog sections", () => {
    const topbarRule = getRule(".topbar");

    expect(topbarRule).toContain("position: sticky;");
    expect(topbarRule).toContain("top: 0;");
    expect(topbarRule).toContain("width: 100%;");
    expect(topbarRule).toContain("height: var(--site-nav-height);");
    expect(topbarRule).toContain("min-height: var(--site-nav-height);");
    expect(topbarRule).toContain("margin: 0 0 14px;");
    expect(topbarRule).toContain("padding: 0 max(16px, calc((100% - 1200px) / 2));");
    expect(css).toContain(".site-theme-switcher {");
    expect(css).toContain(".site-theme-switcher__button[data-active=\"true\"] {");
    expect(css).toContain("--site-nav-height: 52px;");
    expect(css).toContain("--site-nav-mobile-height: 50px;");
    expect(css).toContain("--site-nav-control-height: 36px;");
    expect(css).toContain("width: var(--site-nav-control-height);");
    expect(css).toContain("padding: 8px 13px;");
    expect(css).toContain("margin: 0 0 12px;");
    expect(css).toContain(".topbar-actions__desktop {");
    expect(css).toContain(".topbar-breadcrumbs {");
    expect(css).toContain(".topbar-breadcrumbs__panel {");
    expect(css).toContain("background: var(--landing-menu-bg);");
    expect(css).toContain("backdrop-filter: none;");
    expect(css).toContain(".topbar-breadcrumbs__settings-row {");
    expect(css).toContain("height: var(--site-nav-mobile-height);");
    expect(css).toContain("min-height: var(--site-nav-mobile-height);");
    expect(css).toContain("padding: 0 8px;");
    expect(css).toContain(".topbar-actions {\n    flex: 0 0 auto;");
    expect(css).toContain("justify-content: flex-end;");
    expect(css).toContain("overflow-x: visible;");
    expect(css).toContain(".topbar-actions__desktop {\n    display: none;");
    expect(css).toContain(".topbar-breadcrumbs {\n    display: block;");
    expect(css).toContain(".topbar-breadcrumbs__panel {\n    position: fixed;");
    expect(css).toContain("top: calc(var(--site-nav-mobile-height) + 8px);");
    expect(css).toContain("right: 8px;");
    expect(css).toContain("left: 8px;");
    expect(css).toContain("width: auto;");
    expect(css).toContain(".topbar-breadcrumbs .site-theme-switcher__button {\n    width: 34px;");
    expect(css).toContain(".topbar .brand-mark {");
    expect(css).toContain("min-height: var(--site-nav-mobile-control-height);");
    expect(css).toContain(".topbar .ghost-link--primary {");
    expect(css).toContain("min-width: 88px;");
    expect(css).toContain(".update-grid {");
    expect(css).toContain(".changelog-hero {");
    expect(css).toContain(".release-card {");
    expect(css).toContain(".github-mark {");
    expect(css).toContain(".ghost-link--primary {");
    expect(css).toContain("min-width: 118px;");
  });

  it("keeps tablet and mobile live preview samples tall enough to read", () => {
    expect(css).toContain("height: min(520px, 58dvh);");
    expect(css).toContain("min-height: 340px;");
    expect(css).toContain("height: min(420px, 48dvh);");
    expect(css).toContain("min-height: 280px;");
    expect(css).not.toContain("height: 104px;");
  });
});
