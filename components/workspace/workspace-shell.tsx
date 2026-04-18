"use client";

import { useEffect, useRef, useState } from "react";
import { encodeMarkdownShare } from "@/lib/share/share-codec";
import { exportMarkdownHtml } from "@/lib/workspace/export-html";
import { loadMarkdownSource, LoadedMarkdownSource } from "@/lib/workspace/load-markdown-source";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { OutlinePanel } from "@/components/workspace/outline-panel";
import { SourcePanel } from "@/components/workspace/source-panel";
import { WorkspaceToolbar } from "@/components/workspace/workspace-toolbar";
import { extractHeadings } from "@/lib/markdown/extract-headings";

type WorkspaceMode = "preview" | "split" | "editor";

type WorkspaceShellProps = {
  sourceInput: string;
  markdown: string;
  mode?: WorkspaceMode;
  initialStatusMessage?: string;
  loadSource?: (input: string) => Promise<LoadedMarkdownSource>;
};

export function WorkspaceShell({
  sourceInput,
  markdown,
  mode = "preview",
  initialStatusMessage,
  loadSource = loadMarkdownSource
}: WorkspaceShellProps) {
  const [currentMarkdown, setCurrentMarkdown] = useState(markdown);
  const [currentSource, setCurrentSource] = useState(sourceInput);
  const [currentMode, setCurrentMode] = useState<WorkspaceMode>(mode);
  const [theme, setTheme] = useState<"paper" | "night">("paper");
  const [statusMessage, setStatusMessage] = useState<string | undefined>(initialStatusMessage);
  const previewRef = useRef<HTMLElement | null>(null);
  const headings = extractHeadings(currentMarkdown);

  useEffect(() => {
    window.localStorage.setItem("markdownviewer.workspace.current", currentMarkdown);
  }, [currentMarkdown]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    setCurrentSource(sourceInput);
  }, [sourceInput]);

  useEffect(() => {
    setStatusMessage(initialStatusMessage);
  }, [initialStatusMessage]);

  function readFileContents(file: File) {
    if (typeof file.text === "function") {
      return file.text();
    }

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Failed to read the selected file."));
      reader.readAsText(file);
    });
  }

  async function handleParseSource() {
    try {
      const result = await loadSource(currentSource);

      setCurrentMarkdown(result.markdown);
      setStatusMessage(`Loaded ${result.label}.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to load Markdown.");
    }
  }

  async function handleFileImport(file: File) {
    const nextMarkdown = await readFileContents(file);

    setCurrentSource(`file:${file.name}`);
    setCurrentMarkdown(nextMarkdown);
    setStatusMessage(`Loaded ${file.name}.`);
  }

  async function handlePasteIntoEditor() {
    try {
      const pasted = await navigator.clipboard.readText();

      if (pasted) {
        setCurrentMarkdown(pasted);
        setStatusMessage("Pasted Markdown from clipboard.");
      }
    } catch {
      setStatusMessage("Clipboard paste requires browser permission.");
    }
  }

  function handleExportHtml() {
    const previewMarkup = previewRef.current?.innerHTML ?? "";
    const firstHeading = headings[0]?.text ?? "Markdown Document";

    exportMarkdownHtml(previewMarkup, firstHeading);
    setStatusMessage("Exported HTML snapshot.");
  }

  function handleExportPdf() {
    window.print();
    setStatusMessage("Opened the print dialog for PDF export.");
  }

  async function handleShare() {
    const shareId = encodeMarkdownShare(currentMarkdown);
    const shareUrl = `${window.location.origin}/share/${shareId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatusMessage("Copied share link to clipboard.");
    } catch {
      setStatusMessage(shareUrl);
    }
  }

  return (
    <div className="workspace-page page-shell">
      <header className="topbar">
        <div className="brand">
          markdownviewer<span className="brand-dot">.run</span>
        </div>
        <a className="ghost-link" href="/">
          Home
        </a>
      </header>
      <WorkspaceToolbar
        mode={currentMode}
        onExportHtml={handleExportHtml}
        onExportPdf={handleExportPdf}
        onModeChange={setCurrentMode}
        onShare={handleShare}
        onThemeToggle={() => setTheme((current) => (current === "paper" ? "night" : "paper"))}
        statusMessage={statusMessage}
      />
      <div className="workspace-grid">
        {currentMode !== "preview" ? (
          <SourcePanel
            markdown={currentMarkdown}
            onFileImport={handleFileImport}
            onMarkdownChange={setCurrentMarkdown}
            onParseSource={handleParseSource}
            onPasteIntoEditor={handlePasteIntoEditor}
            onSourceChange={setCurrentSource}
            sourceValue={currentSource}
            visible
          />
        ) : null}
        {currentMode !== "editor" ? (
          <section
            className="workspace-card"
            data-testid="preview-panel"
            data-visible
            ref={previewRef}
          >
            <h2 className="panel-title">Reader preview</h2>
            <p className="panel-copy">
              Strong typography, technical blocks, and long-document structure are treated as
              the product, not an afterthought.
            </p>
            <MarkdownRenderer markdown={currentMarkdown} />
          </section>
        ) : null}
        <OutlinePanel headings={headings} />
      </div>
    </div>
  );
}
