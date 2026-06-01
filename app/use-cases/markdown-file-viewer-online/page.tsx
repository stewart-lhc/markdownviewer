import {
  buildSeoLandingMetadata,
  SeoLandingPageContent
} from "@/components/seo/seo-landing-page";

const slug = "markdown-file-viewer-online";

export const metadata = buildSeoLandingMetadata(slug);

export default function MarkdownFileViewerOnlinePage() {
  return <SeoLandingPageContent slug={slug} />;
}
