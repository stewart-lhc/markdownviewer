"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { BookOpen } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { ImmersiveReaderOverlay } from "@/components/workspace/immersive-reader-overlay";
import { OutlinePanel } from "@/components/workspace/outline-panel";
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
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<WorkspaceTheme>(defaultWorkspaceTheme);
  const [previewFont, setPreviewFont] = useState<WorkspacePreviewFont>(defaultPreviewFont);
  const [previewFontSize, setPreviewFontSize] = useState(defaultPreviewFontSize);
  const [previewLineHeight, setPreviewLineHeight] = useState(defaultPreviewLineHeight);
  const [previewMargin, setPreviewMargin] = useState(defaultPreviewMargin);
  const [immersiveReaderOpen, setImmersiveReaderOpen] = useState(false);
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
              title={messages.preview.immersiveReader}
              type="button"
            >
              <BookOpen aria-hidden="true" className="workspace-preview-control-icon" size={18} strokeWidth={2.2} />
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
            >
              {shareMessages.openInWorkspace}
            </a>
            <a
              className="share-reader-cta__link share-reader-cta__link--primary"
              href={editCopyHref}
              onClick={() => trackShareReaderAction("share_reader_edit_copy_clicked")}
            >
              {shareMessages.editCopy}
            </a>
            <a
              className="share-reader-cta__link"
              href={useTemplateHref}
              onClick={() => trackShareReaderAction("share_reader_use_template_clicked")}
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
        />
      ) : null}
      {immersiveReaderOpen ? (
        <ImmersiveReaderOverlay
          documentTitle={documentTitle}
          font={previewFont}
          fontSize={previewFontSize}
          headings={headings}
          initialScrollTop={previewRef.current?.scrollTop ?? 0}
          lineHeight={previewLineHeight}
          locale={locale}
          margin={previewMargin}
          markdown={markdown}
          maxFontSize={maxPreviewFontSize}
          maxLineHeight={maxPreviewLineHeight}
          maxMargin={maxPreviewMargin}
          messages={messages.preview}
          minFontSize={minPreviewFontSize}
          minLineHeight={minPreviewLineHeight}
          minMargin={minPreviewMargin}
          onClose={() => setImmersiveReaderOpen(false)}
          onFontChange={setPreviewFont}
          onFontSizeChange={(nextFontSize) => setPreviewFontSize(clampPreviewFontSize(nextFontSize))}
          onLineHeightChange={(nextLineHeight) => setPreviewLineHeight(clampPreviewLineHeight(nextLineHeight))}
          onMarginChange={(nextMargin) => setPreviewMargin(clampPreviewMargin(nextMargin))}
          onThemeChange={setTheme}
          readerStyle={previewReaderStyle}
          theme={theme}
        />
      ) : null}
    </>
  );
}
