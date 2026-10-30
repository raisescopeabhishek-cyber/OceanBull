import { cn } from "../lib/utils";

/**
 * Badge — a 24px pill with a leading dot, per the prototype.
 *
 * State is carried by colour and by the label, never by colour alone.
 */

const tones = {
  neutral: "bg-surface-3 text-muted",
  primary: "bg-primary-soft text-primary-text",
  success: "bg-profit-soft text-profit",
  warning: "bg-warning-soft text-warning",
  danger: "bg-loss-soft text-loss",
  info: "bg-info-soft text-info",
  profit: "bg-profit-soft text-profit",
  loss: "bg-loss-soft text-loss",
};

/** Maps the status strings the API returns onto a tone. */
const STATUS_TONES = {
  approved: "success", completed: "success", complete: "success",
  active: "success", verified: "success", success: "success",
  successful: "success", paid: "success", open: "success", passed: "success",
  pending: "warning", processing: "warning", review: "warning",
  "in review": "warning", requested: "warning", hold: "warning",
  submitted: "info", "phase 1": "info", "phase 2": "info",
  rejected: "danger", failed: "danger", declined: "danger",
  error: "danger", breached: "danger",
  cancelled: "neutral", canceled: "neutral", inactive: "neutral",
  expired: "neutral", closed: "neutral", draft: "neutral",
};

export const toneForStatus = (status) =>
  STATUS_TONES[String(status ?? "").trim().toLowerCase()] ?? "neutral";

export const Badge = ({
  tone = "neutral",
  dot = true,
  className,
  children,
  ...props
}) => (
  <span
    className={cn(
      "inline-flex h-6 items-center gap-1.5 rounded-full px-2",
      "text-xs font-semibold whitespace-nowrap capitalize",
      tones[tone] ?? tones.neutral,
      className
    )}
    {...props}
  >
    {dot ? (
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
    ) : null}
    {children}
  </span>
);

/** Picks the tone from the status text itself. */
export const StatusBadge = ({ status, ...props }) => (
  <Badge tone={toneForStatus(status)} {...props}>
    {status ?? "—"}
  </Badge>
);

/** Signed money or percentage, coloured by sign. Zero stays muted. */
export const Delta = ({ value, format, className, children }) => {
  const n = typeof value === "number" ? value : parseFloat(value);
  const sign = Number.isFinite(n) ? Math.sign(n) : 0;

  return (
    <span
      className={cn(
        "numeric font-semibold",
        sign > 0 && "text-profit",
        sign < 0 && "text-loss",
        sign === 0 && "text-muted",
        className
      )}
    >
      {children ?? (format ? format(n) : value)}
    </span>
  );
};

export default Badge;
