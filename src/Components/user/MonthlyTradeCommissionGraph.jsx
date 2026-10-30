import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  LineChart,
  RefreshCw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { userApi } from "@/utils/apiClients";

const ENDPOINT = "/dashboard/monthly-trade-commission-graph";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const toNumber = (value, fallback = 0) => {
  const num = Number(value ?? fallback);
  return Number.isFinite(num) ? num : fallback;
};

const money = (value) => {
  return toNumber(value).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
};

const currentYear = new Date().getFullYear();

const yearOptions = Array.from({ length: 6 }).map((_, index) => {
  return currentYear - index;
});

function StatCard({ icon, label, value, hint, isDark, tone = "default" }) {
  const toneClass =
    tone === "success"
      ?"border-success bg-success-soft text-success"
      : tone === "warning"
      ?"border-line bg-primary-soft text-primary"
      :"border-line bg-primary-soft text-primary";

  return (
    <div
      className={cx(
        "rounded-card border p-4 backdrop-blur-xl","border-line bg-surface-2"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cx(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-card border",
            toneClass
          )}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p
            className={cx(
              "text-xs","text-subtle"
            )}
          >
            {label}
          </p>

          <p
            className={cx(
              "mt-1 truncate text-lg font-bold","text-text"
            )}
          >
            {value}
          </p>

          {hint ? (
            <p
              className={cx(
                "mt-1 truncate text-[11px]","text-subtle"
              )}
            >
              {hint}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ isDark }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center text-center">
      <div>
        <div
          className={cx(
            "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border","border-line bg-surface-2 text-subtle"
          )}
        >
          <BarChart3 size={28} />
        </div>

        <p
          className={cx(
            "text-base font-bold","text-text"
          )}
        >
          No monthly graph data found
        </p>

        <p
          className={cx(
            "mt-2 text-sm","text-subtle"
          )}
        >
          Try another year or account.
        </p>
      </div>
    </div>
  );
}

function CombinedGraph({ chart, isDark }) {
  const width = 1200;
  const height = 390;
  const paddingLeft = 58;
  const paddingRight = 30;
  const paddingTop = 35;
  const paddingBottom = 58;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const maxCommission = Math.max(
    ...chart.map((item) => toNumber(item.totalCommission)),
    1
  );

  const maxTrades = Math.max(...chart.map((item) => toNumber(item.tradeCount)), 1);

  const barGap = 16;
  const barWidth = innerWidth / 12 - barGap;

  const getX = (index) => {
    return paddingLeft + index * (innerWidth / 12) + barGap / 2;
  };

  const getCommissionY = (value) => {
    return paddingTop + innerHeight - (toNumber(value) / maxCommission) * innerHeight;
  };

  const getTradeY = (value) => {
    return paddingTop + innerHeight - (toNumber(value) / maxTrades) * innerHeight;
  };

  const commissionPoints = chart.map((item, index) => {
    const x = getX(index) + barWidth / 2;
    const y = getCommissionY(item.totalCommission);
    return `${x},${y}`;
  });

  const tradePoints = chart.map((item, index) => {
    const x = getX(index) + barWidth / 2;
    const y = getTradeY(item.tradeCount);
    return `${x},${y}`;
  });

  const gridLines = Array.from({ length: 5 }).map((_, index) => {
    const y = paddingTop + (innerHeight / 4) * index;
    return y;
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-[920px] w-full"
        role="img"
      >
        <defs>
          <linearGradient id="commissionBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? "#4f7df6" : "#2a56dc"} stopOpacity="0.95" />
            <stop offset="100%" stopColor={isDark ? "#22d3ee" : "#4f7df6"} stopOpacity="0.35" />
          </linearGradient>

          <linearGradient id="tradeLineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0f9f6e" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>

          <linearGradient id="profitLineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#179da6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>

          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          rx="24"
          fill={isDark ? "rgba(255,255,255,0.02)" : "rgba(255,247,237,0.55)"}
        />

        {gridLines.map((y, index) => (
          <g key={index}>
            <line
              x1={paddingLeft}
              x2={width - paddingRight}
              y1={y}
              y2={y}
              stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(42, 86, 220,0.14)"}
              strokeDasharray="8 8"
            />

            <text
              x={paddingLeft - 12}
              y={y + 4}
              textAnchor="end"
              fontSize="12"
              fill={isDark ? "rgba(255,255,255,0.45)" : "rgba(71,85,105,0.75)"}
            >
              ${money(maxCommission - (maxCommission / 4) * index)}
            </text>
          </g>
        ))}

        {chart.map((item, index) => {
          const x = getX(index);
          const commissionHeight =
            (toNumber(item.totalCommission) / maxCommission) * innerHeight;
          const y = paddingTop + innerHeight - commissionHeight;

          return (
            <g key={item.month}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={commissionHeight}
                rx="10"
                fill="url(#commissionBarGradient)"
              />

              <text
                x={x + barWidth / 2}
                y={height - 26}
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill={isDark ? "rgba(255,255,255,0.72)" : "rgba(15, 24, 41,0.75)"}
              >
                {item.monthName}
              </text>

              <text
                x={x + barWidth / 2}
                y={Math.max(y - 8, 18)}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill={isDark ? "rgba(147,197,253,0.95)" : "rgba(42, 86, 220,0.95)"}
              >
                {toNumber(item.totalCommission) > 0
                  ? `$${money(item.totalCommission)}`
                  : ""}
              </text>
            </g>
          );
        })}

        <polyline
          points={tradePoints.join(" ")}
          fill="none"
          stroke="url(#tradeLineGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#softGlow)"
        />

        {chart.map((item, index) => {
          const [x, y] = tradePoints[index].split(",").map(Number);

          return (
            <g key={`trade-dot-${item.month}`}>
              <circle
                cx={x}
                cy={y}
                r="6"
                fill="#0f9f6e"
                stroke={isDark ? "#0f1829" : "#ffffff"}
                strokeWidth="3"
              />
              <text
                x={x}
                y={y - 12}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#0f9f6e"
              >
                {toNumber(item.tradeCount) > 0 ? item.tradeCount : ""}
              </text>
            </g>
          );
        })}

        <polyline
          points={commissionPoints.join(" ")}
          fill="none"
          stroke={isDark ? "rgba(79, 125, 246,0.45)" : "rgba(42, 86, 220,0.35)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="6 8"
        />

        <text
          x={paddingLeft}
          y={height - 8}
          fontSize="12"
          fill={isDark ? "rgba(255,255,255,0.45)" : "rgba(71,85,105,0.65)"}
        >
          Bars = Commission Amount
        </text>

        <text
          x={paddingLeft + 210}
          y={height - 8}
          fontSize="12"
          fill="#0f9f6e"
        >
          Line = Trade Count
        </text>
      </svg>
    </div>
  );
}

export default function MonthlyTradeCommissionGraph() {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const loggedUser = useSelector((store) => store.user?.loggedUser);

  const isDark = mode === "dark";

  const [year, setYear] = useState(currentYear);
  const [mt5Account, setMt5Account] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [payload, setPayload] = useState(null);

  const accountOptions = useMemo(() => {
    return Array.isArray(loggedUser?.accounts)
      ? loggedUser.accounts
          .map((item) => String(item?.accountNumber || "").trim())
          .filter(Boolean)
      : [];
  }, [loggedUser?.accounts]);

  const chart = useMemo(() => {
    return Array.isArray(payload?.chart) ? payload.chart : [];
  }, [payload]);

  const summary = payload?.summary || {
    totalTrades: 0,
    totalLotSize: 0,
    totalProfit: 0,
    totalCommission: 0,
    totalCommissionTrades: 0,
  };

  const hasData = chart.some((item) => {
    return (
      toNumber(item.tradeCount) > 0 ||
      toNumber(item.totalCommission) > 0 ||
      toNumber(item.totalProfit) !== 0 ||
      toNumber(item.totalLotSize) > 0
    );
  });

  const fetchGraph = useCallback(async () => {
    try {
      setLoading(true);
      setErrorText("");

      const params = new URLSearchParams();
      params.set("year", String(year));
      if (mt5Account) params.set("mt5Account", mt5Account);

      const res = await userApi.get(`${ENDPOINT}?${params.toString()}`);

      setPayload(res?.data || null);
    } catch (error) {
      console.error("Monthly graph fetch failed:", error);
      setPayload(null);
      setErrorText(
        error?.response?.data?.message ||
          "Unable to load monthly trade and commission graph."
      );
    } finally {
      setLoading(false);
    }
  }, [year, mt5Account]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  return (
    <motion.section
      className={cx(
        "overflow-hidden rounded-card border backdrop-blur-xl","border-line bg-surface-2"
      )}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className={cx(
          "border-b px-5 py-5 sm:px-6","border-line"
        )}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div
              className={cx(
                "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em]","border-line bg-primary-soft text-primary"
              )}
            >
              <LineChart size={14} />
              Monthly Graph
            </div>

            <h2
              className={cx(
                "text-2xl font-bold","text-text"
              )}
            >
              Monthly Trades & Commission
            </h2>

            <p
              className={cx(
                "mt-2 max-w-2xl text-sm","text-subtle"
              )}
            >
              Month-wise overview of your trade count, lot size, profit, and IB
              commission.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[160px_220px_auto]">
            <div>
              <label
                className={cx(
                  "mb-1 block text-xs font-semibold","text-subtle"
                )}
              >
                Year
              </label>

              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className={cx(
                  "w-full rounded-card border px-3 py-3 text-sm outline-none","border-line bg-surface text-text"
                )}
              >
                {yearOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={cx(
                  "mb-1 block text-xs font-semibold","text-subtle"
                )}
              >
                MT5 Account
              </label>

              <select
                value={mt5Account}
                onChange={(e) => setMt5Account(e.target.value)}
                className={cx(
                  "w-full rounded-card border px-3 py-3 text-sm outline-none","border-line bg-surface text-text"
                )}
              >
                <option value="">All Accounts</option>
                {accountOptions.map((account) => (
                  <option key={account} value={account}>
                    {account}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={fetchGraph}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-card bg-primary px-4 py-3 text-sm font-bold text-text transition hover:bg-primary disabled:opacity-60"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            isDark={isDark}
            icon={<BarChart3 size={21} />}
            label="Total Trades"
            value={summary.totalTrades || 0}
            hint="Closed trades"
            tone="default"
          />
          <StatCard
            isDark={isDark}
            icon={<Wallet size={21} />}
            label="Total Lots"
            value={money(summary.totalLotSize)}
            hint="Volume traded"
            tone="warning"
          />
          <StatCard
            isDark={isDark}
            icon={<TrendingUp size={21} />}
            label="Total Profit"
            value={`$${money(summary.totalProfit)}`}
            hint="Closed trade profit"
            tone="success"
          />
          <StatCard
            isDark={isDark}
            icon={<CircleDollarSign size={21} />}
            label="Commission"
            value={`$${money(summary.totalCommission)}`}
            hint="IB commission"
            tone="success"
          />
          <StatCard
            isDark={isDark}
            icon={<CalendarDays size={21} />}
            label="Year"
            value={year}
            hint={mt5Account ? `Account ${mt5Account}` : "All accounts"}
            tone="default"
          />
        </div>

        <div
          className={cx(
            "mt-5 overflow-hidden rounded-card border","border-line bg-surface-2"
          )}
        >
          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="text-center">
                <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p
                  className={cx(
                    "mt-3 text-sm font-semibold","text-subtle"
                  )}
                >
                  Loading monthly graph...
                </p>
              </div>
            </div>
          ) : errorText ? (
            <div className="flex min-h-[320px] items-center justify-center p-5 text-center">
              <div>
                <p className="font-semibold text-danger">{errorText}</p>
                <button
                  type="button"
                  onClick={fetchGraph}
                  className="mt-4 rounded-card bg-primary px-5 py-3 text-sm font-bold text-text"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : !hasData ? (
            <EmptyChart isDark={isDark} />
          ) : (
            <CombinedGraph chart={chart} isDark={isDark} />
          )}
        </div>

      </div>
    </motion.section>
  );
}