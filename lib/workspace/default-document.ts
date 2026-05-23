export const starterDocument = `# Markdown Feature Atlas

This starter file is a broad reference for the markdown and preview features built into markdownviewer.

## Quick scan

- **Bold**, *italic*, ***bold italic***, ~~strikethrough~~, and \`inline code\`
- [Internal jump](#tables-and-data) and [external link](https://commonmark.org)
- Automatic URL preview: https://github.com
- Angle-bracket autolink: <https://markdown.live>
- Email autolink: <hello@example.com>
- Footnote reference[^1]

> Markdown works best when the source stays readable first.
>
> It should still feel good after rendering.

---

## Headings and structure

### Nested section

#### Deep heading

##### Tiny heading

###### Edge case heading

Paragraphs can include hard breaks when a line ends with two spaces.${"  "}
This sentence starts on the next line.

## Lists

- Unordered item
- Nested bullets
  - Child bullet
  - Another child with \`code\`
- Mixed formatting with **strong** text
- Definition-like label: term followed by explanation text

1. Ordered item
2. Ordered item with a nested checklist
   - [x] Paste markdown snippets
   - [x] Open local files
   - [ ] Publish the final handbook

- [ ] Open TODO list
- [x] Completed task
- [ ] Follow-up task with a [link](https://example.com)

## Quotes and callouts

> "Write in plain text, render on demand."
>
> - Markdown folklore

> Nested quote example
>
> > Inner quote block
> >
> > - Bullet inside a quote

## Tables and data

| Syntax | Example | Status |
| --- | --- | --- |
| Inline math | \`$E = mc^2$\` | Ready |
| GitHub tables | \`| cell |\` | Ready |
| Task lists | \`- [x]\` | Ready |
| Mermaid | \`\`\`mermaid\`\`\` | Ready |

| Alignment | Left | Center | Right |
| :-- | :-- | :--: | --: |
| Cell | Alpha | Beta | Gamma |

## Code blocks

\`\`\`ts
type WorkspaceMode = "preview" | "split" | "editor";

export function greet(name: string) {
  return \`Hello, \${name}\`;
}
\`\`\`

\`\`\`json
{
  "app": "markdownviewer",
  "supports": ["tables", "math", "mermaid", "share"],
  "theme": "paper"
}
\`\`\`

\`\`\`bash
npm run dev
npm test
\`\`\`

\`\`\`python
def greet(name: str) -> str:
    return f"Hello, {name}"
\`\`\`

\`\`\`yaml
app: markdownviewer
features:
  - preview
  - share
  - export
\`\`\`

\`\`\`html
<section class="callout">
  <h2>HTML can live inside fenced code blocks</h2>
</section>
\`\`\`

## Mermaid diagrams

\`\`\`mermaid
graph TD
  A[Paste or Type] --> B[Editor]
  B --> C[Preview]
  C --> D[Share]
  C --> E[Export]
\`\`\`

## Math

Inline math looks like $E = mc^2$ and $\\alpha + \\beta = \\gamma$.

Display math:

$$
\\int_0^1 x^2 dx = \\frac{1}{3}
$$

## Media

![Workspace preview placeholder](https://placehold.co/960x360/f4efe8/17171a?text=Markdown+Preview)

[![Linked thumbnail](https://placehold.co/480x180/e8edf4/1f3552?text=Click+through)](https://example.com/media)

## Escapes

Use \\*asterisks\\* when you want literal characters instead of emphasis.
Use \\# when you need a literal heading marker.

## References

Jump back to [Quick scan](#quick-scan) or visit the [CommonMark spec](https://spec.commonmark.org/).

## Final checklist

- [x] Headings
- [x] Quotes
- [x] Lists
- [x] Tables
- [x] Code fences
- [x] Mermaid
- [x] Math
- [x] Images
- [x] Autolinks
- [x] Footnotes

[^1]: Footnotes come from GitHub Flavored Markdown support.
`;
