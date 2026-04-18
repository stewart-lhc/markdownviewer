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
    render(<MarkdownRenderer markdown={source} />);

    expect(screen.getByRole("heading", { level: 1, name: "Demo" })).toBeInTheDocument();
    expect(screen.getByText(/console\.log/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy ts code/i })).toBeInTheDocument();
    expect(screen.getByText("Theme")).toBeInTheDocument();
    expect(screen.getByText(/mermaid diagram/i)).toBeInTheDocument();
  });
});
