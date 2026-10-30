import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Wallet,
  TrendingUp,
  Landmark,
  CheckCircle2,
  DollarSign,
  Search,
  RefreshCcw,
  X,
  Activity,
  CircleDollarSign,
  Gauge,
  ShieldCheck,
  Percent,
  ArrowRightLeft,
} from "lucide-react";

import { userApi } from "../../utils/apiClients";
import { useMt5Accounts } from "../../hooks/useMt5Accounts";
import TransferFormPanel from "./TransferFormPanel";

/* -------------------- types -------------------- */
type AccountType = {
  accountNumber: string;
  accountType?: string;
  type?: string;
  currency?: string;
  accountCurrency?: string;
  balance?: string | number;
};

type RootState = {
  user?: {
    loggedUser?: {
      accounts?: AccountType[];
      _id?: string;
    };
    themeConfig?: any;
  };
  userTheme?: {
    mode?: "light" | "dark";
  };
};

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
const shortText = (v: any, max = 90) => {
  const s =
    typeof v === "string"
      ? v
      : v && typeof v === "object"
      ? JSON.stringify(v)
      : String(v ?? "");

  return s.length > max ? `${s.slice(0, max)}...` : s;
};

const getToastError = (e: any, fallback = "Something went wrong") => {
  const payload = e?.response?.data;
  const type = payload?.errorType;
  const label = type === "META" ? "Meta Error" : "Server Error";
  const msg = payload?.error || payload?.message || e?.message || fallback;

  return `${label}: ${shortText(msg, 110)}`;
};

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

const formatBalance = (value: string | number) => {
  const num = Number(value || 0);
  if (Number.isNaN(num)) return "0.00";
  return num.toFixed(2);
};

const money = (n: any) => {
  const num = Number(n ?? 0);
  return Number.isFinite(num)
    ? num.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "0";
};

function statusTone(status: any) {
  const s = String(status || "").toLowerCase();

  if (s === "approved" || s === "completed" || s === "success") {
    return "approved";
  }

  if (s === "pending" || s === "processing") return "pending";
  if (s === "rejected" || s === "failed" || s === "reversed") return "rejected";

  return "unknown";
}

/* -------------------- shared ui -------------------- */
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

