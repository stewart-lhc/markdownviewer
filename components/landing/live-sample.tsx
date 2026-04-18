import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { starterDocument } from "@/lib/workspace/default-document";

export function LiveSample() {
  return (
    <div className="hero-preview">
      <span className="preview-ribbon">Live preview sample</span>
      <div className="preview-window">
        <MarkdownRenderer markdown={starterDocument} />
      </div>
    </div>
  );
}
