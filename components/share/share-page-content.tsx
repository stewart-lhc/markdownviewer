import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandLink } from "@/components/brand/brand-link";
import { ShareReader } from "@/components/share/share-reader";
import { localizePath, type Locale } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { getSharedDocument } from "@/lib/share/share-store";

export type SharePageContentProps = {
  locale: Locale;
  params: Promise<{ id: string }>;
};

export async function buildShareMetadata({ locale, params }: SharePageContentProps): Promise<Metadata> {
  const { id } = await params;
  const document = await getSharedDocument(id);
  const t = getMessages(locale);
  const path = localizePath(`/share/${id}`, locale);

  return {
    title: document ? t.share.metadataTitleWithDocument(document.title) : t.share.metadataTitle,
    description: t.share.metadataDescription,
    alternates: {
      canonical: path
    },
    robots:
      document?.source === "stored"
        ? {
            index: true,
            follow: true
          }
        : {
            index: false,
            follow: false
          }
  };
}

export async function SharePageContent({ locale, params }: SharePageContentProps) {
  const { id } = await params;
  const document = await getSharedDocument(id);
  const t = getMessages(locale);

  if (!document) {
    notFound();
  }

  return (
    <main className="share-shell" lang={locale}>
      <div className="page-shell">
        <div className="share-header">
          <BrandLink
            ariaLabel={locale === "zh-CN" ? "Markdownviewer 首页" : "Markdownviewer home"}
            className="workspace-home share-home"
            compact
            href={localizePath("/", locale)}
            title="Markdownviewer"
          />
          <a className="ghost-link" href={`${localizePath("/workspace", locale)}?share=${encodeURIComponent(id)}`}>
            {t.share.openInWorkspace}
          </a>
        </div>
        <ShareReader documentTitle={document.title} locale={locale} markdown={document.markdown} />
      </div>
    </main>
  );
}
