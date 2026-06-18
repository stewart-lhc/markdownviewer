"use client";

import { memo, useEffect, useId, useMemo, useRef, useState } from "react";

type MermaidBlockProps = {
  chart: string;
  sourcePosition?: string;
  variant?: "default" | "compact";
};

type MermaidRenderResult = {
  bindFunctions?: (element: Element) => void;
  svg: string;
};

type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void;
  render: (
    id: string,
    text: string,
    callback?: (svg: string, bindFunctions?: (element: Element) => void) => void,
    container?: HTMLElement
  ) => Promise<MermaidRenderResult> | MermaidRenderResult | string | void;
};

const mermaidRenderTimeoutMs = 8000;
const maxMermaidRenderCacheEntries = 40;
const mermaidRenderCache = new Map<string, MermaidRenderResult>();

function extractFlowLabels(chart: string) {
  const matches = [...chart.matchAll(/\[(.+?)\]/g)];
  const labels = matches.map((match) => match[1].trim()).filter(Boolean);

  return labels.length ? Array.from(new Set(labels)).slice(0, 4) : [];
}

function createMermaidRenderContainer() {
  const container = document.createElement("div");

  container.setAttribute("aria-hidden", "true");
  container.style.position = "absolute";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = "1px";
  container.style.height = "1px";
  container.style.overflow = "hidden";
  container.style.pointerEvents = "none";
  document.body.append(container);

  return container;
}

function normalizeMermaidRenderResult(result: MermaidRenderResult | string | void) {
  if (typeof result === "string") {
    return { svg: result };
  }

  if (result && typeof result.svg === "string") {
    return result;
  }

  return undefined;
}

function getMermaidRenderCacheKey(chart: string, sourcePosition?: string) {
  return `${sourcePosition ?? "unknown"}\n${chart}`;
}

function cacheMermaidRenderResult(key: string, result: MermaidRenderResult) {
  if (!mermaidRenderCache.has(key) && mermaidRenderCache.size >= maxMermaidRenderCacheEntries) {
    const oldestKey = mermaidRenderCache.keys().next().value;

    if (oldestKey) {
      mermaidRenderCache.delete(oldestKey);
    }
  }

  mermaidRenderCache.set(key, result);
}

function renderMermaidChart(mermaid: MermaidApi, id: string, chart: string) {
  return new Promise<MermaidRenderResult>((resolve, reject) => {
    const container = createMermaidRenderContainer();
    let settled = false;

    function cleanup(timeoutId: number) {
      window.clearTimeout(timeoutId);
      window.setTimeout(() => {
        container.remove();
      }, 0);
    }

    const timeoutId = window.setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      container.remove();
      reject(new Error("Mermaid render timed out."));
    }, mermaidRenderTimeoutMs);

    function finish(result: MermaidRenderResult | string | void) {
      if (settled) {
        return;
      }

      const normalizedResult = normalizeMermaidRenderResult(result);

      if (!normalizedResult) {
        settled = true;
        cleanup(timeoutId);
        reject(new Error("Mermaid render did not return SVG output."));
        return;
      }

      settled = true;
      cleanup(timeoutId);
      resolve(normalizedResult);
    }

    function fail(error: unknown) {
      if (settled) {
        return;
      }

      settled = true;
      cleanup(timeoutId);
      reject(error);
    }

    try {
      const renderResult = mermaid.render(
        id,
        chart,
        (svg, bindFunctions) => finish({ svg, bindFunctions }),
        container
      );

      if (renderResult && typeof (renderResult as Promise<MermaidRenderResult>).then === "function") {
        void (renderResult as Promise<MermaidRenderResult>).then(finish).catch(fail);
        return;
      }

      if (renderResult !== undefined) {
        finish(renderResult as MermaidRenderResult | string);
      }
    } catch (error) {
      fail(error);
    }
  });
}

export const MermaidBlock = memo(function MermaidBlock({ chart, sourcePosition, variant = "default" }: MermaidBlockProps) {
  const cacheKey = getMermaidRenderCacheKey(chart, sourcePosition);
  const cachedResult = variant === "default" ? mermaidRenderCache.get(cacheKey) : undefined;
  const [svg, setSvg] = useState<string | undefined>(cachedResult?.svg);
  const [error, setError] = useState<string>();
  const [shouldRender, setShouldRender] = useState(Boolean(cachedResult));
  const chartId = useId().replace(/:/g, "-");
  const labels = useMemo(() => extractFlowLabels(chart), [chart]);
  const frameRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const bindFunctionsRef = useRef<MermaidRenderResult["bindFunctions"]>(cachedResult?.bindFunctions);

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
        const cachedResult = mermaidRenderCache.get(cacheKey);

        if (cachedResult) {
          bindFunctionsRef.current = cachedResult.bindFunctions;
          setSvg(cachedResult.svg);
          setError(undefined);
          return;
        }

        const mermaid = (await import("mermaid")).default as MermaidApi;
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "strict"
        });

        const result = await renderMermaidChart(mermaid, `mermaid-${chartId}`, chart);

        if (!cancelled) {
          cacheMermaidRenderResult(cacheKey, result);
          bindFunctionsRef.current = result.bindFunctions;
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
  }, [cacheKey, chart, chartId, shouldRender, variant]);

  useEffect(() => {
    if (!svg || !svgRef.current || !bindFunctionsRef.current) {
      return;
    }

    bindFunctionsRef.current(svgRef.current);
  }, [svg]);

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
        <div className="mermaid-svg" dangerouslySetInnerHTML={{ __html: svg }} ref={svgRef} />
      ) : (
        <pre>{error ? `${error}\n\n${chart}` : chart}</pre>
      )}
    </div>
  );
});
