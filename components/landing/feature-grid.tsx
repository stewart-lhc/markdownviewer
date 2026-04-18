const features = [
  {
    title: "Reader-first",
    description: "Editorial typography, balanced spacing, and calm controls that stay out of the way."
  },
  {
    title: "Technical-ready",
    description: "Code fences, tables, math, and Mermaid stay readable instead of collapsing into plain text."
  },
  {
    title: "Fast import",
    description: "Open local files, pasted Markdown, GitHub blobs, Gists, and raw URLs from the same surface."
  },
  {
    title: "Shareable output",
    description: "The workspace is designed to feed clean public pages and export flows without a docs-site setup."
  }
];

export function FeatureGrid() {
  return (
    <div className="feature-grid">
      {features.map((feature) => (
        <article className="surface-card" key={feature.title}>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </article>
      ))}
    </div>
  );
}
