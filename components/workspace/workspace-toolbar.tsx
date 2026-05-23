"use client";

import { useEffect, useRef, useState } from "react";
import type { SourcePanelMode } from "@/components/workspace/source-panel";

type WorkspaceToolbarProps = {
  activeImportMode: SourcePanelMode;
  mode: "preview" | "split" | "editor";
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
    <div className="toolbar" role="toolbar" aria-label="Workspace controls">
      <div className="toolbar-cluster toolbar-cluster--imports" role="group" aria-label="Import options">
        <button
          className="toolbar-button"
          data-active={activeImportMode === "paste"}
          onClick={() => {
            onActiveImportModeChange("paste");
            onPasteIntoEditor();
          }}
          type="button"
        >
          Paste
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
          File
        </button>
        <button
          className="toolbar-button"
          data-active={activeImportMode === "url"}
          onClick={() => onActiveImportModeChange("url")}
          type="button"
        >
          URL
        </button>
        {activeImportMode === "url" ? (
          <>
            <input
              aria-label="Markdown source URL"
              className="input input--compact toolbar-url-input"
              onChange={(event) => onSourceChange(event.currentTarget.value)}
              placeholder="https://github.com/acme/repo/blob/main/README.md"
              ref={urlInputRef}
              value={sourceValue}
            />
            <button className="toolbar-button" onClick={onParseSource} type="button">
              Open
            </button>
          </>
        ) : null}
        <input
          aria-label="Upload markdown file"
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
            {entry === "editor" ? "Editor" : entry === "split" ? "Split" : "Preview"}
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
          More
        </button>
        {menuOpen ? (
          <div className="toolbar-menu" role="menu">
            <button className="toolbar-menu-button" onClick={() => runAction(onShare)} type="button">
              Share Link
            </button>
            <button
              className="toolbar-menu-button"
              onClick={() => runAction(onExportHtml)}
              type="button"
            >
              Export HTML
            </button>
            <button
              className="toolbar-menu-button"
              onClick={() => runAction(onExportPdf)}
              type="button"
            >
              Export PDF
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
