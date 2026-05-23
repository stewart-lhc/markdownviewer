type BrandLinkProps = {
  ariaLabel?: string;
  className?: string;
  compact?: boolean;
  href?: string;
  label?: string;
  title?: string;
};

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function BrandLink({
  ariaLabel = "Markdownviewer home",
  className,
  compact = false,
  href = "/",
  label,
  title
}: BrandLinkProps) {
  return (
    <a
      aria-label={ariaLabel}
      className={joinClasses("brand-link", compact && "brand-link--compact", className)}
      href={href}
      title={title}
    >
      <span aria-hidden="true" className="brand-mark">
        <span className="brand-mark__sheet" />
        <span className="brand-mark__fold" />
        <span className="brand-mark__line brand-mark__line--one" />
        <span className="brand-mark__line brand-mark__line--two" />
        <span className="brand-mark__slash" />
      </span>
      {label ? <span className="brand-link__label">{label}</span> : null}
    </a>
  );
}
