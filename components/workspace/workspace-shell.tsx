"use client";

import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { BrandLink } from "@/components/brand/brand-link";
import { createMarkdownShare } from "@/lib/share/share-codec";
import { exportMarkdownHtml } from "@/lib/workspace/export-html";
import { loadMarkdownSourceViaApi, LoadedMarkdownSource } from "@/lib/workspace/load-markdown-source";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { OutlinePanel } from "@/components/workspace/outline-panel";
import { EditorPresentationMode, SourcePanel, SourcePanelMode } from "@/components/workspace/source-panel";
import {
  getWorkspacePreviewFontStack,
  isWorkspacePreviewFont,
  WorkspacePreviewTypographyControls,
  type WorkspacePreviewFont
} from "@/components/workspace/workspace-preview-typography-controls";
import { WorkspaceThemeSelector } from "@/components/workspace/workspace-theme-selector";
import { WorkspaceToolbar } from "@/components/workspace/workspace-toolbar";
import { extractHeadings } from "@/lib/markdown/extract-headings";
import { parsePendingWorkspaceImport, pendingWorkspaceImportKey } from "@/lib/workspace/pending-import";
import { defaultWorkspaceTheme, isWorkspaceTheme, type WorkspaceTheme } from "@/lib/workspace/themes";

type WorkspaceMode = "preview" | "split" | "editor";

type WorkspaceShellProps = {
  sourceInput: string;
  markdown: string;
  mode?: WorkspaceMode;
  initialStatusMessage?: string;
  loadSource?: (input: string) => Promise<LoadedMarkdownSource>;
};

type PreviewSourcePositionTarget = {
  element: HTMLElement;
  endLine: number;
  startLine: number;
};

type PaneScrollPair = {
  source: HTMLElement;
  target: HTMLElement;
};

const workspaceDraftStorageKey = "markdownviewer.workspace.current";
const workspacePreviewFontStorageKey = "markdownviewer.workspace.preview.font";
const workspacePreviewFontSizeStorageKey = "markdownviewer.workspace.preview.fontSize";
const workspaceSplitStorageKey = "markdownviewer.workspace.split";
const splitMinPercent = 28;
const splitMaxPercent = 72;
const defaultPreviewFont: WorkspacePreviewFont = "system";
const defaultPreviewFontSize = 15;
const minPreviewFontSize = 13;
const maxPreviewFontSize = 21;

function clampSplitPercent(value: number) {
  return Math.min(Math.max(value, splitMinPercent), splitMaxPercent);
}

function clampPreviewFontSize(value: number) {
  return Math.min(Math.max(Math.round(value), minPreviewFontSize), maxPreviewFontSize);
}

