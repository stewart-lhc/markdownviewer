import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "markdownviewer.run",
  description: "Open Markdown like it deserves."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
