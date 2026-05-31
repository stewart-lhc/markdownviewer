"use client";

import { useEffect, useRef, useState } from "react";
import type { WorkspaceMessages } from "@/lib/i18n/messages";
import { workspaceThemeOptions, type WorkspaceTheme } from "@/lib/workspace/themes";

type WorkspaceThemeSelectorProps = {
  messages: WorkspaceMessages["preview"];
  onThemeChange: (theme: WorkspaceTheme) => void;
  theme: WorkspaceTheme;
};

export function WorkspaceThemeSelector({ messages, onThemeChange, theme }: WorkspaceThemeSelectorProps) {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  function selectTheme(nextTheme: WorkspaceTheme) {
    setThemeMenuOpen(false);
    onThemeChange(nextTheme);
  }

  return (
    <div className="toolbar-overflow toolbar-overflow--themes workspace-preview-template" ref={themeMenuRef}>
      <button
        aria-expanded={themeMenuOpen}
        aria-haspopup="menu"
        className="toolbar-button"
        onClick={() => setThemeMenuOpen((open) => !open)}
        type="button"
      >
        <span className="workspace-preview-template-label workspace-preview-template-label--full">
          {messages.templateButton(messages.themes[theme].label)}
        </span>
        <span className="workspace-preview-template-label workspace-preview-template-label--compact">
          {messages.themes[theme].label}
        </span>
      </button>
      {themeMenuOpen ? (
        <>
          <button
            aria-label={messages.close}
            className="workspace-popup-backdrop workspace-menu-backdrop"
            onClick={() => setThemeMenuOpen(false)}
            type="button"
          />
          <div aria-label={messages.templatePalette} className="theme-menu" role="menu">
            {workspaceThemeOptions.map((option) => (
              <button
                aria-checked={theme === option.id}
                className="theme-option"
                data-active={theme === option.id}
                key={option.id}
                onClick={() => selectTheme(option.id)}
                role="menuitemradio"
                type="button"
              >
                <span aria-hidden="true" className="theme-option__swatch" data-theme-id={option.id} />
                <span className="theme-option__meta">
                  <span className="theme-option__label">{messages.themes[option.id].label}</span>
                  <span className="theme-option__description">{messages.themes[option.id].description}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
