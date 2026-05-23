"use client";

import type { Grammar } from "prismjs";

export type StackeditEditor = {
  focus: () => void;
  getContent: () => string;
  init: (options: {
    content: string;
    sectionHighlighter: (section: { text: string }) => string;
    sectionParser: (text: string) => string[];
  }) => void;
  on: (eventName: string, listener: (...args: unknown[]) => void) => void;
  replace: (start: number, end: number, value: string) => {
    end: number;
    range: Range | null;
    start: number;
  };
  selectionMgr: {
    hasFocus?: boolean;
    saveSelectionState: (isRangeFromSelection?: boolean, adjustScroll?: boolean, forceAdjust?: boolean) => void;
    selectionEnd: number;
    selectionStart: number;
    setSelectionStartEnd: (start: number, end: number) => void;
  };
  undoMgr: {
    redo: () => void;
    undo: () => void;
  };
  setContent: (value: string, noUndo?: boolean, maxStartOffset?: number) => {
    end: number;
    range: Range | null;
    start: number;
  };
  toggleEditable: (isEditable: boolean) => void;
};

type CleditFactory = (contentElt: HTMLElement, scrollElt?: HTMLElement, isMarkdown?: boolean) => StackeditEditor;

let cleditFactoryPromise: Promise<CleditFactory> | null = null;
let prismPromise: Promise<typeof import("prismjs").default> | null = null;
const editorSurfaceMap = new WeakMap<HTMLElement, StackeditEditor>();

const headingBoundaryPattern =
  /^.+[ \t]*\n=+[ \t]*\n+|^.+[ \t]*\n-+[ \t]*\n+|^\#{1,6}[ \t]*.+?[ \t]*\#*\n+/gm;

export function ensureStackeditTrailingLf(markdown: string) {
  return markdown.endsWith("\n") ? markdown : `${markdown}\n`;
}

export function normalizeStackeditContent(markdown: string) {
  return markdown.endsWith("\n") ? markdown.slice(0, -1) : markdown;
}

export function parseStackeditSections(text: string) {
  let offset = 0;
  const sections: string[] = [];

  (text + "\n\n").replace(headingBoundaryPattern, (match, matchOffset) => {
    sections.push(text.substring(offset, matchOffset));
    offset = matchOffset;
    return match;
  });

  sections.push(text.substring(offset));
  return sections;
}

