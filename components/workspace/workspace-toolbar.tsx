"use client";

import { useEffect, useRef, useState } from "react";
import type { SourcePanelMode } from "@/components/workspace/source-panel";
import type { WorkspaceMessages } from "@/lib/i18n/messages";

type WorkspaceToolbarProps = {
  activeImportMode: SourcePanelMode;
  mode: "preview" | "split" | "editor";
  messages: WorkspaceMessages["toolbar"];
  sourceValue: string;
  onActiveImportModeChange: (mode: SourcePanelMode) => void;
  onModeChange: (mode: "preview" | "split" | "editor") => void;
  onPasteIntoEditor: () => void;
  onFileImport: (file: File) => void;
  onParseSource: () => void;
  onSourceChange: (value: string) => void;
  onExportHtml: () => void;
  onExportPdf: () => void;
  onShare: () => void;
};

const modes: WorkspaceToolbarProps["mode"][] = ["preview", "split", "editor"];

export function WorkspaceToolbar({
  activeImportMode,
  mode,
  messages,
  sourceValue,
  onActiveImportModeChange,
  onPasteIntoEditor,
  onFileImport,
  onParseSource,
  onSourceChange,
  onModeChange,
  onExportHtml,
  onExportPdf,
  onShare
}: WorkspaceToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const urlInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (activeImportMode === "url") {
      urlInputRef.current?.focus();
    }
  }, [activeImportMode]);

  function runAction(action: () => void) {
    setMenuOpen(false);
    action();
  }

  return (
    <div className="toolbar" role="toolbar" aria-label={messages.label}>
      <div className="toolbar-cluster toolbar-cluster--imports" role="group" aria-label={messages.importOptions}>
        <button
          className="toolbar-button"
          data-active={activeImportMode === "paste"}
          onClick={() => {
            onActiveImportModeChange("paste");
            onPasteIntoEditor();
          }}
          type="button"
        >
          {messages.paste}
        </button>
        <button
          className="toolbar-button"
          data-active={activeImportMode === "file"}
          onClick={() => {
            onActiveImportModeChange("file");
            fileInputRef.current?.click();
          }}
          type="button"
        >
          {messages.file}
        </button>
        <button
          className="toolbar-button"
          data-active={activeImportMode === "url"}
          onClick={() => onActiveImportModeChange("url")}
          type="button"
        >
          {messages.url}
        </button>
        {activeImportMode === "url" ? (
          <>
            <input
              aria-label={messages.sourceUrlLabel}
              className="input input--compact toolbar-url-input"
              onChange={(event) => onSourceChange(event.currentTarget.value)}
              placeholder="https://github.com/acme/repo/blob/main/README.md"
              ref={urlInputRef}
              value={sourceValue}
            />
            <button className="toolbar-button" onClick={onParseSource} type="button">
              {messages.open}
            </button>
          </>
        ) : null}
        <input
          aria-label={messages.uploadLabel}
          className="sr-only"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];

            if (file) {
              onActiveImportModeChange("file");
              onFileImport(file);
            }

            event.currentTarget.value = "";
          }}
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.mdx,.txt,text/markdown,text/plain"
        />
      </div>
      <div className="toolbar-cluster toolbar-cluster--modes">
        {modes.map((entry) => (
          <button
            className="toolbar-button"
            data-active={entry === mode}
            key={entry}
            onClick={() => onModeChange(entry)}
            type="button"
          >
            {messages.modes[entry]}
          </button>
        ))}
      </div>
      <div className="toolbar-overflow" ref={menuRef}>
        <button
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="toolbar-button toolbar-button--overflow"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {messages.more}
        </button>
        {menuOpen ? (
          <div className="toolbar-menu" role="menu">
            <button className="toolbar-menu-button" onClick={() => runAction(onShare)} type="button">
              {messages.shareLink}
            </button>
            <button
              className="toolbar-menu-button"
              onClick={() => runAction(onExportHtml)}
              type="button"
            >
              {messages.exportHtml}
            </button>
            <button
              className="toolbar-menu-button"
              onClick={() => runAction(onExportPdf)}
              type="button"
            >
              {messages.exportPdf}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