function StatCard({ icon, label, value, hint, colors, tone = "default" }: any) {
  const toneStyles =
    tone === "success"
      ? {
          iconBg: colors.isDark
            ? "rgba(16,185,129,0.14)"
            : "rgba(16,185,129,0.1)",
          iconColor: colors.success,
          border: colors.isDark
            ? "rgba(16,185,129,0.22)"
            : "rgba(16,185,129,0.18)",
        }
      : tone === "info"
      ? {
          iconBg: colors.isDark
            ? "rgba(59,130,246,0.14)"
            : "rgba(245,158,11,0.08)",
          iconColor: colors.accent,
          border: colors.isDark
            ? "rgba(59,130,246,0.22)"
            : "rgba(245,158,11,0.14)",
        }
      : tone === "warning"
      ? {
          iconBg: colors.isDark
            ? "rgba(245,158,11,0.14)"
            : "rgba(245,158,11,0.1)",
          iconColor: colors.warning,
          border: colors.isDark
            ? "rgba(245,158,11,0.22)"
            : "rgba(245,158,11,0.16)",
        }
      : {
          iconBg: colors.isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(245,158,11,0.06)",
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

function LoaderIcon({ color }: { color: string }) {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      style={{ color }}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
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
          boxShadow: colors.isDark ? "none" : colors.inputShadow,
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

function SkeletonTable({
  cols,
  rows = 6,
  colors,
}: {
  cols: number;
  rows?: number;
  colors: any;
}) {
  return (
    <div
      className="overflow-x-auto border"
      style={{
        borderColor: colors.border,
        borderRadius: "16px",
      }}
    >
      <table className="w-full text-sm">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr
              key={i}
              style={{
                borderBottom: `1px solid ${colors.borderSoft}`,
              }}
            >
              {Array.from({ length: cols }).map((__, j) => (
                <td key={j} className="p-3">
                  <div
                    className="h-4 w-full animate-pulse rounded"
                    style={{
                      background: colors.isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(245,158,11,0.08)",
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

export default function UserTransfer() {
  const mode = useSelector((store: RootState) => store.userTheme?.mode || "light");
  const loggedUser = useSelector((store: RootState) => store.user?.loggedUser);
  const themeConfig = useSelector((store: RootState) => store.user?.themeConfig);

  const isDark = mode === "dark";
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const colors = useMemo(() => {
    const accent = isDark
      ? rgba(theme?.accent || "96 165 250", 0.95)
      : "#f59e0b";

    return {
      isDark,

      pageBg: isDark ? "#0b1120" : "#fffaf5",

      heroBg: isDark
        ? "linear-gradient(135deg, rgba(30,41,59,1), rgba(15,23,42,1))"
        : "linear-gradient(135deg, #fb923c, #f59e0b)",

      surface: isDark ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.94)",
      surfaceSoft: isDark
        ? "rgba(255,255,255,0.04)"
        : "rgba(255,251,235,0.75)",
      surfaceMuted: isDark
        ? "rgba(255,255,255,0.03)"
        : "rgba(255,250,245,0.95)",

      text: isDark ? "rgba(255,255,255,0.95)" : "#0f172a",
      muted: isDark ? "rgba(255,255,255,0.65)" : "#64748b",
      softText: isDark ? "rgba(255,255,255,0.78)" : "#475569",

      accent,
      accentSoft: isDark ? "rgba(96,165,250,0.12)" : "rgba(245,158,11,0.08)",

      success: isDark ? "rgba(52,211,153,0.95)" : "#16a34a",
      warning: isDark ? "rgba(251,191,36,0.95)" : "#d97706",
      danger: isDark ? "rgba(248,113,113,0.95)" : "#dc2626",

      border: isDark
        ? rgba(theme?.border || "255 255 255", 0.12)
        : "rgba(245,158,11,0.16)",

      borderSoft: isDark
        ? rgba(theme?.border || "255 255 255", 0.08)
        : "rgba(245,158,11,0.10)",

      inputBg: isDark
        ? "rgba(15,23,42,0.92)"
        : "linear-gradient(180deg, rgba(255,251,235,0.98), rgba(255,255,255,0.98))",

      inputBorder: isDark
        ? rgba(theme?.border || "255 255 255", 0.12)
        : "rgba(245,158,11,0.30)",

      inputText: isDark ? "rgba(255,255,255,0.95)" : "#0f172a",
      inputPlaceholder: isDark ? "rgba(255,255,255,0.35)" : "#f59e0b",

      inputShadow: isDark
        ? "0 0 0 1px rgba(255,255,255,0.03)"
        : "0 0 0 4px rgba(245,158,11,0.05), 0 10px 22px rgba(245,158,11,0.07)",

      cardShadow: isDark
        ? "0 20px 45px rgba(0,0,0,0.28)"
        : "0 14px 30px rgba(245,158,11,0.07)",

      primaryBtn: "#f59e0b",
      primaryBtnHover: "#d97706",
      primaryBtnText: "#ffffff",

      tableHead: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,251,235,0.9)",
      modalOverlay: "rgba(2,6,23,0.72)",
      rowHover: isDark ? "rgba(255,255,255,0.035)" : "rgba(255,251,235,0.55)",
    };
  }, [isDark, theme]);

  const submitRequestRef = useRef<HTMLDivElement | null>(null);
  const blinkTimeoutRef = useRef<any>(null);

  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");

  const [isTransferLoading, setIsTransferLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [showTxnModal, setShowTxnModal] = useState(false);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnError, setTxnError] = useState<string | null>(null);
  const [txnQ, setTxnQ] = useState("");
  const [transferTransactions, setTransferTransactions] = useState<any[]>([]);

  const accounts = useMemo(() => loggedUser?.accounts || [], [loggedUser]);
  const { byLogin, isReady, refresh: refreshBalances } = useMt5Accounts(
    accounts.map((account) => account.accountNumber)
  );
  const fromBalanceReady = isReady(fromAccount, ["Balance"]);
  const toBalanceReady = isReady(toAccount, ["Balance"]);
  const balancesReady = fromBalanceReady && toBalanceReady;
  const fromAccountBalance = fromBalanceReady ? byLogin[String(fromAccount)].Balance : "";
  const toAccountBalance = toBalanceReady ? byLogin[String(toAccount)].Balance : "";
  const loadingFromBalance = !!fromAccount && !fromBalanceReady;
  const loadingToBalance = !!toAccount && !toBalanceReady;

  const subtleCard = useCallback(
    (): React.CSSProperties => ({
      background: colors.isDark ? colors.surfaceSoft : "rgba(255,251,235,0.92)",
      border: `1.5px solid ${colors.isDark ? colors.border : colors.inputBorder}`,
      borderRadius: "16px",
      boxShadow: colors.isDark ? "none" : colors.inputShadow,
    }),
    [colors]
  );

  useEffect(() => {
    return () => {
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, []);

  const fromAccountOptions = useMemo(
    () => accounts.filter((acc) => String(acc.accountNumber) !== String(toAccount)),
    [accounts, toAccount]
  );

  const toAccountOptions = useMemo(
    () => accounts.filter((acc) => String(acc.accountNumber) !== String(fromAccount)),
    [accounts, fromAccount]
  );

  const validateTransfer = useCallback(() => {
    if (!fromAccount || !toAccount) {
      toast.error("Please select both source and destination accounts.");
      return false;
    }

    if (fromAccount === toAccount) {
      toast.error("Source and destination accounts must be different.");
      return false;
    }

    if (!isReady(fromAccount, ["Balance"]) || !isReady(toAccount, ["Balance"])) {
      toast.error("Waiting for live account balances. Please try again when connected.");
      return false;
    }

    if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid transfer amount.");
      return false;
    }

    if (Number(amount) > Number(fromAccountBalance || 0)) {
      toast.error("Insufficient balance in source account.");
      return false;
    }

    return true;
  }, [fromAccount, toAccount, amount, fromAccountBalance, isReady]);

  const handleSubmit = async () => {
    if (isTransferLoading || !validateTransfer()) return;

    const toastId = toast.loading("Processing your transfer...");
    setIsTransferLoading(true);

    try {
      const res = await userApi.post(`/transfer`, {
        fromAccountNumber: fromAccount,
        toAccountNumber: toAccount,
        amount: Number(amount),
        note: "transfer",
      });

      toast.success(res?.data?.message || "Transfer completed successfully!", {
        id: toastId,
      });

      setShowSuccess(true);
      setAmount("");

      refreshBalances();

      window.setTimeout(() => setShowSuccess(false), 2500);
    } catch (e: any) {
      toast.error(getToastError(e, "Transfer failed"), { id: toastId });
    } finally {
      setIsTransferLoading(false);
    }
  };

  const fetchTransferTransactions = useCallback(async (signal?: AbortSignal) => {
    try {
      setTxnLoading(true);
      setTxnError(null);

      const res = await userApi.get("/account-txn", signal ? { signal } : undefined);
      const payload = res?.data?.data;

      if (!Array.isArray(payload) || payload.length === 0) {
        setTransferTransactions([]);
        setTxnError("No transfer transaction data available.");
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
      }));

      setTransferTransactions(normalized);
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.message === "canceled") return;
      setTransferTransactions([]);
      setTxnError("Failed to fetch transfer transactions. Please try again.");
    } finally {
      setTxnLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!showTxnModal) return;

    const controller = new AbortController();
    fetchTransferTransactions(controller.signal);

    return () => controller.abort();
  }, [showTxnModal, fetchTransferTransactions]);

  useEffect(() => {
    if (!showTxnModal) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [showTxnModal]);

  const filteredTransferTransactions = useMemo(() => {
    if (!txnQ.trim()) return transferTransactions;

    const term = txnQ.trim().toLowerCase();

    return transferTransactions.filter((row) =>
      Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(term))
    );
  }, [txnQ, transferTransactions]);

  const txnStats = useMemo(() => {
    const total = filteredTransferTransactions.reduce(
      (sum, item: any) => sum + (Number(item.amount) || 0),
      0
    );

    const sent = filteredTransferTransactions.filter(
      (item: any) => String(item.direction).toLowerCase() === "sent"
    ).length;

    const received = filteredTransferTransactions.filter(
      (item: any) => String(item.direction).toLowerCase() === "received"
    ).length;

    return {
      total,
      sent,
      received,
      rows: filteredTransferTransactions.length,
    };
  }, [filteredTransferTransactions]);

  const projectedSourceBalance = Number(fromAccountBalance || 0) - Number(amount || 0);
  const projectedDestinationBalance = Number(toAccountBalance || 0) + Number(amount || 0);

  const statusStyle = (status: any) => {
    const tone = statusTone(status);

    if (tone === "approved") {
      return {
        background: isDark ? "rgba(16,185,129,0.12)" : "rgba(22,163,74,0.09)",
        border: isDark
          ? "1px solid rgba(16,185,129,0.22)"
          : "1px solid rgba(22,163,74,0.16)",
        color: colors.success,
      };
    }

    if (tone === "pending") {
      return {
        background: isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.08)",
        border: isDark
          ? "1px solid rgba(245,158,11,0.22)"
          : "1px solid rgba(245,158,11,0.16)",
        color: colors.warning,
      };
    }

    if (tone === "rejected") {
      return {
        background: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.08)",
        border: isDark
          ? "1px solid rgba(239,68,68,0.22)"
          : "1px solid rgba(239,68,68,0.16)",
        color: colors.danger,
      };
    }

    return {
      background: colors.surfaceSoft,
      border: `1px solid ${colors.border}`,
      color: colors.text,
    };
  };

  const txnModal =
    typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {showTxnModal && (
              <motion.div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5"
                style={{
                  background: colors.modalOverlay,
                  backdropFilter: "blur(8px)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowTxnModal(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden border"
                  style={{
                    borderColor: colors.border,
                    background: colors.pageBg,
                    boxShadow: isDark
                      ? "0 30px 80px rgba(0,0,0,0.45)"
                      : "0 30px 80px rgba(245,158,11,0.16)",
                    borderRadius: "24px",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="border-b px-4 py-4 sm:px-6"
                    style={{
                      borderColor: colors.border,
                      background: colors.surface,
                    }}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <Activity className="h-4 w-4" style={{ color: colors.accent }} />
                          <span
                            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                            style={{ color: colors.muted }}
                          >
                            transfer · transaction · records
                          </span>
                        </div>

                        <h2
                          className="text-2xl font-bold sm:text-3xl"
                          style={{ color: colors.text, fontFamily: "'Poppins', sans-serif" }}
                        >
                          Transfer Transactions
                        </h2>

                        <p className="mt-2 text-sm sm:text-[15px]" style={{ color: colors.muted }}>
                          Here you can view all internal transfer records and their current status.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fetchTransferTransactions()}
                          className="inline-flex items-center gap-2 border px-4 py-2.5 text-sm font-semibold transition-all duration-300"
                          style={{
                            borderColor: colors.border,
                            background: colors.surface,
                            color: colors.text,
                            borderRadius: "14px",
                          }}
                        >
                          <RefreshCcw className="h-4 w-4" />
                          Refresh
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowTxnModal(false)}
                          className="inline-flex items-center gap-2 border px-4 py-2.5 text-sm font-semibold transition-all duration-300"
                          style={{
                            borderColor: isDark
                              ? "rgba(239,68,68,0.24)"
                              : "rgba(239,68,68,0.18)",
                            background: isDark
                              ? "rgba(239,68,68,0.08)"
                              : "rgba(254,242,242,0.92)",
                            color: colors.danger,
                            borderRadius: "14px",
                          }}
                        >
                          <X className="h-4 w-4" />
                          Close
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto p-4 sm:p-5 md:p-6">
                    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <StatCard
                        colors={colors}
                        icon={<Wallet className="h-5 w-5" />}
                        label="Transfer Total"
                        value={`$${money(txnStats.total)}`}
                        tone="info"
                      />

                      <StatCard
                        colors={colors}
                        icon={<CircleDollarSign className="h-5 w-5" />}
                        label="Sent"
                        value={txnStats.sent}
                        tone="warning"
                      />

                      <StatCard
                        colors={colors}
                        icon={<Gauge className="h-5 w-5" />}
                        label="Received"
                        value={txnStats.received}
                        tone="success"
                      />

                      <StatCard
                        colors={colors}
                        icon={<TrendingUp className="h-5 w-5" />}
                        label="Rows"
                        value={txnStats.rows}
                      />
                    </div>

                    <div className="mb-5">
                      <div className="relative max-w-md">
                        <Search
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                          style={{ color: isDark ? colors.muted : colors.primaryBtn }}
                        />

                        <input
                          value={txnQ}
                          onChange={(e) => setTxnQ(e.target.value)}
                          placeholder="Search by account, direction, status..."
                          className="w-full border py-2.5 pl-9 pr-3 outline-none transition-all duration-300 placeholder:text-amber-400"
                          style={{
                            borderColor: colors.inputBorder,
                            background: colors.inputBg,
                            color: colors.text,
                            borderRadius: "14px",
                            boxShadow: colors.inputShadow,
                          }}
                        />
                      </div>
                    </div>

                    <SectionCard
                      style={{
                        background: colors.surface,
                        borderColor: colors.border,
                        boxShadow: colors.cardShadow,
                      }}
                    >
                      <div className="overflow-x-auto">
                        <AnimatePresence mode="wait">
                          {txnLoading ? (
                            <motion.div
                              key="txn-loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="p-5"
                            >
                              <div className="py-8 text-center">
                                <LoaderIcon color={colors.accent} />

                                <p
                                  className="mt-4 text-sm font-semibold uppercase tracking-[0.2em]"
                                  style={{ color: colors.muted }}
                                >
                                  Fetching transfers...
                                </p>
                              </div>

                              <SkeletonTable cols={7} colors={colors} />
                            </motion.div>
                          ) : txnError ? (
                            <motion.div
                              key="txn-error"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="p-6"
                            >
                              <EmptyState
                                title={txnError}
                                subtitle="Please refresh to reload transfer transactions."
                                colors={colors}
                              />
                            </motion.div>
                          ) : filteredTransferTransactions.length === 0 ? (
                            <motion.div
                              key="txn-empty"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="p-6"
                            >
                              <EmptyState
                                title="No transfer transactions found"
                                subtitle="Your account transfer history will appear here once available."
                                colors={colors}
                              />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="txn-table"
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -12 }}
                            >
                              <table className="w-full text-sm">
                                <thead
                                  style={{
                                    background: colors.tableHead,
                                    borderBottom: `1px solid ${colors.border}`,
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
                                        style={{ color: colors.muted }}
                                      >
                                        {head}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>

                                <tbody>
                                  {filteredTransferTransactions.map((item: any, i: number) => {
                                    const dir = String(item?.direction || "").toLowerCase();

                                    const dirColor =
                                      dir === "sent"
                                        ? colors.warning
                                        : dir === "received"
                                        ? colors.success
                                        : colors.accent;

                                    return (
                                      <tr
                                        key={item?._id || i}
                                        className="transition-all duration-200"
                                        style={{
                                          borderBottom: `1px solid ${colors.borderSoft}`,
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = colors.rowHover;
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = "transparent";
                                        }}
                                      >
                                        <td className="px-4 py-3 text-center">
                                          <span
                                            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold"
                                            style={{
                                              background: colors.surfaceSoft,
                                              borderColor: colors.border,
                                              color: dirColor,
                                            }}
                                          >
                                            <ArrowRightLeft className="h-3.5 w-3.5" />
                                            {(dir || "unknown").toUpperCase()}
                                          </span>
                                        </td>

                                        <td
                                          className="px-4 py-3 text-center font-mono text-sm"
                                          style={{ color: colors.text }}
                                        >
                                          #{item?.fromAccountNumber || "—"}
                                        </td>

                                        <td
                                          className="px-4 py-3 text-center font-mono text-sm"
                                          style={{ color: colors.text }}
                                        >
                                          #{item?.toAccountNumber || "—"}
                                        </td>

                                        <td
                                          className="px-4 py-3 text-center font-semibold"
                                          style={{ color: colors.text }}
                                        >
                                          ${money(item?.amount)}
                                        </td>

                                        <td
                                          className="px-4 py-3 text-center text-xs"
                                          style={{ color: colors.muted }}
                                        >
                                          {item?.note ? String(item.note).slice(0, 40) : "—"}

                                          {item?.failureReason ? (
                                            <div className="mt-1" style={{ color: colors.danger }}>
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
                                          style={{ color: colors.muted }}
                                        >
                                          {formatDate(item?.createdAt)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </SectionCard>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
      <div className="min-h-screen w-full" style={{ background: colors.pageBg }}>
        <div className="w-full" style={{ background: colors.heroBg }}>
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-5 lg:px-6">
            <div className="leading-none">
              <div className="text-[28px] font-bold text-white sm:text-[32px]">
                Transfer Funds
              </div>

              <div className="mt-2 text-sm text-white/80">
                Move funds securely between your linked trading accounts
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-6 text-sm text-white/90 md:flex">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Internal Transfer
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTxnModal(true)}
                className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15"
                style={{ borderRadius: "14px" }}
              >
                <Activity className="h-4 w-4" />
                Transfer Transactions
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 py-5 lg:px-6">
          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard
              colors={colors}
              icon={<Wallet className="h-5 w-5" />}
              label="Linked Accounts"
              value={accounts.length}
              hint="Available for internal transfer"
            />

            <StatCard
              colors={colors}
              icon={<DollarSign className="h-5 w-5" />}
              label="Source Balance"
              value={
                loadingFromBalance ? (
                  <span className="inline-flex items-center gap-2">
                    <LoaderIcon color={colors.accent} />
                  </span>
                ) : (
                  `$${formatBalance(fromAccountBalance || 0)}`
                )
              }
              hint={fromAccount || "Select source"}
              tone="success"
            />

            <StatCard
              colors={colors}
              icon={<Landmark className="h-5 w-5" />}
              label="Destination Balance"
              value={
                loadingToBalance ? (
                  <span className="inline-flex items-center gap-2">
                    <LoaderIcon color={colors.accent} />
                  </span>
                ) : (
                  `$${formatBalance(toAccountBalance || 0)}`
                )
              }
              hint={toAccount || "Select destination"}
              tone="info"
            />

            <StatCard
              colors={colors}
              icon={<CircleDollarSign className="h-5 w-5" />}
              label="Projected Source"
              value={
                loadingFromBalance
                  ? "Waiting for live balance..."
                  : fromAccount && amount
                  ? `$${formatBalance(projectedSourceBalance > 0 ? projectedSourceBalance : 0)}`
                  : "$0.00"
              }
              hint="After transfer"
              tone="warning"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-8">
              <TransferFormPanel
                colors={colors}
                fromAccount={fromAccount}
                setFromAccount={setFromAccount}
                toAccount={toAccount}
                setToAccount={setToAccount}
                amount={amount}
                setAmount={setAmount}
                fromAccountBalance={fromAccountBalance}
                toAccountBalance={toAccountBalance}
                loadingFromBalance={loadingFromBalance}
                loadingToBalance={loadingToBalance}
                balancesReady={balancesReady}
                fromAccountOptions={fromAccountOptions}
                toAccountOptions={toAccountOptions}
                refreshBalances={refreshBalances}
                handleSubmit={handleSubmit}
                isTransferLoading={isTransferLoading}
              />
            </div>

            <div className="xl:col-span-4">
              <div className="sticky top-4 space-y-4" ref={submitRequestRef}>
                <SectionCard
                  style={{
                    background: colors.surface,
                    borderColor: colors.border,
                    boxShadow: colors.cardShadow,
                  }}
                >
                  <div className="p-5">
                    <div
                      className="mb-4 text-[28px] font-semibold leading-none"
                      style={{ color: colors.text }}
                    >
                      Transfer Details
                    </div>

                    <div className="space-y-4 border p-4" style={subtleCard()}>
                      <div className="flex items-center justify-between">
                        <span style={{ color: colors.text }}>From Account</span>
                        <span style={{ color: colors.text }}>{fromAccount || "—"}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span style={{ color: colors.text }}>To Account</span>
                        <span style={{ color: colors.text }}>{toAccount || "—"}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span style={{ color: colors.text }}>Transfer Amount</span>
                        <span style={{ color: colors.text }}>
                          ${formatBalance(amount || 0)}
                        </span>
                      </div>

                      <div className="border-t pt-4" style={{ borderColor: colors.border }}>
                        <div className="flex items-center justify-between">
                          <span
                            className="text-lg font-semibold"
                            style={{ color: colors.text }}
                          >
                            Projected Destination
                          </span>

                          <span
                            className="text-lg font-semibold"
                            style={{ color: colors.text }}
                          >
                            {loadingToBalance
                              ? "Waiting for live balance..."
                              : `$${formatBalance(
                                  projectedDestinationBalance > 0
                                    ? projectedDestinationBalance
                                    : 0
                                )}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="mt-4 text-base font-semibold"
                      style={{ color: colors.success }}
                    >
                      {loadingFromBalance
                        ? "Waiting for live source balance..."
                        : `Live source balance $${formatBalance(fromAccountBalance || 0)}`}
                    </div>

                    <div
                      className="mt-4 border px-4 py-3"
                      style={{
                        background: isDark
                          ? "rgba(245,158,11,0.08)"
                          : "rgba(245,158,11,0.06)",
                        borderColor: isDark
                          ? "rgba(245,158,11,0.16)"
                          : "rgba(245,158,11,0.14)",
                        borderRadius: "16px",
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <Percent
                          className="mt-0.5 h-4 w-4"
                          style={{ color: colors.warning }}
                        />

                        <div className="text-sm" style={{ color: colors.text }}>
                          Check both account numbers carefully before final transfer submission.
                        </div>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>
            </div>
          </div>

          <div
            className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm"
            style={{ color: colors.muted }}
          >
            <div className="flex flex-wrap items-center gap-4">
              <span>Policies: Returns Policy</span>
              <span>Terms of use</span>
              <span>Security</span>
              <span>Privacy</span>
            </div>

            <div>© 2007-2026 secure transfer</div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess &&
          typeof document !== "undefined" &&
          createPortal(
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm"
            >
              <div
                className="w-full max-w-md rounded-[28px] border p-6 text-center shadow-2xl"
                style={{
                  borderColor: colors.border,
                  background: colors.surface,
                  color: colors.text,
                  boxShadow: colors.isDark
                    ? "0 30px 80px rgba(0,0,0,0.45)"
                    : "0 30px 80px rgba(245,158,11,0.16)",
                }}
              >
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{
                    background: isDark
                      ? "rgba(16,185,129,0.10)"
                      : "rgba(240,253,244,0.90)",
                    color: colors.success,
                  }}
                >
                  <CheckCircle2 size={30} />
                </div>

                <h3 className="text-xl font-bold">Transfer Successful</h3>

                <p className="mt-2 text-sm" style={{ color: colors.muted }}>
                  Your funds were moved successfully between the selected accounts.
                </p>
              </div>
            </motion.div>,
            document.body
          )}
      </AnimatePresence>

      {txnModal}
    </>
  );
}
