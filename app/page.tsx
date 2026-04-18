import { FeatureGrid } from "@/components/landing/feature-grid";
import { Hero } from "@/components/landing/hero";
import { LiveSample } from "@/components/landing/live-sample";

export default function HomePage() {
  return (
    <main className="landing">
      <div className="page-shell">
        <header className="topbar">
          <div className="brand">
            markdownviewer<span className="brand-dot">.run</span>
          </div>
          <a className="ghost-link" href="/workspace">
            Enter workspace
          </a>
        </header>
        <div className="hero">
          <Hero />
          <LiveSample />
        </div>

        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Why this wins</p>
              <h2 className="section-title">A Markdown viewer with editorial standards.</h2>
            </div>
            <p className="section-copy">
              The first-use path stays obvious, while the rendering surface treats code,
              diagrams, math, and reading rhythm like first-class material.
            </p>
          </div>
          <FeatureGrid />
        </section>
      </div>
    </main>
  );
}
