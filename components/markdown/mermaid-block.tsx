"use client";

import { memo, useEffect, useId, useMemo, useRef, useState } from "react";

type MermaidBlockProps = {
  chart: string;
  sourcePosition?: string;
  variant?: "default" | "compact";
};

function extractFlowLabels(chart: string) {
  const matches = [...chart.matchAll(/\[(.+?)\]/g)];
  const labels = matches.map((match) => match[1].trim()).filter(Boolean);

  return labels.length ? Array.from(new Set(labels)).slice(0, 4) : [];
}

export const MermaidBlock = memo(function MermaidBlock({ chart, sourcePosition, variant = "default" }: MermaidBlockProps) {
  const [svg, setSvg] = useState<string>();
  const [error, setError] = useState<string>();
  const [shouldRender, setShouldRender] = useState(false);
  const chartId = useId().replace(/:/g, "-");
  const labels = useMemo(() => extractFlowLabels(chart), [chart]);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant === "compact" || shouldRender) {
      return;
    }

    const frame = frameRef.current;

    if (!frame || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px 0px" }
    );

    observer.observe(frame);

    return () => {
      observer.disconnect();
    };
  }, [shouldRender, variant]);

  useEffect(() => {
    if (variant === "compact" || !shouldRender) {
      return;
    }

    let cancelled = false;

    async function renderChart() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "strict"
        });

        const result = await mermaid.render(`mermaid-${chartId}`, chart);

        if (!cancelled) {
          setSvg(result.svg);
          setError(undefined);
        }
      } catch (renderError) {
        if (!cancelled) {
          setError(renderError instanceof Error ? renderError.message : "Mermaid render failed.");
        }
      }
    }

    renderChart();

    return () => {
      cancelled = true;
    };
  }, [chart, chartId, shouldRender, variant]);

  if (variant === "compact") {
    return (
      <div aria-label="Diagram flow" className="mermaid-compact" data-sourcepos={sourcePosition}>
        <div className="mermaid-compact-label">Diagram flow</div>
        <div className="mermaid-compact-steps">
          {(labels.length ? labels : ["Diagram preview"]).map((label, index) => (
            <div className="mermaid-compact-step" key={`${label}-${index}`}>
              <span>{label}</span>
              {index < (labels.length ? labels : ["Diagram preview"]).length - 1 ? (
                <span aria-hidden="true" className="mermaid-compact-arrow">
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div aria-label="Mermaid diagram" className="mermaid-frame" data-sourcepos={sourcePosition} ref={frameRef}>
      <div className="mermaid-toolbar">
        <span>Mermaid diagram</span>
        {svg ? (
          <span>rendered</span>
        ) : error ? (
          <span>fallback</span>
        ) : (
          <button className="code-copy" onClick={() => setShouldRender(true)} type="button">
            {shouldRender ? "rendering" : "render"}
          </button>
        )}
      </div>
      {svg ? (
        <div className="mermaid-svg" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <pre>{error ? `${error}\n\n${chart}` : chart}</pre>
      )}
    </div>
  );
});
