import { render, screen } from "@testing-library/react";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";

const source = `
# Demo

\`\`\`ts
console.log("hello")
\`\`\`

| Name | Value |
| --- | --- |
| Theme | Editorial |

\`\`\`mermaid
graph TD
  A[Start] --> B[Finish]
\`\`\`

Inline math $a^2 + b^2 = c^2$
`;

describe("MarkdownRenderer", () => {
  it("renders technical markdown content", () => {
    const { container } = render(<MarkdownRenderer markdown={source} />);

    expect(screen.getByRole("heading", { level: 1, name: "Demo" })).toBeInTheDocument();
    expect(container.querySelector(".code-frame code")?.textContent).toContain('console.log("hello")');
    expect(screen.getByRole("button", { name: /copy ts code/i })).toBeInTheDocument();
    expect(screen.getByText("Theme")).toBeInTheDocument();
    expect(screen.getByText(/mermaid diagram/i)).toBeInTheDocument();
  });

  it("supports a compact presentation variant for embedded previews", () => {
    const { container } = render(<MarkdownRenderer markdown="# Compact demo" variant="compact" />);

    expect(container.querySelector(".markdown-body--compact")).toBeInTheDocument();
  });

  it("exposes source positions on rendered blocks for split-view syncing", () => {
    const { container } = render(<MarkdownRenderer markdown={"# Demo\n\nA paragraph"} />);
    const heading = container.querySelector("h1[data-sourcepos]");
    const paragraph = container.querySelector("p[data-sourcepos]");

    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute("data-sourcepos", expect.stringContaining("1:"));
    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveAttribute("data-sourcepos", expect.stringContaining("3:"));
  });

  it("shows a simplified mermaid summary in compact previews", () => {
    render(<MarkdownRenderer markdown={"```mermaid\ngraph TD\n  A[Paste] --> B[Preview]\n  B --> C[Share]\n```"} variant="compact" />);

    expect(screen.getByText("Diagram flow")).toBeInTheDocument();
    expect(screen.getByText("Paste")).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText("Share")).toBeInTheDocument();
    expect(screen.queryByText(/rendered/i)).not.toBeInTheDocument();
  });

  it("keeps syntax-highlighted markup inside fenced code blocks", () => {
    const { container } = render(
      <MarkdownRenderer
        markdown={"```ts\nconst answer = 42;\nconsole.log(answer)\n```"}
      />
    );

    expect(container.querySelector(".code-frame .hljs")).toBeInTheDocument();
    expect(container.querySelector(".code-frame .hljs-keyword")).toBeInTheDocument();
    expect(container.querySelector(".code-frame .hljs-number")).toBeInTheDocument();
  });
});
