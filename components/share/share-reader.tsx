"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
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
import { extractHeadings } from "@/lib/markdown/extract-headings";
import {
  clampPreviewFontSize,
  clampPreviewMargin,
  defaultPreviewFont,
  defaultPreviewFontSize,
  defaultPreviewMargin,
  getPreviewMarginCss,
  maxPreviewFontSize,
  maxPreviewMargin,
  minPreviewFontSize,
  minPreviewMargin,
  workspacePreviewFontSizeStorageKey,
  workspacePreviewFontStorageKey,
  workspacePreviewMarginStorageKey
} from "@/lib/workspace/preview-settings";
import { defaultWorkspaceTheme, isWorkspaceTheme, type WorkspaceTheme } from "@/lib/workspace/themes";

type ShareReaderProps = {
  documentTitle: string;
  locale: Locale;
  markdown: string;
};

const workspaceThemeStorageKey = "markdownviewer.workspace.theme";
const workspaceTemplateStorageKey = "markdownviewer.workspace.template";

function readStoredNumber(key: string, fallback: number) {
  const value = window.localStorage.getItem(key);
  const parsed = value ? Number(value) : Number.NaN;

  return Number.isFinite(parsed) ? parsed : fallback;
}

export function ShareReader({ documentTitle, locale, markdown }: ShareReaderProps) {
  const messages = getMessages(locale).workspace;
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<WorkspaceTheme>(defaultWorkspaceTheme);
  const [previewFont, setPreviewFont] = useState<WorkspacePreviewFont>(defaultPreviewFont);
  const [previewFontSize, setPreviewFontSize] = useState(defaultPreviewFontSize);
  const [previewMargin, setPreviewMargin] = useState(defaultPreviewMargin);
  const [tocOpen, setTocOpen] = useState(false);
  const headings = useMemo(() => extractHeadings(markdown), [markdown]);
  const hasHeadings = headings.length > 0;
  const previewReaderStyle = {
    "--workspace-preview-font-family": getWorkspacePreviewFontStack(previewFont),
    "--workspace-preview-font-size": `${previewFontSize}px`,
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
    window.localStorage.setItem(workspacePreviewMarginStorageKey, String(previewMargin));
  }, [previewMargin]);

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
        margin={previewMargin}
        maxMargin={maxPreviewMargin}
        maxFontSize={maxPreviewFontSize}
        messages={messages.preview}
        minMargin={minPreviewMargin}
        minFontSize={minPreviewFontSize}
        onFontChange={setPreviewFont}
        onFontSizeChange={(nextFontSize) => setPreviewFontSize(clampPreviewFontSize(nextFontSize))}
        onMarginChange={(nextMargin) => setPreviewMargin(clampPreviewMargin(nextMargin))}
        showMarginControl={showMarginControl}
      />
    );
  }

  return (
    <>
      <section className="workspace-card workspace-pane workspace-pane--preview workspace-preview-shell share-reader-shell" data-testid="preview-panel">
        <div className="workspace-pane-header workspace-pane-header--preview share-reader-toolbar">
          <div className="workspace-preview-header-controls">
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
        </div>
      </section>
      {hasHeadings ? (
        <OutlinePanel
          documentTitle={documentTitle}
          headings={headings}
          messages={messages.preview}
          onNavigate={handleTocNavigate}
          onToggle={() => setTocOpen((current) => !current)}
          open={tocOpen}
        />
      ) : null}
    </>
  );
}
