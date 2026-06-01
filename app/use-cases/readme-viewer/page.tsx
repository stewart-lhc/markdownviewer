import {
  buildSeoLandingMetadata,
  SeoLandingPageContent
} from "@/components/seo/seo-landing-page";

const slug = "readme-viewer";

export const metadata = buildSeoLandingMetadata(slug);

export default function ReadmeViewerPage() {
  return <SeoLandingPageContent slug={slug} />;
}
