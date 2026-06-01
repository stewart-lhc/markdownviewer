import { LiveSampleCopyButton } from "@/components/landing/live-sample-copy-button";

type LiveSampleProps = {
  ribbon: string;
};

const sampleCode = [
  'type WorkspaceMode = "preview" | "split" | "editor";',
  "",
  "export function greet(name: string) {",
  "  return `Hello, ${name}`;",
  "}"
].join("\n");

export function LiveSample({ ribbon }: LiveSampleProps) {
  return (
    <div className="hero-preview">
      <div className="preview-window">
        <div className="preview-window-scroll">
          <span className="preview-ribbon">{ribbon}</span>
          <article className="markdown-body markdown-body--compact">
            <h1>Markdown Feature Atlas</h1>
            <p>
              This starter file is a broad reference for the markdown and preview features built into markdownviewer.
            </p>
            <h2>Quick scan</h2>
            <ul>
              <li>
                <strong>Bold</strong>, <em>italic</em>,{" "}
                <strong>
                  <em>bold italic</em>
                </strong>
                , <del>strikethrough</del>, and <code>inline code</code>
              </li>
              <li>
                <a href="#tables-and-data">Internal jump</a> and{" "}
                <a href="https://commonmark.org">external link</a>
              </li>
              <li>Automatic URL preview: https://github.com</li>
              <li>
                Footnote reference<sup>1</sup>
              </li>
            </ul>
            <blockquote>
              <p>Markdown works best when the source stays readable first.</p>
              <p>It should still feel good after rendering.</p>
            </blockquote>
            <hr />
            <h2 id="tables-and-data">Tables and data</h2>
            <table>
              <thead>
                <tr>
                  <th>Syntax</th>
                  <th>Example</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Inline math</td>
                  <td>
                    <code>$E = mc^2$</code>
                  </td>
                  <td>Ready</td>
                </tr>
                <tr>
                  <td>GitHub tables</td>
                  <td>
                    <code>| cell |</code>
                  </td>
                  <td>Ready</td>
                </tr>
                <tr>
                  <td>Mermaid</td>
                  <td>
                    <code>```mermaid```</code>
                  </td>
                  <td>Ready</td>
                </tr>
              </tbody>
            </table>
            <h2>Code blocks</h2>
            <div className="code-frame">
              <div className="code-toolbar">
                <span>ts</span>
                <LiveSampleCopyButton code={sampleCode} language="ts" />
              </div>
              <pre>
                <code className="language-ts">{sampleCode}</code>
              </pre>
            </div>
            <h2>Mermaid diagrams</h2>
            <div aria-label="Diagram flow" className="mermaid-compact">
              <div className="mermaid-compact-label">Diagram flow</div>
              <div className="mermaid-compact-steps">
                <div className="mermaid-compact-step">
                  <span>Paste Markdown</span>
                  <span aria-hidden="true" className="mermaid-compact-arrow">
                    {"->"}
                  </span>
                </div>
                <div className="mermaid-compact-step">
                  <span>Preview</span>
                  <span aria-hidden="true" className="mermaid-compact-arrow">
                    {"->"}
                  </span>
                </div>
                <div className="mermaid-compact-step">
                  <span>Share</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
