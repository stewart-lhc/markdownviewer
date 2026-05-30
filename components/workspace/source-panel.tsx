"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MutableRefObject,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { applyMarkdownAction, type MarkdownEditorAction } from "@/lib/workspace/editor-actions";
import type { WorkspaceMessages } from "@/lib/i18n/messages";
import { getEditorActionShortcutLabel, getEditorShortcutCommand } from "@/lib/workspace/editor-shortcuts";
import {
  bindStackeditEditor,
  ensureStackeditTrailingLf,
  getBoundStackeditEditor,
  getStackeditEditorFactory,
  getStackeditPrism,
  unbindStackeditEditor,
  makeStackeditMarkdownGrammar,
  normalizeStackeditContent,
  parseStackeditSections,
  type StackeditEditor
} from "@/lib/workspace/stackedit-cledit";

export type SourcePanelMode = "paste" | "file" | "url";
export type EditorPresentationMode = "rich" | "raw";

type SourcePanelProps = {
  editorPresentationMode: EditorPresentationMode;
  editorRef?: RefObject<HTMLElement | null>;
  markdown: string;
  messages: WorkspaceMessages["editor"];
  visible: boolean;
  onEditorPresentationModeChange: (mode: EditorPresentationMode) => void;
  onEditorKeyboardNavigation?: (selectionStart: number, element: HTMLTextAreaElement | HTMLDivElement) => void;
  onEditorSelectionChange?: (selectionStart: number) => void;
  onEditorScroll?: (element: HTMLTextAreaElement | HTMLDivElement) => void;
  onMarkdownChange: (value: string) => void;
};

const editorActions: Array<{
  action: MarkdownEditorAction;
  icon: string;
}> = [
  { action: "bold", icon: "B" },
  { action: "italic", icon: "I" },
  { action: "heading", icon: "Tt" },
  { action: "strike", icon: "S" },
  { action: "bulletList", icon: "•" },
  { action: "orderedList", icon: "1." },
  { action: "taskList", icon: "☑" },
  { action: "quote", icon: "❞" },
  { action: "code", icon: "</>" },
  { action: "table", icon: "▦" },
  { action: "link", icon: "∞" },
  { action: "image", icon: "▣" }
];

const editorToolButtonEstimateWidth = 40;
const editorToolOverflowEstimateWidth = 40;
const compactEditorVisibleActionLimit = 4;

function getEditorVisibleActionLimit() {
  if (typeof window === "undefined") {
    return editorActions.length;
  }

  const viewportWidth = document.documentElement.clientWidth || window.innerWidth;

  if (viewportWidth <= 720) {
    return compactEditorVisibleActionLimit;
  }

  if (typeof window.matchMedia === "function" && window.matchMedia("(max-width: 720px)").matches) {
    return compactEditorVisibleActionLimit;
  }

  return editorActions.length;
}

function setEditorSurfaceRef(editorRef: SourcePanelProps["editorRef"], node: HTMLElement | null) {
  if (!editorRef) {
    return;
  }

  (editorRef as MutableRefObject<HTMLElement | null>).current = node;
}

function getRichEditorContentLength(editor: StackeditEditor) {
  return Math.max(0, editor.getContent().length - 1);
}

const editorScrollSyncSuppressionKeys = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End"
]);

