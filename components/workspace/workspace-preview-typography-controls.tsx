"use client";

import type { WorkspaceMessages } from "@/lib/i18n/messages";

export type WorkspacePreviewFont = "system" | "serif" | "mono";

type WorkspacePreviewTypographyControlsProps = {
  font: WorkspacePreviewFont;
  fontSize: number;
  maxFontSize: number;
  messages: WorkspaceMessages["preview"];
  minFontSize: number;
  onFontChange: (font: WorkspacePreviewFont) => void;
  onFontSizeChange: (fontSize: number) => void;
};

export const workspacePreviewFontOptions: Array<{
  id: WorkspacePreviewFont;
  label: string;
  stack: string;
}> = [
  {
    id: "system",
    label: "System",
    stack: "var(--body)"
  },
  {
    id: "serif",
    label: "Serif",
    stack: "Georgia, 'Times New Roman', serif"
  },
  {
    id: "mono",
    label: "Mono",
    stack: "var(--mono)"
  }
];

export function isWorkspacePreviewFont(value: string | null): value is WorkspacePreviewFont {
  return workspacePreviewFontOptions.some((option) => option.id === value);
}

export function getWorkspacePreviewFontStack(font: WorkspacePreviewFont) {
  return workspacePreviewFontOptions.find((option) => option.id === font)?.stack ?? workspacePreviewFontOptions[0].stack;
}

export function WorkspacePreviewTypographyControls({
  font,
  fontSize,
  maxFontSize,
  messages,
  minFontSize,
  onFontChange,
  onFontSizeChange
}: WorkspacePreviewTypographyControlsProps) {
  return (
    <div className="workspace-preview-type-controls" role="group" aria-label={messages.typography}>
      <select
        aria-label={messages.font}
        className="workspace-preview-font-select"
        onChange={(event) => {
          const nextFont = event.currentTarget.value;

          if (isWorkspacePreviewFont(nextFont)) {
            onFontChange(nextFont);
          }
        }}
        value={font}
      >
        {workspacePreviewFontOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {messages.fontOptions[option.id]}
          </option>
        ))}
      </select>
      <div className="workspace-preview-size-control">
        <button
          aria-label={messages.decreaseFont}
          className="toolbar-button workspace-preview-size-button"
          disabled={fontSize <= minFontSize}
          onClick={() => onFontSizeChange(fontSize - 1)}
          type="button"
        >
          A-
        </button>
        <output aria-label={messages.fontSize} className="workspace-preview-size-value">
          {fontSize}px
        </output>
        <button
          aria-label={messages.increaseFont}
          className="toolbar-button workspace-preview-size-button"
          disabled={fontSize >= maxFontSize}
          onClick={() => onFontSizeChange(fontSize + 1)}
          type="button"
        >
          A+
        </button>
      </div>
    </div>
  );
}
