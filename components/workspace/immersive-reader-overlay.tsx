"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent
} from "react";
import { ListTree, Type, X } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import {
  WorkspacePreviewTypographyControls,
  type WorkspacePreviewFont
} from "@/components/workspace/workspace-preview-typography-controls";
import { WorkspaceThemeSelector } from "@/components/workspace/workspace-theme-selector";
import type { Locale } from "@/lib/i18n/locales";
import type { WorkspaceMessages } from "@/lib/i18n/messages";
import type { ExtractedHeading } from "@/lib/markdown/extract-headings";
import type { WorkspaceTheme } from "@/lib/workspace/themes";

type ImmersiveReaderOverlayProps = {
  documentTitle: string;
  font: WorkspacePreviewFont;
  fontSize: number;
  headings: ExtractedHeading[];
  initialScrollTop?: number;
  lineHeight: number;
  locale: Locale;
  margin: number;
  markdown: string;
  maxFontSize: number;
  maxLineHeight: number;
  maxMargin: number;
  messages: WorkspaceMessages["preview"];
  minFontSize: number;
  minLineHeight: number;
  minMargin: number;
  onClose: () => void;
  onFontChange: (font: WorkspacePreviewFont) => void;
  onFontSizeChange: (fontSize: number) => void;
  onLineHeightChange: (lineHeight: number) => void;
  onLinkClick?: (href: string) => boolean | void;
  onMarginChange: (margin: number) => void;
  onThemeChange: (theme: WorkspaceTheme) => void;
  readerStyle: CSSProperties;
  theme: WorkspaceTheme;
};

export function ImmersiveReaderOverlay({
  documentTitle,
  font,
  fontSize,
  headings,
  initialScrollTop = 0,
  lineHeight,
  locale,
  margin,
  markdown,
  maxFontSize,
  maxLineHeight,
  maxMargin,
  messages,
  minFontSize,
  minLineHeight,
  minMargin,
  onClose,
  onFontChange,
  onFontSizeChange,
  onLineHeightChange,
  onLinkClick,
  onMarginChange,
  onThemeChange,
  readerStyle,
  theme
}: ImmersiveReaderOverlayProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const hideControlsTimerRef = useRef<number | undefined>(undefined);
  const [activeHeadingId, setActiveHeadingId] = useState(headings[0]?.id ?? "");
  const [controlsVisible, setControlsVisible] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const controlsLockedOpen = navOpen || settingsOpen;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(hideControlsTimerRef.current);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useLayoutEffect(() => {
    const scrollRegion = scrollRef.current;

    if (!scrollRegion) {
      return;
    }

    scrollRegion.scrollTop = Math.max(0, Math.round(initialScrollTop));
    updateProgress(scrollRegion);
  }, [initialScrollTop]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (navOpen || settingsOpen) {
        setNavOpen(false);
        setSettingsOpen(false);
        setControlsVisible(true);
        return;
      }

      onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navOpen, onClose, settingsOpen]);

  useEffect(() => {
    if (controlsLockedOpen) {
      window.clearTimeout(hideControlsTimerRef.current);
      setControlsVisible(true);
      return;
    }

    scheduleControlsHide();
  }, [controlsLockedOpen]);

  function updateProgress(scrollRegion: HTMLDivElement) {
    const maxScrollTop = Math.max(0, scrollRegion.scrollHeight - scrollRegion.clientHeight);
    const nextProgress = maxScrollTop > 0 ? Math.min(100, Math.max(0, (scrollRegion.scrollTop / maxScrollTop) * 100)) : 0;

    setProgress(nextProgress);
  }

  function revealControls() {
    setControlsVisible(true);

    if (!controlsLockedOpen) {
      scheduleControlsHide();
    }
  }

  function scheduleControlsHide() {
    window.clearTimeout(hideControlsTimerRef.current);

    hideControlsTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 1800);
  }

  function handleOverlayPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") {
      revealControls();
    }
  }

  function handleOverlayPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") {
      revealControls();
    }
  }

  function navigateToHeading(id: string) {
    const scrollRegion = scrollRef.current;
    const target = scrollRegion?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);

    if (!target) {
      return;
    }

    setActiveHeadingId(id);
    target.scrollIntoView({ block: "start" });
    setNavOpen(false);
    revealControls();
  }

  return (
    <div
      aria-label={messages.immersiveReader}
      aria-modal="true"
      className="immersive-reader-overlay"
      data-controls-visible={controlsVisible || controlsLockedOpen}
      onPointerDown={handleOverlayPointerDown}
      onPointerMove={handleOverlayPointerMove}
      role="dialog"
    >
      <div aria-hidden="true" className="immersive-reader-progress" data-testid="immersive-reader-progress">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
      <div className="immersive-reader-chrome">
        {headings.length > 0 ? (
          <button
            aria-expanded={navOpen}
            aria-label={messages.contents}
            className="immersive-reader-icon-button"
            onClick={() => {
              setSettingsOpen(false);
              setNavOpen((open) => !open);
            }}
            type="button"
          >
            <ListTree aria-hidden="true" size={20} strokeWidth={2} />
          </button>
        ) : null}
        <button
          aria-expanded={settingsOpen}
          aria-label={messages.immersiveSettings}
          className="immersive-reader-icon-button"
          onClick={() => {
            setNavOpen(false);
            setSettingsOpen((open) => !open);
          }}
          type="button"
        >
          <Type aria-hidden="true" size={20} strokeWidth={2} />
        </button>
        <button
          aria-label={messages.closeImmersiveReader}
          className="immersive-reader-icon-button"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" size={20} strokeWidth={2} />
        </button>
      </div>
      {navOpen ? (
        <aside aria-label={messages.contents} className="immersive-reader-panel immersive-reader-panel--contents">
          <nav className="immersive-reader-contents">
            {headings.map((heading) => (
              <button
                aria-current={activeHeadingId === heading.id ? "location" : undefined}
                className="immersive-reader-content-item"
                data-depth={heading.depth}
                key={`${heading.id}-${heading.depth}`}
                onClick={() => navigateToHeading(heading.id)}
                type="button"
              >
                {heading.text}
              </button>
            ))}
          </nav>
        </aside>
      ) : null}
      {settingsOpen ? (
        <aside aria-label={messages.immersiveSettings} className="immersive-reader-panel immersive-reader-panel--settings">
          <WorkspaceThemeSelector compact messages={messages} onThemeChange={onThemeChange} theme={theme} />
          <WorkspacePreviewTypographyControls
            compact
            font={font}
            fontSize={fontSize}
            lineHeight={lineHeight}
            margin={margin}
            maxFontSize={maxFontSize}
            maxLineHeight={maxLineHeight}
            maxMargin={maxMargin}
            messages={messages}
            minFontSize={minFontSize}
            minLineHeight={minLineHeight}
            minMargin={minMargin}
            onFontChange={onFontChange}
            onFontSizeChange={onFontSizeChange}
            onLineHeightChange={onLineHeightChange}
            onMarginChange={onMarginChange}
          />
        </aside>
      ) : null}
      <div
        className="workspace-reader-body immersive-reader-scroll"
        data-locale={locale}
        data-testid="immersive-reader-scroll-region"
        onScroll={(event) => updateProgress(event.currentTarget)}
        ref={scrollRef}
        style={readerStyle}
      >
        <article aria-label={documentTitle} className="immersive-reader-document">
          <MarkdownRenderer markdown={markdown} onLinkClick={onLinkClick} />
        </article>
      </div>
    </div>
  );
}
