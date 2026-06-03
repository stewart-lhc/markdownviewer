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
        <path className="brand-mark__page" d="M14 8h31l9 9v39H14z" />
        <path className="brand-mark__fold" d="M45 8v11h11z" />
        <path
          className="brand-mark__monogram"
          d="M22 45V27h5.2l4.8 7.3 4.8-7.3H42v18h-5.2v-8.6l-3.9 5.8h-1.8l-3.9-5.8V45z"
        />
        <path className="brand-mark__preview" d="M22 19h15M22 23h10" />
      </svg>
      {label ? <span className="brand-link__label">{label}</span> : null}
    </a>
  );
}
