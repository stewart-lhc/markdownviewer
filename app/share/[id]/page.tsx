import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { getSharedDocument } from "@/lib/share/mock-share-store";

type SharePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const document = getSharedDocument(id);

  return {
    title: document ? `${document.title} - Shared Markdown` : "Shared Markdown",
    description: "A shared Markdown preview rendered by markdownviewer.run.",
    alternates: {
      canonical: `/share/${id}`
    },
    robots: {
      index: false,
      follow: false
    }
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const document = getSharedDocument(id);

  if (!document) {
    notFound();
  }

  return (
    <main className="share-shell">
      <div className="page-shell">
        <div className="share-header">
          <div className="brand">
            markdownviewer<span className="brand-dot">.run</span>
          </div>
          <a className="ghost-link" href={`/workspace?share=${encodeURIComponent(id)}`}>
            Open in workspace
          </a>
        </div>
        <section className="workspace-card">
          <MarkdownRenderer markdown={document.markdown} />
        </section>
      </div>
    </main>
  );
}
