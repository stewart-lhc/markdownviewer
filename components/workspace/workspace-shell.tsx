"use client";

import {
  type CSSProperties,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Clipboard, FileUp, FolderOpen, Link, PanelLeftClose, PanelLeftOpen, Share2, X } from "lucide-react";
import { BrandLink } from "@/components/brand/brand-link";
import { FolderRail } from "@/components/workspace/folder-rail";
import { createMarkdownShare } from "@/lib/share/share-codec";
import { exportMarkdownHtml } from "@/lib/workspace/export-html";
import { getFolderCapability, queryFolderPermission, requestFolderPermission, type FolderPermissionState } from "@/lib/workspace/folder-capabilities";
import {
  createUntitledMarkdownDocument,
  hashMarkdown,
  readFolderDocument,
  writeFolderDocument
} from "@/lib/workspace/folder-documents";
import { readRootFolderHandle, saveRootFolderHandle } from "@/lib/workspace/folder-handles";
import { getFolderPathDirectory, getFolderPathName, resolveMarkdownLink } from "@/lib/workspace/folder-paths";
import { scanMarkdownFolder, type FolderFileEntry } from "@/lib/workspace/folder-scan";
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
type WorkspaceSourceKind = "draft" | "file-import" | "remote-url" | "folder-file";
type FolderSaveState = "idle" | "dirty" | "saving" | "saved" | "failed" | "conflict";

