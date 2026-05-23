export type MarkdownEditorAction =
  | "bold"
  | "italic"
  | "heading"
  | "strike"
  | "bulletList"
  | "orderedList"
  | "taskList"
  | "quote"
  | "code"
  | "table"
  | "link"
  | "image";

type ApplyMarkdownActionInput = {
  action: MarkdownEditorAction;
  selectionStart: number;
  selectionEnd: number;
};

type ApplyMarkdownActionResult = {
  markdown: string;
  selectionStart: number;
  selectionEnd: number;
};

function wrapSelection(
  markdown: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  suffix = prefix,
  emptyText = ""
): ApplyMarkdownActionResult {
  const selected = markdown.slice(selectionStart, selectionEnd);
  const content = selected || emptyText;
  const before = markdown.slice(0, selectionStart);
  const after = markdown.slice(selectionEnd);
  const nextMarkdown = `${before}${prefix}${content}${suffix}${after}`;
  const nextSelectionStart = selectionStart + prefix.length;
  const nextSelectionEnd = nextSelectionStart + content.length;

  return {
    markdown: nextMarkdown,
    selectionStart: nextSelectionStart,
    selectionEnd: nextSelectionEnd
  };
}

function expandSelectionToLines(markdown: string, selectionStart: number, selectionEnd: number) {
  const lineStart = markdown.lastIndexOf("\n", Math.max(selectionStart - 1, 0)) + 1;
  const nextLineBreak = markdown.indexOf("\n", selectionEnd);
  const lineEnd = nextLineBreak === -1 ? markdown.length : nextLineBreak;

  return {
    lineStart,
    lineEnd,
    selectedLines: markdown.slice(lineStart, lineEnd)
  };
}

function prefixLines(
  markdown: string,
  selectionStart: number,
  selectionEnd: number,
  formatter: (line: string, index: number) => string
): ApplyMarkdownActionResult {
  const { lineStart, lineEnd, selectedLines } = expandSelectionToLines(markdown, selectionStart, selectionEnd);
  const lines = selectedLines.split("\n");
  const nextBlock = lines.map(formatter).join("\n");
  const nextMarkdown = `${markdown.slice(0, lineStart)}${nextBlock}${markdown.slice(lineEnd)}`;

  return {
    markdown: nextMarkdown,
    selectionStart: lineStart,
    selectionEnd: lineStart + nextBlock.length
  };
}

export function applyMarkdownAction(
  markdown: string,
  { action, selectionStart, selectionEnd }: ApplyMarkdownActionInput
): ApplyMarkdownActionResult {
  switch (action) {
    case "bold":
      return wrapSelection(markdown, selectionStart, selectionEnd, "**", "**", "bold text");
    case "italic":
      return wrapSelection(markdown, selectionStart, selectionEnd, "*", "*", "italic text");
    case "strike":
      return wrapSelection(markdown, selectionStart, selectionEnd, "~~", "~~", "struck text");
    case "link":
      return wrapSelection(markdown, selectionStart, selectionEnd, "[", "](https://example.com)", "link text");
    case "image":
      return wrapSelection(markdown, selectionStart, selectionEnd, "![", "](https://placehold.co/1200x630)", "alt text");
    case "heading":
      return prefixLines(markdown, selectionStart, selectionEnd, (line) => `# ${line.replace(/^#{1,6}\s+/, "")}`);
    case "bulletList":
      return prefixLines(markdown, selectionStart, selectionEnd, (line) => `- ${line.replace(/^([-*+]\s+|\d+\.\s+|-\s+\[[ xX]\]\s+|>\s+)/, "")}`);
    case "orderedList":
      return prefixLines(markdown, selectionStart, selectionEnd, (line, index) => `${index + 1}. ${line.replace(/^([-*+]\s+|\d+\.\s+|-\s+\[[ xX]\]\s+|>\s+)/, "")}`);
    case "taskList":
      return prefixLines(markdown, selectionStart, selectionEnd, (line) => `- [ ] ${line.replace(/^([-*+]\s+|\d+\.\s+|-\s+\[[ xX]\]\s+|>\s+)/, "")}`);
    case "quote":
      return prefixLines(markdown, selectionStart, selectionEnd, (line) => `> ${line.replace(/^>\s+/, "")}`);
    case "code": {
      const selected = markdown.slice(selectionStart, selectionEnd);

      if (selected.includes("\n")) {
        return wrapSelection(markdown, selectionStart, selectionEnd, "```txt\n", "\n```", "code block");
      }

      return wrapSelection(markdown, selectionStart, selectionEnd, "`", "`", "inline code");
    }
    case "table": {
      const tableBlock = ["| Column | Value | Notes |", "| --- | --- | --- |", "| A | B | C |"].join("\n");
      const before = markdown.slice(0, selectionStart);
      const after = markdown.slice(selectionEnd);
      const needsLeadingBreak = before.length > 0 && !before.endsWith("\n\n") ? "\n\n" : "";
      const needsTrailingBreak = after.length > 0 && !after.startsWith("\n") ? "\n\n" : "";
      const nextMarkdown = `${before}${needsLeadingBreak}${tableBlock}${needsTrailingBreak}${after}`;
      const blockStart = before.length + needsLeadingBreak.length;

      return {
        markdown: nextMarkdown,
        selectionStart: blockStart,
        selectionEnd: blockStart + tableBlock.length
      };
    }
    default:
      return {
        markdown,
        selectionStart,
        selectionEnd
      };
  }
}
