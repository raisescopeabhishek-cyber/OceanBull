import { cn } from "../lib/utils";

import Card from "./Card";
import { Readout, ReadoutStrip } from "./StatCard";

/**
 * DashboardPage — the overview archetype.
 *
 * A band carrying the one figure that matters and its trend, then a main
 * column of tables and a right stack of activity and charts. Below `lg`
 * everything stacks in that order, so a phone reads the headline figure
 * first and the supporting panels after.
 *
 * Props
 *   hero:     { label, value, delta, trend, breakdown: [{label, value, tone}] }
 *   chart:    node — rendered beside the hero figure on a wide screen
 *   readouts: [{ key, label, value, delta, trend, helper }]
 *   aside:    node — the right stack
 *   children: the main column
 */

const trendTone = {
  up: "text-profit",
  down: "text-loss",
  flat: "text-muted",
};

export const DashboardPage = ({
  hero,
  chart,
  readouts = [],
  aside,
  children,
  className,
}) => (
  <div className={cn("flex min-w-0 flex-col gap-2", className)}>
    {hero ? (
      <Card className="overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* The headline figure. */}
          <div className="shrink-0 border-b border-line p-3 lg:w-[330px] lg:border-b-0 lg:border-r">
            <span className="lbl">{hero.label}</span>

            <div className="numeric mt-1.5 text-[30px] font-bold leading-none tracking-[-0.025em] text-text">
              {hero.value}
            </div>

            {hero.delta ? (
              <div className="mt-1.5 flex items-baseline gap-2">
                <span
                  className={cn(
                    "numeric text-[13px] font-bold",
                    trendTone[hero.trend ?? "flat"]
                  )}
                >
                  {hero.delta}
                </span>
                {hero.deltaPct ? (
                  <span
                    className={cn(
                      "numeric text-[11px]",
                      trendTone[hero.trend ?? "flat"]
                    )}
                  >
                    {hero.deltaPct}
                  </span>
                ) : null}
                {hero.helper ? (
                  <span className="lbl ml-auto">{hero.helper}</span>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* The trend, given the width it needs to be read. */}
          {chart ? (
            <div className="min-w-0 flex-1 border-b border-line p-3 lg:border-b-0">
              {chart}
            </div>
          ) : null}

          {/* Balance breakdown: label/value pairs, one per line. */}
          {hero.breakdown?.length ? (
            <div className="shrink-0 lg:w-[232px] lg:border-l lg:border-line">
              {hero.breakdown.map((item) => (
                <div
                  key={item.label}
                  className="flex h-[34px] items-center justify-between gap-2 border-b border-line px-3 last:border-b-0"
                >
                  <span className="lbl truncate">{item.label}</span>
                  <span
                    className={cn(
                      "numeric text-xs font-semibold",
                      item.tone === "profit"
                        ? "text-profit"
                        : item.tone === "loss"
                        ? "text-loss"
                        : "text-text"
                    )}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Card>
    ) : null}

    {readouts.length ? (
      <ReadoutStrip>
        {readouts.map((r) => (
          <Readout key={r.key ?? r.label} {...r} />
        ))}
      </ReadoutStrip>
    ) : null}

    <div className="flex min-w-0 flex-col gap-2 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-2 [&>*]:min-w-0">
        {children}
      </div>

      {aside ? (
        <div className="flex min-w-0 shrink-0 flex-col gap-2 lg:w-[352px] [&>*]:min-w-0">
          {aside}
        </div>
      ) : null}
    </div>
  </div>
);

/** A titled panel for the dashboard's columns. */
export const DashboardPanel = ({ title, meta, children, className, bodyClassName }) => (
  <Card className={cn("overflow-hidden", className)}>
    {title ? (
      <div className="flex h-[30px] items-center justify-between gap-2 border-b border-line bg-surface-2 px-3">
        <span className="lbl-sm text-text">{title}</span>
        {meta ? <span className="numeric text-[10px] text-subtle">{meta}</span> : null}
      </div>
    ) : null}
    <div className={cn("p-3", bodyClassName)}>{children}</div>
  </Card>
);

export default DashboardPage;
