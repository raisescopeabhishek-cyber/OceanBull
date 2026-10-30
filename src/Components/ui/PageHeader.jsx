import { cn } from "../lib/utils";

/**
 * Page header — 22px semibold title with a secondary line, actions aligned
 * to the baseline on the right, per the prototype's `.page-head`.
 */
export const PageHeader = ({
  title,
  description,
  actions,
  breadcrumb,
  className,
}) => (
  <header
    className={cn(
      "flex flex-wrap items-end justify-between gap-4",
      className
    )}
  >
    <div className="min-w-0">
      {breadcrumb ? (
        <nav className="mb-1 text-[11.5px] text-subtle" aria-label="Breadcrumb">
          {breadcrumb}
        </nav>
      ) : null}

      <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-text">
        {title}
      </h2>

      {description ? (
        <p className="mt-0.5 text-muted">{description}</p>
      ) : null}
    </div>

    {actions ? (
      <div className="flex flex-wrap gap-2">{actions}</div>
    ) : null}
  </header>
);

export default PageHeader;
