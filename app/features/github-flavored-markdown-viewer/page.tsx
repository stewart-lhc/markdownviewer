import {
  buildSeoLandingMetadata,
  SeoLandingPageContent
} from "@/components/seo/seo-landing-page";

const slug = "github-flavored-markdown-viewer";

export const metadata = buildSeoLandingMetadata(slug);

export default function GithubFlavoredMarkdownViewerPage() {
  return <SeoLandingPageContent slug={slug} />;
}
