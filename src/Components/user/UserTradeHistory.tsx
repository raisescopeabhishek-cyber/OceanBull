import { useEffect, useState, useCallback, useMemo, useTransition } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Clock3,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
  Wallet,
  AlertTriangle,
  BarChart3,
  CircleDollarSign,
  Gauge,
  Landmark,
} from "lucide-react";

import { userApi } from "../../utils/apiClients";

const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0")
    .trim()
    .replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) =>
    Number.isFinite(n) ? n : 0
  );
  return { r, g, b };
};

const rgb = (v: any) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgb(${r}, ${g}, ${b})`;
};

const rgba = (v: any, a = 1) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const money = (n: any) => {
  const num = Number(n ?? 0);
  return Number.isFinite(num)
    ? num.toLocaleString(undefined, { maximumFractionDigits: 5 })
    : "0";
};

const formatTime = (timeString) => {
  if (!timeString) return "N/A";

  const s = String(timeString).trim();

  // supports: "YYYY.MM.DD HH:mm:ss"
  const match = s.match(/^(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);

  if (!match) return "N/A";

  const [, year, month, day, hour, minute, second] = match;

  // create date safely
  const d = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );

  if (Number.isNaN(d.getTime())) return "N/A";

  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
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

function SectionCard({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={["overflow-hidden border transition-all duration-300", className].join(" ")}
      style={{
        borderRadius: "20px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  colors,
  tone = "default",
}: any) {
  const toneStyles =
    tone === "success"
      ? {
          iconBg: colors.isDark ? "rgba(16,185,129,0.14)" : "rgba(16,185,129,0.1)",
          iconColor: colors.success,
          border: colors.isDark ? "rgba(16,185,129,0.22)" : "rgba(16,185,129,0.18)",
        }
      : tone === "info"
      ? {
          iconBg: colors.isDark ? "rgba(59,130,246,0.14)" : "rgba(59,130,246,0.09)",
          iconColor: colors.accent,
          border: colors.isDark ? "rgba(59,130,246,0.22)" : "rgba(59,130,246,0.16)",
        }
      : tone === "warning"
      ? {
          iconBg: colors.isDark ? "rgba(245,158,11,0.14)" : "rgba(245,158,11,0.1)",
          iconColor: colors.warning,
          border: colors.isDark ? "rgba(245,158,11,0.22)" : "rgba(245,158,11,0.16)",
        }
      : tone === "danger"
      ? {
          iconBg: colors.isDark ? "rgba(239,68,68,0.14)" : "rgba(239,68,68,0.1)",
          iconColor: colors.danger,
          border: colors.isDark ? "rgba(239,68,68,0.22)" : "rgba(239,68,68,0.16)",
        }
      : {
          iconBg: colors.isDark ? "rgba(255,255,255,0.05)" : "rgba(17,24,39,0.04)",
          iconColor: colors.text,
          border: colors.border,
        };

  return (
    <SectionCard
      className="p-4"
      style={{
        background: colors.surface,
        borderColor: colors.border,
        boxShadow: colors.cardShadow,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl border"
          style={{
            background: toneStyles.iconBg,
            color: toneStyles.iconColor,
            borderColor: toneStyles.border,
          }}
        >
          {icon}
        </div>

        <div>
          <div className="text-xs" style={{ color: colors.muted }}>
            {label}
          </div>

          <div className="text-lg font-bold" style={{ color: colors.text }}>
            {value}
          </div>

          {hint ? (
            <div className="mt-1 text-[11px]" style={{ color: colors.softText }}>
              {hint}
            </div>
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}

function EmptyState({
  title = "No data found",
  subtitle = "Try another filter or refresh the records.",
  colors,
}: any) {
  return (
    <div className="py-12 text-center">
      <div
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border"
        style={{
          borderColor: colors.border,
          background: colors.surfaceSoft,
          color: colors.softText,
        }}
      >
        ⚪
      </div>

      <p className="font-semibold" style={{ color: colors.text }}>
        {title}
      </p>

      <p className="mt-1 text-sm" style={{ color: colors.muted }}>
        {subtitle}
      </p>
    </div>
  );
}

export default function UserTradeHistory() {
  const mode = useSelector((store: any) => store.userTheme?.mode || "light");
  const loggedUser = useSelector((store: any) => store?.user?.loggedUser);
  const themeConfig = useSelector((store: any) => store?.user?.themeConfig);

  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const isDark = mode === "dark";

  const colors = useMemo(() => {
    const accent = isDark
      ? rgba(theme?.accent || "96 165 250", 0.95)
      : rgb(theme?.accent || "37 99 235");

    return {
      isDark,
      pageBg: isDark ? "#0b1120" : "#f8fafc",
      heroBg: isDark
        ? "linear-gradient(135deg, rgba(30,41,59,1), rgba(15,23,42,1))"
        : "linear-gradient(135deg, #2563eb, #1d4ed8)",
      surface: isDark ? "rgba(15,23,42,0.92)" : "#ffffff",
      surfaceSoft: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
      surfaceMuted: isDark ? "rgba(255,255,255,0.03)" : "#f1f5f9",
      text: isDark ? "rgba(255,255,255,0.95)" : "#0f172a",
      muted: isDark ? "rgba(255,255,255,0.65)" : "#64748b",
      softText: isDark ? "rgba(255,255,255,0.78)" : "#475569",
      accent,
      accentSoft: isDark ? "rgba(96,165,250,0.12)" : "rgba(37,99,235,0.08)",
      success: isDark ? "rgba(52,211,153,0.95)" : "#16a34a",
      warning: isDark ? "rgba(251,191,36,0.95)" : "#d97706",
      danger: isDark ? "rgba(248,113,113,0.95)" : "#dc2626",
      border: isDark
        ? rgba(theme?.border || "255 255 255", 0.12)
        : "rgba(15,23,42,0.08)",
      borderSoft: isDark
        ? rgba(theme?.border || "255 255 255", 0.08)
        : "rgba(15,23,42,0.06)",
      cardShadow: isDark
        ? "0 20px 45px rgba(0,0,0,0.28)"
        : "0 10px 30px rgba(15,23,42,0.06)",
      tableHead: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
    };
  }, [isDark, theme]);

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

    const winningTrades = tradeData.filter((t) => Number(t?.Profit) > 0).length;
    const losingTrades = tradeData.filter((t) => Number(t?.Profit) < 0).length;

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
    const isBuy = activeTab === "closed" ? trade?.OrderType === 1 : trade?.BUY_SELL === 0;

    return (
      <span
        className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold"
        style={{
          borderColor: isBuy
            ? colors.isDark
              ? "rgba(16,185,129,0.22)"
              : "rgba(22,163,74,0.16)"
            : colors.isDark
            ? "rgba(239,68,68,0.22)"
            : "rgba(239,68,68,0.16)",
          background: isBuy
            ? colors.isDark
              ? "rgba(16,185,129,0.12)"
              : "rgba(22,163,74,0.09)"
            : colors.isDark
            ? "rgba(239,68,68,0.12)"
            : "rgba(239,68,68,0.08)",
          color: isBuy ? colors.success : colors.danger,
        }}
      >
        {isBuy ? "BUY" : "SELL"}
      </span>
    );
  };

  const renderProfit = (profit: number) => {
    const positive = Number(profit ?? 0) >= 0;

    return (
      <span
        className="inline-flex rounded-xl border px-3 py-2 text-sm font-bold"
        style={{
          borderColor: positive
            ? colors.isDark
              ? "rgba(16,185,129,0.22)"
              : "rgba(22,163,74,0.16)"
            : colors.isDark
            ? "rgba(239,68,68,0.22)"
            : "rgba(239,68,68,0.16)",
          background: positive
            ? colors.isDark
              ? "rgba(16,185,129,0.12)"
              : "rgba(22,163,74,0.09)"
            : colors.isDark
            ? "rgba(239,68,68,0.12)"
            : "rgba(239,68,68,0.08)",
          color: positive ? colors.success : colors.danger,
        }}
      >
        ${Math.abs(Number(profit ?? 0)).toFixed(2)}
      </span>
    );
  };

  return (
    <div className="min-h-screen w-full" style={{ background: colors.pageBg }}>
      <div className="w-full" style={{ background: colors.heroBg }}>
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-5 lg:px-6">
          <div className="leading-none">
            <div className="text-[28px] font-bold text-white sm:text-[32px]">
              Trade History
            </div>
            <div className="mt-2 text-sm text-white/80">
              Track open and closed trades across your linked MT5 accounts
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-6 text-sm text-white/90 md:flex">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                MT5 Activity
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchTradeData(activeTab)}
              disabled={loading}
              className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15"
              style={{ borderRadius: "14px" }}
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Trades
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-5 lg:px-6">
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard
            colors={colors}
            icon={<TrendingUp className="h-5 w-5" />}
            label="Total P/L"
            value={`$${Number(tradeStats.totalProfit).toFixed(2)}`}
            hint="Combined trade result"
            tone={Number(tradeStats.totalProfit) >= 0 ? "success" : "danger"}
          />
          <StatCard
            colors={colors}
            icon={<Activity className="h-5 w-5" />}
            label="Trades"
            value={tradeData.length}
            hint={activeTab === "open" ? "Live open trades" : "Closed trade records"}
            tone="info"
          />
          <StatCard
            colors={colors}
            icon={<CircleDollarSign className="h-5 w-5" />}
            label="Winning Trades"
            value={tradeStats.winningTrades}
            hint="Profitable positions"
            tone="success"
          />
          <StatCard
            colors={colors}
            icon={<Gauge className="h-5 w-5" />}
            label="Losing Trades"
            value={tradeStats.losingTrades}
            hint="Negative positions"
            tone="warning"
          />
        </div>

        <SectionCard
          className="mb-5 p-4"
          style={{
            background: colors.surface,
            borderColor: colors.border,
            boxShadow: colors.cardShadow,
          }}
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleTab("open")}
              disabled={isPending}
              className="rounded-2xl border px-5 py-3 text-sm font-semibold transition-all"
              style={{
                borderColor: activeTab === "open" ? colors.accent : colors.border,
                background: activeTab === "open" ? colors.accentSoft : colors.surface,
                color: activeTab === "open" ? colors.accent : colors.text,
              }}
            >
              Open Trades
            </button>

            <button
              type="button"
              onClick={() => handleTab("closed")}
              disabled={isPending}
              className="rounded-2xl border px-5 py-3 text-sm font-semibold transition-all"
              style={{
                borderColor: activeTab === "closed" ? colors.accent : colors.border,
                background: activeTab === "closed" ? colors.accentSoft : colors.surface,
                color: activeTab === "closed" ? colors.accent : colors.text,
              }}
            >
              Closed Trades
            </button>
          </div>
        </SectionCard>

        <SectionCard
          style={{
            background: colors.surface,
            borderColor: colors.border,
            boxShadow: colors.cardShadow,
          }}
        >
          <div className="border-b px-5 py-4 sm:px-6" style={{ borderColor: colors.border }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" style={{ color: colors.accent }} />
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: colors.muted }}
                  >
                    trading · history · records
                  </span>
                </div>

                <h2
                  className="text-2xl font-bold"
                  style={{ color: colors.text, fontFamily: "'Poppins', sans-serif" }}
                >
                  {activeTab === "open" ? "Open Trades" : "Closed Trades"}
                </h2>

                <p className="mt-1 text-sm" style={{ color: colors.muted }}>
                  Detailed trade activity across your linked MT5 accounts.
                </p>
              </div>
            </div>
          </div>

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
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{
                      background: colors.accentSoft,
                      color: colors.accent,
                    }}
                  >
                    <Loader2 size={30} className="animate-spin" />
                  </div>
                  <p style={{ color: colors.muted }}>Fetching trade data...</p>
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
                    className="max-w-md rounded-[24px] border p-6 text-center"
                    style={{
                      borderColor: colors.isDark
                        ? "rgba(239,68,68,0.18)"
                        : "rgba(239,68,68,0.16)",
                      background: colors.isDark
                        ? "rgba(239,68,68,0.08)"
                        : "rgba(254,242,242,0.92)",
                    }}
                  >
                    <div
                      className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                      style={{
                        background: colors.isDark
                          ? "rgba(239,68,68,0.12)"
                          : "rgba(254,226,226,1)",
                        color: colors.danger,
                      }}
                    >
                      <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: colors.text }}>
                      Unable to load trades
                    </h3>
                    <p className="mt-2 text-sm" style={{ color: colors.muted }}>
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
                  <EmptyState
                    title="No trades found"
                    subtitle="Start trading to see your history here."
                    colors={colors}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="hidden overflow-x-auto xl:block">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr style={{ background: colors.tableHead, borderBottom: `1px solid ${colors.border}` }}>
                          <th className="px-4 py-4 text-left font-semibold" style={{ color: colors.muted }}>Account</th>
                          <th className="px-4 py-4 text-left font-semibold" style={{ color: colors.muted }}>Symbol</th>
                          <th className="px-4 py-4 text-left font-semibold" style={{ color: colors.muted }}>Open Time</th>
                          {activeTab === "closed" && (
                            <th className="px-4 py-4 text-left font-semibold" style={{ color: colors.muted }}>Close Time</th>
                          )}
                          <th className="px-4 py-4 text-left font-semibold" style={{ color: colors.muted }}>Open Price</th>
                          {activeTab === "closed" && (
                            <th className="px-4 py-4 text-left font-semibold" style={{ color: colors.muted }}>Close Price</th>
                          )}
                          <th className="px-4 py-4 text-left font-semibold" style={{ color: colors.muted }}>Type</th>
                          <th className="px-4 py-4 text-left font-semibold" style={{ color: colors.muted }}>Volume</th>
                          <th className="px-4 py-4 text-left font-semibold" style={{ color: colors.muted }}>P/L</th>
                        </tr>
                      </thead>

                      <tbody>
                        {tradeData.map((trade, index) => (
                          <tr
                            key={`${trade?.MT5Account || "acc"}-${index}`}
                            style={{ borderBottom: `1px solid ${colors.borderSoft}` }}
                          >
                            <td className="px-4 py-4 font-medium" style={{ color: colors.text }}>
                              #{trade?.MT5Account}
                            </td>

                            <td className="px-4 py-4 font-medium" style={{ color: colors.text }}>
                              <span className="mr-2">{getSymbolIcon(trade?.Symbol)}</span>
                              {trade?.Symbol}
                            </td>

                            <td className="px-4 py-4 text-xs" style={{ color: colors.muted }}>
                              {trade?.Open_Time}
                            </td>

                            {activeTab === "closed" && (
                              <td className="px-4 py-4 text-xs" style={{ color: colors.muted }}>
                                {formatTime(trade?.Close_Time)}
                              </td>
                            )}

                            <td className="px-4 py-4" style={{ color: colors.text }}>
                              {trade?.Open_Price}
                            </td>

                            {activeTab === "closed" && (
                              <td className="px-4 py-4" style={{ color: colors.text }}>
                                {trade?.Open_Price}
                              </td>
                            )}

                            <td className="px-4 py-4">{renderTradeType(trade)}</td>

                            <td className="px-4 py-4 font-medium" style={{ color: colors.text }}>
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

                  <div className="grid grid-cols-1 gap-4 xl:hidden">
                    {tradeData.map((trade, index) => {
                      const isBuy = activeTab === "closed" ? trade?.OrderType === 1 : trade?.BUY_SELL === 0;

                      return (
                        <div
                          key={`${trade?.MT5Account || "acc"}-${index}`}
                          className="rounded-[24px] border p-4"
                          style={{
                            borderColor: colors.border,
                            background: colors.surfaceSoft,
                          }}
                        >
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold" style={{ color: colors.text }}>
                                #{trade?.MT5Account}
                              </p>
                              <p className="mt-1 text-xs" style={{ color: colors.muted }}>
                                {getSymbolIcon(trade?.Symbol)} {trade?.Symbol}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className="flex h-9 w-9 items-center justify-center rounded-xl"
                                style={{
                                  background: isBuy
                                    ? colors.isDark
                                      ? "rgba(16,185,129,0.12)"
                                      : "rgba(22,163,74,0.09)"
                                    : colors.isDark
                                    ? "rgba(239,68,68,0.12)"
                                    : "rgba(239,68,68,0.08)",
                                  color: isBuy ? colors.success : colors.danger,
                                }}
                              >
                                {isBuy ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                              </span>
                              {renderTradeType(trade)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border px-4 py-3" style={{ borderColor: colors.border, background: colors.surface }}>
                              <p className="mb-1 text-xs uppercase tracking-[0.12em]" style={{ color: colors.muted }}>
                                Open Time
                              </p>
                              <p className="flex items-start gap-2 text-sm font-medium" style={{ color: colors.text }}>
                                <Clock3 size={14} className="mt-0.5" />
                                <span>{formatTime(trade?.Open_Time)}</span>
                              </p>
                            </div>

                            {activeTab === "closed" && (
                              <div className="rounded-2xl border px-4 py-3" style={{ borderColor: colors.border, background: colors.surface }}>
                                <p className="mb-1 text-xs uppercase tracking-[0.12em]" style={{ color: colors.muted }}>
                                  Close Time
                                </p>
                                <p className="flex items-start gap-2 text-sm font-medium" style={{ color: colors.text }}>
                                  <Clock3 size={14} className="mt-0.5" />
                                  <span>{formatTime(trade?.Close_Time)}</span>
                                </p>
                              </div>
                            )}

                            <div className="rounded-2xl border px-4 py-3" style={{ borderColor: colors.border, background: colors.surface }}>
                              <p className="mb-1 text-xs uppercase tracking-[0.12em]" style={{ color: colors.muted }}>
                                Open Price
                              </p>
                              <p className="text-sm font-semibold" style={{ color: colors.text }}>
                                ${money(trade?.Open_Price)}
                              </p>
                            </div>

                            {activeTab === "closed" && (
                              <div className="rounded-2xl border px-4 py-3" style={{ borderColor: colors.border, background: colors.surface }}>
                                <p className="mb-1 text-xs uppercase tracking-[0.12em]" style={{ color: colors.muted }}>
                                  Close Price
                                </p>
                                <p className="text-sm font-semibold" style={{ color: colors.text }}>
                                  ${money(trade?.Close_Price)}
                                </p>
                              </div>
                            )}

                            <div className="rounded-2xl border px-4 py-3" style={{ borderColor: colors.border, background: colors.surface }}>
                              <p className="mb-1 text-xs uppercase tracking-[0.12em]" style={{ color: colors.muted }}>
                                Volume
                              </p>
                              <p className="text-sm font-semibold" style={{ color: colors.text }}>
                                {activeTab === "open"
                                  ? (Number(trade?.Volume ?? 0) / 10000).toFixed(2)
                                  : Number(trade?.Lot ?? 0).toFixed(2)}
                              </p>
                            </div>

                            <div className="rounded-2xl border px-4 py-3" style={{ borderColor: colors.border, background: colors.surface }}>
                              <p className="mb-1 text-xs uppercase tracking-[0.12em]" style={{ color: colors.muted }}>
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
        </SectionCard>
      </div>
    </div>
  );
}
