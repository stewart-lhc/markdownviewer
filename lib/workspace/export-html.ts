export function exportMarkdownHtml(markup: string, title: string) {
  const documentHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body>
    ${markup}
  </body>
</html>`;

  const blob = new Blob([documentHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const isJsdom = window.navigator.userAgent.toLowerCase().includes("jsdom");

  anchor.href = url;
  anchor.download = `${title.toLowerCase().replace(/\s+/g, "-") || "markdown-document"}.html`;

  if (!isJsdom) {
    anchor.click();
  }

  URL.revokeObjectURL(url);
}
