"use client";

import { useEffect, useRef, useState } from "react";
import { getWorkspaceThemeLabel, workspaceThemeOptions, type WorkspaceTheme } from "@/lib/workspace/themes";

type WorkspaceThemeSelectorProps = {
  onThemeChange: (theme: WorkspaceTheme) => void;
  theme: WorkspaceTheme;
};

export function WorkspaceThemeSelector({ onThemeChange, theme }: WorkspaceThemeSelectorProps) {
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
        {`Template: ${getWorkspaceThemeLabel(theme)}`}
      </button>
      {themeMenuOpen ? (
        <div aria-label="Template palette" className="theme-menu" role="menu">
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
                <span className="theme-option__label">{option.label}</span>
                <span className="theme-option__description">{option.description}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
