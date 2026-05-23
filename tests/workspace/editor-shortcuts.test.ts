import { describe, expect, it } from "vitest";
import { getEditorActionShortcutLabel, getEditorShortcutCommand } from "@/lib/workspace/editor-shortcuts";

describe("editor shortcuts", () => {
  it("maps common editor key combinations to shortcut commands", () => {
    expect(
      getEditorShortcutCommand({
        altKey: false,
        code: "KeyZ",
        ctrlKey: true,
        key: "z",
        metaKey: false,
        shiftKey: false
      })
    ).toEqual({ type: "history", direction: "undo" });

    expect(
      getEditorShortcutCommand({
        altKey: false,
        code: "KeyZ",
        ctrlKey: false,
        key: "z",
        metaKey: true,
        shiftKey: true
      })
    ).toEqual({ type: "history", direction: "redo" });

    expect(
      getEditorShortcutCommand({
        altKey: false,
        code: "KeyB",
        ctrlKey: true,
        key: "b",
        metaKey: false,
        shiftKey: false
      })
    ).toEqual({ type: "action", action: "bold" });

    expect(
      getEditorShortcutCommand({
        altKey: false,
        code: "Digit8",
        ctrlKey: true,
        key: "*",
        metaKey: false,
        shiftKey: true
      })
    ).toEqual({ type: "action", action: "bulletList" });

    expect(
      getEditorShortcutCommand({
        altKey: true,
        code: "Digit1",
        ctrlKey: true,
        key: "1",
        metaKey: false,
        shiftKey: false
      })
    ).toEqual({ type: "action", action: "heading" });
  });

  it("returns the visible shortcut labels used by toolbar hints", () => {
    expect(getEditorActionShortcutLabel("bold")).toBe("Ctrl/Cmd+B");
    expect(getEditorActionShortcutLabel("orderedList")).toBe("Ctrl/Cmd+Shift+7");
    expect(getEditorActionShortcutLabel("table")).toBeNull();
  });
});