function deriveDocumentTitle(markdown: string, sourceInput: string, headings: ReturnType<typeof extractHeadings>) {
  if (headings[0]?.text) {
    return headings[0].text;
  }

  if (sourceInput.startsWith("file:")) {
    return sourceInput.replace(/^file:/, "");
  }

  if (sourceInput) {
    try {
      return new URL(sourceInput).pathname.split("/").filter(Boolean).at(-1) ?? "Untitled document";
    } catch {
      return "Untitled document";
    }
  }

  const firstLine = markdown.split("\n").find((line) => line.trim().length > 0);

  return firstLine ? firstLine.replace(/^#+\s*/, "").trim() : "Untitled document";
}

function describeSource(sourceInput: string) {
  if (!sourceInput) {
    return undefined;
  }

  if (sourceInput.startsWith("file:")) {
    return sourceInput.replace(/^file:/, "");
  }

  try {
    const url = new URL(sourceInput);

    if (url.hostname.includes("github.com")) {
      return "GitHub";
    }

    if (url.hostname.includes("gist.github.com")) {
      return "Gist";
    }

    return url.hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function deriveImportMode(sourceInput: string): SourcePanelMode {
  if (sourceInput.startsWith("file:")) {
    return "file";
  }

  if (sourceInput) {
    return "url";
  }

  return "paste";
}

function buildMarkdownLineStarts(markdown: string) {
  const starts = [0];

  for (let index = 0; index < markdown.length; index += 1) {
    if (markdown[index] === "\n") {
      starts.push(index + 1);
    }
  }

  return starts;
}

function getMarkdownLineForOffset(lineStarts: number[], offset: number) {
  if (offset <= 0 || lineStarts.length === 0) {
    return 1;
  }

  let lower = 0;
  let upper = lineStarts.length - 1;
  let matchedLineIndex = 0;

  while (lower <= upper) {
    const middle = Math.floor((lower + upper) / 2);

    if (lineStarts[middle] <= offset) {
      matchedLineIndex = middle;
      lower = middle + 1;
    } else {
      upper = middle - 1;
    }
  }

  return matchedLineIndex + 1;
}

function parseSourceLineRange(sourcePosition: string | null) {
  if (!sourcePosition) {
    return null;
  }

  const match = /^(\d+):\d+-(\d+):\d+$/.exec(sourcePosition);

  if (!match) {
    return null;
  }

  return {
    startLine: Number.parseInt(match[1], 10),
    endLine: Number.parseInt(match[2], 10)
  };
}

function findPreviewTargetById(preview: HTMLDivElement | null, id: string) {
  if (!preview) {
    return null;
  }

  return Array.from(preview.querySelectorAll<HTMLElement>("[id]")).find((element) => element.id === id) ?? null;
}

function buildPreviewSourcePositionTargets(preview: HTMLDivElement | null) {
  if (!preview) {
    return [];
  }

  return Array.from(preview.querySelectorAll<HTMLElement>("[data-sourcepos]")).reduce<PreviewSourcePositionTarget[]>(
    (targets, element) => {
      const lineRange = parseSourceLineRange(element.getAttribute("data-sourcepos"));

      if (lineRange) {
        targets.push({
          element,
          startLine: lineRange.startLine,
          endLine: lineRange.endLine
        });
      }

      return targets;
    },
    []
  );
}

function findPreviewSourcePositionTarget(targets: PreviewSourcePositionTarget[], sourceLine: number) {
  let anchor: PreviewSourcePositionTarget | null = null;
  let anchorLineSpan = Number.POSITIVE_INFINITY;
  let nearestBefore: PreviewSourcePositionTarget | null = null;
  let firstAfter: PreviewSourcePositionTarget | null = null;

  for (const target of targets) {
    if (sourceLine >= target.startLine && sourceLine <= target.endLine) {
      const lineSpan = target.endLine - target.startLine;

      if (lineSpan <= anchorLineSpan) {
        anchor = target;
        anchorLineSpan = lineSpan;
      }

      continue;
    }

    if (target.startLine <= sourceLine) {
      nearestBefore = target;
      continue;
    }

    if (!firstAfter) {
      firstAfter = target;
    }

    break;
  }

  return anchor ?? nearestBefore ?? firstAfter;
}

export function WorkspaceShell({
  sourceInput,
  markdown,
  mode = "split",
  initialStatusMessage,
  loadSource = loadMarkdownSourceViaApi
}: WorkspaceShellProps) {
  const [currentMarkdown, setCurrentMarkdown] = useState(markdown);
  const [currentSource, setCurrentSource] = useState(sourceInput);
  const [currentMode, setCurrentMode] = useState<WorkspaceMode>(mode);
  const [theme, setTheme] = useState<WorkspaceTheme>(defaultWorkspaceTheme);
  const [statusMessage, setStatusMessage] = useState<string | undefined>(initialStatusMessage);
  const [activeImportMode, setActiveImportMode] = useState<SourcePanelMode>(deriveImportMode(sourceInput));
  const [editorPresentationMode, setEditorPresentationMode] = useState<EditorPresentationMode>("rich");
  const [previewFont, setPreviewFont] = useState<WorkspacePreviewFont>(defaultPreviewFont);
  const [previewFontSize, setPreviewFontSize] = useState(defaultPreviewFontSize);
  const [splitEditorPercent, setSplitEditorPercent] = useState(50);
  const [splitResizing, setSplitResizing] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const lastEditorSelectionStartRef = useRef(0);
  const suppressPreviewScrollSyncRef = useRef(false);
  const suppressPreviewScrollSyncTimerRef = useRef<number | null>(null);
  const syncPreviewAfterEditorChangeRef = useRef(false);
  const previewSourcePositionTargetsRef = useRef<PreviewSourcePositionTarget[]>([]);
  const paneScrollFrameRef = useRef<number | null>(null);
  const pendingPaneScrollRef = useRef<PaneScrollPair | null>(null);
  const lineStartsCacheRef = useRef({
    markdown: "",
    starts: [0]
  });
  const latestMarkdownRef = useRef(currentMarkdown);
  const previewMarkdown = useDeferredValue(currentMarkdown);
  const headings = useMemo(() => extractHeadings(previewMarkdown), [previewMarkdown]);
  const hasHeadings = headings.length > 0;
  const documentTitle = useMemo(
    () => deriveDocumentTitle(previewMarkdown, currentSource, headings),
    [currentSource, headings, previewMarkdown]
  );
  const sourceLabel = useMemo(() => describeSource(currentSource), [currentSource]);
  const workspaceGridStyle =
    currentMode === "split"
      ? ({
          "--workspace-editor-fr": `${splitEditorPercent}fr`,
          "--workspace-preview-fr": `${100 - splitEditorPercent}fr`
        } as CSSProperties)
      : undefined;
  const previewReaderStyle = {
    "--workspace-preview-font-family": getWorkspacePreviewFontStack(previewFont),
    "--workspace-preview-font-size": `${previewFontSize}px`
  } as CSSProperties;

  useEffect(() => {
    latestMarkdownRef.current = currentMarkdown;
  }, [currentMarkdown]);

  useEffect(() => {
    const saveDraft = () => {
      window.localStorage.setItem(workspaceDraftStorageKey, latestMarkdownRef.current);
    };

    window.addEventListener("pagehide", saveDraft);

    return () => {
      saveDraft();
      window.removeEventListener("pagehide", saveDraft);
    };
  }, []);

  useEffect(() => {
    const saveTimer = window.setTimeout(() => {
      window.localStorage.setItem(workspaceDraftStorageKey, currentMarkdown);
    }, 320);

    return () => {
      window.clearTimeout(saveTimer);
    };
  }, [currentMarkdown]);

  useEffect(() => {
    setCurrentMarkdown(markdown);
  }, [markdown]);

  useEffect(() => {
    const storedTheme =
      window.localStorage.getItem("markdownviewer.workspace.template") ??
      window.localStorage.getItem("markdownviewer.workspace.theme");
    const storedSplitPercent = Number.parseFloat(window.localStorage.getItem(workspaceSplitStorageKey) ?? "");
    const storedPreviewFont = window.localStorage.getItem(workspacePreviewFontStorageKey);
    const storedPreviewFontSize = Number.parseFloat(window.localStorage.getItem(workspacePreviewFontSizeStorageKey) ?? "");

    if (isWorkspaceTheme(storedTheme)) {
      setTheme(storedTheme);
    }

    if (Number.isFinite(storedSplitPercent)) {
      setSplitEditorPercent(clampSplitPercent(storedSplitPercent));
    }

    if (isWorkspacePreviewFont(storedPreviewFont)) {
      setPreviewFont(storedPreviewFont);
    }

    if (Number.isFinite(storedPreviewFontSize)) {
      setPreviewFontSize(clampPreviewFontSize(storedPreviewFontSize));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(workspaceSplitStorageKey, String(Math.round(splitEditorPercent)));
  }, [splitEditorPercent]);

  useEffect(() => {
    window.localStorage.setItem(workspacePreviewFontStorageKey, previewFont);
  }, [previewFont]);

  useEffect(() => {
    window.localStorage.setItem(workspacePreviewFontSizeStorageKey, String(previewFontSize));
  }, [previewFontSize]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("markdownviewer.workspace.template", theme);
    window.localStorage.setItem("markdownviewer.workspace.theme", theme);
  }, [theme]);

  useEffect(() => {
    setCurrentSource(sourceInput);
    setActiveImportMode(deriveImportMode(sourceInput));
  }, [sourceInput]);

  useEffect(() => {
    setStatusMessage(initialStatusMessage);
  }, [initialStatusMessage]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("import") !== "file") {
      return;
    }

    const pendingImport = parsePendingWorkspaceImport(
      window.localStorage.getItem(pendingWorkspaceImportKey)
    );

    window.localStorage.removeItem(pendingWorkspaceImportKey);

    if (!pendingImport) {
      setStatusMessage("Could not open the selected file.");
      return;
    }

    setActiveImportMode("file");
    setCurrentSource(pendingImport.sourceInput);
    setCurrentMarkdown(pendingImport.markdown);
    setStatusMessage(pendingImport.statusMessage ?? "Loaded Markdown file.");
  }, []);

  useEffect(() => {
    return () => {
      if (suppressPreviewScrollSyncTimerRef.current !== null) {
        window.clearTimeout(suppressPreviewScrollSyncTimerRef.current);
      }

      if (paneScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(paneScrollFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!splitResizing) {
      return;
    }

    document.body.classList.add("workspace-is-resizing");

    return () => {
      document.body.classList.remove("workspace-is-resizing");
    };
  }, [splitResizing]);

  useLayoutEffect(() => {
    previewSourcePositionTargetsRef.current = buildPreviewSourcePositionTargets(previewRef.current);
  }, [currentMode, previewMarkdown]);

  useLayoutEffect(() => {
    if (!syncPreviewAfterEditorChangeRef.current) {
      return;
    }

    syncPreviewAfterEditorChangeRef.current = false;

    const editor = editorRef.current;
    const preview = previewRef.current;

    if (!editor || !preview) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      syncPreviewToSourceLine(getCurrentMarkdownLineForOffset(lastEditorSelectionStartRef.current), editor);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [previewMarkdown, currentMode]);

  function readFileContents(file: File) {
    if (typeof file.text === "function") {
      return file.text();
    }

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Failed to read the selected file."));
      reader.readAsText(file);
    });
  }

  async function handleParseSource() {
    try {
      const result = await loadSource(currentSource);

      setActiveImportMode("url");
      setCurrentMarkdown(result.markdown);
      setStatusMessage(`Loaded ${result.label}.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to load Markdown.");
    }
  }

  async function handleFileImport(file: File) {
    const nextMarkdown = await readFileContents(file);

    setActiveImportMode("file");
    setCurrentSource(`file:${file.name}`);
    setCurrentMarkdown(nextMarkdown);
    setStatusMessage(`Loaded ${file.name}.`);
  }

  async function handlePasteIntoEditor() {
    try {
      const pasted = await navigator.clipboard.readText();

      setActiveImportMode("paste");

      if (pasted) {
        setCurrentMarkdown(pasted);
        setStatusMessage("Pasted Markdown.");
      }
    } catch {
      setStatusMessage("Clipboard paste requires browser permission.");
    }
  }

  function handleExportHtml() {
    const previewMarkup = previewRef.current?.innerHTML ?? "";
    const firstHeading = headings[0]?.text ?? "Markdown Document";

    exportMarkdownHtml(previewMarkup, firstHeading, theme);
    setStatusMessage("Exported HTML.");
  }

  function handleExportPdf() {
    window.print();
    setStatusMessage("Opened print dialog.");
  }

  async function handleShare() {
    const share = createMarkdownShare(currentMarkdown);

    if (!share.ok) {
      setStatusMessage(share.error);
      return;
    }

    const shareId = share.id;
    const shareUrl = `${window.location.origin}/share/${shareId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatusMessage("Link copied.");
    } catch {
      setStatusMessage(shareUrl);
    }
  }

  function getCurrentMarkdownLineForOffset(offset: number) {
    if (lineStartsCacheRef.current.markdown !== currentMarkdown) {
      lineStartsCacheRef.current = {
        markdown: currentMarkdown,
        starts: buildMarkdownLineStarts(currentMarkdown)
      };
    }

    return getMarkdownLineForOffset(lineStartsCacheRef.current.starts, offset);
  }

  function applyPaneScroll(source: HTMLElement, target: HTMLElement) {
    if (currentMode !== "split" || !target) {
      return;
    }

    if (!source.isConnected || !target.isConnected) {
      return;
    }

    const sourceMax = Math.max(source.scrollHeight - source.clientHeight, 0);
    const targetMax = Math.max(target.scrollHeight - target.clientHeight, 0);
    const nextScrollTop = sourceMax === 0 ? 0 : Math.round((source.scrollTop / sourceMax) * targetMax);

    if (target.scrollTop !== nextScrollTop) {
      target.scrollTop = nextScrollTop;
    }
  }

  function syncPaneScroll(source: HTMLElement, target: HTMLElement | null) {
    if (currentMode !== "split" || !target) {
      return;
    }

    pendingPaneScrollRef.current = { source, target };

    if (paneScrollFrameRef.current !== null) {
      return;
    }

    paneScrollFrameRef.current = window.requestAnimationFrame(() => {
      paneScrollFrameRef.current = null;

      const pendingPaneScroll = pendingPaneScrollRef.current;
      pendingPaneScrollRef.current = null;

      if (pendingPaneScroll) {
        applyPaneScroll(pendingPaneScroll.source, pendingPaneScroll.target);
      }
    });
  }

  function updateSplitFromClientX(clientX: number) {
    const grid = gridRef.current;

    if (!grid) {
      return;
    }

    const rect = grid.getBoundingClientRect();

    if (rect.width <= 0) {
      return;
    }

    setSplitEditorPercent(clampSplitPercent(((clientX - rect.left) / rect.width) * 100));
  }

  function handleSplitResizePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    updateSplitFromClientX(event.clientX);
    setSplitResizing(true);
  }

  function handleSplitResizeKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 8 : 4;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSplitEditorPercent((current) => clampSplitPercent(current - step));
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setSplitEditorPercent((current) => clampSplitPercent(current + step));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setSplitEditorPercent(splitMinPercent);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setSplitEditorPercent(splitMaxPercent);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      setSplitEditorPercent(50);
    }
  }

  useEffect(() => {
    if (!splitResizing) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      updateSplitFromClientX(event.clientX);
    }

    function stopResizing() {
      setSplitResizing(false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing);
    window.addEventListener("pointercancel", stopResizing);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
      window.removeEventListener("pointercancel", stopResizing);
    };
  }, [splitResizing]);

  function suppressPreviewScrollSyncOnce() {
    if (suppressPreviewScrollSyncTimerRef.current !== null) {
      window.clearTimeout(suppressPreviewScrollSyncTimerRef.current);
    }

    suppressPreviewScrollSyncRef.current = true;
    suppressPreviewScrollSyncTimerRef.current = window.setTimeout(() => {
      suppressPreviewScrollSyncRef.current = false;
      suppressPreviewScrollSyncTimerRef.current = null;
    }, 90);
  }

  function syncPreviewToSourceLine(sourceLine: number, fallbackSource?: HTMLElement | null) {
    if (currentMode !== "split") {
      return;
    }

    const preview = previewRef.current;

    if (!preview) {
      return;
    }

    if (previewSourcePositionTargetsRef.current.length === 0) {
      previewSourcePositionTargetsRef.current = buildPreviewSourcePositionTargets(preview);
    }

    const anchor = findPreviewSourcePositionTarget(previewSourcePositionTargetsRef.current, sourceLine)?.element ?? null;

    if (!anchor) {
      if (fallbackSource) {
        syncPaneScroll(fallbackSource, preview);
      }

      return;
    }

    const previewRect = preview.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const anchorTop = anchorRect.top - previewRect.top + preview.scrollTop;
    const nextScrollTop = Math.max(Math.round(anchorTop - preview.clientHeight * 0.24), 0);

    if (Math.abs(preview.scrollTop - nextScrollTop) < 16) {
      return;
    }

    suppressPreviewScrollSyncOnce();
    preview.scrollTop = nextScrollTop;
  }

  function handleEditorMarkdownChange(nextMarkdown: string) {
    syncPreviewAfterEditorChangeRef.current = true;
    setCurrentMarkdown(nextMarkdown);
  }

  function handleEditorSelectionChange(selectionStart: number) {
    lastEditorSelectionStartRef.current = selectionStart;
  }

  function handleEditorKeyboardNavigation(selectionStart: number, sourceElement: HTMLElement) {
    lastEditorSelectionStartRef.current = selectionStart;
    syncPreviewToSourceLine(getCurrentMarkdownLineForOffset(selectionStart), sourceElement);
  }

  function handleTocNavigate(id: string) {
    const preview = previewRef.current;
    const target = findPreviewTargetById(preview, id) ?? document.getElementById(id);

    if (!target) {
      return;
    }

    if (preview && preview.contains(target)) {
      const previewRect = preview.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const nextScrollTop = Math.max(targetRect.top - previewRect.top + preview.scrollTop - 12, 0);

      if (typeof preview.scrollTo === "function") {
        preview.scrollTo({
          top: nextScrollTop,
          behavior: "smooth"
        });
      } else {
        preview.scrollTop = nextScrollTop;
      }
    } else if (typeof target.scrollIntoView === "function") {
      target.scrollIntoView({
        block: "start",
        behavior: "smooth"
      });
    }

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
  }

  return (
    <div className="workspace-page page-shell">
      <section className="workspace-shell-card">
        <div className="workspace-header">
          <div className="workspace-header-meta">
            <BrandLink
              ariaLabel="Markdownviewer home"
              className="workspace-home"
              compact
              title="Markdownviewer"
            />
            <div className="workspace-document-chip" title={documentTitle}>
              {documentTitle}
            </div>
            {sourceLabel ? <div className="workspace-source-chip">{sourceLabel}</div> : null}
          </div>
          <WorkspaceToolbar
            activeImportMode={activeImportMode}
            mode={currentMode}
            onExportHtml={handleExportHtml}
            onExportPdf={handleExportPdf}
            onActiveImportModeChange={setActiveImportMode}
            onFileImport={handleFileImport}
            onModeChange={setCurrentMode}
            onParseSource={handleParseSource}
            onPasteIntoEditor={handlePasteIntoEditor}
            onShare={handleShare}
            onSourceChange={setCurrentSource}
            sourceValue={currentSource}
          />
        </div>
        {statusMessage ? <p aria-live="polite" className="sr-only" role="status">{statusMessage}</p> : null}
        <div
          className="workspace-grid"
          data-mode={currentMode}
          data-resizing={splitResizing}
          data-testid="workspace-grid"
          ref={gridRef}
          style={workspaceGridStyle}
        >
          {currentMode !== "preview" ? (
            <SourcePanel
              editorPresentationMode={editorPresentationMode}
              editorRef={editorRef}
              markdown={currentMarkdown}
              onEditorPresentationModeChange={setEditorPresentationMode}
              onEditorKeyboardNavigation={handleEditorKeyboardNavigation}
              onEditorSelectionChange={handleEditorSelectionChange}
              onEditorScroll={(element) => {
                syncPaneScroll(element, previewRef.current);
              }}
              onMarkdownChange={handleEditorMarkdownChange}
              visible
            />
          ) : null}
          {currentMode === "split" ? (
            <div
              aria-label="Resize editor and preview panes"
              aria-orientation="vertical"
              aria-valuemax={splitMaxPercent}
              aria-valuemin={splitMinPercent}
              aria-valuenow={Math.round(splitEditorPercent)}
              className="workspace-split-resizer"
              data-testid="workspace-split-resizer"
              onDoubleClick={() => setSplitEditorPercent(50)}
              onKeyDown={handleSplitResizeKeyDown}
              onPointerDown={handleSplitResizePointerDown}
              role="separator"
              tabIndex={0}
              title="Drag to resize editor and preview"
            >
              <span aria-hidden="true" />
            </div>
          ) : null}
          {currentMode !== "editor" ? (
            <section
              className="workspace-card workspace-pane workspace-pane--preview workspace-preview-shell"
              data-testid="preview-panel"
              data-visible
            >
              <div className="workspace-pane-header workspace-pane-header--preview">
                <div className="workspace-preview-header-controls">
                  <WorkspaceThemeSelector onThemeChange={setTheme} theme={theme} />
                  <WorkspacePreviewTypographyControls
                    font={previewFont}
                    fontSize={previewFontSize}
                    maxFontSize={maxPreviewFontSize}
                    minFontSize={minPreviewFontSize}
                    onFontChange={setPreviewFont}
                    onFontSizeChange={(nextFontSize) => setPreviewFontSize(clampPreviewFontSize(nextFontSize))}
                  />
                </div>
                {hasHeadings ? (
                  <OutlinePanel
                    documentTitle={documentTitle}
                    headings={headings}
                    onNavigate={handleTocNavigate}
                    onToggle={() => setTocOpen((current) => !current)}
                    open={tocOpen}
                  />
                ) : (
                  <div className="workspace-pane-header-spacer" />
                )}
              </div>
              <div
                className="workspace-reader-body"
                data-testid="preview-scroll-region"
                onScroll={(event) => {
                  if (suppressPreviewScrollSyncRef.current) {
                    return;
                  }

                  syncPaneScroll(event.currentTarget, editorRef.current);
                }}
                ref={previewRef}
                style={previewReaderStyle}
              >
                <MarkdownRenderer markdown={previewMarkdown} />
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}
