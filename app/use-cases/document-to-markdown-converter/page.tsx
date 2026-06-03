import {
  buildSeoLandingMetadata,
  SeoLandingPageContent
} from "@/components/seo/seo-landing-page";

const slug = "document-to-markdown-converter";

export const metadata = buildSeoLandingMetadata(slug);

export default function DocumentToMarkdownConverterPage() {
  return <SeoLandingPageContent slug={slug} />;
}
