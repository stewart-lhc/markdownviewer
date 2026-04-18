import GithubSlugger from "github-slugger";

export type ExtractedHeading = {
  depth: number;
  id: string;
  text: string;
};

export function extractHeadings(markdown: string): ExtractedHeading[] {
  const lines = markdown.split("\n");
  const headings: ExtractedHeading[] = [];
  const slugger = new GithubSlugger();

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const atxMatch = line.match(/^(#{1,6})\s+(.+?)(?:\s+#+\s*)?$/);

    if (atxMatch) {
      const text = atxMatch[2].trim();

      headings.push({
        depth: atxMatch[1].length,
        text,
        id: slugger.slug(text)
      });
      continue;
    }

    const nextLine = lines[index + 1];
    const setextMatch =
      line.trim() && nextLine ? nextLine.match(/^(=+|-+)\s*$/) : null;

    if (!setextMatch) {
      continue;
    }

    const text = line.trim();

    headings.push({
      depth: setextMatch[1][0] === "=" ? 1 : 2,
      text,
      id: slugger.slug(text)
    });
    index += 1;
  }

  return headings;
}
