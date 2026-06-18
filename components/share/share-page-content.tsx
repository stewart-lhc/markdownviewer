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
  const encodedShareId = encodeURIComponent(id);
  const workspacePath = localizePath("/workspace", locale);
  const openWorkspaceHref = `${workspacePath}?share=${encodedShareId}&shareAction=open`;
  const editCopyHref = `${workspacePath}?share=${encodedShareId}&shareAction=copy`;
  const useTemplateHref = `${workspacePath}?share=${encodedShareId}&shareAction=template`;

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
          <a className="ghost-link" href={openWorkspaceHref}>
            {t.share.openInWorkspace}
          </a>
        </div>
        <ShareReader
          documentTitle={document.title}
          editCopyHref={editCopyHref}
          locale={locale}
          markdown={document.markdown}
          openWorkspaceHref={openWorkspaceHref}
          shareId={id}
          useTemplateHref={useTemplateHref}
        />
      </div>
    </main>
  );
}
