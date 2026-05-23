import { defaultWorkspaceTheme, getWorkspaceThemeOption, type WorkspaceTheme } from "@/lib/workspace/themes";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeFilename(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "markdown-document"
  );
}

export function buildMarkdownHtmlDocument(
  markup: string,
  title: string,
  theme: WorkspaceTheme = defaultWorkspaceTheme
) {
  const template = getWorkspaceThemeOption(theme);
  const tokens = template.export;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        --mv-accent: ${tokens.accent};
        --mv-background: ${tokens.background};
        --mv-body-font: ${tokens.bodyFont};
        --mv-body-size: ${tokens.bodySize};
        --mv-border: ${tokens.border};
        --mv-code-bg: ${tokens.codeBackground};
        --mv-code-chrome: ${tokens.codeChrome};
        --mv-code-text: ${tokens.codeText};
        --mv-heading: ${tokens.heading};
        --mv-heading-font: ${tokens.headingFont};
        --mv-line-height: ${tokens.lineHeight};
        --mv-link: ${tokens.link};
        --mv-max-width: ${tokens.maxWidth};
        --mv-muted: ${tokens.muted};
        --mv-quote-bg: ${tokens.quoteBackground};
        --mv-quote-border: ${tokens.quoteBorder};
        --mv-radius: ${tokens.radius};
        --mv-shadow: ${tokens.shadow};
        --mv-surface: ${tokens.surface};
        --mv-table-header: ${tokens.tableHeader};
        --mv-table-stripe: ${tokens.tableStripe};
        --mv-text: ${tokens.text};
      }

      * {
        box-sizing: border-box;
      }

      html {
        color-scheme: light;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background: var(--mv-background);
        color: var(--mv-text);
        font-family: var(--mv-body-font);
        font-size: var(--mv-body-size);
        line-height: var(--mv-line-height);
      }

      .markdown-export-shell {
        width: min(100% - 32px, var(--mv-max-width));
        margin: 0 auto;
        padding: 56px 0;
      }

      .markdown-body {
        display: grid;
        gap: 1rem;
        min-width: 0;
        margin: 0;
        padding: clamp(28px, 5vw, 54px);
        border: 1px solid var(--mv-border);
        border-radius: var(--mv-radius);
        background: var(--mv-surface);
        box-shadow: var(--mv-shadow);
        color: var(--mv-text);
      }

      .markdown-body > * {
        min-width: 0;
        max-width: 100%;
        margin-top: 0;
        margin-bottom: 0;
      }

      .markdown-body h1,
      .markdown-body h2,
      .markdown-body h3,
      .markdown-body h4,
      .markdown-body h5,
      .markdown-body h6 {
        color: var(--mv-heading);
        font-family: var(--mv-heading-font);
        line-height: 1.12;
      }

      .markdown-body h1 {
        padding-bottom: 0.7rem;
        border-bottom: 1px solid var(--mv-border);
        font-size: clamp(2.2rem, 6vw, 3.6rem);
      }

      .markdown-body h2 {
        margin-top: 1.4rem;
        font-size: clamp(1.55rem, 3.4vw, 2.05rem);
      }

      .markdown-body h3 {
        margin-top: 1rem;
        font-size: 1.25rem;
      }

      .markdown-body p,
      .markdown-body li,
      .markdown-body td,
      .markdown-body th,
      .markdown-body blockquote {
        color: var(--mv-text);
      }

      .markdown-body a {
        color: var(--mv-link);
        text-decoration-thickness: 0.08em;
        text-underline-offset: 0.18em;
      }

      .markdown-body ul,
      .markdown-body ol {
        display: grid;
        gap: 0.35rem;
        padding-left: 1.35rem;
      }

      .markdown-body blockquote {
        margin-left: 0;
        padding: 0.85rem 1rem;
        border-left: 4px solid var(--mv-quote-border);
        background: var(--mv-quote-bg);
      }

      .markdown-body code {
        border-radius: 0.45rem;
        background: var(--mv-code-bg);
        color: var(--mv-code-text);
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
        font-size: 0.88em;
        padding: 0.12rem 0.35rem;
      }

      .markdown-body pre {
        margin: 0;
        overflow-x: auto;
      }

      .markdown-body pre code,
      .code-frame code {
        display: block;
        padding: 0;
        background: transparent;
        color: var(--mv-code-text);
      }

      .markdown-body table {
        width: 100%;
        border-collapse: collapse;
        display: block;
        overflow-x: auto;
        border-radius: var(--mv-radius);
      }

      .markdown-body th,
      .markdown-body td {
        border: 1px solid var(--mv-border);
        padding: 0.7rem 0.85rem;
        text-align: left;
      }

      .markdown-body th {
        background: var(--mv-table-header);
        color: var(--mv-heading);
      }

      .markdown-body tr:nth-child(even) td {
        background: var(--mv-table-stripe);
      }

      .markdown-body img,
      .markdown-body svg {
        display: block;
        max-width: 100%;
        height: auto;
      }

      .code-frame,
      .mermaid-frame {
        overflow: hidden;
        border: 1px solid var(--mv-border);
        border-radius: var(--mv-radius);
        background: var(--mv-code-bg);
        color: var(--mv-code-text);
      }

      .code-toolbar,
      .mermaid-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.75rem 0.9rem;
        border-bottom: 1px solid var(--mv-border);
        background: var(--mv-code-chrome);
        color: var(--mv-muted);
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
        font-size: 0.78rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .code-copy {
        display: none;
      }

      .code-frame pre,
      .mermaid-frame pre {
        padding: 1rem;
      }

      .mermaid-svg {
        overflow-x: auto;
        padding: 1rem;
        background: #fff;
      }

      .katex-display {
        overflow-x: auto;
        overflow-y: hidden;
        padding: 0.4rem 0;
      }

      @media (max-width: 720px) {
        .markdown-export-shell {
          width: min(100% - 20px, 100%);
          padding: 20px 0;
        }

        .markdown-body {
          padding: 22px;
        }
      }

      @media print {
        body {
          background: #fff;
        }

        .markdown-export-shell {
          width: 100%;
          padding: 0;
        }

        .markdown-body {
          border: 0;
          border-radius: 0;
          box-shadow: none;
        }
      }
    </style>
  </head>
  <body>
    <main class="markdown-export-shell" data-template="${template.id}">
      ${markup}
    </main>
  </body>
</html>`;
}

export function exportMarkdownHtml(
  markup: string,
  title: string,
  theme: WorkspaceTheme = defaultWorkspaceTheme
) {
  const documentHtml = buildMarkdownHtmlDocument(markup, title, theme);

  const blob = new Blob([documentHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const isJsdom = window.navigator.userAgent.toLowerCase().includes("jsdom");

  anchor.href = url;
  anchor.download = `${sanitizeFilename(title)}.html`;

  if (!isJsdom) {
    anchor.click();
  }

  URL.revokeObjectURL(url);
}
