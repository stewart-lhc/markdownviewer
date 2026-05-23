import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderHighlightedMarkdown } from "@/lib/workspace/editor-highlighting";

function renderEditorHighlight(markdown: string) {
  render(<pre data-testid="editor-highlight">{renderHighlightedMarkdown(markdown)}</pre>);
  return screen.getByTestId("editor-highlight");
}

describe("renderHighlightedMarkdown", () => {
  it("renders headings like rich source blocks while keeping heading syntax visible", () => {
    const highlight = renderEditorHighlight("# Title");
    const headingBlock = highlight.querySelector(".md-block--heading");

    expect(headingBlock).not.toBeNull();
    expect(within(headingBlock as HTMLElement).getByText("#", { selector: ".md-token--syntax" })).toBeInTheDocument();
    expect(within(headingBlock as HTMLElement).getByText("Title", { selector: ".md-token--heading-text" })).toBeInTheDocument();
  });

  it("renders markdown tables as table-like rich source rows instead of plain mono text", () => {
    const highlight = renderEditorHighlight("| ASCII | HTML |\n| --- | --- |\n| `code` | value |");
    const tableBlock = highlight.querySelector(".md-block--table");

    expect(tableBlock).not.toBeNull();
    expect(within(tableBlock as HTMLElement).getAllByText("|", { selector: ".md-token--table-pipe" }).length).toBeGreaterThan(0);
    expect(within(tableBlock as HTMLElement).getByText("ASCII", { selector: ".md-token--table-cell" })).toBeInTheDocument();
    expect(within(tableBlock as HTMLElement).getByText("HTML", { selector: ".md-token--table-cell" })).toBeInTheDocument();
    expect(within(tableBlock as HTMLElement).getAllByText("---", { selector: ".md-token--table-divider" }).length).toBeGreaterThan(0);
    expect(within(tableBlock as HTMLElement).getByText("code", { selector: ".md-token--code-text" })).toBeInTheDocument();
  });

  it("renders blockquotes and body copy as rich source blocks with visible markdown markers", () => {
    const highlight = renderEditorHighlight("> quoted text\n\nParagraph body");
    const quoteBlock = highlight.querySelector(".md-block--quote");
    const paragraphBlock = highlight.querySelector(".md-block--paragraph");

    expect(quoteBlock).not.toBeNull();
    expect(within(quoteBlock as HTMLElement).getByText(">", { selector: ".md-token--syntax" })).toBeInTheDocument();
    expect(within(quoteBlock as HTMLElement).getByText("quoted text", { selector: ".md-token--quote-text" })).toBeInTheDocument();
    expect(paragraphBlock).not.toBeNull();
    expect(within(paragraphBlock as HTMLElement).getByText("Paragraph body", { selector: ".md-token--paragraph-text" })).toBeInTheDocument();
  });
});
