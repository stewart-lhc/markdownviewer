import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import "katex/dist/katex.min.css";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { PwaRegistration } from "@/components/pwa/pwa-registration";

const siteUrl = "https://markdownviewer.run";
const siteDescription =
  "Free online Markdown viewer with live preview for README.md, GitHub Flavored Markdown, Mermaid diagrams, KaTeX math, code blocks, and raw URLs.";
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "markdownviewer.run",
  manifest: "/manifest.webmanifest",
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
    <html lang="en">
      <body>
        {children}
        <PwaRegistration />
        <GoogleAnalytics measurementId={gaMeasurementId} />
      </body>
    </html>
  );
}
