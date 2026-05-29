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
import { defaultLocale, localizePath, type Locale } from "@/lib/i18n/locales";
import { getMessages, type WorkspaceMessages } from "@/lib/i18n/messages";
import { extractHeadings } from "@/lib/markdown/extract-headings";
import { parsePendingWorkspaceImport, pendingWorkspaceImportKey } from "@/lib/workspace/pending-import";
import { defaultWorkspaceTheme, isWorkspaceTheme, type WorkspaceTheme } from "@/lib/workspace/themes";

type WorkspaceMode = "preview" | "split" | "editor";

type WorkspaceShellProps = {
  sourceInput: string;
  markdown: string;
  mode?: WorkspaceMode;
  initialStatusMessage?: string;
  locale?: Locale;
  loadSource?: (input: string) => Promise<LoadedMarkdownSource>;
  tabRestoreStrategy?: WorkspaceTabRestoreStrategy;
};

type WorkspaceTabRestoreStrategy = "restore" | "merge";

type WorkspaceTab = {
  createdAt: number;
  id: string;
  markdown: string;
  sourceInput: string;
  updatedAt: number;
};

type StoredWorkspaceTabs = {
  activeTabId: string;
  tabs: WorkspaceTab[];
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
const workspaceTabsCollapsedStorageKey = "markdownviewer.workspace.tabs.collapsed";
const workspaceTabsStorageKey = "markdownviewer.workspace.tabs.v1";
const workspaceTabsStorageVersion = 1;
const initialWorkspaceTabId = "workspace-tab-initial";
const maxStoredWorkspaceTabs = 24;
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

function deriveDocumentTitle(
  markdown: string,
  sourceInput: string,
  headings: ReturnType<typeof extractHeadings>,
  messages: WorkspaceMessages
) {
  if (headings[0]?.text) {
    return headings[0].text;
  }

  if (sourceInput.startsWith("file:")) {
    return sourceInput.replace(/^file:/, "");
  }

  if (sourceInput) {
    try {
      return new URL(sourceInput).pathname.split("/").filter(Boolean).at(-1) ?? messages.document.untitled;
    } catch {
      return messages.document.untitled;
    }
  }

  const firstLine = markdown.split("\n").find((line) => line.trim().length > 0);

  return firstLine ? firstLine.replace(/^#+\s*/, "").trim() : messages.document.untitled;
}

function createWorkspaceTabId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `workspace-tab-${crypto.randomUUID()}`;
  }

  return `workspace-tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createWorkspaceTab(markdown = "", sourceInput = "", id = createWorkspaceTabId()): WorkspaceTab {
  const now = Date.now();

  return {
    createdAt: now,
    id,
    markdown,
    sourceInput,
    updatedAt: now
  };
}

function createInitialWorkspaceTab(markdown: string, sourceInput: string) {
  return createWorkspaceTab(markdown, sourceInput, initialWorkspaceTabId);
}

function normalizeStoredWorkspaceTab(value: unknown, index: number): WorkspaceTab | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const markdown = typeof record.markdown === "string" ? record.markdown : null;

  if (markdown === null) {
    return null;
  }

  const id = typeof record.id === "string" && record.id ? record.id : `stored-workspace-tab-${index + 1}`;
  const sourceInput = typeof record.sourceInput === "string" ? record.sourceInput : "";
  const createdAt = typeof record.createdAt === "number" && Number.isFinite(record.createdAt)
    ? record.createdAt
    : Date.now();
  const updatedAt = typeof record.updatedAt === "number" && Number.isFinite(record.updatedAt)
    ? record.updatedAt
    : createdAt;

  return {
    createdAt,
    id,
    markdown,
    sourceInput,
    updatedAt
  };
}

function parseStoredWorkspaceTabs(value: string | null): StoredWorkspaceTabs | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const rawTabs = Array.isArray(parsed.tabs) ? parsed.tabs : [];
    const seenIds = new Set<string>();
    const tabs = rawTabs
      .map((tab, index) => normalizeStoredWorkspaceTab(tab, index))
      .filter((tab): tab is WorkspaceTab => Boolean(tab))
      .map((tab, index) => {
        if (!seenIds.has(tab.id)) {
          seenIds.add(tab.id);
          return tab;
        }

        const dedupedId = `${tab.id}-${index + 1}`;
        seenIds.add(dedupedId);
        return {
          ...tab,
          id: dedupedId
        };
      })
      .slice(0, maxStoredWorkspaceTabs);

    if (tabs.length === 0) {
      return null;
    }

    const activeTabId =
      typeof parsed.activeTabId === "string" && tabs.some((tab) => tab.id === parsed.activeTabId)
        ? parsed.activeTabId
        : tabs[0].id;

    return {
      activeTabId,
      tabs
    };
  } catch {
    return null;
  }
}

function readStoredWorkspaceTabs() {
  return parseStoredWorkspaceTabs(window.localStorage.getItem(workspaceTabsStorageKey));
}

function getActiveWorkspaceTabsSnapshot(
  tabs: WorkspaceTab[],
  activeTabId: string,
  markdown: string,
  sourceInput: string
) {
  return tabs.map((tab) => {
    if (tab.id !== activeTabId) {
      return tab;
    }

    return {
      ...tab,
      markdown,
      sourceInput,
      updatedAt: Date.now()
    };
  });
}

function writeStoredWorkspaceTabs(tabs: WorkspaceTab[], activeTabId: string) {
  const normalizedTabs = tabs.slice(0, maxStoredWorkspaceTabs);
  const normalizedActiveTabId = normalizedTabs.some((tab) => tab.id === activeTabId)
    ? activeTabId
    : normalizedTabs[0]?.id;

  if (!normalizedActiveTabId) {
    return;
  }

  window.localStorage.setItem(
    workspaceTabsStorageKey,
    JSON.stringify({
      version: workspaceTabsStorageVersion,
      activeTabId: normalizedActiveTabId,
      tabs: normalizedTabs
    })
  );
}

function getWorkspaceTabTitle(tab: Pick<WorkspaceTab, "markdown" | "sourceInput">, messages: WorkspaceMessages) {
  return deriveDocumentTitle(tab.markdown, tab.sourceInput, extractHeadings(tab.markdown), messages);
}

function getWorkspaceTabSourceLabel(tab: Pick<WorkspaceTab, "sourceInput">, messages: WorkspaceMessages) {
  return describeSource(tab.sourceInput) ?? messages.document.localDraft;
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
  locale = defaultLocale,
  loadSource = loadMarkdownSourceViaApi,
  tabRestoreStrategy = "restore"
}: WorkspaceShellProps) {
  const messages = getMessages(locale).workspace;
  const [tabs, setTabs] = useState<WorkspaceTab[]>(() => [createInitialWorkspaceTab(markdown, sourceInput)]);
  const [activeTabId, setActiveTabId] = useState(initialWorkspaceTabId);
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
  const [tabsCollapsed, setTabsCollapsed] = useState(false);
  const [tabsStorageReady, setTabsStorageReady] = useState(false);
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
  const tabsRef = useRef(tabs);
  const activeTabIdRef = useRef(activeTabId);
  const restoredStoredTabsRef = useRef(false);
  const lineStartsCacheRef = useRef({
    markdown: "",
    starts: [0]
  });
  const latestMarkdownRef = useRef(currentMarkdown);
  const latestSourceRef = useRef(currentSource);
  const previewMarkdown = useDeferredValue(currentMarkdown);
  const headings = useMemo(() => extractHeadings(previewMarkdown), [previewMarkdown]);
  const hasHeadings = headings.length > 0;
  const documentTitle = useMemo(
    () => deriveDocumentTitle(previewMarkdown, currentSource, headings, messages),
    [currentSource, headings, messages, previewMarkdown]
  );
  const sourceLabel = useMemo(() => describeSource(currentSource), [currentSource]);
  const tabItems = useMemo(
    () =>
      tabs.map((tab) => ({
        ...tab,
        sourceLabel: getWorkspaceTabSourceLabel(tab, messages),
        title: getWorkspaceTabTitle(tab, messages)
      })),
    [messages, tabs]
  );
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
    latestSourceRef.current = currentSource;
  }, [currentSource]);

  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  useEffect(() => {
    activeTabIdRef.current = activeTabId;
  }, [activeTabId]);

  useEffect(() => {
    const storedTabs = readStoredWorkspaceTabs();

    if (!storedTabs) {
      setTabsStorageReady(true);
      return;
    }

    restoredStoredTabsRef.current = true;

    if (tabRestoreStrategy === "merge") {
      const initialTab = createWorkspaceTab(markdown, sourceInput);

      setTabs([initialTab, ...storedTabs.tabs].slice(0, maxStoredWorkspaceTabs));
      setActiveTabId(initialTab.id);
      setCurrentMarkdown(initialTab.markdown);
      setCurrentSource(initialTab.sourceInput);
      setActiveImportMode(deriveImportMode(initialTab.sourceInput));
      setTabsStorageReady(true);
      return;
    }

    const activeStoredTab =
      storedTabs.tabs.find((tab) => tab.id === storedTabs.activeTabId) ?? storedTabs.tabs[0];

    setTabs(storedTabs.tabs);
    setActiveTabId(activeStoredTab.id);
    setCurrentMarkdown(activeStoredTab.markdown);
    setCurrentSource(activeStoredTab.sourceInput);
    setActiveImportMode(deriveImportMode(activeStoredTab.sourceInput));
    setTabsStorageReady(true);
  }, []);

  useEffect(() => {
    setTabs((currentTabs) => {
      let changed = false;
      const nextTabs = currentTabs.map((tab) => {
        if (tab.id !== activeTabId) {
          return tab;
        }

        if (tab.markdown === currentMarkdown && tab.sourceInput === currentSource) {
          return tab;
        }

        changed = true;
        return {
          ...tab,
          markdown: currentMarkdown,
          sourceInput: currentSource,
          updatedAt: Date.now()
        };
      });

      return changed ? nextTabs : currentTabs;
    });
  }, [activeTabId, currentMarkdown, currentSource]);

  useEffect(() => {
    if (!tabsStorageReady) {
      return;
    }

    const saveTimer = window.setTimeout(() => {
      writeStoredWorkspaceTabs(
        getActiveWorkspaceTabsSnapshot(tabs, activeTabId, currentMarkdown, currentSource),
        activeTabId
      );
    }, 260);

    return () => {
      window.clearTimeout(saveTimer);
    };
  }, [activeTabId, currentMarkdown, currentSource, tabs, tabsStorageReady]);

  useEffect(() => {
    const saveDraft = () => {
      window.localStorage.setItem(workspaceDraftStorageKey, latestMarkdownRef.current);
      writeStoredWorkspaceTabs(
        getActiveWorkspaceTabsSnapshot(
          tabsRef.current,
          activeTabIdRef.current,
          latestMarkdownRef.current,
          latestSourceRef.current
        ),
        activeTabIdRef.current
      );
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
    if (restoredStoredTabsRef.current) {
      return;
    }

    setCurrentMarkdown(markdown);
  }, [markdown]);

  useEffect(() => {
    const storedTheme =
      window.localStorage.getItem("markdownviewer.workspace.template") ??
      window.localStorage.getItem("markdownviewer.workspace.theme");
    const storedSplitPercent = Number.parseFloat(window.localStorage.getItem(workspaceSplitStorageKey) ?? "");
    const storedTabsCollapsed = window.localStorage.getItem(workspaceTabsCollapsedStorageKey);
    const storedPreviewFont = window.localStorage.getItem(workspacePreviewFontStorageKey);
    const storedPreviewFontSize = Number.parseFloat(window.localStorage.getItem(workspacePreviewFontSizeStorageKey) ?? "");

    if (isWorkspaceTheme(storedTheme)) {
      setTheme(storedTheme);
    }

    if (Number.isFinite(storedSplitPercent)) {
      setSplitEditorPercent(clampSplitPercent(storedSplitPercent));
    }

    if (storedTabsCollapsed === "true" || storedTabsCollapsed === "false") {
      setTabsCollapsed(storedTabsCollapsed === "true");
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
    window.localStorage.setItem(workspaceTabsCollapsedStorageKey, String(tabsCollapsed));
  }, [tabsCollapsed]);

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
    if (restoredStoredTabsRef.current) {
      return;
    }

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

    const importedTab = createWorkspaceTab(pendingImport.markdown, pendingImport.sourceInput);

    setTabs((currentTabs) => [...currentTabs, importedTab].slice(-maxStoredWorkspaceTabs));
    setActiveTabId(importedTab.id);
    setActiveImportMode("file");
    setCurrentSource(pendingImport.sourceInput);
    setCurrentMarkdown(pendingImport.markdown);
    setStatusMessage(pendingImport.statusMessage ?? messages.status.loadedFile("Markdown file"));
    setTocOpen(false);
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
      reader.onerror = () => reject(new Error(messages.status.readFileFailed));
      reader.readAsText(file);
    });
  }

  function handleNewTab() {
    const nextTab = createWorkspaceTab();

    setTabs((currentTabs) => [...currentTabs, nextTab].slice(-maxStoredWorkspaceTabs));
    setActiveTabId(nextTab.id);
    setCurrentMarkdown(nextTab.markdown);
    setCurrentSource(nextTab.sourceInput);
    setActiveImportMode("paste");
    setStatusMessage(messages.status.newTab);
    setTocOpen(false);
  }

  function handleSelectTab(tabId: string) {
    const selectedTab = tabs.find((tab) => tab.id === tabId);

    if (!selectedTab || selectedTab.id === activeTabId) {
      return;
    }

    setActiveTabId(selectedTab.id);
    setCurrentMarkdown(selectedTab.markdown);
    setCurrentSource(selectedTab.sourceInput);
    setActiveImportMode(deriveImportMode(selectedTab.sourceInput));
    setStatusMessage(messages.status.switchedTo(getWorkspaceTabTitle(selectedTab, messages)));
    setTocOpen(false);
  }

  function handleCloseTab(tabId: string) {
    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);

    if (tabIndex === -1) {
      return;
    }

    if (tabs.length === 1) {
      const nextTab = createWorkspaceTab();

      setTabs([nextTab]);
      setActiveTabId(nextTab.id);
      setCurrentMarkdown(nextTab.markdown);
      setCurrentSource(nextTab.sourceInput);
      setActiveImportMode("paste");
      setStatusMessage(messages.status.closedTab);
      setTocOpen(false);
      return;
    }

    const nextTabs = tabs.filter((tab) => tab.id !== tabId);

    setTabs(nextTabs);

    if (tabId === activeTabId) {
      const nextActiveTab = nextTabs[Math.min(tabIndex, nextTabs.length - 1)];

      setActiveTabId(nextActiveTab.id);
      setCurrentMarkdown(nextActiveTab.markdown);
      setCurrentSource(nextActiveTab.sourceInput);
      setActiveImportMode(deriveImportMode(nextActiveTab.sourceInput));
      setTocOpen(false);
    }

    setStatusMessage(messages.status.closedTab);
  }

  async function handleParseSource() {
    try {
      const result = await loadSource(currentSource);

      setActiveImportMode("url");
      setCurrentMarkdown(result.markdown);
      setStatusMessage(messages.status.loadedSource(result.label));
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : messages.status.loadFailed);
    }
  }

  async function handleFileImport(file: File) {
    const nextMarkdown = await readFileContents(file);

    setActiveImportMode("file");
    setCurrentSource(`file:${file.name}`);
    setCurrentMarkdown(nextMarkdown);
    setStatusMessage(messages.status.loadedFile(file.name));
  }

  async function handlePasteIntoEditor() {
    try {
      const pasted = await navigator.clipboard.readText();

      setActiveImportMode("paste");

      if (pasted) {
        setCurrentMarkdown(pasted);
        setStatusMessage(messages.status.pasted);
      }
    } catch {
      setStatusMessage(messages.status.pastePermission);
    }
  }

  function handleExportHtml() {
    const previewMarkup = previewRef.current?.innerHTML ?? "";
    const firstHeading = headings[0]?.text ?? messages.document.defaultExportTitle;

    exportMarkdownHtml(previewMarkup, firstHeading, theme);
    setStatusMessage(messages.status.exportedHtml);
  }

  function handleExportPdf() {
    window.print();
    setStatusMessage(messages.status.openedPrint);
  }

  async function handleShare() {
    const share = createMarkdownShare(currentMarkdown);

    if (!share.ok) {
      setStatusMessage(share.error);
      return;
    }

    const shareId = share.id;
    const shareUrl = `${window.location.origin}${localizePath(`/share/${shareId}`, locale)}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatusMessage(messages.status.linkCopied);
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
    <div className="workspace-page page-shell" data-tabs-collapsed={tabsCollapsed}>
      {!tabsCollapsed ? (
        <aside className="workspace-tabs-rail" aria-label={messages.tabs.railLabel}>
          <div className="workspace-tabs-rail-header">
            <span className="workspace-tabs-title">{messages.tabs.title}</span>
            <button
              aria-label={messages.tabs.newTab}
              className="workspace-new-tab-button"
              onClick={handleNewTab}
              title={messages.tabs.newTab}
              type="button"
            >
              +
            </button>
          </div>
          <div aria-label={messages.tabs.railLabel} className="workspace-tabs-list" role="tablist">
            {tabItems.map((tab) => (
              <div className="workspace-tab-row" data-active={tab.id === activeTabId} key={tab.id}>
                <button
                  aria-controls="workspace-active-tab-panel"
                  aria-selected={tab.id === activeTabId}
                  className="workspace-tab-button"
                  onClick={() => handleSelectTab(tab.id)}
                  role="tab"
                  title={tab.title}
                  type="button"
                >
                  <span className="workspace-tab-title">{tab.title}</span>
                  <span className="workspace-tab-meta">{tab.sourceLabel}</span>
                </button>
                <button
                  aria-label={messages.tabs.close(tab.title)}
                  className="workspace-tab-close"
                  onClick={() => handleCloseTab(tab.id)}
                  title={messages.tabs.close(tab.title)}
                  type="button"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </aside>
      ) : null}
      <section
        aria-label={documentTitle}
        className="workspace-shell-card"
        id="workspace-active-tab-panel"
        role="tabpanel"
      >
        <button
          aria-expanded={!tabsCollapsed}
          aria-label={tabsCollapsed ? messages.tabs.expand : messages.tabs.collapse}
          className="workspace-tabs-toggle-button"
          data-collapsed={tabsCollapsed}
          onClick={() => setTabsCollapsed((current) => !current)}
          title={tabsCollapsed ? messages.tabs.expand : messages.tabs.collapse}
          type="button"
        >
          <span aria-hidden="true" className="workspace-tabs-toggle-icon" />
        </button>
        <div className="workspace-header">
          <div className="workspace-header-meta">
            <BrandLink
              ariaLabel={messages.header.home}
              className="workspace-home"
              compact
              href={localizePath("/", locale)}
              title="Markdownviewer"
            />
            {sourceLabel ? <div className="workspace-source-chip">{sourceLabel}</div> : null}
          </div>
          <div className="workspace-header-title" title={documentTitle}>
            {documentTitle}
          </div>
            <WorkspaceToolbar
              activeImportMode={activeImportMode}
              messages={messages.toolbar}
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
              messages={messages.editor}
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
              aria-label={messages.preview.resizeLabel}
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
              title={messages.preview.resizeTitle}
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
                  <WorkspaceThemeSelector messages={messages.preview} onThemeChange={setTheme} theme={theme} />
                  <WorkspacePreviewTypographyControls
                    font={previewFont}
                    fontSize={previewFontSize}
                    maxFontSize={maxPreviewFontSize}
                    messages={messages.preview}
                    minFontSize={minPreviewFontSize}
                    onFontChange={setPreviewFont}
                    onFontSizeChange={(nextFontSize) => setPreviewFontSize(clampPreviewFontSize(nextFontSize))}
                  />
                </div>
                {hasHeadings ? (
                  <OutlinePanel
                    documentTitle={documentTitle}
                    headings={headings}
                    messages={messages.preview}
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
