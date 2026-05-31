"use client";

import { useEffect, useRef, useState } from "react";
import { Clipboard, Columns2, Eye, FileUp, FolderOpen, Link, MoreHorizontal, Pencil, Save, X } from "lucide-react";
import type { SourcePanelMode } from "@/components/workspace/source-panel";
import type { WorkspaceMessages } from "@/lib/i18n/messages";

type WorkspaceToolbarProps = {
  activeImportMode: SourcePanelMode;
  compact?: boolean;
  mode: "preview" | "split" | "editor";
  messages: WorkspaceMessages["toolbar"];
  showImportActions?: boolean;
  sourceValue: string;
  onActiveImportModeChange: (mode: SourcePanelMode) => void;
  onModeChange: (mode: "preview" | "split" | "editor") => void;
  onPasteIntoEditor: () => void;
  onFileImport: (file: File) => void;
  onParseSource: () => void;
  onSourceChange: (value: string) => void;
  onExportHtml: () => void;
  onExportPdf: () => void;
  onOpenFolder: () => void;
  onSaveToDisk: () => void;
};

const modes: WorkspaceToolbarProps["mode"][] = ["preview", "split", "editor"];

function getModeIcon(mode: WorkspaceToolbarProps["mode"]) {
  if (mode === "preview") {
    return <Eye aria-hidden="true" size={19} strokeWidth={2} />;
  }

  if (mode === "editor") {
    return <Pencil aria-hidden="true" size={19} strokeWidth={2} />;
  }

  return <Columns2 aria-hidden="true" size={19} strokeWidth={2} />;
}

