import type { LandingCard } from "@/lib/i18n/messages";

type FeatureGridProps = {
  features: LandingCard[];
};

export function FeatureGrid({ features }: FeatureGridProps) {
  return (
    <div className="feature-grid">
      {features.map((feature) => (
        <article className="surface-card" key={feature.title}>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </article>
      ))}
    </div>
  );
}
