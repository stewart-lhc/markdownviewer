import type { WorkspacePreviewFont } from "@/components/workspace/workspace-preview-typography-controls";

export const workspacePreviewFontStorageKey = "markdownviewer.workspace.preview.font";
export const workspacePreviewFontSizeStorageKey = "markdownviewer.workspace.preview.fontSize";
export const workspacePreviewMarginStorageKey = "markdownviewer.workspace.preview.margin.v3";

export const defaultPreviewFont: WorkspacePreviewFont = "system";
export const defaultPreviewFontSize = 15;
export const minPreviewFontSize = 13;
export const maxPreviewFontSize = 21;

export const previewMarginLevels = [
  "4%",
  "7%",
  "10%",
  "13%",
  "16%",
  "19%",
  "22%",
  "25%"
] as const;

export const defaultPreviewMargin = previewMarginLevels.length - 1;
export const minPreviewMargin = 0;
export const maxPreviewMargin = previewMarginLevels.length - 1;

export function clampPreviewFontSize(value: number) {
  return Math.min(Math.max(Math.round(value), minPreviewFontSize), maxPreviewFontSize);
}

export function clampPreviewMargin(value: number) {
  return Math.min(Math.max(Math.round(value), minPreviewMargin), maxPreviewMargin);
}

export function getPreviewMarginCss(level: number) {
  return previewMarginLevels[clampPreviewMargin(level)] ?? previewMarginLevels[defaultPreviewMargin];
}
