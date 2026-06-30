import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { PwaRuntime } from "@/components/pwa/pwa-runtime";

const siteUrl = "https://markdownviewer.run";
const siteDescription =
  "Free online Markdown viewer with live preview for README.md, GitHub Flavored Markdown, Mermaid diagrams, KaTeX math, code blocks, and raw URLs.";
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const siteThemeInitScript = `
try {
  var mode = window.localStorage.getItem("markdownviewer.site.colorMode");
  if (mode === "dark") {
    document.documentElement.dataset.theme = "night";
    document.documentElement.dataset.siteThemeMode = "dark";
  } else if (mode === "light") {
    document.documentElement.dataset.theme = "paper";
    document.documentElement.dataset.siteThemeMode = "light";
  } else {
    document.documentElement.dataset.siteThemeMode = "system";
  }
} catch (error) {}
`;
const extensionDomMutationGuardScript = `
(function () {
  try {
    if (window.__markdownviewerDomMutationGuard || typeof Node === "undefined") {
      return;
    }

    window.__markdownviewerDomMutationGuard = true;

    var nativeRemoveChild = Node.prototype.removeChild;
    var nativeInsertBefore = Node.prototype.insertBefore;

    // Translation and writing-assistant extensions can rewrite text nodes that
    // React still owns. Treat those extension-induced parent mismatches as no-ops
    // instead of letting React's commit phase crash the whole workspace.
    Node.prototype.removeChild = function (child) {
      if (!(child instanceof Node)) {
        return nativeRemoveChild.call(this, child);
      }

      if (child && child.parentNode === this) {
        return nativeRemoveChild.call(this, child);
      }

      if (child && child.parentNode) {
        return nativeRemoveChild.call(child.parentNode, child);
      }

      return child;
    };

    Node.prototype.insertBefore = function (newNode, referenceNode) {
      if (!(newNode instanceof Node) || (referenceNode && !(referenceNode instanceof Node))) {
        return nativeInsertBefore.call(this, newNode, referenceNode);
      }

      if (referenceNode && referenceNode.parentNode !== this) {
        return this.appendChild(newNode);
      }

      return nativeInsertBefore.call(this, newNode, referenceNode);
    };
  } catch (error) {}
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "markdownviewer.run",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" }
    ],
    apple: [{ url: "/markdownviewer-icon-192.png", sizes: "192x192", type: "image/png" }]
  },
  title: {
    default: "Markdown Viewer Online - Live Preview | markdownviewer.run",
    template: "%s | markdownviewer.run"
  },
  description: siteDescription,
  keywords: [
    "markdown viewer",
    "markdown viewer online",
    "online markdown viewer",
    "markdown preview",
    "markdown previewer",
    "GitHub Flavored Markdown viewer",
    "README viewer",
    "Mermaid markdown viewer",
    "Markdown viewer with math",
    "AI markdown viewer"
  ],
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: "Markdown Viewer Online - Live Preview",
    description: siteDescription,
    url: siteUrl,
    siteName: "markdownviewer.run",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary",
    title: "Markdown Viewer Online - Live Preview",
    description: siteDescription
  },
  appleWebApp: {
    capable: true,
    title: "Markdownviewer"
  },
  ...(googleSiteVerification
    ? {
        verification: {
          google: googleSiteVerification
        }
      }
    : {}),
  robots: {
    index: true,
    follow: true
  }
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: extensionDomMutationGuardScript }} />
        <script dangerouslySetInnerHTML={{ __html: siteThemeInitScript }} />
      </head>
      <body>
        {children}
        <PwaRuntime />
        <GoogleAnalytics measurementId={gaMeasurementId} />
      </body>
    </html>
  );
}
