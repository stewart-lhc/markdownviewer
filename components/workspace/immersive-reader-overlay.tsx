"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent
} from "react";
import { ListTree, X } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import type { Locale } from "@/lib/i18n/locales";
import type { WorkspaceMessages } from "@/lib/i18n/messages";
import type { ExtractedHeading } from "@/lib/markdown/extract-headings";

type ImmersiveReaderOverlayProps = {
  documentTitle: string;
  headings: ExtractedHeading[];
  initialScrollTop?: number;
  locale: Locale;
  markdown: string;
  messages: WorkspaceMessages["preview"];
  onClose: () => void;
  onLinkClick?: (href: string) => boolean | void;
  readerStyle: CSSProperties;
};

export function ImmersiveReaderOverlay({
  documentTitle,
  headings,
  initialScrollTop = 0,
  locale,
  markdown,
  messages,
  onClose,
  onLinkClick,
  readerStyle
}: ImmersiveReaderOverlayProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const navRootRef = useRef<HTMLDivElement | null>(null);
  const hideControlsTimerRef = useRef<number | undefined>(undefined);
  const [activeHeadingId, setActiveHeadingId] = useState(headings[0]?.id ?? "");
  const [controlsVisible, setControlsVisible] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const controlsLockedOpen = navOpen;

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

      if (navOpen) {
        setNavOpen(false);
        setControlsVisible(true);
        return;
      }

      onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navOpen, onClose]);

  useEffect(() => {
    if (!navOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node) || navRootRef.current?.contains(target)) {
        return;
      }

      setNavOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [navOpen]);

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

  function handlePanelWheel(event: ReactWheelEvent<HTMLElement>) {
    const panel = event.currentTarget;

    event.stopPropagation();

    if (event.deltaY === 0) {
      return;
    }

    const maxScrollTop = Math.max(0, panel.scrollHeight - panel.clientHeight);
    const canScrollUp = panel.scrollTop > 0;
    const canScrollDown = panel.scrollTop < maxScrollTop;

    if ((event.deltaY < 0 && !canScrollUp) || (event.deltaY > 0 && !canScrollDown)) {
      event.preventDefault();
    }
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
        <button
          aria-label={messages.closeImmersiveReader}
          className="immersive-reader-icon-button"
          onClick={onClose}
          title={`${messages.closeImmersiveReader} (Esc)`}
          type="button"
        >
          <X aria-hidden="true" size={20} strokeWidth={2} />
        </button>
      </div>
      {headings.length > 0 ? (
        <div className="workspace-toc immersive-reader-toc" data-open={navOpen} ref={navRootRef}>
          <button
            aria-expanded={navOpen}
            aria-label={navOpen ? messages.closeContents : messages.contents}
            className="workspace-toc-trigger"
            onClick={() => setNavOpen((open) => !open)}
            title={navOpen ? messages.closeContents : messages.contents}
            type="button"
          >
            {navOpen ? (
              <X aria-hidden="true" className="workspace-toc-trigger-icon" size={20} strokeWidth={2} />
            ) : (
              <ListTree aria-hidden="true" className="workspace-toc-trigger-icon" size={20} strokeWidth={2} />
            )}
          </button>
          <aside
            aria-hidden={!navOpen}
            aria-label={messages.contents}
            className="workspace-toc-panel"
            onWheel={handlePanelWheel}
          >
            <div className="workspace-toc-title">{documentTitle}</div>
            <div className="outline-list">
              {headings.map((heading) => (
                <button
                  aria-current={activeHeadingId === heading.id ? "location" : undefined}
                  className="outline-item"
                  data-depth={heading.depth}
                  key={`${heading.id}-${heading.depth}`}
                  onClick={() => navigateToHeading(heading.id)}
                  type="button"
                >
                  {heading.text}
                </button>
              ))}
            </div>
          </aside>
        </div>
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
