type SourceStripProps = {
  ariaLabel: string;
  sources: string[];
};

export function SourceStrip({ ariaLabel, sources }: SourceStripProps) {
  return (
    <div className="support-strip" aria-label={ariaLabel}>
      {sources.map((source) => (
        <span className="support-pill" key={source}>
          {source}
        </span>
      ))}
    </div>
  );
}
