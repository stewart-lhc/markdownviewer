import type { StackeditEditor } from "@/lib/workspace/stackedit-cledit";

declare const cledit: (
  contentElt: HTMLElement,
  scrollElt?: HTMLElement,
  isMarkdown?: boolean
) => StackeditEditor;

export default cledit;
