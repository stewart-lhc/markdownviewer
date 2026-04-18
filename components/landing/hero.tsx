import Link from "next/link";
import { SourceStrip } from "@/components/landing/source-strip";

export function Hero() {
  return (
    <div className="hero-copy">
      <div>
        <span className="eyebrow">Markdown without the utility-site look</span>
        <h1>Open Markdown like it deserves.</h1>
        <p>
          `markdownviewer.run` turns rough project notes, READMEs, and technical writing into
          a polished reading surface. Start with a file, paste raw Markdown, or send a GitHub,
          Gist, or remote URL straight into the workspace.
        </p>
        <div className="hero-actions">
          <button className="button-secondary" type="button">
            Drop a file
          </button>
          <Link className="button-secondary" href="/workspace?sample=starter">
            Open sample
          </Link>
          <form action="/workspace">
            <button className="button-primary" type="submit">
              Open Markdown Now
            </button>
          </form>
        </div>
      </div>
      <SourceStrip />
    </div>
  );
}
