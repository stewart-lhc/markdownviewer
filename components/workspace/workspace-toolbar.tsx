type WorkspaceToolbarProps = {
  mode: "preview" | "split" | "editor";
  onModeChange: (mode: "preview" | "split" | "editor") => void;
  onThemeToggle: () => void;
  onExportHtml: () => void;
  onExportPdf: () => void;
  onShare: () => void;
  statusMessage?: string;
};

const modes: WorkspaceToolbarProps["mode"][] = ["preview", "split", "editor"];

export function WorkspaceToolbar({
  mode,
  onModeChange,
  onThemeToggle,
  onExportHtml,
  onExportPdf,
  onShare,
  statusMessage
}: WorkspaceToolbarProps) {
  return (
    <>
      <div className="toolbar" role="toolbar" aria-label="Workspace controls">
        {modes.map((entry) => (
          <button
            className="toolbar-button"
            data-active={entry === mode}
            key={entry}
            onClick={() => onModeChange(entry)}
            type="button"
          >
            {entry === "editor" ? "Editor" : entry === "split" ? "Split" : "Preview"}
          </button>
        ))}
        <button className="toolbar-button" onClick={onThemeToggle} type="button">
          Theme
        </button>
        <button className="toolbar-button" onClick={onExportHtml} type="button">
          Export HTML
        </button>
        <button className="toolbar-button" onClick={onExportPdf} type="button">
          Export PDF
        </button>
        <button className="toolbar-button" onClick={onShare} type="button">
          Share Link
        </button>
      </div>
      {statusMessage ? <p className="toolbar-status">{statusMessage}</p> : null}
    </>
  );
}
