import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CircleDollarSign,
  Gift,
  Gauge,
  RefreshCw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { userApi } from "@/utils/apiClients";

const ENDPOINT = "/dashboard/bonus-usage-summary";

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

function MiniStat({ icon, label, value, hint, isDark, tone = "default" }) {
  const toneClass =
    tone === "success"
      ? isDark
        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
        : "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "warning"
      ? isDark
        ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
        : "border-amber-200 bg-amber-50 text-amber-700"
      : tone === "danger"
      ? isDark
        ? "border-rose-400/20 bg-rose-500/10 text-rose-300"
        : "border-rose-200 bg-rose-50 text-rose-700"
      : isDark
      ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
      : "border-orange-200 bg-orange-50 text-orange-700";

  return (
    <div
      className={cx(
        "rounded-[22px] border p-4",
        isDark
          ? "border-white/10 bg-white/[0.04]"
          : "border-orange-100 bg-white/80"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cx(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
            toneClass
          )}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p
            className={cx(
              "text-xs",
              isDark ? "text-white/50" : "text-slate-500"
            )}
          >
            {label}
          </p>

          <p
            className={cx(
              "mt-1 truncate text-lg font-bold",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            {value}
          </p>

          {hint ? (
            <p
              className={cx(
                "mt-1 truncate text-[11px]",
                isDark ? "text-white/40" : "text-slate-500"
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

function BonusGauge({ gauge, isDark }) {
  const usagePercent = Math.min(
    Math.max(toNumber(gauge?.usagePercent, 0), 0),
    100
  );

  const availablePercent = Math.min(
    Math.max(toNumber(gauge?.availablePercent, 0), 0),
    100
  );

  const pointerAngle = -90 + usagePercent * 1.8;

  return (
    <div
      className={cx(
        "relative rounded-[28px] border p-5",
        isDark
          ? "border-white/10 bg-white/[0.035]"
          : "border-orange-100 bg-white/85"
      )}
    >
      <div className="flex flex-col items-center">
        <div className="relative h-[230px] w-full max-w-[360px]">
          <svg viewBox="0 0 260 175" className="h-full w-full">
            <defs>
              <linearGradient id="bonusGaugeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="52%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>

              <filter id="bonusGaugeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              d="M 35 135 A 95 95 0 0 1 225 135"
              fill="none"
              stroke={isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.08)"}
              strokeWidth="18"
              strokeLinecap="round"
              pathLength="100"
            />

            <path
              d="M 35 135 A 95 95 0 0 1 225 135"
              fill="none"
              stroke="url(#bonusGaugeGradient)"
              strokeWidth="18"
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray={`${usagePercent} ${100 - usagePercent}`}
              filter="url(#bonusGaugeGlow)"
            />

            {[0, 25, 50, 75, 100].map((item) => {
              const angle = (-180 + item * 1.8) * (Math.PI / 180);
              const x = 130 + Math.cos(angle) * 118;
              const y = 135 + Math.sin(angle) * 118;

              return (
                <text
                  key={item}
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill={isDark ? "rgba(255,255,255,0.45)" : "rgba(71,85,105,0.75)"}
                >
                  {item}
                </text>
              );
            })}

            <line
              x1="130"
              y1="135"
              x2="130"
              y2="58"
              stroke={isDark ? "#f8fafc" : "#0f172a"}
              strokeWidth="4"
              strokeLinecap="round"
              transform={`rotate(${pointerAngle} 130 135)`}
            />

            <circle
              cx="130"
              cy="135"
              r="10"
              fill={isDark ? "#f8fafc" : "#0f172a"}
            />

            <text
              x="130"
              y="113"
              textAnchor="middle"
              fontSize="30"
              fontWeight="800"
              fill={isDark ? "#ffffff" : "#0f172a"}
            >
              {usagePercent.toFixed(1)}%
            </text>

            <text
              x="130"
              y="132"
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill={isDark ? "rgba(255,255,255,0.55)" : "rgba(71,85,105,0.8)"}
            >
              Used Bonus
            </text>
          </svg>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <div
            className={cx(
              "rounded-2xl border px-4 py-3 text-center",
              isDark
                ? "border-emerald-400/20 bg-emerald-500/10"
                : "border-emerald-200 bg-emerald-50"
            )}
          >
            <p
              className={cx(
                "text-[11px] font-bold uppercase tracking-[0.14em]",
                isDark ? "text-emerald-300" : "text-emerald-700"
              )}
            >
              Available
            </p>
            <p
              className={cx(
                "mt-1 text-lg font-bold",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              {availablePercent.toFixed(1)}%
            </p>
          </div>

          <div
            className={cx(
              "rounded-2xl border px-4 py-3 text-center",
              isDark
                ? "border-rose-400/20 bg-rose-500/10"
                : "border-rose-200 bg-rose-50"
            )}
          >
            <p
              className={cx(
                "text-[11px] font-bold uppercase tracking-[0.14em]",
                isDark ? "text-rose-300" : "text-rose-700"
              )}
            >
              Used
            </p>
            <p
              className={cx(
                "mt-1 text-lg font-bold",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              {usagePercent.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthlyBonusBars({ chart, isDark }) {
  const maxValue = Math.max(
    ...chart.map((item) => toNumber(item.totalBonus)),
    1
  );

  return (
    <div
      className={cx(
        "rounded-[28px] border p-5",
        isDark
          ? "border-white/10 bg-white/[0.035]"
          : "border-orange-100 bg-white/85"
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3
            className={cx(
              "text-lg font-bold",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            Monthly Bonus Flow
          </h3>
          <p
            className={cx(
              "mt-1 text-sm",
              isDark ? "text-white/50" : "text-slate-500"
            )}
          >
            Deposit bonus + trade lot bonus
          </p>
        </div>
      </div>

      <div className="flex h-[230px] items-end gap-3 overflow-x-auto pb-2">
        {chart.map((item) => {
          const totalBonus = toNumber(item.totalBonus);
          const heightPercent = Math.max((totalBonus / maxValue) * 100, 4);

          return (
            <div
              key={item.month}
              className="flex min-w-[58px] flex-1 flex-col items-center justify-end gap-2"
            >
              <div className="flex h-[165px] w-full items-end justify-center">
                <div
                  className={cx(
                    "relative w-9 rounded-t-2xl",
                    isDark
                      ? "bg-gradient-to-t from-orange-500/35 to-orange-300"
                      : "bg-gradient-to-t from-orange-300 to-orange-500"
                  )}
                  style={{
                    height: `${heightPercent}%`,
                  }}
                >
                  {totalBonus > 0 ? (
                    <span
                      className={cx(
                        "absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold",
                        isDark ? "text-white/70" : "text-slate-600"
                      )}
                    >
                      ${money(totalBonus)}
                    </span>
                  ) : null}
                </div>
              </div>

              <p
                className={cx(
                  "text-xs font-bold",
                  isDark ? "text-white/55" : "text-slate-500"
                )}
              >
                {item.monthName}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function UserBonusUsageGauge() {
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

  const summary = payload?.summary || {
    totalBonusReceived: 0,
    availableBonus: 0,
    usedBonus: 0,
    totalDepositBonus: 0,
    totalTradeBonus: 0,
  };

  const gauge = payload?.gauge || {
    totalBonusReceived: 0,
    availableBonus: 0,
    usedBonus: 0,
    usagePercent: 0,
    availablePercent: 0,
  };

  const chart = Array.isArray(payload?.monthlyChart)
    ? payload.monthlyChart
    : [];

  const fetchBonusUsage = useCallback(async () => {
    try {
      setLoading(true);
      setErrorText("");

      const params = new URLSearchParams();
      params.set("year", String(year));
      if (mt5Account) params.set("mt5Account", mt5Account);

      const res = await userApi.get(`${ENDPOINT}?${params.toString()}`);

      setPayload(res?.data || null);
    } catch (error) {
      console.error("Bonus usage dashboard fetch failed:", error);
      setPayload(null);
      setErrorText(
        error?.response?.data?.message ||
          "Unable to load bonus usage dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, [year, mt5Account]);

  useEffect(() => {
    fetchBonusUsage();
  }, [fetchBonusUsage]);

  return (
    <motion.section
      className={cx(
        "overflow-hidden rounded-[30px] border backdrop-blur-xl",
        isDark
          ? "border-white/10 bg-white/[0.04] shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
          : "border-orange-100/80 bg-white/75 shadow-[0_20px_60px_rgba(251,146,60,0.10)]"
      )}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className={cx(
          "border-b px-5 py-5 sm:px-6",
          isDark ? "border-white/10" : "border-orange-100"
        )}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div
              className={cx(
                "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em]",
                isDark
                  ? "border-amber-400/20 bg-amber-500/10 text-amber-200"
                  : "border-orange-200 bg-orange-50 text-orange-700"
              )}
            >
              <Gauge size={14} />
              Bonus Gauge
            </div>

            <h2
              className={cx(
                "text-2xl font-bold",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              Bonus Wallet Utilization
            </h2>

            <p
              className={cx(
                "mt-2 max-w-2xl text-sm",
                isDark ? "text-white/55" : "text-slate-500"
              )}
            >
              Total bonus received, used bonus, and currently available bonus
              wallet.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[160px_220px_auto]">
            <div>
              <label
                className={cx(
                  "mb-1 block text-xs font-semibold",
                  isDark ? "text-white/50" : "text-slate-500"
                )}
              >
                Year
              </label>

              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className={cx(
                  "w-full rounded-2xl border px-3 py-3 text-sm outline-none",
                  isDark
                    ? "border-white/10 bg-slate-950/70 text-white"
                    : "border-orange-200 bg-white text-slate-900"
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
                  "mb-1 block text-xs font-semibold",
                  isDark ? "text-white/50" : "text-slate-500"
                )}
              >
                MT5 Account
              </label>

              <select
                value={mt5Account}
                onChange={(e) => setMt5Account(e.target.value)}
                className={cx(
                  "w-full rounded-2xl border px-3 py-3 text-sm outline-none",
                  isDark
                    ? "border-white/10 bg-slate-950/70 text-white"
                    : "border-orange-200 bg-white text-slate-900"
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
                onClick={fetchBonusUsage}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-orange-500" />
              <p
                className={cx(
                  "mt-3 text-sm font-semibold",
                  isDark ? "text-white/55" : "text-slate-500"
                )}
              >
                Loading bonus gauge...
              </p>
            </div>
          </div>
        ) : errorText ? (
          <div className="flex min-h-[280px] items-center justify-center text-center">
            <div>
              <p className="font-semibold text-rose-500">{errorText}</p>
              <button
                type="button"
                onClick={fetchBonusUsage}
                className="mt-4 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              <MiniStat
                isDark={isDark}
                icon={<Gift size={21} />}
                label="Total Bonus"
                value={`$${money(summary.totalBonusReceived)}`}
                hint="Deposit + trade bonus"
                tone="warning"
              />
              <MiniStat
                isDark={isDark}
                icon={<Wallet size={21} />}
                label="Available"
                value={`$${money(summary.availableBonus)}`}
                hint="Current bonus wallet"
                tone="success"
              />
              <MiniStat
                isDark={isDark}
                icon={<CircleDollarSign size={21} />}
                label="Used"
                value={`$${money(summary.usedBonus)}`}
                hint={`${money(gauge.usagePercent)}% utilized`}
                tone="danger"
              />
              <MiniStat
                isDark={isDark}
                icon={<TrendingUp size={21} />}
                label="Deposit Bonus"
                value={`$${money(summary.totalDepositBonus)}`}
                hint={`${summary.depositBonusCount || 0} approved deposit(s)`}
                tone="default"
              />
              <MiniStat
                isDark={isDark}
                icon={<CalendarDays size={21} />}
                label="Trade Bonus"
                value={`$${money(summary.totalTradeBonus)}`}
                hint={`${summary.tradeBonusCount || 0} payout(s)`}
                tone="default"
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
              <BonusGauge gauge={gauge} isDark={isDark} />
              <MonthlyBonusBars chart={chart} isDark={isDark} />
            </div>
          </>
        )}
      </div>
    </motion.section>
  );
}