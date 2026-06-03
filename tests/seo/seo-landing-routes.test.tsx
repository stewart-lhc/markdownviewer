import { render, screen } from "@testing-library/react";
import DocumentToMarkdownConverterPage from "@/app/use-cases/document-to-markdown-converter/page";
import MermaidMarkdownViewerPage from "@/app/features/mermaid-markdown-viewer/page";
import ReadmeViewerPage from "@/app/use-cases/readme-viewer/page";

describe("seo landing routes", () => {
  it("renders the README viewer route as a focused crawlable page", () => {
    render(<ReadmeViewerPage />);

    expect(screen.getByRole("heading", { level: 1, name: "README Viewer Online" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /preview a readme/i })).toHaveAttribute("href", "/workspace");
    expect(screen.getByRole("heading", { level: 2, name: /readme viewer online questions/i })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("renders the Mermaid viewer route with diagram-specific FAQ content", () => {
    render(<MermaidMarkdownViewerPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Mermaid Markdown Viewer" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /preview mermaid markdown/i })).toHaveAttribute("href", "/workspace");
    expect(screen.getByText(/Mermaid code fences render inside the Markdown preview/i)).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("renders the document converter route with storage and OCR boundaries", () => {
    render(<DocumentToMarkdownConverterPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Document to Markdown Converter" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open the converter/i })).toHaveAttribute("href", "/workspace");
    expect(screen.getByText(/temporary server file during the request/i)).toBeInTheDocument();
    expect(screen.getByText(/Scanned PDFs and image-only documents need OCR/i)).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});
