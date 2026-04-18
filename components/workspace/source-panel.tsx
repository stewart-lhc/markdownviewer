type SourcePanelProps = {
  markdown: string;
  sourceValue: string;
  visible: boolean;
  onMarkdownChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onParseSource: () => void;
  onPasteIntoEditor: () => void;
  onFileImport: (file: File) => void;
};

export function SourcePanel({
  markdown,
  sourceValue,
  visible,
  onMarkdownChange,
  onSourceChange,
  onParseSource,
  onPasteIntoEditor,
  onFileImport
}: SourcePanelProps) {
  return (
    <section className="workspace-card" data-visible={visible} data-testid="source-panel">
      <h2 className="panel-title">Drop markdown, paste text, or open a URL</h2>
      <p className="panel-copy">
        The first version keeps input direct: local files, pasted text, GitHub blobs, Gists,
        and raw `.md` links all start from the same panel.
      </p>
      <div className="stack">
        <input
          aria-label="Markdown source URL"
          className="input"
          onChange={(event) => onSourceChange(event.currentTarget.value)}
          placeholder="https://github.com/acme/repo/blob/main/README.md"
          value={sourceValue}
        />
        <label className="sr-only" htmlFor="workspace-file-input">
          Upload markdown file
        </label>
        <input
          className="sr-only"
          id="workspace-file-input"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];

            if (file) {
              onFileImport(file);
            }

            event.currentTarget.value = "";
          }}
          type="file"
          accept=".md,.markdown,.mdx,.txt,text/markdown,text/plain"
        />
        <div className="chip-row">
          <button
            className="chip-button"
            onClick={() => {
              document.getElementById("workspace-file-input")?.click();
            }}
            type="button"
          >
            Drop file
          </button>
          <button className="chip-button" onClick={onPasteIntoEditor} type="button">
            Paste Markdown
          </button>
          <button className="chip-button" onClick={onParseSource} type="button">
            Parse URL
          </button>
        </div>
        <textarea
          aria-label="Markdown editor"
          className="textarea"
          onChange={(event) => onMarkdownChange(event.currentTarget.value)}
          value={markdown}
        />
      </div>
    </section>
  );
}
