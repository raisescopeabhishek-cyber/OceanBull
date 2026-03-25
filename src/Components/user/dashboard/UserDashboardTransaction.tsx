import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCcw, Search, ArrowRightLeft } from "lucide-react";

import ModernText from "../../lib/ModernText";
import DynamicLoder from "../../Loader/DynamicLoder";
import { backendApi, userApi } from "@/utils/apiClients";

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
function money(n: any) {
  const num = Number(n ?? 0);
  return Number.isFinite(num)
    ? num.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "0";
}

function formatDate(iso: any) {
  if (!iso) return "—";
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${date}, ${time}`;
}

function statusTone(status: any) {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s === "completed") return "approved";
  if (s === "pending" || s === "processing") return "pending";
  if (s === "rejected" || s === "failed" || s === "reversed") return "rejected";
  return "unknown";
}

/* ----------------------------- UI Bits ----------------------------- */
const StatusPill = ({ s = "", C }: { s?: string; C: any }) => {
  const t = statusTone(s);
  const col =
    t === "approved" ? C.success : t === "pending" ? C.warning : t === "rejected" ? C.danger : C.accent;

  return (
    <span
      className="px-2 py-0.5 rounded-full text-[11px] font-bold border inline-flex font-mono tracking-wide"
      style={{
        background: rgba(col, 0.14),
        borderColor: rgba(col, 0.28),
        color: rgba(col, 0.92),
      }}
    >
      {String(s || "unknown").toUpperCase()}
    </span>
  );
};

const EmptyState = ({ title, subtitle, theme }: any) => (
  <div className="py-10 text-center">
    <div
      className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
      style={{
        background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.22),
        border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
        color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.7),
      }}
    >
      📄
    </div>
    <p style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }} className="font-semibold">
      {title}
    </p>
    <p style={{ color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.62) }} className="text-sm">
      {subtitle}
    </p>
  </div>
);

const StatTile = ({ label, value, tone = "neutral", C, theme }: any) => {
  const col =
    tone === "pos" ? C.success : tone === "warn" ? C.warning : tone === "neg" ? C.danger : C.accent;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="p-3"
      style={{
        borderRadius: theme?.radius || "18px",
        border: `1px solid ${rgba(C.border, 0.14)}`,
        background: `linear-gradient(135deg, ${rgba(col, 0.12)}, ${rgba(C.surface2, 0.16)})`,
      }}
    >
      <div className="text-[11px]" style={{ color: rgba(C.mutedFg, 0.62) }}>
        {label}
      </div>
      <div className="text-lg font-extrabold" style={{ color: rgba(C.fg, 0.92) }}>
        {value}
      </div>
    </motion.div>
  );
};

/* ----------------------------- Component --------------------------- */
type TabKey = "deposit" | "withdrawal" | "account";

export default function UserTransactionWidget() {
  const [activeTab, setActiveTab] = useState<TabKey>("deposit");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const loggedUser = useSelector((s: any) => s.user.loggedUser);

  // theme
  const themeConfig = useSelector((s: any) => s.user.themeConfig);
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
      surface3: theme?.surface3 || theme?.card || "18 18 18",
      accent: theme?.accent || "59 130 246",
      accentFg: theme?.accentFg || theme?.fg || "255 255 255",
      primary: theme?.primary || theme?.accent || "147 51 234",
      primaryFg: theme?.primaryFg || "0 0 0",
      success: theme?.success || "34 197 94",
      warning: theme?.warning || "234 179 8",
      danger: theme?.danger || "244 63 94",
      ring: theme?.ring || theme?.accent || "59 130 246",
      glow: theme?.glow || theme?.accent || "59 130 246",
      shadow: theme?.shadowColor || "0 0 0",
      radius: theme?.radius || "18px",
      input: theme?.input || theme?.surface2 || "18 18 18",
      rowHover: theme?.rowHover || theme?.surface3 || "30 30 30",
      headerRow: theme?.headerRow || theme?.surface3 || "30 30 30",
      gradientFrom: theme?.gradientFrom || theme?.accent || "59 130 246",
      gradientTo: theme?.gradientTo || "147 51 234",
    }),
    [theme]
  );

  const tabs = useMemo(
    () => [
      { id: "deposit" as const, label: "Deposits", icon: "💰" },
      { id: "withdrawal" as const, label: "Withdrawals", icon: "💸" },
      { id: "account" as const, label: "Account Txn", icon: "🔄" },
    ],
    []
  );

  // styles
  const cardStyle = useMemo(
    () =>
      ({
        borderRadius: "24px",
        border: `1px solid ${rgba(C.border, 0.14)}`,
        background: `radial-gradient(900px 420px at 15% 0%, ${rgba(C.glow, 0.14)}, transparent 60%),
                     linear-gradient(135deg, ${rgba(C.surface2, 0.72)}, ${rgba(C.surface1, 0.82)}, ${rgba(
          C.surface2,
          0.72
        )})`,
        boxShadow: `0 18px 70px ${rgba(C.shadow, 0.55)}`,
        color: rgb(C.fg),
      }) as React.CSSProperties,
    [C]
  );

  const tabBase = useMemo(
    () =>
      ({
        borderRadius: "999px",
        border: `1px solid ${rgba(C.border, 0.14)}`,
        background: rgba(C.surface2, 0.22),
        color: rgba(C.fg, 0.82),
      }) as React.CSSProperties,
    [C]
  );

  const tabActive = useMemo(
    () =>
      ({
        borderColor: rgba(C.ring, 0.35),
        background: `linear-gradient(90deg, ${rgba(C.gradientFrom, 0.55)}, ${rgba(C.gradientTo, 0.45)})`,
        color: rgba(C.accentFg, 0.95),
        boxShadow: `0 10px 24px ${rgba(C.glow, 0.22)}`,
      }) as React.CSSProperties,
    [C]
  );

  const inputStyle = useMemo(
    () =>
      ({
        borderRadius: C.radius,
        border: `1px solid ${rgba(C.border, isSearchFocused ? 0.32 : 0.18)}`,
        background: rgba(C.input, 0.18),
        color: rgba(C.fg, 0.92),
        boxShadow: isSearchFocused ? `0 0 0 3px ${rgba(C.ring, 0.22)}` : "none",
      }) as React.CSSProperties,
    [C, isSearchFocused]
  );

  const headerRowStyle = useMemo(
    () =>
      ({
        background: rgba(C.headerRow, 0.45),
        color: rgba(C.mutedFg, 0.72),
        borderBottom: `1px solid ${rgba(C.border, 0.12)}`,
      }) as React.CSSProperties,
    [C]
  );

  /* ----------------------------- Data Fetch --------------------------- */
  async function fetchTransactions(type: TabKey, signal?: AbortSignal) {
    setLoading(true);
    setErr(null);

    try {
      if (!loggedUser?._id) {
        setRows([]);
        setErr("Please sign in to view your transactions.");
        return;
      }

      let res: any;

      if (type === "withdrawal") {
        res = await userApi.get(`/withdrawals/${loggedUser._id}`, signal ? { signal } : undefined);
        const payload = res?.data?.data;

        if (!Array.isArray(payload) || payload.length === 0) {
          setRows([]);
          return;
        }

        setRows(
          payload.map((x: any) => ({
            mt5Account: x.mt5Account || x.accountNumber || x.account || "—",
            accountType: x.accountType || x.type || "—",
            amount: Number(x.amount ?? 0),
            method: (x.method || "—").toString(),
            status: x.status || "unknown",
            createdAt: x.createdAt || x.created_at || x.created || null,
            updatedAt: x.updatedAt || x.updated_at || x.updated || null,
            lastBalance: Number(x.lastBalance ?? x.balance ?? 0),
          }))
        );
        return;
      }

      if (type === "deposit") {
        res = await userApi.get(`/deposit/${loggedUser._id}`, signal ? { signal } : undefined);
        const payload = res?.data?.data;

        if (!Array.isArray(payload) || payload.length === 0) {
          setRows([]);
          return;
        }

        setRows(
          payload.map((x: any) => ({
            mt5Account: x.mt5Account || x.accountNumber || x.account || "—",
            accountType: x.accountType || x.type || "—",
            deposit: Number(x.deposit ?? x.amount ?? 0),
            method: (x.method || "—").toString(),
            status: x.status || "unknown",
            createdAt: x.createdAt || x.created_at || x.created || null,
            updatedAt: x.updatedAt || x.updated_at || x.updated || null,
            depositSS: x.depositSS || x.attachment || x.file || null,
          }))
        );
        return;
      }

      // account txn (DB transfers)
      res = await userApi.get(`/account-txn`, signal ? { signal } : undefined);
      const payload = res?.data?.data;

      if (!Array.isArray(payload) || payload.length === 0) {
        setRows([]);
        return;
      }

      setRows(
        payload.map((t: any) => ({
          _id: t._id,
          direction: t.direction || "unknown", // sent | received
          fromAccountNumber: t.fromAccountNumber || "—",
          toAccountNumber: t.toAccountNumber || "—",
          amount: Number(t.amount || 0),
          status: t.status || "unknown",
          note: t.note || "",
          failureReason: t.failureReason || null,
          createdAt: t.createdAt || null,
          updatedAt: t.updatedAt || null,
        }))
      );
    } catch (e: any) {
      if (e?.name === "CanceledError" || e?.message === "canceled") return;
      setRows([]);
      setErr("Failed to fetch transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    fetchTransactions(activeTab, controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, loggedUser?._id]);

  /* ------------------------------ Derived --------------------------- */
  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const term = q.trim().toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(term))
    );
  }, [q, rows]);

  const lastFive = useMemo(() => filtered.slice(-5).reverse(), [filtered]);

  const stats = useMemo(() => {
    if (activeTab === "deposit") {
      const total = filtered.reduce((s: number, x: any) => s + (Number(x.deposit) || 0), 0);
      const approved = filtered.filter((x: any) => String(x.status).toLowerCase() === "approved").length;
      const pending = filtered.filter((x: any) => String(x.status).toLowerCase() === "pending").length;
      return { total, a: approved, b: pending, title: "Deposits", aLabel: "Approved", bLabel: "Pending" };
    }
    if (activeTab === "withdrawal") {
      const total = filtered.reduce((s: number, x: any) => s + (Number(x.amount) || 0), 0);
      const approved = filtered.filter((x: any) => String(x.status).toLowerCase() === "approved").length;
      const pending = filtered.filter((x: any) => String(x.status).toLowerCase() === "pending").length;
      return { total, a: approved, b: pending, title: "Withdrawals", aLabel: "Approved", bLabel: "Pending" };
    }
    const total = filtered.reduce((s: number, x: any) => s + (Number(x.amount) || 0), 0);
    const sent = filtered.filter((x: any) => String(x.direction).toLowerCase() === "sent").length;
    const received = filtered.filter((x: any) => String(x.direction).toLowerCase() === "received").length;
    return { total, a: sent, b: received, title: "Account Txn", aLabel: "Sent", bLabel: "Received" };
  }, [filtered, activeTab]);

  /* ------------------------------- Render --------------------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45 }}
      className="relative p-5 overflow-hidden"
      style={cardStyle}
    >
      {/* subtle stripes */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.1,
          backgroundImage: `repeating-linear-gradient(90deg, ${rgba(C.accent, 0.16)} 0 2px, transparent 2px 8px)`,
        }}
      />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <ModernText text="Transaction History" />
          <button
            onClick={() => fetchTransactions(activeTab)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold transition"
            style={{
              borderRadius: C.radius,
              border: `1px solid ${rgba(C.border, 0.2)}`,
              background: rgba(C.surface2, 0.14),
              color: rgba(C.fg, 0.84),
            }}
          >
            <RefreshCcw size={14} />
            Refresh
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
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
              className="w-full pl-9 pr-3 py-2 outline-none transition text-sm"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(t.id)}
              className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition"
              style={isActive ? { ...tabBase, ...tabActive } : tabBase}
            >
              <span className="mr-1">{t.icon}</span>
              {t.label}
            </motion.button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4 relative z-10">
        <StatTile C={C} theme={theme} label={`${stats.title} Total`} value={`$${money(stats.total)}`} tone="pos" />
        <StatTile C={C} theme={theme} label={stats.aLabel} value={stats.a} tone="pos" />
        <StatTile C={C} theme={theme} label={stats.bLabel} value={stats.b} tone="warn" />
        <StatTile C={C} theme={theme} label="Rows" value={filtered.length} tone="neutral" />
      </div>

      {/* Loader / Error / Empty / Table */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-6 relative z-10"
          >
            <DynamicLoder />
          </motion.div>
        ) : err ? (
          <motion.div
            key="err"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-10"
          >
            <EmptyState title="⚠️ Something went wrong" subtitle={err} theme={theme} />
          </motion.div>
        ) : lastFive.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10">
            <EmptyState
              title={`No ${tabs.find((t) => t.id === activeTab)?.label || "data"} found`}
              subtitle="Try another tab or clear the filter."
              theme={theme}
            />
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="overflow-x-auto rounded-xl relative z-10"
            style={{ border: `1px solid ${rgba(C.border, 0.14)}` }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={headerRowStyle}>
                  {activeTab === "account" ? (
                    <>
                      <th className="py-3 px-4 text-left">Direction</th>
                      <th className="py-3 px-4 text-left">From</th>
                      <th className="py-3 px-4 text-left">To</th>
                      <th className="py-3 px-4 text-left">Amount</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Time</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3 px-4 text-left">Account</th>
                      <th className="py-3 px-4 text-left">Type</th>
                      <th className="py-3 px-4 text-left">{activeTab === "withdrawal" ? "Amount" : "Deposit"}</th>
                      <th className="py-3 px-4 text-left">Method</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Time</th>
                    </>
                  )}
                </tr>
              </thead>

              <motion.tbody initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {lastFive.map((t: any, i: number) => {
                  const rowBorder = rgba(C.border, 0.12);

                  const onEnter = (e: React.MouseEvent<HTMLTableRowElement>) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = rgba(C.rowHover, 0.22);
                  };
                  const onLeave = (e: React.MouseEvent<HTMLTableRowElement>) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                  };

                  if (activeTab === "account") {
                    const dir = String(t?.direction || "").toLowerCase();
                    const dirCol = dir === "sent" ? C.warning : dir === "received" ? C.success : C.accent;

                    return (
                      <motion.tr
                        key={t?._id || i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                        className="border-b"
                        style={{ borderBottomColor: rowBorder }}
                        onMouseEnter={onEnter}
                        onMouseLeave={onLeave}
                      >
                        <td className="py-2 px-4">
                          <span
                            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold border font-mono"
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
                        <td className="py-2 px-4 font-mono" style={{ color: rgba(C.accent, 0.9) }}>
                          #{t?.fromAccountNumber || "—"}
                        </td>
                        <td className="py-2 px-4 font-mono" style={{ color: rgba(C.primary, 0.9) }}>
                          #{t?.toAccountNumber || "—"}
                        </td>
                        <td className="py-2 px-4 font-mono font-extrabold" style={{ color: rgba(C.fg, 0.9) }}>
                          ${money(t?.amount)}
                        </td>
                        <td className="py-2 px-4">
                          <StatusPill s={t?.status} C={C} />
                        </td>
                        <td className="py-2 px-4 text-xs font-mono" style={{ color: rgba(C.mutedFg, 0.65) }}>
                          {formatDate(t?.createdAt)}
                        </td>
                      </motion.tr>
                    );
                  }

                  const acc = t?.mt5Account || t?.account || t?.accountNumber || "—";
                  const amount = activeTab === "withdrawal" ? Number(t?.amount ?? 0) : Number(t?.deposit ?? 0);

                  return (
                    <motion.tr
                      key={`${acc}-${i}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="border-b"
                      style={{ borderBottomColor: rowBorder }}
                      onMouseEnter={onEnter}
                      onMouseLeave={onLeave}
                    >
                      <td className="py-2 px-4 font-mono" style={{ color: rgba(C.accent, 0.9) }}>
                        #{acc}
                      </td>
                      <td className="py-2 px-4" style={{ color: rgba(C.fg, 0.78) }}>
                        {t?.accountType || "—"}
                      </td>
                      <td className="py-2 px-4 font-mono font-bold" style={{ color: rgba(C.success, 0.92) }}>
                        ${money(amount)}
                      </td>
                      <td className="py-2 px-4" style={{ color: rgba(C.mutedFg, 0.7) }}>
                        {String(t?.method || "—").toUpperCase()}
                      </td>
                      <td className="py-2 px-4">
                        <StatusPill s={t?.status} C={C} />
                      </td>
                      <td className="py-2 px-4 text-xs font-mono" style={{ color: rgba(C.mutedFg, 0.65) }}>
                        {formatDate(t?.createdAt)}
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>

            <div
              className="px-4 py-3 text-[11px] font-mono"
              style={{
                borderTop: `1px solid ${rgba(C.border, 0.12)}`,
                color: rgba(C.mutedFg, 0.6),
                background: rgba(C.surface2, 0.12),
              }}
            >
              Showing last 5 rows {q.trim() ? "(filtered)" : ""}.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
