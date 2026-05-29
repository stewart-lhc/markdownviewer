import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { localizePath, type Locale } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { getSharedDocument } from "@/lib/share/mock-share-store";

export type SharePageContentProps = {
  locale: Locale;
  params: Promise<{ id: string }>;
};

export async function buildShareMetadata({ locale, params }: SharePageContentProps): Promise<Metadata> {
  const { id } = await params;
  const document = getSharedDocument(id);
  const t = getMessages(locale);
  const path = localizePath(`/share/${id}`, locale);

  return {
    title: document ? t.share.metadataTitleWithDocument(document.title) : t.share.metadataTitle,
    description: t.share.metadataDescription,
    alternates: {
      canonical: path
    },
    robots: {
      index: false,
      follow: false
    }
  };
}

export async function SharePageContent({ locale, params }: SharePageContentProps) {
  const { id } = await params;
  const document = getSharedDocument(id);
  const t = getMessages(locale);

  if (!document) {
    notFound();
  }

  return (
    <main className="share-shell" lang={locale}>
      <div className="page-shell">
        <div className="share-header">
          <div className="brand">
            markdownviewer<span className="brand-dot">.run</span>
          </div>
          <a className="ghost-link" href={`${localizePath("/workspace", locale)}?share=${encodeURIComponent(id)}`}>
            {t.share.openInWorkspace}
          </a>
        </div>
        <section className="workspace-card">
          <MarkdownRenderer markdown={document.markdown} />
        </section>
      </div>
    </main>
  );
}
