import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import {
  RefreshCcw,
  ArrowDownToLine,
  ArrowUpToLine,
  Repeat2,
  Search,
  ArrowRightLeft,
  Wallet,
  CircleDollarSign,
  Gauge,
  TrendingUp,
  Activity,
} from "lucide-react";
import DynamicLoder from "../Loader/DynamicLoder";
import { userApi } from "../../utils/apiClients";

/* -------------------- theme helpers -------------------- */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
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

/* -------------------- helpers -------------------- */
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

/* -------------------- shared cards -------------------- */
function SectionCard({
  children,
  theme,
  isDark,
  className = "",
}: {
  children: React.ReactNode;
  theme: any;
  isDark: boolean;
  className?: string;
}) {
  return (
    <div
      className={["rounded-[24px] border transition-all duration-300", className].join(
        " "
      )}
      style={{
        borderColor: isDark
          ? rgba(theme?.border || "255 255 255", 0.1)
          : "rgba(251,146,60,0.14)",
        background: isDark
          ? "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))"
          : "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,250,246,0.82))",
        boxShadow: isDark
          ? "0 18px 50px rgba(0,0,0,0.28)"
          : "0 14px 40px rgba(251,146,60,0.10)",
        backdropFilter: "blur(10px)",
      }}
    >
      {children}
    </div>
  );
}

