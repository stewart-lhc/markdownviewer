"use client";

import { useEffect, useId, useState } from "react";

type MermaidBlockProps = {
  chart: string;
};

export function MermaidBlock({ chart }: MermaidBlockProps) {
  const [svg, setSvg] = useState<string>();
  const [error, setError] = useState<string>();
  const chartId = useId().replace(/:/g, "-");

  useEffect(() => {
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
  }, [chart, chartId]);

  return (
    <div aria-label="Mermaid diagram" className="mermaid-frame">
      <div className="mermaid-toolbar">
        <span>Mermaid diagram</span>
        <span>{svg ? "rendered" : error ? "fallback" : "rendering"}</span>
      </div>
      {svg ? (
        <div className="mermaid-svg" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <pre>{error ? `${error}\n\n${chart}` : chart}</pre>
      )}
    </div>
  );
}
