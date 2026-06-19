"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { BookOpen, Keyboard } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { ImmersiveReaderOverlay } from "@/components/workspace/immersive-reader-overlay";
import { OutlinePanel } from "@/components/workspace/outline-panel";
import { ShortcutHelpDialog } from "@/components/workspace/shortcut-help";
import {
  getWorkspacePreviewFontStack,
  isWorkspacePreviewFont,
  WorkspacePreviewTypographyControls,
  type WorkspacePreviewFont
} from "@/components/workspace/workspace-preview-typography-controls";
import { WorkspaceThemeSelector } from "@/components/workspace/workspace-theme-selector";
import { getMessages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locales";
import { trackProductEvent } from "@/lib/analytics/product-events";
import { extractHeadings } from "@/lib/markdown/extract-headings";
import {
  clampPreviewFontSize,
  clampPreviewLineHeight,
  clampPreviewMargin,
  defaultPreviewFont,
  defaultPreviewFontSize,
  defaultPreviewLineHeight,
  defaultPreviewMargin,
  getPreviewMarginCss,
  maxPreviewFontSize,
  maxPreviewLineHeight,
  maxPreviewMargin,
  minPreviewFontSize,
  minPreviewLineHeight,
  minPreviewMargin,
  workspacePreviewLineHeightStorageKey,
  workspacePreviewFontSizeStorageKey,
  workspacePreviewFontStorageKey,
  workspacePreviewMarginStorageKey
} from "@/lib/workspace/preview-settings";
import { defaultWorkspaceTheme, isWorkspaceTheme, type WorkspaceTheme } from "@/lib/workspace/themes";
import {
  getShortcutById,
  getShortcutPlatform,
  isEditableShortcutTarget,
  matchesShortcut,
  shareReaderShortcutDefinitions,
  shortcutTitle,
  type ShortcutId,
  type ShortcutPlatform
} from "@/lib/workspace/keyboard-shortcuts";

type ShareReaderProps = {
  documentTitle: string;
  editCopyHref: string;
  locale: Locale;
  markdown: string;
  openWorkspaceHref: string;
  shareId: string;
  useTemplateHref: string;
};

const workspaceThemeStorageKey = "markdownviewer.workspace.theme";
const workspaceTemplateStorageKey = "markdownviewer.workspace.template";

function readStoredNumber(key: string, fallback: number) {
  const value = window.localStorage.getItem(key);
  const parsed = value ? Number(value) : Number.NaN;

  return Number.isFinite(parsed) ? parsed : fallback;
}

export function ShareReader({
  documentTitle,
  editCopyHref,
  locale,
  markdown,
  openWorkspaceHref,
  shareId,
  useTemplateHref
}: ShareReaderProps) {
  const localizedMessages = getMessages(locale);
  const messages = localizedMessages.workspace;
  const shareMessages = localizedMessages.share;
  const editCopyLinkRef = useRef<HTMLAnchorElement | null>(null);
  const openWorkspaceLinkRef = useRef<HTMLAnchorElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const useTemplateLinkRef = useRef<HTMLAnchorElement | null>(null);
  const [theme, setTheme] = useState<WorkspaceTheme>(defaultWorkspaceTheme);
  const [previewFont, setPreviewFont] = useState<WorkspacePreviewFont>(defaultPreviewFont);
  const [previewFontSize, setPreviewFontSize] = useState(defaultPreviewFontSize);
  const [previewLineHeight, setPreviewLineHeight] = useState(defaultPreviewLineHeight);
  const [previewMargin, setPreviewMargin] = useState(defaultPreviewMargin);
  const [immersiveReaderOpen, setImmersiveReaderOpen] = useState(false);
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const [shortcutPlatform, setShortcutPlatform] = useState<ShortcutPlatform>("windows");
  const [tocOpen, setTocOpen] = useState(false);
  const headings = useMemo(() => extractHeadings(markdown), [markdown]);
  const hasHeadings = headings.length > 0;
  const previewReaderStyle = {
    "--workspace-preview-font-family": getWorkspacePreviewFontStack(previewFont),
    "--workspace-preview-font-size": `${previewFontSize}px`,
    "--workspace-preview-line-height": `${previewLineHeight / 100}`,
    "--workspace-preview-inline-margin": getPreviewMarginCss(previewMargin)
  } as CSSProperties;

  useEffect(() => {
    setShortcutPlatform(getShortcutPlatform());
  }, []);

  function getShareReaderShortcutTitle(label: string, id: ShortcutId) {
    const shortcut = getShortcutById(shareReaderShortcutDefinitions, id);

    return shortcut ? shortcutTitle(label, shortcut.combo, shortcutPlatform) : label;
  }
  const previewTypographyShortcutTitles = {
    decreaseFont: getShareReaderShortcutTitle(messages.preview.decreaseFont, "decrease-font"),
    increaseFont: getShareReaderShortcutTitle(messages.preview.increaseFont, "increase-font"),
    decreaseLineHeight: getShareReaderShortcutTitle(messages.preview.decreaseLineHeight, "decrease-line-height"),
    increaseLineHeight: getShareReaderShortcutTitle(messages.preview.increaseLineHeight, "increase-line-height"),
    decreaseMargin: getShareReaderShortcutTitle(messages.preview.decreaseMargin, "decrease-margin"),
    increaseMargin: getShareReaderShortcutTitle(messages.preview.increaseMargin, "increase-margin")
  };

  useEffect(() => {
    const storedTheme =
      window.localStorage.getItem(workspaceThemeStorageKey) ?? window.localStorage.getItem(workspaceTemplateStorageKey);

    if (isWorkspaceTheme(storedTheme)) {
      setTheme(storedTheme);
    }

    const storedFont = window.localStorage.getItem(workspacePreviewFontStorageKey);

    if (isWorkspacePreviewFont(storedFont)) {
      setPreviewFont(storedFont);
    }

    setPreviewFontSize(clampPreviewFontSize(readStoredNumber(workspacePreviewFontSizeStorageKey, defaultPreviewFontSize)));
    setPreviewLineHeight(
      clampPreviewLineHeight(readStoredNumber(workspacePreviewLineHeightStorageKey, defaultPreviewLineHeight))
    );
    setPreviewMargin(clampPreviewMargin(readStoredNumber(workspacePreviewMarginStorageKey, defaultPreviewMargin)));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(workspaceTemplateStorageKey, theme);
    window.localStorage.setItem(workspaceThemeStorageKey, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(workspacePreviewFontStorageKey, previewFont);
  }, [previewFont]);

  useEffect(() => {
    window.localStorage.setItem(workspacePreviewFontSizeStorageKey, String(previewFontSize));
  }, [previewFontSize]);

  useEffect(() => {
    window.localStorage.setItem(workspacePreviewLineHeightStorageKey, String(previewLineHeight));
  }, [previewLineHeight]);

  useEffect(() => {
    window.localStorage.setItem(workspacePreviewMarginStorageKey, String(previewMargin));
  }, [previewMargin]);

  useEffect(() => {
    trackProductEvent("share_reader_opened", {
      document_title: documentTitle,
      share_id: shareId
    });
  }, [documentTitle, shareId]);

  useEffect(() => {
    function handleShareReaderShortcut(event: KeyboardEvent) {
      if (event.isComposing) {
        return;
      }

      const shortcut = shareReaderShortcutDefinitions.find((definition) =>
        matchesShortcut(event, definition.combo, shortcutPlatform)
      );

      if (!shortcut) {
        return;
      }

      if (shortcut.id !== "close-overlay" && isEditableShortcutTarget(event.target)) {
        return;
      }

      if (shortcut.id === "close-overlay") {
        if (shortcutHelpOpen) {
          event.preventDefault();
          setShortcutHelpOpen(false);
          return;
        }

        if (tocOpen) {
          event.preventDefault();
          setTocOpen(false);
          return;
        }

        if (immersiveReaderOpen) {
          event.preventDefault();
          setImmersiveReaderOpen(false);
        }

        return;
      }

      if (shortcut.id === "shortcut-help") {
        event.preventDefault();
        setShortcutHelpOpen(true);
        return;
      }

      if (shortcut.id === "toggle-contents") {
        if (!hasHeadings) {
          return;
        }

        event.preventDefault();
        setTocOpen((current) => !current);
        return;
      }

      if (shortcut.id === "immersive-reader") {
        event.preventDefault();
        setImmersiveReaderOpen(true);
        return;
      }

      if (shortcut.id === "increase-font" || shortcut.id === "decrease-font") {
        event.preventDefault();
        setPreviewFontSize((current) =>
          clampPreviewFontSize(current + (shortcut.id === "increase-font" ? 1 : -1))
        );
        return;
      }

      if (shortcut.id === "increase-line-height" || shortcut.id === "decrease-line-height") {
        event.preventDefault();
        setPreviewLineHeight((current) =>
          clampPreviewLineHeight(current + (shortcut.id === "increase-line-height" ? 5 : -5))
        );
        return;
      }

      if (shortcut.id === "increase-margin" || shortcut.id === "decrease-margin") {
        event.preventDefault();
        setPreviewMargin((current) =>
          clampPreviewMargin(current + (shortcut.id === "increase-margin" ? 1 : -1))
        );
        return;
      }

      if (shortcut.id === "share-open-workspace") {
        event.preventDefault();
        openWorkspaceLinkRef.current?.click();
        return;
      }

      if (shortcut.id === "share-edit-copy") {
        event.preventDefault();
        editCopyLinkRef.current?.click();
        return;
      }

      if (shortcut.id === "share-use-template") {
        event.preventDefault();
        useTemplateLinkRef.current?.click();
      }
    }

    window.addEventListener("keydown", handleShareReaderShortcut);

    return () => {
      window.removeEventListener("keydown", handleShareReaderShortcut);
    };
  }, [hasHeadings, immersiveReaderOpen, shortcutHelpOpen, shortcutPlatform, tocOpen]);

  function handleTocNavigate(id: string) {
    const target = previewRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);

    if (!target || !previewRef.current) {
      return;
    }

    target.scrollIntoView({ block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  }

  function renderTypographyControls(showMarginControl = true) {
    return (
      <WorkspacePreviewTypographyControls
        font={previewFont}
        fontSize={previewFontSize}
        lineHeight={previewLineHeight}
        margin={previewMargin}
        maxLineHeight={maxPreviewLineHeight}
        maxMargin={maxPreviewMargin}
        maxFontSize={maxPreviewFontSize}
        messages={messages.preview}
        minLineHeight={minPreviewLineHeight}
        minMargin={minPreviewMargin}
        minFontSize={minPreviewFontSize}
        onFontChange={setPreviewFont}
        onFontSizeChange={(nextFontSize) => setPreviewFontSize(clampPreviewFontSize(nextFontSize))}
        onLineHeightChange={(nextLineHeight) => setPreviewLineHeight(clampPreviewLineHeight(nextLineHeight))}
        onMarginChange={(nextMargin) => setPreviewMargin(clampPreviewMargin(nextMargin))}
        shortcutTitles={previewTypographyShortcutTitles}
        showMarginControl={showMarginControl}
      />
    );
  }

  function trackShareReaderAction(eventName: string) {
    trackProductEvent(eventName, {
      share_id: shareId,
      source: "share_reader"
    });
  }

  return (
    <>
      <section className="workspace-card workspace-pane workspace-pane--preview workspace-preview-shell share-reader-shell" data-testid="preview-panel">
        <div className="workspace-pane-header workspace-pane-header--preview share-reader-toolbar">
          <div className="workspace-preview-header-controls">
            <button
              aria-label={messages.preview.immersiveReader}
              className="toolbar-button workspace-preview-immersive-button"
              onClick={() => setImmersiveReaderOpen(true)}
              title={getShareReaderShortcutTitle(messages.preview.immersiveReader, "immersive-reader")}
              type="button"
            >
              <BookOpen aria-hidden="true" className="workspace-preview-control-icon" size={18} strokeWidth={2.2} />
            </button>
            <button
              aria-label={messages.shortcuts.button}
              className="toolbar-button workspace-shortcuts-button share-reader-shortcuts-button"
              onClick={() => setShortcutHelpOpen(true)}
              title={getShareReaderShortcutTitle(messages.shortcuts.button, "shortcut-help")}
              type="button"
            >
              <Keyboard aria-hidden="true" size={18} strokeWidth={2.2} />
            </button>
            <WorkspaceThemeSelector messages={messages.preview} onThemeChange={setTheme} theme={theme} />
            {renderTypographyControls()}
          </div>
        </div>
        <div
          className="workspace-reader-body"
          data-locale={locale}
          data-testid="preview-scroll-region"
          ref={previewRef}
          style={previewReaderStyle}
        >
          <MarkdownRenderer markdown={markdown} />
        </div>
        <div className="workspace-preview-bottom-bar share-reader-bottom-bar">
          <div className="workspace-preview-bottom-controls">
            <WorkspaceThemeSelector messages={messages.preview} onThemeChange={setTheme} theme={theme} />
            {renderTypographyControls(false)}
          </div>
          <div aria-label={shareMessages.readerCtaLabel} className="share-reader-cta">
            <span className="share-reader-cta__label">{shareMessages.readerCtaLabel}</span>
            <a
              className="share-reader-cta__link"
              href={openWorkspaceHref}
              onClick={() => trackShareReaderAction("share_reader_open_workspace_clicked")}
              ref={openWorkspaceLinkRef}
              title={getShareReaderShortcutTitle(shareMessages.openInWorkspace, "share-open-workspace")}
            >
              {shareMessages.openInWorkspace}
            </a>
            <a
              className="share-reader-cta__link share-reader-cta__link--primary"
              href={editCopyHref}
              onClick={() => trackShareReaderAction("share_reader_edit_copy_clicked")}
              ref={editCopyLinkRef}
              title={getShareReaderShortcutTitle(shareMessages.editCopy, "share-edit-copy")}
            >
              {shareMessages.editCopy}
            </a>
            <a
              className="share-reader-cta__link"
              href={useTemplateHref}
              onClick={() => trackShareReaderAction("share_reader_use_template_clicked")}
              ref={useTemplateLinkRef}
              title={getShareReaderShortcutTitle(shareMessages.useTemplate, "share-use-template")}
            >
              {shareMessages.useTemplate}
            </a>
          </div>
        </div>
      </section>
      {hasHeadings ? (
        <OutlinePanel
          documentTitle={documentTitle}
          headings={headings}
          messages={messages.preview}
          onClose={() => setTocOpen(false)}
          onNavigate={handleTocNavigate}
          onToggle={() => setTocOpen((current) => !current)}
          open={tocOpen}
          triggerTitle={getShareReaderShortcutTitle(tocOpen ? messages.preview.closeContents : messages.preview.contents, "toggle-contents")}
        />
      ) : null}
      {immersiveReaderOpen ? (
        <ImmersiveReaderOverlay
          documentTitle={documentTitle}
          headings={headings}
          initialScrollTop={previewRef.current?.scrollTop ?? 0}
          locale={locale}
          markdown={markdown}
          messages={messages.preview}
          onClose={() => setImmersiveReaderOpen(false)}
          readerStyle={previewReaderStyle}
        />
      ) : null}
      {shortcutHelpOpen ? (
        <ShortcutHelpDialog
          messages={messages.shortcuts}
          onClose={() => setShortcutHelpOpen(false)}
          platform={shortcutPlatform}
          shortcuts={shareReaderShortcutDefinitions}
        />
      ) : null}
    </>
  );
}
