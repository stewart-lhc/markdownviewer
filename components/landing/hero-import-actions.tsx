"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { pendingWorkspaceImportKey } from "@/lib/workspace/pending-import";

export function HeroImportActions() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string>();

  async function openFile(file: File) {
    try {
      const markdown = await file.text();

      window.localStorage.setItem(
        pendingWorkspaceImportKey,
        JSON.stringify({
          markdown,
          sourceInput: `file:${file.name}`,
          statusMessage: `Loaded ${file.name}.`
        })
      );
      window.location.assign("/workspace?import=file");
    } catch {
      setStatus("Could not read the selected Markdown file.");
    }
  }

  return (
    <>
      <div className="hero-actions">
        <button className="button-secondary" onClick={() => fileInputRef.current?.click()} type="button">
          Drop a file
        </button>
        <Link className="button-secondary" href="/workspace?sample=starter">
          Open sample
        </Link>
        <form action="/workspace" className="hero-url-form">
          <input
            aria-label="Markdown source URL"
            className="input hero-url-input"
            name="source"
            placeholder="Paste a GitHub, Gist, or Markdown URL"
            type="url"
          />
          <button className="button-primary" type="submit">
            Open Markdown Now
          </button>
        </form>
      </div>
      <input
        accept=".md,.markdown,.mdx,.txt,text/markdown,text/plain"
        aria-label="Upload markdown file from homepage"
        className="sr-only"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];

          if (file) {
            void openFile(file);
          }

          event.currentTarget.value = "";
        }}
        ref={fileInputRef}
        type="file"
      />
      {status ? (
        <p aria-live="polite" className="sr-only" role="status">
          {status}
        </p>
      ) : null}
    </>
  );
}
