export type ShortcutPlatform = "mac" | "windows";

export type ShortcutCategory = "workspace" | "view" | "reading" | "editor" | "context";

export type ShortcutId =
  | "shortcut-help"
  | "new-tab"
  | "new-tab-file"
  | "open-folder"
  | "paste-markdown"
  | "save"
  | "share"
  | "export-html"
  | "export-pdf"
  | "folder-search"
  | "toggle-sidebar"
  | "preview-mode"
  | "split-mode"
  | "editor-mode"
  | "toggle-contents"
  | "immersive-reader"
  | "increase-font"
  | "decrease-font"
  | "increase-line-height"
  | "decrease-line-height"
  | "increase-margin"
  | "decrease-margin"
  | "close-overlay"
  | "focus-next-pane"
  | "focus-previous-pane"
  | "editor-bold"
  | "editor-italic"
  | "editor-link"
  | "editor-heading"
  | "editor-strike"
  | "editor-bullet-list"
  | "editor-ordered-list"
  | "editor-select-all"
  | "editor-undo"
  | "editor-redo"
  | "share-open-workspace"
  | "share-edit-copy"
  | "share-use-template";

export type ShortcutCombo = {
  alt?: boolean;
  code?: string;
  ctrl?: boolean;
  displayKey?: string;
  hideShiftInDisplay?: boolean;
  key: string;
  meta?: boolean;
  mod?: boolean;
  shift?: boolean;
};

export type ShortcutDefinition = {
  category: ShortcutCategory;
  combo: ShortcutCombo;
  id: ShortcutId;
};

export type ShortcutKeyboardEvent = {
  altKey: boolean;
  code: string;
  ctrlKey: boolean;
  key: string;
  metaKey: boolean;
  shiftKey: boolean;
};

export const workspaceShortcutDefinitions: ShortcutDefinition[] = [
  { id: "shortcut-help", category: "workspace", combo: { key: "/", code: "Slash", mod: true } },
  { id: "new-tab", category: "workspace", combo: { key: "n", code: "KeyN", mod: true } },
  { id: "new-tab-file", category: "workspace", combo: { key: "o", code: "KeyO", mod: true } },
  { id: "open-folder", category: "workspace", combo: { key: "o", code: "KeyO", mod: true, shift: true } },
  { id: "paste-markdown", category: "workspace", combo: { key: "v", code: "KeyV", mod: true, shift: true } },
  { id: "save", category: "workspace", combo: { key: "s", code: "KeyS", mod: true } },
  { id: "share", category: "workspace", combo: { key: "s", code: "KeyS", mod: true, shift: true } },
  { id: "export-html", category: "workspace", combo: { key: "e", code: "KeyE", mod: true, shift: true } },
  { id: "export-pdf", category: "workspace", combo: { key: "p", code: "KeyP", mod: true } },
  { id: "folder-search", category: "workspace", combo: { key: "k", code: "KeyK", mod: true } },
  { id: "toggle-sidebar", category: "view", combo: { key: "\\", code: "Backslash", mod: true } },
  { id: "preview-mode", category: "view", combo: { key: "1", code: "Digit1", mod: true, alt: true } },
  { id: "split-mode", category: "view", combo: { key: "2", code: "Digit2", mod: true, alt: true } },
  { id: "editor-mode", category: "view", combo: { key: "3", code: "Digit3", mod: true, alt: true } },
  { id: "toggle-contents", category: "reading", combo: { key: "t", code: "KeyT", mod: true, alt: true } },
  { id: "immersive-reader", category: "reading", combo: { key: "m", code: "KeyM", mod: true, shift: true } },
  { id: "increase-font", category: "reading", combo: { key: ">", code: "Period", mod: true, shift: true, hideShiftInDisplay: true } },
  { id: "decrease-font", category: "reading", combo: { key: "<", code: "Comma", mod: true, shift: true, hideShiftInDisplay: true } },
  { id: "increase-line-height", category: "reading", combo: { key: "ArrowUp", mod: true, alt: true } },
  { id: "decrease-line-height", category: "reading", combo: { key: "ArrowDown", mod: true, alt: true } },
  { id: "increase-margin", category: "reading", combo: { key: "ArrowRight", mod: true, alt: true } },
  { id: "decrease-margin", category: "reading", combo: { key: "ArrowLeft", mod: true, alt: true } },
  { id: "close-overlay", category: "context", combo: { key: "Escape" } },
  { id: "focus-next-pane", category: "context", combo: { key: "F6" } },
  { id: "focus-previous-pane", category: "context", combo: { key: "F6", shift: true } }
];

