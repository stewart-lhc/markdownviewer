import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("D:/GitHub/markdownviewer/app/globals.css", "utf8");

describe("workspace core canvas styles", () => {
  it("uses a resizable split layout without a dedicated outline column", () => {
    expect(css).toContain('.workspace-grid[data-mode="split"] {');
    expect(css).toContain("minmax(280px, var(--workspace-editor-fr, 1fr))");
    expect(css).toContain("6px");
    expect(css).toContain("minmax(280px, var(--workspace-preview-fr, 1fr));");
    expect(css).toContain(".workspace-split-resizer {");
    expect(css).toContain("cursor: col-resize;");
    expect(css).toContain("touch-action: none;");
  });

  it("locks the workspace into an app-like fixed-height shell with matched panes", () => {
    expect(css).toContain(".workspace-tabs-rail {");
    expect(css).toContain("grid-template-columns: 190px minmax(0, 1fr);");
    expect(css).toContain(".workspace-page[data-tabs-collapsed=\"true\"] {");
    expect(css).toContain("grid-template-columns: minmax(0, 1fr);");
    expect(css).toContain(".workspace-shell-card {");
    expect(css).toContain("position: relative;");
    expect(css).toContain("height: calc(100vh - 16px);");
    expect(css).toContain(".workspace-tabs-list {");
    expect(css).toContain(".workspace-tab-row[data-active=\"true\"] {");
    expect(css).toContain(".workspace-tabs-toggle-button {");
    expect(css).toContain("top: 50%;");
    expect(css).toContain("left: -2px;");
    expect(css).toContain(".workspace-pane {");
    expect(css).toContain("height: 100%;");
  });

  it("keeps editor and preview controls in pane headers while the toc stays hidden until needed", () => {
    expect(css).toContain(".workspace-editor-shell {");
    expect(css).toContain(".workspace-editor-input {");
    expect(css).toContain(".workspace-editor-surface {");
    expect(css).toContain(".toolbar-cluster--imports {");
    expect(css).toContain(".workspace-pane-header {");
    expect(css).toContain("min-height: 38px;");
    expect(css).toContain(".workspace-pane-header--editor {");
    expect(css).toContain(".workspace-pane-header--preview {");
    expect(css).toContain("justify-content: space-between;");
    expect(css).toContain("align-items: center;");
    expect(css).toContain(".workspace-header-title {");
    expect(css).toContain("justify-self: center;");
    expect(css).toContain(".workspace-preview-template .theme-menu {");
    expect(css).toContain("left: 0;");
    expect(css).toContain(".workspace-preview-header-controls {");
    expect(css).toContain(".workspace-preview-type-controls {");
    expect(css).toContain(".workspace-preview-font-button {");
    expect(css).toContain(".workspace-preview-font-list {");
    expect(css).toContain(".workspace-preview-size-control {");
    expect(css).toContain('.workspace-toc[data-open="false"] .workspace-toc-panel {');
    expect(css).toContain(".workspace-toc {");
    expect(css).toContain("position: fixed;");
    expect(css).not.toContain(".workspace-pane-header--preview-fixed {");
    expect(css).not.toContain(".workspace-reader-body--with-preview-nav {");
  });

  it("keeps the compact workspace header aligned and fixed on mobile", () => {
    expect(css).toContain("@media (max-width: 720px)");
    expect(css).toContain("grid-template-columns: 76px minmax(0, 1fr) 112px;");
    expect(css).toContain("grid-template-rows: 48px 44px;");
    expect(css).toContain("position: fixed;");
    expect(css).toContain("padding-top: 128px;");
    expect(css).toContain(".toolbar-mobile-settings-strip .workspace-preview-type-controls {");
    expect(css).toContain(".toolbar-mobile-settings-strip .workspace-preview-font-list {");
  });

  it("keeps rich mode as a single editable styled surface instead of a textarea overlay", () => {
    expect(css).toContain(".workspace-editor-shell {");
    expect(css).toContain("height: 0;");
    expect(css).toContain(".workspace-editor-surface {");
    expect(css).toContain("overflow-y: auto;");
    expect(css).toContain("white-space: pre-wrap;");
    expect(css).toContain("caret-color: var(--ink);");
    expect(css).toContain("font-family: var(--body);");
    expect(css).toContain("tab-size: 2;");
    expect(css).toContain(".workspace-editor-surface::selection,");
    expect(css).not.toContain(".workspace-editor-highlight {");
    expect(css).toContain(".workspace-editor-toolbar {");
    expect(css).toContain("flex-wrap: nowrap;");
    expect(css).toContain("overflow: visible;");
    expect(css).toContain(".editor-tools-overflow {");
    expect(css).toContain(".editor-tools-menu {");
    expect(css).toContain(".workspace-reader-body {");
    expect(css).toContain("--workspace-preview-font-family: var(--body);");
    expect(css).toContain("--workspace-preview-font-size: 15px;");
    expect(css).toContain("font-family: var(--workspace-preview-font-family);");
    expect(css).toContain("font-size: var(--workspace-preview-font-size);");
  });

  it("uses dark workspace scrollbars for editor and preview panes", () => {
    expect(css).toContain(".workspace-editor-surface,");
    expect(css).toContain(".workspace-editor-input,");
    expect(css).toContain(".workspace-reader-body {");
    expect(css).toContain("color-scheme: dark;");
    expect(css).toContain("forced-color-adjust: none;");
    expect(css).toContain("scrollbar-color: rgba(77, 88, 105, 0.82) rgba(4, 7, 12, 0.72);");
    expect(css).toContain(".workspace-page .workspace-editor-surface::-webkit-scrollbar-thumb,");
    expect(css).toContain(".workspace-page .workspace-editor-input::-webkit-scrollbar-thumb,");
    expect(css).toContain(".workspace-page .workspace-reader-body::-webkit-scrollbar-thumb {");
    expect(css).toContain("border: 2px solid rgba(4, 7, 12, 0.9);");
  });

  it("styles rich-mode blocks closer to StackEdit while still showing markdown syntax", () => {
    const richOverlayStart = css.indexOf(".md-block {");
    const richOverlayEnd = css.indexOf("html[data-theme=\"night\"] .md-token--link-url {");
    const richOverlayCss = css.slice(richOverlayStart, richOverlayEnd);

    expect(css).toContain('.workspace-editor-shell[data-editor-view="rich"] .workspace-editor-surface {');
    expect(css).toContain("line-height: 1.56;");
    expect(css).toContain("font-weight: 400;");
    expect(css).toContain(".md-block {");
    expect(css).toContain(".md-block--heading[data-depth=\"1\"] .md-token--heading-text {");
    expect(css).toContain(".md-block--table {");
    expect(css).toContain(".md-token--table-cell,");
    expect(css).toContain(".md-block--quote {");
    expect(css).toContain(".md-token--quote-text {");
    expect(richOverlayCss).toContain("font-family: var(--display);");
    expect(richOverlayCss).toContain("font-weight: 700;");
  });

  it("gives preview code blocks a dedicated mono stack and compact sizing", () => {
    expect(css).toContain(".code-frame pre,");
    expect(css).toContain(".code-frame code,");
    expect(css).toContain("font-family: var(--mono);");
    expect(css).toContain("font-size: 0.82rem;");
  });

  it("keeps preview code blocks responsive so they do not widen the whole pane", () => {
    expect(css).toContain(".markdown-body > * {");
    expect(css).toContain("min-width: 0;");
    expect(css).toContain(".code-frame,");
    expect(css).toContain("width: 100%;");
    expect(css).toContain("max-width: 100%;");
    expect(css).toContain(".code-frame pre,");
    expect(css).toContain("max-width: 100%;");
    expect(css).toContain("overflow-y: hidden;");
  });

  it("keeps preview images responsive so they cannot blow out the pane width", () => {
    expect(css).toContain(".markdown-body img {");
    expect(css).toContain("display: block;");
    expect(css).toContain("max-width: 100%;");
    expect(css).toContain("height: auto;");
  });
});
