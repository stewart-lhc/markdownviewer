import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "@/app/globals.css";
import "katex/dist/katex.min.css";

const siteUrl = "https://markdownviewer.run";
const siteDescription =
  "Free online Markdown viewer with live preview for README.md, GitHub Flavored Markdown, Mermaid diagrams, KaTeX math, code blocks, and raw URLs.";

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
      <body className={mono.variable}>{children}</body>
    </html>
  );
}
