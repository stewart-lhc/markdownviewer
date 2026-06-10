import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("D:/GitHub/markdownviewer/app/globals.css", "utf8");
const pwaCss = readFileSync("D:/GitHub/markdownviewer/components/pwa/pwa-install-prompt.module.css", "utf8");

describe("workspace theme styles", () => {
  it("defines a multi-template reader palette with dedicated theme tokens", () => {
    expect(css).toContain('html[data-theme="primer"]');
    expect(css).toContain('html[data-theme="manuscript"]');
    expect(css).toContain('html[data-theme="sepia"]');
    expect(css).toContain('html[data-theme="porcelain"]');
    expect(css).toContain('html[data-theme="aurora"]');
    expect(css).toContain('html[data-theme="graphite"]');
    expect(css).toContain('html[data-theme="evergreen"]');
    expect(css).toContain('html[data-theme="terminal"]');
    expect(css).toContain("--workspace-reader-bg:");
    expect(css).toContain("--workspace-reader-heading:");
    expect(css).toContain(".theme-menu");
    expect(css).toContain('.theme-option__swatch[data-theme-id="primer"]');
    expect(css).toContain('.theme-option__swatch[data-theme-id="aurora"]');
    expect(css).toContain('.theme-option__swatch[data-theme-id="evergreen"]');
    expect(css).toContain('.theme-option__swatch[data-theme-id="terminal"]');
  });

  it("keeps the mobile PWA install prompt readable in dark workspace themes", () => {
    expect(pwaCss).toContain("--pwa-install-action-bg:");
    expect(pwaCss).toContain("--pwa-install-action-ink:");
    expect(pwaCss).toContain('html[data-theme="night"]');
    expect(pwaCss).toContain('html[data-theme="terminal"]');
    expect(pwaCss).toContain(".prompt {");
    expect(pwaCss).toContain(".action {");
    expect(pwaCss).toContain("background: var(--pwa-install-action-bg);");
    expect(pwaCss).toContain("color: var(--pwa-install-action-ink);");
    expect(pwaCss).not.toContain(".action {\n    min-height: 38px;\n    border: 0;\n    border-radius: 12px;\n    background: var(--ink);\n    color: #fff;");
    expect(css).not.toContain("pwa-install-prompt");
  });
});
