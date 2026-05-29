"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { localizePath, type Locale } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { pendingWorkspaceImportKey } from "@/lib/workspace/pending-import";

type HeroImportActionsProps = {
  locale: Locale;
};

export function HeroImportActions({ locale }: HeroImportActionsProps) {
  const messages = getMessages(locale).landing.hero;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string>();
  const workspacePath = localizePath("/workspace", locale);

  async function openFile(file: File) {
    try {
      const markdown = await file.text();

      window.localStorage.setItem(
        pendingWorkspaceImportKey,
        JSON.stringify({
          markdown,
          sourceInput: `file:${file.name}`,
          statusMessage: messages.loadedFile(file.name)
        })
      );
      window.location.assign(`${workspacePath}?import=file`);
    } catch {
      setStatus(messages.readFileError);
    }
  }

  return (
    <>
      <div className="hero-actions">
        <button className="button-secondary" onClick={() => fileInputRef.current?.click()} type="button">
          {messages.dropFile}
        </button>
        <Link className="button-secondary" href={`${workspacePath}?sample=starter`}>
          {messages.openSample}
        </Link>
        <form action={workspacePath} className="hero-url-form">
          <input
            aria-label={messages.sourceUrlLabel}
            className="input hero-url-input"
            name="source"
            placeholder={messages.sourceUrlPlaceholder}
            type="url"
          />
          <button className="button-primary" type="submit">
            {messages.openMarkdown}
          </button>
        </form>
      </div>
      <input
        accept=".md,.markdown,.mdx,.txt,text/markdown,text/plain"
        aria-label={messages.uploadLabel}
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
