"use client";

import NextLink from "next/link";
import { Clipboard, FileUp, Link as LinkIcon } from "lucide-react";
import { useRef, useState } from "react";
import { localizePath, type Locale } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { pendingWorkspaceImportKey } from "@/lib/workspace/pending-import";

type HeroImportActionsProps = {
  locale: Locale;
};

export function HeroImportActions({ locale }: HeroImportActionsProps) {
  const messages = getMessages(locale).landing.hero;
  const workspaceMessages = getMessages(locale).workspace;
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

  async function pasteIntoWorkspace() {
    try {
      const markdown = await navigator.clipboard.readText();

      if (markdown.trim().length > 0) {
        window.localStorage.setItem(
          pendingWorkspaceImportKey,
          JSON.stringify({
            markdown,
            sourceInput: "",
            statusMessage: workspaceMessages.status.pasted
          })
        );
        window.location.assign(`${workspacePath}?import=file`);
        return;
      }

      setStatus(workspaceMessages.status.emptyClipboard);
    } catch {
      setStatus(workspaceMessages.status.pastePermission);
    }

    window.location.assign(workspacePath);
  }

  return (
    <>
      <div className="hero-actions">
        <button className="button-secondary hero-action-button" onClick={() => void pasteIntoWorkspace()} type="button">
          <Clipboard aria-hidden="true" size={17} strokeWidth={2} />
          <span>{workspaceMessages.toolbar.paste}</span>
        </button>
        <button className="button-secondary hero-action-button" onClick={() => fileInputRef.current?.click()} type="button">
          <FileUp aria-hidden="true" size={17} strokeWidth={2} />
          <span>{workspaceMessages.toolbar.file}</span>
        </button>
        <NextLink className="button-secondary hero-action-button hero-sample-link" href={`${workspacePath}?sample=starter`}>
          {messages.openSample}
        </NextLink>
        <form action={workspacePath} className="hero-url-form">
          <div className="hero-url-field">
            <LinkIcon aria-hidden="true" size={17} strokeWidth={2} />
            <input
              aria-label={messages.sourceUrlLabel}
              className="input hero-url-input"
              name="source"
              placeholder={workspaceMessages.tabs.importUrlPlaceholder}
              type="url"
            />
          </div>
          <button className="button-primary hero-action-button hero-action-submit" type="submit">
            <span>{workspaceMessages.toolbar.open}</span>
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
