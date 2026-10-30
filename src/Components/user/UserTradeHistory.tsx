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
} from "lucide-react";

import { userApi } from "../../utils/apiClients";
import {
  Badge,
  BlotterPage,
  Button,
  EmptyState as UiEmptyState,
} from "@/Components/ui";

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

const formatTime = (timeString: any) => {
  if (!timeString) return "N/A";

  const s = String(timeString).trim();
  const match = s.match(
    /^(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/
  );

  if (!match) return "N/A";

  const [, year, month, day, hour, minute, second] = match;

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
      className={[
        "overflow-hidden border transition-all duration-300",
        className,
      ].join(" ")}
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
          iconBg: colors.isDark
            ? "rgba(15, 159, 110,0.14)"
            : "rgba(15, 159, 110,0.1)",
          iconColor: colors.success,
          border: colors.isDark
            ? "rgba(15, 159, 110,0.22)"
            : "rgba(15, 159, 110,0.18)",
        }
      : tone === "info"
      ? {
          iconBg: colors.isDark
            ? "rgba(79, 125, 246,0.14)"
            : "rgba(42, 86, 220,0.08)",
          iconColor: colors.accent,
          border: colors.isDark
            ? "rgba(79, 125, 246,0.22)"
            : "rgba(42, 86, 220,0.14)",
        }
      : tone === "warning"
      ? {
          iconBg: colors.isDark
            ? "rgba(42, 86, 220,0.14)"
            : "rgba(42, 86, 220,0.1)",
          iconColor: colors.warning,
          border: colors.isDark
            ? "rgba(42, 86, 220,0.22)"
            : "rgba(42, 86, 220,0.16)",
        }
      : tone === "danger"
      ? {
          iconBg: colors.isDark
            ? "rgba(220, 58, 58,0.14)"
            : "rgba(220, 58, 58,0.1)",
          iconColor: colors.danger,
          border: colors.isDark
            ? "rgba(220, 58, 58,0.22)"
            : "rgba(220, 58, 58,0.16)",
        }
      : {
          iconBg: colors.isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(42, 86, 220,0.06)",
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
          className="flex h-11 w-11 items-center justify-center rounded-card border"
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
          boxShadow: !colors.isDark ? colors.inputShadow : "none",
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
      ? rgba(theme?.accent || "79 125 246", 0.95)
      : "#2a56dc";

    return {
      isDark,

      pageBg: isDark ? "#0a111f" : "#f7f9fc",

      heroBg: isDark
        ? "linear-gradient(135deg, rgba(19, 32, 52,1), rgba(15, 24, 41,1))"
        : "linear-gradient(135deg, #4f7df6, #2a56dc)",

      surface: isDark ? "rgba(15, 24, 41,0.92)" : "rgba(255,255,255,0.94)",
      surfaceSoft: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,251,235,0.75)",
      surfaceMuted: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,250,245,0.95)",

      text: isDark ? "rgba(255,255,255,0.95)" : "#0f1829",
      muted: isDark ? "rgba(255,255,255,0.65)" : "#7b879a",
      softText: isDark ? "rgba(255,255,255,0.78)" : "#4a5669",

      accent,
      accentSoft: isDark ? "rgba(79, 125, 246,0.12)" : "rgba(42, 86, 220,0.08)",

      success: isDark ? "rgba(52,211,153,0.95)" : "#0f9f6e",
      warning: isDark ? "rgba(224, 191, 108,0.95)" : "#2245b4",
      danger: isDark ? "rgba(248,113,113,0.95)" : "#dc3a3a",

      border: isDark
        ? rgba(theme?.border || "255 255 255", 0.12)
        : "rgba(42, 86, 220,0.16)",

      borderSoft: isDark
        ? rgba(theme?.border || "255 255 255", 0.08)
        : "rgba(42, 86, 220,0.10)",

      inputBorder: isDark
        ? rgba(theme?.border || "255 255 255", 0.12)
        : "rgba(42, 86, 220,0.30)",

      inputShadow: isDark
        ? "0 0 0 1px rgba(255,255,255,0.03)"
        : "0 0 0 4px rgba(42, 86, 220,0.05), 0 10px 22px rgba(42, 86, 220,0.07)",

      cardShadow: isDark
        ? "0 20px 45px rgba(0,0,0,0.28)"
        : "0 14px 30px rgba(42, 86, 220,0.07)",

      tableHead: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,251,235,0.9)",
      rowHover: isDark ? "rgba(255,255,255,0.035)" : "rgba(255,251,235,0.55)",
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
              `/server-fetch-open-trade?Manager_Index=${
                import.meta.env.VITE_MANAGER_INDEX
              }&MT5Accont=${acc}`,
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
        className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold"
        style={{
          borderColor: isBuy
            ? colors.isDark
              ? "rgba(15, 159, 110,0.22)"
              : "rgba(22,163,74,0.16)"
            : colors.isDark
            ? "rgba(220, 58, 58,0.22)"
            : "rgba(220, 58, 58,0.16)",
          background: isBuy
            ? colors.isDark
              ? "rgba(15, 159, 110,0.12)"
              : "rgba(22,163,74,0.09)"
            : colors.isDark
            ? "rgba(220, 58, 58,0.12)"
            : "rgba(220, 58, 58,0.08)",
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
        className="inline-flex rounded-card border px-3 py-2 text-sm font-bold"
        style={{
          borderColor: positive
            ? colors.isDark
              ? "rgba(15, 159, 110,0.22)"
              : "rgba(22,163,74,0.16)"
            : colors.isDark
            ? "rgba(220, 58, 58,0.22)"
            : "rgba(220, 58, 58,0.16)",
          background: positive
            ? colors.isDark
              ? "rgba(15, 159, 110,0.12)"
              : "rgba(22,163,74,0.09)"
            : colors.isDark
            ? "rgba(220, 58, 58,0.12)"
            : "rgba(220, 58, 58,0.08)",
          color: positive ? colors.success : colors.danger,
        }}
      >
        ${Math.abs(Number(profit ?? 0)).toFixed(2)}
      </span>
    );
  };

  /* ---- columns -------------------------------------------------------
     The closed tab adds close time and close price; everything else is
     shared, so the column list is built once and extended.
     ------------------------------------------------------------------ */
  const usd = (v: any) =>
    "$" +
    Number(v || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const side = (trade: any) =>
    (activeTab === "closed" ? trade?.OrderType === 1 : trade?.BUY_SELL === 0)
      ? "BUY"
      : "SELL";

  const columns = [
    {
      key: "symbol",
      header: "Symbol",
      primary: true,
      cell: (t: any) => (
        <span className="font-semibold">{t?.Symbol || "—"}</span>
      ),
    },
    {
      key: "account",
      header: "Account",
      secondary: true,
      numeric: true,
      cell: (t: any) => `#${t?.MT5Account ?? t?.Login ?? "—"}`,
    },
    {
      key: "side",
      header: "Side",
      cell: (t: any) => (
        <Badge tone={side(t) === "BUY" ? "success" : "danger"} dot={false}>
          {side(t)}
        </Badge>
      ),
    },
    {
      key: "volume",
      header: "Lots",
      align: "right",
      numeric: true,
      cell: (t: any) => Number(t?.Lot ?? t?.Volume ?? 0).toFixed(2),
    },
    {
      key: "openTime",
      header: "Open time",
      cell: (t: any) => (
        <span className="text-subtle">
          {formatTime(t?.Open_Time ?? t?.OpenTime)}
        </span>
      ),
    },
    {
      key: "openPrice",
      header: "Open price",
      align: "right",
      numeric: true,
      cell: (t: any) => t?.Open_Price ?? t?.OpenPrice ?? "—",
    },
    ...(activeTab === "closed"
      ? [
          {
            key: "closeTime",
            header: "Close time",
            cell: (t: any) => (
              <span className="text-subtle">
                {formatTime(t?.Close_Time ?? t?.CloseTime)}
              </span>
            ),
          },
          {
            key: "closePrice",
            header: "Close price",
            align: "right",
            numeric: true,
            cell: (t: any) => t?.Close_Price ?? t?.ClosePrice ?? "—",
          },
        ]
      : [
          {
            key: "currentPrice",
            header: "Current",
            align: "right",
            numeric: true,
            cell: (t: any) => t?.Current_Price ?? t?.CurrentPrice ?? "—",
          },
        ]),
    {
      key: "profit",
      header: "P/L",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (t: any) => (
        <span
          className={`font-semibold ${
            Number(t?.Profit || 0) >= 0 ? "text-profit" : "text-loss"
          }`}
        >
          {Number(t?.Profit || 0) >= 0 ? "+" : "-"}
          {usd(Math.abs(Number(t?.Profit || 0)))}
        </span>
      ),
    },
  ];

  const winRate =
    tradeStats.winningTrades + tradeStats.losingTrades > 0
      ? (
          (tradeStats.winningTrades /
            (tradeStats.winningTrades + tradeStats.losingTrades)) *
          100
        ).toFixed(0) + "%"
      : "—";

  return (
    <BlotterPage
      title="Trades"
      description="Open positions and closed trade history across your accounts."
      actions={
        <Button
          variant="secondary"
          onClick={() => fetchTradeData(activeTab)}
          loading={loading || isPending}
          leftIcon={<RefreshCcw className="h-4 w-4" />}
        >
          Refresh
        </Button>
      }
      readouts={[
        {
          key: "pl",
          label: activeTab === "open" ? "Floating P/L" : "Realised P/L",
          value:
            (tradeStats.totalProfit >= 0 ? "+" : "-") +
            usd(Math.abs(tradeStats.totalProfit)),
          tone: tradeStats.totalProfit >= 0 ? "ok" : "bad",
        },
        {
          key: "win",
          label: "Winning trades",
          value: String(tradeStats.winningTrades),
          tone: "ok",
        },
        {
          key: "lose",
          label: "Losing trades",
          value: String(tradeStats.losingTrades),
          tone: "bad",
        },
        {
          key: "rate",
          label: "Win rate",
          value: winRate,
          tone: "info",
          helper: `${tradeData.length} trades`,
        },
      ]}
      filter={{
        activeChip: activeTab,
        onChipChange: (key: any) => handleTab(key),
        chips: [
          { key: "open", label: "Open", tone: "primary" },
          { key: "closed", label: "Closed", tone: "primary" },
        ],
        summary: `${tradeData.length} ${activeTab} trades`,
      }}
      columns={columns}
      rows={tradeData}
      keyField="Ticket"
      getRowKey={(t: any, i: number) =>
        t?.Ticket ?? t?.PositionID ?? t?.Order ?? i
      }
      loading={loading}
      rowEdge={(t: any) =>
        Number(t?.Profit || 0) > 0
          ? "profit"
          : Number(t?.Profit || 0) < 0
          ? "loss"
          : null
      }
      empty={
        <UiEmptyState
          title={error ? "Could not load trades" : `No ${activeTab} trades`}
          description={
            error ||
            (activeTab === "open"
              ? "Positions you open appear here while they run."
              : "Closed trades appear here once positions are settled.")
          }
          action={
            <Button variant="soft" onClick={() => fetchTradeData(activeTab)}>
              Try again
            </Button>
          }
        />
      }
    />
  );
}
