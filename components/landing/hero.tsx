import { HeroImportActions } from "@/components/landing/hero-import-actions";
import { SourceStrip } from "@/components/landing/source-strip";

export function Hero() {
  return (
    <div className="hero-copy">
      <div>
        <span className="eyebrow">Markdown without the utility-site look</span>
        <h1>Markdown Viewer Online</h1>
        <p>
          Open Markdown like it deserves. `markdownviewer.run` turns project notes, READMEs,
          AI output, and technical writing into a polished live preview. Start with a file,
          paste raw Markdown, or send a GitHub, Gist, or remote URL straight into the workspace.
        </p>
        <HeroImportActions />
      </div>
      <SourceStrip />
    </div>
  );
}
