"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { WorkspaceMessages } from "@/lib/i18n/messages";
import {
  readRecentActivity,
  removeRecentActivity,
  type RecentActivityItem,
  type RecentActivityKind
} from "@/lib/workspace/recent-activity";

type RecentActivityPanelProps = {
  className?: string;
  limit?: number;
  messages: WorkspaceMessages["recent"];
  testId?: string;
};

function getKindLabel(kind: RecentActivityKind, messages: WorkspaceMessages["recent"]) {
  switch (kind) {
    case "share-created":
      return messages.kind.shareCreated;
    case "share-copy":
      return messages.kind.shareCopy;
    case "share-template":
      return messages.kind.shareTemplate;
    case "converted-document":
      return messages.kind.convertedDocument;
  }
}

function formatUpdatedAt(updatedAt: number) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short"
  }).format(new Date(updatedAt));
}

export function RecentActivityPanel({
  className = "",
  limit = 3,
  messages,
  testId = "recent-activity-panel"
}: RecentActivityPanelProps) {
  const [items, setItems] = useState<RecentActivityItem[]>([]);

  function refreshItems() {
    setItems(readRecentActivity(undefined, { limit }));
  }

  useEffect(() => {
    refreshItems();
  }, [limit]);

  function handleRemove(id: string) {
    removeRecentActivity(id);
    refreshItems();
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={messages.title}
      className={`recent-activity-panel${className ? ` ${className}` : ""}`}
      data-testid={testId}
    >
      <div className="recent-activity-panel__header">
        <h2>{messages.title}</h2>
      </div>
      <ul className="recent-activity-panel__list">
        {items.map((item) => {
          const body = (
            <>
              <span className="recent-activity-panel__title">{item.title}</span>
              <span className="recent-activity-panel__meta">
                {getKindLabel(item.kind, messages)} · {formatUpdatedAt(item.updatedAt)}
              </span>
            </>
          );

          return (
            <li className="recent-activity-panel__item" key={item.id}>
              {item.href ? (
                <a className="recent-activity-panel__link" href={item.href}>
                  {body}
                </a>
              ) : (
                <div className="recent-activity-panel__link recent-activity-panel__link--static">
                  {body}
                </div>
              )}
              <button
                aria-label={`${messages.remove} ${item.title}`}
                className="recent-activity-panel__remove"
                onClick={() => handleRemove(item.id)}
                type="button"
              >
                <X aria-hidden="true" size={14} strokeWidth={2.2} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
