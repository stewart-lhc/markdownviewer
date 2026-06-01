import {
  buildSeoLandingMetadata,
  SeoLandingPageContent
} from "@/components/seo/seo-landing-page";

const slug = "markdown-math-preview";

export const metadata = buildSeoLandingMetadata(slug);

export default function MarkdownMathPreviewPage() {
  return <SeoLandingPageContent slug={slug} />;
}
