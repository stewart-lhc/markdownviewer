declare module "cledit" {
  const cledit: unknown;
  export default cledit;
}

declare module "@/lib/vendor/stackedit-cledit" {
  const cledit: (contentElt: HTMLElement, scrollElt?: HTMLElement, isMarkdown?: boolean) => import("@/lib/workspace/stackedit-cledit").StackeditEditor;
  export default cledit;
}

declare global {
  interface Window {
    cledit?: (contentElt: HTMLElement, scrollElt?: HTMLElement, isMarkdown?: boolean) => import("@/lib/workspace/stackedit-cledit").StackeditEditor;
    diff_match_patch?: new () => unknown;
  }
}

export {};