export const editorShortcutDefinitions: ShortcutDefinition[] = [
  { id: "editor-bold", category: "editor", combo: { key: "b", code: "KeyB", mod: true } },
  { id: "editor-italic", category: "editor", combo: { key: "i", code: "KeyI", mod: true } },
  { id: "editor-link", category: "editor", combo: { key: "k", code: "KeyK", mod: true } },
  { id: "editor-heading", category: "editor", combo: { key: "1", code: "Digit1", mod: true, alt: true } },
  { id: "editor-strike", category: "editor", combo: { key: "x", code: "KeyX", mod: true, shift: true } },
  { id: "editor-bullet-list", category: "editor", combo: { key: "8", code: "Digit8", mod: true, shift: true } },
  { id: "editor-ordered-list", category: "editor", combo: { key: "7", code: "Digit7", mod: true, shift: true } },
  { id: "editor-select-all", category: "editor", combo: { key: "a", code: "KeyA", mod: true } },
  { id: "editor-undo", category: "editor", combo: { key: "z", code: "KeyZ", mod: true } },
  { id: "editor-redo", category: "editor", combo: { key: "z", code: "KeyZ", mod: true, shift: true } }
];

export const shareReaderShortcutDefinitions: ShortcutDefinition[] = [
  { id: "shortcut-help", category: "reading", combo: { key: "/", code: "Slash", mod: true } },
  { id: "toggle-contents", category: "reading", combo: { key: "c", code: "KeyC", mod: true, alt: true } },
  { id: "immersive-reader", category: "reading", combo: { key: "i", code: "KeyI", mod: true, alt: true } },
  { id: "increase-font", category: "reading", combo: { key: ">", code: "Period", mod: true, shift: true, hideShiftInDisplay: true } },
  { id: "decrease-font", category: "reading", combo: { key: "<", code: "Comma", mod: true, shift: true, hideShiftInDisplay: true } },
  { id: "increase-line-height", category: "reading", combo: { key: "ArrowUp", mod: true, alt: true } },
  { id: "decrease-line-height", category: "reading", combo: { key: "ArrowDown", mod: true, alt: true } },
  { id: "increase-margin", category: "reading", combo: { key: "ArrowRight", mod: true, alt: true } },
  { id: "decrease-margin", category: "reading", combo: { key: "ArrowLeft", mod: true, alt: true } },
  { id: "share-open-workspace", category: "workspace", combo: { key: "o", code: "KeyO", mod: true, alt: true } },
  { id: "share-edit-copy", category: "workspace", combo: { key: "e", code: "KeyE", mod: true, alt: true } },
  { id: "share-use-template", category: "workspace", combo: { key: "t", code: "KeyT", mod: true, alt: true } },
  { id: "close-overlay", category: "context", combo: { key: "Escape" } }
];

const keyDisplayNames: Record<string, string> = {
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  ArrowUp: "Up",
  Escape: "Esc"
};

export function getShortcutPlatform(): ShortcutPlatform {
  if (typeof navigator === "undefined") {
    return "windows";
  }

  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform) ? "mac" : "windows";
}

export function formatShortcut(combo: ShortcutCombo, platform: ShortcutPlatform) {
  const parts: string[] = [];

  if (combo.mod) {
    parts.push(platform === "mac" ? "⌘" : "Ctrl");
  }

  if (combo.ctrl) {
    parts.push(platform === "mac" ? "⌃" : "Ctrl");
  }

  if (combo.alt) {
    parts.push(platform === "mac" ? "⌥" : "Alt");
  }

  if (combo.shift && !combo.hideShiftInDisplay) {
    parts.push(platform === "mac" ? "⇧" : "Shift");
  }

  parts.push(combo.displayKey ?? keyDisplayNames[combo.key] ?? combo.key.toUpperCase());

  return platform === "mac" ? parts.join("") : parts.join("+");
}

export function shortcutTitle(label: string, combo: ShortcutCombo, platform: ShortcutPlatform) {
  return `${label} (${formatShortcut(combo, platform)})`;
}

export function getShortcutById(definitions: ShortcutDefinition[], id: ShortcutId) {
  return definitions.find((definition) => definition.id === id) ?? null;
}

function hasExpectedModifier(actual: boolean, expected?: boolean) {
  return expected ? actual : !actual;
}

function matchesShortcutKey(event: ShortcutKeyboardEvent, combo: ShortcutCombo) {
  const eventKey = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const comboKey = combo.key.length === 1 ? combo.key.toLowerCase() : combo.key;

  if (eventKey === comboKey) {
    return true;
  }

  return Boolean(combo.code && event.code === combo.code);
}

export function matchesShortcut(
  event: ShortcutKeyboardEvent,
  combo: ShortcutCombo,
  platform: ShortcutPlatform
) {
  const primaryPressed = platform === "mac" ? event.metaKey : event.ctrlKey;

  if (combo.mod && !primaryPressed) {
    return false;
  }

  if (!combo.mod && (platform === "mac" ? event.metaKey : event.ctrlKey)) {
    return false;
  }

  if (!hasExpectedModifier(event.altKey, combo.alt)) {
    return false;
  }

  if (!hasExpectedModifier(event.shiftKey, combo.shift)) {
    return false;
  }

  if (!combo.mod && !hasExpectedModifier(event.ctrlKey, combo.ctrl)) {
    return false;
  }

  if (!combo.mod && !hasExpectedModifier(event.metaKey, combo.meta)) {
    return false;
  }

  return matchesShortcutKey(event, combo);
}

export function isEditableShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tagName = target.tagName.toLowerCase();

  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }

  return Boolean(target.closest("[contenteditable='true'], [role='textbox']"));
}
