import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  History,
  Search,
  RefreshCcw,
  X,
  Activity,
  CircleDollarSign,
  Gauge,
  ShieldCheck,
  Percent,
  ArrowRight,
  CreditCard,
  Shield,
  Loader2,
  AlertCircle,
  ReceiptText,
  Copy,
  Clock3,
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
  if (Number.isNaN(d.getTime())) return "N/A";

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

function formatRelativeTime(iso: any) {
  if (!iso) return "N/A";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "N/A";

  const diffMs = Date.now() - date.getTime();
  const isFuture = diffMs < 0;
  const absMs = Math.abs(diffMs);

  const seconds = Math.floor(absMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let text = "Just now";

  if (seconds < 45) text = "Just now";
  else if (minutes < 60) text = `${minutes} ${minutes === 1 ? "min" : "mins"} ago`;
  else if (hours < 24) text = `${hours} ${hours === 1 ? "hr" : "hrs"} ago`;
  else if (days === 1) text = "Yesterday";
  else if (days < 7) text = `${days} days ago`;
  else if (weeks < 5) text = `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  else if (months < 12) text = `${months} ${months === 1 ? "month" : "months"} ago`;
  else text = `${years} ${years === 1 ? "year" : "years"} ago`;

  if (isFuture && text !== "Just now") {
    return text.replace("ago", "from now");
  }

  return text;
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

function TxnTime({
  date,
  label,
  colors,
  tone = "default",
}: {
  date: any;
  label?: string;
  colors: any;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  if (!date) {
    return (
      <span className="text-xs" style={{ color: colors.muted }}>
        N/A
      </span>
    );
  }

  const toneColor =
    tone === "success"
      ? colors.success
      : tone === "warning"
      ? colors.warning
      : tone === "danger"
      ? colors.danger
      : colors.accent;

  return (
    <div className="min-w-[135px] text-center">
      {label ? (
        <div
          className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: colors.muted }}
        >
          {label}
        </div>
      ) : null}

      <div
        className="inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold"
        style={{
          borderColor: colors.isDark
            ? "rgba(255,255,255,0.10)"
            : "rgba(249,115,22,0.22)",
          background: colors.isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(249,115,22,0.08)",
          color: toneColor,
        }}
      >
        <Clock3 className="h-3.5 w-3.5" />
        {formatRelativeTime(date)}
      </div>

      <div className="mt-1 text-[11px] leading-4" style={{ color: colors.muted }}>
        {formatDate(date)}
      </div>
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
            : "rgba(249,115,22,0.1)",
          iconColor: colors.accent,
          border: colors.isDark
            ? "rgba(59,130,246,0.22)"
            : "rgba(249,115,22,0.22)",
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
      : tone === "danger"
      ? {
          iconBg: colors.isDark
            ? "rgba(239,68,68,0.14)"
            : "rgba(239,68,68,0.1)",
          iconColor: colors.danger,
          border: colors.isDark
            ? "rgba(239,68,68,0.22)"
            : "rgba(239,68,68,0.16)",
        }
      : {
          iconBg: colors.isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(249,115,22,0.08)",
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
                        : "rgba(249,115,22,0.10)",
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

function CheckoutStep({
  step,
  title,
  isOpen,
  isCompleted,
  summary,
  onChange,
  children,
  colors,
}: {
  step: number;
  title: string;
  isOpen: boolean;
  isCompleted: boolean;
  summary?: React.ReactNode;
  onChange?: () => void;
  children?: React.ReactNode;
  colors: any;
}) {
  return (
    <div
      className="overflow-hidden border"
      style={{
        borderColor: isOpen && !colors.isDark ? colors.inputBorder : colors.border,
        background: colors.surface,
        borderRadius: "20px",
        boxShadow: isOpen && !colors.isDark ? colors.inputShadow : colors.cardShadow,
      }}
    >
      <div
        className="flex items-start justify-between gap-4 px-5 py-4"
        style={{
          background: isOpen ? colors.stepActiveBg : colors.surface,
          borderBottom: `1px solid ${isOpen ? colors.borderSoft : colors.border}`,
        }}
      >
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold"
            style={{
              background: isOpen ? colors.accent : colors.surfaceSoft,
              color: isOpen ? "#ffffff" : colors.text,
            }}
          >
            {step}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="text-[15px] font-semibold uppercase tracking-[0.06em]"
                style={{ color: colors.text }}
              >
                {title}
              </span>
              {isCompleted && !isOpen ? (
                <CheckCircle2
                  className="h-4 w-4"
                  style={{ color: colors.success }}
                />
              ) : null}
            </div>

            {!isOpen && summary ? (
              <div className="mt-2 text-[14px]" style={{ color: colors.softText }}>
                {summary}
              </div>
            ) : null}
          </div>
        </div>

        {!isOpen && onChange ? (
          <button
            type="button"
            onClick={onChange}
            className="shrink-0 border px-5 py-2.5 text-sm font-semibold"
            style={{
              borderColor: colors.border,
              color: colors.accent,
              background: colors.surface,
              borderRadius: "12px",
              minWidth: "120px",
            }}
          >
            Change
          </button>
        ) : null}
      </div>

      {isOpen ? <div>{children}</div> : null}
    </div>
  );
}

export default function UserWithdraw() {
  const loggedUser = useSelector((store: any) => store.user?.loggedUser);
  const siteConfig = useSelector((state: any) => state.user?.siteConfig);
  const themeConfig = useSelector((s: any) => s.user?.themeConfig);
  const mode = useSelector((store: any) => store.userTheme?.mode || "light");

  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const isDark = mode === "dark";

  const colors = useMemo(() => {
    const accent = isDark
      ? rgba(theme?.accent || "96 165 250", 0.95)
      : rgb(theme?.accent || "249 115 22");

    return {
      isDark,
      pageBg: isDark ? "#0b1120" : "#fff7ed",
      heroBg: isDark
        ? "linear-gradient(135deg, rgba(30,41,59,1), rgba(15,23,42,1))"
        : "linear-gradient(135deg, #f97316, #ea580c)",
      surface: isDark ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.92)",
      surfaceSoft: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,237,213,0.75)",
      surfaceMuted: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,247,237,0.95)",
      text: isDark ? "rgba(255,255,255,0.95)" : "#0f172a",
      muted: isDark ? "rgba(255,255,255,0.65)" : "#64748b",
      softText: isDark ? "rgba(255,255,255,0.78)" : "#475569",
      accent,
      accentSoft: isDark ? "rgba(96,165,250,0.12)" : "rgba(249,115,22,0.10)",
      success: isDark ? "rgba(52,211,153,0.95)" : "#16a34a",
      warning: isDark ? "rgba(251,191,36,0.95)" : "#d97706",
      danger: isDark ? "rgba(248,113,113,0.95)" : "#dc2626",
      link: isDark ? "rgba(147,197,253,1)" : "#f97316",
      border: isDark
        ? rgba(theme?.border || "255 255 255", 0.12)
        : "rgba(249,115,22,0.22)",
      borderSoft: isDark
        ? rgba(theme?.border || "255 255 255", 0.08)
        : "rgba(249,115,22,0.14)",
      inputBg: isDark
        ? "rgba(15,23,42,0.92)"
        : "linear-gradient(180deg, rgba(255,247,237,0.98), rgba(255,255,255,0.98))",
      inputBorder: isDark
        ? rgba(theme?.border || "255 255 255", 0.12)
        : "rgba(249,115,22,0.48)",
      inputText: isDark ? "rgba(255,255,255,0.95)" : "#0f172a",
      inputPlaceholder: isDark ? "rgba(255,255,255,0.35)" : "#fb923c",
      inputShadow: isDark
        ? "0 0 0 1px rgba(255,255,255,0.03)"
        : "0 0 0 4px rgba(249,115,22,0.10), 0 12px 28px rgba(249,115,22,0.12)",
      cardShadow: isDark
        ? "0 20px 45px rgba(0,0,0,0.28)"
        : "0 16px 38px rgba(249,115,22,0.12)",
      primaryBtn: "#f97316",
      primaryBtnHover: "#ea580c",
      primaryBtnText: "#ffffff",
      stepActiveBg: isDark ? "rgba(59,130,246,0.08)" : "rgba(249,115,22,0.09)",
      tableHead: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,237,213,0.85)",
      modalOverlay: "rgba(2,6,23,0.72)",
    };
  }, [isDark, theme]);

  const submitRequestRef = useRef<HTMLDivElement | null>(null);
  const blinkTimeoutRef = useRef<any>(null);

  const [selectedGateway, setSelectedGateway] = useState("");
  const [selectWallet, setSelectWallet] = useState("USDT(Trc20)");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [accountType, setAccountType] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const [balanceLoading, setBalanceLoading] = useState(false);
  const [accountBalance, setAccountBalance] = useState<string | number>("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [apiLoader, setApiLoader] = useState(false);

  const [showTxnModal, setShowTxnModal] = useState(true);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnError, setTxnError] = useState<string | null>(null);
  const [txnQ, setTxnQ] = useState("");
  const [withdrawTransactions, setWithdrawTransactions] = useState<any[]>([]);

  const [openStep, setOpenStep] = useState<1 | 2 | 3>(1);
  const [step1Completed, setStep1Completed] = useState(false);
  const [step2Completed, setStep2Completed] = useState(false);
  const [step3Completed, setStep3Completed] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [highlightSubmit, setHighlightSubmit] = useState(false);

  const dollarRate = siteConfig?.dollarWithdrawalRate || 0;
  const inrUiEnabled = siteConfig?.inrUi !== false;

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

  useEffect(() => {
    return () => {
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
      }
    };
  }, []);

  const fetchAccountInfo = useCallback(async () => {
    if (!account) return;

    setBalanceLoading(true);

    try {
      setAccountBalance("");
      const res = await userApi.get(`/server-logger-info?account=${account}`);

      if (res?.data?.data?.Equity !== undefined && res?.data?.data?.Equity !== null) {
        setAccountBalance(res.data.data.Equity);
      } else {
        setAccountBalance("0.00");
      }
    } catch {
      setAccountBalance("0.00");
    } finally {
      setBalanceLoading(false);
    }
  }, [account]);

  useEffect(() => {
    if (account) fetchAccountInfo();
  }, [account, fetchAccountInfo]);

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

  const copyText = useCallback((text: string) => {
    if (!text || text === "Not configured") return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  }, []);

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
          approvedAt:
            item.approvedAt ||
            item.completedAt ||
            item.processedAt ||
            item.approved_at ||
            item.completed_at ||
            item.processed_at ||
            null,
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

  const numericBalance = useMemo(() => Number(accountBalance || 0), [accountBalance]);

  const inrAmount = useMemo(() => {
    if (!amount || !dollarRate) return 0;
    return Number(amount || 0) * Number(dollarRate || 0);
  }, [amount, dollarRate]);

  const canContinueStep1 =
    !!account &&
    !!amount &&
    Number(amount) > 0 &&
    Number(amount) <= Number(accountBalance || 0);

  const canContinueStep2 = !!selectedGateway && !!selectWallet;
  const canRequestOtp = step1Completed && step2Completed && canContinueStep1 && canContinueStep2;
  const canSubmitOtp = !!otp && otp.length >= 4 && otpSent && !apiLoader && !isWithdrawing;

  const ctaEnabled = canSubmitOtp;

  const scrollToSubmitRequest = useCallback(() => {
    requestAnimationFrame(() => {
      submitRequestRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setHighlightSubmit(true);

      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
      blinkTimeoutRef.current = setTimeout(() => {
        setHighlightSubmit(false);
      }, 3200);
    });
  }, []);

  const filteredWithdrawTransactions = useMemo(() => {
    if (!txnQ.trim()) return withdrawTransactions;

    const term = txnQ.trim().toLowerCase();

    return withdrawTransactions.filter((row: any) => {
      const searchable = [
        row._id,
        row.mt5Account,
        row.accountType,
        row.amount,
        row.method,
        row.walletAddress,
        row.status,
        row.createdAt,
        row.updatedAt,
        row.approvedAt,
        formatDate(row.createdAt),
        formatDate(row.updatedAt),
        formatDate(row.approvedAt),
        formatRelativeTime(row.createdAt),
        formatRelativeTime(row.updatedAt),
        formatRelativeTime(row.approvedAt),
      ];

      return searchable.some((v) =>
        String(v ?? "").toLowerCase().includes(term)
      );
    });
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

  const handleAccountChange = (e: any) => {
    const value = e.target.value;
    setAccount(value);

    const selectedAcc = loggedUser?.accounts?.find(
      (acc: any) => String(acc.accountNumber) === String(value)
    );

    setAccountType(selectedAcc?.accountType || "");
  };

  const handleContinueStep1 = () => {
    setError("");

    if (!account || !amount || Number(amount) <= 0) {
      toast.error("Please select account and enter a valid amount.");
      return;
    }

    if (Number(amount) > Number(accountBalance || 0)) {
      toast.error("Withdrawal amount cannot exceed current balance.");
      return;
    }

    setStep1Completed(true);
    setOpenStep(2);
  };

  const handleContinueStep2 = () => {
    setError("");

    if (!selectedGateway) {
      toast.error("Please select a withdrawal method.");
      return;
    }

    setStep2Completed(true);
    setOpenStep(3);
  };

  const sendOtpHandler = async () => {
    if (isWithdrawing || apiLoader) return;

    setError("");

    if (!canRequestOtp) {
      toast.error("Complete account and withdrawal method steps first.");
      return;
    }

    if (!loggedUser?.email) {
      setError("User email not found. Please re-login.");
      return;
    }

    setIsWithdrawing(true);
    const toastId = toast.loading("Sending OTP...");

    try {
      const sendOtpRes = await userApi.post("/send-otp", {
        email: loggedUser.email,
      });

      if (sendOtpRes?.data?.message === "OTP sent successfully") {
        toast.success("OTP sent to your email", { id: toastId });
        setOtpSent(true);
        setStep3Completed(false);
        scrollToSubmitRequest();
      } else {
        toast.error("Failed to send OTP", { id: toastId });
      }
    } catch {
      toast.error("Error sending OTP", { id: toastId });
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
        method: selectedGateway === "Bank Transfer" ? selectedGateway : selectWallet,
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
      setStep3Completed(true);
      setOtpSent(false);
      setOtp("");
      fetchAccountInfo();
      fetchWithdrawTransactions();

      window.setTimeout(() => {
        setOpenStep(1);
        setStep1Completed(false);
        setStep2Completed(false);
        setStep3Completed(false);
        setAmount("");
        setAccount("");
        setSelectedGateway("");
        setSelectWallet("USDT(Trc20)");
        setAccountType("");
      }, 2500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Withdrawal failed", {
        id: toastId,
      });
    } finally {
      setApiLoader(false);
      setIsWithdrawing(false);
    }
  };

  const titleColor = colors.text;
  const mutedTextColor = colors.muted;
  const accentColor = colors.accent;

  const selectStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "14px",
    padding: "13px 42px 13px 14px",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    background: colors.inputBg,
    color: colors.inputText,
    border: `1.5px solid ${colors.inputBorder}`,
    boxShadow: colors.inputShadow,
  };

  const inputStyle: React.CSSProperties = {
    background: colors.inputBg,
    color: colors.inputText,
    border: `1.5px solid ${colors.inputBorder}`,
    borderRadius: "14px",
    outline: "none",
    boxShadow: colors.inputShadow,
  };

  const optionStyle: React.CSSProperties = {
    background: isDark ? "#111827" : "#fff7ed",
    color: isDark ? "#ffffff" : "#0f172a",
  };

  const subtleCard = (): React.CSSProperties => ({
    background: colors.isDark ? colors.surfaceSoft : "rgba(255,247,237,0.92)",
    border: `1.5px solid ${colors.isDark ? colors.border : colors.inputBorder}`,
    borderRadius: "16px",
    boxShadow: colors.isDark ? "none" : colors.inputShadow,
  });

  const primaryButtonStyle: React.CSSProperties = {
    borderRadius: "14px",
    color: colors.primaryBtnText,
    background: colors.primaryBtn,
    boxShadow: "0 12px 24px rgba(249,115,22,0.22)",
  };

  const walletAddress = getWalletAddress(selectWallet);
  const processingFee = Math.round(Number(inrAmount || 0) * 0.002 || 0);
  const netReceiveInr = Math.max(Number(inrAmount || 0) - processingFee, 0);

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
                      : "0 30px 80px rgba(249,115,22,0.24)",
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
                          style={{
                            color: titleColor,
                            fontFamily: "'Poppins', sans-serif",
                          }}
                        >
                          Withdrawal Transactions
                        </h2>

                        <p
                          className="mt-2 text-sm sm:text-[15px]"
                          style={{ color: mutedTextColor }}
                        >
                          Here you can view all withdrawal requests and their live status.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fetchWithdrawTransactions()}
                          className="inline-flex items-center gap-2 border px-4 py-2.5 text-sm font-semibold transition-all duration-300"
                          style={{
                            borderColor: colors.border,
                            background: colors.surface,
                            color: titleColor,
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
                        label="Withdraw Total"
                        value={`$${money(txnStats.total)}`}
                        tone="info"
                      />

                      <StatCard
                        colors={colors}
                        icon={<CircleDollarSign className="h-5 w-5" />}
                        label="Approved"
                        value={txnStats.approved}
                        tone="success"
                      />

                      <StatCard
                        colors={colors}
                        icon={<Gauge className="h-5 w-5" />}
                        label="Pending"
                        value={txnStats.pending}
                        tone="warning"
                      />

                      <StatCard
                        colors={colors}
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
                          style={{ color: isDark ? mutedTextColor : colors.primaryBtn }}
                        />

                        <input
                          value={txnQ}
                          onChange={(e) => setTxnQ(e.target.value)}
                          placeholder="Search by account, method, wallet, status, just now..."
                          className="w-full border py-2.5 pl-9 pr-3 outline-none transition-all duration-300 placeholder:text-orange-400"
                          style={{
                            borderColor: colors.inputBorder,
                            background: colors.inputBg,
                            color: titleColor,
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
                                <LoaderIcon color={accentColor} />

                                <p
                                  className="mt-4 text-sm font-semibold uppercase tracking-[0.2em]"
                                  style={{ color: mutedTextColor }}
                                >
                                  Fetching withdrawals...
                                </p>
                              </div>

                              <SkeletonTable cols={8} colors={colors} />
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
                                colors={colors}
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
                                      "Account",
                                      "Type",
                                      "Amount",
                                      "Method",
                                      "Wallet / Address",
                                      "Requested",
                                      "Status",
                                      "Timeline",
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
                                        borderBottom: `1px solid ${colors.borderSoft}`,
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
                                            background: colors.accentSoft,
                                            borderColor: colors.border,
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
                                          className="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                                          style={{
                                            background: colors.surfaceSoft,
                                            borderColor: colors.border,
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
                                        <span className="inline-block max-w-[200px] truncate align-middle">
                                          {item?.walletAddress || "—"}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3 text-center">
                                        <TxnTime date={item?.createdAt} colors={colors} />
                                      </td>

                                      <td className="px-4 py-3 text-center">
                                        <span
                                          className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold"
                                          style={statusStyle(item?.status)}
                                        >
                                          {(item?.status || "UNKNOWN").toString().toUpperCase()}
                                        </span>
                                      </td>

                                      <td className="px-4 py-4 align-top">
                                        <div className="space-y-3">
                                          <TxnTime
                                            date={item.updatedAt}
                                            label="Updated"
                                            colors={colors}
                                            tone="warning"
                                          />

                                        </div>
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
      <div
        className="min-h-screen w-full"
        style={{
          background: colors.pageBg,
        }}
      >
        <div className="w-full" style={{ background: colors.heroBg }}>
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-5 lg:px-6">
            <div className="leading-none">
              <div className="text-[28px] font-bold text-white sm:text-[32px]">
                Withdraw Funds
              </div>

              <div className="mt-2 text-sm text-white/80">
                Complete your withdrawal securely in 3 simple steps
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-6 text-sm text-white/90 md:flex">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  OTP Protected
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTxnModal(true)}
                className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15"
                style={{ borderRadius: "14px" }}
              >
                <History className="h-4 w-4" />
                Withdrawal Transactions
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 py-5 lg:px-6">
          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
              colors={colors}
              icon={<Wallet className="h-5 w-5" />}
              label="Selected Account"
              value={account || "—"}
              hint={accountType || "Choose account"}
              tone="default"
            />

            <StatCard
              colors={colors}
              icon={<DollarSign className="h-5 w-5" />}
              label="Current Balance"
              value={
                balanceLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <LoaderIcon color={accentColor} />
                  </span>
                ) : (
                  `$${money(accountBalance || 0)}`
                )
              }
              hint="Live equity"
              tone="success"
            />

            <StatCard
              colors={colors}
              icon={<Landmark className="h-5 w-5" />}
              label="INR Equivalent"
              value={`₹ ${money(inrAmount)}`}
              hint={`Rate ₹${siteConfig?.dollarWithdrawalRate || 0}`}
              tone="info"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-8">
              <CheckoutStep
                step={1}
                title="Select Account"
                isOpen={openStep === 1}
                isCompleted={step1Completed}
                colors={colors}
                onChange={() => setOpenStep(1)}
                summary={
                  <>
                    <span className="font-semibold" style={{ color: colors.text }}>
                      {account || "No account selected"}
                    </span>
                    {amount ? (
                      <span className="ml-2" style={{ color: colors.softText }}>
                        • ${money(amount)} • {accountType || "N/A"}
                      </span>
                    ) : null}
                  </>
                }
              >
                <div className="p-5">
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div>
                      <label
                        className="mb-2 block text-sm font-semibold"
                        style={{ color: titleColor }}
                      >
                        Select Trading Account
                      </label>

                      <div className="relative">
                        <select value={account} onChange={handleAccountChange} style={selectStyle}>
                          <option value="" style={optionStyle}>
                            Select Account
                          </option>

                          {loggedUser?.accounts?.map((acc: any, index: number) => (
                            <option key={index} value={acc.accountNumber} style={optionStyle}>
                              {acc.accountNumber} ({acc.accountType})
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                          style={{ color: isDark ? mutedTextColor : colors.primaryBtn }}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className="mb-2 block text-sm font-semibold"
                        style={{ color: titleColor }}
                      >
                        Withdrawal Amount (USD)
                      </label>

                      <div className="relative">
                        <DollarSign
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                          style={{ color: isDark ? mutedTextColor : colors.primaryBtn }}
                        />

                        <input
                          type="number"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full py-[13px] pl-10 pr-10 text-sm font-semibold placeholder:text-orange-400"
                          style={inputStyle}
                        />

                        {amount && numericBalance && Number(amount) > numericBalance ? (
                          <AlertCircle
                            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                            style={{ color: colors.danger }}
                          />
                        ) : null}
                      </div>

                      {amount && numericBalance && Number(amount) > numericBalance ? (
                        <p className="mt-2 text-xs" style={{ color: colors.danger }}>
                          Withdrawal amount cannot exceed available balance.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="border p-4" style={subtleCard()}>
                      <div className="text-xs" style={{ color: colors.muted }}>
                        Account Type
                      </div>
                      <div className="mt-1 font-semibold" style={{ color: titleColor }}>
                        {accountType || "Not selected"}
                      </div>
                    </div>

                    <div className="border p-4" style={subtleCard()}>
                      <div className="text-xs" style={{ color: colors.muted }}>
                        Live Balance
                      </div>
                      <div className="mt-1 font-semibold" style={{ color: titleColor }}>
                        {balanceLoading ? "Loading..." : `$${money(accountBalance)}`}
                      </div>
                    </div>

                    <div className="border p-4" style={subtleCard()}>
                      <div className="text-xs" style={{ color: colors.muted }}>
                        INR Conversion
                      </div>
                      <div className="mt-1 font-semibold" style={{ color: titleColor }}>
                        ₹ {money(inrAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={handleContinueStep1}
                      className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold uppercase"
                      style={{
                        background: colors.primaryBtn,
                        color: "#fff",
                        borderRadius: "14px",
                        opacity: canContinueStep1 ? 1 : 0.7,
                      }}
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CheckoutStep>

              <CheckoutStep
                step={2}
                title="Withdrawal Method"
                isOpen={openStep === 2}
                isCompleted={step2Completed}
                colors={colors}
                onChange={() => setOpenStep(2)}
                summary={
                  <>
                    <span className="font-semibold" style={{ color: colors.text }}>
                      {selectedGateway || "No method selected"}
                    </span>
                    {selectWallet ? (
                      <span className="ml-2" style={{ color: colors.softText }}>
                        • {selectWallet}
                      </span>
                    ) : null}
                  </>
                }
              >
                <div className="p-5">
                  <div className="mb-5">
                    <div
                      className="mb-3 text-sm font-semibold uppercase tracking-[0.08em]"
                      style={{ color: mutedTextColor }}
                    >
                      Select Withdrawal Method
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {gatewayOptions.map((method: any, index: number) => {
                        const active = selectedGateway === method.name;

                        return (
                          <motion.button
                            key={`${method.name}-${index}`}
                            type="button"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setSelectedGateway(method.name)}
                            className="w-full border px-4 py-4 text-left transition-all duration-300"
                            style={{
                              borderColor: active ? colors.accent : colors.inputBorder,
                              background: active ? colors.accentSoft : colors.surface,
                              borderRadius: "18px",
                              boxShadow: active
                                ? "0 0 0 4px rgba(249,115,22,0.10), 0 12px 26px rgba(249,115,22,0.14)"
                                : !isDark
                                ? "0 8px 18px rgba(249,115,22,0.06)"
                                : "none",
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-10 w-10 items-center justify-center border text-lg"
                                style={{
                                  borderColor: active ? colors.accent : colors.border,
                                  background: colors.surfaceSoft,
                                  borderRadius: "14px",
                                }}
                              >
                                {method.icon}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div
                                  className="text-sm font-semibold"
                                  style={{ color: active ? accentColor : titleColor }}
                                >
                                  {method.name}
                                </div>
                                <div className="mt-1 text-xs" style={{ color: mutedTextColor }}>
                                  {method.desc}
                                </div>
                              </div>

                              {active ? (
                                <CheckCircle2 className="h-4 w-4" style={{ color: accentColor }} />
                              ) : null}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedGateway === "Wallet Transfer" ? (
                    <>
                      <div className="mb-5">
                        <div
                          className="mb-3 text-sm font-semibold uppercase tracking-[0.08em]"
                          style={{ color: mutedTextColor }}
                        >
                          Select Wallet Type
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {walletOptions.map((option) => {
                            const active = selectWallet === option.value;

                            return (
                              <motion.button
                                key={option.value}
                                type="button"
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setSelectWallet(option.value)}
                                className="w-full border px-4 py-4 text-left transition-all duration-300"
                                style={{
                                  borderColor: active ? colors.accent : colors.inputBorder,
                                  background: active ? colors.accentSoft : colors.surface,
                                  borderRadius: "18px",
                                  boxShadow: active
                                    ? "0 0 0 4px rgba(249,115,22,0.10), 0 12px 26px rgba(249,115,22,0.14)"
                                    : !isDark
                                    ? "0 8px 18px rgba(249,115,22,0.06)"
                                    : "none",
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className="flex h-10 w-10 items-center justify-center border text-lg"
                                    style={{
                                      borderColor: active ? colors.accent : colors.border,
                                      background: colors.surfaceSoft,
                                      borderRadius: "14px",
                                    }}
                                  >
                                    {option.icon}
                                  </div>
                                  <div>
                                    <div
                                      className="text-sm font-semibold"
                                      style={{ color: active ? accentColor : titleColor }}
                                    >
                                      {option.label}
                                    </div>
                                    <div className="mt-1 text-xs" style={{ color: mutedTextColor }}>
                                      Crypto payout route
                                    </div>
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mb-5 border px-4 py-4" style={{ ...subtleCard() }}>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold" style={{ color: colors.text }}>
                              Destination Wallet
                            </div>
                            <div className="mt-1 text-xs" style={{ color: colors.muted }}>
                              This address will receive the withdrawal.
                            </div>
                          </div>
                          <span
                            className="inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold"
                            style={{
                              background: colors.accentSoft,
                              borderColor: colors.border,
                              color: colors.accent,
                            }}
                          >
                            {selectWallet}
                          </span>
                        </div>

                        <div
                          className="rounded-xl border px-3 py-3 font-mono text-xs"
                          style={{
                            borderColor: colors.inputBorder,
                            background: colors.inputBg,
                            color: colors.text,
                            boxShadow: !isDark ? colors.inputShadow : "none",
                          }}
                        >
                          {walletAddress}
                        </div>

                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => copyText(walletAddress)}
                            className="inline-flex items-center gap-2 border px-4 py-2 text-xs font-semibold uppercase"
                            style={{
                              borderColor: colors.inputBorder,
                              background: colors.surface,
                              color: colors.accent,
                              borderRadius: "12px",
                            }}
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copy Address
                          </button>
                        </div>
                      </div>
                    </>
                  ) : null}

                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={handleContinueStep2}
                      className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold uppercase"
                      style={{
                        background: colors.primaryBtn,
                        color: "#fff",
                        borderRadius: "14px",
                        opacity: canContinueStep2 ? 1 : 0.7,
                      }}
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CheckoutStep>

              <CheckoutStep
                step={3}
                title="OTP Verification"
                isOpen={openStep === 3}
                isCompleted={step3Completed}
                colors={colors}
                onChange={() => setOpenStep(3)}
                summary={
                  <>
                    <span className="font-semibold" style={{ color: colors.text }}>
                      {step3Completed
                        ? "Withdrawal request submitted"
                        : otpSent
                        ? "OTP sent to email"
                        : "Verification pending"}
                    </span>
                  </>
                }
              >
                <div className="p-5">
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div className="border p-5" style={{ ...subtleCard() }}>
                      <div className="mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4" style={{ color: colors.accent }} />
                        <span className="text-sm font-semibold" style={{ color: colors.text }}>
                          Request OTP
                        </span>
                      </div>

                      <p className="text-sm" style={{ color: colors.softText }}>
                        We will send a one-time password to your registered email before the withdrawal is submitted.
                      </p>

                      <button
                        type="button"
                        onClick={sendOtpHandler}
                        disabled={!canRequestOtp || isWithdrawing}
                        className="mt-4 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase"
                        style={{
                          background: colors.primaryBtn,
                          color: "#fff",
                          borderRadius: "14px",
                          opacity: canRequestOtp && !isWithdrawing ? 1 : 0.65,
                          cursor: canRequestOtp && !isWithdrawing ? "pointer" : "not-allowed",
                        }}
                      >
                        {isWithdrawing ? (
                          <LoaderIcon color="#fff" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                        {otpSent ? "Resend OTP" : "Send OTP"}
                      </button>
                    </div>

                    <div className="border p-5" style={{ ...subtleCard() }}>
                      <div className="mb-3 flex items-center gap-2">
                        <ReceiptText className="h-4 w-4" style={{ color: colors.accent }} />
                        <span className="text-sm font-semibold" style={{ color: colors.text }}>
                          Enter OTP
                        </span>
                      </div>

                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        placeholder="000000"
                        className="w-full rounded-2xl border px-4 py-4 text-center text-2xl font-mono tracking-[0.35em] outline-none placeholder:text-orange-400"
                        style={inputStyle}
                      />

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={verifyOtpHandler}
                          disabled={!canSubmitOtp}
                          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase"
                          style={{
                            background: colors.primaryBtn,
                            color: "#fff",
                            borderRadius: "14px",
                            opacity: canSubmitOtp ? 1 : 0.65,
                            cursor: canSubmitOtp ? "pointer" : "not-allowed",
                          }}
                        >
                          {apiLoader ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Verify & Submit
                        </button>
                      </div>
                    </div>
                  </div>

                  {step3Completed ? (
                    <div
                      className="mt-5 border px-4 py-4"
                      style={{
                        borderRadius: "16px",
                        borderColor: "rgba(16,185,129,0.18)",
                        background: isDark
                          ? "rgba(16,185,129,0.08)"
                          : "rgba(240,253,244,0.85)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5" style={{ color: colors.success }} />
                        <div>
                          <div className="text-sm font-semibold" style={{ color: colors.success }}>
                            Withdrawal request submitted successfully.
                          </div>
                          <div className="mt-1 text-xs" style={{ color: colors.softText }}>
                            Processing usually takes 1–3 business days.
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {error ? (
                    <div
                      className="mt-5 flex items-center gap-3 rounded-2xl border p-4 text-sm"
                      style={{
                        borderColor: isDark
                          ? "rgba(239,68,68,0.18)"
                          : "rgba(239,68,68,0.16)",
                        background: isDark
                          ? "rgba(239,68,68,0.08)"
                          : "rgba(254,242,242,0.92)",
                        color: colors.danger,
                      }}
                    >
                      <AlertCircle size={18} className="flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  ) : null}
                </div>
              </CheckoutStep>
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
                      style={{ color: titleColor }}
                    >
                      Withdrawal Details
                    </div>

                    <div className="space-y-4 border p-4" style={subtleCard()}>
                      <div className="flex items-center justify-between">
                        <span style={{ color: titleColor }}>Amount</span>
                        <span style={{ color: titleColor }}>${money(amount || 0)}</span>
                      </div>

                      {inrUiEnabled ? (
                        <div className="flex items-center justify-between">
                          <span style={{ color: titleColor }}>INR Equivalent</span>
                          <span style={{ color: titleColor }}>₹{money(inrAmount || 0)}</span>
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between">
                        <span style={{ color: titleColor }}>Method</span>
                        <span style={{ color: titleColor }}>{selectedGateway || "—"}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span style={{ color: titleColor }}>Wallet Type</span>
                        <span style={{ color: titleColor }}>{selectWallet || "—"}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span style={{ color: titleColor }}>Estimated Fee</span>
                        <span style={{ color: titleColor }}>₹{money(processingFee)}</span>
                      </div>

                      <div className="border-t pt-4" style={{ borderColor: colors.border }}>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold" style={{ color: titleColor }}>
                            Estimated Receive
                          </span>
                          <span className="text-lg font-semibold" style={{ color: titleColor }}>
                            ₹{money(netReceiveInr)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-base font-semibold" style={{ color: colors.success }}>
                      Available Balance ${money(accountBalance || 0)}
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
                        <Percent className="mt-0.5 h-4 w-4" style={{ color: colors.warning }} />
                        <div className="text-sm" style={{ color: titleColor }}>
                          Double-check your wallet address and network before verifying OTP.
                        </div>
                      </div>
                    </div>

                    <motion.div
                      animate={
                        highlightSubmit
                          ? {
                              scale: [1, 1.03, 1, 1.03, 1],
                              opacity: [1, 0.7, 1, 0.7, 1],
                            }
                          : {
                              scale: 1,
                              opacity: 1,
                            }
                      }
                      transition={{
                        duration: highlightSubmit ? 2.2 : 0.2,
                        repeat: highlightSubmit ? 1 : 0,
                      }}
                    >
                      <motion.button
                        type="button"
                        whileHover={{ scale: ctaEnabled ? 1.01 : 1 }}
                        whileTap={{ scale: ctaEnabled ? 0.99 : 1 }}
                        onClick={verifyOtpHandler}
                        disabled={!ctaEnabled}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 px-7 py-3 text-sm font-bold"
                        style={{
                          ...primaryButtonStyle,
                          opacity: ctaEnabled ? 1 : 0.65,
                          cursor: ctaEnabled ? "pointer" : "not-allowed",
                          boxShadow: highlightSubmit
                            ? "0 0 0 4px rgba(249,115,22,0.18), 0 0 22px rgba(249,115,22,0.28)"
                            : primaryButtonStyle.boxShadow,
                        }}
                      >
                        {apiLoader || isWithdrawing ? (
                          <LoaderIcon color="#ffffff" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        <span>SUBMIT WITHDRAWAL</span>
                      </motion.button>
                    </motion.div>
                  </div>
                </SectionCard>

                <SectionCard
                  style={{
                    background: colors.surface,
                    borderColor: colors.border,
                    boxShadow: colors.cardShadow,
                  }}
                >
                  <div className="p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl"
                        style={{ background: colors.accentSoft, color: accentColor }}
                      >
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold" style={{ color: titleColor }}>
                          Destination Details
                        </h3>
                        <p className="text-sm" style={{ color: mutedTextColor }}>
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

                        <div className="rounded-2xl border px-4 py-3" style={subtleCard()}>
                          <p className="mb-2 text-sm" style={{ color: mutedTextColor }}>
                            Address
                          </p>
                          <p
                            className="break-all rounded-xl px-3 py-2 text-xs font-medium"
                            style={{
                              background: colors.inputBg,
                              color: titleColor,
                              border: `1px solid ${colors.inputBorder}`,
                              boxShadow: !isDark ? colors.inputShadow : "none",
                            }}
                          >
                            {walletAddress}
                          </p>
                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => copyText(walletAddress)}
                              className="inline-flex items-center gap-2 border px-4 py-2 text-xs font-semibold uppercase"
                              style={{
                                borderColor: colors.inputBorder,
                                background: colors.surface,
                                color: colors.accent,
                                borderRadius: "12px",
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <EmptyState
                        title="No destination selected"
                        subtitle="Choose a withdrawal method to see destination details."
                        colors={colors}
                      />
                    )}
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
            <div>© 2007-2026 secure withdrawal</div>
          </div>
        </div>
      </div>

      {txnModal}
    </>
  );
}