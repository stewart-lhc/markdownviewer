import { ExtractedHeading } from "@/lib/markdown/extract-headings";

type OutlinePanelProps = {
  headings: ExtractedHeading[];
};

export function OutlinePanel({ headings }: OutlinePanelProps) {
  return (
    <aside className="workspace-card">
      <h2 className="panel-title">Document outline</h2>
      <div className="outline-list">
        {headings.map((heading) => (
          <a
            className="outline-item"
            data-depth={heading.depth}
            href={`#${heading.id}`}
            key={`${heading.id}-${heading.depth}`}
          >
            {heading.text}
          </a>
        ))}
      </div>
    </aside>
  );
}
