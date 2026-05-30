"use client";

import { FileText, FolderOpen, Plus, RefreshCw, Search, X } from "lucide-react";
import { type CSSProperties, type ReactNode, useMemo } from "react";
import type { WorkspaceMessages } from "@/lib/i18n/messages";
import { getFolderPathDirectory, getFolderPathName } from "@/lib/workspace/folder-paths";
import type { FolderFileEntry } from "@/lib/workspace/folder-scan";

type FolderRailProps = {
  activePath?: string;
  files: FolderFileEntry[];
  messages: WorkspaceMessages["folder"];
  partial: boolean;
  rootName: string;
  searchOpen: boolean;
  searchQuery: string;
  selectedDirectory: string;
  skippedCount: number;
  topControls?: ReactNode;
  onNewFile: () => void;
  onOpenFile: (path: string) => void;
  onReconnect: () => void;
  onSearchOpenChange: (open: boolean) => void;
  onSearchQueryChange: (query: string) => void;
};

function getDepth(path: string) {
  return Math.max(path.split("/").filter(Boolean).length - 1, 0);
}

function compareFiles(a: FolderFileEntry, b: FolderFileEntry) {
  const directoryCompare = getFolderPathDirectory(a.path).localeCompare(getFolderPathDirectory(b.path));

  if (directoryCompare !== 0) {
    return directoryCompare;
  }

  return a.name.localeCompare(b.name);
}

export function FolderRail({
  activePath,
  files,
  messages,
  partial,
  rootName,
  searchOpen,
  searchQuery,
  selectedDirectory,
  skippedCount,
  topControls,
  onNewFile,
  onOpenFile,
  onReconnect,
  onSearchOpenChange,
  onSearchQueryChange
}: FolderRailProps) {
  const sortedFiles = useMemo(() => [...files].sort(compareFiles), [files]);
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return sortedFiles.slice(0, 20);
    }

    return sortedFiles
      .filter((file) => file.path.toLowerCase().includes(query) || file.name.toLowerCase().includes(query))
      .slice(0, 30);
  }, [searchQuery, sortedFiles]);

  return (
    <aside className="workspace-tabs-rail workspace-folder-rail" aria-label={messages.railLabel}>
      {topControls}
      <div className="workspace-folder-rail-header">
        <div className="workspace-folder-title-row">
          <FolderOpen aria-hidden="true" size={17} strokeWidth={2} />
          <span className="workspace-folder-title" title={rootName}>
            {rootName}
          </span>
        </div>
        <div className="workspace-folder-actions">
          <button
            aria-label={messages.search}
            className="workspace-folder-action"
            onClick={() => onSearchOpenChange(true)}
            title={messages.search}
            type="button"
          >
            <Search aria-hidden="true" size={16} strokeWidth={2} />
          </button>
          <button
            aria-label={messages.newFile}
            className="workspace-folder-action"
            onClick={onNewFile}
            title={messages.newFileIn(selectedDirectory)}
            type="button"
          >
            <Plus aria-hidden="true" size={17} strokeWidth={2} />
          </button>
          <button
            aria-label={messages.reconnect}
            className="workspace-folder-action"
            onClick={onReconnect}
            title={messages.reconnect}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
      {partial ? (
        <div className="workspace-folder-notice">
          {messages.partial(skippedCount)}
        </div>
      ) : null}
      <div className="workspace-folder-file-list" role="tree">
        {sortedFiles.map((file) => (
          <button
            aria-selected={file.path === activePath}
            className="workspace-folder-file"
            data-active={file.path === activePath}
            key={file.path}
            onClick={() => onOpenFile(file.path)}
            role="treeitem"
            style={{ "--folder-depth": getDepth(file.path) } as CSSProperties}
            title={file.path}
            type="button"
          >
            <FileText aria-hidden="true" size={15} strokeWidth={2} />
            <span>{getFolderPathName(file.path)}</span>
          </button>
        ))}
      </div>
      {searchOpen ? (
        <div className="workspace-folder-search-backdrop" role="presentation" onClick={() => onSearchOpenChange(false)}>
          <div
            aria-label={messages.search}
            aria-modal="true"
            className="workspace-folder-search"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="workspace-folder-search-header">
              <Search aria-hidden="true" size={16} strokeWidth={2} />
              <input
                aria-label={messages.searchInput}
                autoFocus
                className="workspace-folder-search-input"
                onChange={(event) => onSearchQueryChange(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    onSearchOpenChange(false);
                  }
                }}
                placeholder={messages.searchPlaceholder}
                value={searchQuery}
              />
              <button
                aria-label={messages.closeSearch}
                className="workspace-folder-action"
                onClick={() => onSearchOpenChange(false)}
                type="button"
              >
                <X aria-hidden="true" size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="workspace-folder-search-results">
              {searchResults.map((file) => (
                <button
                  className="workspace-folder-search-result"
                  key={file.path}
                  onClick={() => {
                    onOpenFile(file.path);
                    onSearchOpenChange(false);
                  }}
                  type="button"
                >
                  <span>{file.name}</span>
                  <small>{file.path}</small>
                </button>
              ))}
              {searchResults.length === 0 ? (
                <div className="workspace-folder-empty">{messages.noSearchResults}</div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
