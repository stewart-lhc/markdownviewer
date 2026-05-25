import { BrandLink } from "@/components/brand/brand-link";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { Hero } from "@/components/landing/hero";
import { LiveSample } from "@/components/landing/live-sample";

const githubRepositoryUrl = "https://github.com/stewart-lhc/markdownviewer";

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "markdownviewer.run",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: "https://markdownviewer.run/",
  description:
    "A free online Markdown viewer and live preview workspace for README files, GitHub Flavored Markdown, Mermaid diagrams, KaTeX math, code blocks, local files, pasted Markdown, and raw URLs.",
  keywords:
    "markdown viewer, online markdown viewer, markdown preview, GitHub Flavored Markdown viewer, README viewer, Mermaid markdown viewer, markdown viewer with math",
  sameAs: [githubRepositoryUrl],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  },
  featureList: [
    "Live Markdown preview",
    "GitHub Flavored Markdown",
    "Mermaid diagram rendering",
    "KaTeX math rendering",
    "Syntax highlighted code blocks",
    "Local file, paste, GitHub, Gist, and raw URL import"
  ]
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I use markdownviewer.run as an online Markdown viewer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Open the workspace to paste Markdown, load a local .md file, or preview Markdown from GitHub, Gist, and raw URLs."
      }
    },
    {
      "@type": "Question",
      name: "Does the Markdown viewer support GitHub Flavored Markdown?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The renderer supports common GitHub Flavored Markdown patterns including tables, task lists, fenced code blocks, links, and README-style documents."
      }
    },
    {
      "@type": "Question",
      name: "Can I preview Mermaid diagrams and math in Markdown?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. markdownviewer.run renders Mermaid diagrams, syntax-highlighted code blocks, and KaTeX math so technical documents stay readable."
      }
    }
  ]
};

const searchIntentCards = [
  {
    title: "Markdown preview online",
    description:
      "Paste Markdown and check the rendered document in a live preview before publishing notes, docs, or blog drafts."
  },
  {
    title: "GitHub Flavored Markdown viewer",
    description:
      "Review README.md files, tables, task lists, fenced code blocks, and technical documentation with GitHub-style expectations."
  },
  {
    title: "Markdown viewer with Mermaid and math",
    description:
      "Render Mermaid diagrams, KaTeX equations, and syntax-highlighted code without setting up a docs site."
  },
  {
    title: "AI Markdown output reader",
    description:
      "Turn Markdown from ChatGPT, Claude, Cursor, or coding agents into a clean reading view for review and sharing."
  }
];

const faqs = [
  {
    question: "What can I open in this Markdown viewer?",
    answer:
      "Use a local .md file, pasted Markdown, GitHub content, Gists, raw URLs, or the built-in sample document."
  },
  {
    question: "Is it only a viewer, or can I edit Markdown too?",
    answer:
      "The workspace gives you a source pane and live preview, so you can edit raw Markdown while checking the rendered output."
  },
  {
    question: "Which long documents benefit most?",
    answer:
      "README files, API docs, changelogs, specs, AI-generated reports, lecture notes, and documents with code, tables, diagrams, or math."
  }
];

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Workspace", href: "/workspace" },
      { label: "Sample document", href: "/workspace?sample=starter" },
      { label: "GitHub repository", href: githubRepositoryUrl },
      { label: "FAQ", href: "#markdown-viewer-faq" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "#about" },
      { label: "Contact", href: "#contact" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "#terms" },
      { label: "Privacy policy", href: "#privacy" }
    ]
  }
];

export default function HomePage() {
  return (
    <main className="landing">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="page-shell">
        <header className="topbar">
          <BrandLink className="brand" label="Markdownviewer" title="Markdownviewer" />
          <nav className="topbar-actions" aria-label="Primary">
            <a className="ghost-link" href={githubRepositoryUrl}>
              GitHub
            </a>
            <a className="ghost-link" href="/workspace">
              Enter workspace
            </a>
          </nav>
        </header>
        <div className="hero">
          <Hero />
          <LiveSample />
        </div>

        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Why this wins</p>
              <h2 className="section-title">An online Markdown viewer with editorial standards.</h2>
            </div>
            <p className="section-copy">
              The first-use path stays obvious, while the rendering surface treats code,
              diagrams, math, README files, and reading rhythm like first-class material.
            </p>
          </div>
          <FeatureGrid />
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Search-ready workflows</p>
              <h2 className="section-title">Built around the Markdown jobs people actually search for.</h2>
            </div>
            <p className="section-copy">
              Use markdownviewer.run when you need a fast Markdown preview online, a GitHub
              Flavored Markdown viewer, or a clean reader for AI-generated Markdown.
            </p>
          </div>
          <div className="intent-grid">
            {searchIntentCards.map((card) => (
              <article className="surface-card intent-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--compact" aria-labelledby="markdown-viewer-faq">
          <div className="section-head">
            <div>
              <p className="eyebrow">FAQ</p>
              <h2 className="section-title" id="markdown-viewer-faq">
                Markdown viewer questions.
              </h2>
            </div>
          </div>
          <div className="faq-grid">
            {faqs.map((faq) => (
              <article className="surface-card faq-card" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="site-footer">
          <div className="site-footer__brand" id="about">
            <BrandLink className="brand" label="Markdownviewer" title="Markdownviewer" />
            <p>
              markdownviewer.run is a focused Markdown reading and editing workspace for
              README files, technical notes, AI output, Mermaid diagrams, math, and code.
            </p>
          </div>
          <nav className="site-footer__nav" aria-label="Footer">
            {footerColumns.map((column) => (
              <div className="site-footer__column" key={column.title}>
                <h2>{column.title}</h2>
                {column.links.map((link) => (
                  <a href={link.href} key={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </nav>
          <div className="site-footer__legal">
            <p id="terms">
              <strong>Terms of service.</strong> Use the viewer responsibly and only open
              Markdown you have the right to access or process.
            </p>
            <p id="privacy">
              <strong>Privacy policy.</strong> Local files and pasted Markdown are handled
              in your browser unless you choose to load a remote URL or create a share link.
            </p>
            <p id="contact">
              <strong>Contact.</strong> For product feedback, support, or legal requests,
              email <a href="mailto:hello@markdownviewer.run">hello@markdownviewer.run</a>.
            </p>
          </div>
          <div className="site-footer__bottom">
            <span>© 2026 markdownviewer.run</span>
            <span>Online Markdown viewer for polished technical documents.</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
