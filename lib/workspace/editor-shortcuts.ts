import type { MarkdownEditorAction } from "@/lib/workspace/editor-actions";

export type EditorShortcutCommand =
  | { type: "action"; action: MarkdownEditorAction }
  | { type: "history"; direction: "undo" | "redo" }
  | { type: "selectAll" };

type EditorShortcutEvent = {
  altKey: boolean;
  code: string;
  ctrlKey: boolean;
  key: string;
  metaKey: boolean;
  shiftKey: boolean;
};

const actionShortcutLabels: Partial<Record<MarkdownEditorAction, string>> = {
  bold: "Ctrl/Cmd+B",
  italic: "Ctrl/Cmd+I",
  link: "Ctrl/Cmd+K",
  heading: "Ctrl/Cmd+Alt+1",
  strike: "Ctrl/Cmd+Shift+X",
  bulletList: "Ctrl/Cmd+Shift+8",
  orderedList: "Ctrl/Cmd+Shift+7"
};

function matchesKey(event: EditorShortcutEvent, code: string, key: string) {
  return event.code === code || event.key.toLowerCase() === key;
}

export function getEditorShortcutCommand(event: EditorShortcutEvent): EditorShortcutCommand | null {
  const hasPrimaryModifier = event.ctrlKey || event.metaKey;

  if (!hasPrimaryModifier) {
    return null;
  }

  if (!event.altKey && !event.shiftKey && matchesKey(event, "KeyA", "a")) {
    return { type: "selectAll" };
  }

  if (!event.altKey && matchesKey(event, "KeyZ", "z")) {
    return event.shiftKey
      ? { type: "history", direction: "redo" }
      : { type: "history", direction: "undo" };
  }

  if (!event.altKey && !event.shiftKey && matchesKey(event, "KeyY", "y")) {
    return { type: "history", direction: "redo" };
  }

  if (!event.altKey && !event.shiftKey) {
    if (matchesKey(event, "KeyB", "b")) {
      return { type: "action", action: "bold" };
    }

    if (matchesKey(event, "KeyI", "i")) {
      return { type: "action", action: "italic" };
    }

    if (matchesKey(event, "KeyK", "k")) {
      return { type: "action", action: "link" };
    }
  }

  if (!event.altKey && event.shiftKey) {
    if (matchesKey(event, "KeyX", "x")) {
      return { type: "action", action: "strike" };
    }

    if (event.code === "Digit7") {
      return { type: "action", action: "orderedList" };
    }

    if (event.code === "Digit8") {
      return { type: "action", action: "bulletList" };
    }
  }

  if (event.altKey && !event.shiftKey && event.code === "Digit1") {
    return { type: "action", action: "heading" };
  }

  return null;
}

export function getEditorActionShortcutLabel(action: MarkdownEditorAction) {
  return actionShortcutLabels[action] ?? null;
}
