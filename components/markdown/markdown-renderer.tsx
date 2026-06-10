"use client";

import { Children, isValidElement, memo, useMemo } from "react";
import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CodeBlock } from "@/components/markdown/code-block";
import { MermaidBlock } from "@/components/markdown/mermaid-block";

type MarkdownRendererProps = {
  markdown: string;
  onLinkClick?: (href: string) => boolean | void;
  variant?: "default" | "compact";
};

type CodeElementProps = {
  children?: ReactNode;
  className?: string;
};

type ImageDimensions = {
  height: number;
  width: number;
};

type NodePosition = {
  end?: {
    column?: number;
    line?: number;
  };
  start?: {
    column?: number;
    line?: number;
  };
};

type MarkdownNodeWithPosition = {
  position?: NodePosition;
};

type HastNodeWithProperties = MarkdownNodeWithPosition & {
  children?: HastNodeWithProperties[];
  properties?: Record<string, unknown>;
  tagName?: string;
  type?: string;
};

const sourcePositionTags = new Set([
  "blockquote",
  "details",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "li",
  "ol",
  "p",
  "pre",
  "table",
  "ul"
]);

const remarkPlugins: ComponentProps<typeof ReactMarkdown>["remarkPlugins"] = [
  remarkGfm,
  remarkMath,
  remarkBreaks
];

const rehypePlugins: ComponentProps<typeof ReactMarkdown>["rehypePlugins"] = [
  rehypeSlug,
  rehypeSourcePositions,
  [rehypeAutolinkHeadings, { behavior: "append" }],
  [rehypeHighlight, { detect: false, ignoreMissing: true }],
  [rehypeKatex, { strict: "ignore" }]
];

const cjkPattern = /[\u3400-\u9fff\uf900-\ufaff]/;
const sampleImageDimensions = new Map<string, ImageDimensions>([
  ["/sample-markdown-preview.svg", { height: 360, width: 960 }],
  ["/sample-linked-thumbnail.svg", { height: 180, width: 480 }]
]);

function getImageDimensions(src?: string): ImageDimensions | undefined {
  if (!src) {
    return undefined;
  }

  const sampleDimensions = sampleImageDimensions.get(src);

  if (sampleDimensions) {
    return sampleDimensions;
  }

  const placeholdMatch = src.match(/placehold\.co\/(\d+)x(\d+)(?:[/?#]|$)/i);

  if (!placeholdMatch) {
    return undefined;
  }

  return {
    width: Number.parseInt(placeholdMatch[1] ?? "", 10),
    height: Number.parseInt(placeholdMatch[2] ?? "", 10)
  };
}

function serializeSourcePosition(position?: NodePosition) {
  const startLine = position?.start?.line;
  const startColumn = position?.start?.column;
  const endLine = position?.end?.line;
  const endColumn = position?.end?.column;

  if (!startLine || !startColumn || !endLine || !endColumn) {
    return undefined;
  }

  return `${startLine}:${startColumn}-${endLine}:${endColumn}`;
}

function readSourcePosition(node?: HastNodeWithProperties) {
  const serializedFromProperties = node?.properties?.["data-sourcepos"] ?? node?.properties?.dataSourcepos;

  if (typeof serializedFromProperties === "string" && serializedFromProperties.length > 0) {
    return serializedFromProperties;
  }

  return serializeSourcePosition(node?.position);
}

function rehypeSourcePositions() {
  return function annotateSourcePositions(tree: HastNodeWithProperties) {
    function visit(node: HastNodeWithProperties) {
      if (node.type === "element" && node.tagName && sourcePositionTags.has(node.tagName)) {
        const sourcePosition = serializeSourcePosition(node.position);

        if (sourcePosition) {
          node.properties ??= {};
          node.properties.dataSourcepos = sourcePosition;
          node.properties["data-sourcepos"] = sourcePosition;
        }
      }

      node.children?.forEach(visit);
    }

    visit(tree);
  };
}

function getNodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getNodeText(node.props.children);
  }

  return "";
}

export const MarkdownRenderer = memo(function MarkdownRenderer({
  markdown,
  onLinkClick,
  variant = "default"
}: MarkdownRendererProps) {
  const className = [
    "markdown-body",
    variant === "compact" && "markdown-body--compact",
    cjkPattern.test(markdown) && "markdown-body--cjk"
  ]
    .filter(Boolean)
    .join(" ");
  const components = useMemo<ComponentProps<typeof ReactMarkdown>["components"]>(
    () => ({
      pre({ children, node }) {
        const [firstChild] = Children.toArray(children);
        const sourcePosition = readSourcePosition(node as HastNodeWithProperties | undefined);

        if (!isValidElement<CodeElementProps>(firstChild)) {
          return <pre data-sourcepos={sourcePosition}>{children}</pre>;
        }

        const className = typeof firstChild.props.className === "string" ? firstChild.props.className : "";
        const language = className
          .split(" ")
          .find((name: string) => name.startsWith("language-"))
          ?.replace("language-", "") ?? "";
        const code = getNodeText(firstChild.props.children).replace(/\n$/, "");

        if (language === "mermaid") {
          return <MermaidBlock chart={code} sourcePosition={sourcePosition} variant={variant} />;
        }

        if (language) {
          return (
            <CodeBlock className={className} code={code} language={language} sourcePosition={sourcePosition}>
              {firstChild.props.children}
            </CodeBlock>
          );
        }

        return <pre data-sourcepos={sourcePosition}>{children}</pre>;
      },
      code({ children, className }) {
        return <code className={className}>{children}</code>;
      },
      a({ children, href, node: _node, ...props }) {
        return (
          <a
            {...props}
            href={href}
            onClick={(event) => {
              if (href && onLinkClick?.(href)) {
                event.preventDefault();
              }
            }}
          >
            {children}
          </a>
        );
      },
      img({ alt, node: _node, src, ...props }) {
        const dimensions = getImageDimensions(typeof src === "string" ? src : undefined);

        return (
          <img
            {...props}
            alt={alt ?? ""}
            decoding="async"
            height={dimensions?.height}
            loading="lazy"
            src={src}
            width={dimensions?.width}
          />
        );
      },
      input({ checked, node: _node, type, ...props }) {
        if (type !== "checkbox") {
          return <input {...props} checked={checked} type={type} />;
        }

        return (
          <input
            {...props}
            aria-label={checked ? "Completed task" : "Incomplete task"}
            checked={checked}
            type="checkbox"
          />
        );
      }
    }),
    [onLinkClick, variant]
  );

  return (
    <div className={className}>
      <ReactMarkdown
        components={components}
        rehypePlugins={rehypePlugins}
        remarkPlugins={remarkPlugins}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
});
