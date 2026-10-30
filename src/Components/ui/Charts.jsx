import { useId, useMemo } from "react";
import { cn } from "../lib/utils";

/**
 * Charts drawn as inline SVG against the theme tokens.
 *
 * Both of these place every mark from one scale and label the axis with
 * values the data actually reaches — a chart whose gridlines say "100K" when
 * the series peaks at 71K is worse than no chart. Colours come from
 * currentColor or token classes so they stay legible in both themes.
 */

const niceCeil = (n) => {
  if (!Number.isFinite(n) || n <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(n)));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * mag >= n) ?? 10;
  return step * mag;
};

const compact = (n) => {
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (abs >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return String(Math.round(n));
};

/**
 * EquityCurve — a value series over time, with an area fill and an
 * emphasised endpoint.
 *
 * `data`: [{ label, value }]  — or a plain number array.
 */
export const EquityCurve = ({
  data = [],
  height = 120,
  className,
  format = compact,
  ariaLabel,
}) => {
  const id = useId();
  const points = useMemo(
    () =>
      data.map((d, i) =>
        typeof d === "number" ? { label: String(i), value: d } : d
      ),
    [data]
  );

  if (points.length < 2) {
    return (
      <div
        className={cn(
          "grid place-items-center border border-line bg-surface-2",
          className
        )}
        style={{ height }}
      >
        <span className="lbl">Not enough data</span>
      </div>
    );
  }

  const values = points.map((p) => Number(p.value) || 0);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  // Pad the band so the line never sits on the frame, and keep the labels
  // on round numbers.
  const pad = (rawMax - rawMin) * 0.12 || Math.abs(rawMax) * 0.1 || 1;
  const min = rawMin - pad;
  const max = rawMax + pad;

  const W = 1000;
  const H = height;
  const gutter = 40; // room for the y labels
  const top = 10;
  const bottom = H - 18; // room for the x labels

  const px = (i) => gutter + (i * (W - gutter - 6)) / (points.length - 1);
  const py = (v) => bottom - ((v - min) / (max - min)) * (bottom - top);

  const line = points
    .map((p, i) => `${i ? "L" : "M"}${px(i).toFixed(1)} ${py(p.value).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${px(points.length - 1).toFixed(1)} ${bottom} L${gutter} ${bottom} Z`;

  const ticks = [max - pad, (max + min) / 2, min + pad];
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      role="img"
      aria-label={
        ariaLabel ??
        `Series from ${format(values[0])} to ${format(last.value)}`
      }
      className={cn("block text-primary", className)}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={gutter}
            y1={py(t)}
            x2={W - 6}
            y2={py(t)}
            className="stroke-line"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <text
            x="0"
            y={py(t) + 3}
            className="fill-subtle"
            fontFamily="var(--font-num)"
            fontSize="10"
          >
            {format(t)}
          </text>
        </g>
      ))}

      <path d={area} fill={`url(#fill-${id})`} />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={px(points.length - 1)} cy={py(last.value)} r="3" fill="currentColor" />

      <text
        x={gutter}
        y={H - 4}
        className="fill-subtle"
        fontFamily="var(--font-num)"
        fontSize="10"
      >
        {points[0].label}
      </text>
      <text
        x={W - 6}
        y={H - 4}
        textAnchor="end"
        className="fill-subtle"
        fontFamily="var(--font-num)"
        fontSize="10"
      >
        {last.label}
      </text>
    </svg>
  );
};

/**
 * FlowBars — signed values around a zero axis: deposits above, withdrawals
 * below. Reading direction from position as well as colour means it still
 * works for anyone who can't separate the two hues.
 *
 * `data`: [{ label, value }]
 */
export const FlowBars = ({
  data = [],
  height = 110,
  className,
  format = compact,
  ariaLabel,
}) => {
  const points = useMemo(
    () =>
      data.map((d, i) =>
        typeof d === "number" ? { label: String(i), value: d } : d
      ),
    [data]
  );

  if (!points.length) {
    return (
      <div
        className={cn(
          "grid place-items-center border border-line bg-surface-2",
          className
        )}
        style={{ height }}
      >
        <span className="lbl">No activity</span>
      </div>
    );
  }

  const values = points.map((p) => Number(p.value) || 0);
  const scale = niceCeil(Math.max(...values.map(Math.abs)));

  const W = 1000;
  const H = height;
  const top = 12;
  const bottom = H - 18;
  const axis = top + (bottom - top) / 2;
  const slot = (W - 6) / points.length;
  const barW = Math.max(3, Math.min(slot * 0.62, 22));

  const net = values.reduce((a, b) => a + b, 0);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      role="img"
      aria-label={
        ariaLabel ??
        `Net flow ${net >= 0 ? "positive" : "negative"} at ${format(net)}`
      }
      className={cn("block", className)}
      preserveAspectRatio="none"
    >
      <text
        x="0"
        y={top + 3}
        className="fill-subtle"
        fontFamily="var(--font-num)"
        fontSize="10"
      >
        {format(scale)}
      </text>
      <text
        x="0"
        y={bottom + 3}
        className="fill-subtle"
        fontFamily="var(--font-num)"
        fontSize="10"
      >
        -{format(scale)}
      </text>

      <line
        x1="0"
        y1={axis}
        x2={W}
        y2={axis}
        className="stroke-line-strong"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />

      {points.map((p, i) => {
        const v = Number(p.value) || 0;
        const h = (Math.abs(v) / scale) * (axis - top);
        const x = i * slot + (slot - barW) / 2;
        const isLast = i === points.length - 1;
        return (
          <rect
            key={i}
            x={x}
            y={v >= 0 ? axis - h : axis}
            width={barW}
            height={Math.max(h, 1)}
            className={
              isLast
                ? "fill-primary"
                : v >= 0
                ? "fill-profit"
                : "fill-loss"
            }
          />
        );
      })}

      <text
        x="0"
        y={H - 4}
        className="fill-subtle"
        fontFamily="var(--font-num)"
        fontSize="10"
      >
        {points[0].label}
      </text>
      <text
        x={W - 6}
        y={H - 4}
        textAnchor="end"
        className="fill-subtle"
        fontFamily="var(--font-num)"
        fontSize="10"
      >
        {points[points.length - 1].label}
      </text>
    </svg>
  );
};

/** Meter — a labelled bar for limits: margin level, loss used, cover. */
export const Meter = ({
  label,
  value,
  pct = 0,
  tone = "profit",
  note,
  className,
}) => {
  const toneClass = {
    profit: "bg-profit text-profit",
    warning: "bg-warning text-warning",
    loss: "bg-loss text-loss",
    primary: "bg-primary text-primary",
  }[tone];

  const width = Math.max(0, Math.min(100, Number(pct) || 0));

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="lbl truncate">{label}</span>
        <span className={cn("numeric text-[11px] font-bold", toneClass.split(" ")[1])}>
          {value}
        </span>
      </div>

      <div
        className="mt-1.5 h-1 bg-line"
        role="meter"
        aria-valuenow={width}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn("h-1", toneClass.split(" ")[0])}
          style={{ width: `${width}%` }}
        />
      </div>

      {note ? (
        <p className="numeric mt-1 truncate text-[9px] text-subtle">{note}</p>
      ) : null}
    </div>
  );
};

export default EquityCurve;
