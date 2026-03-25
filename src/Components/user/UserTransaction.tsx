import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import {
  RefreshCcw,
  Sparkles,
  ArrowDownToLine,
  ArrowUpToLine,
  Repeat2,
  Search,
  ArrowRightLeft,
} from "lucide-react";
import ModernHeading from "../lib/ModernHeading";
import DynamicLoder from "../Loader/DynamicLoder";
import { userApi } from "../../utils/apiClients";
import { FloatingParticles } from "../../utils/FloatingParticles";
import { AnimatedGrid } from "../../utils/AnimatedGrid";
import { FloatingOrbs } from "../../utils/FloatingOrbs";

/* -------------------- theme helpers (RGB strings -> css) ------------------- */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
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

/* ------------------------------ Helpers ---------------------------- */
function formatDate(iso: any) {
  if (!iso) return "N/A";
  const d = new Date(iso);
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
}

function money(n: any) {
  const num = Number(n ?? 0);
  return Number.isFinite(num)
    ? num.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "0";
}

function statusTone(status: any) {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s === "completed") return "approved";
  if (s === "pending" || s === "processing") return "pending";
  if (s === "rejected" || s === "failed" || s === "reversed") return "rejected";
  return "unknown";
}

/* ----------------------------- UI Bits ----------------------------- */
const EmptyState = ({
  title = "No data",
  subtitle = "Try another tab or date range.",
  theme,
}: any) => (
  <div className="text-center py-10">
    <div
      className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
      style={{
        background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.22),
        border: `1px solid ${rgba(
          theme?.border || theme?.inputBorder || "255 255 255",
          0.14
        )}`,
        color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.75),
      }}
    >
      ⚪
    </div>
    <p
      style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}
      className="font-semibold"
    >
      {title}
    </p>
    <p
      style={{ color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.6) }}
      className="text-sm"
    >
      {subtitle}
    </p>
  </div>
);

const StatTile = ({ label, value, prefix = "", hint, theme, tone }: any) => {
  const col =
    tone === "pos"
      ? theme?.success || "34 197 94"
      : tone === "warn"
      ? theme?.warning || "234 179 8"
      : tone === "neg"
      ? theme?.danger || "244 63 94"
      : theme?.accent || theme?.primary || "59 130 246";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="p-4"
      style={{
        borderRadius: theme?.radius || "18px",
        border: `1px solid ${rgba(
          theme?.border || theme?.inputBorder || "255 255 255",
          0.14
        )}`,
        background: `linear-gradient(135deg, ${rgba(col, 0.12)}, ${rgba(
          theme?.surface2 || theme?.card || "18 18 18",
          0.22
        )})`,
      }}
    >
      <div
        className="text-xs"
        style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.62) }}
      >
        {label}
      </div>
      <div
        className="text-xl font-extrabold mt-0.5"
        style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}
      >
        {prefix}
        {value}
      </div>
      {hint ? (
        <div
          className="text-[11px] mt-1"
          style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.5) }}
        >
          {hint}
        </div>
      ) : null}
    </motion.div>
  );
};

const SkeletonRow = ({ cols = 8, theme }: any) => (
  <tr
    style={{
      borderBottom: `1px solid ${rgba(
        theme?.border || theme?.inputBorder || "255 255 255",
        0.1
      )}`,
    }}
  >
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="p-3">
        <div
          className="h-4 w-full rounded animate-pulse"
          style={{
            background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.24),
          }}
        />
      </td>
    ))}
  </tr>
);

