import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  ChevronRight,
  Clock3,
  CreditCard,
  Gift,
  LifeBuoy,
  MousePointerClick,
  RefreshCcw,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { adminApi } from "../../../../src/utils/apiClients.js";

const RANGE_OPTIONS = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "180D", value: "180d" },
  { label: "1Y", value: "365d" },
  { label: "All", value: "all" },
];

const REPORT_ENDPOINTS = [
  "/report-dashboard/overview",
  "/admin/report-dashboard/overview",
];

const cx = (...classes) => classes.filter(Boolean).join(" ");

const toNumber = (value) => {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(toNumber(value));

const formatCompactMoney = (value) => {
  const num = toNumber(value);
  if (Math.abs(num) >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (Math.abs(num) >= 1000) return `$${(num / 1000).toFixed(1)}K`;
  return formatMoney(num);
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(toNumber(value));

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const getPayloadData = (response) => {
  const payload = response?.data || {};
  return payload?.data || payload;
};

async function getReportDashboard(params) {
  let lastError = null;

  for (const endpoint of REPORT_ENDPOINTS) {
    try {
      const response = await adminApi.get(endpoint, { params });
      return getPayloadData(response);
    } catch (error) {
      lastError = error;

      if (error?.response?.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError;
}

function buildSmoothPath(points) {
  if (!points?.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const path = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;

    path.push(
      `C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`
    );
  }

  return path.join(" ");
}

function getTheme(isDark) {
  return {
    pageText: isDark ? "text-white" : "text-slate-900",
    mutedText: isDark ? "text-white/45" : "text-slate-500",
    softText: isDark ? "text-white/60" : "text-slate-600",
    strongText: isDark ? "text-white" : "text-slate-950",

    heroShell: isDark
      ? "border-white/10 bg-white/[0.04] shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
      : "border-orange-100/80 bg-white/90 shadow-[0_20px_60px_rgba(251,146,60,0.12)]",

    panelShell: isDark
      ? "border-white/10 bg-white/[0.045] shadow-[0_18px_55px_rgba(0,0,0,0.24)]"
      : "border-orange-100/80 bg-white/95 shadow-[0_16px_50px_rgba(251,146,60,0.10)]",

    innerShell: isDark
      ? "border-white/10 bg-white/[0.035]"
      : "border-orange-100/80 bg-orange-50/35",

    inputShell: isDark
      ? "border-white/10 bg-white/[0.04]"
      : "border-orange-100 bg-white",

    badgeGreen: isDark
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
      : "border-emerald-200 bg-emerald-50 text-emerald-700",

    rangeActive: isDark
      ? "bg-white text-slate-950 shadow-lg"
      : "bg-orange-600 text-white shadow-lg shadow-orange-500/20",

    rangeIdle: isDark
      ? "text-white/45 hover:bg-white/[0.07] hover:text-white"
      : "text-slate-600 hover:bg-orange-50 hover:text-orange-700",

    refreshButton: isDark
      ? "border-white/10 bg-white/[0.06] text-white hover:bg-white/10"
      : "border-orange-100 bg-white text-slate-700 shadow-sm hover:bg-orange-50",
  };
}

function IconBox({ children, tone = "orange", isDark }) {
  const lightTones = {
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  };

  const darkTones = {
    orange: "border-orange-400/20 bg-orange-500/10 text-orange-300",
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    sky: "border-sky-400/20 bg-sky-500/10 text-sky-300",
    violet: "border-violet-400/20 bg-violet-500/10 text-violet-300",
    rose: "border-rose-400/20 bg-rose-500/10 text-rose-300",
    slate: "border-white/10 bg-white/[0.06] text-white/80",
  };

  return (
    <div
      className={cx(
        "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border transition-all duration-300",
        isDark ? darkTones[tone] || darkTones.orange : lightTones[tone] || lightTones.orange
      )}
    >
      {children}
    </div>
  );
}

function StatCard({
  title,
  value,
  helper,
  icon,
  tone = "orange",
  loading = false,
  trend,
  onClick,
  clickLabel = "View Details",
  isDark,
}) {
  const clickable = typeof onClick === "function";

  const lightToneMap = {
    orange:
      "border-orange-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,247,237,0.94))] shadow-[0_16px_45px_rgba(251,146,60,0.10)]",
    emerald:
      "border-emerald-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(236,253,245,0.92))] shadow-[0_16px_45px_rgba(16,185,129,0.09)]",
    sky: "border-sky-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,249,255,0.92))] shadow-[0_16px_45px_rgba(14,165,233,0.09)]",
    violet:
      "border-violet-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(245,243,255,0.92))] shadow-[0_16px_45px_rgba(139,92,246,0.09)]",
    rose: "border-rose-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,241,242,0.92))] shadow-[0_16px_45px_rgba(244,63,94,0.09)]",
    slate:
      "border-slate-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_16px_45px_rgba(15,23,42,0.07)]",
  };

  const darkToneMap = {
    orange:
      "border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] shadow-[0_18px_55px_rgba(0,0,0,0.22)]",
    emerald:
      "border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.09),rgba(255,255,255,0.025))] shadow-[0_18px_55px_rgba(0,0,0,0.22)]",
    sky: "border-white/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.09),rgba(255,255,255,0.025))] shadow-[0_18px_55px_rgba(0,0,0,0.22)]",
    violet:
      "border-white/10 bg-[linear-gradient(135deg,rgba(139,92,246,0.09),rgba(255,255,255,0.025))] shadow-[0_18px_55px_rgba(0,0,0,0.22)]",
    rose: "border-white/10 bg-[linear-gradient(135deg,rgba(244,63,94,0.09),rgba(255,255,255,0.025))] shadow-[0_18px_55px_rgba(0,0,0,0.22)]",
    slate:
      "border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] shadow-[0_18px_55px_rgba(0,0,0,0.22)]",
  };

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={(event) => {
        if (!clickable) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={cx(
        "group relative min-h-[176px] overflow-hidden rounded-[24px] border p-4 backdrop-blur-xl transition-all duration-300",
        isDark ? darkToneMap[tone] || darkToneMap.orange : lightToneMap[tone] || lightToneMap.orange,
        clickable &&
          "cursor-pointer hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-orange-400/40",
        clickable && !isDark && "hover:border-orange-300 hover:shadow-[0_22px_70px_rgba(251,146,60,0.18)]",
        clickable && isDark && "hover:border-sky-300/30 hover:bg-white/[0.07]"
      )}
      title={`${title}: ${value}${helper ? ` • ${helper}` : ""}${
        clickable ? ` • Click to ${clickLabel}` : ""
      }`}
    >
      <div
        className={cx(
          "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl",
          tone === "emerald" && (isDark ? "bg-emerald-400/13" : "bg-emerald-200/55"),
          tone === "sky" && (isDark ? "bg-sky-400/13" : "bg-sky-200/55"),
          tone === "violet" && (isDark ? "bg-violet-400/13" : "bg-violet-200/55"),
          tone === "rose" && (isDark ? "bg-rose-400/13" : "bg-rose-200/55"),
          tone === "slate" && (isDark ? "bg-white/6" : "bg-slate-200/45"),
          tone === "orange" && (isDark ? "bg-orange-400/13" : "bg-orange-200/60")
        )}
      />

      <div
        className={cx(
          "pointer-events-none absolute bottom-[-52px] right-[-40px] h-[120px] w-[58%] rounded-full blur-2xl",
          isDark ? "bg-white/[0.035]" : "bg-white/80"
        )}
      />

      {clickable ? (
        <div
          className={cx(
            "pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100",
            isDark
              ? "border-white/10 bg-white/[0.08] text-white/70"
              : "border-orange-100 bg-white text-orange-700"
          )}
        >
          Open
          <ChevronRight size={12} />
        </div>
      ) : null}

      <div className="relative z-10 flex h-full flex-col justify-between gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className={cx(
                "text-[11px] font-bold uppercase tracking-[0.18em]",
                isDark ? "text-white/40" : "text-slate-500"
              )}
            >
              {title}
            </p>

            {loading ? (
              <div
                className={cx(
                  "mt-3 h-8 w-32 animate-pulse rounded-xl",
                  isDark ? "bg-white/10" : "bg-slate-200"
                )}
              />
            ) : (
              <h3
                className={cx(
                  "mt-2 truncate text-2xl font-black tracking-tight",
                  isDark ? "text-white" : "text-slate-950"
                )}
              >
                {value}
              </h3>
            )}

            {helper ? (
              <p
                className={cx(
                  "mt-1 text-xs font-semibold",
                  isDark ? "text-white/45" : "text-slate-500"
                )}
              >
                {helper}
              </p>
            ) : null}
          </div>

          <IconBox tone={tone} isDark={isDark}>
            {icon}
          </IconBox>
        </div>

        <div className="flex items-end justify-between gap-3">
          {trend ? (
            <div
              className={cx(
                "flex min-w-0 items-center gap-2 text-xs font-semibold",
                isDark ? "text-white/45" : "text-slate-600"
              )}
            >
              {trend}
            </div>
          ) : (
            <div />
          )}

          {clickable ? (
            <div
              className={cx(
                "flex shrink-0 items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em]",
                isDark ? "text-sky-300" : "text-orange-600"
              )}
            >
              <MousePointerClick size={13} />
              {clickLabel}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
  onClick,
  clickLabel = "Open",
  isDark,
}) {
  const clickable = typeof onClick === "function";
  const theme = getTheme(isDark);

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={(event) => {
        if (!clickable) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={cx(
        "relative overflow-hidden rounded-[24px] border p-4 backdrop-blur-xl transition-all duration-300",
        theme.panelShell,
        clickable &&
          "cursor-pointer hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-orange-400/40",
        clickable && !isDark && "hover:border-orange-300 hover:bg-white",
        clickable && isDark && "hover:border-sky-300/30 hover:bg-white/[0.065]",
        className
      )}
    >
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3
              className={cx(
                "text-sm font-bold uppercase tracking-[0.18em]",
                isDark ? "text-white/85" : "text-slate-800"
              )}
            >
              {title}
            </h3>

            {clickable ? (
              <ChevronRight
                className={isDark ? "text-sky-300" : "text-orange-500"}
                size={16}
              />
            ) : null}
          </div>

          {subtitle ? (
            <p className={cx("mt-1 text-xs", theme.mutedText)}>{subtitle}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {clickable ? (
            <span
              className={cx(
                "rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em]",
                isDark
                  ? "border-white/10 bg-white/[0.06] text-white/55"
                  : "border-orange-100 bg-orange-50 text-orange-700"
              )}
            >
              {clickLabel}
            </span>
          ) : null}

          {action ? <div>{action}</div> : null}
        </div>
      </div>

      {children}
    </div>
  );
}

function StatusList({
  items = [],
  loading = false,
  emptyText = "No data found",
  onItemClick,
  isDark,
}) {
  const clickable = typeof onItemClick === "function";

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className={cx(
              "h-[62px] animate-pulse rounded-2xl",
              isDark ? "bg-white/10" : "bg-slate-100"
            )}
          />
        ))}
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div
        className={cx(
          "grid min-h-[210px] place-items-center rounded-[20px] border border-dashed px-4 text-center text-xs font-semibold",
          isDark
            ? "border-white/10 bg-white/[0.03] text-white/35"
            : "border-orange-200 bg-orange-50/45 text-slate-500"
        )}
      >
        {emptyText}
      </div>
    );
  }

  const max = Math.max(...items.map((item) => toNumber(item?.count)), 1);

  return (
    <div className="space-y-3">
      {items.slice(0, 6).map((item, index) => {
        const label = String(item?._id || "Unknown").replaceAll("_", " ");
        const count = toNumber(item?.count);
        const percentage = Math.min((count / max) * 100, 100);

        return (
          <div
            key={`${label}-${index}`}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={clickable ? () => onItemClick(item) : undefined}
            onKeyDown={(event) => {
              if (!clickable) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onItemClick(item);
              }
            }}
            title={`${label}: ${formatNumber(count)} records${
              clickable ? " • Click to view" : ""
            }`}
            className={cx(
              "rounded-[18px] border p-3 transition-all duration-300",
              isDark
                ? "border-white/10 bg-white/[0.035]"
                : "border-orange-100 bg-white/85",
              clickable &&
                "cursor-pointer hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-400/30",
              clickable && isDark && "hover:bg-white/[0.06]",
              clickable && !isDark && "hover:border-orange-300 hover:bg-white"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p
                className={cx(
                  "truncate text-sm font-bold capitalize",
                  isDark ? "text-white/75" : "text-slate-700"
                )}
              >
                {label}
              </p>

              <div className="flex items-center gap-2">
                <span
                  className={cx(
                    "rounded-full border px-2.5 py-1 text-[11px] font-bold",
                    isDark
                      ? "border-white/10 bg-white/[0.06] text-white/70"
                      : "border-orange-100 bg-orange-50 text-orange-700"
                  )}
                >
                  {formatNumber(count)}
                </span>

                {clickable ? (
                  <ChevronRight
                    size={15}
                    className={isDark ? "text-sky-300" : "text-orange-500"}
                  />
                ) : null}
              </div>
            </div>

            <div
              className={cx(
                "mt-3 h-1.5 overflow-hidden rounded-full",
                isDark ? "bg-white/10" : "bg-orange-100"
              )}
            >
              <div
                className={cx(
                  "h-full rounded-full",
                  isDark
                    ? "bg-gradient-to-r from-sky-400 to-cyan-300"
                    : "bg-gradient-to-r from-orange-400 to-orange-600"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CashflowChart({ data = [], loading = false, isDark = false }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const chart = useMemo(() => {
    const list = (data || []).map((item) => ({
      date: item?.date,
      deposits: toNumber(item?.deposits),
      withdrawals: toNumber(item?.withdrawals),
      users: toNumber(item?.users),
      tradingProfit: toNumber(item?.tradingProfit),
      net: toNumber(item?.deposits) - toNumber(item?.withdrawals),
    }));

    if (!list.length) {
      return {
        list: [],
        paths: {},
        points: {},
        yTicks: [],
        width: 760,
      };
    }

    const width = 760;
    const height = 260;
    const padding = {
      top: 24,
      right: 20,
      bottom: 28,
      left: 54,
    };

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const allValues = list.flatMap((item) => [
      item.deposits,
      item.withdrawals,
      item.net,
      item.tradingProfit,
    ]);

    let min = Math.min(...allValues, 0);
    let max = Math.max(...allValues, 1);

    if (min === max) {
      min -= 1;
      max += 1;
    }

    const buffer = (max - min) * 0.12;
    min -= buffer;
    max += buffer;

    const xScale = (index) =>
      padding.left +
      (list.length === 1
        ? plotWidth / 2
        : (index / (list.length - 1)) * plotWidth);

    const yScale = (value) =>
      padding.top + ((max - value) / Math.max(max - min, 1)) * plotHeight;

    const makePoints = (key) =>
      list.map((item, index) => ({
        x: xScale(index),
        y: yScale(item[key]),
        value: item[key],
        date: item.date,
        index,
      }));

    const points = {
      deposits: makePoints("deposits"),
      withdrawals: makePoints("withdrawals"),
      net: makePoints("net"),
      tradingProfit: makePoints("tradingProfit"),
    };

    const paths = {
      deposits: buildSmoothPath(points.deposits),
      withdrawals: buildSmoothPath(points.withdrawals),
      net: buildSmoothPath(points.net),
      tradingProfit: buildSmoothPath(points.tradingProfit),
    };

    const areaPath = `${paths.net} L ${
      points.net[points.net.length - 1]?.x || padding.left
    } ${padding.top + plotHeight} L ${points.net[0]?.x || padding.left} ${
      padding.top + plotHeight
    } Z`;

    const yTicks = [0, 1, 2, 3, 4].map((tick) => {
      const value = max - ((max - min) / 4) * tick;
      return {
        value,
        y: yScale(value),
      };
    });

    return {
      width,
      height,
      padding,
      list,
      points,
      paths,
      areaPath,
      yTicks,
    };
  }, [data]);

  const hovered =
    hoverIndex !== null && chart.list?.[hoverIndex]
      ? chart.list[hoverIndex]
      : null;

  const hoveredX =
    hoverIndex !== null && chart.points?.net?.[hoverIndex]
      ? chart.points.net[hoverIndex].x
      : null;

  const handleMouseMove = (event) => {
    if (!chart.list?.length) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const svgX = (x / rect.width) * chart.width;

    let nearestIndex = 0;
    let nearestDistance = Infinity;

    chart.points.net.forEach((point, index) => {
      const distance = Math.abs(point.x - svgX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setHoverIndex(nearestIndex);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  if (loading) {
    return (
      <div
        className={cx(
          "h-[360px] animate-pulse rounded-[22px]",
          isDark ? "bg-white/10" : "bg-slate-100"
        )}
      />
    );
  }

  if (!data?.length) {
    return (
      <div
        className={cx(
          "grid h-[360px] place-items-center rounded-[22px] border border-dashed text-xs font-semibold",
          isDark
            ? "border-white/10 bg-white/[0.03] text-white/35"
            : "border-orange-200 bg-orange-50/45 text-slate-500"
        )}
      >
        No chart data available for selected range
      </div>
    );
  }

  const legend = [
    {
      key: "net",
      label: "Net Cashflow",
      color: isDark ? "#38bdf8" : "#ea580c",
      value: hovered?.net,
    },
    {
      key: "deposits",
      label: "Deposits",
      color: "#10b981",
      value: hovered?.deposits,
    },
    {
      key: "withdrawals",
      label: "Withdrawals",
      color: "#f43f5e",
      value: hovered?.withdrawals,
    },
    {
      key: "tradingProfit",
      label: "Trading P&L",
      color: "#8b5cf6",
      value: hovered?.tradingProfit,
    },
  ];

  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-[22px] border p-4",
        isDark
          ? "border-white/10 bg-white/[0.025]"
          : "border-orange-100 bg-white/85"
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {legend.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <p
                className={cx(
                  "text-[11px] font-bold uppercase tracking-[0.14em]",
                  isDark ? "text-white/45" : "text-slate-500"
                )}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <p
          className={cx(
            "text-[11px] font-bold uppercase tracking-[0.16em]",
            isDark ? "text-white/30" : "text-slate-400"
          )}
        >
          {formatDate(data[0]?.date)} - {formatDate(data[data.length - 1]?.date)}
        </p>
      </div>

      <div className="relative">
        <svg viewBox="0 0 760 260" className="h-[320px] w-full">
          <defs>
            <linearGradient id="adminNetLine" x1="0" x2="1" y1="0" y2="0">
              <stop
                offset="0%"
                stopColor={isDark ? "#38bdf8" : "#fb923c"}
                stopOpacity="0.25"
              />
              <stop
                offset="100%"
                stopColor={isDark ? "#22d3ee" : "#ea580c"}
                stopOpacity="1"
              />
            </linearGradient>

            <linearGradient id="adminNetFill" x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                stopColor={isDark ? "#38bdf8" : "#fb923c"}
                stopOpacity="0.18"
              />
              <stop
                offset="100%"
                stopColor={isDark ? "#38bdf8" : "#fb923c"}
                stopOpacity="0"
              />
            </linearGradient>

            <filter id="adminGlowLine">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {chart.yTicks.map((tick, index) => (
            <g key={`${tick.y}-${index}`}>
              <line
                x1="54"
                x2="740"
                y1={tick.y}
                y2={tick.y}
                stroke="currentColor"
                strokeOpacity={isDark ? "0.08" : "0.12"}
              />
              <text
                x="8"
                y={tick.y + 4}
                fill="currentColor"
                opacity={isDark ? "0.38" : "0.48"}
                fontSize="10"
                fontWeight="700"
              >
                {formatCompactMoney(tick.value)}
              </text>
            </g>
          ))}

          <path d={chart.areaPath} fill="url(#adminNetFill)" />

          <path
            d={chart.paths.deposits}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />

          <path
            d={chart.paths.withdrawals}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />

          <path
            d={chart.paths.tradingProfit}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />

          <path
            d={chart.paths.net}
            fill="none"
            stroke="url(#adminNetLine)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#adminGlowLine)"
          />

          {hoveredX !== null ? (
            <line
              x1={hoveredX}
              x2={hoveredX}
              y1="20"
              y2="232"
              stroke="currentColor"
              strokeOpacity={isDark ? "0.22" : "0.28"}
              strokeDasharray="5 6"
            />
          ) : null}

          {["deposits", "withdrawals", "tradingProfit", "net"].map((key) =>
            chart.points[key].map((point, index) => {
              const isActive = hoverIndex === index;
              const colorMap = {
                deposits: "#10b981",
                withdrawals: "#f43f5e",
                tradingProfit: "#8b5cf6",
                net: isDark ? "#38bdf8" : "#ea580c",
              };

              return (
                <g key={`${key}-${point.date}-${index}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isActive ? 6.5 : key === "net" ? 4.8 : 3.3}
                    fill={colorMap[key]}
                    opacity={isActive || key === "net" ? 1 : 0.72}
                  />
                  {isActive ? (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="12"
                      fill={colorMap[key]}
                      opacity="0.14"
                    />
                  ) : null}
                </g>
              );
            })
          )}

          {chart.points.net.map((point, index) => {
            const showLabel =
              index === 0 ||
              index === chart.points.net.length - 1 ||
              hoverIndex === index;

            if (!showLabel) return null;

            return (
              <text
                key={`date-${point.date}-${index}`}
                x={point.x}
                y="252"
                textAnchor="middle"
                fill="currentColor"
                opacity={hoverIndex === index ? "0.75" : "0.45"}
                fontSize="10"
                fontWeight="700"
              >
                {formatDate(point.date)}
              </text>
            );
          })}
        </svg>

        {hovered ? (
          <div
            className={cx(
              "pointer-events-none absolute top-5 z-20 w-[230px] rounded-2xl border p-3 shadow-2xl backdrop-blur-xl transition-all duration-150",
              isDark
                ? "border-white/10 bg-slate-950/90 text-white shadow-black/30"
                : "border-orange-100 bg-white text-slate-900 shadow-orange-200/40"
            )}
            style={{
              left:
                hoveredX && hoveredX > 560
                  ? "auto"
                  : `${Math.min(Math.max((hoveredX || 80) / 7.6, 8), 66)}%`,
              right: hoveredX && hoveredX > 560 ? "18px" : "auto",
            }}
          >
            <p
              className={cx(
                "text-xs font-black uppercase tracking-[0.18em]",
                isDark ? "text-white/40" : "text-slate-500"
              )}
            >
              {formatDate(hovered.date)}
            </p>

            <div className="mt-3 space-y-2">
              {legend.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span
                      className={cx(
                        "text-xs font-semibold",
                        isDark ? "text-white/45" : "text-slate-500"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>

                  <span className="text-xs font-black">
                    {formatMoney(item.value)}
                  </span>
                </div>
              ))}

              <div
                className={cx(
                  "mt-2 flex items-center justify-between border-t pt-2",
                  isDark ? "border-white/10" : "border-orange-100"
                )}
              >
                <span
                  className={cx(
                    "text-xs font-semibold",
                    isDark ? "text-white/45" : "text-slate-500"
                  )}
                >
                  New Users
                </span>
                <span className="text-xs font-black">
                  {formatNumber(hovered.users)}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        {legend.map((item) => (
          <div
            key={`mini-${item.key}`}
            className={cx(
              "rounded-2xl border px-3 py-2",
              isDark
                ? "border-white/10 bg-white/[0.03]"
                : "border-orange-100 bg-white/90"
            )}
          >
            <p
              className={cx(
                "text-[10px] font-bold uppercase tracking-[0.14em]",
                isDark ? "text-white/30" : "text-slate-400"
              )}
            >
              {item.label}
            </p>
            <p
              className={cx(
                "mt-1 text-sm font-black",
                isDark ? "text-white/80" : "text-slate-800"
              )}
            >
              {hovered ? formatMoney(item.value) : "Hover chart"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentTrendTable({ data = [], loading = false, isDark = false }) {
  const rows = [...(data || [])].slice(-6).reverse();

  if (loading) {
    return (
      <div
        className={cx(
          "h-[280px] animate-pulse rounded-[22px]",
          isDark ? "bg-white/10" : "bg-slate-100"
        )}
      />
    );
  }

  if (!rows.length) {
    return (
      <div
        className={cx(
          "rounded-[22px] border border-dashed p-6 text-center text-xs font-semibold",
          isDark
            ? "border-white/10 bg-white/[0.03] text-white/35"
            : "border-orange-200 bg-orange-50/45 text-slate-500"
        )}
      >
        No recent trend rows
      </div>
    );
  }

  return (
    <div
      className={cx(
        "overflow-hidden rounded-[22px] border",
        isDark ? "border-white/10" : "border-orange-100"
      )}
    >
      <div className="overflow-x-auto">
        <table
          className={cx(
            "min-w-full divide-y",
            isDark ? "divide-white/10" : "divide-orange-100"
          )}
        >
          <thead className={isDark ? "bg-white/[0.04]" : "bg-orange-50/70"}>
            <tr>
              {["Date", "Deposits", "Withdrawals", "Users", "Trading P&L"].map(
                (head, index) => (
                  <th
                    key={head}
                    className={cx(
                      "px-4 py-3 text-xs font-bold uppercase tracking-[0.15em]",
                      isDark ? "text-white/35" : "text-slate-500",
                      index === 0 ? "text-left" : "text-right"
                    )}
                  >
                    {head}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody
            className={cx(
              "divide-y",
              isDark
                ? "divide-white/10 bg-white/[0.015]"
                : "divide-orange-100 bg-white"
            )}
          >
            {rows.map((row) => (
              <tr
                key={row.date}
                className={cx(
                  "transition",
                  isDark ? "hover:bg-white/[0.04]" : "hover:bg-orange-50/70"
                )}
                title={`Date: ${formatDate(row.date)} • Deposits: ${formatMoney(
                  row.deposits
                )} • Withdrawals: ${formatMoney(
                  row.withdrawals
                )} • Users: ${formatNumber(row.users)} • Trading P&L: ${formatMoney(
                  row.tradingProfit
                )}`}
              >
                <td
                  className={cx(
                    "whitespace-nowrap px-4 py-3 text-sm font-bold",
                    isDark ? "text-white/80" : "text-slate-800"
                  )}
                >
                  {formatDate(row.date)}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold text-emerald-600">
                  {formatMoney(row.deposits)}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold text-rose-600">
                  {formatMoney(row.withdrawals)}
                </td>

                <td
                  className={cx(
                    "whitespace-nowrap px-4 py-3 text-right text-sm font-bold",
                    isDark ? "text-white/55" : "text-slate-600"
                  )}
                >
                  {formatNumber(row.users)}
                </td>

                <td
                  className={cx(
                    "whitespace-nowrap px-4 py-3 text-right text-sm font-bold",
                    toNumber(row.tradingProfit) >= 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  )}
                >
                  {formatMoney(row.tradingProfit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SnapshotRow({
  label,
  value,
  icon,
  tone = "orange",
  loading = false,
  onClick,
  clickLabel = "View",
  isDark,
}) {
  const clickable = typeof onClick === "function";

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={(event) => {
        if (!clickable) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={cx(
        "rounded-[20px] border p-3 transition-all duration-300",
        isDark
          ? "border-white/10 bg-white/[0.035]"
          : "border-orange-100 bg-white/90",
        clickable &&
          "cursor-pointer hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-400/30",
        clickable && isDark && "hover:bg-white/[0.06]",
        clickable && !isDark && "hover:border-orange-300 hover:bg-white"
      )}
      title={`${label}: ${value}${clickable ? ` • Click to ${clickLabel}` : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className={cx(
              "text-[11px] font-bold uppercase tracking-[0.16em]",
              isDark ? "text-white/35" : "text-slate-500"
            )}
          >
            {label}
          </p>

          {loading ? (
            <div
              className={cx(
                "mt-2 h-6 w-20 animate-pulse rounded-lg",
                isDark ? "bg-white/10" : "bg-slate-200"
              )}
            />
          ) : (
            <h4
              className={cx(
                "mt-1 text-xl font-black",
                isDark ? "text-white" : "text-slate-950"
              )}
            >
              {value}
            </h4>
          )}

          {clickable ? (
            <p
              className={cx(
                "mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                isDark ? "text-sky-300" : "text-orange-600"
              )}
            >
              {clickLabel}
              <ChevronRight size={12} />
            </p>
          ) : null}
        </div>

        <IconBox tone={tone} isDark={isDark}>
          {icon}
        </IconBox>
      </div>
    </div>
  );
}

export default function DashboardBase() {
  const navigate = useNavigate();
  const mode = useSelector((store) => store.adminTheme?.mode || "light");
  const isDark = mode === "dark";
  const theme = getTheme(isDark);

  const [range, setRange] = useState("30d");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const goTo = (path) => {
    if (!path) return;
    navigate(path);
  };

  const loadDashboard = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      setError("");

      const data = await getReportDashboard({ range });
      setDashboard(data);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load report dashboard";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const overview = dashboard?.overview || {};
  const statuses = dashboard?.statuses || {};
  const trends = dashboard?.trends?.performance || [];

  const users = overview?.users || {};
  const cashflow = overview?.cashflow || {};
  const challenges = overview?.challenges || {};
  const trading = overview?.trading || {};
  const bonus = overview?.bonus || {};
  const insurance = overview?.insurance || {};

  const approvedDeposits = cashflow?.approvedDeposits || {};
  const approvedWithdrawals = cashflow?.approvedWithdrawals || {};
  const ibWithdrawals = cashflow?.ibWithdrawals || {};
  const openTrades = trading?.openTrades || {};
  const closedTrades = trading?.closedTrades || {};

  const netCashflow = toNumber(cashflow?.netCashflow);
  const isPositiveCashflow = netCashflow >= 0;

  return (
    <div className={cx("space-y-4", theme.pageText)}>
      <div className={cx("relative overflow-hidden rounded-[22px] border p-4", theme.heroShell)}>
        <div
          aria-hidden
          className={cx(
            "pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl",
            isDark ? "bg-blue-500/10" : "bg-orange-300/25"
          )}
        />

        <div
          aria-hidden
          className={cx(
            "pointer-events-none absolute -bottom-20 left-1/3 h-44 w-44 rounded-full blur-3xl",
            isDark ? "bg-cyan-400/10" : "bg-amber-200/30"
          )}
        />

        <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div
              className={cx(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]",
                theme.badgeGreen
              )}
            >
              <span className="h-2 w-2 rounded-full bg-current opacity-90" />
              Live Analytics
            </div>

            <h1 className={cx("mt-3 text-2xl font-black tracking-tight sm:text-3xl", theme.strongText)}>
              Report Dashboard
            </h1>

            <p className={cx("mt-1 max-w-3xl text-sm", theme.mutedText)}>
              Track users, KYC, deposits, withdrawals, challenges, trades,
              bonuses, insurance, IB payouts, and support activity.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className={cx("flex flex-wrap items-center gap-1.5 rounded-2xl border p-1.5", theme.inputShell)}>
              {RANGE_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRange(item.value)}
                  className={cx(
                    "rounded-xl px-3 py-2 text-xs font-bold transition-all duration-300",
                    range === item.value ? theme.rangeActive : theme.rangeIdle
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => loadDashboard({ silent: true })}
              disabled={refreshing || loading}
              className={cx(
                "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60",
                theme.refreshButton
              )}
            >
              <RefreshCcw size={15} className={cx(refreshing && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div
          className={cx(
            "rounded-[22px] border p-4",
            isDark
              ? "border-rose-400/20 bg-rose-500/10 text-rose-300"
              : "border-rose-200 bg-rose-50 text-rose-700"
          )}
        >
          <p className="text-sm font-bold">Unable to load dashboard</p>
          <p className="mt-1 text-xs font-medium">{error}</p>

          <button
            type="button"
            onClick={() => loadDashboard()}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white"
          >
            Try Again
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          isDark={isDark}
          loading={loading}
          title="Approved Deposits"
          value={formatMoney(approvedDeposits?.totalAmount)}
          helper={`${formatNumber(approvedDeposits?.count)} successful records`}
          icon={<Banknote size={21} />}
          tone="emerald"
          onClick={() => goTo("/admin/deposit")}
          clickLabel="Deposits"
          trend={
            <>
              <ArrowUpRight size={14} className="text-emerald-500" />
              Deposit inflow
            </>
          }
        />

        <StatCard
          isDark={isDark}
          loading={loading}
          title="Approved Withdrawals"
          value={formatMoney(approvedWithdrawals?.totalAmount)}
          helper={`${formatNumber(approvedWithdrawals?.count)} approved payouts`}
          icon={<CreditCard size={21} />}
          tone="rose"
          onClick={() => goTo("/admin/withdrawal")}
          clickLabel="Withdrawals"
          trend={
            <>
              <ArrowDownRight size={14} className="text-rose-500" />
              Client payout
            </>
          }
        />

        <StatCard
          isDark={isDark}
          loading={loading}
          title="Net Cashflow"
          value={formatMoney(netCashflow)}
          helper="Deposits minus withdrawals"
          icon={<TrendingUp size={21} />}
          tone={isPositiveCashflow ? "sky" : "rose"}
          onClick={() => goTo("/admin/deposit")}
          clickLabel="Cashflow"
          trend={
            <>
              {isPositiveCashflow ? (
                <ArrowUpRight size={14} className="text-emerald-500" />
              ) : (
                <ArrowDownRight size={14} className="text-rose-500" />
              )}
              {isPositiveCashflow ? "Positive flow" : "Negative flow"}
            </>
          }
        />

        <StatCard
          isDark={isDark}
          loading={loading}
          title="New Users"
          value={formatNumber(users?.new)}
          helper={`${formatNumber(users?.total)} total users`}
          icon={<Users size={21} />}
          tone="violet"
          onClick={() => goTo("/admin/manage-users")}
          clickLabel="Users"
          trend={
            <>
              <Activity size={14} className="text-violet-500" />
              Selected range
            </>
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          isDark={isDark}
          loading={loading}
          title="KYC Verified"
          value={formatNumber(users?.verifiedKyc)}
          helper={`${formatNumber(users?.pendingKyc)} pending profiles`}
          icon={<ShieldCheck size={21} />}
          tone="emerald"
          onClick={() => goTo("/admin/kyc-users")}
          clickLabel="KYC"
        />

        <StatCard
          isDark={isDark}
          loading={loading}
          title="Active Challenges"
          value={formatNumber(challenges?.active)}
          helper={`${formatNumber(challenges?.total)} total challenges`}
          icon={<Target size={21} />}
          tone="orange"
          onClick={() => goTo("/admin/setup-challenges")}
          clickLabel="Challenges"
        />

        <StatCard
          isDark={isDark}
          loading={loading}
          title="Trading P&L"
          value={formatMoney(closedTrades?.totalProfit)}
          helper={`${formatNumber(closedTrades?.winRate)}% win rate`}
          icon={<BarChart3 size={21} />}
          tone={toNumber(closedTrades?.totalProfit) >= 0 ? "sky" : "rose"}
          onClick={() => goTo("/admin/dashboard")}
          clickLabel="Trading"
        />

        <StatCard
          isDark={isDark}
          loading={loading}
          title="Open Trades"
          value={formatNumber(openTrades?.count)}
          helper={`${formatNumber(openTrades?.totalLot)} total lots`}
          icon={<Zap size={21} />}
          tone="slate"
          onClick={() => goTo("/admin/dashboard")}
          clickLabel="Trades"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
        <Panel
          isDark={isDark}
          title="Cashflow Performance"
          subtitle="Hover on graph points to view deposits, withdrawals, net cashflow, users, and trading P&L"
          action={
            <span
              className={cx(
                "rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]",
                isDark
                  ? "border-white/10 bg-white/[0.06] text-white/45"
                  : "border-orange-100 bg-orange-50 text-orange-700"
              )}
            >
              {range.toUpperCase()}
            </span>
          }
        >
          <CashflowChart data={trends} loading={loading} isDark={isDark} />
        </Panel>

        <div className="grid gap-4">
          <StatCard
            isDark={isDark}
            loading={loading}
            title="IB Withdrawals"
            value={formatMoney(ibWithdrawals?.totalAmount)}
            helper={`${formatNumber(ibWithdrawals?.count)} IB payout records`}
            icon={<Wallet size={21} />}
            tone="orange"
            onClick={() => goTo("/admin/ib-withdrawal")}
            clickLabel="IB Payouts"
          />

          <StatCard
            isDark={isDark}
            loading={loading}
            title="Bonus Payouts"
            value={formatMoney(bonus?.payouts?.totalAmount)}
            helper={`${formatNumber(bonus?.payouts?.count)} payout records`}
            icon={<Gift size={21} />}
            tone="violet"
            onClick={() => goTo("/admin/BonusReports")}
            clickLabel="Bonus"
          />

          <StatCard
            isDark={isDark}
            loading={loading}
            title="Insurance Claims"
            value={formatMoney(insurance?.claims?.totalAmount)}
            helper={`${formatNumber(insurance?.activeCoverage)} active coverages`}
            icon={<LifeBuoy size={21} />}
            tone="emerald"
            onClick={() => goTo("/admin/insurance-report")}
            clickLabel="Insurance"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Panel
          isDark={isDark}
          title="Deposit Status"
          subtitle="Current deposit records"
          onClick={() => goTo("/admin/deposit")}
          clickLabel="Open"
        >
          <div onClick={(event) => event.stopPropagation()}>
            <StatusList
              isDark={isDark}
              items={statuses?.deposits}
              loading={loading}
              onItemClick={() => goTo("/admin/deposit")}
            />
          </div>
        </Panel>

        <Panel
          isDark={isDark}
          title="Withdrawal Status"
          subtitle="Client payout records"
          onClick={() => goTo("/admin/withdrawal")}
          clickLabel="Open"
        >
          <div onClick={(event) => event.stopPropagation()}>
            <StatusList
              isDark={isDark}
              items={statuses?.withdrawals}
              loading={loading}
              onItemClick={() => goTo("/admin/withdrawal")}
            />
          </div>
        </Panel>

        <Panel
          isDark={isDark}
          title="Challenge Status"
          subtitle="Account challenge activity"
          onClick={() => goTo("/admin/setup-challenges")}
          clickLabel="Open"
        >
          <div onClick={(event) => event.stopPropagation()}>
            <StatusList
              isDark={isDark}
              items={statuses?.challenges}
              loading={loading}
              onItemClick={() => goTo("/admin/setup-challenges")}
            />
          </div>
        </Panel>

        <Panel
          isDark={isDark}
          title="Support Tickets"
          subtitle="User support workload"
          onClick={() => goTo("/admin/customerSupport/tickets")}
          clickLabel="Open"
        >
          <div onClick={(event) => event.stopPropagation()}>
            <StatusList
              isDark={isDark}
              items={statuses?.tickets}
              loading={loading}
              onItemClick={() => goTo("/admin/customerSupport/tickets")}
            />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          isDark={isDark}
          title="Recent Report Rows"
          subtitle="Hover table rows to view complete daily information"
        >
          <RecentTrendTable data={trends} loading={loading} isDark={isDark} />
        </Panel>

        <Panel
          isDark={isDark}
          title="Operational Snapshot"
          subtitle="Quick admin decision view"
        >
          <div className="grid gap-3">
            <SnapshotRow
              isDark={isDark}
              loading={loading}
              label="Passed Challenges"
              value={formatNumber(challenges?.passed)}
              icon={<ShieldCheck size={19} />}
              tone="emerald"
              onClick={() => goTo("/admin/setup-challenges")}
              clickLabel="Challenges"
            />

            <SnapshotRow
              isDark={isDark}
              loading={loading}
              label="Failed Challenges"
              value={formatNumber(challenges?.failed)}
              icon={<Target size={19} />}
              tone="rose"
              onClick={() => goTo("/admin/setup-challenges")}
              clickLabel="Challenges"
            />

            <SnapshotRow
              isDark={isDark}
              loading={loading}
              label="Closed Trades"
              value={formatNumber(closedTrades?.count)}
              icon={<BarChart3 size={19} />}
              tone="sky"
              onClick={() => goTo("/admin/dashboard")}
              clickLabel="Trades"
            />

            <div
              className={cx(
                "relative overflow-hidden rounded-[20px] border p-4",
                isDark
                  ? "border-white/10 bg-white/[0.05]"
                  : "border-orange-100 bg-gradient-to-r from-slate-950 to-slate-800 text-white shadow-[0_16px_50px_rgba(15,23,42,0.14)]"
              )}
            >
              <div className="relative flex items-start gap-3">
                <IconBox tone="orange" isDark={isDark}>
                  <Clock3 size={19} />
                </IconBox>

                <div>
                  <p
                    className={cx(
                      "text-[10px] font-bold uppercase tracking-[0.18em]",
                      isDark ? "text-white/35" : "text-orange-200"
                    )}
                  >
                    System Status
                  </p>

                  <h4 className="mt-1 text-base font-black text-white">
                    Report dashboard is active
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-white/60">
                    Data is loaded from your secured admin API using the
                    existing adminApi client.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}