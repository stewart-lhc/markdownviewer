const features = [
  {
    title: "Live preview",
    description: "Edit or paste Markdown and watch the rendered document update in the workspace."
  },
  {
    title: "Technical-ready",
    description: "Code fences, tables, KaTeX math, and Mermaid diagrams stay readable instead of collapsing into plain text."
  },
  {
    title: "Fast import",
    description: "Open local files, pasted Markdown, GitHub content, Gists, and raw URLs from the same surface."
  },
  {
    title: "README friendly",
    description: "Preview README.md files, changelogs, API docs, and AI-generated Markdown without a docs-site setup."
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
