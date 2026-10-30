import { cn } from "../lib/utils";

/**
 * BulkBar — appears once rows are selected.
 *
 * Opt-in per page: a blotter only gets a checkbox column where the real
 * workflow approves in batches. On a phone it sits above the bottom nav so
 * the primary action stays in thumb reach.
 *
 * actions: [{ key, label, tone, onClick, disabled }]
 */

const actionTone = {
  success: "bg-success text-primary-on hover:bg-success/85",
  danger: "bg-danger text-primary-on hover:bg-danger/85",
  neutral: "border border-line-strong text-text hover:bg-surface-3",
};

export const BulkBar = ({
  count = 0,
  total,
  actions = [],
  onClear,
  className,
}) => {
  if (!count) return null;

  return (
    <div
      role="status"
      className={cn(
        "flex flex-wrap items-center gap-2 border-y border-primary/40 bg-primary-soft px-3 py-2",
        className
      )}
    >
      <span className="numeric text-[11px] font-bold text-primary">
        {count} selected
      </span>

      {total ? (
        <span className="numeric text-[10px] text-muted">{total}</span>
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5">
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              "lbl-sm inline-flex min-h-8 items-center rounded-field px-2.5 transition-colors disabled:opacity-45",
              actionTone[action.tone ?? "neutral"]
            )}
          >
            {action.label}
          </button>
        ))}
      </div>

      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="numeric ml-auto text-[10px] text-subtle underline hover:text-text"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
};

export default BulkBar;
