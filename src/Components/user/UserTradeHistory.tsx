import { useEffect, useState, useCallback, useMemo, useTransition } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Wallet,
  AlertTriangle,
} from "lucide-react";

import { userApi } from "../../utils/apiClients";

const money = (n: any) => {
  const num = Number(n ?? 0);
  return Number.isFinite(num)
    ? num.toLocaleString(undefined, { maximumFractionDigits: 5 })
    : "0";
};

const formatTime = (timeString: string) => {
  if (!timeString) return "N/A";
  const s = String(timeString);
  const d = new Date(s.includes(" ") && !s.includes("T") ? s.replace(" ", "T") : s);
  if (Number.isNaN(d.getTime())) return "N/A";

  const date = d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return `${date}, ${time}`;
};

const getSymbolIcon = (symbol: string) => {
  if (!symbol) return "📈";
  const s = String(symbol).toUpperCase();
  if (s.includes("XAU") || s.includes("GOLD")) return "🥇";
  if (s.includes("OIL") || s.includes("CRUDE")) return "🛢️";
  if (
    s.includes("USD") ||
    s.includes("EUR") ||
    s.includes("GBP") ||
    s.includes("JPY")
  ) {
    return "💱";
  }
  return "📈";
};

export default function UserTradeHistory() {
  const mode = useSelector((store: any) => store.userTheme?.mode || "light");
  const loggedUser = useSelector((store: any) => store?.user?.loggedUser);

  const isDark = mode === "dark";

  const [activeTab, setActiveTab] = useState<"open" | "closed">("open");
  const [isPending, startTransition] = useTransition();

  const accounts = useMemo(
    () =>
      (loggedUser?.accounts || [])
        .map((a: any) => a?.accountNumber ?? a?.MT5Account ?? a)
        .filter(Boolean),
    [loggedUser]
  );

  const [tradeData, setTradeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const tradeStats = useMemo(() => {
    if (!Array.isArray(tradeData) || tradeData.length === 0) {
      return {
        totalProfit: 0,
        winningTrades: 0,
        losingTrades: 0,
      };
    }

    const totalProfit = tradeData.reduce(
      (sum, t) => sum + (Number(t?.Profit) || 0),
      0
    );

    const winningTrades = tradeData.filter(
      (t) => Number(t?.Profit) > 0
    ).length;

    const losingTrades = tradeData.filter(
      (t) => Number(t?.Profit) < 0
    ).length;

    return {
      totalProfit,
      winningTrades,
      losingTrades,
    };
  }, [tradeData]);

  const fetchTradeData = useCallback(
    async (tradeType: "open" | "closed", signal?: AbortSignal) => {
      if (!loggedUser?._id) {
        setTradeData([]);
        setError("Please sign in to view your trade history.");
        return;
      }

      if (!accounts.length) {
        setTradeData([]);
        setError("No linked MT5 accounts found.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const allTrades: any[] = [];

        for (const acc of accounts) {
          let res;

          if (tradeType === "closed") {
            res = await userApi.get(
              `/server-fetch-close-trade?MT5Accont=${acc}&EndTime=${currentDate}`,
              signal ? { signal } : undefined
            );
          } else {
            res = await userApi.get(
              `/server-fetch-open-trade?Manager_Index=${import.meta.env.VITE_MANAGER_INDEX}&MT5Accont=${acc}`,
              signal ? { signal } : undefined
            );
          }

          if (Array.isArray(res?.data?.data)) {
            allTrades.push(...res.data.data);
          }
        }

        allTrades.sort((a, b) => {
          const at = new Date(a?.Close_Time || a?.Open_Time || 0).getTime();
          const bt = new Date(b?.Close_Time || b?.Open_Time || 0).getTime();
          return bt - at;
        });

        setTradeData(allTrades);

        if (!allTrades.length) {
          setError("No data found.");
        }
      } catch (e: any) {
        if (e?.name === "CanceledError" || e?.message === "canceled") return;
        setTradeData([]);
        setError("Failed to fetch trade data. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [accounts, currentDate, loggedUser?._id]
  );

  const handleTab = useCallback((next: "open" | "closed") => {
    startTransition(() => setActiveTab(next));
  }, []);

  const accountsKey = useMemo(() => JSON.stringify(accounts), [accounts]);

  useEffect(() => {
    const controller = new AbortController();
    fetchTradeData(activeTab, controller.signal);
    return () => controller.abort();
  }, [activeTab, accountsKey, loggedUser?._id, fetchTradeData]);

  const renderTradeType = (trade: any) => {
    const isBuy =
      activeTab === "closed" ? trade?.OrderType === 1 : trade?.BUY_SELL === 0;

    return (
      <span
        className={[
          "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
          isBuy
            ? isDark
              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
            : isDark
            ? "border-rose-400/20 bg-rose-500/10 text-rose-300"
            : "border-rose-200 bg-rose-50 text-rose-700",
        ].join(" ")}
      >
        {isBuy ? "BUY" : "SELL"}
      </span>
    );
  };

  const renderProfit = (profit: number) => {
    const positive = Number(profit ?? 0) >= 0;

    return (
      <span
        className={[
          "inline-flex rounded-xl border px-3 py-2 text-sm font-bold",
          positive
            ? isDark
              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
            : isDark
            ? "border-rose-400/20 bg-rose-500/10 text-rose-300"
            : "border-rose-200 bg-rose-50 text-rose-700",
        ].join(" ")}
      >
        ${Math.abs(Number(profit ?? 0)).toFixed(2)}
      </span>
    );
  };

  return (
    <div className="min-h-[calc(100vh-260px)] p-1 sm:p-2 md:p-4">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div
          className={[
            "mb-6 overflow-hidden rounded-[28px] border backdrop-blur-xl",
            isDark
              ? "border-white/10 bg-white/[0.045] shadow-[0_20px_70px_rgba(0,0,0,0.45)]"
              : "border-orange-100/80 bg-white/70 shadow-[0_18px_50px_rgba(251,146,60,0.10)]",
          ].join(" ")}
        >
          <div
            className={[
              "relative px-4 py-5 sm:px-6 sm:py-6",
              isDark
                ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]"
                : "bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,247,240,0.80))]",
            ].join(" ")}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div
                  className={[
                    "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                    isDark
                      ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                      : "border-orange-200 bg-orange-50 text-orange-700",
                  ].join(" ")}
                >
                  <BarChart3 size={14} />
                  Trade Activity
                </div>

                <h1 className="text-2xl font-bold sm:text-3xl">
                  Trade History
                </h1>

                <p
                  className={[
                    "mt-2 max-w-2xl text-sm sm:text-[15px]",
                    isDark ? "text-white/55" : "text-slate-600",
                  ].join(" ")}
                >
                  Track your open and closed trades across linked MT5 accounts
                  with profit, volume, symbol, and execution time details.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div
                  className={[
                    "rounded-2xl border px-4 py-3 backdrop-blur-md",
                    isDark
                      ? "border-white/10 bg-white/[0.04]"
                      : "border-orange-100 bg-white/70",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        isDark
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-emerald-50 text-emerald-700",
                      ].join(" ")}
                    >
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p
                        className={[
                          "text-[11px] uppercase tracking-[0.16em]",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        Total P/L
                      </p>
                      <p className="text-sm font-semibold">
                        ${Number(tradeStats.totalProfit).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={[
                    "rounded-2xl border px-4 py-3 backdrop-blur-md",
                    isDark
                      ? "border-white/10 bg-white/[0.04]"
                      : "border-orange-100 bg-white/70",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        isDark
                          ? "bg-blue-500/10 text-blue-300"
                          : "bg-orange-50 text-orange-700",
                      ].join(" ")}
                    >
                      <Activity size={18} />
                    </div>
                    <div>
                      <p
                        className={[
                          "text-[11px] uppercase tracking-[0.16em]",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        Trades
                      </p>
                      <p className="text-sm font-semibold">{tradeData.length}</p>
                    </div>
                  </div>
                </div>

                <div
                  className={[
                    "rounded-2xl border px-4 py-3 backdrop-blur-md",
                    isDark
                      ? "border-white/10 bg-white/[0.04]"
                      : "border-orange-100 bg-white/70",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        isDark
                          ? "bg-cyan-500/10 text-cyan-300"
                          : "bg-amber-50 text-amber-700",
                      ].join(" ")}
                    >
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p
                        className={[
                          "text-[11px] uppercase tracking-[0.16em]",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        Win / Loss
                      </p>
                      <p className="text-sm font-semibold">
                        {tradeStats.winningTrades}/{tradeStats.losingTrades}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={[
                "pointer-events-none absolute inset-x-0 top-0 h-px",
                isDark
                  ? "bg-gradient-to-r from-transparent via-blue-300/30 to-transparent"
                  : "bg-gradient-to-r from-transparent via-orange-300/70 to-transparent",
              ].join(" ")}
            />
          </div>
        </div>

        {/* Tabs */}
        <div
          className={[
            "mb-6 rounded-[28px] border p-4 sm:p-5 backdrop-blur-xl",
            isDark
              ? "border-white/10 bg-white/[0.035]"
              : "border-orange-100/80 bg-white/60",
          ].join(" ")}
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleTab("open")}
              disabled={isPending}
              className={[
                "rounded-2xl border px-5 py-3 text-sm font-semibold transition-all",
                activeTab === "open"
                  ? isDark
                    ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                    : "border-orange-200 bg-orange-50 text-orange-700"
                  : isDark
                  ? "border-white/10 bg-white/[0.03] text-white/70"
                  : "border-slate-200 bg-white text-slate-600",
              ].join(" ")}
            >
              Open Trades
            </button>

            <button
              type="button"
              onClick={() => handleTab("closed")}
              disabled={isPending}
              className={[
                "rounded-2xl border px-5 py-3 text-sm font-semibold transition-all",
                activeTab === "closed"
                  ? isDark
                    ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                    : "border-orange-200 bg-orange-50 text-orange-700"
                  : isDark
                  ? "border-white/10 bg-white/[0.03] text-white/70"
                  : "border-slate-200 bg-white text-slate-600",
              ].join(" ")}
            >
              Closed Trades
            </button>

            <button
              type="button"
              onClick={() => fetchTradeData(activeTab)}
              disabled={loading}
              className={[
                "inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all",
                isDark
                  ? "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.05]"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table Shell */}
        <div
          className={[
            "overflow-hidden rounded-[28px] border backdrop-blur-xl",
            isDark
              ? "border-white/10 bg-white/[0.035] shadow-[0_20px_70px_rgba(0,0,0,0.40)]"
              : "border-orange-100/80 bg-white/65 shadow-[0_16px_50px_rgba(251,146,60,0.10)]",
          ].join(" ")}
        >
          <div
            className={[
              "h-px",
              isDark
                ? "bg-gradient-to-r from-transparent via-white/20 to-transparent"
                : "bg-gradient-to-r from-transparent via-orange-200 to-transparent",
            ].join(" ")}
          />

          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[300px] flex-col items-center justify-center"
                >
                  <div
                    className={[
                      "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl",
                      isDark
                        ? "bg-blue-500/10 text-blue-300"
                        : "bg-orange-100 text-orange-700",
                    ].join(" ")}
                  >
                    <Loader2 size={30} className="animate-spin" />
                  </div>
                  <p className={isDark ? "text-white/60" : "text-slate-600"}>
                    Fetching trade data...
                  </p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex min-h-[260px] items-center justify-center"
                >
                  <div
                    className={[
                      "max-w-md rounded-[24px] border p-6 text-center",
                      isDark
                        ? "border-rose-400/15 bg-rose-500/10"
                        : "border-rose-200 bg-rose-50",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl",
                        isDark
                          ? "bg-rose-500/10 text-rose-300"
                          : "bg-rose-100 text-rose-700",
                      ].join(" ")}
                    >
                      <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold">Unable to load trades</h3>
                    <p
                      className={[
                        "mt-2 text-sm",
                        isDark ? "text-white/55" : "text-slate-600",
                      ].join(" ")}
                    >
                      {error}
                    </p>
                  </div>
                </motion.div>
              ) : tradeData.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[260px] items-center justify-center"
                >
                  <div className="text-center">
                    <div
                      className={[
                        "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl",
                        isDark
                          ? "bg-white/[0.04] text-white/55"
                          : "bg-slate-100 text-slate-500",
                      ].join(" ")}
                    >
                      <Wallet size={24} />
                    </div>
                    <h3 className="text-lg font-bold">No trades found</h3>
                    <p
                      className={[
                        "mt-2 text-sm",
                        isDark ? "text-white/55" : "text-slate-600",
                      ].join(" ")}
                    >
                      Start trading to see your history here.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  {/* Desktop Table */}
                  <div className="hidden overflow-x-auto xl:block">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr
                          className={
                            isDark
                              ? "border-b border-white/10 bg-white/[0.03]"
                              : "border-b border-orange-100 bg-orange-50/60"
                          }
                        >
                          <th className="px-4 py-4 text-left font-semibold">Account</th>
                          <th className="px-4 py-4 text-left font-semibold">Symbol</th>
                          <th className="px-4 py-4 text-left font-semibold">Open Time</th>
                          {activeTab === "closed" && (
                            <th className="px-4 py-4 text-left font-semibold">Close Time</th>
                          )}
                          <th className="px-4 py-4 text-left font-semibold">Open Price</th>
                          {activeTab === "closed" && (
                            <th className="px-4 py-4 text-left font-semibold">Close Price</th>
                          )}
                          <th className="px-4 py-4 text-left font-semibold">Type</th>
                          <th className="px-4 py-4 text-left font-semibold">Volume</th>
                          <th className="px-4 py-4 text-left font-semibold">P/L</th>
                        </tr>
                      </thead>

                      <tbody>
                        {tradeData.map((trade, index) => (
                          <tr
                            key={`${trade?.MT5Account || "acc"}-${index}`}
                            className={
                              isDark
                                ? "border-b border-white/5 hover:bg-white/[0.03]"
                                : "border-b border-slate-100 hover:bg-orange-50/30"
                            }
                          >
                            <td className="px-4 py-4 font-medium">
                              #{trade?.MT5Account}
                            </td>

                            <td className="px-4 py-4 font-medium">
                              <span className="mr-2">{getSymbolIcon(trade?.Symbol)}</span>
                              {trade?.Symbol}
                            </td>

                            <td className="px-4 py-4 text-xs">
                              {formatTime(trade?.Open_Time)}
                            </td>

                            {activeTab === "closed" && (
                              <td className="px-4 py-4 text-xs">
                                {formatTime(trade?.Close_Time)}
                              </td>
                            )}

                            <td className="px-4 py-4">${money(trade?.Open_Price)}</td>

                            {activeTab === "closed" && (
                              <td className="px-4 py-4">
                                ${money(trade?.Close_Price)}
                              </td>
                            )}

                            <td className="px-4 py-4">{renderTradeType(trade)}</td>

                            <td className="px-4 py-4 font-medium">
                              {activeTab === "open"
                                ? (Number(trade?.Volume ?? 0) / 10000).toFixed(2)
                                : Number(trade?.Lot ?? 0).toFixed(2)}
                            </td>

                            <td className="px-4 py-4">{renderProfit(Number(trade?.Profit))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile / Tablet Cards */}
                  <div className="grid grid-cols-1 gap-4 xl:hidden">
                    {tradeData.map((trade, index) => {
                      const isBuy =
                        activeTab === "closed"
                          ? trade?.OrderType === 1
                          : trade?.BUY_SELL === 0;

                      return (
                        <div
                          key={`${trade?.MT5Account || "acc"}-${index}`}
                          className={[
                            "rounded-[24px] border p-4",
                            isDark
                              ? "border-white/10 bg-white/[0.03]"
                              : "border-orange-100/70 bg-white/75",
                          ].join(" ")}
                        >
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">
                                #{trade?.MT5Account}
                              </p>
                              <p
                                className={[
                                  "mt-1 text-xs",
                                  isDark ? "text-white/50" : "text-slate-500",
                                ].join(" ")}
                              >
                                {getSymbolIcon(trade?.Symbol)} {trade?.Symbol}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={[
                                  "flex h-9 w-9 items-center justify-center rounded-xl",
                                  isBuy
                                    ? isDark
                                      ? "bg-emerald-500/10 text-emerald-300"
                                      : "bg-emerald-50 text-emerald-700"
                                    : isDark
                                    ? "bg-rose-500/10 text-rose-300"
                                    : "bg-rose-50 text-rose-700",
                                ].join(" ")}
                              >
                                {isBuy ? (
                                  <ArrowUpRight size={18} />
                                ) : (
                                  <ArrowDownLeft size={18} />
                                )}
                              </span>
                              {renderTradeType(trade)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div
                              className={[
                                "rounded-2xl border px-4 py-3",
                                isDark
                                  ? "border-white/10 bg-white/[0.03]"
                                  : "border-slate-100 bg-slate-50/70",
                              ].join(" ")}
                            >
                              <p
                                className={[
                                  "mb-1 text-xs uppercase tracking-[0.12em]",
                                  isDark ? "text-white/40" : "text-slate-500",
                                ].join(" ")}
                              >
                                Open Time
                              </p>
                              <p className="text-sm font-medium flex items-start gap-2">
                                <Clock3 size={14} className="mt-0.5" />
                                <span>{formatTime(trade?.Open_Time)}</span>
                              </p>
                            </div>

                            {activeTab === "closed" && (
                              <div
                                className={[
                                  "rounded-2xl border px-4 py-3",
                                  isDark
                                    ? "border-white/10 bg-white/[0.03]"
                                    : "border-slate-100 bg-slate-50/70",
                                ].join(" ")}
                              >
                                <p
                                  className={[
                                    "mb-1 text-xs uppercase tracking-[0.12em]",
                                    isDark ? "text-white/40" : "text-slate-500",
                                  ].join(" ")}
                                >
                                  Close Time
                                </p>
                                <p className="text-sm font-medium flex items-start gap-2">
                                  <Clock3 size={14} className="mt-0.5" />
                                  <span>{formatTime(trade?.Close_Time)}</span>
                                </p>
                              </div>
                            )}

                            <div
                              className={[
                                "rounded-2xl border px-4 py-3",
                                isDark
                                  ? "border-white/10 bg-white/[0.03]"
                                  : "border-slate-100 bg-slate-50/70",
                              ].join(" ")}
                            >
                              <p
                                className={[
                                  "mb-1 text-xs uppercase tracking-[0.12em]",
                                  isDark ? "text-white/40" : "text-slate-500",
                                ].join(" ")}
                              >
                                Open Price
                              </p>
                              <p className="text-sm font-semibold">
                                ${money(trade?.Open_Price)}
                              </p>
                            </div>

                            {activeTab === "closed" && (
                              <div
                                className={[
                                  "rounded-2xl border px-4 py-3",
                                  isDark
                                    ? "border-white/10 bg-white/[0.03]"
                                    : "border-slate-100 bg-slate-50/70",
                                ].join(" ")}
                              >
                                <p
                                  className={[
                                    "mb-1 text-xs uppercase tracking-[0.12em]",
                                    isDark ? "text-white/40" : "text-slate-500",
                                  ].join(" ")}
                                >
                                  Close Price
                                </p>
                                <p className="text-sm font-semibold">
                                  ${money(trade?.Close_Price)}
                                </p>
                              </div>
                            )}

                            <div
                              className={[
                                "rounded-2xl border px-4 py-3",
                                isDark
                                  ? "border-white/10 bg-white/[0.03]"
                                  : "border-slate-100 bg-slate-50/70",
                              ].join(" ")}
                            >
                              <p
                                className={[
                                  "mb-1 text-xs uppercase tracking-[0.12em]",
                                  isDark ? "text-white/40" : "text-slate-500",
                                ].join(" ")}
                              >
                                Volume
                              </p>
                              <p className="text-sm font-semibold">
                                {activeTab === "open"
                                  ? (Number(trade?.Volume ?? 0) / 10000).toFixed(2)
                                  : Number(trade?.Lot ?? 0).toFixed(2)}
                              </p>
                            </div>

                            <div
                              className={[
                                "rounded-2xl border px-4 py-3",
                                isDark
                                  ? "border-white/10 bg-white/[0.03]"
                                  : "border-slate-100 bg-slate-50/70",
                              ].join(" ")}
                            >
                              <p
                                className={[
                                  "mb-1 text-xs uppercase tracking-[0.12em]",
                                  isDark ? "text-white/40" : "text-slate-500",
                                ].join(" ")}
                              >
                                Profit / Loss
                              </p>
                              <div>{renderProfit(Number(trade?.Profit))}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}