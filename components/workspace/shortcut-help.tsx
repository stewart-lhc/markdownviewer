"use client";

import { X } from "lucide-react";
import type { WorkspaceMessages } from "@/lib/i18n/messages";
import {
  formatShortcut,
  type ShortcutCategory,
  type ShortcutDefinition,
  type ShortcutPlatform
} from "@/lib/workspace/keyboard-shortcuts";

type ShortcutHelpDialogProps = {
  messages: WorkspaceMessages["shortcuts"];
  onClose: () => void;
  platform: ShortcutPlatform;
  shortcuts: ShortcutDefinition[];
};

const categoryOrder: ShortcutCategory[] = ["workspace", "view", "reading", "editor", "context"];

function getGroupedShortcuts(shortcuts: ShortcutDefinition[]) {
  return categoryOrder
    .map((category) => ({
      category,
      items: shortcuts.filter((shortcut) => shortcut.category === category)
    }))
    .filter((group) => group.items.length > 0);
}

export function ShortcutHelpDialog({ messages, onClose, platform, shortcuts }: ShortcutHelpDialogProps) {
  const groupedShortcuts = getGroupedShortcuts(shortcuts);

  return (
    <>
      <button
        aria-label={messages.close}
        className="workspace-popup-backdrop workspace-shortcuts-backdrop"
        onClick={onClose}
        type="button"
      />
      <div
        aria-label={messages.title}
        aria-modal="true"
        className="workspace-shortcuts-dialog"
        role="dialog"
      >
        <div className="workspace-shortcuts-header">
          <div>
            <span className="workspace-shortcuts-kicker">{messages.kicker}</span>
            <h2>{messages.title}</h2>
            <p>{messages.description}</p>
          </div>
          <button
            aria-label={messages.close}
            className="workspace-share-link__close"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="workspace-shortcuts-platform" data-platform={platform}>
          <span>{messages.currentPlatform(platform === "mac" ? messages.mac : messages.windows)}</span>
        </div>
        <div className="workspace-shortcuts-list">
          {groupedShortcuts.map((group) => (
            <section className="workspace-shortcuts-group" key={group.category}>
              <h3>{messages.categories[group.category]}</h3>
              <div className="workspace-shortcuts-table">
                {group.items.map((shortcut) => (
                  <div className="workspace-shortcuts-row" key={shortcut.id}>
                    <div className="workspace-shortcuts-action">{messages.actions[shortcut.id]}</div>
                    <div className="workspace-shortcuts-keys" data-current={platform === "mac" ? "mac" : "windows"}>
                      <kbd data-active={platform === "mac"}>{formatShortcut(shortcut.combo, "mac")}</kbd>
                      <kbd data-active={platform === "windows"}>{formatShortcut(shortcut.combo, "windows")}</kbd>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
