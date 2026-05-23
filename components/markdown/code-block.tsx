"use client";

import { memo, useState } from "react";
import type { ReactNode } from "react";

type CodeBlockProps = {
  children: ReactNode;
  className?: string;
  code: string;
  language: string;
  sourcePosition?: string;
};

export const CodeBlock = memo(function CodeBlock({ children, className, code, language, sourcePosition }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="code-frame" data-sourcepos={sourcePosition}>
      <div className="code-toolbar">
        <span>{language}</span>
        <button
          aria-label={`Copy ${language} code`}
          className="code-copy"
          onClick={handleCopy}
          type="button"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
});
