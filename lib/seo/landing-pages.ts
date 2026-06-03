export type SeoLandingSection = Readonly<{
  body: string;
  title: string;
}>;

export type SeoLandingFaq = Readonly<{
  answer: string;
  question: string;
}>;

export type SeoLandingPage = Readonly<{
  benefits: readonly string[];
  ctaLabel: string;
  description: string;
  eyebrow: string;
  faq: readonly SeoLandingFaq[];
  h1: string;
  intro: string;
  path: string;
  primaryKeywords: readonly string[];
  relatedSlugs: readonly string[];
  sections: readonly SeoLandingSection[];
  slug: string;
  summary: string;
  title: string;
  workflow: readonly string[];
}>;

export const seoLandingPages = [
  {
    slug: "readme-viewer",
    path: "/use-cases/readme-viewer",
    title: "README Viewer Online - Preview README.md Files",
    description:
      "Preview README.md files online with GitHub Flavored Markdown, code blocks, tables, Mermaid diagrams, and a clean live reading workspace.",
    h1: "README Viewer Online",
    eyebrow: "README preview workflow",
    summary: "Preview README.md files before publishing to GitHub, npm, docs sites, or project portals.",
    intro:
      "Use markdownviewer.run as a focused README viewer when you need to check how project documentation reads before it goes public. Open a local README.md file, paste draft copy, or load raw Markdown from a URL, then inspect headings, tables, code blocks, diagrams, and links in a polished live preview.",
    ctaLabel: "Preview a README",
    primaryKeywords: ["README viewer", "README viewer online", "README.md preview", "GitHub README preview"],
    benefits: [
      "Check README structure before pushing a repository update.",
      "Review tables, task lists, fenced code blocks, links, and long technical sections.",
      "Use the same workspace for changelogs, API notes, and install guides."
    ],
    workflow: [
      "Open the workspace and choose File, Paste, GitHub, Gist, or URL.",
      "Review the rendered README beside the Markdown source.",
      "Fix unclear headings, broken tables, or unreadable code examples before publishing."
    ],
    sections: [
      {
        title: "A README viewer for real project docs",
        body:
          "README files often mix product positioning, install commands, screenshots, API examples, tables, and release notes. A plain text editor can hide readability problems until the file is already published. Markdownviewer gives you a clean rendered surface without requiring a docs-site build."
      },
      {
        title: "Useful before GitHub, npm, and launch pages",
        body:
          "The page is tuned for README.md review work: GitHub Flavored Markdown, syntax-highlighted code, task lists, and long technical sections stay readable. It is also useful for package documentation, onboarding notes, and release announcement drafts."
      }
    ],
    faq: [
      {
        question: "Can I preview a local README.md file?",
        answer: "Yes. Open the workspace and choose File to load a local README.md or Markdown file into the live preview."
      },
      {
        question: "Does it support GitHub-style README formatting?",
        answer:
          "Yes. The renderer supports common GitHub Flavored Markdown patterns including tables, task lists, fenced code blocks, and README-style links."
      },
      {
        question: "Can I edit the README while previewing it?",
        answer: "Yes. The workspace keeps the Markdown source and rendered preview together so you can edit and review in one place."
      }
    ],
    relatedSlugs: ["github-flavored-markdown-viewer", "markdown-file-viewer-online", "mermaid-markdown-viewer"]
  },
  {
    slug: "github-flavored-markdown-viewer",
    path: "/features/github-flavored-markdown-viewer",
    title: "GitHub Flavored Markdown Viewer Online",
    description:
      "Render GitHub Flavored Markdown online with tables, task lists, fenced code blocks, links, README files, and technical docs.",
    h1: "GitHub Flavored Markdown Viewer",
    eyebrow: "GFM rendering",
    summary: "Render tables, task lists, code fences, links, and README-style Markdown in a browser workspace.",
    intro:
      "Markdownviewer is built for the Markdown style developers already write in repositories. Paste GitHub Flavored Markdown, open a README, or load a raw file URL to check tables, task lists, code fences, links, and documentation rhythm before sharing.",
    ctaLabel: "Open the GFM viewer",
    primaryKeywords: [
      "GitHub Flavored Markdown viewer",
      "GitHub markdown preview online",
      "GFM viewer",
      "markdown table viewer"
    ],
    benefits: [
      "Preview GitHub-style tables and task lists without opening a repository editor.",
      "Check fenced code blocks and long technical docs in a clean reader.",
      "Load Markdown from files, pasted text, GitHub, Gists, or raw URLs."
    ],
    workflow: [
      "Paste GitHub Flavored Markdown or load a raw GitHub URL.",
      "Use split view to compare the source with the rendered document.",
      "Export, share, or keep editing after the formatting looks right."
    ],
    sections: [
      {
        title: "Built around repository Markdown",
        body:
          "GitHub Flavored Markdown adds the patterns developers rely on every day: tables, task lists, fenced code, autolinks, and README conventions. Markdownviewer renders these details so documentation problems are easier to catch before publishing."
      },
      {
        title: "Good for docs that are too long for a textarea",
        body:
          "Long issue templates, migration guides, API docs, and release notes are easier to review in a proper reading surface. The workspace keeps formatting controls out of the way while preserving source editing when you need it."
      }
    ],
    faq: [
      {
        question: "What GitHub Flavored Markdown features are supported?",
        answer: "Tables, task lists, links, fenced code blocks, README-style documents, and common technical Markdown patterns are supported."
      },
      {
        question: "Can I preview Markdown from a GitHub raw URL?",
        answer: "Yes. Use the URL import in the workspace to load Markdown from raw GitHub content, Gists, or other accessible raw URLs."
      },
      {
        question: "Is this only for GitHub repositories?",
        answer: "No. It works for any Markdown source, but the rendering defaults are designed to make repository-style documents readable."
      }
    ],
    relatedSlugs: ["readme-viewer", "markdown-file-viewer-online", "markdown-math-preview"]
  },
  {
    slug: "mermaid-markdown-viewer",
    path: "/features/mermaid-markdown-viewer",
    title: "Mermaid Markdown Viewer - Preview Diagrams Online",
    description:
      "Preview Mermaid diagrams inside Markdown documents online with live Markdown rendering, code blocks, README support, and export-friendly reading.",
    h1: "Mermaid Markdown Viewer",
    eyebrow: "Diagram-ready Markdown",
    summary: "Preview Mermaid flowcharts and diagrams inside README files, specs, notes, and technical docs.",
    intro:
      "Mermaid diagrams make architecture notes, runbooks, and planning docs easier to understand, but diagram syntax is hard to review as plain text. Markdownviewer renders Mermaid code fences inside the Markdown document so you can inspect the full page context.",
    ctaLabel: "Preview Mermaid Markdown",
    primaryKeywords: [
      "Mermaid markdown viewer",
      "markdown viewer with Mermaid",
      "Mermaid preview online",
      "Markdown diagram viewer"
    ],
    benefits: [
      "Render Mermaid diagrams next to headings, paragraphs, and code examples.",
      "Check diagrams embedded in README files, specs, and architecture notes.",
      "Use the same workspace for surrounding Markdown edits."
    ],
    workflow: [
      "Open a Markdown document that contains a Mermaid code fence.",
      "Review the rendered diagram inside the live preview.",
      "Adjust the diagram syntax or surrounding explanation until the page reads clearly."
    ],
    sections: [
      {
        title: "Diagrams belong in the document context",
        body:
          "A standalone diagram preview can confirm syntax, but it does not show whether the diagram supports the surrounding explanation. Markdownviewer keeps Mermaid diagrams inside the rendered Markdown page so the narrative and visual structure can be reviewed together."
      },
      {
        title: "Useful for architecture and workflow docs",
        body:
          "Flowcharts, sequence diagrams, dependency maps, and process diagrams are common in technical Markdown. Rendering them in the same workspace as the source document makes review faster for engineering notes and planning docs."
      }
    ],
    faq: [
      {
        question: "Can this preview Mermaid diagrams in README files?",
        answer: "Yes. Mermaid code fences render inside the Markdown preview when the document includes supported Mermaid syntax."
      },
      {
        question: "Do I need to install Mermaid locally?",
        answer: "No. The browser workspace renders Mermaid diagrams as part of the online Markdown preview."
      },
      {
        question: "Can I edit the diagram source?",
        answer: "Yes. Edit the Markdown source and the rendered preview updates with the surrounding document."
      }
    ],
    relatedSlugs: ["readme-viewer", "github-flavored-markdown-viewer", "markdown-math-preview"]
  },
  {
    slug: "markdown-math-preview",
    path: "/features/markdown-math-preview",
    title: "Markdown Math Preview - KaTeX and LaTeX Viewer",
    description:
      "Preview Markdown with math notation online using KaTeX rendering for formulas, technical notes, lecture notes, README files, and docs.",
    h1: "Markdown Math Preview",
    eyebrow: "Math-ready Markdown",
    summary: "Preview Markdown documents with KaTeX math, formulas, code blocks, and technical explanations.",
    intro:
      "Math-heavy Markdown needs more than a basic text preview. Markdownviewer renders KaTeX notation alongside the rest of your document, so formulas, code examples, tables, and explanations can be reviewed together before publishing or sharing.",
    ctaLabel: "Preview Markdown with math",
    primaryKeywords: [
      "markdown math preview",
      "markdown viewer with math",
      "KaTeX markdown preview",
      "markdown viewer with LaTeX"
    ],
    benefits: [
      "Preview inline and display math in the same document as your prose.",
      "Review lecture notes, engineering docs, analysis notes, and technical README files.",
      "Keep formulas, tables, and code examples readable in one workspace."
    ],
    workflow: [
      "Paste or open Markdown that includes math notation.",
      "Check how formulas render next to headings, paragraphs, and code examples.",
      "Edit the source until formulas and surrounding explanations are readable."
    ],
    sections: [
      {
        title: "For formulas inside real documents",
        body:
          "Math previews are most useful when formulas appear in context. Markdownviewer renders KaTeX notation while preserving the rest of the Markdown document, making it easier to review technical explanations instead of isolated equations."
      },
      {
        title: "Good for notes, specs, and technical drafts",
        body:
          "Use it for lecture notes, quantitative analysis, API docs, algorithm notes, and README files that mix formulas with code blocks and tables. The workspace keeps the rendered document readable while source edits remain close by."
      }
    ],
    faq: [
      {
        question: "Does Markdownviewer support KaTeX math?",
        answer: "Yes. Markdownviewer renders math notation with KaTeX in the Markdown preview."
      },
      {
        question: "Can I preview LaTeX-style formulas in Markdown?",
        answer: "Yes. Use common inline or display math notation in your Markdown and review the rendered formulas in the workspace."
      },
      {
        question: "Is this useful for lecture notes?",
        answer: "Yes. Lecture notes, algorithm notes, and technical drafts with formulas are good fits for the math preview workflow."
      }
    ],
    relatedSlugs: ["github-flavored-markdown-viewer", "mermaid-markdown-viewer", "readme-viewer"]
  },
  {
    slug: "ai-markdown-viewer",
    path: "/use-cases/ai-markdown-viewer",
    title: "AI Markdown Viewer - Read ChatGPT and Claude Markdown",
    description:
      "Turn Markdown from ChatGPT, Claude, Cursor, Copilot, and coding agents into a clean live preview for review, editing, export, and sharing.",
    h1: "AI Markdown Viewer",
    eyebrow: "AI output reader",
    summary: "Read and edit Markdown generated by ChatGPT, Claude, Cursor, Copilot, and coding agents.",
    intro:
      "AI tools often return useful work as raw Markdown: plans, tables, reports, specs, code notes, and release drafts. Markdownviewer turns that output into a clean rendered document so you can review the result instead of reading formatting syntax.",
    ctaLabel: "Read AI Markdown",
    primaryKeywords: [
      "AI markdown viewer",
      "ChatGPT markdown viewer",
      "Claude markdown viewer",
      "preview AI-generated Markdown"
    ],
    benefits: [
      "Paste AI-generated Markdown and read it as a formatted document.",
      "Check tables, headings, code blocks, and diagrams before sharing.",
      "Edit rough model output into a cleaner draft in the same workspace."
    ],
    workflow: [
      "Copy Markdown from ChatGPT, Claude, Cursor, Copilot, or another AI tool.",
      "Paste it into the workspace and review the rendered output.",
      "Clean up headings, tables, and code blocks before exporting or sharing."
    ],
    sections: [
      {
        title: "AI answers are easier to judge when rendered",
        body:
          "Raw Markdown can hide weak structure, broken tables, and unreadable code examples. Rendering the answer makes it easier to decide whether the AI output is ready to use, needs editing, or should be regenerated."
      },
      {
        title: "A practical review surface for coding agents",
        body:
          "Coding agents and assistants often produce plans, diffs, test notes, and release summaries in Markdown. Markdownviewer helps turn those outputs into readable review documents without setting up a docs tool."
      }
    ],
    faq: [
      {
        question: "Can I paste Markdown from ChatGPT or Claude?",
        answer: "Yes. Paste the Markdown into the workspace and review the rendered document immediately."
      },
      {
        question: "Does it work for AI-generated tables and code blocks?",
        answer: "Yes. Tables, headings, fenced code blocks, and common technical Markdown patterns render in the preview."
      },
      {
        question: "Is pasted AI output uploaded?",
        answer:
          "Local files and pasted Markdown are handled in your browser unless you choose to load a remote URL or create a share link."
      }
    ],
    relatedSlugs: ["markdown-file-viewer-online", "github-flavored-markdown-viewer", "readme-viewer"]
  },
  {
    slug: "markdown-file-viewer-online",
    path: "/use-cases/markdown-file-viewer-online",
    title: "Markdown File Viewer Online - Open .md Files in Browser",
    description:
      "Open and preview .md, .markdown, and Markdown text files online with live rendering, local file support, raw URL import, and export tools.",
    h1: "Markdown File Viewer Online",
    eyebrow: "File and URL import",
    summary: "Open .md files, pasted Markdown, GitHub content, Gists, and raw URLs in a browser Markdown preview.",
    intro:
      "When someone sends you a Markdown file, you should not need to start a docs server just to read it. Markdownviewer opens local .md files, pasted Markdown, GitHub content, Gists, and raw URLs in a clean browser preview.",
    ctaLabel: "Open a Markdown file",
    primaryKeywords: [
      "markdown file viewer online",
      "open md file online",
      "raw markdown viewer",
      "view markdown from URL"
    ],
    benefits: [
      "Open local .md, .markdown, .mdx, and text files in the browser.",
      "Load raw Markdown from accessible URLs, GitHub, or Gists.",
      "Use live preview, editing, sharing, and export from one workspace."
    ],
    workflow: [
      "Choose File, Paste, GitHub, Gist, or URL from the workspace import controls.",
      "Review the rendered Markdown in split view or preview mode.",
      "Keep editing, export HTML/PDF, or share a generated link when needed."
    ],
    sections: [
      {
        title: "Open Markdown without a local toolchain",
        body:
          "A Markdown file viewer should be fast enough for a one-off file and capable enough for a longer document. Markdownviewer handles both: quick file opening and a persistent workspace for drafts that need more review."
      },
      {
        title: "Works with files, folders, and URLs",
        body:
          "Use a single document import for quick reads, or open a local folder in supported Chromium browsers when you need to browse and edit multiple Markdown files. Raw URL import covers docs hosted outside your machine."
      }
    ],
    faq: [
      {
        question: "Can I open a local .md file online?",
        answer: "Yes. Choose File in the workspace to open a local Markdown file in your browser."
      },
      {
        question: "Can I view Markdown from a URL?",
        answer: "Yes. Paste an accessible raw Markdown URL into the workspace URL import field."
      },
      {
        question: "Can I save changes back to disk?",
        answer:
          "For local folder workflows in supported Chrome or Edge desktop browsers, Markdownviewer can save edited files back to disk after you grant folder access."
      }
    ],
    relatedSlugs: ["readme-viewer", "ai-markdown-viewer", "github-flavored-markdown-viewer"]
  },
  {
    slug: "document-to-markdown-converter",
    path: "/use-cases/document-to-markdown-converter",
    title: "Document to Markdown Converter - Word, PDF, HTML, and Data Files",
    description:
      "Convert DOCX, PPTX, XLSX, CSV, HTML, JSON, XML, and text-heavy PDF files to Markdown, then review the result in a live Markdown workspace.",
    h1: "Document to Markdown Converter",
    eyebrow: "Convert files into Markdown",
    summary:
      "Convert common Office, HTML, data, and text-heavy PDF files into Markdown and open the result in a persistent browser workspace tab.",
    intro:
      "Markdownviewer now includes a document-to-Markdown conversion path for files that start outside Markdown. Upload a supported DOCX, PPTX, XLSX, XLS, CSV, HTML, JSON, XML, or text-heavy PDF file, convert it to Markdown, and review the converted result in the same live preview workspace used for README files and technical docs.",
    ctaLabel: "Open the converter",
    primaryKeywords: [
      "document to Markdown converter",
      "Word to Markdown converter",
      "PDF to Markdown converter",
      "DOCX to Markdown",
      "HTML to Markdown converter"
    ],
    benefits: [
      "Turn Office and data files into Markdown before editing or sharing.",
      "Review converted headings, lists, tables, and links in a live Markdown preview.",
      "Keep converted results in normal workspace tabs with local browser persistence."
    ],
    workflow: [
      "Open the workspace and choose Convert from the import controls.",
      "Select a supported DOCX, PPTX, spreadsheet, HTML, JSON, XML, CSV, or text-heavy PDF file.",
      "Review the converted Markdown in a new tab, then edit, export, share, or keep it locally."
    ],
    sections: [
      {
        title: "Convert first, review immediately",
        body:
          "Most document converters stop at a download. Markdownviewer keeps the next step inside the product: the converted Markdown opens as a workspace tab so you can inspect structure, headings, tables, and links before using it in docs, AI workflows, or publishing pipelines."
      },
      {
        title: "Built for text-heavy files, not high-fidelity layout",
        body:
          "The converter is aimed at extracting readable Markdown from text-first documents. It is a good fit for notes, specs, reports, spreadsheets, and text-heavy PDFs, but it does not promise pixel-perfect page layout or OCR for scanned documents."
      }
    ],
    faq: [
      {
        question: "Which file types can be converted to Markdown?",
        answer:
          "Markdownviewer supports DOCX, PPTX, XLSX, XLS, CSV, HTML, HTM, JSON, XML, and text-heavy PDF files for the document conversion workflow."
      },
      {
        question: "Where does the converted Markdown open?",
        answer:
          "After conversion, the Markdown opens automatically in a new workspace tab. The tab can be restored from browser workspace storage like other imported tabs."
      },
      {
        question: "Are original files stored on the server?",
        answer:
          "No. The conversion endpoint uses a temporary server file during the request and deletes it after the conversion finishes. Converted tabs persist locally in the browser workspace, not as server-side history."
      },
      {
        question: "Does PDF conversion include OCR?",
        answer:
          "No. The MVP is for text-heavy PDFs. Scanned PDFs and image-only documents need OCR, which is outside the current scope."
      }
    ],
    relatedSlugs: ["markdown-file-viewer-online", "ai-markdown-viewer", "readme-viewer"]
  }
] as const satisfies readonly SeoLandingPage[];

export type SeoLandingSlug = (typeof seoLandingPages)[number]["slug"];

export const seoLandingPageSlugs = seoLandingPages.map((page) => page.slug);

export function getSeoLandingPage(slug: string): SeoLandingPage | undefined {
  return seoLandingPages.find((page) => page.slug === slug);
}
