import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { starterDocument } from "@/lib/workspace/default-document";

type LiveSampleProps = {
  ribbon: string;
};

export function LiveSample({ ribbon }: LiveSampleProps) {
  return (
    <div className="hero-preview">
      <div className="preview-window">
        <div className="preview-window-scroll">
          <span className="preview-ribbon">{ribbon}</span>
          <MarkdownRenderer markdown={starterDocument} variant="compact" />
        </div>
      </div>
    </div>
  );
}
