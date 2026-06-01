"use client";

import { useState } from "react";

type LiveSampleCopyButtonProps = {
  code: string;
  language: string;
};

const clipboardTimeoutMs = 500;

async function writeClipboardText(text: string) {
  if (!navigator.clipboard?.writeText) {
    return false;
  }

  try {
    await Promise.race([
      navigator.clipboard.writeText(text),
      new Promise((_, reject) => window.setTimeout(reject, clipboardTimeoutMs))
    ]);
    return true;
  } catch {
    return false;
  }
}

function writeClipboardTextFallback(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

export function LiveSampleCopyButton({ code, language }: LiveSampleCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const copiedToClipboard = (await writeClipboardText(code)) || writeClipboardTextFallback(code);

    if (copiedToClipboard) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } else {
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
