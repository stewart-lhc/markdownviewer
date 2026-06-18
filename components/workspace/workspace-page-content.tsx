import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { localizePath, type Locale } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { resolveInitialWorkspaceDocument } from "@/lib/workspace/resolve-initial-document";

const siteUrl = "https://markdownviewer.run";

export function buildWorkspaceMetadata(locale: Locale): Metadata {
  const t = getMessages(locale);
  const path = localizePath("/workspace", locale);

  return {
    title: t.meta.workspaceTitle,
    description: t.meta.workspaceDescription,
    alternates: {
      canonical: path,
      languages: {
        en: `${siteUrl}/workspace`,
        "zh-CN": `${siteUrl}/zh-CN/workspace`,
        "x-default": `${siteUrl}/workspace`
      }
    },
    openGraph: {
      title: t.meta.workspaceTitle,
      description: t.meta.workspaceDescription,
      url: `${siteUrl}${path}`,
      locale: locale === "zh-CN" ? "zh_CN" : "en_US"
    },
    twitter: {
      title: t.meta.workspaceTitle,
      description: t.meta.workspaceDescription
    }
  };
}

export type WorkspacePageContentProps = {
  locale: Locale;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function takeFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function WorkspacePageContent({ locale, searchParams }: WorkspacePageContentProps) {
  const resolvedParams = await searchParams;
  const initialDocument = await resolveInitialWorkspaceDocument(resolvedParams, undefined, locale);
  const hasExplicitDocument = Boolean(takeFirst(resolvedParams.share) || takeFirst(resolvedParams.source));

  return (
    <main lang={locale}>
      <WorkspaceShell
        initialStatusMessage={initialDocument.statusMessage}
        initialEditorPresentationMode="rich"
        locale={locale}
        markdown={initialDocument.markdown}
        sourceInput={initialDocument.sourceInput}
        tabRestoreStrategy={hasExplicitDocument ? "merge" : "restore"}
      />
    </main>
  );
}
