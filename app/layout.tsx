import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "@/app/globals.css";
import "katex/dist/katex.min.css";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

const siteUrl = "https://markdownviewer.run";
const siteDescription =
  "Free online Markdown viewer with live preview for README.md, GitHub Flavored Markdown, Mermaid diagrams, KaTeX math, code blocks, and raw URLs.";
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const mono = IBM_Plex_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "markdownviewer.run",
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
      <body className={mono.variable}>
        {children}
        <GoogleAnalytics measurementId={gaMeasurementId} />
      </body>
    </html>
  );
}
