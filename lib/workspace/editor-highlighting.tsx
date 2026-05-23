import { Fragment, type CSSProperties, type ReactNode } from "react";

type InlineRenderOptions = {
  codeClassName?: string;
  emphasisClassName?: string;
  linkTextClassName?: string;
  linkUrlClassName?: string;
  plainClassName?: string;
  strongClassName?: string;
  strikeClassName?: string;
};

type TableRowPart =
  | {
      kind: "cell";
      text: string;
      divider: boolean;
    }
  | {
      kind: "pipe";
    };

type TableRow = {
  key: string;
  parts: TableRowPart[];
};

function syntaxToken(text: string, key: string) {
  return (
    <span className="md-token--syntax" key={key}>
      {text}
    </span>
  );
}

function styledToken(text: string, className: string, key: string) {
  return (
    <span className={className} key={key}>
      {text}
    </span>
  );
}

function plainToken(text: string, className: string | undefined, key: string) {
  if (!className) {
    return <Fragment key={key}>{text}</Fragment>;
  }

  return (
    <span className={className} key={key}>
      {text}
    </span>
  );
}

function renderInlineTokens(text: string, keyPrefix: string, options: InlineRenderOptions = {}): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let tokenIndex = 0;

  const {
    codeClassName = "md-token--code md-token--code-text",
    emphasisClassName = "md-token--emphasis-text",
    linkTextClassName = "md-token--link-text",
    linkUrlClassName = "md-token--link-url",
    plainClassName,
    strongClassName = "md-token--strong-text",
    strikeClassName = "md-token--strike-text"
  } = options;

  while (cursor < text.length) {
    const remainder = text.slice(cursor);
    const tokenKey = `${keyPrefix}-${tokenIndex}`;

    const linkMatch = remainder.match(/^\[([^\]]+)\]\(([^)]+)\)/);

    if (linkMatch) {
      nodes.push(syntaxToken("[", `${tokenKey}-open-label`));
      nodes.push(styledToken(linkMatch[1], linkTextClassName, `${tokenKey}-label`));
      nodes.push(syntaxToken("]", `${tokenKey}-close-label`));
      nodes.push(syntaxToken("(", `${tokenKey}-open-url`));
      nodes.push(styledToken(linkMatch[2], linkUrlClassName, `${tokenKey}-url`));
      nodes.push(syntaxToken(")", `${tokenKey}-close-url`));
      cursor += linkMatch[0].length;
      tokenIndex += 1;
      continue;
    }

    const strongMatch = remainder.match(/^\*\*([^\n*]+)\*\*/);

    if (strongMatch) {
      nodes.push(syntaxToken("**", `${tokenKey}-open`));
      nodes.push(styledToken(strongMatch[1], strongClassName, `${tokenKey}-text`));
      nodes.push(syntaxToken("**", `${tokenKey}-close`));
      cursor += strongMatch[0].length;
      tokenIndex += 1;
      continue;
    }

    const strikeMatch = remainder.match(/^~~([^\n~]+)~~/);

    if (strikeMatch) {
      nodes.push(syntaxToken("~~", `${tokenKey}-open`));
      nodes.push(styledToken(strikeMatch[1], strikeClassName, `${tokenKey}-text`));
      nodes.push(syntaxToken("~~", `${tokenKey}-close`));
      cursor += strikeMatch[0].length;
      tokenIndex += 1;
      continue;
    }

    const emphasisMatch = remainder.match(/^\*([^\n*]+)\*/);

    if (emphasisMatch) {
      nodes.push(syntaxToken("*", `${tokenKey}-open`));
      nodes.push(styledToken(emphasisMatch[1], emphasisClassName, `${tokenKey}-text`));
      nodes.push(syntaxToken("*", `${tokenKey}-close`));
      cursor += emphasisMatch[0].length;
      tokenIndex += 1;
      continue;
    }

    const codeMatch = remainder.match(/^`([^`\n]+)`/);

    if (codeMatch) {
      nodes.push(syntaxToken("`", `${tokenKey}-open`));
      nodes.push(styledToken(codeMatch[1], codeClassName, `${tokenKey}-text`));
      nodes.push(syntaxToken("`", `${tokenKey}-close`));
      cursor += codeMatch[0].length;
      tokenIndex += 1;
      continue;
    }

    const autoLinkMatch = remainder.match(/^<([^>\n]+)>/);

    if (autoLinkMatch) {
      nodes.push(syntaxToken("<", `${tokenKey}-open`));
      nodes.push(styledToken(autoLinkMatch[1], linkUrlClassName, `${tokenKey}-text`));
      nodes.push(syntaxToken(">", `${tokenKey}-close`));
      cursor += autoLinkMatch[0].length;
      tokenIndex += 1;
      continue;
    }

    const nextTokenOffset = remainder.search(/\[|\*|`|~|</);

    if (nextTokenOffset === -1) {
      nodes.push(plainToken(remainder, plainClassName, `${tokenKey}-plain`));
      break;
    }

    if (nextTokenOffset === 0) {
      nodes.push(plainToken(remainder[0], plainClassName, `${tokenKey}-char`));
      cursor += 1;
      tokenIndex += 1;
      continue;
    }

    nodes.push(plainToken(remainder.slice(0, nextTokenOffset), plainClassName, `${tokenKey}-plain`));
    cursor += nextTokenOffset;
    tokenIndex += 1;
  }

  if (nodes.length === 0) {
    nodes.push(
      <span aria-hidden="true" className="md-token--ghost" key={`${keyPrefix}-ghost`}>
        {" "}
      </span>
    );
  }

  return nodes;
}

function isFenceLine(line: string) {
  return /^(\s*)(`{3,}|~{3,})(.*)$/.test(line) || /^\s*\$\$\s*$/.test(line);
}

