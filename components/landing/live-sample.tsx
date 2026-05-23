import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { starterDocument } from "@/lib/workspace/default-document";

export function LiveSample() {
  return (
    <div className="hero-preview">
      <div className="preview-window">
        <div className="preview-window-scroll">
          <span className="preview-ribbon">Live preview sample</span>
          <MarkdownRenderer markdown={starterDocument} variant="compact" />
        </div>
      </div>
    </div>
  );
}
