import type { LandingCard } from "@/lib/i18n/messages";

type FeatureGridProps = {
  features: LandingCard[];
};

const featureScreenshots = [
  "/feature-screenshots/live-preview.webp",
  "/feature-screenshots/folder-workspace.webp",
  "/feature-screenshots/pwa-file-open.webp",
  "/feature-screenshots/persistent-tabs.webp",
  "/feature-screenshots/document-conversion.webp",
  "/feature-screenshots/technical-rendering.webp",
  "/feature-screenshots/share-export.webp",
  "/feature-screenshots/readme-ai-workspace.webp"
];

export function FeatureGrid({ features }: FeatureGridProps) {
  return (
    <div className="feature-grid">
      {features.map((feature, index) => (
        <article className={`surface-card feature-card feature-card--${index + 1}`} key={feature.title}>
          <div className="feature-card__media">
            <img
              alt={`${feature.title} product screenshot`}
              decoding="async"
              loading="eager"
              src={featureScreenshots[index] ?? featureScreenshots[0]}
            />
          </div>
          <div className="feature-card__body">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
