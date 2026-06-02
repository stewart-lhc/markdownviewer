"use client";

import { useEffect, useRef, useState } from "react";
import type { WorkspaceMessages } from "@/lib/i18n/messages";

export type WorkspacePreviewFont =
  | "system"
  | "serif"
  | "mono"
  | "source-han-sans"
  | "source-han-serif"
  | "lxgw-wenkai"
  | "pingfang"
  | "kaiti"
  | "georgia"
  | "charter"
  | "athelas"
  | "baskerville"
  | "palatino";

type WorkspacePreviewTypographyControlsProps = {
  font: WorkspacePreviewFont;
  fontSize: number;
  margin: number;
  maxMargin: number;
  maxFontSize: number;
  messages: WorkspaceMessages["preview"];
  minMargin: number;
  minFontSize: number;
  onFontChange: (font: WorkspacePreviewFont) => void;
  onFontSizeChange: (fontSize: number) => void;
  onMarginChange: (margin: number) => void;
  showMarginControl?: boolean;
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
    id: "source-han-sans",
    label: "Source Han Sans",
    stack: "'Source Han Sans SC', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif"
  },
  {
    id: "source-han-serif",
    label: "Source Han Serif",
    stack: "'Source Han Serif SC', 'Noto Serif CJK SC', 'SimSun', serif"
  },
  {
    id: "lxgw-wenkai",
    label: "LXGW WenKai",
    stack: "'LXGW WenKai', 'STKaiti', 'KaiTi', serif"
  },
  {
    id: "pingfang",
    label: "PingFang",
    stack: "'PingFang SC', 'Microsoft YaHei', sans-serif"
  },
  {
    id: "kaiti",
    label: "KaiTi",
    stack: "'KaiTi', 'STKaiti', serif"
  },
  {
    id: "serif",
    label: "Serif",
    stack: "Georgia, 'Times New Roman', serif"
  },
  {
    id: "georgia",
    label: "Georgia",
    stack: "Georgia, 'Times New Roman', serif"
  },
  {
    id: "charter",
    label: "Charter",
    stack: "Charter, 'Bitstream Charter', Georgia, serif"
  },
  {
    id: "athelas",
    label: "Athelas",
    stack: "Athelas, 'Iowan Old Style', Georgia, serif"
  },
  {
    id: "baskerville",
    label: "Baskerville",
    stack: "Baskerville, 'Libre Baskerville', Georgia, serif"
  },
  {
    id: "palatino",
    label: "Palatino",
    stack: "'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif"
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
  margin,
  maxMargin,
  maxFontSize,
  messages,
  minMargin,
  minFontSize,
  onFontChange,
  onFontSizeChange,
  onMarginChange,
  showMarginControl = true
}: WorkspacePreviewTypographyControlsProps) {
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const fontMenuRef = useRef<HTMLDivElement | null>(null);
  const selectedFontLabel = messages.fontOptions[font] ?? getWorkspacePreviewFontLabel(font);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (fontMenuRef.current && !fontMenuRef.current.contains(event.target as Node)) {
        setFontMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  function selectFont(nextFont: WorkspacePreviewFont) {
    setFontMenuOpen(false);
    onFontChange(nextFont);
  }

  return (
    <div className="workspace-preview-type-controls" role="group" aria-label={messages.typography}>
      <div className="workspace-preview-font-menu" ref={fontMenuRef}>
        <button
          aria-expanded={fontMenuOpen}
          aria-haspopup="menu"
          aria-label={messages.font}
          className="toolbar-button workspace-preview-font-button"
          onClick={() => setFontMenuOpen((open) => !open)}
          type="button"
        >
          {selectedFontLabel}
        </button>
        {fontMenuOpen ? (
          <>
            <button
              aria-label={messages.close}
              className="workspace-popup-backdrop workspace-menu-backdrop"
              onClick={() => setFontMenuOpen(false)}
              type="button"
            />
            <div aria-label={messages.font} className="workspace-preview-font-list" role="menu">
              {workspacePreviewFontOptions.map((option) => (
                <button
                  aria-checked={font === option.id}
                  className="workspace-preview-font-option"
                  data-active={font === option.id}
                  key={option.id}
                  onClick={() => selectFont(option.id)}
                  role="menuitemradio"
                  type="button"
                >
                  <span>{messages.fontOptions[option.id] ?? option.label}</span>
                  <span aria-hidden="true" style={{ fontFamily: option.stack }}>
                    Aa 字
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
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
        <output aria-label={messages.fontSize} className="workspace-preview-size-value sr-only">
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
      {showMarginControl ? (
        <div className="workspace-preview-margin-control">
          <button
            aria-label={messages.decreaseMargin}
            className="toolbar-button workspace-preview-margin-button"
            disabled={margin <= minMargin}
            onClick={() => onMarginChange(margin - 1)}
            type="button"
          >
            M-
          </button>
          <output aria-label={messages.margin} className="workspace-preview-margin-value sr-only">
            {margin + 1}
          </output>
          <button
            aria-label={messages.increaseMargin}
            className="toolbar-button workspace-preview-margin-button"
            disabled={margin >= maxMargin}
            onClick={() => onMarginChange(margin + 1)}
            type="button"
          >
            M+
          </button>
        </div>
      ) : null}
    </div>
  );
}

function getWorkspacePreviewFontLabel(font: WorkspacePreviewFont) {
  return workspacePreviewFontOptions.find((option) => option.id === font)?.label ?? workspacePreviewFontOptions[0].label;
}
