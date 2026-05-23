import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { starterDocument } from "@/lib/workspace/default-document";

export function LiveSample() {
  return (
    <div className="hero-preview">
      <div className="preview-window">
        <span className="preview-ribbon">Live preview sample</span>
        <MarkdownRenderer markdown={starterDocument} variant="compact" />
      </div>
    </div>
  );
}