type WorkspaceTab = {
  createdAt: number;
  folderFilePath?: string;
  folderLastModified?: number;
  hasExplicitImportChoice?: boolean;
  hasExplicitSave?: boolean;
  id: string;
  markdown: string;
  savedMarkdownHash?: string;
  sourceKind?: WorkspaceSourceKind;
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

type PwaLaunchFileHandle = {
  getFile: () => Promise<File>;
};

type PwaLaunchParams = {
  files?: PwaLaunchFileHandle[];
};

type PwaLaunchWindow = Window & typeof globalThis & {
  launchQueue?: {
    setConsumer: (consumer: (launchParams: PwaLaunchParams) => void) => void;
  };
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
  const folderFilePath = typeof record.folderFilePath === "string" ? record.folderFilePath : undefined;
  const folderLastModified =
    typeof record.folderLastModified === "number" && Number.isFinite(record.folderLastModified)
      ? record.folderLastModified
      : undefined;
  const hasExplicitImportChoice =
    typeof record.hasExplicitImportChoice === "boolean" ? record.hasExplicitImportChoice : undefined;
  const hasExplicitSave = typeof record.hasExplicitSave === "boolean" ? record.hasExplicitSave : undefined;
  const savedMarkdownHash = typeof record.savedMarkdownHash === "string" ? record.savedMarkdownHash : undefined;
  const sourceKind =
    record.sourceKind === "draft" ||
    record.sourceKind === "file-import" ||
    record.sourceKind === "remote-url" ||
    record.sourceKind === "folder-file"
      ? record.sourceKind
      : undefined;
  const sourceInput = typeof record.sourceInput === "string" ? record.sourceInput : "";
  const createdAt = typeof record.createdAt === "number" && Number.isFinite(record.createdAt)
    ? record.createdAt
    : Date.now();
  const updatedAt = typeof record.updatedAt === "number" && Number.isFinite(record.updatedAt)
    ? record.updatedAt
    : createdAt;

  return {
    createdAt,
    folderFilePath,
    folderLastModified,
    hasExplicitImportChoice,
    hasExplicitSave,
    id,
    markdown,
    savedMarkdownHash,
    sourceKind,
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

    if (tab.markdown === markdown && tab.sourceInput === sourceInput) {
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

  if (sourceInput.startsWith("folder:")) {
    return getFolderPathName(sourceInput.replace(/^folder:/, "")) || "Local folder";
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
  if (sourceInput.startsWith("file:") || sourceInput.startsWith("folder:")) {
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
  const [shareUrl, setShareUrl] = useState("");
  const [activeImportMode, setActiveImportMode] = useState<SourcePanelMode>(deriveImportMode(sourceInput));
  const [editorPresentationMode, setEditorPresentationMode] = useState<EditorPresentationMode>("rich");
  const [compactWorkspace, setCompactWorkspace] = useState(false);
  const [previewFont, setPreviewFont] = useState<WorkspacePreviewFont>(defaultPreviewFont);
  const [previewFontSize, setPreviewFontSize] = useState(defaultPreviewFontSize);
  const [splitEditorPercent, setSplitEditorPercent] = useState(50);
  const [splitResizing, setSplitResizing] = useState(false);
  const [tabsCollapsed, setTabsCollapsed] = useState(false);
  const [tabsStorageReady, setTabsStorageReady] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [folderRootHandle, setFolderRootHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [folderRootName, setFolderRootName] = useState("");
  const [folderFiles, setFolderFiles] = useState<FolderFileEntry[]>([]);
  const [folderPermission, setFolderPermission] = useState<FolderPermissionState>(getFolderCapability());
  const [folderPartial, setFolderPartial] = useState(false);
  const [folderSkippedCount, setFolderSkippedCount] = useState(0);
  const [folderSearchOpen, setFolderSearchOpen] = useState(false);
  const [folderSearchQuery, setFolderSearchQuery] = useState("");
  const [newTabDialogOpen, setNewTabDialogOpen] = useState(false);
  const [newTabUrlInput, setNewTabUrlInput] = useState("");
  const [fileDragActive, setFileDragActive] = useState(false);
  const [saveState, setSaveState] = useState<FolderSaveState>("idle");
  const gridRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const newTabFileInputRef = useRef<HTMLInputElement | null>(null);
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
  const pendingFolderHashRef = useRef<string | undefined>(undefined);
  const lastStoredTabsJsonRef = useRef<string | null>(null);
  const lastStoredDraftRef = useRef<string | null>(null);
  const previewMarkdown = useDeferredValue(currentMarkdown);
  const headings = useMemo(() => extractHeadings(previewMarkdown), [previewMarkdown]);
  const hasHeadings = headings.length > 0;
  const documentTitle = useMemo(
    () => deriveDocumentTitle(previewMarkdown, currentSource, headings, messages),
    [currentSource, headings, messages, previewMarkdown]
  );
  const sourceLabel = useMemo(() => describeSource(currentSource), [currentSource]);
  const hasCurrentDocument = currentMarkdown.trim().length > 0;
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const activeFolderPath = activeTab?.sourceKind === "folder-file" ? activeTab.folderFilePath : undefined;
  const selectedFolderDirectory = activeFolderPath ? getFolderPathDirectory(activeFolderPath) : "/";
  const activeFolderEntry = activeFolderPath
    ? folderFiles.find((file) => file.path === activeFolderPath)
    : undefined;
  const isActiveFolderDocument = Boolean(activeFolderPath && activeFolderEntry);
  const activeFolderDirty =
    isActiveFolderDocument && activeTab?.savedMarkdownHash !== hashMarkdown(currentMarkdown);
  const activeTabImportLocked = activeTab?.hasExplicitImportChoice === true;
  const showToolbarImportActions = !activeTabImportLocked && !hasCurrentDocument;
  const tabItems = useMemo(
    () =>
      tabs.map((tab) => ({
        ...tab,
        sourceLabel: getWorkspaceTabSourceLabel(tab, messages),
        title: tab.id === activeTabId ? documentTitle : getWorkspaceTabTitle(tab, messages)
      })),
    [activeTabId, documentTitle, messages, tabs]
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

  function collapseTabsForReading() {
    if (compactWorkspace) {
      setTabsCollapsed(true);
    }
  }

  function isCompactViewport() {
    return typeof window.matchMedia === "function" && window.matchMedia("(max-width: 720px)").matches;
  }

  function persistStoredWorkspaceTabs(nextTabs: WorkspaceTab[], nextActiveTabId: string) {
    const normalizedTabs = nextTabs.slice(0, maxStoredWorkspaceTabs);
    const normalizedActiveTabId = normalizedTabs.some((tab) => tab.id === nextActiveTabId)
      ? nextActiveTabId
      : normalizedTabs[0]?.id;

    if (!normalizedActiveTabId) {
      return;
    }

    const nextJson = JSON.stringify({
      version: workspaceTabsStorageVersion,
      activeTabId: normalizedActiveTabId,
      tabs: normalizedTabs
    });

    if (lastStoredTabsJsonRef.current === nextJson) {
      return;
    }

    window.localStorage.setItem(workspaceTabsStorageKey, nextJson);
    lastStoredTabsJsonRef.current = nextJson;
  }

  function persistWorkspaceDraft(nextMarkdown: string) {
    if (lastStoredDraftRef.current === nextMarkdown) {
      return;
    }

    window.localStorage.setItem(workspaceDraftStorageKey, nextMarkdown);
    lastStoredDraftRef.current = nextMarkdown;
  }

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const query = window.matchMedia("(max-width: 720px)");

    function syncCompactWorkspace() {
      const nextCompact = query.matches;

      setCompactWorkspace(nextCompact);

      if (nextCompact) {
        setTabsCollapsed(true);
        setCurrentMode((current) => (current === "split" ? "preview" : current));
      }
    }

    syncCompactWorkspace();
    query.addEventListener("change", syncCompactWorkspace);

    return () => {
      query.removeEventListener("change", syncCompactWorkspace);
    };
  }, []);

  useEffect(() => {
    latestMarkdownRef.current = currentMarkdown;
  }, [currentMarkdown]);

  useEffect(() => {
    latestSourceRef.current = currentSource;
  }, [currentSource]);

  useEffect(() => {
    setShareUrl("");
  }, [currentMarkdown]);

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
      persistStoredWorkspaceTabs(
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
      persistWorkspaceDraft(latestMarkdownRef.current);
      persistStoredWorkspaceTabs(
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
      persistWorkspaceDraft(currentMarkdown);
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

    const compactViewport =
      typeof window.matchMedia === "function" && window.matchMedia("(max-width: 720px)").matches;

    if (compactViewport) {
      setTabsCollapsed(true);
      setCurrentMode((current) => (current === "split" ? "preview" : current));
    } else if (storedTabsCollapsed === "true" || storedTabsCollapsed === "false") {
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
    if (!compactWorkspace) {
      return;
    }

    setTabsCollapsed(true);
    setCurrentMode((current) => (current === "split" ? "preview" : current));
  }, [compactWorkspace]);

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

    openImportedFileTab(
      pendingImport.markdown,
      pendingImport.sourceInput,
      pendingImport.statusMessage ?? messages.status.loadedFile("Markdown file")
    );
  }, []);

  useEffect(() => {
    void restoreFolderSession();
  }, []);

  useEffect(() => {
    const launchQueue = (window as PwaLaunchWindow).launchQueue;

    if (!launchQueue || typeof launchQueue.setConsumer !== "function") {
      return;
    }

    launchQueue.setConsumer((launchParams) => {
      const fileHandles = launchParams.files?.filter((fileHandle) => typeof fileHandle.getFile === "function") ?? [];

      if (fileHandles.length === 0) {
        return;
      }

      void (async () => {
        try {
          for (const fileHandle of fileHandles) {
            const file = await fileHandle.getFile();
            await openFileInNewTab(file);
          }
        } catch {
          setStatusMessage(messages.status.readFileFailed);
        }
      })();
    });
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

  useEffect(() => {
    if (!isActiveFolderDocument) {
      setSaveState("idle");
      return;
    }

    if (!activeFolderDirty) {
      setSaveState((current) => (current === "saving" ? current : "saved"));
      return;
    }

    setSaveState((current) => (current === "saving" ? current : "dirty"));

    if (!activeTab?.hasExplicitSave || saveState === "saving") {
      return;
    }

    const saveTimer = window.setTimeout(() => {
      void saveCurrentFolderFile();
    }, 1200);

    return () => {
      window.clearTimeout(saveTimer);
    };
  }, [activeFolderDirty, activeTab?.hasExplicitSave, isActiveFolderDocument, saveState]);

  useEffect(() => {
    function handleWorkspaceShortcut(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }

      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveCurrentFolderFile();
        return;
      }

      if (event.key.toLowerCase() === "k" && folderRootHandle) {
        event.preventDefault();
        setFolderSearchOpen(true);
      }
    }

    window.addEventListener("keydown", handleWorkspaceShortcut);

    return () => {
      window.removeEventListener("keydown", handleWorkspaceShortcut);
    };
  }, [activeFolderPath, currentMarkdown, folderRootHandle, saveState]);

  useEffect(() => {
    const pendingHash = pendingFolderHashRef.current;

    if (!pendingHash) {
      return;
    }

    pendingFolderHashRef.current = undefined;
    window.requestAnimationFrame(() => {
      const target = document.getElementById(pendingHash);

      if (target && typeof target.scrollIntoView === "function") {
        target.scrollIntoView({ block: "start" });
        window.history.replaceState(null, "", `#${pendingHash}`);
      }
    });
  }, [previewMarkdown]);

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

  function isMarkdownImportFile(file: File) {
    return /\.(?:md|markdown|mdown|mkd|mdx|txt)$/i.test(file.name);
  }

  function getMarkdownFiles(dataTransfer: DataTransfer) {
    return Array.from(dataTransfer.files).filter(isMarkdownImportFile);
  }

  function updateActiveTabMetadata(patch: Partial<WorkspaceTab>) {
    setTabs((currentTabs) =>
      currentTabs.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              ...patch,
              updatedAt: Date.now()
            }
          : tab
      )
    );
  }

  async function loadFolderSession(handle: FileSystemDirectoryHandle, status?: string) {
    const scan = await scanMarkdownFolder(handle);

    setFolderRootHandle(handle);
    setFolderRootName(handle.name || "Local folder");
    setFolderFiles(scan.files);
    setFolderPermission("granted");
    setFolderPartial(scan.partial);
    setFolderSkippedCount(scan.skippedCount);
    setTabsCollapsed(isCompactViewport());

    if (status) {
      setStatusMessage(status);
    }
  }

  async function handleOpenFolder() {
    if (getFolderCapability() === "unsupported" || typeof window.showDirectoryPicker !== "function") {
      setFolderPermission("unsupported");
      setStatusMessage(messages.folder.browserUnsupported);
      return;
    }

    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      const permission = await requestFolderPermission(handle);

      setFolderPermission(permission);

      if (permission !== "granted") {
        setFolderRootHandle(handle);
        setFolderRootName(handle.name || "Local folder");
        setStatusMessage(messages.folder.reconnectNeeded);
        return;
      }

      await saveRootFolderHandle(handle).catch(() => undefined);
      await loadFolderSession(handle, messages.folder.opened(handle.name || "Local folder"));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setStatusMessage(error instanceof Error ? error.message : messages.status.loadFailed);
    }
  }

  async function handleReconnectFolder() {
    if (!folderRootHandle) {
      await handleOpenFolder();
      return;
    }

    const permission = await requestFolderPermission(folderRootHandle);
    setFolderPermission(permission);

    if (permission === "granted") {
      await loadFolderSession(folderRootHandle, messages.folder.opened(folderRootName || folderRootHandle.name));
    } else {
      setStatusMessage(messages.folder.reconnectNeeded);
    }
  }

  async function restoreFolderSession() {
    const storedHandle = await readRootFolderHandle().catch(() => null);

    if (!storedHandle) {
      return;
    }

    const permission = await queryFolderPermission(storedHandle);
    setFolderRootHandle(storedHandle);
    setFolderRootName(storedHandle.name || "Local folder");
    setFolderPermission(permission);

    if (permission === "granted") {
      await loadFolderSession(storedHandle);
    } else {
      setStatusMessage(messages.folder.reconnectNeeded);
    }
  }

  function getFolderEntry(path: string) {
    return folderFiles.find((file) => file.path === path);
  }

  async function saveCurrentFolderFile(forceOverwrite = false) {
    const path = activeFolderPath;
    const entry = path ? getFolderEntry(path) : undefined;

    if (!path || !entry || activeTab?.sourceKind !== "folder-file") {
      setStatusMessage(messages.folder.notFolderFile);
      return false;
    }

    try {
      setSaveState("saving");

      if (!forceOverwrite && activeTab.folderLastModified) {
        const latestFile = await entry.handle.getFile();

        if (latestFile.lastModified > activeTab.folderLastModified) {
          const shouldOverwrite = window.confirm(messages.folder.conflict);

          if (!shouldOverwrite) {
            setSaveState("conflict");
            return false;
          }
        }
      }

      const saved = await writeFolderDocument(entry.handle, currentMarkdown);
      const savedHash = hashMarkdown(saved.markdown);

      setFolderFiles((currentFiles) =>
        currentFiles.map((file) =>
          file.path === path
            ? {
                ...file,
                lastModified: saved.lastModified
              }
            : file
        )
      );
      updateActiveTabMetadata({
        folderLastModified: saved.lastModified,
        hasExplicitSave: true,
        savedMarkdownHash: savedHash,
        sourceKind: "folder-file"
      });
      setSaveState("saved");
      setStatusMessage(messages.folder.saved);
      return true;
    } catch {
      window.localStorage.setItem(workspaceDraftStorageKey, currentMarkdown);
      setSaveState("failed");
      setStatusMessage(messages.folder.saveFailed);
      return false;
    }
  }

  async function ensureFolderSwitchAllowed() {
    if (!activeFolderDirty) {
      return true;
    }

    if (window.confirm(messages.folder.saveBeforeSwitch)) {
      return saveCurrentFolderFile();
    }

    return window.confirm(messages.folder.discardBeforeSwitch);
  }

  async function openFolderFile(path: string, hash?: string) {
    const entry = getFolderEntry(path);

    if (!entry) {
      setStatusMessage(messages.folder.fileMissing(path));
      return false;
    }

    if (!(await ensureFolderSwitchAllowed())) {
      return false;
    }

    try {
      const document = await readFolderDocument(entry.handle);
      const savedHash = hashMarkdown(document.markdown);

      setCurrentMarkdown(document.markdown);
      setCurrentSource(`folder:${entry.path}`);
      setActiveImportMode("file");
      updateActiveTabMetadata({
        folderFilePath: entry.path,
        folderLastModified: document.lastModified,
        hasExplicitImportChoice: true,
        hasExplicitSave: true,
        markdown: document.markdown,
        savedMarkdownHash: savedHash,
        sourceInput: `folder:${entry.path}`,
        sourceKind: "folder-file"
      });
      setSaveState("saved");
      setStatusMessage(messages.status.loadedFile(entry.name));
      setTocOpen(false);

      if (hash) {
        pendingFolderHashRef.current = hash;
      }

      return true;
    } catch {
      setStatusMessage(messages.status.readFileFailed);
      return false;
    }
  }

  async function handleNewFolderFile() {
    if (!folderRootHandle || folderPermission !== "granted") {
      setStatusMessage(messages.folder.reconnectNeeded);
      return;
    }

    if (!(await ensureFolderSwitchAllowed())) {
      return;
    }

    try {
      const created = await createUntitledMarkdownDocument(
        folderRootHandle,
        folderFiles,
        selectedFolderDirectory
      );
      const { markdown: nextMarkdown, ...fileEntry } = created;

      setFolderFiles((currentFiles) => [...currentFiles, fileEntry]);
      setCurrentMarkdown(nextMarkdown);
      setCurrentSource(`folder:${created.path}`);
      setActiveImportMode("file");
      updateActiveTabMetadata({
        folderFilePath: created.path,
        folderLastModified: created.lastModified,
        hasExplicitImportChoice: true,
        hasExplicitSave: true,
        markdown: nextMarkdown,
        savedMarkdownHash: hashMarkdown(nextMarkdown),
        sourceInput: `folder:${created.path}`,
        sourceKind: "folder-file"
      });
      setSaveState("saved");
      setStatusMessage(messages.status.loadedFile(created.name));
      setTocOpen(false);
    } catch {
      setSaveState("failed");
      setStatusMessage(messages.folder.saveFailed);
    }
  }

  function openImportedFileTab(markdown: string, sourceInput: string, statusMessage: string) {
    const importedTab = createExplicitImportTab(markdown, sourceInput, {
      sourceKind: "file-import"
    });

    activateWorkspaceTab(importedTab, "file", statusMessage);
  }

  function activateWorkspaceTab(nextTab: WorkspaceTab, importMode: SourcePanelMode, statusMessage?: string) {
    setTabs((currentTabs) =>
      [
        ...getActiveWorkspaceTabsSnapshot(
          currentTabs,
          activeTabIdRef.current,
          latestMarkdownRef.current,
          latestSourceRef.current
        ),
        nextTab
      ].slice(-maxStoredWorkspaceTabs)
    );
    setActiveTabId(nextTab.id);
    setCurrentMarkdown(nextTab.markdown);
    setCurrentSource(nextTab.sourceInput);
    setActiveImportMode(importMode);
    setStatusMessage(statusMessage ?? messages.status.newTab);
    setTocOpen(false);
    collapseTabsForReading();
  }

  function createExplicitImportTab(
    markdown = "",
    sourceInput = "",
    patch: Partial<WorkspaceTab> = {}
  ): WorkspaceTab {
    return {
      ...createWorkspaceTab(markdown, sourceInput),
      hasExplicitImportChoice: true,
      ...patch
    };
  }

  async function openFileInNewTab(file: File) {
    const nextMarkdown = await readFileContents(file);
    const nextTab = createExplicitImportTab(nextMarkdown, `file:${file.name}`, {
      sourceKind: "file-import"
    });

    activateWorkspaceTab(nextTab, "file", messages.status.loadedFile(file.name));
  }

  function handleNewTab() {
    setNewTabDialogOpen(true);
    setNewTabUrlInput("");
  }

  async function handleNewTabPaste() {
    if (!(await ensureFolderSwitchAllowed())) {
      return;
    }

    setNewTabDialogOpen(false);

    try {
      const pasted = await navigator.clipboard.readText();
      const nextTab = createExplicitImportTab(pasted, "", {
        sourceKind: "draft"
      });

      activateWorkspaceTab(
        nextTab,
        "paste",
        pasted ? messages.status.pasted : messages.status.emptyClipboard
      );

      if (!pasted) {
        setCurrentMode("editor");
      }
    } catch {
      const nextTab = createExplicitImportTab("", "", {
        sourceKind: "draft"
      });

      activateWorkspaceTab(nextTab, "paste", messages.status.pastePermission);
      setCurrentMode("editor");
    }
  }

  async function handleNewTabFile() {
    if (!(await ensureFolderSwitchAllowed())) {
      return;
    }

    setNewTabDialogOpen(false);
    newTabFileInputRef.current?.click();
  }

  async function handleNewTabFileSelected(file: File) {
    await openFileInNewTab(file);
  }

  async function handleNewTabUrlSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!(await ensureFolderSwitchAllowed())) {
      return;
    }

    const requestedUrl = newTabUrlInput.trim();

    if (!requestedUrl) {
      setStatusMessage(messages.status.urlRequired);
      return;
    }

    try {
      const result = await loadSource(requestedUrl);
      const resolvedUrl = result.resolvedUrl ?? requestedUrl;
      const nextTab = createExplicitImportTab(result.markdown, resolvedUrl, {
        sourceKind: "remote-url"
      });

      activateWorkspaceTab(nextTab, "url", messages.status.loadedSource(result.label));
      setNewTabDialogOpen(false);
      setNewTabUrlInput("");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : messages.status.loadFailed);
    }
  }

  async function handleNewTabFolder() {
    if (!(await ensureFolderSwitchAllowed())) {
      return;
    }

    setNewTabDialogOpen(false);
    await handleOpenFolder();
  }

  function handleWorkspaceDragEnter(event: ReactDragEvent<HTMLDivElement>) {
    if (!Array.from(event.dataTransfer.types).includes("Files")) {
      return;
    }

    event.preventDefault();
    setFileDragActive(true);
  }

  function handleWorkspaceDragOver(event: ReactDragEvent<HTMLDivElement>) {
    if (!Array.from(event.dataTransfer.types).includes("Files")) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setFileDragActive(true);
  }

  function handleWorkspaceDragLeave(event: ReactDragEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    setFileDragActive(false);
  }

  async function handleWorkspaceDrop(event: ReactDragEvent<HTMLDivElement>) {
    const droppedFiles = getMarkdownFiles(event.dataTransfer);

    if (droppedFiles.length === 0) {
      setFileDragActive(false);
      return;
    }

    event.preventDefault();
    setFileDragActive(false);

    if (!(await ensureFolderSwitchAllowed())) {
      return;
    }

    try {
      for (const file of droppedFiles) {
        await openFileInNewTab(file);
      }
    } catch {
      setStatusMessage(messages.status.readFileFailed);
    }
  }

  function switchToTab(selectedTab: WorkspaceTab) {
    setActiveTabId(selectedTab.id);
    setCurrentMarkdown(selectedTab.markdown);
    setCurrentSource(selectedTab.sourceInput);
    setActiveImportMode(deriveImportMode(selectedTab.sourceInput));
    setStatusMessage(messages.status.switchedTo(getWorkspaceTabTitle(selectedTab, messages)));
    setTocOpen(false);
    collapseTabsForReading();
  }

  function handleSelectTab(tabId: string) {
    const selectedTab = tabs.find((tab) => tab.id === tabId);

    if (!selectedTab) {
      return;
    }

    if (selectedTab.id === activeTabId) {
      collapseTabsForReading();
      return;
    }

    if (!activeFolderDirty) {
      switchToTab(selectedTab);
      return;
    }

    void (async () => {
      if (await ensureFolderSwitchAllowed()) {
        switchToTab(selectedTab);
      }
    })();
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
      setCurrentSource(result.resolvedUrl ?? currentSource);
      updateActiveTabMetadata({
        hasExplicitImportChoice: true,
        markdown: result.markdown,
        sourceInput: result.resolvedUrl ?? currentSource,
        sourceKind: "remote-url"
      });
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
    updateActiveTabMetadata({
      hasExplicitImportChoice: true,
      markdown: nextMarkdown,
      sourceInput: `file:${file.name}`,
      sourceKind: "file-import"
    });
    setStatusMessage(messages.status.loadedFile(file.name));
  }

  async function handlePasteIntoEditor() {
    try {
      const pasted = await navigator.clipboard.readText();

      setActiveImportMode("paste");

      if (pasted) {
        setCurrentMarkdown(pasted);
        updateActiveTabMetadata({
          hasExplicitImportChoice: true,
          markdown: pasted,
          sourceKind: "draft"
        });
        setStatusMessage(messages.status.pasted);
      } else {
        updateActiveTabMetadata({
          hasExplicitImportChoice: true,
          sourceKind: "draft"
        });
        setCurrentMode("editor");
        setStatusMessage(messages.status.emptyClipboard);
      }
    } catch {
      updateActiveTabMetadata({
        hasExplicitImportChoice: true,
        sourceKind: "draft"
      });
      setCurrentMode("editor");
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
    setShareUrl(shareUrl);

    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatusMessage(`${messages.status.linkCopied} ${shareUrl}`);
    } catch {
      setStatusMessage(shareUrl);
    }
  }

  async function handleCopyShareUrl() {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatusMessage(`${messages.status.linkCopied} ${shareUrl}`);
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

  function handlePreviewLinkClick(href: string) {
    if (!activeFolderPath) {
      return false;
    }

    const resolved = resolveMarkdownLink(activeFolderPath, href);

    if (!resolved) {
      return false;
    }

    if (!getFolderEntry(resolved.path)) {
      setStatusMessage(messages.folder.fileMissing(resolved.path));
      return true;
    }

    void openFolderFile(resolved.path, resolved.hash);
    return true;
  }

  function renderTabsToggleButton() {
    return (
      <button
        aria-expanded={!tabsCollapsed}
        aria-label={tabsCollapsed ? messages.tabs.expand : messages.tabs.collapse}
        className="workspace-tabs-toggle-button"
        data-collapsed={tabsCollapsed}
        onClick={() => setTabsCollapsed((current) => !current)}
        title={tabsCollapsed ? messages.tabs.expand : messages.tabs.collapse}
        type="button"
      >
        {tabsCollapsed ? (
          <PanelLeftOpen aria-hidden="true" className="workspace-tabs-toggle-icon" size={22} strokeWidth={2} />
        ) : (
          <PanelLeftClose aria-hidden="true" className="workspace-tabs-toggle-icon" size={22} strokeWidth={2} />
        )}
      </button>
    );
  }

  function renderNewTabButton(className = "") {
    return (
      <button
        aria-label={messages.tabs.newTab}
        className={["workspace-new-tab-button", className].filter(Boolean).join(" ")}
        onClick={handleNewTab}
        title={messages.tabs.newTab}
        type="button"
      >
        +
      </button>
    );
  }

  function renderRailTopControls({ showHome = true, showToggle = false }: { showHome?: boolean; showToggle?: boolean } = {}) {
    return (
      <div className="workspace-rail-topbar">
        {showToggle ? renderTabsToggleButton() : null}
        {showHome ? (
          <BrandLink
            ariaLabel={messages.header.home}
            className="workspace-home"
            compact
            href={localizePath("/", locale)}
            title="Markdownviewer"
          />
        ) : null}
      </div>
    );
  }

  return (
    <div
      className="workspace-page page-shell"
      data-file-drag-active={fileDragActive}
      data-tabs-collapsed={tabsCollapsed}
      onDragEnter={handleWorkspaceDragEnter}
      onDragLeave={handleWorkspaceDragLeave}
      onDragOver={handleWorkspaceDragOver}
      onDrop={(event) => {
        void handleWorkspaceDrop(event);
      }}
    >
      {compactWorkspace && !tabsCollapsed ? (
        <button
          aria-label={messages.tabs.collapse}
          className="workspace-tabs-backdrop"
          onClick={() => setTabsCollapsed(true)}
          type="button"
        />
      ) : null}
      <div className="workspace-header">
        <div className="workspace-header-tabs-control">
          {renderTabsToggleButton()}
        </div>
        <div className="workspace-header-meta">
          {sourceLabel ? <div className="workspace-source-chip">{sourceLabel}</div> : null}
        </div>
        <div className="workspace-header-title" title={documentTitle}>
          {documentTitle}
        </div>
        <WorkspaceToolbar
          activeImportMode={activeImportMode}
          compact={compactWorkspace}
          messages={messages.toolbar}
          mode={currentMode}
          showImportActions={showToolbarImportActions}
          onExportHtml={handleExportHtml}
          onExportPdf={handleExportPdf}
          onActiveImportModeChange={setActiveImportMode}
          onFileImport={handleFileImport}
          onModeChange={setCurrentMode}
          onOpenFolder={handleOpenFolder}
          onParseSource={handleParseSource}
          onPasteIntoEditor={handlePasteIntoEditor}
          onSaveToDisk={() => {
            void saveCurrentFolderFile();
          }}
          onSourceChange={setCurrentSource}
          sourceValue={currentSource}
        />
      </div>
      {!tabsCollapsed ? (
        folderRootHandle ? (
          <FolderRail
            activePath={activeFolderPath}
            files={folderFiles}
            messages={messages.folder}
            onNewFile={handleNewFolderFile}
            onOpenFile={(path) => {
              void openFolderFile(path);
            }}
            onReconnect={handleReconnectFolder}
            onSearchOpenChange={setFolderSearchOpen}
            onSearchQueryChange={setFolderSearchQuery}
            partial={folderPartial}
            rootName={folderRootName || "Local folder"}
            searchOpen={folderSearchOpen}
            searchQuery={folderSearchQuery}
            selectedDirectory={selectedFolderDirectory}
            skippedCount={folderSkippedCount}
            topControls={renderRailTopControls()}
          />
        ) : (
        <aside className="workspace-tabs-rail" aria-label={messages.tabs.railLabel}>
          <div className="workspace-tabs-rail-header">
            {renderRailTopControls()}
          </div>
          <div className="workspace-tabs-list-actions">
            {renderNewTabButton("workspace-new-tab-button--list")}
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
        )
      ) : null}
      <section
        aria-label={documentTitle}
        className="workspace-shell-card"
        id="workspace-active-tab-panel"
        role="tabpanel"
      >
        {statusMessage ? <p aria-live="polite" className="sr-only" role="status">{statusMessage}</p> : null}
        {shareUrl ? (
          <>
            <button
              aria-label={locale === "zh-CN" ? "关闭分享链接" : "Close share link"}
              className="workspace-popup-backdrop workspace-share-backdrop"
              onClick={() => setShareUrl("")}
              type="button"
            />
            <div
              aria-label={locale === "zh-CN" ? "分享链接" : "Share link"}
              aria-modal="true"
              className="workspace-share-link"
              role="dialog"
            >
              <div className="workspace-share-link__header">
                <span>{locale === "zh-CN" ? "分享链接已生成" : "Share link ready"}</span>
                <button
                  aria-label={locale === "zh-CN" ? "关闭分享链接" : "Close share link"}
                  className="workspace-share-link__close"
                  onClick={() => setShareUrl("")}
                  type="button"
                >
                  <X aria-hidden="true" size={18} strokeWidth={2} />
                </button>
              </div>
              <a
                aria-label={locale === "zh-CN" ? "打开生成的分享链接" : "Open generated share link"}
                href={shareUrl}
                rel="noreferrer"
                target="_blank"
              >
                {shareUrl}
              </a>
              <button className="toolbar-button" onClick={handleCopyShareUrl} type="button">
                {locale === "zh-CN" ? "复制链接" : "Copy link"}
              </button>
            </div>
          </>
        ) : null}
        {newTabDialogOpen ? (
          <>
            <button
              aria-label={locale === "zh-CN" ? "关闭新建 tab" : "Close new tab dialog"}
              className="workspace-popup-backdrop workspace-new-tab-dialog-backdrop"
              onClick={() => setNewTabDialogOpen(false)}
              type="button"
            />
            <div
              aria-label={messages.tabs.importDialogTitle}
              aria-modal="true"
              className="workspace-new-tab-dialog"
              role="dialog"
            >
              <div className="workspace-new-tab-dialog-header">
                <h2>{messages.tabs.importDialogTitle}</h2>
                <button
                  aria-label={messages.preview.close}
                  className="workspace-new-tab-dialog-close"
                  onClick={() => setNewTabDialogOpen(false)}
                  type="button"
                >
                  <X aria-hidden="true" size={18} strokeWidth={2} />
                </button>
              </div>
              <div className="workspace-new-tab-choices">
                <button className="workspace-new-tab-choice" onClick={handleNewTabPaste} type="button">
                  <Clipboard aria-hidden="true" size={18} strokeWidth={2} />
                  <span>{messages.toolbar.paste}</span>
                </button>
                <button className="workspace-new-tab-choice" onClick={handleNewTabFile} type="button">
                  <FileUp aria-hidden="true" size={18} strokeWidth={2} />
                  <span>{messages.toolbar.file}</span>
                </button>
                <button className="workspace-new-tab-choice" onClick={handleNewTabFolder} type="button">
                  <FolderOpen aria-hidden="true" size={18} strokeWidth={2} />
                  <span>{messages.toolbar.openFolder}</span>
                </button>
              </div>
              <form className="workspace-new-tab-url-form" onSubmit={handleNewTabUrlSubmit}>
                <Link aria-hidden="true" size={18} strokeWidth={2} />
                <input
                  aria-label={messages.toolbar.sourceUrlLabel}
                  className="workspace-new-tab-url-input"
                  onChange={(event) => setNewTabUrlInput(event.currentTarget.value)}
                  placeholder={messages.tabs.importUrlPlaceholder}
                  value={newTabUrlInput}
                />
                <button className="toolbar-button" type="submit">
                  {messages.toolbar.open}
                </button>
              </form>
            </div>
          </>
        ) : null}
        <input
          aria-hidden="true"
          className="sr-only"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const file = event.currentTarget.files?.[0];

            if (file) {
              void handleNewTabFileSelected(file);
            }

            event.currentTarget.value = "";
          }}
          ref={newTabFileInputRef}
          type="file"
          accept=".md,.markdown,.mdx,.txt,text/markdown,text/plain"
        />
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
              {!compactWorkspace ? (
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
                  <button className="toolbar-button workspace-preview-share-button" onClick={handleShare} type="button">
                    <Share2 aria-hidden="true" size={16} strokeWidth={2} />
                    <span className="workspace-preview-share-label-full">{messages.toolbar.shareLink}</span>
                    <span className="workspace-preview-share-label-compact">
                      {locale === "zh-CN" ? "分享" : "Share"}
                    </span>
                  </button>
                </div>
              ) : null}
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
                <MarkdownRenderer markdown={previewMarkdown} onLinkClick={handlePreviewLinkClick} />
              </div>
              {compactWorkspace ? (
                <div className="workspace-preview-bottom-bar">
                  <div className="workspace-preview-bottom-controls">
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
                  <button className="toolbar-button workspace-preview-share-button" onClick={handleShare} type="button">
                    <Share2 aria-hidden="true" size={16} strokeWidth={2} />
                    <span className="workspace-preview-share-label-full">{messages.toolbar.shareLink}</span>
                    <span className="workspace-preview-share-label-compact">
                      {locale === "zh-CN" ? "分享" : "Share"}
                    </span>
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
        {currentMode !== "editor" && hasHeadings ? (
          <OutlinePanel
            documentTitle={documentTitle}
            headings={headings}
            messages={messages.preview}
            onNavigate={handleTocNavigate}
            onToggle={() => setTocOpen((current) => !current)}
            open={tocOpen}
          />
        ) : null}
      </section>
    </div>
  );
}
