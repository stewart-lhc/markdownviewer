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
    expect(css).toContain("grid-template-columns: var(--workspace-tabs-width, 190px) 6px minmax(0, 1fr);");
    expect(css).toContain("grid-template-rows: auto minmax(0, 1fr);");
    expect(css).toContain(".workspace-page[data-tabs-collapsed=\"true\"] {");
    expect(css).toContain(".workspace-page[data-tabs-collapsed=\"true\"] .workspace-shell-card {");
    expect(css).toContain(".workspace-shell-card {");
    expect(css).toContain("grid-column: 3;");
    expect(css).toContain(".workspace-sidebar-resizer {");
    expect(css).toContain(".workspace-page[data-tabs-resizing=\"true\"] .workspace-sidebar-resizer::before {");
    expect(css).toContain("height: 100%;");
    expect(css).toContain(".workspace-tabs-list {");
    expect(css).toContain(".workspace-tab-row[data-active=\"true\"] {");
    expect(css).not.toContain(".workspace-rail-topbar {");
    expect(css).toContain(".workspace-tabs-rail--collapsed {");
    expect(css).toContain(".workspace-tabs-toggle-button {");
    expect(css).toContain("position: static;");
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
    expect(css).toContain(".workspace-header-tabs-control {");
    expect(css).toContain("gap: 8px;");
    expect(css).not.toContain(".workspace-header-title {");
    expect(css).toContain(".workspace-header-language {");
    expect(css).toContain(".workspace-preview-template .theme-menu {");
    expect(css).toContain("left: 0;");
    expect(css).toContain(".workspace-preview-header-controls {");
    expect(css).toContain(".workspace-preview-type-controls {");
    expect(css).toContain(".workspace-preview-font-button {");
    expect(css).toContain(".workspace-preview-font-list {");
    expect(css).toContain(".workspace-preview-size-control,\n.workspace-preview-line-height-control {");
    expect(css).toContain(".workspace-preview-line-height-control {");
    expect(css).toContain(".workspace-preview-margin-control {");
    expect(css).toContain(".workspace-page .toolbar-button {");
    expect(css).toContain(".workspace-page .toolbar-button:hover,");
    expect(css).toContain("transform: none;");
    expect(css).toContain('.workspace-toc[data-open="false"] .workspace-toc-panel {');
    expect(css).toContain(".workspace-toc {");
    expect(css).toContain("position: fixed;");
    expect(css).not.toContain(".workspace-pane-header--preview-fixed {");
    expect(css).not.toContain(".workspace-reader-body--with-preview-nav {");
  });

  it("keeps the compact workspace header aligned and fixed on mobile", () => {
    expect(css).toContain("@media (max-width: 720px)");
    expect(css).not.toContain('"tabs spacer modes"');
    expect(css).toContain('"tabs spacer modes read share overflow"');
    expect(css).not.toContain("grid-template-columns: auto minmax(0, 1fr) 112px;");
    expect(css).toContain("grid-template-columns: auto minmax(0, 1fr) 88px 36px 36px 36px !important;");
    expect(css).toContain(".workspace-preview-mobile-immersive-button,");
    expect(css).toContain("grid-area: read !important;");
    expect(css).toContain(".workspace-preview-mobile-share-button {");
    expect(css).toContain("grid-area: share !important;");
    expect(css).toContain('.workspace-page[data-mobile-share-visible="false"] .workspace-header {');
    expect(css).toContain('grid-template-areas: "tabs spacer modes overflow" !important;');
    expect(css).toContain("grid-template-columns: auto minmax(0, 1fr) 88px 36px !important;");
    expect(css).not.toContain('"tabs title modes"');
    expect(css).not.toContain('"title"');
    expect(css).not.toContain("grid-template-rows: 48px 44px;");
    expect(css).toContain("grid-template-rows: minmax(0, 1fr) !important;");
    expect(css).toContain("position: fixed;");
    expect(css).toContain("top: 0 !important;");
    expect(css).toContain("left: 0 !important;");
    expect(css).toContain("right: 0 !important;");
    expect(css).toContain("height: var(--site-nav-mobile-height) !important;");
    expect(css).toContain("min-height: var(--site-nav-mobile-height) !important;");
    expect(css).toContain(".workspace-page[data-mobile-header-visible=\"false\"] .workspace-header {");
    expect(css).toContain("transform: translateY(calc(-100% - env(safe-area-inset-top, 0px)));");
    expect(css).toContain("padding: var(--site-nav-mobile-height) 0 calc(12px + env(safe-area-inset-bottom, 0px)) !important;");
    expect(css).toContain("top: calc(var(--site-nav-mobile-height) + 6px);");
    expect(css).toContain("height: auto;");
    expect(css).toContain("max-height: min(calc(100svh - var(--site-nav-mobile-height) - 18px), 520px);");
    expect(css).toContain('.workspace-tabs-rail[data-open="false"] {');
    expect(css).toContain("transform: translateX(-18px) scale(0.98);");
    expect(css).toContain('.workspace-tabs-rail[data-open="true"] {');
    expect(css).toContain('.workspace-page[data-tabs-collapsed="false"] .workspace-header {');
    expect(css).toContain("z-index: 92 !important;");
    expect(css).toContain(".workspace-tabs-backdrop {");
    expect(css).toContain("backdrop-filter: blur(8px) saturate(0.9);");
    expect(css).toContain(".workspace-menu-backdrop {");
    expect(css).toContain("backdrop-filter: none;");
    expect(css).toContain(".workspace-header-tabs-control {");
    expect(css).toContain("width: var(--site-nav-mobile-control-height) !important;");
    expect(css).toContain(".workspace-share-link {");
    expect(css).toContain("transform: translate(-50%, -50%);");
    expect(css).toContain(".workspace-share-link__header {");
    expect(css).toContain(".workspace-share-link__copy[data-copy-state=\"copied\"] {");
    expect(css).toContain("@keyframes workspace-share-copy-confirm");
    expect(css).toContain(".workspace-new-tab-dialog {");
    expect(css).toContain("z-index: 110;");
    expect(css).toContain(".workspace-new-tab-choices {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr);");
    expect(css).not.toContain(".workspace-new-tab-url-form {");
    expect(css).toContain(".toolbar-mobile-settings-strip .workspace-preview-type-controls {");
    expect(css).toContain(".toolbar-mobile-settings-strip .workspace-preview-font-list {");
    expect(css).toContain(".workspace-preview-bottom-bar {");
    expect(css).toContain("display: block !important;");
    expect(css).toContain(".workspace-page .workspace-preview-bottom-bar {");
    expect(css).toContain(".workspace-page[data-preview-controls-open=\"true\"] .workspace-preview-bottom-bar {");
    expect(css).toContain(".workspace-preview-mobile-share-button {");
    expect(css).toContain("grid-area: share !important;");
    expect(css).toContain(".workspace-preview-bottom-toggle {");
    expect(css).toContain(".workspace-preview-bottom-toggle[aria-expanded=\"true\"] {");
    expect(css).toContain("top: 50%;\n    right: max(12px, env(safe-area-inset-right, 0px));\n    bottom: auto;");
    expect(css).toContain("z-index: 74;");
    expect(css).toContain("width: min(300px, calc(100vw - 84px));");
    expect(css).toContain("max-height: min(64vh, 480px);");
    expect(css).not.toContain(".workspace-page[data-preview-controls-open=\"true\"] .workspace-toc {");
    expect(css).toContain('.workspace-toc[data-open="false"] .workspace-toc-panel {\n    transform: translate(8px, -50%);');
    expect(css).toContain("grid-template-columns: repeat(6, minmax(0, 1fr));");
    expect(css).toContain(".workspace-preview-bottom-bar .toolbar-overflow {");
    expect(css).toContain("justify-self: stretch !important;");
    expect(css).toContain(
      ".workspace-preview-bottom-bar .workspace-preview-size-control,\n  .workspace-preview-bottom-bar .workspace-preview-line-height-control {"
    );
    expect(css).toContain("display: contents !important;");
    expect(css).toContain(".workspace-preview-control-icon {");
    expect(css).toContain(".workspace-preview-step-icon {");
    expect(css).toContain('.workspace-preview-template[data-compact="true"] > .toolbar-button,');
  });

  it("keeps shared-document headers on the same site navigation heights", () => {
    expect(css).toContain("--site-nav-height: 52px;");
    expect(css).toContain("--site-nav-control-height: 36px;");
    expect(css).toContain(".share-header {");
    expect(css).toContain("grid-template-rows: var(--site-nav-height) minmax(0, 1fr);");
    expect(css).toContain("height: var(--site-nav-height);");
    expect(css).toContain("min-height: var(--site-nav-height);");
    expect(css).toContain(".share-header .ghost-link {");
    expect(css).toContain("min-height: var(--site-nav-control-height);");
    expect(css).toContain("grid-template-rows: var(--site-nav-mobile-height) minmax(0, 1fr);");
    expect(css).toContain("height: var(--site-nav-mobile-height);");
    expect(css).toContain("min-height: var(--site-nav-mobile-height);");
    expect(css).toContain("min-height: var(--site-nav-mobile-control-height);");
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
    expect(css).toContain(".editor-tool-button svg {");
    expect(css).toContain("width: 17px;");
    expect(css).toContain(".editor-tools-menu-icon svg {");
    expect(css).toContain("flex-wrap: nowrap;");
    expect(css).toContain("overflow: visible;");
    expect(css).toContain(".editor-tools-overflow {");
    expect(css).toContain(".editor-tools-menu {");
    expect(css).toContain(".workspace-reader-body {");
    expect(css).toContain("--workspace-preview-font-family: var(--body);");
    expect(css).toContain("--workspace-preview-font-size: 15px;");
    expect(css).toContain("--workspace-preview-line-height: 1.88;");
    expect(css).toContain("--workspace-preview-inline-margin: 25%;");
    expect(css).toContain("font-family: var(--workspace-preview-font-family);");
    expect(css).toContain("font-size: var(--workspace-preview-font-size);");
    expect(css).toContain("line-height: var(--workspace-preview-line-height);");
    expect(css).toContain(".workspace-reader-body .markdown-body th,\n.workspace-reader-body .markdown-body td {\n  padding: 8px 10px;\n  font-size: 1em;");
    expect(css).toContain('.workspace-reader-body[data-locale="zh-CN"] .markdown-body,');
    expect(css).toContain(".workspace-reader-body .markdown-body.markdown-body--cjk {");
    expect(css).toContain(".workspace-reader-body .markdown-body.markdown-body--cjk h1,");
    expect(css).toContain('.workspace-reader-body[data-locale="zh-CN"] .markdown-body li,');
    expect(css).toContain(".workspace-reader-body .markdown-body.markdown-body--cjk li,");
    expect(css).toContain('.workspace-reader-body[data-locale="zh-CN"] .markdown-body ul,');
    expect(css).toContain("gap: 0.42rem;");
    expect(css).toContain('.workspace-grid[data-mode="preview"] .workspace-reader-body .markdown-body {');
    expect(css).toContain("max-width: 100%;");
    expect(css).toContain('.workspace-grid[data-mode="preview"] .workspace-reader-body {');
    expect(css).toContain("padding-inline: var(--workspace-preview-inline-margin);");
    expect(css).toContain("html[data-theme] .workspace-reader-body .markdown-body h1,");
    expect(css).toContain(".immersive-reader-overlay {");
    expect(css).toContain(".immersive-reader-progress {");
    expect(css).toContain("height: 2px;");
    expect(css).toContain('.immersive-reader-overlay[data-controls-visible="true"] .immersive-reader-chrome,');
    expect(css).toContain(".immersive-reader-scroll {");
    expect(css).toContain("height: 100dvh;");
    expect(css).toContain(".immersive-reader-document {");
    expect(css).toContain("max-width: min(76ch, 100%);");
  });

  it("uses theme-aware workspace scrollbars for editor and preview panes", () => {
    expect(css).toContain(".workspace-editor-surface,");
    expect(css).toContain(".workspace-editor-input,");
    expect(css).toContain(".workspace-reader-body {");
    expect(css).toContain("--workspace-scrollbar-color-scheme: light;");
    expect(css).toContain("--workspace-scrollbar-color-scheme: dark;");
    expect(css).toContain("color-scheme: var(--workspace-scrollbar-color-scheme);");
    expect(css).toContain("forced-color-adjust: none;");
    expect(css).toContain("scrollbar-color: var(--workspace-scrollbar-thumb) var(--workspace-scrollbar-track);");
    expect(css).toContain("overscroll-behavior: contain;");
    expect(css).toContain(".workspace-toc-panel::-webkit-scrollbar {");
    expect(css).toContain(".workspace-toc-panel::-webkit-scrollbar-thumb {");
    expect(css).toContain(".workspace-toc-panel::-webkit-scrollbar-thumb:hover {");
    expect(css).toContain("contain: layout style;");
    expect(css).not.toContain("contain: layout paint style;");
    expect(css).toContain(".workspace-page .workspace-editor-surface::-webkit-scrollbar-thumb,");
    expect(css).toContain(".workspace-page .workspace-editor-input::-webkit-scrollbar-thumb,");
    expect(css).toContain(".workspace-page .workspace-reader-body::-webkit-scrollbar-thumb {");
    expect(css).toContain("border: 2px solid var(--workspace-scrollbar-thumb-border);");
    expect(css).toContain(".workspace-page .workspace-editor-surface::-webkit-scrollbar-thumb:hover,");
    expect(css).toContain("background: var(--workspace-scrollbar-thumb);");
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

  it("keeps wide markdown tables horizontally scrollable on phones", () => {
    expect(css).toContain(".markdown-table-scroll {");
    expect(css).toContain("overflow-x: auto;");
    expect(css).toContain("scrollbar-gutter: stable;");
    expect(css).toContain(".markdown-table-scroll > table {");
    expect(css).toContain("width: max-content;");
    expect(css).toContain("min-width: 100%;");
    expect(css).toContain(".workspace-reader-body .markdown-table-scroll > table {");
    expect(css).toContain("min-width: max(100%, 420px);");
    expect(css).toContain("min-width: clamp(104px, 32vw, 148px);");
    expect(css).toContain("word-break: normal;");
  });
});
