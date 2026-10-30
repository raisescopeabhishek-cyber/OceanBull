import { cn } from "../lib/utils";
import Card from "./Card";

/**
 * Stat card — label, tinted icon, large figure and a delta line, per the
 * prototype's `.stat`.
 *
 * `delta` is coloured against the profit/loss tokens rather than generic
 * success/danger, so money colour tunes independently of form validation.
 */

const iconTone = {
  brand: "bg-primary-soft text-primary-text",
  ok: "bg-profit-soft text-profit",
  success: "bg-profit-soft text-profit",
  warn: "bg-warning-soft text-warning",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
  bad: "bg-loss-soft text-loss",
  danger: "bg-loss-soft text-loss",
};

const trendTone = {
  up: "text-profit",
  down: "text-loss",
  flat: "text-muted",
};

export const Readout = ({
  label,
  value,
  delta,
  trend = "flat",
  helper,
  icon,
  tone = "brand",
  className,
  ...props
}) => (
  <div className={cn("flex min-w-0 flex-col gap-2.5 p-[18px]", className)} {...props}>
    <div className="flex items-center justify-between gap-2">
      <span className="truncate text-[12.5px] text-subtle">{label}</span>
      {icon ? (
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-[9px]",
            iconTone[tone] ?? iconTone.brand
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
    </div>

    <div className="numeric text-[22px] font-semibold leading-tight tracking-[-0.02em] text-text">
      {value}
    </div>

    {delta ? (
      <p className={cn("numeric text-xs font-semibold", trendTone[trend])}>
        {delta}
      </p>
    ) : null}

    {helper ? <p className="truncate text-xs text-subtle">{helper}</p> : null}
  </div>
);

/** A row of readouts inside one bordered panel, divided by hairlines. */
export const ReadoutStrip = ({ children, className, scrollOnMobile = false }) => (
  <Card className={cn("overflow-hidden", className)}>
    <div
      className={cn(
        scrollOnMobile ? "rail-x" : "grid grid-cols-1 sm:grid-cols-2",
        "sm:grid sm:grid-cols-2 lg:grid-cols-4",
        "[&>*]:border-line [&>*]:border-b sm:[&>*]:border-b-0 sm:[&>*]:border-r",
        "sm:[&>*:last-child]:border-r-0 [&>*:last-child]:border-b-0",
        scrollOnMobile && "[&>*]:min-w-[160px]"
      )}
    >
      {children}
    </div>
  </Card>
);

/** A readout standing alone in its own card. */
export const StatCard = ({ className, spot = true, ...props }) => (
  <Card spot={spot} className={cn("overflow-hidden", className)}>
    <Readout {...props} />
  </Card>
);

/** Grid of standalone stat cards. */
export const StatGrid = ({ children, className, scrollOnMobile = false }) =>
  scrollOnMobile ? (
    <div
      className={cn(
        "snap-x-row bleed-mobile gap-4 px-4 pb-1 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  ) : (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );

export default StatCard;
