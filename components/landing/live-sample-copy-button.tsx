"use client";

import { useState } from "react";

type LiveSampleCopyButtonProps = {
  code: string;
  language: string;
};

export function LiveSampleCopyButton({ code, language }: LiveSampleCopyButtonProps) {
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
    <button
      aria-label={`Copy ${language} code`}
      className="code-copy"
      onClick={handleCopy}
      type="button"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
