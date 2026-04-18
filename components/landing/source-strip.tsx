const sources = ["Local files", "GitHub", "Gist", "Raw URLs", "Pasted Markdown"];

export function SourceStrip() {
  return (
    <div className="support-strip" aria-label="Supported sources">
      {sources.map((source) => (
        <span className="support-pill" key={source}>
          {source}
        </span>
      ))}
    </div>
  );
}