function isQuoteLine(line: string) {
  return /^(\s*)(>)(\s?)(.*)$/.test(line);
}

function isTableDividerContent(content: string) {
  return /^:?-{3,}:?$/.test(content);
}

function tokenizeTableLine(line: string, rowKey: string): TableRow {
  const segments = line.split(/(\|)/);
  const parts: TableRowPart[] = [];

  segments.forEach((segment) => {
    if (!segment) {
      return;
    }

    if (segment === "|") {
      parts.push({ kind: "pipe" });
      return;
    }

    const content = segment.trim();

    if (!content) {
      return;
    }

    parts.push({
      kind: "cell",
      text: content,
      divider: isTableDividerContent(content)
    });
  });

  return {
    key: rowKey,
    parts
  };
}

function isTableStart(lines: string[], index: number) {
  const current = lines[index];
  const next = lines[index + 1];

  if (!current || !next || !current.includes("|")) {
    return false;
  }

  const nextRow = tokenizeTableLine(next, `table-divider-${index}`);
  return nextRow.parts.some((part) => part.kind === "cell" && part.divider);
}

function renderEmptyLine(key: string) {
  return (
    <div className="md-line" key={key}>
      <span aria-hidden="true" className="md-token--ghost">
        {" "}
      </span>
    </div>
  );
}