export function makeStackeditMarkdownGrammar() {
  const charInsideUrl = "(&|[-A-Z0-9+@#/%?=~_|[\\]()!:,.;])";
  const charEndingUrl = "(&|[-A-Z0-9+@#/%=~_|[\\])])";
  const urlPattern = new RegExp(`(https?|ftp)(://${charInsideUrl}*${charEndingUrl})(?=$|\\W)`, "gi");
  const emailPattern = /(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)/gi;

  const grammar: Grammar = {};
  const insideFences: Grammar = {
    "cl cl-pre md-token--syntax": /`{3}|~{3}/
  };

  grammar["pre gfm"] = {
    pattern: /^(`{3}|~{3}).*\n(?:[\s\S]*?)\n\1 *$/gm,
    inside: insideFences
  };
  grammar.li = {
    pattern: new RegExp(
      [
        "^ {0,3}(?:[*+\\-]|\\d+\\.)[ \\t].+\\n",
        "(?:",
        "(?:",
        ".*\\S.*\\n",
        "|",
        "[ \\t]*\\n(?! ?\\S)",
        ")",
        ")*"
      ].join(""),
      "gm"
    ),
    inside: {
      "cl cl-li md-token--syntax": /^[ \t]*([*+\-]|\d+\.)[ \t]/gm
    }
  };
  grammar.li.inside["pre gfm"] = {
    pattern: /^((?: {4}|\t)+)(`{3}|~{3}).*\n(?:[\s\S]*?)\n\1\2\s*$/gm,
    inside: insideFences
  };
  grammar.blockquote = {
    pattern: /^ {0,3}>.+(?:\n[ \t]*\S.*)*/gm,
    inside: {
      "cl cl-gt md-token--syntax": /^\s*>/gm,
      li: grammar.li
    }
  };
  grammar["h1 alt md-token--heading-text"] = {
    pattern: /^.+\n=+[ \t]*$/gm,
    inside: {
      "cl cl-hash md-token--syntax": /=+[ \t]*$/
    }
  };
  grammar["h2 alt md-token--heading-text"] = {
    pattern: /^.+\n-+[ \t]*$/gm,
    inside: {
      "cl cl-hash md-token--syntax": /-+[ \t]*$/
    }
  };

  for (let level = 6; level >= 1; level -= 1) {
    grammar[`h${level} md-token--heading-text`] = {
      pattern: new RegExp(`^#{${level}}[ \t].+$`, "gm"),
      inside: {
        "cl cl-hash md-token--syntax": new RegExp(`^#{${level}}`)
      }
    };
  }

  grammar.table = {
    pattern: new RegExp(
      [
        "^",
        "[ ]{0,3}",
        "[|]",
        ".+\\n",
        "[ ]{0,3}",
        "[|][ ]*[-:]+[-| :]*\\n",
        "(?:[ \t]*[|].*\\n?)*",
        "$"
      ].join(""),
      "gm"
    ),
    inside: {}
  };
  grammar["table alt"] = {
    pattern: new RegExp(
      [
        "^",
        "[ ]{0,3}",
        "\\S.*[|].*\\n",
        "[ ]{0,3}",
        "[-:]+[ ]*[|][-| :]*\\n",
        "(?:.*[|].*\\n?)*",
        "$"
      ].join(""),
      "gm"
    ),
    inside: {}
  };
  grammar.hr = {
    pattern: /^ {0,3}([*\-_] *){3,}$/gm
  };
  grammar.p = {
    pattern: /^ {0,3}\S.*$(\n.*\S.*)*/gm,
    inside: {}
  };
  grammar.pre = {
    pattern: /(?: {4}|\t).*\S.*\n((?: {4}|\t).*\n)*/g
  };

  const rest: Grammar = {
    "code md-token--code-text": {
      pattern: /(`+)[\s\S]*?\1/g,
      inside: {
        "cl cl-code md-token--syntax": /`/
      }
    },
    img: {
      pattern: /!\[.*?\]\(.+?\)/g,
      inside: {
        "cl cl-title": /['‘][^'’]*['’]|["“][^"”]*["”](?=\)$)/,
        "cl cl-src md-token--link-url": {
          pattern: /(\]\()[^\('" \t]+(?=[\)'" \t])/,
          lookbehind: true
        }
      }
    },
    link: {
      pattern: /\[.*?\]\(.+?\)/gm,
      inside: {
        "cl cl-underlined-text md-token--link-text": {
          pattern: /(\[)[^\]]*/,
          lookbehind: true
        },
        "cl cl-title": /['‘][^'’]*['’]|["“][^"”]*["”](?=\)$)/
      }
    },
    imgref: {
      pattern: /!\[.*?\][ \t]*\[.*?\]/g
    },
    linkref: {
      pattern: /\[.*?\][ \t]*\[.*?\]/g,
      inside: {
        "cl cl-underlined-text md-token--link-text": {
          pattern: /^(\[)[^\]]*(?=\][ \t]*\[)/,
          lookbehind: true
        }
      }
    },
    comment: /<!--[\w\W]*?-->/g,
    url: urlPattern,
    email: emailPattern,
    "strong md-token--strong-text": {
      pattern: /(^|[^\w*])([_\*])\2(?![_\*])[\s\S]*?\2{2}(?=([^\w*]|$))/gm,
      lookbehind: true,
      inside: {
        "cl cl-strong cl-start md-token--syntax": /^([_\*])\1/,
        "cl cl-strong cl-close md-token--syntax": /([_\*])\1$/
      }
    },
    "em md-token--emphasis-text": {
      pattern: /(^|[^\w*])([_\*])(?![_\*])[\s\S]*?\2(?=([^\w*]|$))/gm,
      lookbehind: true,
      inside: {
        "cl cl-em cl-start md-token--syntax": /^[_\*]/,
        "cl cl-em cl-close md-token--syntax": /[_\*]$/
      }
    },
    "del md-token--strike-text": {
      pattern: /(^|[^\w*])(~~)[\s\S]*?\2(?=([^\w*]|$))/gm,
      lookbehind: true,
      inside: {
        "cl md-token--syntax": /~~/,
        "cl-del-text md-token--strike-text": /[^~]+/
      }
    }
  };

  for (let level = 6; level >= 1; level -= 1) {
    const headingKey = `h${level} md-token--heading-text`;
    (grammar[headingKey] as { inside: Grammar }).inside.rest = rest;
  }
  (grammar["h1 alt md-token--heading-text"] as { inside: Grammar }).inside.rest = rest;
  (grammar["h2 alt md-token--heading-text"] as { inside: Grammar }).inside.rest = rest;
  (grammar.table as { inside: Grammar }).inside.rest = rest;
  (grammar["table alt"] as { inside: Grammar }).inside.rest = rest;
  (grammar.p as { inside: Grammar }).inside.rest = rest;
  (grammar.blockquote as { inside: Grammar }).inside.rest = rest;
  (grammar.li as { inside: Grammar }).inside.rest = rest;

  return grammar;
}

export function bindStackeditEditor(surface: HTMLElement, editor: StackeditEditor) {
  editorSurfaceMap.set(surface, editor);
}

export function unbindStackeditEditor(surface: HTMLElement) {
  editorSurfaceMap.delete(surface);
}

export function getBoundStackeditEditor(surface: HTMLElement) {
  return editorSurfaceMap.get(surface) ?? null;
}

export async function getStackeditEditorFactory() {
  if (!cleditFactoryPromise) {
    cleditFactoryPromise = import("@/lib/vendor/stackedit-cledit").then((module) => {
      const cledit = (module.default ?? module) as CleditFactory;

      if (typeof cledit !== "function") {
        throw new Error("Failed to initialize the StackEdit editor engine.");
      }

      return cledit;
    });
  }

  return cleditFactoryPromise;
}

export async function getStackeditPrism() {
  if (!prismPromise) {
    prismPromise = import("prismjs").then((module) => (module.default ?? module) as typeof import("prismjs").default);
  }

  return prismPromise;
}
