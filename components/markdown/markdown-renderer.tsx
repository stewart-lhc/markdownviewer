"use client";

import ReactMarkdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CodeBlock } from "@/components/markdown/code-block";
import { MermaidBlock } from "@/components/markdown/mermaid-block";

type MarkdownRendererProps = {
  markdown: string;
};

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "append" }],
          rehypeKatex
        ]}
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        components={{
          code({ children, className }) {
            const code = String(children).replace(/\n$/, "");
            const language = className?.replace("language-", "") ?? "";

            if (language === "mermaid") {
              return <MermaidBlock chart={code} />;
            }

            if (language) {
              return <CodeBlock code={code} language={language} />;
            }

            return <code>{children}</code>;
          }
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