function renderHeadingBlock(line: string, lineIndex: number) {
  const headingMatch = line.match(/^(#{1,6})(\s+)(.*)$/);

  if (!headingMatch) {
    return null;
  }

  return (
    <div className="md-block md-block--heading" data-depth={headingMatch[1].length} key={`block-${lineIndex}`}>
      <div className="md-line">
        <span className="md-token--syntax">{headingMatch[1]}</span>
        {headingMatch[2]}
        {renderInlineTokens(headingMatch[3], `heading-${lineIndex}`, {
          plainClassName: "md-token--heading-text"
        })}
      </div>
    </div>
  );
}

function renderRuleBlock(line: string, lineIndex: number) {
  return (
    <div className="md-block md-block--rule" key={`block-${lineIndex}`}>
      <div className="md-line">
        <span className="md-token--syntax">{line}</span>
      </div>
    </div>
  );
}

function renderListBlock(line: string, lineIndex: number) {
  const taskListMatch = line.match(/^(\s*)([-*+])(\s+)(\[(?: |x|X)\])(\s+)(.*)$/);

  if (taskListMatch) {
    return (
      <div className="md-block md-block--list" key={`block-${lineIndex}`}>
        <div className="md-line md-line--list">
          {taskListMatch[1]}
          <span className="md-token--syntax">{taskListMatch[2]}</span>
          {taskListMatch[3]}
          <span className="md-token--syntax">{taskListMatch[4]}</span>
          {taskListMatch[5]}
          {renderInlineTokens(taskListMatch[6], `list-${lineIndex}`, {
            plainClassName: "md-token--paragraph-text"
          })}
        </div>
      </div>
    );
  }

  const orderedListMatch = line.match(/^(\s*)(\d+\.)(\s+)(.*)$/);

  if (orderedListMatch) {
    return (
      <div className="md-block md-block--list" key={`block-${lineIndex}`}>
        <div className="md-line md-line--list">
          {orderedListMatch[1]}
          <span className="md-token--syntax">{orderedListMatch[2]}</span>
          {orderedListMatch[3]}
          {renderInlineTokens(orderedListMatch[4], `list-${lineIndex}`, {
            plainClassName: "md-token--paragraph-text"
          })}
        </div>
      </div>
    );
  }

  const bulletListMatch = line.match(/^(\s*)([-*+])(\s+)(.*)$/);

  if (bulletListMatch) {
    return (
      <div className="md-block md-block--list" key={`block-${lineIndex}`}>
        <div className="md-line md-line--list">
          {bulletListMatch[1]}
          <span className="md-token--syntax">{bulletListMatch[2]}</span>
          {bulletListMatch[3]}
          {renderInlineTokens(bulletListMatch[4], `list-${lineIndex}`, {
            plainClassName: "md-token--paragraph-text"
          })}
        </div>
      </div>
    );
  }

  return null;
}

function renderParagraphBlock(lines: string[], startIndex: number) {
  const paragraphLines: string[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];

    if (
      line.length === 0 ||
      /^(#{1,6})(\s+)(.*)$/.test(line) ||
      /^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line) ||
      /^(\s*)([-*+])(\s+)(\[(?: |x|X)\])(\s+)(.*)$/.test(line) ||
      /^(\s*)(\d+\.)(\s+)(.*)$/.test(line) ||
      /^(\s*)([-*+])(\s+)(.*)$/.test(line) ||
      isQuoteLine(line) ||
      isFenceLine(line) ||
      isTableStart(lines, index)
    ) {
      break;
    }

    paragraphLines.push(line);
    index += 1;
  }

  return {
    block: (
      <div className="md-block md-block--paragraph" key={`block-${startIndex}`}>
        {paragraphLines.map((line, lineOffset) => (
          <div className="md-line" key={`paragraph-${startIndex}-${lineOffset}`}>
            {renderInlineTokens(line, `paragraph-${startIndex}-${lineOffset}`, {
              plainClassName: "md-token--paragraph-text"
            })}
          </div>
        ))}
      </div>
    ),
    nextIndex: index
  };
}

function renderQuoteBlock(lines: string[], startIndex: number) {
  const quoteLines: string[] = [];
  let index = startIndex;

  while (index < lines.length && isQuoteLine(lines[index])) {
    quoteLines.push(lines[index]);
    index += 1;
  }

  return {
    block: (
      <div className="md-block md-block--quote" key={`block-${startIndex}`}>
        {quoteLines.map((line, lineOffset) => {
          const quoteMatch = line.match(/^(\s*)(>)(\s?)(.*)$/);

          if (!quoteMatch) {
            return renderEmptyLine(`quote-${startIndex}-${lineOffset}`);
          }

          return (
            <div className="md-line" key={`quote-${startIndex}-${lineOffset}`}>
              {quoteMatch[1]}
              <span className="md-token--syntax">{quoteMatch[2]}</span>
              {quoteMatch[3]}
              {renderInlineTokens(quoteMatch[4], `quote-${startIndex}-${lineOffset}`, {
                plainClassName: "md-token--quote-text"
              })}
            </div>
          );
        })}
      </div>
    ),
    nextIndex: index
  };
}

function renderFenceBlock(lines: string[], startIndex: number) {
  const fenceLines: string[] = [];
  let index = startIndex;
  const openingLine = lines[startIndex];
  const openingFence = openingLine.match(/^(\s*)(`{3,}|~{3,})(.*)$/)?.[2] ?? (openingLine.trim() === "$$" ? "$$" : undefined);

  while (index < lines.length) {
    const line = lines[index];
    fenceLines.push(line);
    index += 1;

    if (index > startIndex + 1 && openingFence && line.trim() === openingFence) {
      break;
    }
  }

  return {
    block: (
      <div className="md-block md-block--fence" key={`block-${startIndex}`}>
        {fenceLines.map((line, lineOffset) => {
          const fenceMatch = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/);

          if (fenceMatch) {
            return (
              <div className="md-line md-line--fence" key={`fence-${startIndex}-${lineOffset}`}>
                {fenceMatch[1]}
                <span className="md-token--syntax">{fenceMatch[2]}</span>
                {fenceMatch[3]}
              </div>
            );
          }

          if (line.trim() === "$$") {
            return (
              <div className="md-line md-line--fence" key={`fence-${startIndex}-${lineOffset}`}>
                <span className="md-token--syntax">$$</span>
              </div>
            );
          }

          return (
            <div className="md-line" key={`fence-${startIndex}-${lineOffset}`}>
              <span className="md-token--code-line">{line}</span>
            </div>
          );
        })}
      </div>
    ),
    nextIndex: index
  };
}

function renderTableBlock(lines: string[], startIndex: number) {
  const rows: TableRow[] = [];
  let index = startIndex;

  while (index < lines.length && lines[index].trim() && lines[index].includes("|")) {
    rows.push(tokenizeTableLine(lines[index], `table-${index}`));
    index += 1;
  }

  return {
    block: (
      <div className="md-block md-block--table" key={`block-${startIndex}`}>
        {rows.map((row) => {
          const gridTemplateColumns = row.parts
            .map((part) => (part.kind === "pipe" ? "auto" : "minmax(0, 1fr)"))
            .join(" ");
          const rowStyle = {
            gridTemplateColumns
          } satisfies CSSProperties;

          return (
            <div className="md-table-row" key={row.key} style={rowStyle}>
              {row.parts.map((part, partIndex) => {
                if (part.kind === "pipe") {
                  return (
                    <span className="md-token--table-pipe" key={`${row.key}-pipe-${partIndex}`}>
                      |
                    </span>
                  );
                }

                if (part.divider) {
                  return (
                    <span className="md-token--table-divider" key={`${row.key}-divider-${partIndex}`}>
                      {part.text}
                    </span>
                  );
                }

                return (
                  <span className="md-token--table-cell" key={`${row.key}-cell-${partIndex}`}>
                    {renderInlineTokens(part.text, `${row.key}-${partIndex}`, {
                      plainClassName: "md-token--table-cell"
                    })}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    ),
    nextIndex: index
  };
}

export function renderHighlightedMarkdown(markdown: string) {
  const lines = markdown.split("\n");
  const blocks: ReactNode[] = [];
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex];

    if (line.length === 0) {
      blocks.push(
        <div className="md-block md-block--blank" key={`block-${lineIndex}`}>
          {renderEmptyLine(`blank-${lineIndex}`)}
        </div>
      );
      lineIndex += 1;
      continue;
    }

    if (isTableStart(lines, lineIndex)) {
      const { block, nextIndex } = renderTableBlock(lines, lineIndex);
      blocks.push(block);
      lineIndex = nextIndex;
      continue;
    }

    if (isQuoteLine(line)) {
      const { block, nextIndex } = renderQuoteBlock(lines, lineIndex);
      blocks.push(block);
      lineIndex = nextIndex;
      continue;
    }

    if (isFenceLine(line)) {
      const { block, nextIndex } = renderFenceBlock(lines, lineIndex);
      blocks.push(block);
      lineIndex = nextIndex;
      continue;
    }

    const headingBlock = renderHeadingBlock(line, lineIndex);

    if (headingBlock) {
      blocks.push(headingBlock);
      lineIndex += 1;
      continue;
    }

    if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      blocks.push(renderRuleBlock(line, lineIndex));
      lineIndex += 1;
      continue;
    }

    const listBlock = renderListBlock(line, lineIndex);

    if (listBlock) {
      blocks.push(listBlock);
      lineIndex += 1;
      continue;
    }

    const { block, nextIndex } = renderParagraphBlock(lines, lineIndex);
    blocks.push(block);
    lineIndex = nextIndex;
  }

  return blocks;
}
