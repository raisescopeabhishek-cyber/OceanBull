import { useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Landmark,
  CheckCircle2,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ReceiptText,
  LayoutDashboard,
  History,
  Search,
  RefreshCcw,
  X,
  Activity,
  CircleDollarSign,
  Gauge,
  Shield,
  ArrowRight,
  Loader2,
  AlertCircle,
  CreditCard,
  Banknote,
  Zap,
  BadgeDollarSign,
  Eye,
} from "lucide-react";

import { userApi } from "../../utils/apiClients";
import { withdrawRequestMail } from "./emails/WithdrwalsMails";

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
      : tone === "danger"
      ? {
          iconBg: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.10)",
          iconColor: isDark ? "rgba(248,113,113,0.95)" : "rgba(220,38,38,0.95)",
          border: isDark ? "rgba(239,68,68,0.18)" : "rgba(239,68,68,0.16)",
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

export default function UserWithdraw() {
  const loggedUser = useSelector((store: any) => store.user?.loggedUser);
  const siteConfig = useSelector((state: any) => state.user?.siteConfig);
  const themeConfig = useSelector((s: any) => s.user?.themeConfig);
  const mode = useSelector((store: any) => store.userTheme?.mode || "light");

  const isDark = mode === "dark";
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const [selectedGateway, setSelectedGateway] = useState("");
  const [selectWallet, setSelectWallet] = useState("USDT(Trc20)");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [accountType, setAccountType] = useState("");

  const [apiLoader, setApiLoader] = useState(false);
  const [error, setError] = useState("");

  const [balanceLoading, setBalanceLoading] = useState(false);
  const [accountBalance, setAccountBalance] = useState<string | number>("");

  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showStatsOverview, setShowStatsOverview] = useState(true);

  /* history modal */
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnError, setTxnError] = useState<string | null>(null);
  const [txnQ, setTxnQ] = useState("");
  const [withdrawTransactions, setWithdrawTransactions] = useState<any[]>([]);

  const dollarRate = siteConfig?.dollarWithdrawalRate || 0;
  const inrUiEnabled = siteConfig?.inrUi !== false;

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

  const walletOptions = [
    { value: "USDT(Trc20)", label: "USDT (TRC-20)", icon: "₮" },
    { value: "USDT(Bep20)", label: "USDT (BEP-20)", icon: "₮" },
  ];

  const gatewayOptions = [
    {
      name: "Wallet Transfer",
      icon: <Wallet className="h-5 w-5" />,
      desc: "Withdraw directly to your crypto wallet",
    },
  ];

  const getWalletAddress = useCallback(
    (walletType: string) => {
      const mapping: Record<string, any> = {
        "USDT(Trc20)": loggedUser?.walletDetails?.tetherAddress,
        "USDT(Bep20)": loggedUser?.walletDetails?.ethAddress,
      };
      return mapping[walletType] || "Not configured";
    },
    [loggedUser?.walletDetails]
  );

  const inrAmount = useMemo(() => {
    if (!amount || !dollarRate) return "0";
    return (parseFloat(amount) * Number(dollarRate)).toFixed(2);
  }, [amount, dollarRate]);

  const numericBalance = useMemo(
    () => (accountBalance ? Number(accountBalance) : 0),
    [accountBalance]
  );

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

  useEffect(() => {
    const isValid =
      account &&
      selectedGateway &&
      amount &&
      parseFloat(amount) > 0 &&
      parseFloat(amount) <= Number(accountBalance || 0);

    setIsFormValid(Boolean(isValid));
  }, [account, selectedGateway, amount, accountBalance]);

  const fetchAccountInfo = useCallback(async () => {
    if (!account) return;

    setBalanceLoading(true);
    try {
      setAccountBalance("");
      const res = await userApi.get(`/server-logger-info?account=${account}`);

      if (res?.data?.data?.Equity !== undefined && res?.data?.data?.Equity !== null) {
        setAccountBalance(res.data.data.Equity);
      } else {
        setAccountBalance("");
      }
    } catch {
      setAccountBalance("");
    } finally {
      setBalanceLoading(false);
    }
  }, [account]);

  useEffect(() => {
    if (account) fetchAccountInfo();
  }, [account, fetchAccountInfo]);

  const fetchWithdrawTransactions = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setTxnLoading(true);
        setTxnError(null);

        if (!loggedUser?._id) {
          setWithdrawTransactions([]);
          setTxnError("Please sign in to view withdrawal transactions.");
          return;
        }

        const res = await userApi.get(
          `/withdrawals/${loggedUser._id}`,
          signal ? { signal } : undefined
        );

        const payload = res?.data?.data;

        if (!Array.isArray(payload) || payload.length === 0) {
          setWithdrawTransactions([]);
          setTxnError("No withdrawal transaction data available.");
          return;
        }

        const normalized = payload.map((item: any) => ({
          _id: item._id,
          mt5Account: item.mt5Account || item.accountNumber || item.account || "N/A",
          accountType: item.accountType || item.type || "N/A",
          amount: item.amount ?? item.withdrawal ?? item.withdrawAmount ?? 0,
          method: (item.method || "N/A").toString(),
          walletAddress:
            item.walletAddress ||
            item.address ||
            item.destinationAddress ||
            "—",
          createdAt: item.createdAt || item.created_at || item.created || null,
          updatedAt: item.updatedAt || item.updated_at || item.updated || null,
          status: item.status || "unknown",
        }));

        setWithdrawTransactions(normalized);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.message === "canceled") return;
        setWithdrawTransactions([]);
        setTxnError("Failed to fetch withdrawal transactions. Please try again.");
      } finally {
        setTxnLoading(false);
      }
    },
    [loggedUser?._id]
  );

  useEffect(() => {
    if (!showTxnModal) return;

    const controller = new AbortController();
    fetchWithdrawTransactions(controller.signal);

    return () => controller.abort();
  }, [showTxnModal, fetchWithdrawTransactions]);

  useEffect(() => {
    if (!showTxnModal) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [showTxnModal]);

  const filteredWithdrawTransactions = useMemo(() => {
    if (!txnQ.trim()) return withdrawTransactions;

    const term = txnQ.trim().toLowerCase();

    return withdrawTransactions.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? "").toLowerCase().includes(term)
      )
    );
  }, [txnQ, withdrawTransactions]);

  const txnStats = useMemo(() => {
    const total = filteredWithdrawTransactions.reduce(
      (sum, item: any) => sum + (Number(item.amount) || 0),
      0
    );

    const approved = filteredWithdrawTransactions.filter(
      (item: any) => String(item.status).toLowerCase() === "approved"
    ).length;

    const pending = filteredWithdrawTransactions.filter(
      (item: any) => String(item.status).toLowerCase() === "pending"
    ).length;

    return {
      total,
      approved,
      pending,
      rows: filteredWithdrawTransactions.length,
    };
  }, [filteredWithdrawTransactions]);

  const withdrawalHandler = async (e: any) => {
    e.preventDefault();
    if (isWithdrawing) return;

    setError("");

    if (!account || !selectedGateway || !amount || parseFloat(amount) <= 0) {
      setError("Please fill all fields correctly.");
      return;
    }

    if (parseFloat(amount) > Number(accountBalance || 0)) {
      setError("Insufficient balance for withdrawal.");
      return;
    }

    if (!loggedUser?.email) {
      setError("User email not found. Please re-login.");
      return;
    }

    setIsWithdrawing(true);
    setCurrentStep(2);

    const toastId = toast.loading("Sending OTP...");

    try {
      const sendOtpRes = await userApi.post("/send-otp", {
        email: loggedUser.email,
      });

      if (sendOtpRes?.data?.message === "OTP sent successfully") {
        toast.success("OTP sent to your email", { id: toastId });
        setShowOtpInput(true);
        setCurrentStep(3);
      } else {
        toast.error("Failed to send OTP", { id: toastId });
        setCurrentStep(1);
      }
    } catch {
      toast.error("Error sending OTP", { id: toastId });
      setCurrentStep(1);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const verifyOtpHandler = async () => {
    if (!otp) {
      setError("OTP required");
      return;
    }

    if (!loggedUser?.email) {
      setError("User email not found. Please re-login.");
      return;
    }

    setError("");
    setApiLoader(true);
    setIsWithdrawing(true);

    const toastId = toast.loading("Verifying your request...");

    try {
      await userApi.post("/verify-otp", {
        email: loggedUser.email,
        otp,
      });

      if (parseFloat(amount) > Number(accountBalance || 0)) {
        setError("You do not have enough balance for withdrawal.");
        toast.error("Insufficient balance for withdrawal", { id: toastId });
        return;
      }

      await userApi.post(`/withdrawal`, {
        method:
          selectedGateway === "Bank Transfer" ? selectedGateway : selectWallet,
        accountType,
        amount,
        mt5Account: account,
        status: "pending",
        userId: loggedUser._id,
        lastBalance: accountBalance,
      });

      const customContent = withdrawRequestMail({
        loggedUser,
        amount,
        accountBalance,
      });

      await userApi.post(`/custom-mail`, {
        email: loggedUser.email,
        content: customContent,
        subject: "Withdrawal requested",
      });

      toast.success("Withdrawal requested.", { id: toastId });
      setCurrentStep(4);
      setShowOtpInput(false);
      setOtp("");
      fetchAccountInfo();

      window.setTimeout(() => {
        setCurrentStep(1);
        setAmount("");
        setAccount("");
        setSelectedGateway("");
        setSelectWallet("USDT(Trc20)");
      }, 3000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Withdrawal failed", {
        id: toastId,
      });
    } finally {
      setApiLoader(false);
      setIsWithdrawing(false);
    }
  };

  const stepItems = [
    { step: 1, title: "Details", icon: CreditCard },
    { step: 2, title: "Processing", icon: Loader2 },
    { step: 3, title: "Verify", icon: Shield },
    { step: 4, title: "Complete", icon: CheckCircle2 },
  ];

  const ctaEnabled = isFormValid && !isWithdrawing && !apiLoader;

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
                            withdrawal · transaction · records
                          </span>
                        </div>

                        <h2
                          className="text-2xl font-bold sm:text-3xl"
                          style={{ color: titleColor, fontFamily: "'Poppins', sans-serif" }}
                        >
                          Withdrawal Transactions
                        </h2>

                        <p
                          className="mt-2 text-sm sm:text-[15px]"
                          style={{ color: mutedTextColor }}
                        >
                          Yahan aapke saare withdrawal requests aur unka status dikhega.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fetchWithdrawTransactions()}
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
                        label="Withdraw Total"
                        value={`$${money(txnStats.total)}`}
                        tone="info"
                      />
                      <StatCard
                        theme={theme}
                        isDark={isDark}
                        icon={<CircleDollarSign className="h-5 w-5" />}
                        label="Approved"
                        value={txnStats.approved}
                        tone="success"
                      />
                      <StatCard
                        theme={theme}
                        isDark={isDark}
                        icon={<Gauge className="h-5 w-5" />}
                        label="Pending"
                        value={txnStats.pending}
                        tone="warning"
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
                          placeholder="Search by account, method, wallet, status..."
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
                                  Fetching withdrawals...
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
                                subtitle="Please refresh to reload withdrawal transactions."
                                theme={theme}
                                isDark={isDark}
                              />
                            </motion.div>
                          ) : filteredWithdrawTransactions.length === 0 ? (
                            <motion.div
                              key="txn-empty"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="p-6"
                            >
                              <EmptyState
                                title="No withdrawal transactions found"
                                subtitle="Your withdrawal history will appear here once available."
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
                                      "Account",
                                      "Type",
                                      "Amount",
                                      "Method",
                                      "Wallet / Address",
                                      "Requested",
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
                                  {filteredWithdrawTransactions.map((item: any, i: number) => (
                                    <tr
                                      key={item?._id || `${item.mt5Account}-${i}`}
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
                                        ${money(item?.amount)}
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
                                        <span className="inline-block max-w-[180px] truncate align-middle">
                                          {item?.walletAddress || "—"}
                                        </span>
                                      </td>

                                      <td
                                        className="px-4 py-3 text-center text-xs"
                                        style={{ color: mutedTextColor }}
                                      >
                                        {formatDate(item?.createdAt)}
                                      </td>

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
                    withdrawal · payout · account
                  </span>
                </div>

                <h1
                  className="text-3xl font-bold sm:text-4xl"
                  style={{
                    color: titleColor,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Withdraw Funds
                </h1>

                <p className="mt-2 text-sm sm:text-[15px]" style={{ color: mutedTextColor }}>
                  Choose trading account, enter amount, verify with OTP, and submit your
                  withdrawal request securely.
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
                  <History className="h-4 w-4" />
                  Withdraw Txn
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
                      Account Overview
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: mutedTextColor }}
                    >
                      Selected account, balance and INR conversion
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <StatCard
                        theme={theme}
                        isDark={isDark}
                        icon={<Wallet className="h-5 w-5" />}
                        label="Selected Account"
                        value={account || "—"}
                        hint={accountType || "Choose an account to continue"}
                        tone="default"
                      />

                      <StatCard
                        theme={theme}
                        isDark={isDark}
                        icon={<DollarSign className="h-5 w-5" />}
                        label="Current Balance"
                        value={
                          balanceLoading ? (
                            <span className="inline-flex items-center gap-2">
                              <LoaderIcon color={accentColor} />
                            </span>
                          ) : (
                            `$${accountBalance || 0}`
                          )
                        }
                        hint="Live equity balance"
                        tone="success"
                      />

                      {inrUiEnabled ? (
                        <StatCard
                          theme={theme}
                          isDark={isDark}
                          icon={<Landmark className="h-5 w-5" />}
                          label="INR Amount"
                          value={`₹ ${inrAmount || 0}`}
                          hint={`Rate: ₹${siteConfig?.dollarWithdrawalRate || 0}`}
                          tone="info"
                        />
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* steps */}
            <div className="mb-6">
              <SectionCard theme={theme} isDark={isDark} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                  {stepItems.map(({ step, title, icon: Icon }, index) => (
                    <div key={step} className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300"
                        style={{
                          borderColor:
                            currentStep >= step
                              ? isDark
                                ? "rgba(96,165,250,0.30)"
                                : "rgba(249,115,22,0.24)"
                              : isDark
                              ? rgba(theme?.border || "255 255 255", 0.10)
                              : "rgba(226,232,240,1)",
                          background:
                            currentStep >= step
                              ? isDark
                                ? "rgba(59,130,246,0.15)"
                                : "rgba(255,237,213,0.72)"
                              : isDark
                              ? "rgba(255,255,255,0.03)"
                              : "rgba(255,255,255,0.9)",
                          color:
                            currentStep >= step
                              ? accentColor
                              : isDark
                              ? "rgba(255,255,255,0.45)"
                              : "rgba(148,163,184,1)",
                        }}
                      >
                        <Icon
                          className={step === 2 && currentStep === 2 ? "animate-spin" : ""}
                          size={18}
                        />
                      </div>

                      <div>
                        <p
                          className="text-xs uppercase tracking-[0.15em]"
                          style={{ color: mutedTextColor }}
                        >
                          Step {step}
                        </p>
                        <p className="text-sm font-semibold" style={{ color: titleColor }}>
                          {title}
                        </p>
                      </div>

                      {index < stepItems.length - 1 && (
                        <ArrowRight
                          size={16}
                          style={{ color: mutedTextColor }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* left */}
              <div className="lg:col-span-7">
                <SectionCard theme={theme} isDark={isDark} className="p-4 sm:p-5">
                  {currentStep === 1 && (
                    <form onSubmit={withdrawalHandler}>
                      <div className="grid grid-cols-1 gap-5">
                        {/* account */}
                        <div>
                          <label
                            className="mb-2 flex items-center gap-2 text-sm font-semibold"
                            style={{ color: titleColor }}
                          >
                            <Wallet className="h-4 w-4" style={{ color: accentColor }} />
                            1. Choose Trading Account
                          </label>

                          <div className="relative">
                            <select
                              value={account}
                              onChange={(e) => {
                                const v = e.target.value;
                                setAccount(v);
                                const selectedAcc = loggedUser?.accounts?.find(
                                  (acc: any) => String(acc.accountNumber) === String(v)
                                );
                                setAccountType(selectedAcc?.accountType || "");
                              }}
                              style={selectStyle}
                            >
                              <option value="" style={optionStyle}>
                                Select Account
                              </option>

                              {loggedUser?.accounts?.map((acc: any, index: number) => (
                                <option
                                  key={index}
                                  value={acc.accountNumber}
                                  style={optionStyle}
                                >
                                  {acc.accountNumber} ({acc.accountType})
                                </option>
                              ))}
                            </select>

                            <ChevronDown
                              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                              style={{ color: mutedTextColor }}
                            />
                          </div>
                        </div>

                        {/* gateway */}
                        <div>
                          <label
                            className="mb-3 flex items-center gap-2 text-sm font-semibold"
                            style={{ color: titleColor }}
                          >
                            <CreditCard className="h-4 w-4" style={{ color: accentColor }} />
                            2. Choose Withdrawal Method
                          </label>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {gatewayOptions.map((method, index) => {
                              const active = selectedGateway === method.name;

                              return (
                                <motion.button
                                  key={`${method.name}-${index}`}
                                  type="button"
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.04 }}
                                  whileHover={{ y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setSelectedGateway(method.name)}
                                  className="rounded-2xl border px-4 py-4 text-left transition-all duration-300"
                                  style={{
                                    borderColor: active
                                      ? isDark
                                        ? "rgba(96,165,250,0.35)"
                                        : "rgba(249,115,22,0.28)"
                                      : isDark
                                      ? rgba(theme?.border || "255 255 255", 0.1)
                                      : "rgba(251,146,60,0.14)",
                                    background: active
                                      ? isDark
                                        ? "rgba(59,130,246,0.10)"
                                        : "rgba(255,237,213,0.72)"
                                      : isDark
                                      ? "rgba(255,255,255,0.02)"
                                      : "rgba(255,255,255,0.82)",
                                    boxShadow: active
                                      ? isDark
                                        ? "0 0 0 1px rgba(96,165,250,0.18)"
                                        : "0 0 0 1px rgba(249,115,22,0.14)"
                                      : "none",
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className="flex h-11 w-11 items-center justify-center rounded-2xl border"
                                      style={{
                                        borderColor: active
                                          ? isDark
                                            ? "rgba(96,165,250,0.28)"
                                            : "rgba(249,115,22,0.20)"
                                          : isDark
                                          ? rgba(theme?.border || "255 255 255", 0.1)
                                          : "rgba(251,146,60,0.14)",
                                        background: active
                                          ? isDark
                                            ? "rgba(59,130,246,0.10)"
                                            : "rgba(255,237,213,0.72)"
                                          : isDark
                                          ? "rgba(255,255,255,0.03)"
                                          : "rgba(255,255,255,0.9)",
                                        color: active ? accentColor : titleColor,
                                      }}
                                    >
                                      {method.icon}
                                    </div>

                                    <div className="flex-1">
                                      <div
                                        className="text-sm font-semibold"
                                        style={{ color: active ? accentColor : titleColor }}
                                      >
                                        {method.name}
                                      </div>
                                      <div
                                        className="mt-1 text-xs"
                                        style={{ color: mutedTextColor }}
                                      >
                                        {method.desc}
                                      </div>
                                    </div>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>

                        {/* wallet type */}
                        {selectedGateway === "Wallet Transfer" && (
                          <div>
                            <label
                              className="mb-3 flex items-center gap-2 text-sm font-semibold"
                              style={{ color: titleColor }}
                            >
                              <Zap className="h-4 w-4" style={{ color: accentColor }} />
                              3. Choose Wallet Type
                            </label>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {walletOptions.map((option) => {
                                const active = selectWallet === option.value;

                                return (
                                  <motion.button
                                    key={option.value}
                                    type="button"
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectWallet(option.value)}
                                    className="rounded-2xl border px-4 py-4 text-left transition-all duration-300"
                                    style={{
                                      borderColor: active
                                        ? isDark
                                          ? "rgba(96,165,250,0.35)"
                                          : "rgba(249,115,22,0.28)"
                                        : isDark
                                        ? rgba(theme?.border || "255 255 255", 0.1)
                                        : "rgba(251,146,60,0.14)",
                                      background: active
                                        ? isDark
                                          ? "rgba(59,130,246,0.10)"
                                          : "rgba(255,237,213,0.72)"
                                        : isDark
                                        ? "rgba(255,255,255,0.02)"
                                        : "rgba(255,255,255,0.82)",
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-xl">{option.icon}</span>
                                      <div>
                                        <div
                                          className="text-sm font-semibold"
                                          style={{ color: active ? accentColor : titleColor }}
                                        >
                                          {option.label}
                                        </div>
                                        <div
                                          className="text-xs"
                                          style={{ color: mutedTextColor }}
                                        >
                                          Wallet destination option
                                        </div>
                                      </div>
                                    </div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* amount */}
                        <div>
                          <label
                            className="mb-2 flex items-center gap-2 text-sm font-semibold"
                            style={{ color: titleColor }}
                          >
                            <BadgeDollarSign className="h-4 w-4" style={{ color: accentColor }} />
                            4. Enter Withdrawal Amount
                          </label>

                          <div className="relative">
                            <Banknote
                              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                              style={{ color: mutedTextColor }}
                            />
                            <input
                              type="number"
                              placeholder="Enter amount"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="w-full py-[13px] pl-10 pr-4 text-sm font-semibold"
                              style={inputStyle}
                            />

                            {amount &&
                              numericBalance &&
                              parseFloat(amount) > numericBalance && (
                                <AlertCircle
                                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                                  style={{
                                    color: isDark
                                      ? "rgba(248,113,113,0.95)"
                                      : "rgba(220,38,38,0.95)",
                                  }}
                                />
                              )}
                          </div>

                          {amount &&
                            numericBalance &&
                            parseFloat(amount) > numericBalance && (
                              <p
                                className="mt-2 flex items-center gap-2 text-sm"
                                style={{
                                  color: isDark
                                    ? "rgba(248,113,113,0.95)"
                                    : "rgba(220,38,38,0.95)",
                                }}
                              >
                                <AlertCircle className="h-4 w-4" />
                                Insufficient balance
                              </p>
                            )}
                        </div>
                      </div>

                      <div className="mt-5">
                        <div
                          className="rounded-2xl border px-4 py-4"
                          style={{
                            borderColor: isDark
                              ? "rgba(16,185,129,0.18)"
                              : "rgba(16,185,129,0.16)",
                            background: isDark
                              ? "rgba(16,185,129,0.08)"
                              : "rgba(240,253,244,0.8)",
                          }}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <span
                              className="text-sm font-medium"
                              style={{
                                color: isDark
                                  ? "rgba(52,211,153,0.95)"
                                  : "rgba(5,150,105,0.95)",
                              }}
                            >
                              Current Balance
                            </span>

                            {balanceLoading ? (
                              <LoaderIcon color={accentColor} />
                            ) : (
                              <span
                                className="text-xl font-bold"
                                style={{ color: titleColor }}
                              >
                                ${accountBalance || 0}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {selectedGateway === "Wallet Transfer" && (
                        <div className="mt-7">
                          <label
                            className="mb-2 flex items-center gap-2 text-sm font-semibold"
                            style={{ color: titleColor }}
                          >
                            <ReceiptText className="h-4 w-4" style={{ color: accentColor }} />
                            5. Destination Details
                          </label>

                          <div
                            className="rounded-2xl border p-4"
                            style={subtleCard()}
                          >
                            <div className="grid grid-cols-1 gap-3">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-sm" style={{ color: mutedTextColor }}>
                                  Wallet Type
                                </span>
                                <span className="text-sm font-semibold" style={{ color: titleColor }}>
                                  {selectWallet}
                                </span>
                              </div>

                              <div>
                                <p className="mb-2 text-sm" style={{ color: mutedTextColor }}>
                                  Address
                                </p>
                                <p
                                  className="break-all rounded-xl px-3 py-2 text-xs font-medium"
                                  style={{
                                    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(248,250,252,1)",
                                    color: titleColor,
                                  }}
                                >
                                  {getWalletAddress(selectWallet)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-8 flex justify-center sm:justify-start">
                        <motion.button
                          type="submit"
                          whileHover={{ scale: ctaEnabled ? 1.02 : 1 }}
                          whileTap={{ scale: ctaEnabled ? 0.98 : 1 }}
                          disabled={!ctaEnabled}
                          className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold"
                          style={{
                            ...primaryButtonStyle,
                            opacity: ctaEnabled ? 1 : 0.65,
                            cursor: ctaEnabled ? "pointer" : "not-allowed",
                          }}
                        >
                          {isWithdrawing ? (
                            <LoaderIcon color="#ffffff" />
                          ) : (
                            <ArrowRight className="h-4 w-4" />
                          )}

                          <span>Request Withdrawal</span>
                        </motion.button>
                      </div>
                    </form>
                  )}

                  {currentStep === 3 && showOtpInput && (
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mx-auto max-w-md text-center"
                    >
                      <div
                        className="rounded-[24px] border p-6"
                        style={subtleCard()}
                      >
                        <div
                          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                          style={{
                            background: isDark
                              ? "rgba(59,130,246,0.10)"
                              : "rgba(255,237,213,0.72)",
                            color: accentColor,
                          }}
                        >
                          <Shield size={30} />
                        </div>

                        <h3 className="text-2xl font-bold" style={{ color: titleColor }}>
                          Verify Your Identity
                        </h3>
                        <p
                          className="mt-2 text-sm"
                          style={{ color: mutedTextColor }}
                        >
                          Enter the OTP sent to your email
                        </p>

                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                          placeholder="000000"
                          className="mt-5 w-full rounded-2xl border px-4 py-4 text-center text-2xl font-mono tracking-[0.35em] outline-none"
                          style={inputStyle}
                        />

                        <button
                          type="button"
                          onClick={verifyOtpHandler}
                          disabled={!otp || apiLoader}
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold transition-all"
                          style={{
                            background:
                              !otp || apiLoader
                                ? isDark
                                  ? "rgba(255,255,255,0.06)"
                                  : "rgba(241,245,249,1)"
                                : isDark
                                ? "rgba(16,185,129,0.90)"
                                : "rgba(16,185,129,1)",
                            color:
                              !otp || apiLoader
                                ? isDark
                                  ? "rgba(255,255,255,0.35)"
                                  : "rgba(148,163,184,1)"
                                : "#fff",
                            cursor: !otp || apiLoader ? "not-allowed" : "pointer",
                          }}
                        >
                          {apiLoader ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <>
                              Verify & Withdraw
                              <CheckCircle2 size={20} />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 4 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mx-auto max-w-md text-center"
                    >
                      <div
                        className="rounded-[24px] border p-6"
                        style={{
                          borderColor: isDark
                            ? "rgba(16,185,129,0.18)"
                            : "rgba(16,185,129,0.16)",
                          background: isDark
                            ? "rgba(16,185,129,0.06)"
                            : "rgba(240,253,244,0.85)",
                        }}
                      >
                        <div className="mb-4 flex justify-center">
                          <div
                            className="flex h-20 w-20 items-center justify-center rounded-full"
                            style={{
                              background: isDark
                                ? "rgba(16,185,129,0.10)"
                                : "rgba(209,250,229,1)",
                              color: isDark
                                ? "rgba(52,211,153,0.95)"
                                : "rgba(5,150,105,0.95)",
                            }}
                          >
                            <CheckCircle2 size={44} />
                          </div>
                        </div>

                        <h3
                          className="text-3xl font-bold"
                          style={{
                            color: isDark
                              ? "rgba(52,211,153,0.95)"
                              : "rgba(5,150,105,0.95)",
                          }}
                        >
                          Withdrawal Successful!
                        </h3>

                        <p
                          className="mt-2 text-sm"
                          style={{ color: mutedTextColor }}
                        >
                          Your withdrawal request has been submitted successfully.
                        </p>

                        <div
                          className="mt-5 rounded-2xl border p-4"
                          style={subtleCard()}
                        >
                          <p className="font-semibold" style={{ color: titleColor }}>
                            Amount: ${amount}
                          </p>
                          {inrUiEnabled && (
                            <p
                              className="mt-1 text-sm"
                              style={{ color: mutedTextColor }}
                            >
                              (~ ₹ {inrAmount})
                            </p>
                          )}
                          <p
                            className="mt-2 text-sm"
                            style={{ color: mutedTextColor }}
                          >
                            Processing time: 1–3 business days
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <div
                      className="mt-5 flex items-center gap-3 rounded-2xl border p-4 text-sm"
                      style={{
                        borderColor: isDark
                          ? "rgba(239,68,68,0.18)"
                          : "rgba(239,68,68,0.16)",
                        background: isDark
                          ? "rgba(239,68,68,0.08)"
                          : "rgba(254,242,242,0.92)",
                        color: isDark
                          ? "rgba(248,113,113,0.95)"
                          : "rgba(220,38,38,0.95)",
                      }}
                    >
                      <AlertCircle size={18} className="flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}
                </SectionCard>
              </div>

              {/* right */}
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
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: titleColor }}>
                        Destination Details
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: mutedTextColor }}
                      >
                        Selected withdrawal target
                      </p>
                    </div>
                  </div>

                  {selectedGateway ? (
                    <div className="space-y-3">
                      <div
                        className="flex items-center justify-between rounded-2xl border px-4 py-3"
                        style={subtleCard()}
                      >
                        <span style={{ color: mutedTextColor }}>Method</span>
                        <span className="font-medium" style={{ color: titleColor }}>
                          {selectedGateway}
                        </span>
                      </div>

                      <div
                        className="flex items-center justify-between rounded-2xl border px-4 py-3"
                        style={subtleCard()}
                      >
                        <span style={{ color: mutedTextColor }}>Wallet Type</span>
                        <span className="font-medium" style={{ color: titleColor }}>
                          {selectWallet}
                        </span>
                      </div>

                      <div
                        className="rounded-2xl border px-4 py-3"
                        style={subtleCard()}
                      >
                        <p className="mb-2 text-sm" style={{ color: mutedTextColor }}>
                          Address
                        </p>
                        <p
                          className="break-all rounded-xl px-3 py-2 text-xs font-medium"
                          style={{
                            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(248,250,252,1)",
                            color: titleColor,
                          }}
                        >
                          {getWalletAddress(selectWallet)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      title="No destination selected"
                      subtitle="Choose a withdrawal method to see destination details."
                      theme={theme}
                      isDark={isDark}
                    />
                  )}
                </SectionCard>

                <SectionCard theme={theme} isDark={isDark} className="p-5 text-center">
                  <div
                    className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{
                      background: isDark
                        ? "rgba(16,185,129,0.10)"
                        : "rgba(209,250,229,1)",
                      color: isDark
                        ? "rgba(52,211,153,0.95)"
                        : "rgba(5,150,105,0.95)",
                    }}
                  >
                    <Shield size={24} />
                  </div>

                  <h3
                    className="text-lg font-bold"
                    style={{
                      color: isDark
                        ? "rgba(52,211,153,0.95)"
                        : "rgba(5,150,105,0.95)",
                    }}
                  >
                    Secure Transaction
                  </h3>

                  <p
                    className="mt-2 text-sm"
                    style={{ color: mutedTextColor }}
                  >
                    Your withdrawal flow is protected with account validation and OTP
                    verification.
                  </p>
                </SectionCard>
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {txnModal}
    </>
  );
}