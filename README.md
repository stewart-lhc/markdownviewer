<div align="center">

# Markdown Viewer Online

**A polished online Markdown viewer for README files, GitHub Flavored Markdown, Mermaid diagrams, KaTeX math, code blocks, AI output, local files, GitHub URLs, Gists, and raw Markdown links.**

[![Live Website](https://img.shields.io/badge/Live-markdownviewer.run-111827?style=for-the-badge)](https://markdownviewer.run/)
[![Workspace](https://img.shields.io/badge/Open-Workspace-2563eb?style=for-the-badge)](https://markdownviewer.run/workspace)
[![License: MIT](https://img.shields.io/badge/License-MIT-16a34a?style=for-the-badge)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)

[Live Markdown Viewer](https://markdownviewer.run/) - [Open the Workspace](https://markdownviewer.run/workspace) - [Star the Project](https://github.com/stewart-lhc/markdownviewer)

</div>

## The Short Pitch

[markdownviewer.run](https://markdownviewer.run/) is a free, open-source Markdown viewer built for people who care how technical Markdown looks before it ships. Paste Markdown, drop a file, open a GitHub README, load a Gist, or preview a raw URL and get a clean live preview in the browser.

It is designed to be more than another plain utility page: Markdownviewer gives README files, AI-generated Markdown, specs, changelogs, Mermaid diagrams, math notes, and code-heavy documents a focused reading surface.

## Why Developers Use It

| Need | What Markdownviewer gives you |
| --- | --- |
| **Preview README.md online** | Open README files before publishing to GitHub, npm, docs pages, or product sites. |
| **Read AI-generated Markdown** | Turn raw ChatGPT, Claude, Cursor, Copilot, or coding-agent output into a clean document. |
| **Check GitHub Flavored Markdown** | Review tables, task lists, links, code fences, and README-style formatting. |
| **Render technical Markdown** | Preview Mermaid diagrams, KaTeX math, and syntax-highlighted code blocks. |
| **Open Markdown from anywhere** | Load local files, pasted Markdown, GitHub content, Gists, and raw URLs. |
| **Skip editor setup** | Use a browser-based Markdown preview workspace without installing a desktop app. |

## Feature Highlights

- **Live Markdown preview** - edit or paste Markdown and see the rendered document update immediately.
- **README-first workflow** - built for README.md, changelogs, API docs, product notes, specs, and long-form technical writing.
- **GitHub Flavored Markdown support** - tables, task lists, links, fenced code blocks, and common README patterns.
- **Mermaid diagram rendering** - preview flowcharts and architecture diagrams inside Markdown.
- **KaTeX math rendering** - read inline and display formulas in technical notes.
- **Syntax-highlighted code blocks** - keep code-heavy documents readable.
- **Multiple import paths** - local files, pasted Markdown, GitHub URLs, Gists, raw Markdown URLs, and sample documents.
- **AI Markdown reader** - clean up Markdown from ChatGPT, Claude, Cursor, Copilot, and other AI tools.
- **Open-source and self-hostable** - MIT licensed, built with Next.js, React, and TypeScript.

## Perfect For

- Developers polishing a project README before publishing.
- Indie hackers adding a Markdown preview tool to their workflow.
- Technical writers reviewing docs without a full docs-site build.
- Students reading notes with code, diagrams, and formulas.
- AI power users turning model output into readable documents.
- Teams that need a fast browser-based Markdown preview for shared links and raw files.

## Backlink-Friendly Description

Use this paragraph when listing the project in directories, roundups, resource pages, or comparison posts:

> [Markdown Viewer Online](https://markdownviewer.run/) is a free online Markdown viewer and live preview workspace for README files, GitHub Flavored Markdown, Mermaid diagrams, KaTeX math, syntax-highlighted code blocks, AI-generated Markdown, local files, GitHub URLs, Gists, and raw Markdown links.

Suggested anchor text:

- Markdown Viewer Online
- online Markdown viewer
- Markdown preview online
- README viewer online
- GitHub Flavored Markdown viewer
- Mermaid Markdown viewer
- AI Markdown viewer

## What Makes It Different

| Typical Markdown utility | Markdownviewer.run |
| --- | --- |
| Plain textarea and preview | Editorial reading surface with a focused workspace |
| Basic Markdown only | README, GFM, code, Mermaid, and KaTeX-oriented rendering |
| Paste-only workflow | File, paste, GitHub, Gist, raw URL, and sample imports |
| Disposable one-off page | Open-source project with a canonical GitHub repository |
| Generic preview experience | Built around developer docs, AI output, and technical writing |

## Live Product Links

- Website: [https://markdownviewer.run/](https://markdownviewer.run/)
- Workspace: [https://markdownviewer.run/workspace](https://markdownviewer.run/workspace)
- Source code: [https://github.com/stewart-lhc/markdownviewer](https://github.com/stewart-lhc/markdownviewer)
- Issues: [https://github.com/stewart-lhc/markdownviewer/issues](https://github.com/stewart-lhc/markdownviewer/issues)

## Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [react-markdown](https://github.com/remarkjs/react-markdown)
- [remark-gfm](https://github.com/remarkjs/remark-gfm)
- [rehype-katex](https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex)
- [Mermaid](https://mermaid.js.org/)
- [Prism.js](https://prismjs.com/)

## Local Development

Requirements:

- Node.js 20 or newer
- npm

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the test suite:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

## Project Structure

```text
app/                 Next.js app routes, metadata, sitemap, and API routes
components/          Landing page, brand, Markdown renderer, and workspace UI
lib/                 Markdown loading, source parsing, sharing, export, and editor logic
public/              Public AI and crawler context files
tests/               Vitest coverage for renderer, workspace, imports, and landing page
types/               Local type declarations
```

## SEO And Attribution

This repository is the canonical open-source home for [markdownviewer.run](https://markdownviewer.run/), an online Markdown viewer and Markdown preview workspace. If you mention the project in a directory, article, comparison, or resource list, please link to the live tool with a descriptive anchor such as "Markdown Viewer Online", "online Markdown viewer", or "Markdown preview online".

The site is positioned around these use cases: markdown viewer, markdown viewer online, online markdown viewer, markdown preview, markdown preview online, GitHub Flavored Markdown viewer, README viewer online, Mermaid Markdown viewer, Markdown viewer with math, AI Markdown viewer, ChatGPT Markdown viewer, Claude Markdown viewer, raw Markdown viewer, and markdown file viewer online.

## Contributing

Issues and pull requests are welcome. Good contributions include renderer fixes, import-source improvements, accessibility improvements, test coverage, performance improvements, and focused workspace UI refinements.

For larger changes, open an issue first so the scope is clear before implementation.

## License

MIT License. See [LICENSE](LICENSE).