export function WorkspaceToolbar({
  activeImportMode,
  compact = false,
  mode,
  messages,
  showImportActions = true,
  sourceValue,
  onActiveImportModeChange,
  onPasteIntoEditor,
  onFileImport,
  onParseSource,
  onSourceChange,
  onModeChange,
  onExportHtml,
  onExportPdf,
  onOpenFolder,
  onSaveToDisk
}: WorkspaceToolbarProps) {
  const [importMenuOpen, setImportMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const importMenuRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const urlInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (importMenuRef.current && !importMenuRef.current.contains(event.target as Node)) {
        setImportMenuOpen(false);
      }

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
    if (activeImportMode === "url" && (!compact || urlDialogOpen)) {
      urlInputRef.current?.focus();
    }
  }, [activeImportMode, compact, urlDialogOpen]);

  function runAction(action: () => void) {
    setImportMenuOpen(false);
    setMenuOpen(false);
    action();
  }

  function activatePaste() {
    onActiveImportModeChange("paste");
    onPasteIntoEditor();
  }

  function activateFile() {
    onActiveImportModeChange("file");
    fileInputRef.current?.click();
  }

  function activateUrl() {
    onActiveImportModeChange("url");
    if (compact) {
      setUrlDialogOpen(true);
    }
  }

  function activateFolder() {
    onOpenFolder();
  }

  function parseUrlSource() {
    onParseSource();
    setUrlDialogOpen(false);
  }

  const visibleModes = compact ? modes.filter((entry) => entry !== "split") : modes;

  return (
    <div className="toolbar" role="toolbar" aria-label={messages.label}>
      {showImportActions ? (
      <div className="toolbar-compact-imports" ref={importMenuRef}>
        <button
          aria-expanded={importMenuOpen}
          aria-haspopup="menu"
          className="toolbar-button toolbar-compact-import-button"
          onClick={() => setImportMenuOpen((open) => !open)}
          type="button"
        >
          <FileUp aria-hidden="true" size={18} strokeWidth={2} />
          <span>{messages.importAction}</span>
        </button>
        {importMenuOpen ? (
          <>
            <button
              aria-label={messages.importOptions}
              className="workspace-popup-backdrop workspace-menu-backdrop"
              onClick={() => setImportMenuOpen(false)}
              type="button"
            />
            <div aria-label={messages.importOptions} className="toolbar-menu toolbar-menu--imports" role="menu">
              <button
                aria-checked={activeImportMode === "paste"}
                className="toolbar-menu-button"
                onClick={() => runAction(activatePaste)}
                role="menuitemradio"
                type="button"
              >
                {messages.paste}
              </button>
              <button
                aria-checked={activeImportMode === "file"}
                className="toolbar-menu-button"
                onClick={() => runAction(activateFile)}
                role="menuitemradio"
                type="button"
              >
                {messages.file}
              </button>
              <button
                aria-checked={activeImportMode === "url"}
                className="toolbar-menu-button"
                onClick={() => runAction(activateUrl)}
                role="menuitemradio"
                type="button"
              >
                {messages.url}
              </button>
              <button
                className="toolbar-menu-button"
                onClick={() => runAction(activateFolder)}
                role="menuitem"
                type="button"
              >
                {messages.openFolder}
              </button>
            </div>
          </>
        ) : null}
      </div>
      ) : null}
      {showImportActions ? (
      <div className="toolbar-cluster toolbar-cluster--imports" role="group" aria-label={messages.importOptions}>
        <button
          className="toolbar-button"
          data-active={activeImportMode === "paste"}
          onClick={activatePaste}
          type="button"
        >
          <Clipboard aria-hidden="true" size={16} strokeWidth={2} />
          <span>{messages.paste}</span>
        </button>
        <button
          className="toolbar-button"
          data-active={activeImportMode === "file"}
          onClick={activateFile}
          type="button"
        >
          <FileUp aria-hidden="true" size={16} strokeWidth={2} />
          <span>{messages.file}</span>
        </button>
        <button
          className="toolbar-button"
          data-active={activeImportMode === "url"}
          onClick={activateUrl}
          type="button"
        >
          <Link aria-hidden="true" size={16} strokeWidth={2} />
          <span>{messages.url}</span>
        </button>
        <button
          className="toolbar-button"
          onClick={activateFolder}
          type="button"
        >
          <FolderOpen aria-hidden="true" size={16} strokeWidth={2} />
          <span>{messages.openFolder}</span>
        </button>
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
      ) : (
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
      )}
      {showImportActions && activeImportMode === "url" && !compact ? (
        <div className="toolbar-url-row">
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
        </div>
      ) : null}
      <div className="toolbar-cluster toolbar-cluster--modes">
        {visibleModes.map((entry) => (
          <button
            className="toolbar-button"
            data-active={entry === mode}
            key={entry}
            onClick={() => onModeChange(entry)}
            type="button"
          >
            {compact ? (
              <>
                <span aria-hidden="true" className="toolbar-mode-icon">
                  {getModeIcon(entry)}
                </span>
                <span className="sr-only">{messages.modes[entry]}</span>
              </>
            ) : (
              messages.modes[entry]
            )}
          </button>
        ))}
      </div>
      {compact && showImportActions ? (
        <div className="toolbar-mobile-quick-actions" role="group" aria-label={messages.importOptions}>
          <button aria-label={messages.paste} className="toolbar-button" onClick={activatePaste} type="button">
            <Clipboard aria-hidden="true" size={18} strokeWidth={2} />
          </button>
          <button aria-label={messages.file} className="toolbar-button" onClick={activateFile} type="button">
            <FileUp aria-hidden="true" size={18} strokeWidth={2} />
          </button>
          <button aria-label={messages.url} className="toolbar-button" onClick={activateUrl} type="button">
            <Link aria-hidden="true" size={18} strokeWidth={2} />
          </button>
          <button aria-label={messages.openFolder} className="toolbar-button" onClick={activateFolder} type="button">
            <FolderOpen aria-hidden="true" size={18} strokeWidth={2} />
          </button>
        </div>
      ) : null}
      <div className="toolbar-overflow" ref={menuRef}>
        <button
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="toolbar-button toolbar-button--overflow"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {compact ? (
            <>
              <MoreHorizontal aria-hidden="true" size={19} strokeWidth={2} />
              <span className="sr-only">{messages.more}</span>
            </>
          ) : (
            messages.more
          )}
        </button>
        {menuOpen ? (
          <>
            <button
              aria-label={messages.more}
              className="workspace-popup-backdrop workspace-menu-backdrop"
              onClick={() => setMenuOpen(false)}
              type="button"
            />
            <div className="toolbar-menu" role="menu">
              {showImportActions ? (
                <>
                  <button
                    className="toolbar-menu-button toolbar-menu-mobile-action"
                    onClick={() => runAction(activatePaste)}
                    type="button"
                  >
                    <Clipboard aria-hidden="true" size={16} strokeWidth={2} />
                    <span>{messages.paste}</span>
                  </button>
                  <button
                    className="toolbar-menu-button toolbar-menu-mobile-action"
                    onClick={() => runAction(activateFile)}
                    type="button"
                  >
                    <FileUp aria-hidden="true" size={16} strokeWidth={2} />
                    <span>{messages.file}</span>
                  </button>
                  <button
                    className="toolbar-menu-button toolbar-menu-mobile-action"
                    onClick={() => runAction(activateUrl)}
                    type="button"
                  >
                    <Link aria-hidden="true" size={16} strokeWidth={2} />
                    <span>{messages.url}</span>
                  </button>
                  <button
                    className="toolbar-menu-button toolbar-menu-mobile-action"
                    onClick={() => runAction(activateFolder)}
                    type="button"
                  >
                    <FolderOpen aria-hidden="true" size={16} strokeWidth={2} />
                    <span>{messages.openFolder}</span>
                  </button>
                </>
              ) : null}
              <button className="toolbar-menu-button" onClick={() => runAction(activateFolder)} type="button">
                <FolderOpen aria-hidden="true" size={16} strokeWidth={2} />
                <span>{messages.openFolder}</span>
              </button>
              <button className="toolbar-menu-button" onClick={() => runAction(onSaveToDisk)} type="button">
                <Save aria-hidden="true" size={16} strokeWidth={2} />
                <span>{messages.saveToDisk}</span>
              </button>
              <button className="toolbar-menu-button" onClick={() => runAction(onExportHtml)} type="button">
                {messages.exportHtml}
              </button>
              <button className="toolbar-menu-button" onClick={() => runAction(onExportPdf)} type="button">
                {messages.exportPdf}
              </button>
            </div>
          </>
        ) : null}
      </div>
      {compact && showImportActions && urlDialogOpen ? (
        <div className="toolbar-url-dialog-backdrop" role="presentation" onClick={() => setUrlDialogOpen(false)}>
          <div
            aria-label={messages.sourceUrlLabel}
            aria-modal="true"
            className="toolbar-url-dialog"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="toolbar-url-dialog-header">
              <span>{messages.url}</span>
              <button
                aria-label="Close"
                className="toolbar-url-dialog-close"
                onClick={() => setUrlDialogOpen(false)}
                type="button"
              >
                <X aria-hidden="true" size={18} strokeWidth={2} />
              </button>
            </div>
            <div className="toolbar-url-dialog-row">
              <input
                aria-label={messages.sourceUrlLabel}
                className="input input--compact toolbar-url-input"
                onChange={(event) => onSourceChange(event.currentTarget.value)}
                placeholder="https://github.com/acme/repo/blob/main/README.md"
                ref={urlInputRef}
                value={sourceValue}
              />
              <button className="toolbar-button" onClick={parseUrlSource} type="button">
                {messages.open}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
