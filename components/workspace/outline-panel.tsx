"use client";

import { useEffect, useMemo, useState, type WheelEvent as ReactWheelEvent } from "react";
import { ListTree, X } from "lucide-react";
import type { WorkspaceMessages } from "@/lib/i18n/messages";
import { ExtractedHeading } from "@/lib/markdown/extract-headings";

type OutlinePanelProps = {
  headings: ExtractedHeading[];
  documentTitle: string;
  messages: WorkspaceMessages["preview"];
  open: boolean;
  onNavigate: (id: string) => void;
  onToggle: () => void;
};

export function OutlinePanel({ headings, documentTitle, messages, onNavigate, onToggle, open }: OutlinePanelProps) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);
  const hasHeadings = headings.length > 0;
  const headingIds = useMemo(() => headings.map((heading) => heading.id), [headings]);

  useEffect(() => {
    if (!hasHeadings) {
      return;
    }

    setActiveId((current) => current ?? headings[0]?.id ?? null);
  }, [hasHeadings, headings]);

  useEffect(() => {
    if (!hasHeadings || typeof window === "undefined") {
      return;
    }

    function syncFromHash() {
      const nextId = window.location.hash.replace(/^#/, "");

      if (nextId && headingIds.includes(nextId)) {
        setActiveId(nextId);
      }
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, [hasHeadings, headingIds]);

  useEffect(() => {
    if (!hasHeadings || typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return;
    }

    const elements = headingIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        root: document.querySelector("[data-testid='preview-scroll-region']"),
        rootMargin: "-15% 0px -65% 0px",
        threshold: [0.1, 0.4, 0.8]
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [hasHeadings, headingIds]);

  if (!hasHeadings) {
    return null;
  }

  function handlePanelWheel(event: ReactWheelEvent<HTMLElement>) {
    const preview = document.querySelector<HTMLDivElement>("[data-testid='preview-scroll-region']");

    if (!preview || event.deltaY === 0) {
      return;
    }

    const deltaMultiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? preview.clientHeight : 1;

    event.preventDefault();
    event.stopPropagation();
    preview.scrollTop += event.deltaY * deltaMultiplier;
  }

  return (
    <div className="workspace-toc" data-open={open} data-testid="floating-toc">
      <button
        aria-expanded={open}
        aria-label={open ? messages.closeContents : messages.contents}
        className="workspace-toc-trigger"
        onClick={onToggle}
        type="button"
      >
        {open ? (
          <X aria-hidden="true" className="workspace-toc-trigger-icon" size={20} strokeWidth={2} />
        ) : (
          <ListTree aria-hidden="true" className="workspace-toc-trigger-icon" size={20} strokeWidth={2} />
        )}
      </button>
      <aside aria-hidden={!open} className="workspace-toc-panel" aria-label={messages.contents} onWheel={handlePanelWheel}>
        <div className="workspace-toc-title">{documentTitle}</div>
        <div className="outline-list">
          {headings.map((heading) => (
            <button
              aria-current={activeId === heading.id ? "location" : undefined}
              className="outline-item"
              data-depth={heading.depth}
              key={`${heading.id}-${heading.depth}`}
              onClick={() => {
                setActiveId(heading.id);
                onNavigate(heading.id);
              }}
              type="button"
            >
              {heading.text}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