/* -------------------------- Anim Variants -------------------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, when: "beforeChildren", staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, rotateX: -15 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: "spring", stiffness: 100, damping: 15, duration: 0.8 },
  },
  hover: { y: -5, rotateX: 5, transition: { duration: 0.3 } },
};

const tabVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 220, damping: 20 },
  },
  tap: { scale: 0.96 },
};

/* ----------------------------- Component --------------------------- */
export default function UserTransaction() {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdrawal" | "account">(
    "deposit"
  );
  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const loggedUser = useSelector((s: any) => s?.user?.loggedUser);

  // ✅ theme from redux
  const themeConfig = useSelector((s: any) => s.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  // palette shortcuts
  const C = useMemo(
    () => ({
      bg: theme?.bg || "0 0 0",
      fg: theme?.fg || "255 255 255",
      mutedFg: theme?.mutedFg || theme?.fg || "255 255 255",
      border: theme?.border || theme?.inputBorder || "255 255 255",
      card: theme?.card || "18 18 18",
      surface1: theme?.surface1 || theme?.bg || "0 0 0",
      surface2: theme?.surface2 || theme?.card || "18 18 18",
      surface3: theme?.surface3 || theme?.card || "18 18 18",
      accent: theme?.accent || "59 130 246",
      accentFg: theme?.accentFg || theme?.fg || "255 255 255",
      primary: theme?.primary || theme?.accent || "147 51 234",
      primaryFg: theme?.primaryFg || "0 0 0",
      success: theme?.success || "34 197 94",
      warning: theme?.warning || "234 179 8",
      danger: theme?.danger || "244 63 94",
      info: theme?.info || theme?.accent || "59 130 246",
      ring: theme?.ring || theme?.accent || "59 130 246",
      glow: theme?.glow || theme?.accent || "59 130 246",
      shadow: theme?.shadowColor || "0 0 0",
      radius: theme?.radius || "18px",
    }),
    [theme]
  );

  const statusStyle = (status: any) => {
    const t = statusTone(status);
    const col =
      t === "approved"
        ? C.success
        : t === "pending"
        ? C.warning
        : t === "rejected"
        ? C.danger
        : C.accent;

    return {
      background: rgba(col, 0.14),
      border: `1px solid ${rgba(col, 0.28)}`,
      color: rgba(col, 0.92),
    } as React.CSSProperties;
  };

  // ✅ REAL API CALL
  async function fetchTransactionData(tradeType: typeof activeTab, signal?: AbortSignal) {
    setLoading(true);
    setError(null);

    try {
      if (!loggedUser?._id) {
        setTransactionData([]);
        setError("Please sign in to view your transactions.");
        return;
      }

      let res: any;

      if (tradeType === "withdrawal") {
        res = await userApi.get(
          `/withdrawals/${loggedUser._id}`,
          signal ? { signal } : undefined
        );
        const payload = res?.data?.data;

        if (!Array.isArray(payload) || payload.length === 0) {
          setTransactionData([]);
          setError(`No withdrawal data available.`);
          return;
        }

        const normalized = payload.map((item: any) => ({
          mt5Account: item.mt5Account || item.accountNumber || item.account || "N/A",
          accountType: item.accountType || item.type || "N/A",
          amount: item.amount ?? 0,
          method: (item.method || "N/A").toString(),
          createdAt: item.createdAt || item.created_at || item.created || null,
          updatedAt: item.updatedAt || item.updated_at || item.updated || null,
          lastBalance: item.lastBalance ?? item.balance ?? 0,
          status: item.status || "unknown",
        }));

        setTransactionData(normalized);
        return;
      }

      if (tradeType === "deposit") {
        res = await userApi.get(
          `/deposit/${loggedUser._id}`,
          signal ? { signal } : undefined
        );
        const payload = res?.data?.data;

        if (!Array.isArray(payload) || payload.length === 0) {
          setTransactionData([]);
          setError(`No deposit data available.`);
          return;
        }

        const normalized = payload.map((item: any) => ({
          mt5Account: item.mt5Account || item.accountNumber || item.account || "N/A",
          accountType: item.accountType || item.type || "N/A",
          deposit: item.deposit ?? item.amount ?? 0,
          method: (item.method || "N/A").toString(),
          createdAt: item.createdAt || item.created_at || item.created || null,
          updatedAt: item.updatedAt || item.updated_at || item.updated || null,
          depositSS: item.depositSS || item.attachment || item.file || null,
          status: item.status || "unknown",
        }));

        setTransactionData(normalized);
        return;
      }

      // ✅ Account Txn (DB) — NO META
      res = await userApi.get(`/account-txn`, signal ? { signal } : undefined);
      const payload = res?.data?.data;

      if (!Array.isArray(payload) || payload.length === 0) {
        setTransactionData([]);
        setError(`No account txn data available.`);
        return;
      }

      // normalize DB transfers
      const normalized = payload.map((t: any) => ({
        _id: t._id,
        direction: t.direction || "unknown", // sent | received
        fromAccountNumber: t.fromAccountNumber || "—",
        toAccountNumber: t.toAccountNumber || "—",
        amount: Number(t.amount || 0),
        status: t.status || "unknown", // completed/processing/failed/reversed
        note: t.note || "",
        failureReason: t.failureReason || null,
        createdAt: t.createdAt || null,
        updatedAt: t.updatedAt || null,
      }));

      setTransactionData(normalized);
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.message === "canceled") return;

      setTransactionData([]);
      setError(`Failed to fetch ${tradeType} data. Please try again.`);
    } finally {
      setLoading(false);
    }
  }

  // auto-fetch when tab or user changes
  useEffect(() => {
    const controller = new AbortController();
    fetchTransactionData(activeTab, controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, loggedUser?._id]);

  /* ------------------------------ Derived --------------------------- */
  const filtered = useMemo(() => {
    if (!q.trim()) return transactionData;
    const term = q.trim().toLowerCase();
    return transactionData.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? "").toLowerCase().includes(term)
      )
    );
  }, [q, transactionData]);

  const stats = useMemo(() => {
    if (activeTab === "deposit") {
      const total = filtered.reduce((s, x: any) => s + (Number(x.deposit) || 0), 0);
      const approved = filtered.filter(
        (x: any) => String(x.status).toLowerCase() === "approved"
      ).length;
      const pending = filtered.filter(
        (x: any) => String(x.status).toLowerCase() === "pending"
      ).length;
      return { total, a: approved, b: pending, title: "Deposits", aLabel: "Approved", bLabel: "Pending" };
    }

    if (activeTab === "withdrawal") {
      const total = filtered.reduce((s, x: any) => s + (Number(x.amount) || 0), 0);
      const approved = filtered.filter(
        (x: any) => String(x.status).toLowerCase() === "approved"
      ).length;
      const pending = filtered.filter(
        (x: any) => String(x.status).toLowerCase() === "pending"
      ).length;
      return { total, a: approved, b: pending, title: "Withdrawals", aLabel: "Approved", bLabel: "Pending" };
    }

    // account (DB transfers)
    const totalAmount = filtered.reduce((s, x: any) => s + (Number(x.amount) || 0), 0);
    const sentCount = filtered.filter((x: any) => String(x.direction).toLowerCase() === "sent").length;
    const receivedCount = filtered.filter((x: any) => String(x.direction).toLowerCase() === "received").length;
    return { total: totalAmount, a: sentCount, b: receivedCount, title: "Account Txn", aLabel: "Sent", bLabel: "Received" };
  }, [filtered, activeTab]);

  const pageBgStyle = useMemo(
    () =>
      ({
        minHeight: "100vh",
        background: `radial-gradient(1200px 600px at 18% 0%, ${rgba(C.glow, 0.16)}, transparent 60%),
                     radial-gradient(900px 480px at 82% 12%, ${rgba(C.primary, 0.12)}, transparent 55%),
                     linear-gradient(135deg, ${rgb(C.bg)}, ${rgb(C.surface1)}, ${rgb(C.bg)})`,
        color: rgb(C.fg),
      } as React.CSSProperties),
    [C]
  );

  const headerGlowStyle = useMemo(
    () =>
      ({
        borderRadius: C.radius,
        border: `1px solid ${rgba(C.border, 0.14)}`,
        background: `linear-gradient(90deg, ${rgba(C.surface2, 0.3)}, ${rgba(
          C.surface1,
          0.6
        )}, ${rgba(C.surface2, 0.3)})`,
        boxShadow: `0 0 44px ${rgba(C.glow, 0.22)}`,
      } as React.CSSProperties),
    [C]
  );

  const cardShellStyle = useMemo(
    () =>
      ({
        borderRadius: "28px",
        border: `1px solid ${rgba(C.border, 0.18)}`,
        background: `linear-gradient(135deg, ${rgba(C.surface1, 0.86)}, ${rgba(
          C.bg,
          0.92
        )}, ${rgba(C.surface1, 0.86)})`,
        boxShadow: `0 0 110px ${rgba(C.glow, 0.14)}, inset 0 0 90px ${rgba(
          "0 0 0",
          0.35
        )}`,
      } as React.CSSProperties),
    [C]
  );

  const stickyBarStyle = useMemo(
    () =>
      ({
        borderBottom: `1px solid ${rgba(C.border, 0.14)}`,
        background: `linear-gradient(90deg, transparent, ${rgba(
          C.accent,
          0.05
        )}, transparent)`,
        backdropFilter: "blur(12px)",
      } as React.CSSProperties),
    [C]
  );

  const tabs = useMemo(
    () => [
      { key: "deposit", label: "Deposits", Icon: ArrowDownToLine },
      { key: "withdrawal", label: "Withdrawals", Icon: ArrowUpToLine },
      { key: "account", label: "Account Txn", Icon: Repeat2 }, // DB transfers
    ],
    []
  );

  const tabButtonStyle = (isActive: boolean) => {
    if (isActive) {
      return {
        border: `1px solid ${rgba(C.success, 0.35)}`,
        background: `linear-gradient(90deg, ${rgba(C.success, 0.92)}, ${rgba(
          C.accent,
          0.92
        )})`,
        color: rgb(C.primaryFg || "0 0 0"),
        boxShadow: `0 14px 36px ${rgba(C.success, 0.22)}`,
      } as React.CSSProperties;
    }
    return {
      border: `1px solid ${rgba(C.border, 0.18)}`,
      background: rgba(C.surface2, 0.14),
      color: rgba(C.accentFg || C.fg, 0.82),
    } as React.CSSProperties;
  };

  const inputStyle = useMemo(
    () =>
      ({
        borderRadius: C.radius,
        border: `1px solid ${rgba(C.border, isSearchFocused ? 0.3 : 0.18)}`,
        background: rgba(theme?.input || C.surface2, 0.18),
        color: rgba(C.fg, 0.92),
        boxShadow: isSearchFocused ? `0 0 0 3px ${rgba(C.ring, 0.22)}` : "none",
      } as React.CSSProperties),
    [C, theme?.input, isSearchFocused]
  );

  const refreshBtnStyle = useMemo(
    () =>
      ({
        borderRadius: C.radius,
        border: `1px solid ${rgba(C.border, 0.2)}`,
        background: rgba(C.surface2, 0.14),
        color: rgba(C.accentFg || C.fg, 0.84),
      } as React.CSSProperties),
    [C]
  );

  const tableHeadStyle = useMemo(
    () =>
      ({
        background: `linear-gradient(90deg, ${rgba(C.accent, 0.12)}, ${rgba(
          C.primary,
          0.1
        )})`,
        borderBottom: `1px solid ${rgba(C.border, 0.18)}`,
      } as React.CSSProperties),
    [C]
  );

  const thStyle = useMemo(
    () =>
      ({
        color: rgba(C.accentFg || C.fg, 0.78),
        letterSpacing: "0.08em",
      } as React.CSSProperties),
    [C]
  );

  /* ------------------------------- Render --------------------------- */
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden"
      style={pageBgStyle}
    >
      <AnimatedGrid />
      <FloatingOrbs />
      <FloatingParticles />

      <div className="relative z-10 p-6 lg:p-10">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div style={headerGlowStyle} className="inline-block px-5 py-4">
              <div
                className="flex items-center justify-center gap-2 mb-1"
                style={{ color: rgba(C.accent, 0.92) }}
              >
                <Sparkles size={16} />
                <span className="uppercase tracking-[0.25em] text-xs">
                  trading · activity
                </span>
              </div>
              <ModernHeading text="⚡ TRANSACTIONS ⚡" />
            </motion.div>
          </div>

          {/* Card */}
          <motion.div variants={cardVariants} className="overflow-hidden" style={cardShellStyle}>
            {/* Tabs + search + stats */}
            <div className="sticky top-0 z-10 p-4 md:p-6" style={stickyBarStyle}>
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="flex flex-wrap gap-3">
                  {tabs.map(({ key, label, Icon }) => {
                    const isActive = activeTab === (key as any);
                    return (
                      <motion.button
                        key={key}
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        whileTap="tap"
                        onClick={() => setActiveTab(key as any)}
                        className="relative px-4 py-2 text-sm font-bold transition-all"
                        style={{ borderRadius: C.radius, ...tabButtonStyle(isActive) }}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Icon size={16} />
                          {label}
                        </span>
                        {isActive && (
                          <motion.span
                            layoutId="tab-underline"
                            className="absolute -bottom-1 left-3 right-3 h-[3px] rounded-full"
                            style={{ background: rgba("0 0 0", 0.35) }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-none">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: rgba(C.accent, 0.7) }}
                    />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      placeholder="Quick filter…"
                      className="w-full md:w-64 pl-9 pr-3 py-2 outline-none transition"
                      style={inputStyle}
                    />
                  </div>

                  <button
                    onClick={() => fetchTransactionData(activeTab)}
                    className="inline-flex items-center gap-2 px-3 py-2 transition"
                    style={refreshBtnStyle}
                  >
                    <RefreshCcw size={16} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <StatTile
                  theme={theme}
                  label={`${stats.title} Total`}
                  value={`$${money(stats.total)}`}
                  hint={activeTab === "account" ? "Sum of transfer amounts (DB)" : "Sum of amounts"}
                  tone="pos"
                />
                <StatTile theme={theme} label={stats.aLabel} value={stats.a} tone="pos" />
                <StatTile
                  theme={theme}
                  label={stats.bLabel}
                  value={stats.b}
                  tone={activeTab === "account" ? "warn" : "warn"}
                />
                <StatTile theme={theme} label="Rows" value={filtered.length} tone="neutral" />
              </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6">
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="text-center py-12"
                  >
                    <DynamicLoder />
                    <motion.p
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mt-4 font-mono tracking-widest"
                      style={{ color: rgba(C.accent, 0.9) }}
                    >
                      FETCHING DATA…
                    </motion.p>

                    <div
                      className="mt-6 overflow-x-auto"
                      style={{
                        borderRadius: "20px",
                        border: `1px solid ${rgba(C.border, 0.16)}`,
                      }}
                    >
                      <table className="w-full text-sm">
                        <tbody>
                          {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonRow
                              key={i}
                              cols={activeTab === "account" ? 7 : 9}
                              theme={theme}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {error && !loading && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    className="text-center py-12"
                  >
                    <div
                      className="rounded-2xl p-8 max-w-md mx-auto"
                      style={{
                        background: rgba(C.danger, 0.1),
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

                {!loading && !error && filtered.length === 0 && (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <EmptyState title={`No ${activeTab} data available.`} theme={theme} />
                  </motion.div>
                )}

                {!loading && !error && filtered.length > 0 && (
                  <motion.div
                    key="data"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Account Txn (DB Transfers) */}
                    {activeTab === "account" ? (
                      <div
                        className="overflow-x-auto"
                        style={{
                          borderRadius: "20px",
                          border: `1px solid ${rgba(C.border, 0.16)}`,
                        }}
                      >
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={tableHeadStyle}>
                              {[
                                "↔️ DIRECTION",
                                "⬅️ FROM",
                                "➡️ TO",
                                "💰 AMOUNT",
                                "📝 NOTE",
                                "⚡ STATUS",
                                "📅 TIME",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="text-center py-3 px-4 font-mono font-bold"
                                  style={thStyle}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((item: any, i: number) => {
                              const dir = String(item?.direction || "").toLowerCase();
                              const dirCol = dir === "sent" ? C.warning : dir === "received" ? C.success : C.accent;

                              return (
                                <motion.tr
                                  key={item?._id || i}
                                  initial={{ opacity: 0, x: -40 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.02 }}
                                  whileHover={{
                                    backgroundColor: rgba(C.accent, 0.06),
                                    scale: 1.005,
                                    transition: { duration: 0.15 },
                                  }}
                                  style={{
                                    borderBottom: `1px solid ${rgba(C.border, 0.1)}`,
                                  }}
                                >
                                  <td className="py-3 px-4 text-center">
                                    <span
                                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border"
                                      style={{
                                        background: rgba(dirCol, 0.14),
                                        borderColor: rgba(dirCol, 0.28),
                                        color: rgba(dirCol, 0.92),
                                      }}
                                    >
                                      <ArrowRightLeft size={14} />
                                      {(dir || "unknown").toUpperCase()}
                                    </span>
                                  </td>

                                  <td className="py-3 px-4 text-center font-mono" style={{ color: rgba(C.accent, 0.9) }}>
                                    #{item?.fromAccountNumber || "—"}
                                  </td>

                                  <td className="py-3 px-4 text-center font-mono" style={{ color: rgba(C.info, 0.92) }}>
                                    #{item?.toAccountNumber || "—"}
                                  </td>

                                  <td className="py-3 px-4 text-center font-mono font-extrabold" style={{ color: rgba(C.fg, 0.9) }}>
                                    ${money(item?.amount)}
                                  </td>

                                  <td className="py-3 px-4 text-center text-xs" style={{ color: rgba(C.mutedFg, 0.65) }}>
                                    {item?.note ? String(item.note).slice(0, 40) : "—"}
                                    {item?.failureReason ? (
                                      <div style={{ color: rgba(C.danger, 0.85) }} className="mt-1">
                                        {String(item.failureReason).slice(0, 60)}
                                      </div>
                                    ) : null}
                                  </td>

                                  <td className="py-3 px-4 text-center">
                                    <div
                                      className="inline-flex items-center px-3 py-1.5 rounded-full font-bold text-[11px] font-mono tracking-wider"
                                      style={statusStyle(item?.status)}
                                    >
                                      <span className="mr-1">
                                        {statusTone(item?.status) === "pending"
                                          ? "⏳"
                                          : statusTone(item?.status) === "approved"
                                          ? "✅"
                                          : statusTone(item?.status) === "rejected"
                                          ? "❌"
                                          : "❓"}
                                      </span>
                                      {(item?.status || "UNKNOWN").toString().toUpperCase()}
                                    </div>
                                  </td>

                                  <td className="py-3 px-4 text-center text-xs font-mono" style={{ color: rgba(C.mutedFg, 0.55) }}>
                                    {formatDate(item?.createdAt)}
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      /* Deposit / Withdrawal tables (same as before) */
                      <div
                        className="overflow-x-auto"
                        style={{
                          borderRadius: "20px",
                          border: `1px solid ${rgba(C.border, 0.16)}`,
                        }}
                      >
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={tableHeadStyle}>
                              {[
                                "🔢 ACCOUNT",
                                "🎯 TYPE",
                                ...(activeTab === "withdrawal" ? ["💰 AMOUNT"] : []),
                                ...(activeTab === "deposit" ? ["💳 DEPOSIT"] : []),
                                "🔄 METHOD",
                                "📅 REQUESTED",
                                "🔁 UPDATED",
                                ...(activeTab === "deposit" ? ["📎 PROOF"] : ["💼 BALANCE"]),
                                "⚡ STATUS",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="text-center py-3 px-4 font-mono font-bold"
                                  style={thStyle}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody>
                            {filtered.map((item: any, i: number) => (
                              <motion.tr
                                key={`${item.mt5Account}-${i}`}
                                initial={{ opacity: 0, x: -40 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.02 }}
                                whileHover={{
                                  backgroundColor: rgba(C.accent, 0.06),
                                  scale: 1.005,
                                  transition: { duration: 0.15 },
                                }}
                                style={{
                                  borderBottom: `1px solid ${rgba(C.border, 0.1)}`,
                                }}
                              >
                                <td className="py-3 px-4 text-center font-mono" style={{ color: rgba(C.accent, 0.9) }}>
                                  #{item?.mt5Account || "N/A"}
                                </td>

                                <td className="py-3 px-4 text-center">
                                  <span
                                    className="px-3 py-1 rounded-full text-xs font-bold border"
                                    style={{
                                      background: rgba(C.primary, 0.14),
                                      borderColor: rgba(C.primary, 0.28),
                                      color: rgba(C.primary, 0.92),
                                    }}
                                  >
                                    {(item?.accountType || "N/A").toUpperCase()}
                                  </span>
                                </td>

                                {activeTab === "withdrawal" && (
                                  <td className="py-3 px-4 text-center font-mono font-bold" style={{ color: rgba(C.success, 0.92) }}>
                                    ${money(item?.amount)}
                                  </td>
                                )}

                                {activeTab === "deposit" && (
                                  <td className="py-3 px-4 text-center font-mono font-bold" style={{ color: rgba(C.success, 0.92) }}>
                                    ${money(item?.deposit)}
                                  </td>
                                )}

                                <td className="py-3 px-4 text-center">
                                  <span
                                    className="font-mono text-xs px-2 py-1 rounded"
                                    style={{
                                      background: rgba(C.surface2, 0.22),
                                      border: `1px solid ${rgba(C.border, 0.12)}`,
                                      color: rgba(C.info, 0.92),
                                    }}
                                  >
                                    {(item?.method || "N/A").toString().toUpperCase()}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-center text-xs font-mono" style={{ color: rgba(C.mutedFg, 0.55) }}>
                                  {formatDate(item?.createdAt)}
                                </td>

                                <td className="py-3 px-4 text-center text-xs font-mono" style={{ color: rgba(C.mutedFg, 0.55) }}>
                                  {formatDate(item?.updatedAt)}
                                </td>

                                {activeTab === "deposit" ? (
                                  <td className="py-3 px-4 text-center">
                                    {item?.depositSS ? (
                                      <a
                                        className="font-mono underline hover:opacity-90"
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: rgba(C.info, 0.92) }}
                                        href={
                                          String(item.depositSS).startsWith("http")
                                            ? item.depositSS
                                            : `${import.meta.env.VITE_BACKEND_BASE_URL}/${item.depositSS}`
                                        }
                                      >
                                        VIEW 📄
                                      </a>
                                    ) : (
                                      <span style={{ color: rgba(C.mutedFg, 0.45) }}>—</span>
                                    )}
                                  </td>
                                ) : (
                                  <td className="py-3 px-4 text-center font-mono font-bold" style={{ color: rgba(C.warning, 0.92) }}>
                                    ${money(item?.lastBalance)}
                                  </td>
                                )}

                                <td className="py-3 px-4 text-center">
                                  <div
                                    className="inline-flex items-center px-3 py-1.5 rounded-full font-bold text-[11px] font-mono tracking-wider"
                                    style={statusStyle(item?.status)}
                                  >
                                    <span className="mr-1">
                                      {statusTone(item?.status) === "pending"
                                        ? "⏳"
                                        : statusTone(item?.status) === "approved"
                                        ? "✅"
                                        : statusTone(item?.status) === "rejected"
                                        ? "❌"
                                        : "❓"}
                                    </span>
                                    {(item?.status || "UNKNOWN").toString().toUpperCase()}
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