function EmptyState({
  title = "No data found",
  subtitle = "Try another tab or refresh the records.",
  theme,
  isDark,
}: any) {
  return (
    <div className="py-12 text-center">
      <div
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border"
        style={{
          borderColor: isDark
            ? rgba(theme?.border || "255 255 255", 0.12)
            : "rgba(251,146,60,0.14)",
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.78)",
          color: isDark
            ? rgba(theme?.fg || "255 255 255", 0.7)
            : "rgba(100,116,139,0.9)",
        }}
      >
        ⚪
      </div>

      <p
        className="font-semibold"
        style={{
          color: isDark
            ? rgba(theme?.fg || "255 255 255", 0.92)
            : "rgba(15,23,42,0.96)",
        }}
      >
        {title}
      </p>

      <p
        className="mt-1 text-sm"
        style={{
          color: isDark
            ? rgba(theme?.fg || "255 255 255", 0.58)
            : "rgba(100,116,139,0.95)",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  prefix = "",
  tone = "default",
  theme,
  isDark,
}: any) {
  const toneStyles =
    tone === "success"
      ? {
          iconBg: isDark ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.10)",
          iconColor: isDark ? "rgba(52,211,153,0.95)" : "rgba(5,150,105,0.95)",
          border: isDark ? "rgba(16,185,129,0.18)" : "rgba(16,185,129,0.16)",
        }
      : tone === "danger"
      ? {
          iconBg: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.10)",
          iconColor: isDark ? "rgba(248,113,113,0.95)" : "rgba(220,38,38,0.95)",
          border: isDark ? "rgba(239,68,68,0.18)" : "rgba(239,68,68,0.16)",
        }
      : tone === "info"
      ? {
          iconBg: isDark ? "rgba(59,130,246,0.12)" : "rgba(249,115,22,0.10)",
          iconColor: isDark ? "rgba(96,165,250,0.95)" : "rgba(249,115,22,0.95)",
          border: isDark ? "rgba(59,130,246,0.18)" : "rgba(251,146,60,0.16)",
        }
      : tone === "warning"
      ? {
          iconBg: isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.10)",
          iconColor: isDark ? "rgba(251,191,36,0.95)" : "rgba(217,119,6,0.95)",
          border: isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.16)",
        }
      : {
          iconBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)",
          iconColor: isDark ? "rgba(255,255,255,0.88)" : "rgba(51,65,85,0.92)",
          border: isDark
            ? rgba(theme?.border || "255 255 255", 0.12)
            : "rgba(251,146,60,0.14)",
        };

  return (
    <SectionCard theme={theme} isDark={isDark} className="p-4">
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
          <div
            className="text-xs"
            style={{
              color: isDark
                ? rgba(theme?.fg || "255 255 255", 0.58)
                : "rgba(100,116,139,0.96)",
            }}
          >
            {label}
          </div>

          <div
            className="text-lg font-bold"
            style={{
              color: isDark
                ? rgba(theme?.fg || "255 255 255", 0.94)
                : "rgba(15,23,42,0.98)",
            }}
          >
            {prefix}
            {value}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function SkeletonTable({
  cols,
  rows = 6,
  theme,
  isDark,
}: {
  cols: number;
  rows?: number;
  theme: any;
  isDark: boolean;
}) {
  return (
    <div
      className="overflow-x-auto rounded-[20px] border"
      style={{
        borderColor: isDark
          ? rgba(theme?.border || "255 255 255", 0.12)
          : "rgba(251,146,60,0.14)",
      }}
    >
      <table className="w-full text-sm">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr
              key={i}
              style={{
                borderBottom: `1px solid ${
                  isDark
                    ? rgba(theme?.border || "255 255 255", 0.08)
                    : "rgba(251,146,60,0.10)"
                }`,
              }}
            >
              {Array.from({ length: cols }).map((__, j) => (
                <td key={j} className="p-3">
                  <div
                    className="h-4 w-full animate-pulse rounded"
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(255,255,255,0.9)",
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------- component -------------------- */
export default function UserTransaction() {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdrawal" | "account">(
    "deposit"
  );
  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const loggedUser = useSelector((s: any) => s?.user?.loggedUser);
  const mode = useSelector((s: any) => s.userTheme?.mode || "light");
  const themeConfig = useSelector((s: any) => s.user?.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const isDark = mode === "dark";

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
          setError("No withdrawal data available.");
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
          setError("No deposit data available.");
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

      res = await userApi.get("/account-txn", signal ? { signal } : undefined);
      const payload = res?.data?.data;

      if (!Array.isArray(payload) || payload.length === 0) {
        setTransactionData([]);
        setError("No account transaction data available.");
        return;
      }

      const normalized = payload.map((item: any) => ({
        _id: item._id,
        direction: item.direction || "unknown",
        fromAccountNumber: item.fromAccountNumber || "—",
        toAccountNumber: item.toAccountNumber || "—",
        amount: Number(item.amount || 0),
        status: item.status || "unknown",
        note: item.note || "",
        failureReason: item.failureReason || null,
        createdAt: item.createdAt || null,
        updatedAt: item.updatedAt || null,
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

  useEffect(() => {
    const controller = new AbortController();
    fetchTransactionData(activeTab, controller.signal);
    return () => controller.abort();
  }, [activeTab, loggedUser?._id]);

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
      const total = filtered.reduce((sum, item: any) => sum + (Number(item.deposit) || 0), 0);
      const approved = filtered.filter(
        (item: any) => String(item.status).toLowerCase() === "approved"
      ).length;
      const pending = filtered.filter(
        (item: any) => String(item.status).toLowerCase() === "pending"
      ).length;

      return {
        total,
        a: approved,
        b: pending,
        title: "Deposits",
        aLabel: "Approved",
        bLabel: "Pending",
      };
    }

    if (activeTab === "withdrawal") {
      const total = filtered.reduce((sum, item: any) => sum + (Number(item.amount) || 0), 0);
      const approved = filtered.filter(
        (item: any) => String(item.status).toLowerCase() === "approved"
      ).length;
      const pending = filtered.filter(
        (item: any) => String(item.status).toLowerCase() === "pending"
      ).length;

      return {
        total,
        a: approved,
        b: pending,
        title: "Withdrawals",
        aLabel: "Approved",
        bLabel: "Pending",
      };
    }

    const totalAmount = filtered.reduce(
      (sum, item: any) => sum + (Number(item.amount) || 0),
      0
    );
    const sentCount = filtered.filter(
      (item: any) => String(item.direction).toLowerCase() === "sent"
    ).length;
    const receivedCount = filtered.filter(
      (item: any) => String(item.direction).toLowerCase() === "received"
    ).length;

    return {
      total: totalAmount,
      a: sentCount,
      b: receivedCount,
      title: "Account Transfers",
      aLabel: "Sent",
      bLabel: "Received",
    };
  }, [filtered, activeTab]);

  const titleColor = isDark
    ? rgba(theme?.fg || "255 255 255", 0.96)
    : "rgba(15,23,42,0.98)";

  const mutedTextColor = isDark
    ? rgba(theme?.fg || "255 255 255", 0.62)
    : "rgba(100,116,139,0.96)";

  const accentColor = isDark
    ? "rgba(96,165,250,0.95)"
    : "rgba(249,115,22,0.95)";

  const tabs = [
    { key: "deposit", label: "Deposits", icon: <ArrowDownToLine className="h-4 w-4" /> },
    { key: "withdrawal", label: "Withdrawals", icon: <ArrowUpToLine className="h-4 w-4" /> },
    { key: "account", label: "Account Txn", icon: <Repeat2 className="h-4 w-4" /> },
  ];

  const statusStyle = (status: any) => {
    const tone = statusTone(status);

    if (tone === "approved") {
      return {
        background: isDark ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.10)",
        border: isDark ? "1px solid rgba(16,185,129,0.22)" : "1px solid rgba(16,185,129,0.18)",
        color: isDark ? "rgba(52,211,153,0.95)" : "rgba(5,150,105,0.95)",
      };
    }

    if (tone === "pending") {
      return {
        background: isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.10)",
        border: isDark ? "1px solid rgba(245,158,11,0.22)" : "1px solid rgba(245,158,11,0.18)",
        color: isDark ? "rgba(251,191,36,0.95)" : "rgba(217,119,6,0.95)",
      };
    }

    if (tone === "rejected") {
      return {
        background: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.10)",
        border: isDark ? "1px solid rgba(239,68,68,0.22)" : "1px solid rgba(239,68,68,0.18)",
        color: isDark ? "rgba(248,113,113,0.95)" : "rgba(220,38,38,0.95)",
      };
    }

    return {
      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)",
      border: isDark
        ? `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`
        : "1px solid rgba(251,146,60,0.14)",
      color: titleColor,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <SectionCard theme={theme} isDark={isDark} className="overflow-hidden">
        <div
          className="border-b px-5 py-4 sm:px-6"
          style={{
            borderColor: isDark
              ? rgba(theme?.border || "255 255 255", 0.1)
              : "rgba(251,146,60,0.12)",
            background: isDark
              ? "rgba(255,255,255,0.02)"
              : "rgba(255,255,255,0.38)",
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" style={{ color: accentColor }} />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: mutedTextColor }}
            >
              trading · activity · records
            </span>
          </div>

          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: titleColor, fontFamily: "'Poppins', sans-serif" }}
          >
            Transactions
          </h1>

          <p className="mt-2 text-sm sm:text-[15px]" style={{ color: mutedTextColor }}>
            Review deposit, withdrawal, and account transfer activity in one
            place.
          </p>
        </div>

        <div className="p-4 sm:p-5 md:p-6">
          <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-3">
              {tabs.map((tab) => {
                const active = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as any)}
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300"
                    style={{
                      borderColor: active
                        ? isDark
                          ? "rgba(96,165,250,0.28)"
                          : "rgba(249,115,22,0.24)"
                        : isDark
                        ? rgba(theme?.border || "255 255 255", 0.12)
                        : "rgba(251,146,60,0.14)",
                      background: active
                        ? isDark
                          ? "rgba(59,130,246,0.12)"
                          : "rgba(255,237,213,0.72)"
                        : isDark
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(255,255,255,0.84)",
                      color: active
                        ? accentColor
                        : titleColor,
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <div className="relative min-w-0 sm:flex-1 xl:w-72">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: mutedTextColor }}
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Quick filter..."
                  className="w-full rounded-2xl border py-2.5 pl-9 pr-3 outline-none transition-all duration-300"
                  style={{
                    borderColor: isDark
                      ? rgba(theme?.border || "255 255 255", 0.12)
                      : "rgba(251,146,60,0.16)",
                    background: isDark
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(255,255,255,0.9)",
                    color: titleColor,
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => fetchTransactionData(activeTab)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all duration-300"
                style={{
                  borderColor: isDark
                    ? rgba(theme?.border || "255 255 255", 0.12)
                    : "rgba(251,146,60,0.16)",
                  background: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(255,255,255,0.9)",
                  color: titleColor,
                }}
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              theme={theme}
              isDark={isDark}
              icon={<Wallet className="h-5 w-5" />}
              label={`${stats.title} Total`}
              value={money(stats.total)}
              prefix="$"
              tone="info"
            />
            <StatCard
              theme={theme}
              isDark={isDark}
              icon={<CircleDollarSign className="h-5 w-5" />}
              label={stats.aLabel}
              value={stats.a}
              tone="success"
            />
            <StatCard
              theme={theme}
              isDark={isDark}
              icon={<Gauge className="h-5 w-5" />}
              label={stats.bLabel}
              value={stats.b}
              tone="warning"
            />
            <StatCard
              theme={theme}
              isDark={isDark}
              icon={<TrendingUp className="h-5 w-5" />}
              label="Rows"
              value={filtered.length}
              tone="default"
            />
          </div>

          <SectionCard theme={theme} isDark={isDark} className="overflow-hidden">
            <div className="overflow-x-auto">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5"
                  >
                    <div className="py-8 text-center">
                      <DynamicLoder />
                      <p
                        className="mt-4 text-sm font-semibold uppercase tracking-[0.2em]"
                        style={{ color: mutedTextColor }}
                      >
                        Fetching data...
                      </p>
                    </div>

                    <SkeletonTable
                      cols={activeTab === "account" ? 7 : 8}
                      theme={theme}
                      isDark={isDark}
                    />
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-6"
                  >
                    <EmptyState
                      title={error}
                      subtitle="Please refresh or try another transaction tab."
                      theme={theme}
                      isDark={isDark}
                    />
                  </motion.div>
                ) : filtered.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6"
                  >
                    <EmptyState
                      title={`No ${activeTab} data available`}
                      subtitle="Your records will appear here once available."
                      theme={theme}
                      isDark={isDark}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="table"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                  >
                    {activeTab === "account" ? (
                      <table className="w-full text-sm">
                        <thead
                          style={{
                            background: isDark
                              ? "rgba(255,255,255,0.03)"
                              : "rgba(255,255,255,0.75)",
                            borderBottom: isDark
                              ? `1px solid ${rgba(theme?.border || "255 255 255", 0.1)}`
                              : "1px solid rgba(251,146,60,0.12)",
                          }}
                        >
                          <tr>
                            {[
                              "Direction",
                              "From",
                              "To",
                              "Amount",
                              "Note",
                              "Status",
                              "Time",
                            ].map((head) => (
                              <th
                                key={head}
                                className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em]"
                                style={{ color: mutedTextColor }}
                              >
                                {head}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {filtered.map((item: any, i: number) => {
                            const dir = String(item?.direction || "").toLowerCase();
                            const dirColor =
                              dir === "sent"
                                ? isDark
                                  ? "rgba(251,191,36,0.95)"
                                  : "rgba(217,119,6,0.95)"
                                : dir === "received"
                                ? isDark
                                  ? "rgba(52,211,153,0.95)"
                                  : "rgba(5,150,105,0.95)"
                                : accentColor;

                            return (
                              <tr
                                key={item?._id || i}
                                style={{
                                  borderBottom: isDark
                                    ? `1px solid ${rgba(theme?.border || "255 255 255", 0.08)}`
                                    : "1px solid rgba(251,146,60,0.10)",
                                }}
                              >
                                <td className="px-4 py-3 text-center">
                                  <span
                                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold"
                                    style={{
                                      background: isDark
                                        ? "rgba(255,255,255,0.03)"
                                        : "rgba(255,255,255,0.82)",
                                      borderColor: isDark
                                        ? rgba(theme?.border || "255 255 255", 0.12)
                                        : "rgba(251,146,60,0.14)",
                                      color: dirColor,
                                    }}
                                  >
                                    <ArrowRightLeft className="h-3.5 w-3.5" />
                                    {(dir || "unknown").toUpperCase()}
                                  </span>
                                </td>

                                <td
                                  className="px-4 py-3 text-center font-mono text-sm"
                                  style={{ color: titleColor }}
                                >
                                  #{item?.fromAccountNumber || "—"}
                                </td>

                                <td
                                  className="px-4 py-3 text-center font-mono text-sm"
                                  style={{ color: titleColor }}
                                >
                                  #{item?.toAccountNumber || "—"}
                                </td>

                                <td
                                  className="px-4 py-3 text-center font-semibold"
                                  style={{ color: titleColor }}
                                >
                                  ${money(item?.amount)}
                                </td>

                                <td
                                  className="px-4 py-3 text-center text-xs"
                                  style={{ color: mutedTextColor }}
                                >
                                  {item?.note ? String(item.note).slice(0, 40) : "—"}
                                  {item?.failureReason ? (
                                    <div
                                      className="mt-1"
                                      style={{
                                        color: isDark
                                          ? "rgba(248,113,113,0.95)"
                                          : "rgba(220,38,38,0.95)",
                                      }}
                                    >
                                      {String(item.failureReason).slice(0, 60)}
                                    </div>
                                  ) : null}
                                </td>

                                <td className="px-4 py-3 text-center">
                                  <span
                                    className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold"
                                    style={statusStyle(item?.status)}
                                  >
                                    {(item?.status || "UNKNOWN").toString().toUpperCase()}
                                  </span>
                                </td>

                                <td
                                  className="px-4 py-3 text-center text-xs"
                                  style={{ color: mutedTextColor }}
                                >
                                  {formatDate(item?.createdAt)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <table className="w-full text-sm">
                        <thead
                          style={{
                            background: isDark
                              ? "rgba(255,255,255,0.03)"
                              : "rgba(255,255,255,0.75)",
                            borderBottom: isDark
                              ? `1px solid ${rgba(theme?.border || "255 255 255", 0.1)}`
                              : "1px solid rgba(251,146,60,0.12)",
                          }}
                        >
                          <tr>
                            {[
                              "Account",
                              "Type",
                              activeTab === "withdrawal" ? "Amount" : "Deposit",
                              "Method",
                              "Requested",
                              "Updated",
                              activeTab === "deposit" ? "Proof" : "Balance",
                              "Status",
                            ].map((head) => (
                              <th
                                key={head}
                                className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em]"
                                style={{ color: mutedTextColor }}
                              >
                                {head}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {filtered.map((item: any, i: number) => (
                            <tr
                              key={`${item.mt5Account}-${i}`}
                              style={{
                                borderBottom: isDark
                                  ? `1px solid ${rgba(theme?.border || "255 255 255", 0.08)}`
                                  : "1px solid rgba(251,146,60,0.10)",
                              }}
                            >
                              <td
                                className="px-4 py-3 text-center font-mono text-sm"
                                style={{ color: titleColor }}
                              >
                                #{item?.mt5Account || "N/A"}
                              </td>

                              <td className="px-4 py-3 text-center">
                                <span
                                  className="inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold"
                                  style={{
                                    background: isDark
                                      ? "rgba(59,130,246,0.10)"
                                      : "rgba(255,237,213,0.72)",
                                    borderColor: isDark
                                      ? "rgba(59,130,246,0.18)"
                                      : "rgba(251,146,60,0.16)",
                                    color: accentColor,
                                  }}
                                >
                                  {(item?.accountType || "N/A").toUpperCase()}
                                </span>
                              </td>

                              <td
                                className="px-4 py-3 text-center font-semibold"
                                style={{ color: titleColor }}
                              >
                                $
                                {money(
                                  activeTab === "withdrawal"
                                    ? item?.amount
                                    : item?.deposit
                                )}
                              </td>

                              <td className="px-4 py-3 text-center">
                                <span
                                  className="inline-flex rounded-lg border px-2 py-1 text-[11px] font-semibold"
                                  style={{
                                    background: isDark
                                      ? "rgba(255,255,255,0.03)"
                                      : "rgba(255,255,255,0.82)",
                                    borderColor: isDark
                                      ? rgba(theme?.border || "255 255 255", 0.12)
                                      : "rgba(251,146,60,0.14)",
                                    color: titleColor,
                                  }}
                                >
                                  {(item?.method || "N/A").toString().toUpperCase()}
                                </span>
                              </td>

                              <td
                                className="px-4 py-3 text-center text-xs"
                                style={{ color: mutedTextColor }}
                              >
                                {formatDate(item?.createdAt)}
                              </td>

                              <td
                                className="px-4 py-3 text-center text-xs"
                                style={{ color: mutedTextColor }}
                              >
                                {formatDate(item?.updatedAt)}
                              </td>

                              {activeTab === "deposit" ? (
                                <td className="px-4 py-3 text-center">
                                  {item?.depositSS ? (
                                    <a
                                      target="_blank"
                                      rel="noreferrer"
                                      href={
                                        String(item.depositSS).startsWith("http")
                                          ? item.depositSS
                                          : `${import.meta.env.VITE_BACKEND_BASE_URL}/${item.depositSS}`
                                      }
                                      className="text-xs font-semibold underline"
                                      style={{ color: accentColor }}
                                    >
                                      View Proof
                                    </a>
                                  ) : (
                                    <span
                                      className="text-xs"
                                      style={{ color: mutedTextColor }}
                                    >
                                      —
                                    </span>
                                  )}
                                </td>
                              ) : (
                                <td
                                  className="px-4 py-3 text-center font-semibold"
                                  style={{ color: titleColor }}
                                >
                                  ${money(item?.lastBalance)}
                                </td>
                              )}

                              <td className="px-4 py-3 text-center">
                                <span
                                  className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold"
                                  style={statusStyle(item?.status)}
                                >
                                  {(item?.status || "UNKNOWN").toString().toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </SectionCard>
        </div>
      </SectionCard>
    </motion.div>
  );
}