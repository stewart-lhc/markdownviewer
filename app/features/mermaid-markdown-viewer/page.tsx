import {
  buildSeoLandingMetadata,
  SeoLandingPageContent
} from "@/components/seo/seo-landing-page";

const slug = "mermaid-markdown-viewer";

export const metadata = buildSeoLandingMetadata(slug);

export default function MermaidMarkdownViewerPage() {
  return <SeoLandingPageContent slug={slug} />;
}
