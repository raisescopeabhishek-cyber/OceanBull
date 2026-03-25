import { useEffect, useState, useCallback, useMemo, useTransition, useRef } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion, useInView } from "framer-motion";
import ModernHeading from "../lib/ModernHeading";
import DynamicLoder from "../Loader/DynamicLoder";
import { backendApi,  userApi } from "../../utils/apiClients";
import { FloatingOrbs } from "../../utils/FloatingOrbs";
import { AnimatedGrid } from "../../utils/AnimatedGrid";
import { FloatingParticles } from "../../utils/FloatingParticles";

/* -------------------- theme helpers (RGB strings -> css) ------------------- */
const safeRgbParts = (v) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) =>
    Number.isFinite(n) ? n : 0
  );
  return { r, g, b };
};

const rgb = (v) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgb(${r}, ${g}, ${b})`;
};

const rgba = (v, a = 1) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/* ------------------------------ UTILS ------------------------------------ */
const money = (n) => {
  const num = Number(n ?? 0);
  return Number.isFinite(num) ? num.toLocaleString(undefined, { maximumFractionDigits: 5 }) : "0";
};

const formatTime = (timeString) => {
  if (!timeString) return "N/A";
  // supports "YYYY-MM-DD HH:mm:ss" and ISO
  const s = String(timeString);
  const d = new Date(s.includes(" ") && !s.includes("T") ? s.replace(" ", "T") : s);
  if (Number.isNaN(d.getTime())) return "N/A";
  const date = d.toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  return `${date}, ${time}`;
};

const getSymbolIcon = (symbol) => {
  if (!symbol) return "📈";
  const s = String(symbol).toUpperCase();
  if (s.includes("XAU") || s.includes("GOLD")) return "🥇";
  if (s.includes("OIL") || s.includes("CRUDE")) return "🛢️";
  if (s.includes("USD") || s.includes("EUR") || s.includes("GBP") || s.includes("JPY")) return "💱";
  return "📈";
};

/* --------------------------- ANIMATION VARIANTS -------------------------- */
const containerVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.98, rotateX: 8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.9,
      ease: [0.25, 0.46, 0.45, 0.94],
      when: "beforeChildren",
      staggerChildren: 0.06,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, rotateX: -6 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: "spring", stiffness: 120, damping: 18, duration: 0.7 },
  },
  hover: { y: -4, rotateX: 3, transition: { duration: 0.25 } },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.02, 1],
    opacity: [0.85, 1, 0.85],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};

const tableVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, staggerChildren: 0.015, delayChildren: 0.25 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -40, rotateY: -8, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 160, damping: 22, duration: 0.55 },
  },
};

const tabVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 220, damping: 20 } },
  tap: { scale: 0.96 },
};

/* --------------------------- COMPONENT ----------------------------------- */
export default function UserTradeHistory() {
  const [activeTab, setActiveTab] = useState("open"); // "open" | "closed"
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-100px" });

  const loggedUser = useSelector((s) => s?.user?.loggedUser);

  // ✅ theme from redux
  const themeConfig = useSelector((s) => s.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const C = useMemo(
    () => ({
      bg: theme?.bg || "0 0 0",
      fg: theme?.fg || "255 255 255",
      mutedFg: theme?.mutedFg || theme?.fg || "255 255 255",
      border: theme?.border || theme?.inputBorder || "255 255 255",
      card: theme?.card || "18 18 18",
      surface1: theme?.surface1 || theme?.bg || "0 0 0",
      surface2: theme?.surface2 || theme?.card || "18 18 18",
      accent: theme?.accent || "59 130 246",
      accentFg: theme?.accentFg || theme?.fg || "255 255 255",
      primary: theme?.primary || theme?.accent || "147 51 234",
      primaryFg: theme?.primaryFg || "0 0 0",
      success: theme?.success || "34 197 94",
      warning: theme?.warning || "234 179 8",
      danger: theme?.danger || "244 63 94",
      ring: theme?.ring || theme?.accent || "59 130 246",
      glow: theme?.glow || theme?.accent || "59 130 246",
      radius: theme?.radius || "18px",
      effectsEnabled: theme?.effectsEnabled ?? true,
    }),
    [theme]
  );

  const accounts = useMemo(
    () =>
      (loggedUser?.accounts || [])
        .map((a) => a?.accountNumber ?? a?.MT5Account ?? a) // tolerate different shapes
        .filter(Boolean),
    [loggedUser]
  );

  const [tradeData, setTradeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const tradeStats = useMemo(() => {
    if (!Array.isArray(tradeData) || tradeData.length === 0) {
      return { totalProfit: 0, winningTrades: 0, losingTrades: 0 };
    }
    const totalProfit = tradeData.reduce((sum, t) => sum + (Number(t?.Profit) || 0), 0);
    const winningTrades = tradeData.filter((t) => Number(t?.Profit) > 0).length;
    const losingTrades = tradeData.filter((t) => Number(t?.Profit) < 0).length;
    return { totalProfit, winningTrades, losingTrades };
  }, [tradeData]);

  const profitColor = useCallback(
    (p) => (Number(p ?? 0) >= 0 ? rgba(C.success, 0.95) : rgba(C.danger, 0.95)),
    [C]
  );

  const profitPillStyle = useCallback(
    (p) => {
      const col = Number(p ?? 0) >= 0 ? C.success : C.danger;
      return {
        background: rgba(col, 0.14),
        border: `1px solid ${rgba(col, 0.28)}`,
      };
    },
    [C]
  );

  const glowStyle = useMemo(
    () => ({
      borderRadius: C.radius,
      border: `1px solid ${rgba(C.border, 0.14)}`,
      background: `linear-gradient(90deg, ${rgba(C.surface2, 0.30)}, ${rgba(C.surface1, 0.65)}, ${rgba(C.surface2, 0.30)})`,
      boxShadow: `0 0 46px ${rgba(C.glow, 0.22)}`,
    }),
    [C]
  );

  const pageBgStyle = useMemo(
    () => ({
      minHeight: "100vh",
      background: `radial-gradient(1200px 600px at 18% 0%, ${rgba(C.glow, 0.16)}, transparent 60%),
                   radial-gradient(900px 480px at 82% 12%, ${rgba(C.primary, 0.12)}, transparent 55%),
                   linear-gradient(135deg, ${rgb(C.bg)}, ${rgb(C.surface1)}, ${rgb(C.bg)})`,
      color: rgb(C.fg),
    }),
    [C]
  );

  const cardShellStyle = useMemo(
    () => ({
      borderRadius: "28px",
      border: `1px solid ${rgba(C.border, 0.18)}`,
      background: `linear-gradient(135deg, ${rgba(C.surface1, 0.86)}, ${rgba(C.bg, 0.92)}, ${rgba(C.surface1, 0.86)})`,
      boxShadow: `0 0 110px ${rgba(C.glow, 0.14)}, inset 0 0 90px ${rgba("0 0 0", 0.35)}`,
    }),
    [C]
  );

  const headerBarStyle = useMemo(
    () => ({
      borderBottom: `1px solid ${rgba(C.border, 0.14)}`,
      background: `linear-gradient(90deg, transparent, ${rgba(C.accent, 0.05)}, transparent)`,
    }),
    [C]
  );

  const tableHeadStyle = useMemo(
    () => ({
      background: `linear-gradient(90deg, ${rgba(C.accent, 0.12)}, ${rgba(C.primary, 0.10)})`,
      borderBottom: `1px solid ${rgba(C.border, 0.18)}`,
    }),
    [C]
  );

  const thStyle = useMemo(
    () => ({
      color: rgba(C.accentFg || C.fg, 0.78),
      letterSpacing: "0.08em",
    }),
    [C]
  );

  const fetchTradeData = useCallback(
    async (tradeType, signal) => {
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
      setError(null);

      try {
        const agg = [];

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
          if (Array.isArray(res?.data?.data)) agg.push(...res.data?.data);
        }

        agg.sort((a, b) => {
          const at = new Date(a?.Close_Time || a?.Open_Time || 0).getTime();
          const bt = new Date(b?.Close_Time || b?.Open_Time || 0).getTime();
          return bt - at;
        });

        if (agg.length) {
          setTradeData(agg);
          setError(null);
        } else {
          setTradeData([]);
          setError("No data found. Please try again.");
        }
      } catch (e) {
        if (e?.name === "CanceledError" || e?.message === "canceled") return;
        setTradeData([]);
        setError("Failed to fetch trade data. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [accounts, currentDate, loggedUser?._id]
  );

  const handleTab = useCallback(
    (next) => {
      startTransition(() => setActiveTab(next));
    },
    [startTransition]
  );

  // Fetch when tab or accounts change
  const accountsKey = useMemo(() => JSON.stringify(accounts), [accounts]);
  useEffect(() => {
    const controller = new AbortController();
    fetchTradeData(activeTab, controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, accountsKey, loggedUser?._id]);

  const tabs = useMemo(
    () => [
      { key: "open", label: "📊 OPEN TRADES" },
      { key: "closed", label: "📈 CLOSED TRADES" },
    ],
    []
  );

  const tabBtnStyle = (isActive) => {
    if (isActive) {
      return {
        border: `1px solid ${rgba(C.success, 0.35)}`,
        background: `linear-gradient(90deg, ${rgba(C.success, 0.92)}, ${rgba(C.accent, 0.92)})`,
        color: rgb(C.primaryFg || "0 0 0"),
        boxShadow: `0 14px 36px ${rgba(C.success, 0.22)}`,
      };
    }
    return {
      border: `1px solid ${rgba(C.border, 0.18)}`,
      background: rgba(C.surface2, 0.14),
      color: rgba(C.accentFg || C.fg, 0.82),
    };
  };

  const statCardStyle = (col) => ({
    background: `linear-gradient(90deg, ${rgba(col, 0.14)}, ${rgba(col, 0.08)})`,
    border: `1px solid ${rgba(col, 0.22)}`,
    borderRadius: "18px",
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden"
      style={pageBgStyle}
    >
      {/* ✅ effects (toggle works by unmounting) */}
      {C.effectsEnabled && (
        <>
          <AnimatedGrid />
          <FloatingOrbs />
          <FloatingParticles />
        </>
      )}

      <div className="relative z-10 p-6 lg:p-10" ref={containerRef}>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          whileHover="hover"
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={pulseVariants} animate="animate" className="text-center mb-8">
            <motion.div style={glowStyle} className="inline-block p-4">
              <ModernHeading text="⚡ TRADE HISTORY ⚡" />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-2 font-mono text-sm tracking-wider"
                style={{ color: rgba(C.accent, 0.9) }}
              >
                TRADING PERFORMANCE
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Main Card */}
          <motion.div variants={cardVariants} className="overflow-hidden" style={cardShellStyle}>
            {/* Tabs + Stats */}
            <div className="p-6" style={headerBarStyle}>
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                {/* Tabs */}
                <div className="flex flex-wrap gap-4 justify-center">
                  {tabs.map((t) => {
                    const isActive = activeTab === t.key;
                    return (
                      <motion.button
                        key={t.key}
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        whileTap="tap"
                        whileHover={{ scale: 1.04 }}
                        className="px-6 py-3 font-bold font-mono text-sm tracking-wider transition-all duration-300"
                        style={{ borderRadius: C.radius, ...tabBtnStyle(isActive) }}
                        disabled={isPending}
                        onClick={() => handleTab(t.key)}
                      >
                        {isPending && activeTab !== t.key ? "⏳ " : ""}
                        {t.label}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="flex gap-4 flex-wrap justify-center">
                  <motion.div
                    className="px-4 py-3 text-center backdrop-blur-sm min-w-[150px]"
                    style={statCardStyle(C.success)}
                    whileHover={{ scale: 1.03, rotateY: 3 }}
                  >
                    <div className="font-bold text-lg" style={{ color: profitColor(tradeStats.totalProfit) }}>
                      ${Number(tradeStats.totalProfit).toFixed(2)}
                    </div>
                    <div className="text-sm font-mono" style={{ color: rgba(C.mutedFg, 0.55) }}>
                      TOTAL P/L
                    </div>
                  </motion.div>

                  <motion.div
                    className="px-4 py-3 text-center backdrop-blur-sm min-w-[150px]"
                    style={statCardStyle(C.accent)}
                    whileHover={{ scale: 1.03, rotateY: -3 }}
                  >
                    <div className="font-bold text-lg" style={{ color: rgba(C.accentFg || C.fg, 0.9) }}>
                      {tradeStats.winningTrades}/{tradeStats.losingTrades}
                    </div>
                    <div className="text-sm font-mono" style={{ color: rgba(C.mutedFg, 0.55) }}>
                      WIN / LOSS
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Loading */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-16"
                >
                  <DynamicLoder />
                  <motion.p
                    className="mt-6 font-mono tracking-widest"
                    style={{ color: rgba(C.accent, 0.9) }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    FETCHING DATA...
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-12"
                >
                  <div
                    className="rounded-2xl p-8 max-w-md mx-auto"
                    style={{
                      background: rgba(C.danger, 0.10),
                      border: `1px solid ${rgba(C.danger, 0.28)}`,
                    }}
                  >
                    <div className="text-6xl mb-4">⚠️</div>
                    <p className="font-mono" style={{ color: rgba(C.danger, 0.92) }}>
                      {error}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Table */}
            <AnimatePresence mode="wait">
              {!loading && !error && Array.isArray(tradeData) && tradeData.length > 0 && (
                <motion.div
                  key={activeTab}
                  variants={tableVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: 20 }}
                  className="p-6"
                >
                  <div
                    className="overflow-x-auto user-custom-scrollbar"
                    style={{
                      borderRadius: "20px",
                      border: `1px solid ${rgba(C.border, 0.16)}`,
                      background: rgba(C.surface2, 0.08),
                    }}
                  >
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={tableHeadStyle}>
                          {[
                            "🔢 ACCOUNT",
                            "💎 SYMBOL",
                            "⏱️ OPEN TIME",
                            ...(activeTab === "closed" ? ["🛑 CLOSE TIME"] : []),
                            "🎯 OPEN PRICE",
                            ...(activeTab === "closed" ? ["💰 CLOSE PRICE"] : []),
                            "📈 TYPE",
                            "📊 VOLUME",
                            "⚡ P/L",
                          ].map((h) => (
                            <th key={h} className="text-center py-4 px-4 font-mono font-bold" style={thStyle}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <motion.tbody variants={tableVariants}>
                        {tradeData.map((t, i) => {
                          const isBuy =
                            activeTab === "closed"
                              ? t?.OrderType === 1
                              : t?.BUY_SELL === 0;

                          const typeCol = isBuy ? C.success : C.danger;

                          return (
                            <motion.tr
                              key={`${t?.MT5Account || "acc"}-${i}`}
                              variants={rowVariants}
                              initial="hidden"
                              animate="visible"
                              className="hover:shadow-lg"
                              whileHover={{
                                backgroundColor: rgba(C.accent, 0.05),
                                scale: 1.01,
                                transition: { duration: 0.18 },
                              }}
                              style={{
                                borderBottom: `1px solid ${rgba(C.border, 0.10)}`,
                              }}
                            >
                              <td className="py-4 px-4 text-center font-mono" style={{ color: rgba(C.accent, 0.9) }}>
                                #{t?.MT5Account}
                              </td>

                              <td className="py-4 px-4 text-center font-semibold" style={{ color: rgba(C.accentFg || C.fg, 0.88) }}>
                                <span className="mr-1">{getSymbolIcon(t?.Symbol)}</span>
                                {t?.Symbol}
                              </td>

                              <td className="py-4 px-4 text-center text-xs font-mono" style={{ color: rgba(C.mutedFg, 0.55) }}>
                                {formatTime(t?.Open_Time)}
                              </td>

                              {activeTab === "closed" && (
                                <td className="py-4 px-4 text-center text-xs font-mono" style={{ color: rgba(C.mutedFg, 0.55) }}>
                                  {formatTime(t?.Close_Time)}
                                </td>
                              )}

                              <td className="py-4 px-4 text-center font-mono" style={{ color: rgba(C.fg, 0.78) }}>
                                ${money(t?.Open_Price)}
                              </td>

                              {activeTab === "closed" && (
                                <td className="py-4 px-4 text-center font-mono" style={{ color: rgba(C.fg, 0.78) }}>
                                  ${money(t?.Close_Price)}
                                </td>
                              )}

                              <td className="py-4 px-4 text-center">
                                <motion.span
                                  whileHover={{ scale: 1.06 }}
                                  className="px-3 py-1 rounded-full text-xs font-bold border"
                                  style={{
                                    background: rgba(typeCol, 0.14),
                                    borderColor: rgba(typeCol, 0.28),
                                    color: rgba(typeCol, 0.92),
                                  }}
                                >
                                  {activeTab === "closed" ? (t?.OrderType === 1 ? "BUY" : "SELL") : (t?.BUY_SELL === 0 ? "BUY" : "SELL")}
                                </motion.span>
                              </td>

                              <td className="py-4 px-4 text-center font-mono font-bold" style={{ color: rgba(C.warning, 0.92) }}>
                                {activeTab === "open"
                                  ? (Number(t?.Volume ?? 0) / 10000).toFixed(2)
                                  : Number(t?.Lot ?? 0).toFixed(2)}
                              </td>

                              <td className="py-4 px-4 text-center">
                                <motion.div
                                  className="inline-block px-4 py-2 rounded-xl font-bold"
                                  style={profitPillStyle(Number(t?.Profit))}
                                  whileHover={{ scale: 1.06, rotate: 1 }}
                                  animate={
                                    Number(t?.Profit) > 100
                                      ? { boxShadow: ["0 0 0 rgba(0,0,0,0)", `0 0 20px ${rgba(C.success, 0.35)}`, "0 0 0 rgba(0,0,0,0)"] }
                                      : {}
                                  }
                                  transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
                                >
                                  <span style={{ color: profitColor(Number(t?.Profit)) }}>
                                    ${Math.abs(Number(t?.Profit ?? 0)).toFixed(2)}
                                  </span>
                                </motion.div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </motion.tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty */}
            <AnimatePresence>
              {!loading && !error && tradeData.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20">
                  <div className="text-center">
                    <div
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
                      style={{
                        background: rgba(C.surface2, 0.22),
                        border: `1px solid ${rgba(C.border, 0.14)}`,
                        color: rgba(C.mutedFg, 0.75),
                      }}
                    >
                      📈
                    </div>
                    <p className="font-semibold" style={{ color: rgba(C.fg, 0.9) }}>
                      No trades yet
                    </p>
                    <p className="text-sm" style={{ color: rgba(C.mutedFg, 0.6) }}>
                      Start trading to see your history here.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
