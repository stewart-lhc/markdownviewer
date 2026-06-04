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
      <svg aria-hidden="true" className="brand-mark" focusable="false" viewBox="0 0 64 64">
        <path className="brand-mark__page" d="M2 2h43l17 17v43H2z" />
        <path className="brand-mark__fold" d="M45 2v20h19z" />
        <path
          className="brand-mark__monogram"
          d="M13 54V24h9l10 15 10-15h9v30h-9V39l-7 10h-6l-7-10v15z"
        />
        <path className="brand-mark__preview" d="M13 15h25M13 21h17" />
      </svg>
      {label ? <span className="brand-link__label">{label}</span> : null}
    </a>
  );
}
