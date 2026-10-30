import { cn } from "../lib/utils";

/**
 * Tabs — an underlined row that scrolls rather than wraps, so a long set
 * stays one line on a phone.
 *
 * `tabs`: [{ key, label, count }]
 */
export const Tabs = ({ tabs = [], value, onChange, className }) => (
  <div role="tablist" className={cn("rail-x border-b border-line", className)}>
    {tabs.map((tab) => {
      const active = tab.key === value;
      return (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange?.(tab.key)}
          className={cn(
            "relative flex items-center gap-2 whitespace-nowrap px-4 py-3",
            "text-[13.5px] font-medium transition-colors",
            active ? "text-primary-text" : "text-muted hover:text-text"
          )}
        >
          {tab.label}

          {tab.count != null ? (
            <span
              className={cn(
                "numeric rounded-full px-1.5 text-[11px] font-semibold",
                active
                  ? "bg-primary-soft text-primary-text"
                  : "bg-surface-3 text-muted"
              )}
            >
              {tab.count}
            </span>
          ) : null}

          {/* The underline sits inside the button so it tracks the scroll. */}
          {active ? (
            <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
          ) : null}
        </button>
      );
    })}
  </div>
);

/** Segmented control — a pill group for ranges and small filters. */
export const SegmentedControl = ({ options = [], value, onChange, className }) => (
  <div
    className={cn(
      "inline-flex gap-0.5 rounded-field border border-line bg-surface-2 p-[3px]",
      className
    )}
  >
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange?.(option.value)}
          aria-pressed={active}
          className={cn(
            "h-7 rounded-[7px] px-2.5 text-[12.5px] font-medium transition-colors",
            active
              ? "bg-surface text-text shadow-card"
              : "text-muted hover:text-text"
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default Tabs;
