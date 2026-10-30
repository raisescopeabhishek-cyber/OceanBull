import { useEffect, useState, useCallback, useMemo, useTransition, useRef } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useSelector } from "react-redux";
import ModernText from "../../lib/ModernText";

/* -------------------- theme helpers (RGB strings -> css) ------------------- */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) => (Number.isFinite(n) ? n : 0));
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

/* Lightweight loader (theme driven) */
const Spinner = ({ theme }: { theme: any }) => {
  const c = theme?.accent || "79 125 246";
  return (
    <div className="flex items-center justify-center py-6">
      <motion.div className="relative" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <div className="w-10 h-10 border-4 rounded-full" style={{ borderColor: rgba(c, 0.18) }} />
        <div
          className="absolute inset-0 w-10 h-10 border-4 rounded-full animate-spin"
          style={{ borderColor: rgba(c, 0.9), borderTopColor: "transparent" }}
        />
      </motion.div>
    </div>
  );
};

export default function UserDashboardTradeHistory({
  managerIndex = import.meta.env?.VITE_MANAGER_INDEX || "demo_manager",
  accounts,
  metaClient,
  defaultTab = "open",
  limit = 5,
  className = "",
  onViewAll,
}: any) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  // ✅ theme
  const themeConfig = useSelector((s: any) => s.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const radius = theme?.radius || "14px";

  // Fallback meta client
  const client = useMemo(
    () =>
      metaClient || {
        get: async () => ({ data: [] }),
      },
    [metaClient]
  );

  // Mock initial sample
  const [tradeData, setTradeData] = useState<any[]>([
    {
      MT5Account: "100001",
      Symbol: "EURUSD",
      Open_Time: "2025-08-20 10:30:00",
      Close_Time: "2025-08-20 15:45:00",
      OrderType: 1,
      BUY_SELL: 0,
      Lot: 1.5,
      Volume: 15000,
      Profit: 112.45,
    },
    {
      MT5Account: "100002",
      Symbol: "GBPUSD",
      Open_Time: "2025-08-21 09:10:00",
      Close_Time: "2025-08-21 12:30:00",
      OrderType: 0,
      BUY_SELL: 1,
      Lot: 2,
      Volume: 20000,
      Profit: -85.6,
    },
    {
      MT5Account: "100003",
      Symbol: "XAUUSD",
      Open_Time: "2025-08-22 11:15:00",
      Close_Time: null,
      BUY_SELL: 0,
      Lot: null,
      Volume: 5000,
      Profit: 45.3,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mt5Accounts = useMemo(() => (accounts && accounts.length ? accounts : ["100001", "100002", "100003"]), [accounts]);
  const currentDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const toDate = useCallback((s: any) => (s ? new Date(String(s).replace(" ", "T")) : new Date(0)), []);

  const fetchTradeData = useCallback(
    async (tradeType: "open" | "closed") => {
      setLoading(true);
      setError("");
      try {
        const bag: any[] = [];
        for (const acc of mt5Accounts) {
          let res: any;
          if (tradeType === "closed") {
            res = await client.get(
              `/GetCloseTradeAll?Manager_Index=${managerIndex}&MT5Accont=${acc}&StartTime=2021-01-01 00:00:00&EndTime=${currentDate} 23:59:59`
            );
          } else {
            res = await client.get(`/GetOpenTradeByAccount?Manager_Index=${managerIndex}&MT5Accont=${acc}`);
          }
          if (Array.isArray(res?.data)) bag.push(...res.data);
        }

        setTradeData(bag.length ? bag : []);
        if (!bag.length) setError("No recent trades found.");
      } catch (e) {
        console.error("Trade fetch error:", e);
        setError("Failed to load trades.");
        setTradeData([]);
      } finally {
        setLoading(false);
      }
    },
    [client, managerIndex, mt5Accounts, currentDate]
  );

  const handleTab = useCallback(
    (val: "open" | "closed") => {
      startTransition(() => setActiveTab(val));
      fetchTradeData(val);
    },
    [fetchTradeData]
  );

  const lastTrades = useMemo(() => {
    const key = activeTab === "closed" ? "Close_Time" : "Open_Time";
    const sorted = [...(tradeData || [])].sort((a, b) => +toDate(b?.[key]) - +toDate(a?.[key]));
    return sorted.slice(0, limit);
  }, [tradeData, activeTab, limit, toDate]);

  const formatTime = useCallback(
    (timeString: any) => {
      if (!timeString) return "—";
      const d = toDate(timeString);
      return d.toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true });
    },
    [toDate]
  );

  const getSymbolIcon = useCallback((symbol: any) => {
    const s = String(symbol || "");
    if (s.includes("XAU") || s.includes("GOLD")) return "🥇";
    if (s.includes("OIL") || s.includes("CRUDE")) return "🛢️";
    if (s.includes("USD") || s.includes("EUR") || s.includes("GBP") || s.includes("JPY")) return "💱";
    return "📈";
  }, []);

  const getProfitColor = useCallback(
    (p: number) => {
      const pos = theme?.success || theme?.primary || "15 159 110";
      const neg = theme?.danger || "220 58 58";
      if (p > 0) return rgba(pos, 0.95);
      if (p < 0) return rgba(neg, 0.95);
      return rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.75);
    },
    [theme]
  );

  const getTypePillStyle = useCallback(
    (t: any) => {
      const buy = theme?.success || theme?.primary || "15 159 110";
      const sell = theme?.danger || "220 58 58";

      const isBuy =
        activeTab === "closed" ? t?.OrderType === 1 : t?.BUY_SELL === 0;

      const c = isBuy ? buy : sell;

      return {
        label: isBuy ? "Buy" : "Sell",
        style: {
          background: rgba(c, 0.14),
          border: `1px solid ${rgba(c, 0.28)}`,
          color: rgba(c, 0.92),
          borderRadius: "999px",
        } as React.CSSProperties,
      };
    },
    [activeTab, theme]
  );

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  };

  useEffect(() => {
    // fetchTradeData(activeTab); // enable if needed
  }, []); // eslint-disable-line

  const cardStyle = {
    borderRadius: "24px",
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    background: `linear-gradient(135deg,
      ${rgba(theme?.surface2 || theme?.card || "15 24 41", 0.72)},
      ${rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.82)},
      ${rgba(theme?.surface2 || theme?.card || "15 24 41", 0.72)}
    )`,
    color: rgb(theme?.fg || "255 255 255"),
    boxShadow: `0 18px 70px ${rgba(theme?.shadowColor || "0 0 0", 0.55)}`,
    overflow: "hidden",
  } as React.CSSProperties;

  const tabBase = {
    borderRadius: radius,
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    background: "transparent",
    color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.78),
  } as React.CSSProperties;

  const tabActive = {
    background: rgba(theme?.accent || "79 125 246", 0.14),
    borderColor: rgba(theme?.ring || theme?.accent || "79 125 246", 0.35),
    color: rgba(theme?.accent || "79 125 246", 0.92),
    boxShadow: `0 0 22px ${rgba(theme?.glow || theme?.accent || "79 125 246", 0.16)}`,
  } as React.CSSProperties;

  return (
    <motion.div
      ref={containerRef}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
      style={cardStyle}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-3">
          <ModernText text="Recent Trades" />
          <span className="text-xs" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.62) }}>
            (last {limit})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => handleTab("open")} disabled={isPending} className="px-3 py-1.5 text-xs font-semibold border transition" style={activeTab === "open" ? { ...tabBase, ...tabActive } : tabBase}>
            Open
          </button>

          <button onClick={() => handleTab("closed")} disabled={isPending} className="px-3 py-1.5 text-xs font-semibold border transition" style={activeTab === "closed" ? { ...tabBase, ...tabActive } : tabBase}>
            Closed
          </button>

          {onViewAll && (
            <button
              onClick={onViewAll}
              className="ml-2 px-3 py-1.5 text-xs font-semibold border transition"
              style={tabBase}
            >
              View all
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-4">
        <AnimatePresence>{loading && <Spinner theme={theme} />}</AnimatePresence>

        <AnimatePresence>
          {!loading && error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 text-sm" style={{ color: rgba(theme?.danger || "220 58 58", 0.92) }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && !error && lastTrades.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table-stack w-full text-xs md:text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}` }}>
                  <th className="text-left py-2.5" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.72) }}>
                    Symbol
                  </th>
                  <th className="text-left py-2.5" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.72) }}>
                    Open
                  </th>
                  {activeTab === "closed" && (
                    <th className="text-left py-2.5" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.72) }}>
                      Close
                    </th>
                  )}
                  <th className="text-center py-2.5" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.72) }}>
                    Type
                  </th>
                  <th className="text-center py-2.5" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.72) }}>
                    Vol
                  </th>
                  <th className="text-right py-2.5" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.72) }}>
                    P/L
                  </th>
                </tr>
              </thead>

              <tbody>
                {lastTrades.map((t, i) => {
                  const typePill = getTypePillStyle(t);

                  return (
                    <motion.tr
                      key={`${t.MT5Account}-${t.Open_Time}-${i}`}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      className="transition"
                      style={{
                        borderBottom: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.10)}`,
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLTableRowElement).style.background = rgba(theme?.rowHover || theme?.surface3 || "19 32 52", 0.22))
                      }
                      onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                    >
                      <td data-label="Symbol" className="py-2.5 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getSymbolIcon(t.Symbol)}</span>
                          <div className="font-semibold" style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}>
                            {t.Symbol}
                          </div>
                          <div className="text-[10px]" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.6) }}>
                            #{t.MT5Account}
                          </div>
                        </div>
                      </td>

                      <td data-label="Open" className="py-2.5 pr-2" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.78) }}>
                        {formatTime(t.Open_Time)}
                      </td>

                      {activeTab === "closed" && (
                        <td data-label="Close" className="py-2.5 pr-2" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.78) }}>
                          {formatTime(t.Close_Time)}
                        </td>
                      )}

                      <td data-label="Type" className="py-2.5 text-center">
                        <span className="inline-block px-2.5 py-1 text-[11px]" style={typePill.style}>
                          {typePill.label}
                        </span>
                      </td>

                      <td data-label="Vol" className="py-2.5 text-center">
                        <span
                          className="inline-block px-2 py-0.5 font-semibold"
                          style={{
                            borderRadius: radius,
                            background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.22),
                            border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12)}`,
                            color: rgba(theme?.fg || "255 255 255", 0.86),
                          }}
                        >
                          {activeTab === "open" ? (t.Volume / 10000).toFixed(2) : t.Lot?.toFixed(2)}
                        </span>
                      </td>

                      <td data-label="P/L" className="py-2.5 text-right font-bold" style={{ color: getProfitColor(Number(t.Profit || 0)) }}>
                        ${Number(t.Profit || 0).toFixed(2)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && lastTrades.length === 0 && (
          <div className="py-8 text-center text-sm" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.62) }}>
            No recent trades.
          </div>
        )}
      </div>
    </motion.div>
  );
}
