import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowRightLeft,
  Wallet,
  ArrowRight,
  RefreshCcw,
  Landmark,
  BadgeDollarSign,
  Shield,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Activity,
  CircleDollarSign,
  Gauge,
  CreditCard,
  Search,
  X,
} from "lucide-react";

import { userApi } from "../../utils/apiClients";

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

const getAccountLabel = (account: AccountType) => {
  return account?.accountType || account?.type || "Standard";
};

function statusTone(status: any) {
  const s = String(status || "").toLowerCase();

  if (s === "approved" || s === "completed" || s === "success") return "approved";
  if (s === "pending" || s === "processing") return "pending";
  if (s === "rejected" || s === "failed" || s === "reversed") return "rejected";

  return "unknown";
}

/* -------------------- shared ui -------------------- */
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
      className={[
        "rounded-[24px] border transition-all duration-300",
        className,
      ].join(" ")}
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

function StatCard({
  icon,
  label,
  value,
  hint,
  theme,
  isDark,
  tone = "default",
}: any) {
  const toneStyles =
    tone === "success"
      ? {
          iconBg: isDark ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.10)",
          iconColor: isDark ? "rgba(52,211,153,0.95)" : "rgba(5,150,105,0.95)",
          border: isDark ? "rgba(16,185,129,0.18)" : "rgba(16,185,129,0.16)",
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
            {value}
          </div>

          {hint ? (
            <div
              className="mt-1 text-[11px]"
              style={{
                color: isDark
                  ? rgba(theme?.fg || "255 255 255", 0.48)
                  : "rgba(100,116,139,0.88)",
              }}
            >
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
    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" style={{ color }}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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

export default function UserTransfer() {
  const mode = useSelector((store: RootState) => store.userTheme?.mode || "light");
  const loggedUser = useSelector((store: RootState) => store.user?.loggedUser);
  const themeConfig = useSelector((store: RootState) => store.user?.themeConfig);

  const isDark = mode === "dark";
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");

  const [fromAccountBalance, setFromAccountBalance] = useState<string | number>("");
  const [toAccountBalance, setToAccountBalance] = useState<string | number>("");

  const [loadingFromBalance, setLoadingFromBalance] = useState(false);
  const [loadingToBalance, setLoadingToBalance] = useState(false);
  const [isTransferLoading, setIsTransferLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showStatsOverview, setShowStatsOverview] = useState(true);

  const [showTxnModal, setShowTxnModal] = useState(false);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnError, setTxnError] = useState<string | null>(null);
  const [txnQ, setTxnQ] = useState("");
  const [transferTransactions, setTransferTransactions] = useState<any[]>([]);

  const accounts = useMemo(() => loggedUser?.accounts || [], [loggedUser]);

  const titleColor = isDark
    ? rgba(theme?.fg || "255 255 255", 0.96)
    : "rgba(15,23,42,0.98)";

  const mutedTextColor = isDark
    ? rgba(theme?.fg || "255 255 255", 0.62)
    : "rgba(100,116,139,0.96)";

  const accentColor = isDark
    ? "rgba(96,165,250,0.95)"
    : "rgba(249,115,22,0.95)";

  const selectStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "16px",
    padding: "13px 42px 13px 14px",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.92)",
    color: isDark ? rgba(theme?.fg || "255 255 255", 0.92) : "rgba(30,41,59,0.96)",
    border: isDark
      ? `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`
      : "1px solid rgba(251,146,60,0.16)",
  };

  const inputStyle: React.CSSProperties = {
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.92)",
    color: titleColor,
    border: isDark
      ? `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`
      : "1px solid rgba(251,146,60,0.16)",
    borderRadius: "16px",
    outline: "none",
  };

  const optionStyle: React.CSSProperties = {
    background: isDark ? "#111827" : "#ffffff",
    color: isDark ? "#ffffff" : "#0f172a",
  };

  const subtleCard = (): React.CSSProperties => ({
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.82)",
    border: isDark
      ? `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`
      : "1px solid rgba(251,146,60,0.14)",
    borderRadius: "14px",
  });

  const primaryButtonStyle: React.CSSProperties = {
    borderRadius: "999px",
    color: "#fff",
    background: isDark
      ? "linear-gradient(90deg, rgba(59,130,246,0.95), rgba(34,211,238,0.9))"
      : "linear-gradient(90deg, rgba(249,115,22,0.96), rgba(251,146,60,0.92))",
    boxShadow: isDark
      ? "0 14px 34px rgba(59,130,246,0.22)"
      : "0 14px 34px rgba(249,115,22,0.18)",
  };

  const fromAccountOptions = useMemo(() => {
    return accounts.filter(
      (acc) => String(acc.accountNumber) !== String(toAccount)
    );
  }, [accounts, toAccount]);

  const toAccountOptions = useMemo(() => {
    return accounts.filter(
      (acc) => String(acc.accountNumber) !== String(fromAccount)
    );
  }, [accounts, fromAccount]);

  const getAccountMeta = useCallback(
    (accountNumber: string) => {
      return (
        accounts.find(
          (acc) => String(acc.accountNumber) === String(accountNumber)
        ) || {}
      );
    },
    [accounts]
  );

  const fetchAccountBalance = useCallback(
    async (
      accountNumber: string,
      setBalance: React.Dispatch<React.SetStateAction<string | number>>,
      setLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      if (!accountNumber) {
        setBalance("");
        return;
      }

      try {
        setLoading(true);
        setBalance("");

        const res = await userApi.get(`/transfer/balance`, {
          params: { accountNumber },
        });

        setBalance(res?.data?.balance ?? "0.00");
      } catch (e: any) {
        toast.error(getToastError(e, "Failed to fetch balance"));
        setBalance("0.00");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAccountBalance(fromAccount, setFromAccountBalance, setLoadingFromBalance);
  }, [fromAccount, fetchAccountBalance]);

  useEffect(() => {
    fetchAccountBalance(toAccount, setToAccountBalance, setLoadingToBalance);
  }, [toAccount, fetchAccountBalance]);

  const validateTransfer = useCallback(() => {
    if (!fromAccount || !toAccount) {
      toast.error("Please select both source and destination accounts.");
      return false;
    }

    if (fromAccount === toAccount) {
      toast.error("Source and destination accounts must be different.");
      return false;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid transfer amount.");
      return false;
    }

    const fromBalanceNum = parseFloat(String(fromAccountBalance || "0"));
    const amountNum = parseFloat(String(amount || "0"));

    if (!Number.isNaN(fromBalanceNum) && amountNum > fromBalanceNum) {
      toast.error("Insufficient balance in source account.");
      return false;
    }

    return true;
  }, [fromAccount, toAccount, amount, fromAccountBalance]);

  const refreshBalances = useCallback(async () => {
    await Promise.all([
      fromAccount
        ? fetchAccountBalance(fromAccount, setFromAccountBalance, setLoadingFromBalance)
        : Promise.resolve(),
      toAccount
        ? fetchAccountBalance(toAccount, setToAccountBalance, setLoadingToBalance)
        : Promise.resolve(),
    ]);
  }, [fromAccount, toAccount, fetchAccountBalance]);

  const handleSwapAccounts = () => {
    if (!fromAccount && !toAccount) return;

    const prevFrom = fromAccount;
    const prevTo = toAccount;

    setFromAccount(prevTo);
    setToAccount(prevFrom);
  };

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

      const balances = res?.data?.balances;
      if (balances) {
        setFromAccountBalance(balances.from ?? "0.00");
        setToAccountBalance(balances.to ?? "0.00");
      } else {
        await refreshBalances();
      }

      window.setTimeout(() => setShowSuccess(false), 2500);
    } catch (e: any) {
      toast.error(getToastError(e, "Transfer failed"), { id: toastId });
    } finally {
      setIsTransferLoading(false);
    }
  };

  const fetchTransferTransactions = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setTxnLoading(true);
        setTxnError(null);

        const res = await userApi.get(
          "/account-txn",
          signal ? { signal } : undefined
        );

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
          updatedAt: item.updatedAt || null,
        }));

        setTransferTransactions(normalized);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.message === "canceled") return;
        setTransferTransactions([]);
        setTxnError("Failed to fetch transfer transactions. Please try again.");
      } finally {
        setTxnLoading(false);
      }
    },
    []
  );

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
      Object.values(row).some((v) =>
        String(v ?? "").toLowerCase().includes(term)
      )
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

  const fromMeta = getAccountMeta(fromAccount);
  const toMeta = getAccountMeta(toAccount);
  const amountNum = Number(amount || 0);
  const sourceBalanceNum = Number(fromAccountBalance || 0);
  const projectedBalance = sourceBalanceNum - amountNum;

  const ctaEnabled =
    fromAccount &&
    toAccount &&
    amount &&
    Number(amount) > 0 &&
    Number(amount) <= Number(fromAccountBalance || 0) &&
    !isTransferLoading;

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

  const txnModal =
    typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {showTxnModal && (
              <motion.div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5"
                style={{
                  background: "rgba(2,6,23,0.72)",
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
                  className="flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[28px] border"
                  style={{
                    borderColor: isDark
                      ? rgba(theme?.border || "255 255 255", 0.12)
                      : "rgba(251,146,60,0.16)",
                    background: isDark
                      ? "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(2,6,23,0.98))"
                      : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,247,240,0.96))",
                    boxShadow: isDark
                      ? "0 30px 80px rgba(0,0,0,0.45)"
                      : "0 30px 80px rgba(249,115,22,0.16)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="border-b px-4 py-4 sm:px-6"
                    style={{
                      borderColor: isDark
                        ? rgba(theme?.border || "255 255 255", 0.1)
                        : "rgba(251,146,60,0.12)",
                      background: isDark
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(255,255,255,0.45)",
                    }}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <Activity className="h-4 w-4" style={{ color: accentColor }} />
                          <span
                            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                            style={{ color: mutedTextColor }}
                          >
                            transfer · transaction · records
                          </span>
                        </div>

                        <h2
                          className="text-2xl font-bold sm:text-3xl"
                          style={{ color: titleColor, fontFamily: "'Poppins', sans-serif" }}
                        >
                          Transfer Transactions
                        </h2>

                        <p
                          className="mt-2 text-sm sm:text-[15px]"
                          style={{ color: mutedTextColor }}
                        >
                          Yahan aapke saare account transfer records dikhenge.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fetchTransferTransactions()}
                          className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all duration-300"
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

                        <button
                          type="button"
                          onClick={() => setShowTxnModal(false)}
                          className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all duration-300"
                          style={{
                            borderColor: isDark
                              ? "rgba(239,68,68,0.24)"
                              : "rgba(239,68,68,0.18)",
                            background: isDark
                              ? "rgba(239,68,68,0.08)"
                              : "rgba(254,242,242,0.92)",
                            color: isDark
                              ? "rgba(248,113,113,0.95)"
                              : "rgba(220,38,38,0.95)",
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
                        theme={theme}
                        isDark={isDark}
                        icon={<Wallet className="h-5 w-5" />}
                        label="Transfer Total"
                        value={`$${money(txnStats.total)}`}
                        tone="info"
                      />
                      <StatCard
                        theme={theme}
                        isDark={isDark}
                        icon={<CircleDollarSign className="h-5 w-5" />}
                        label="Sent"
                        value={txnStats.sent}
                        tone="warning"
                      />
                      <StatCard
                        theme={theme}
                        isDark={isDark}
                        icon={<Gauge className="h-5 w-5" />}
                        label="Received"
                        value={txnStats.received}
                        tone="success"
                      />
                      <StatCard
                        theme={theme}
                        isDark={isDark}
                        icon={<TrendingUp className="h-5 w-5" />}
                        label="Rows"
                        value={txnStats.rows}
                        tone="default"
                      />
                    </div>

                    <div className="mb-5">
                      <div className="relative max-w-md">
                        <Search
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                          style={{ color: mutedTextColor }}
                        />
                        <input
                          value={txnQ}
                          onChange={(e) => setTxnQ(e.target.value)}
                          placeholder="Search by account, direction, status..."
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
                    </div>

                    <SectionCard theme={theme} isDark={isDark} className="overflow-hidden">
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
                                <LoaderIcon color={accentColor} />
                                <p
                                  className="mt-4 text-sm font-semibold uppercase tracking-[0.2em]"
                                  style={{ color: mutedTextColor }}
                                >
                                  Fetching transfers...
                                </p>
                              </div>

                              <SkeletonTable cols={7} theme={theme} isDark={isDark} />
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
                                theme={theme}
                                isDark={isDark}
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
                                theme={theme}
                                isDark={isDark}
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
                                  {filteredTransferTransactions.map((item: any, i: number) => {
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" style={{ color: accentColor }} />
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: mutedTextColor }}
                  >
                    transfer · wallet · internal
                  </span>
                </div>

                <h1
                  className="text-3xl font-bold sm:text-4xl"
                  style={{
                    color: titleColor,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Transfer Between Accounts
                </h1>

                <p className="mt-2 text-sm sm:text-[15px]" style={{ color: mutedTextColor }}>
                  Move funds securely between your linked trading wallets with
                  live balances and a polished internal transfer flow.
                </p>
              </div>

              <div className="flex items-center justify-start sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowTxnModal(true)}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-300"
                  style={{
                    borderColor: isDark
                      ? "rgba(96,165,250,0.28)"
                      : "rgba(249,115,22,0.24)",
                    background: isDark
                      ? "rgba(59,130,246,0.10)"
                      : "rgba(255,237,213,0.72)",
                    color: accentColor,
                  }}
                >
                  <Activity className="h-4 w-4" />
                  Transfer Txn
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 md:p-6">
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowStatsOverview((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-[22px] border px-4 py-3 text-left transition-all duration-300"
                style={{
                  borderColor: isDark
                    ? rgba(theme?.border || "255 255 255", 0.1)
                    : "rgba(251,146,60,0.14)",
                  background: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(255,255,255,0.84)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border"
                    style={{
                      borderColor: isDark
                        ? rgba(theme?.border || "255 255 255", 0.12)
                        : "rgba(251,146,60,0.14)",
                      background: isDark
                        ? "rgba(59,130,246,0.10)"
                        : "rgba(255,237,213,0.65)",
                      color: accentColor,
                    }}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                  </div>

                  <div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: titleColor }}
                    >
                      Transfer Overview
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: mutedTextColor }}
                    >
                      Linked accounts, selected balances and projected summary
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{ color: mutedTextColor }}
                  >
                    {showStatsOverview ? "Collapse" : "Expand"}
                  </span>

                  <motion.div
                    animate={{ rotate: showStatsOverview ? 0 : -180 }}
                    transition={{ duration: 0.25 }}
                  >
                    {showStatsOverview ? (
                      <ChevronUp className="h-5 w-5" style={{ color: accentColor }} />
                    ) : (
                      <ChevronDown className="h-5 w-5" style={{ color: accentColor }} />
                    )}
                  </motion.div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {showStatsOverview && (
                  <motion.div
                    key="stats-overview"
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <StatCard
                        theme={theme}
                        isDark={isDark}
                        icon={<Wallet className="h-5 w-5" />}
                        label="Linked Accounts"
                        value={accounts.length}
                        hint="Available for internal transfer"
                        tone="default"
                      />

                      <StatCard
                        theme={theme}
                        isDark={isDark}
                        icon={<DollarSign className="h-5 w-5" />}
                        label="Source Balance"
                        value={
                          loadingFromBalance ? (
                            <span className="inline-flex items-center gap-2">
                              <LoaderIcon color={accentColor} />
                            </span>
                          ) : (
                            `$${formatBalance(fromAccountBalance || 0)}`
                          )
                        }
                        hint={fromAccount || "Select source account"}
                        tone="success"
                      />

                      <StatCard
                        theme={theme}
                        isDark={isDark}
                        icon={<Landmark className="h-5 w-5" />}
                        label="Destination Balance"
                        value={
                          loadingToBalance ? (
                            <span className="inline-flex items-center gap-2">
                              <LoaderIcon color={accentColor} />
                            </span>
                          ) : (
                            `$${formatBalance(toAccountBalance || 0)}`
                          )
                        }
                        hint={toAccount || "Select destination account"}
                        tone="info"
                      />

                      <StatCard
                        theme={theme}
                        isDark={isDark}
                        icon={<BadgeDollarSign className="h-5 w-5" />}
                        label="Projected Balance"
                        value={
                          fromAccount && amount
                            ? `$${formatBalance(projectedBalance > 0 ? projectedBalance : 0)}`
                            : "$0.00"
                        }
                        hint="After transfer completes"
                        tone="warning"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <SectionCard theme={theme} isDark={isDark} className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 gap-5">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_auto_1fr] md:items-start">
                      <div>
                        <label
                          className="mb-2 flex items-center gap-2 text-sm font-semibold"
                          style={{ color: titleColor }}
                        >
                          <Wallet className="h-4 w-4" style={{ color: accentColor }} />
                          1. From Account
                        </label>

                        <div className="relative">
                          <select
                            value={fromAccount}
                            onChange={(e) => setFromAccount(e.target.value)}
                            style={selectStyle}
                          >
                            <option value="" style={optionStyle}>
                              Select source wallet
                            </option>
                            {fromAccountOptions.map((account) => {
                              const currency =
                                account.currency || account.accountCurrency || "USD";

                              return (
                                <option
                                  key={account.accountNumber}
                                  value={account.accountNumber}
                                  style={optionStyle}
                                >
                                  {account.accountNumber} • {currency}
                                </option>
                              );
                            })}
                          </select>

                          <ChevronDown
                            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                            style={{ color: mutedTextColor }}
                          />
                        </div>

                        {fromAccount && (
                          <div className="mt-3 rounded-2xl border p-4" style={subtleCard()}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-xs" style={{ color: mutedTextColor }}>
                                  Wallet Type
                                </div>
                                <div className="mt-1 text-sm font-semibold" style={{ color: titleColor }}>
                                  {getAccountLabel(fromMeta as AccountType)}
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-xs" style={{ color: mutedTextColor }}>
                                  Balance
                                </div>
                                <div className="mt-1 text-sm font-bold" style={{ color: titleColor }}>
                                  {loadingFromBalance
                                    ? "Loading..."
                                    : `$${formatBalance(fromAccountBalance)}`}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-end justify-center md:pb-3">
                        <motion.button
                          type="button"
                          onClick={handleSwapAccounts}
                          whileTap={{ scale: 0.96 }}
                          className="flex h-12 w-12 items-center justify-center rounded-2xl border transition-all"
                          style={{
                            borderColor: isDark
                              ? rgba(theme?.border || "255 255 255", 0.12)
                              : "rgba(251,146,60,0.16)",
                            background: isDark
                              ? "rgba(255,255,255,0.03)"
                              : "rgba(255,255,255,0.92)",
                            color: accentColor,
                          }}
                        >
                          <ArrowRightLeft size={18} />
                        </motion.button>
                      </div>

                      <div>
                        <label
                          className="mb-2 flex items-center gap-2 text-sm font-semibold"
                          style={{ color: titleColor }}
                        >
                          <Landmark className="h-4 w-4" style={{ color: accentColor }} />
                          2. To Account
                        </label>

                        <div className="relative">
                          <select
                            value={toAccount}
                            onChange={(e) => setToAccount(e.target.value)}
                            style={selectStyle}
                          >
                            <option value="" style={optionStyle}>
                              Select destination wallet
                            </option>
                            {toAccountOptions.map((account) => {
                              const currency =
                                account.currency || account.accountCurrency || "USD";

                              return (
                                <option
                                  key={account.accountNumber}
                                  value={account.accountNumber}
                                  style={optionStyle}
                                >
                                  {account.accountNumber} • {currency}
                                </option>
                              );
                            })}
                          </select>

                          <ChevronDown
                            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                            style={{ color: mutedTextColor }}
                          />
                        </div>

                        {toAccount && (
                          <div className="mt-3 rounded-2xl border p-4" style={subtleCard()}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-xs" style={{ color: mutedTextColor }}>
                                  Wallet Type
                                </div>
                                <div className="mt-1 text-sm font-semibold" style={{ color: titleColor }}>
                                  {getAccountLabel(toMeta as AccountType)}
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-xs" style={{ color: mutedTextColor }}>
                                  Balance
                                </div>
                                <div className="mt-1 text-sm font-bold" style={{ color: titleColor }}>
                                  {loadingToBalance
                                    ? "Loading..."
                                    : `$${formatBalance(toAccountBalance)}`}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        className="mb-2 flex items-center gap-2 text-sm font-semibold"
                        style={{ color: titleColor }}
                      >
                        <CreditCard className="h-4 w-4" style={{ color: accentColor }} />
                        3. Transfer Amount
                      </label>

                      <div className="relative">
                        <DollarSign
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                          style={{ color: mutedTextColor }}
                        />
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full py-[13px] pl-10 pr-4 text-sm font-semibold"
                          style={inputStyle}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {[100, 500, 1000, 5000, 10000].map((quickAmount) => (
                          <button
                            key={quickAmount}
                            type="button"
                            onClick={() => setAmount(String(quickAmount))}
                            className="rounded-full border px-4 py-2 text-sm font-medium transition-all"
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
                            ${quickAmount.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border px-4 py-4" style={subtleCard()}>
                      <div className="flex items-center justify-between gap-4">
                        <span
                          className="text-sm font-medium"
                          style={{ color: mutedTextColor }}
                        >
                          Projected Source Balance
                        </span>

                        <span
                          className="text-xl font-bold"
                          style={{ color: titleColor }}
                        >
                          {fromAccount && amount
                            ? `$${formatBalance(projectedBalance > 0 ? projectedBalance : 0)}`
                            : "--"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex justify-center sm:justify-start gap-3">
                      <motion.button
                        type="button"
                        whileHover={{ scale: ctaEnabled ? 1.02 : 1 }}
                        whileTap={{ scale: ctaEnabled ? 0.98 : 1 }}
                        onClick={handleSubmit}
                        disabled={!ctaEnabled}
                        className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold"
                        style={{
                          ...primaryButtonStyle,
                          opacity: ctaEnabled ? 1 : 0.65,
                          cursor: ctaEnabled ? "pointer" : "not-allowed",
                        }}
                      >
                        {isTransferLoading ? (
                          <LoaderIcon color="#ffffff" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}

                        <span>Transfer Now</span>
                      </motion.button>

                      <button
                        type="button"
                        onClick={refreshBalances}
                        className="inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-all duration-300"
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
                </SectionCard>
              </div>

              <div className="lg:col-span-5 space-y-5">
                <SectionCard theme={theme} isDark={isDark} className="p-4 sm:p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{
                        background: isDark
                          ? "rgba(59,130,246,0.10)"
                          : "rgba(255,237,213,0.72)",
                        color: accentColor,
                      }}
                    >
                      <ArrowRightLeft size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: titleColor }}>
                        Transfer Summary
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: mutedTextColor }}
                      >
                        Review before submitting
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border p-4" style={subtleCard()}>
                      <div className="text-xs" style={{ color: mutedTextColor }}>From</div>
                      <div className="mt-1 font-semibold" style={{ color: titleColor }}>
                        {fromAccount || "Not selected"}
                      </div>
                    </div>

                    <div className="rounded-2xl border p-4" style={subtleCard()}>
                      <div className="text-xs" style={{ color: mutedTextColor }}>To</div>
                      <div className="mt-1 font-semibold" style={{ color: titleColor }}>
                        {toAccount || "Not selected"}
                      </div>
                    </div>

                    <div className="rounded-2xl border p-4" style={subtleCard()}>
                      <div className="text-xs" style={{ color: mutedTextColor }}>Amount</div>
                      <div className="mt-1 text-xl font-bold" style={{ color: titleColor }}>
                        ${formatBalance(amount || 0)}
                      </div>
                    </div>

                    <div className="rounded-2xl border p-4" style={subtleCard()}>
                      <div className="text-xs" style={{ color: mutedTextColor }}>Projected Source Balance</div>
                      <div className="mt-1 font-semibold" style={{ color: titleColor }}>
                        {fromAccount && amount
                          ? `$${formatBalance(projectedBalance > 0 ? projectedBalance : 0)}`
                          : "--"}
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard theme={theme} isDark={isDark} className="p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{
                        background: isDark
                          ? "rgba(16,185,129,0.10)"
                          : "rgba(209,250,229,1)",
                        color: isDark
                          ? "rgba(52,211,153,0.95)"
                          : "rgba(5,150,105,0.95)",
                      }}
                    >
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: titleColor }}>
                        Quick Notes
                      </h3>
                      <p className="text-sm" style={{ color: mutedTextColor }}>
                        Important transfer points
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      "Source and destination wallets must be different.",
                      "Balance is fetched from the selected account before transfer.",
                      "After successful transfer, balances refresh automatically.",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div
                          className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full"
                          style={{
                            background: isDark
                              ? "rgba(16,185,129,0.10)"
                              : "rgba(209,250,229,1)",
                            color: isDark
                              ? "rgba(52,211,153,0.95)"
                              : "rgba(5,150,105,0.95)",
                          }}
                        >
                          <CheckCircle2 size={14} />
                        </div>
                        <p
                          className="text-sm leading-6"
                          style={{ color: mutedTextColor }}
                        >
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

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
                  borderColor: isDark
                    ? rgba(theme?.border || "255 255 255", 0.12)
                    : "rgba(251,146,60,0.16)",
                  background: isDark
                    ? "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(2,6,23,0.98))"
                    : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,247,240,0.96))",
                  color: titleColor,
                }}
              >
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{
                    background: isDark
                      ? "rgba(16,185,129,0.10)"
                      : "rgba(240,253,244,0.90)",
                    color: isDark
                      ? "rgba(52,211,153,0.95)"
                      : "rgba(5,150,105,0.95)",
                  }}
                >
                  <CheckCircle2 size={30} />
                </div>

                <h3 className="text-xl font-bold">Transfer Successful</h3>
                <p
                  className="mt-2 text-sm"
                  style={{ color: mutedTextColor }}
                >
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