export function SourcePanel({
  editorPresentationMode,
  editorRef,
  markdown,
  messages,
  visible,
  onEditorPresentationModeChange,
  onEditorKeyboardNavigation,
  onEditorSelectionChange,
  onEditorScroll,
  onMarkdownChange
}: SourcePanelProps) {
  const rawEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const richEditorRef = useRef<HTMLDivElement | null>(null);
  const editorToolbarRef = useRef<HTMLDivElement | null>(null);
  const editorToolsMenuRef = useRef<HTMLDivElement | null>(null);
  const stackeditEditorRef = useRef<StackeditEditor | null>(null);
  const latestMarkdownRef = useRef(markdown);
  const lastSyncedEditorMarkdownRef = useRef(markdown);
  const onEditorKeyboardNavigationRef = useRef(onEditorKeyboardNavigation);
  const onEditorScrollRef = useRef(onEditorScroll);
  const onEditorSelectionChangeRef = useRef(onEditorSelectionChange);
  const onMarkdownChangeRef = useRef(onMarkdownChange);
  const suppressEditorScrollSyncRef = useRef(false);
  const suppressEditorScrollSyncTimerRef = useRef<number | null>(null);
  const restoreWindowScrollFrameRef = useRef<number | null>(null);
  const [editorToolsMenuOpen, setEditorToolsMenuOpen] = useState(false);
  const [visibleEditorActionCount, setVisibleEditorActionCount] = useState(editorActions.length);
  const visibleEditorActions = editorActions.slice(0, visibleEditorActionCount);
  const overflowEditorActions = editorActions.slice(visibleEditorActionCount);

  latestMarkdownRef.current = markdown;
  onEditorKeyboardNavigationRef.current = onEditorKeyboardNavigation;
  onEditorScrollRef.current = onEditorScroll;
  onEditorSelectionChangeRef.current = onEditorSelectionChange;
  onMarkdownChangeRef.current = onMarkdownChange;

  useLayoutEffect(() => {
    setEditorSurfaceRef(editorRef, editorPresentationMode === "rich" ? richEditorRef.current : rawEditorRef.current);
  }, [editorPresentationMode, editorRef]);

  useLayoutEffect(() => {
    const toolbarElement = editorToolbarRef.current;

    if (!toolbarElement) {
      return;
    }

    const toolbarNode: HTMLDivElement = toolbarElement;

    function updateVisibleEditorActions() {
      const width = toolbarNode.clientWidth;
      const visibleActionLimit = getEditorVisibleActionLimit();

      if (width <= 0) {
        return;
      }

      const fullWidth = editorActions.length * editorToolButtonEstimateWidth;

      if (width >= fullWidth && visibleActionLimit >= editorActions.length) {
        setVisibleEditorActionCount(editorActions.length);
        return;
      }

      const nextVisibleCount = Math.max(
        1,
        Math.min(
          visibleActionLimit,
          editorActions.length - 1,
          Math.floor((width - editorToolOverflowEstimateWidth) / editorToolButtonEstimateWidth)
        )
      );

      setVisibleEditorActionCount(nextVisibleCount);
    }

    updateVisibleEditorActions();
    const updateFrame = window.requestAnimationFrame(updateVisibleEditorActions);
    window.addEventListener("resize", updateVisibleEditorActions);

    if (typeof ResizeObserver === "undefined") {
      return () => {
        window.cancelAnimationFrame(updateFrame);
        window.removeEventListener("resize", updateVisibleEditorActions);
      };
    }

    const observer = new ResizeObserver(updateVisibleEditorActions);
    observer.observe(toolbarNode);

    return () => {
      window.cancelAnimationFrame(updateFrame);
      window.removeEventListener("resize", updateVisibleEditorActions);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (overflowEditorActions.length === 0) {
      setEditorToolsMenuOpen(false);
    }
  }, [overflowEditorActions.length]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (editorToolsMenuRef.current && !editorToolsMenuRef.current.contains(event.target as Node)) {
        setEditorToolsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (editorPresentationMode !== "rich" || !richEditorRef.current) {
      return;
    }

    let cancelled = false;
    const surface = richEditorRef.current;
    let removeSelectionSync: (() => void) | null = null;
    let initTimer = 0;

    function setupSelectionSync(editor: StackeditEditor) {
      const syncSelection = () => {
        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0) {
          return;
        }

        const anchorNode = selection.anchorNode;
        const focusNode = selection.focusNode;

        if (
          (anchorNode && surface.contains(anchorNode)) ||
          (focusNode && surface.contains(focusNode)) ||
          document.activeElement === surface
        ) {
          editor.selectionMgr.saveSelectionState(true, false);
          onEditorSelectionChangeRef.current?.(editor.selectionMgr.selectionStart);
        }
      };

      const handleKeyup = () => {
        syncSelection();
      };

      document.addEventListener("selectionchange", syncSelection);
      surface.addEventListener("keyup", handleKeyup);

      return () => {
        document.removeEventListener("selectionchange", syncSelection);
        surface.removeEventListener("keyup", handleKeyup);
      };
    }

    initTimer = window.setTimeout(() => {
      Promise.all([getStackeditEditorFactory(), getStackeditPrism()]).then(([cledit, Prism]) => {
        if (cancelled || !richEditorRef.current || richEditorRef.current !== surface) {
          return;
        }

        const existingEditor = getBoundStackeditEditor(surface);

        if (existingEditor) {
          stackeditEditorRef.current = existingEditor;
          lastSyncedEditorMarkdownRef.current = normalizeStackeditContent(existingEditor.getContent());
          existingEditor.toggleEditable(true);
          removeSelectionSync = setupSelectionSync(existingEditor);
          return;
        }

        const grammar = makeStackeditMarkdownGrammar();
        const editor = cledit(surface, surface, true);

        editor.on("contentChanged", (content: unknown) => {
          const nextMarkdown = normalizeStackeditContent(String(content ?? ""));

          if (nextMarkdown !== latestMarkdownRef.current) {
            latestMarkdownRef.current = nextMarkdown;
            lastSyncedEditorMarkdownRef.current = nextMarkdown;
            onMarkdownChangeRef.current(nextMarkdown);
          }

          onEditorSelectionChangeRef.current?.(editor.selectionMgr.selectionStart);
        });
        lastSyncedEditorMarkdownRef.current = latestMarkdownRef.current;
        editor.init({
          content: ensureStackeditTrailingLf(latestMarkdownRef.current),
          sectionHighlighter: (section: { text: string }) => Prism.highlight(section.text, grammar, "markdown"),
          sectionParser: parseStackeditSections
        });
        stackeditEditorRef.current = editor;
        bindStackeditEditor(surface, editor);
        removeSelectionSync = setupSelectionSync(editor);
        editor.toggleEditable(true);
      });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(initTimer);
      removeSelectionSync?.();

      const currentEditor = stackeditEditorRef.current;

      queueMicrotask(() => {
        if (!surface.isConnected) {
          unbindStackeditEditor(surface);

          if (stackeditEditorRef.current === currentEditor) {
            stackeditEditorRef.current = null;
          }

          if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
            window.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
          }
        }
      });
    };
  }, [editorPresentationMode]);

  useEffect(() => {
    const editor = stackeditEditorRef.current;

    if (editorPresentationMode !== "rich" || !editor) {
      return;
    }

    if (lastSyncedEditorMarkdownRef.current === markdown) {
      return;
    }

    const currentContent = normalizeStackeditContent(editor.getContent());

    if (currentContent !== markdown) {
      editor.setContent(ensureStackeditTrailingLf(markdown), true);
    }

    lastSyncedEditorMarkdownRef.current = markdown;
  }, [editorPresentationMode, markdown]);

  useEffect(() => {
    return () => {
      if (suppressEditorScrollSyncTimerRef.current !== null) {
        window.clearTimeout(suppressEditorScrollSyncTimerRef.current);
      }

      if (restoreWindowScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(restoreWindowScrollFrameRef.current);
      }
    };
  }, []);

  function isPlainEditorScrollNavigation(event: ReactKeyboardEvent<HTMLElement>) {
    return (
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      editorScrollSyncSuppressionKeys.has(event.key)
    );
  }

  function scheduleEditorScrollSyncSuppression() {
    if (suppressEditorScrollSyncTimerRef.current !== null) {
      window.clearTimeout(suppressEditorScrollSyncTimerRef.current);
    }

    suppressEditorScrollSyncRef.current = true;
    suppressEditorScrollSyncTimerRef.current = window.setTimeout(() => {
      suppressEditorScrollSyncRef.current = false;
      suppressEditorScrollSyncTimerRef.current = null;
    }, 250);
  }

  function preserveWindowScrollAfterNavigation(afterNavigation?: () => void) {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    if (restoreWindowScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(restoreWindowScrollFrameRef.current);
    }

    restoreWindowScrollFrameRef.current = window.requestAnimationFrame(() => {
      restoreWindowScrollFrameRef.current = null;

      if (window.scrollX !== scrollX || window.scrollY !== scrollY) {
        const rootStyle = document.documentElement.style;
        const previousScrollBehavior = rootStyle.scrollBehavior;

        rootStyle.scrollBehavior = "auto";
        window.scrollTo(scrollX, scrollY);
        rootStyle.scrollBehavior = previousScrollBehavior;
      }

      afterNavigation?.();
    });
  }

  function handleRichEditorNavigation(editor: StackeditEditor, element: HTMLDivElement) {
    const previousScrollTop = element.scrollTop;

    preserveWindowScrollAfterNavigation(() => {
      editor.selectionMgr.saveSelectionState(true, false);
      onEditorSelectionChangeRef.current?.(editor.selectionMgr.selectionStart);

      if (Math.abs(element.scrollTop - previousScrollTop) > 1) {
        onEditorKeyboardNavigationRef.current?.(editor.selectionMgr.selectionStart, element);
      }
    });
  }

  function handleRawEditorNavigation(element: HTMLTextAreaElement) {
    const previousScrollTop = element.scrollTop;

    preserveWindowScrollAfterNavigation(() => {
      onEditorSelectionChangeRef.current?.(element.selectionStart);

      if (Math.abs(element.scrollTop - previousScrollTop) > 1) {
        onEditorKeyboardNavigationRef.current?.(element.selectionStart, element);
      }
    });
  }

  function maybeHandleEditorScroll(element: HTMLTextAreaElement | HTMLDivElement) {
    if (suppressEditorScrollSyncRef.current) {
      return;
    }

    onEditorScrollRef.current?.(element);
  }

  function handleEditorAction(action: MarkdownEditorAction) {
    setEditorToolsMenuOpen(false);

    if (editorPresentationMode === "rich") {
      const editor = stackeditEditorRef.current;

      if (!editor) {
        return;
      }

      const currentMarkdown = normalizeStackeditContent(editor.getContent());
      const result = applyMarkdownAction(currentMarkdown, {
        action,
        selectionStart: editor.selectionMgr.selectionStart,
        selectionEnd: editor.selectionMgr.selectionEnd
      });

      latestMarkdownRef.current = result.markdown;
      lastSyncedEditorMarkdownRef.current = result.markdown;
      editor.setContent(ensureStackeditTrailingLf(result.markdown), true);
      editor.selectionMgr.setSelectionStartEnd(result.selectionStart, result.selectionEnd);
      editor.focus();
      onMarkdownChangeRef.current(result.markdown);
      return;
    }

    const editor = rawEditorRef.current;
    const result = applyMarkdownAction(markdown, {
      action,
      selectionStart: editor?.selectionStart ?? markdown.length,
      selectionEnd: editor?.selectionEnd ?? markdown.length
    });

    onMarkdownChangeRef.current(result.markdown);

    requestAnimationFrame(() => {
      if (!rawEditorRef.current) {
        return;
      }

      rawEditorRef.current.focus();
      rawEditorRef.current.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  function handleRichEditorShortcut(event: ReactKeyboardEvent<HTMLDivElement>) {
    const editor = stackeditEditorRef.current;

    if (!editor || event.nativeEvent.isComposing) {
      return;
    }

    if (isPlainEditorScrollNavigation(event)) {
      event.stopPropagation();
      scheduleEditorScrollSyncSuppression();
      handleRichEditorNavigation(editor, event.currentTarget);
    }

    const command = getEditorShortcutCommand(event);

    if (!command) {
      return;
    }

    if (command.type === "history") {
      event.preventDefault();
      window.setTimeout(() => {
        editor.focus();
        if (command.direction === "undo") {
          editor.undoMgr.undo();
        } else {
          editor.undoMgr.redo();
        }
      }, 10);
      return;
    }

    if (command.type === "selectAll") {
      event.preventDefault();
      editor.focus();
      editor.selectionMgr.setSelectionStartEnd(0, getRichEditorContentLength(editor));
      return;
    }

    event.preventDefault();
    editor.selectionMgr.saveSelectionState(true, false);
    handleEditorAction(command.action);
  }

  function handleRawEditorShortcut(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) {
      return;
    }

    if (isPlainEditorScrollNavigation(event)) {
      event.stopPropagation();
      scheduleEditorScrollSyncSuppression();
      handleRawEditorNavigation(event.currentTarget);
    }

    const command = getEditorShortcutCommand(event);

    if (!command || command.type === "history") {
      return;
    }

    if (command.type === "selectAll") {
      event.preventDefault();
      event.currentTarget.focus();
      event.currentTarget.setSelectionRange(0, event.currentTarget.value.length);
      return;
    }

    event.preventDefault();
    handleEditorAction(command.action);
  }

  return (
    <section
      className="workspace-card workspace-pane workspace-pane--editor"
      data-editor-view={editorPresentationMode}
      data-visible={visible}
      data-testid="source-panel"
    >
      <div className="workspace-pane-header workspace-pane-header--editor">
        <div className="source-pane-controls">
          <div
            className="workspace-editor-toolbar"
            ref={editorToolbarRef}
            role="toolbar"
            aria-label={messages.formatting}
          >
            {visibleEditorActions.map((entry) => (
              <button
                aria-label={messages.actions[entry.action]}
                className="editor-tool-button"
                key={entry.action}
                onClick={() => handleEditorAction(entry.action)}
                onMouseDown={(event) => event.preventDefault()}
                title={getEditorActionShortcutLabel(entry.action) ? `${messages.actions[entry.action]} (${getEditorActionShortcutLabel(entry.action)})` : messages.actions[entry.action]}
                type="button"
              >
                <span aria-hidden="true">{entry.icon}</span>
              </button>
            ))}
            {overflowEditorActions.length ? (
              <div className="editor-tools-overflow" ref={editorToolsMenuRef}>
                <button
                  aria-expanded={editorToolsMenuOpen}
                  aria-haspopup="menu"
                  aria-label={messages.moreTools}
                  className="editor-tool-button editor-tool-button--overflow"
                  onClick={() => setEditorToolsMenuOpen((open) => !open)}
                  onMouseDown={(event) => event.preventDefault()}
                  title={messages.moreTools}
                  type="button"
                >
                  <span aria-hidden="true">…</span>
                </button>
                {editorToolsMenuOpen ? (
                  <div aria-label={messages.moreTools} className="editor-tools-menu" role="menu">
                    {overflowEditorActions.map((entry) => (
                      <button
                        className="editor-tools-menu-button"
                        key={entry.action}
                        onClick={() => handleEditorAction(entry.action)}
                        role="menuitem"
                        type="button"
                      >
                        <span aria-hidden="true" className="editor-tools-menu-icon">
                          {entry.icon}
                        </span>
                        <span>{messages.actions[entry.action]}</span>
                        {getEditorActionShortcutLabel(entry.action) ? (
                          <span className="editor-tools-menu-shortcut">
                            {getEditorActionShortcutLabel(entry.action)}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="editor-mode-toggle" role="group" aria-label={messages.modeLabel}>
            <button
              className="editor-mode-button"
              data-active={editorPresentationMode === "rich"}
              onClick={() => onEditorPresentationModeChange("rich")}
              type="button"
            >
              {messages.rich}
            </button>
            <button
              className="editor-mode-button"
              data-active={editorPresentationMode === "raw"}
              onClick={() => onEditorPresentationModeChange("raw")}
              type="button"
            >
              {messages.raw}
            </button>
          </div>
        </div>
      </div>
      <div className="workspace-editor-shell" data-editor-view={editorPresentationMode}>
        {editorPresentationMode === "rich" ? (
          <div
            aria-label={messages.markdownLabel}
            aria-multiline="true"
            className="workspace-editor-surface workspace-editor-surface--stackedit"
            data-testid="editor-rich-surface"
            id="workspace-markdown-editor"
            onKeyDown={handleRichEditorShortcut}
            onScroll={(event) => maybeHandleEditorScroll(event.currentTarget)}
            ref={(node) => {
              richEditorRef.current = node;

              if (editorPresentationMode === "rich") {
                setEditorSurfaceRef(editorRef, node);
              }
            }}
            role="textbox"
            spellCheck={false}
            tabIndex={0}
          />
        ) : (
          <textarea
            aria-label={messages.markdownLabel}
            className="textarea workspace-editor-input"
            id="workspace-markdown-editor"
            onChange={(event) => {
              onMarkdownChangeRef.current(event.currentTarget.value);
              onEditorSelectionChangeRef.current?.(event.currentTarget.selectionStart);
            }}
            onClick={(event) => onEditorSelectionChangeRef.current?.(event.currentTarget.selectionStart)}
            onKeyDown={handleRawEditorShortcut}
            onKeyUp={(event) => onEditorSelectionChangeRef.current?.(event.currentTarget.selectionStart)}
            onScroll={(event) => maybeHandleEditorScroll(event.currentTarget)}
            onSelect={(event) => onEditorSelectionChangeRef.current?.(event.currentTarget.selectionStart)}
            placeholder={messages.placeholder}
            ref={(node) => {
              rawEditorRef.current = node;

              if (editorPresentationMode === "raw") {
                setEditorSurfaceRef(editorRef, node);
              }
            }}
            spellCheck={false}
            value={markdown}
          />
        )}
      </div>
    </section>
  );
}
