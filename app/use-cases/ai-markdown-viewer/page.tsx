import {
  buildSeoLandingMetadata,
  SeoLandingPageContent
} from "@/components/seo/seo-landing-page";

const slug = "ai-markdown-viewer";

export const metadata = buildSeoLandingMetadata(slug);

export default function AiMarkdownViewerPage() {
  return <SeoLandingPageContent slug={slug} />;
}
