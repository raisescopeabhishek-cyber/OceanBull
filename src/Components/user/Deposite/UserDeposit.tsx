import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Landmark,
  CheckCircle2,
  DollarSign,
  Image as ImageIcon,
  ChevronDown,
  History,
  Search,
  RefreshCcw,
  X,
  Eye,
  Activity,
  CircleDollarSign,
  Gauge,
  ShieldCheck,
  PencilLine,
  ArrowRight,
  Gift,
  Clock3,
} from "lucide-react";

import UserNewChallengeHook from "../../../hooks/user/UseNewChallengeHook";
import { userApi } from "../../../utils/apiClients";
import { useMt5Account } from "../../../hooks/useMt5Accounts";
import SelectedPaymentMethod from "./SelectedPaymentMethod";
import { Button, FormPage } from "@/Components/ui";

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

type InsuranceClaimDepositPrefill = {
  source: "insurance_claim";
  mt5Account: string;
  claimType: "single" | "all";
  coverageIds: string[];
  claimAmount: number;
  autoApplyInsurance?: boolean;
  autoApplyBonus?: boolean;
};

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
      className={["overflow-hidden border transition-all duration-300", className].join(" ")}
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
          borderColor: colors.isDark ? "rgba(255,255,255,0.10)" : "rgba(42, 86, 220,0.22)",
          background: colors.isDark ? "rgba(255,255,255,0.04)" : "rgba(42, 86, 220,0.08)",
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
          iconBg: colors.isDark ? "rgba(15, 159, 110,0.14)" : "rgba(15, 159, 110,0.1)",
          iconColor: colors.success,
          border: colors.isDark ? "rgba(15, 159, 110,0.22)" : "rgba(15, 159, 110,0.18)",
        }
      : tone === "info"
      ? {
          iconBg: colors.isDark ? "rgba(79, 125, 246,0.14)" : "rgba(42, 86, 220,0.1)",
          iconColor: colors.accent,
          border: colors.isDark ? "rgba(79, 125, 246,0.22)" : "rgba(42, 86, 220,0.22)",
        }
      : tone === "warning"
      ? {
          iconBg: colors.isDark ? "rgba(42, 86, 220,0.14)" : "rgba(42, 86, 220,0.1)",
          iconColor: colors.warning,
          border: colors.isDark ? "rgba(42, 86, 220,0.22)" : "rgba(42, 86, 220,0.16)",
        }
      : {
          iconBg: colors.isDark ? "rgba(255,255,255,0.05)" : "rgba(42, 86, 220,0.08)",
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
                        : "rgba(42, 86, 220,0.10)",
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
            className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-card text-xs font-bold"
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
                <CheckCircle2 className="h-4 w-4" style={{ color: colors.success }} />
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

export default function UserDeposit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getPaymentMethod } = UserNewChallengeHook();

  const claimPrefill = useMemo<InsuranceClaimDepositPrefill | null>(() => {
    const state = location.state as InsuranceClaimDepositPrefill | null;
    return state?.source === "insurance_claim" ? state : null;
  }, [location.state]);

  const isInsuranceClaimDeposit = claimPrefill?.source === "insurance_claim";

  const [bonusQuote, setBonusQuote] = useState<any>(null);
  const [bonusLoading, setBonusLoading] = useState(false);
  const [wantBonus, setWantBonus] = useState(false);

  const [insuranceQuote, setInsuranceQuote] = useState<any>(null);
  const [insuranceLoading, setInsuranceLoading] = useState(false);
  const [wantInsurance, setWantInsurance] = useState(false);

  const loggedUser = useSelector((s: any) => s.user?.loggedUser);
  const siteConfig = useSelector((s: any) => s.user?.siteConfig);
  const paymentMethods = useSelector((s: any) => s.user?.paymentMethods);
  const themeConfig = useSelector((s: any) => s.user?.themeConfig);
  const mode = useSelector((s: any) => s.userTheme?.mode || "light");

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

    link: isDark ? "rgba(147,197,253,1)" : "#2245b4",

    border: isDark
      ? rgba(theme?.border || "255 255 255", 0.12)
      : "rgba(42, 86, 220,0.16)",

    borderSoft: isDark
      ? rgba(theme?.border || "255 255 255", 0.08)
      : "rgba(42, 86, 220,0.10)",

    inputBg: isDark
      ? "rgba(15, 24, 41,0.92)"
      : "linear-gradient(180deg, rgba(255,251,235,0.98), rgba(255,255,255,0.98))",

    inputBorder: isDark
      ? rgba(theme?.border || "255 255 255", 0.12)
      : "rgba(42, 86, 220,0.30)",

    inputText: isDark ? "rgba(255,255,255,0.95)" : "#0f1829",
    inputPlaceholder: isDark ? "rgba(255,255,255,0.35)" : "#2a56dc",

    inputShadow: isDark
      ? "0 0 0 1px rgba(255,255,255,0.03)"
      : "0 0 0 4px rgba(42, 86, 220,0.05), 0 10px 22px rgba(42, 86, 220,0.07)",

    inputFocusShadow: isDark
      ? "0 0 0 4px rgba(79, 125, 246,0.18)"
      : "0 0 0 5px rgba(42, 86, 220,0.09), 0 12px 26px rgba(42, 86, 220,0.09)",

    cardShadow: isDark
      ? "0 20px 45px rgba(0,0,0,0.28)"
      : "0 14px 30px rgba(42, 86, 220,0.07)",

    primaryBtn: "#2a56dc",
    primaryBtnHover: "#2245b4",
    primaryBtnText: "#ffffff",

    stepActiveBg: isDark ? "rgba(79, 125, 246,0.08)" : "rgba(42, 86, 220,0.06)",
    tableHead: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,251,235,0.9)",

    modalOverlay: "rgba(2,6,23,0.72)",
  };
}, [isDark, theme]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const submitRequestRef = useRef<HTMLDivElement | null>(null);
  const blinkTimeoutRef = useRef<any>(null);
  const claimPrefillAppliedRef = useRef(false);

  const [formData, setFormData] = useState({
    apiGroup: "",
    depositAmount: "",
    accountNumber: "",
    transactionId: "",
  });

  const [accountType, setAccountType] = useState("");
  const selectedAccountExists = loggedUser?.accounts?.some(
    (item: any) => String(item.accountNumber) === String(formData.accountNumber)
  );
  const { info: liveAccount, isReady } = useMt5Account(
    selectedAccountExists ? formData.accountNumber : ""
  );
  const balanceReady = isReady(["Equity"]);
  const accountBalance = balanceReady ? liveAccount.Equity : "";
  const balanceLoading = !!formData.accountNumber && !balanceReady;
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTxnModal, setShowTxnModal] = useState(true);

  const [txnLoading, setTxnLoading] = useState(false);
  const [txnError, setTxnError] = useState<string | null>(null);
  const [txnQ, setTxnQ] = useState("");
  const [depositTransactions, setDepositTransactions] = useState<any[]>([]);

  const [openStep, setOpenStep] = useState<1 | 2 | 3>(1);
  const [step1Completed, setStep1Completed] = useState(false);
  const [step2Completed, setStep2Completed] = useState(false);
  const [step3Completed, setStep3Completed] = useState(false);
  const [methodInteractionDone, setMethodInteractionDone] = useState(false);
  const [highlightSubmit, setHighlightSubmit] = useState(false);

  const quickAmounts = [100, 200, 500, 1000];

  useEffect(() => {
    try {
      getPaymentMethod?.();
    } catch {}
  }, []);

  useEffect(() => {
    return () => {
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!claimPrefill || claimPrefillAppliedRef.current) return;

    claimPrefillAppliedRef.current = true;

    const accountNumber = String(claimPrefill.mt5Account || "");
    const claimAmount = String(claimPrefill.claimAmount || "");

    const selected = loggedUser?.accounts?.find(
      (item: any) => String(item.accountNumber) === accountNumber
    );

    setFormData((prev) => ({
      ...prev,
      accountNumber,
      depositAmount: claimAmount,
      apiGroup: selected?.apiGroup || "",
    }));

    setAccountType(selected?.accountType || "");
    setWantInsurance(claimPrefill.autoApplyInsurance !== false);
    setWantBonus(claimPrefill.autoApplyBonus !== false);
    setStep1Completed(true);
    setOpenStep(2);

    toast.success("Claim amount imported into deposit form.");
  }, [claimPrefill, loggedUser?.accounts]);

  const fetchInsuranceQuote = useCallback(
    async (amount: string | number) => {
      const numAmount = Number(amount);

      if (!numAmount || numAmount <= 0) {
        setInsuranceQuote(null);
        setWantInsurance(false);
        return;
      }

      try {
        setInsuranceLoading(true);

        const res = await userApi.get(`/insurance-config/quote?amount=${numAmount}`);
        const quote = res?.data?.data || null;

        setInsuranceQuote(quote);

        if (!quote?.eligible) {
          setWantInsurance(false);
        } else {
          setWantInsurance(true);
        }
      } catch {
        setInsuranceQuote(null);
        setWantInsurance(false);
      } finally {
        setInsuranceLoading(false);
      }
    },
    [isInsuranceClaimDeposit]
  );

  const fetchBonusQuote = useCallback(async (amount: string | number) => {
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      setBonusQuote(null);
      setWantBonus(false);
      return;
    }

    try {
      setBonusLoading(true);

      const res = await userApi.get(`/deposit-bonus/quote?amount=${numAmount}`);
      const quote = res?.data?.data || null;

      setBonusQuote(quote);
    } catch {
      setBonusQuote(null);
    } finally {
      setBonusLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBonusQuote(formData.depositAmount);
  }, [formData.depositAmount, fetchBonusQuote]);

  useEffect(() => {
    fetchInsuranceQuote(formData.depositAmount);
  }, [formData.depositAmount, fetchInsuranceQuote]);

  useEffect(() => {
    if (bonusQuote?.eligible) {
      setWantBonus(true);
    } else {
      setWantBonus(false);
    }
  }, [bonusQuote]);

  const bonusAmount =
    wantBonus && bonusQuote?.eligible
      ? Number(bonusQuote?.bonusAmount || 0)
      : 0;

  const bonusPercent =
    wantBonus && bonusQuote?.eligible
      ? Number(bonusQuote?.bonusPercent || 0)
      : 0;

  const baseAmount = Number(formData.depositAmount || 0);

  const insuranceChargeAmount =
    wantInsurance && insuranceQuote?.eligible
      ? Number(insuranceQuote?.insuranceChargeAmount || 0)
      : 0;

  const finalPayableAmount = isInsuranceClaimDeposit
    ? wantInsurance && insuranceQuote?.eligible
      ? insuranceChargeAmount
      : 0
    : wantInsurance && insuranceQuote?.eligible
    ? baseAmount + insuranceChargeAmount
    : baseAmount;

  const fetchDepositTransactions = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setTxnLoading(true);
        setTxnError(null);

        if (!loggedUser?._id) {
          setDepositTransactions([]);
          setTxnError("Please sign in to view deposit transactions.");
          return;
        }

        const res = await userApi.get(
          `/deposit/${loggedUser._id}`,
          signal ? { signal } : undefined
        );

        const payload = res?.data?.data;

        if (!Array.isArray(payload) || payload.length === 0) {
          setDepositTransactions([]);
          setTxnError("No deposit transaction data available.");
          return;
        }

        const normalized = payload.map((item: any) => ({
          _id: item._id,
          mt5Account: item.mt5Account || item.accountNumber || item.account || "N/A",
          accountType: item.accountType || item.type || "N/A",
          deposit: Number(item.deposit ?? item.amount ?? 0),
          baseDepositAmount: Number(item.baseDepositAmount ?? item.deposit ?? 0),
          finalPayableAmount: Number(item.finalPayableAmount ?? item.deposit ?? 0),
          method: (item.method || "N/A").toString(),
          transactionId: item.transactionId || item.txnId || item.trxId || "—",
          orderId: item.orderId || "—",
          createdAt: item.createdAt || item.created_at || item.created || null,
          updatedAt: item.updatedAt || item.updated_at || item.updated || null,
          approvedAt: item.approvedAt || null,
          depositSS: item.depositSS || item.attachment || item.file || null,
          status: item.status || "unknown",
          depositBonusConfigId: item.depositBonusConfigId || null,
          bonusDetails: item.bonusDetails
            ? {
                depositAmount: Number(item.bonusDetails.depositAmount || 0),
                bonusPercent: Number(item.bonusDetails.bonusPercent || 0),
                bonusAmount: Number(item.bonusDetails.bonusAmount || 0),
              }
            : null,
          insuranceOpted: !!item.insuranceOpted,
          insuranceDetails: item.insuranceDetails
            ? {
                exactAmount: Number(item.insuranceDetails.exactAmount || 0),
                insuranceChargesPercent: Number(
                  item.insuranceDetails.insuranceChargesPercent || 0
                ),
                claimPercent: Number(item.insuranceDetails.claimPercent || 0),
                insuranceChargeAmount: Number(
                  item.insuranceDetails.insuranceChargeAmount || 0
                ),
              }
            : null,
        }));

        setDepositTransactions(normalized);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.message === "canceled") return;
        setDepositTransactions([]);
        setTxnError("Failed to fetch deposit transactions. Please try again.");
      } finally {
        setTxnLoading(false);
      }
    },
    [loggedUser?._id]
  );

  useEffect(() => {
    if (!showTxnModal) return;

    const controller = new AbortController();
    fetchDepositTransactions(controller.signal);

    return () => controller.abort();
  }, [showTxnModal, fetchDepositTransactions]);

  useEffect(() => {
    if (!showTxnModal) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [showTxnModal]);

  const uniqueActiveMethods = useMemo(() => {
    const list = Array.isArray(paymentMethods) ? paymentMethods : [];
    const namesSet = new Set<string>();
    const unique: any[] = [];

    list.forEach((item: any) => {
      if (item?.status === "active" && item?.name && !namesSet.has(item.name)) {
        namesSet.add(item.name);
        unique.push(item);
      }
    });

    return unique;
  }, [paymentMethods]);

  const bankTransfers = useMemo(() => {
    const list = Array.isArray(paymentMethods) ? paymentMethods : [];
    return list.filter(
      (item: any) => item.status === "active" && item.name === "Bank Transfer"
    );
  }, [paymentMethods]);

  const selectedMethod = useMemo(() => {
    const list = Array.isArray(paymentMethods) ? paymentMethods : [];
    return list.find((item: any) => item.name === selectedPayment);
  }, [paymentMethods, selectedPayment]);

  const paymentDetails = selectedMethod?.details;
  const paymentImage = selectedMethod?.image;
  const selectedBankTransfer = selectedMethod?.bankTransfer;

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    if (
      isInsuranceClaimDeposit &&
      (name === "accountNumber" || name === "depositAmount")
    ) {
      return;
    }

    if (name === "accountNumber") {
      const selected = loggedUser?.accounts?.find(
        (item: any) => String(item.accountNumber) === String(value)
      );

      setAccountType(selected?.accountType || "");
      setFormData((prev) => ({
        ...prev,
        accountNumber: value,
        apiGroup: selected?.apiGroup || "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQuickAmountSelect = (amount: number) => {
    if (isInsuranceClaimDeposit) return;

    setFormData((prev) => ({
      ...prev,
      depositAmount: String(amount),
    }));
  };

  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);

    if (selectedFile && selectedFile.type?.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(String(reader.result));
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const togglePreview = () => setShowPreview((prev) => !prev);

  const copyText = useCallback((text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  }, []);

  const formatTextWithLinks = useCallback(
    (text: string) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;

      return String(text || "")
        .split(urlRegex)
        .map((part, idx) =>
          urlRegex.test(part) ? (
            <button
              key={idx}
              onClick={() => window.open(part, "_blank", "noopener,noreferrer")}
              className="mx-1 inline-flex rounded-card px-4 py-2 text-sm font-semibold transition-all"
              style={{
                background: colors.primaryBtn,
                color: "#fff",
              }}
            >
              Pay Now
            </button>
          ) : (
            <span key={idx} style={{ color: colors.softText }}>
              {part}
            </span>
          )
        );
    },
    [colors]
  );

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

  const handleCryptoPayment = async (body: any) => {
    try {
      if (
        !loggedUser?._id ||
        !loggedUser?.email ||
        !formData.depositAmount ||
        !formData.accountNumber
      ) {
        toast.error("Enter all required details (account & amount).");
        return;
      }

      setCreatingLoading(true);

      const { data: resp } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/create-nowPayment-payment`,
        body
      );

      const invoiceUrl = resp?.invoice_url || resp?.invoice?.invoice_url;

      if (!invoiceUrl) throw new Error("Invoice URL not returned");

      toast.success("Redirecting to crypto payment page");
      window.location.href = invoiceUrl;
    } catch {
      toast.error("Could not start crypto payment. Please try again.");
    } finally {
      setCreatingLoading(false);
    }
  };

  const submitHandler = async () => {
    if (creatingLoading || isSubmitting) return;

    if (!selectedPayment) {
      toast.error("Choose a payment method.");
      return;
    }

    if (!agreeToTerms) {
      toast.error("Please agree to Terms & Conditions.");
      return;
    }

    if (!formData.depositAmount || !formData.accountNumber) {
      toast.error("Enter amount and select account.");
      return;
    }

    if (!step2Completed) {
      toast.error("Please confirm deposit bonus and insurance options.");
      return;
    }

    if (!step3Completed) {
      toast.error("Please complete payment method step.");
      return;
    }

    if (isInsuranceClaimDeposit && (!insuranceQuote?.eligible || !wantInsurance)) {
      toast.error("Insurance is required for this claim-funded deposit.");
      return;
    }

    if (!Number(finalPayableAmount) || Number(finalPayableAmount) <= 0) {
      toast.error("Invalid payable amount.");
      return;
    }

    if (selectedPayment?.toLowerCase() === "crypto") {
      return handleCryptoPayment({
        price_amount: Number(finalPayableAmount),
        price_currency: "usd",
        pay_currency: "usdttrc20",
        order_id: `${loggedUser?._id}-${Date.now()}`,
        order_description: isInsuranceClaimDeposit
          ? `Insurance charge for claimed amount on ${formData.accountNumber}`
          : `Deposit for ${formData.accountNumber}`,
        ipn_callback_url: `${import.meta.env.VITE_API_BASE_URL}/api/auth/nowpayments-webhook`,
      });
    }

    const toastID = toast.loading("Submitting...");

    try {
      setCreatingLoading(true);
      setIsSubmitting(true);

      const body = {
        userId: loggedUser._id,
        mt5Account: formData.accountNumber,
        deposit: Number(finalPayableAmount).toFixed(2),
        baseDeposit: formData.depositAmount,
        status: "pending",
        accountType,
        method: selectedPayment,
        transactionId: formData.transactionId,

        wantInsurance: wantInsurance && insuranceQuote?.eligible ? true : false,
        insuranceConfigId:
          wantInsurance && insuranceQuote?.eligible
            ? insuranceQuote?.insuranceConfigId
            : null,

        wantBonus: wantBonus && bonusQuote?.eligible ? true : false,
        bonusConfigId:
          wantBonus && bonusQuote?.eligible
            ? bonusQuote?.depositBonusConfigId
            : null,

        fundingSource: isInsuranceClaimDeposit ? "insurance_claim" : "cash",
        insuranceClaimSourceAccount: claimPrefill?.mt5Account || "",
        insuranceClaimType: claimPrefill?.claimType || "",
        insuranceClaimAmount: claimPrefill?.claimAmount || "",
        insuranceClaimCoverageIds: JSON.stringify(claimPrefill?.coverageIds || []),
      };

      const fd = new FormData();
      Object.entries(body).forEach(([key, value]) =>
        fd.append(key, String(value ?? ""))
      );

      if (file) fd.append("depositSS", file);

      await userApi.post("/deposit", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Deposit request submitted.", { id: toastID });
      setShowTxnModal(true);
      fetchDepositTransactions();
    } catch {
      toast.error("Submission failed. Please try again.", { id: toastID });
    } finally {
      setCreatingLoading(false);
      setIsSubmitting(false);
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
    background: isDark ? "#0f1829" : "#f3f5f9",
    color: isDark ? "#ffffff" : "#0f1829",
  };

  const subtleCard = (): React.CSSProperties => ({
    background: colors.isDark ? colors.surfaceSoft : "rgba(255,247,237,0.92)",
    border: `1.5px solid ${colors.isDark ? colors.border : colors.inputBorder}`,
    borderRadius: "16px",
    boxShadow: colors.isDark ? "none" : colors.inputShadow,
  });

  const panelStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "20px",
    boxShadow: colors.cardShadow,
  };

  const primaryButtonStyle: React.CSSProperties = {
    borderRadius: "14px",
    color: colors.primaryBtnText,
    background: colors.primaryBtn,
    boxShadow: "0 12px 24px rgba(42, 86, 220,0.22)",
  };

  const claimFlowReady =
    !isInsuranceClaimDeposit || (wantInsurance && !!insuranceQuote?.eligible);

  const ctaEnabled =
    step2Completed &&
    step3Completed &&
    selectedPayment &&
    agreeToTerms &&
    formData.depositAmount &&
    formData.accountNumber &&
    !isSubmitting &&
    !creatingLoading &&
    Number(finalPayableAmount) > 0 &&
    claimFlowReady;

  const canContinueStep1 = !!formData.accountNumber && !!formData.depositAmount;
  const canContinueStep2 =
    !bonusLoading && !insuranceLoading && (!isInsuranceClaimDeposit || claimFlowReady);
  const canContinueStep3 = !!selectedPayment;

  const inrAmount =
    Number(formData.depositAmount || 0) *
    Number(siteConfig?.dollarDepositRate || 0);

  const paymentProps = {
    selectedPayment,
    selectedMethod,
    paymentDetails,
    paymentImage,
    bankTransfers,
    selectedBankTransfer,
    formatTextWithLinks,
    copyText,
    handleFileChange,
    fileInputRef,
    file,
    togglePreview,
    previewUrl,
    handleInputChange,
    formData,
    handleRemoveFile,
    rgb,
    rgba,
    inputStyle,
    panelStyle,
    subtleCard,
    isDark,
    textPrimary: colors.text,
    textSecondary: colors.muted,
    textSoft: colors.softText,
    badgeText: colors.accent,
    C: {
      accent: theme?.accent || "42 86 220",
      primary: theme?.primary || theme?.accent || "42 86 220",
      fg: theme?.fg || "255 255 255",
      mutedFg: theme?.mutedFg || theme?.fg || "255 255 255",
      border: theme?.border || theme?.inputBorder || "42 86 220",
      surface1: theme?.surface1 || theme?.bg || "255 255 255",
      surface2: theme?.surface2 || theme?.card || "255 237 213",
      primaryFg: theme?.primaryFg || "255 255 255",
      success: theme?.success || "15 159 110",
      warning: theme?.warning || "163 113 37",
      danger: theme?.danger || "220 58 58",
      ring: theme?.ring || theme?.accent || "42 86 220",
      glow: theme?.accent || "42 86 220",
      radius: theme?.radius || "16px",
      accentFg: theme?.accentFg || "255 255 255",
    },
    showPaymentModal,
    setShowPaymentModal,
    setMethodInteractionDone,
    colors,
  };

  const statusStyle = (status: any) => {
    const tone = statusTone(status);

    if (tone === "approved") {
      return {
        background: isDark ? "rgba(15, 159, 110,0.12)" : "rgba(22,163,74,0.09)",
        border: isDark ? "1px solid rgba(15, 159, 110,0.22)" : "1px solid rgba(22,163,74,0.16)",
        color: colors.success,
      };
    }

    if (tone === "pending") {
      return {
        background: isDark ? "rgba(42, 86, 220,0.12)" : "rgba(42, 86, 220,0.08)",
        border: isDark ? "1px solid rgba(42, 86, 220,0.22)" : "1px solid rgba(42, 86, 220,0.16)",
        color: colors.warning,
      };
    }

    if (tone === "rejected") {
      return {
        background: isDark ? "rgba(220, 58, 58,0.12)" : "rgba(220, 58, 58,0.08)",
        border: isDark ? "1px solid rgba(220, 58, 58,0.22)" : "1px solid rgba(220, 58, 58,0.16)",
        color: colors.danger,
      };
    }

    return {
      background: colors.surfaceSoft,
      border: `1px solid ${colors.border}`,
      color: colors.text,
    };
  };

  const filteredDepositTransactions = useMemo(() => {
    if (!txnQ.trim()) return depositTransactions;

    const term = txnQ.trim().toLowerCase();

    return depositTransactions.filter((row: any) => {
      const searchable = [
        row._id,
        row.mt5Account,
        row.accountType,
        row.deposit,
        row.baseDepositAmount,
        row.finalPayableAmount,
        row.method,
        row.transactionId,
        row.orderId,
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
        row.insuranceOpted,
        row.bonusDetails?.depositAmount,
        row.bonusDetails?.bonusPercent,
        row.bonusDetails?.bonusAmount,
        row.insuranceDetails?.exactAmount,
        row.insuranceDetails?.insuranceChargesPercent,
        row.insuranceDetails?.claimPercent,
        row.insuranceDetails?.insuranceChargeAmount,
      ];

      return searchable.some((v) =>
        String(v ?? "").toLowerCase().includes(term)
      );
    });
  }, [txnQ, depositTransactions]);

  const txnStats = useMemo(() => {
    const total = filteredDepositTransactions.reduce(
      (sum, item: any) => sum + (Number(item.deposit) || 0),
      0
    );

    const totalBonus = filteredDepositTransactions.reduce(
      (sum, item: any) => sum + (Number(item.bonusDetails?.bonusAmount) || 0),
      0
    );

    const approved = filteredDepositTransactions.filter(
      (item: any) => String(item.status).toLowerCase() === "approved"
    ).length;

    const pending = filteredDepositTransactions.filter(
      (item: any) => String(item.status).toLowerCase() === "pending"
    ).length;

    return {
      total,
      approved,
      totalBonus,
      pending,
      rows: filteredDepositTransactions.length,
    };
  }, [filteredDepositTransactions]);

  const handleContinueStep1 = () => {
    if (!canContinueStep1) {
      toast.error("Please select account and enter deposit amount.");
      return;
    }

    setStep1Completed(true);
    setOpenStep(2);
  };

  const handleContinueStep2 = () => {
    if (bonusLoading || insuranceLoading) {
      toast.error("Please wait while we check bonus and insurance eligibility.");
      return;
    }

    if (isInsuranceClaimDeposit && (!insuranceQuote?.eligible || !wantInsurance)) {
      toast.error("Insurance is required for this claim-funded deposit.");
      return;
    }

    setStep2Completed(true);
    setOpenStep(3);
  };

  const handleMethodSelect = (methodName: string) => {
    setSelectedPayment(methodName);
    setMethodInteractionDone(false);
    setStep3Completed(false);
    setShowPaymentModal(true);
  };

  const handleContinueStep3 = () => {
    if (!canContinueStep3) {
      toast.error("Please select a payment method.");
      return;
    }

    if (!methodInteractionDone) {
      toast.error("Please open and close the payment method details first.");
      return;
    }

    setStep3Completed(true);
    scrollToSubmitRequest();
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
                      : "0 30px 80px rgba(42, 86, 220,0.24)",
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
                            deposit · transaction · records
                          </span>
                        </div>

                        <h2
                          className="text-2xl font-bold sm:text-3xl"
                          style={{ color: titleColor, fontFamily: "'Poppins', sans-serif" }}
                        >
                          Deposit Transactions
                        </h2>

                        <p
                          className="mt-2 text-sm sm:text-[15px]"
                          style={{ color: mutedTextColor }}
                        >
                          Here you can view all deposit requests and their live status.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fetchDepositTransactions()}
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
                              ? "rgba(220, 58, 58,0.24)"
                              : "rgba(220, 58, 58,0.18)",
                            background: isDark
                              ? "rgba(220, 58, 58,0.08)"
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
                    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                      <StatCard
                        colors={colors}
                        icon={<Wallet className="h-5 w-5" />}
                        label="Deposits Total"
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
                        icon={<Gift className="h-5 w-5" />}
                        label="Total Bonus"
                        value={`$${money(txnStats.totalBonus)}`}
                        colors={colors}
                        tone="success"
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
                          placeholder="Search by account, method, txn id, status, just now..."
                          className="w-full border py-2.5 pl-9 pr-3 outline-none transition-all duration-300 placeholder:text-primary"
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
                                  Fetching deposits...
                                </p>
                              </div>

                              <SkeletonTable cols={10} colors={colors} />
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
                                subtitle="Please refresh to reload deposit transactions."
                                colors={colors}
                              />
                            </motion.div>
                          ) : filteredDepositTransactions.length === 0 ? (
                            <motion.div
                              key="txn-empty"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="p-6"
                            >
                              <EmptyState
                                title="No deposit transactions found"
                                subtitle="Your deposit history will appear here once available."
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
                              <table className="w-full text-sm table-stack">
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
                                      "Deposit",
                                      "Method",
                                      "Txn ID",
                                      "Insurance / Bonus",
                                      "Requested",
                                      "Proof",
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
                                  {filteredDepositTransactions.map((item: any, i: number) => (
                                    <tr
                                      key={item?._id || `${item.mt5Account}-${i}`}
                                      style={{
                                        borderBottom: `1px solid ${colors.borderSoft}`,
                                      }}
                                    >
                                      <td data-label="Account"
                                        className="px-4 py-3 text-center font-mono text-sm"
                                        style={{ color: titleColor }}
                                      >
                                        #{item?.mt5Account || "N/A"}
                                      </td>

                                      <td data-label="Type" className="px-4 py-3 text-center">
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

                                      <td data-label="Deposit"
                                        className="px-4 py-3 text-center font-semibold"
                                        style={{ color: titleColor }}
                                      >
                                        ${money(item?.deposit)}
                                      </td>

                                      <td data-label="Method" className="px-4 py-3 text-center">
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

                                      <td data-label="Txn ID"
                                        className="px-4 py-3 text-center text-xs font-mono"
                                        style={{ color: mutedTextColor }}
                                      >
                                        {item?.transactionId || "—"}
                                      </td>

                                      <td data-label="Insurance / Bonus" className="px-4 py-4 align-top">
                                        <div className="space-y-2">
                                          <div
                                            className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                                            style={{
                                              borderColor: item.insuranceDetails
                                                ? "rgba(42, 86, 220,0.28)"
                                                : colors.border,
                                              background: item.insuranceDetails
                                                ? isDark
                                                  ? "rgba(79, 125, 246,0.12)"
                                                  : "rgba(42, 86, 220,0.08)"
                                                : colors.surfaceSoft,
                                              color: item.insuranceDetails ? colors.accent : colors.softText,
                                            }}
                                          >
                                            {item.insuranceDetails
                                              ? `Insurance: $${money(item.insuranceDetails.insuranceChargeAmount)}`
                                              : "Insurance: No"}
                                          </div>

                                          <div
                                            className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                                            style={{
                                              borderColor:
                                                item.bonusDetails && Number(item.bonusDetails.bonusPercent) > 0
                                                  ? "rgba(15, 159, 110,0.25)"
                                                  : colors.border,
                                              background:
                                                item.bonusDetails && Number(item.bonusDetails.bonusPercent) > 0
                                                  ? isDark
                                                    ? "rgba(15, 159, 110,0.12)"
                                                    : "rgba(15, 159, 110,0.08)"
                                                  : colors.surfaceSoft,
                                              color:
                                                item.bonusDetails && Number(item.bonusDetails.bonusPercent) > 0
                                                  ? colors.success
                                                  : colors.softText,
                                            }}
                                          >
                                            {item.bonusDetails
                                              ? `Bonus: ${money(item.bonusDetails.bonusPercent)}% ($${money(
                                                  item.bonusDetails.bonusAmount
                                                )})`
                                              : "Bonus: No"}
                                          </div>
                                        </div>
                                      </td>

                                      <td data-label="Requested" className="px-4 py-3 text-center">
                                        <TxnTime date={item?.createdAt} colors={colors} />
                                      </td>

                                      <td data-label="Proof" className="px-4 py-3 text-center">
                                        {item?.depositSS ? (
                                          <a
                                            target="_blank"
                                            rel="noreferrer"
                                            href={
                                              String(item.depositSS).startsWith("http")
                                                ? item.depositSS
                                                : `${import.meta.env.VITE_API_BASE_URL}/${item.depositSS}`
                                            }
                                            className="inline-flex items-center gap-1 text-xs font-semibold underline"
                                            style={{ color: colors.link }}
                                          >
                                            <Eye className="h-3.5 w-3.5" />
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

                                      <td data-label="Status" className="px-4 py-3 text-center">
                                        <span
                                          className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold"
                                          style={statusStyle(item?.status)}
                                        >
                                          {(item?.status || "UNKNOWN").toString().toUpperCase()}
                                        </span>
                                      </td>

                                      <td data-label="Timeline" className="px-4 py-4 align-top">
                                        <div className="space-y-3">
                                          <TxnTime
                                            date={item.updatedAt}
                                            // label="Updated"
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
      <FormPage
        wide
        breadcrumb="Funds / Deposit"
        title="Deposit funds"
        description="Complete your deposit in three steps."
        actions={
          <Button
            variant="secondary"
            onClick={() => setShowTxnModal(true)}
            leftIcon={<History className="h-4 w-4" />}
          >
            Deposit transactions
          </Button>
        }
        steps={[
          {
            key: "account",
            label: "Account & amount",
            state: step1Completed ? "done" : openStep === 1 ? "active" : "todo",
          },
          {
            key: "extras",
            label: "Bonus & insurance",
            state: step2Completed ? "done" : openStep === 2 ? "active" : "todo",
          },
          {
            key: "method",
            label: "Payment method",
            state: step3Completed ? "done" : openStep === 3 ? "active" : "todo",
          },
        ]}
        summary={{
          title: "Summary",
          rows: [
            { label: "Account", value: formData.accountNumber || "—" },
            {
              label: "Deposit amount",
              value: baseAmount > 0 ? "$" + money(baseAmount) : "—",
              weight: "bold",
            },
            { label: "Payment method", value: selectedPayment || "—" },
            ...(bonusAmount > 0
              ? [
                  {
                    label: "Bonus (" + bonusPercent + "%)",
                    value: "+$" + money(bonusAmount),
                    tone: "primary",
                    weight: "bold",
                  },
                ]
              : []),
            ...(insuranceChargeAmount > 0
              ? [
                  {
                    label: "Insurance charge",
                    value: "$" + money(insuranceChargeAmount),
                    tone: "muted",
                  },
                ]
              : []),
          ],
          total: {
            label: isInsuranceClaimDeposit ? "Payable now" : "You pay",
            value: "$" + money(finalPayableAmount),
            tone: "profit",
          },
          checks: [
            {
              ok: !!formData.accountNumber && !!formData.depositAmount,
              text: "An account and amount are set.",
            },
            {
              ok: !!selectedPayment,
              text: selectedPayment
                ? "Paying by " + selectedPayment + "."
                : "Choose a payment method.",
            },
            {
              ok: agreeToTerms,
              text: agreeToTerms
                ? "Terms accepted."
                : "Accept the terms to continue.",
            },
            ...(bonusAmount > 0
              ? [
                  {
                    ok: false,
                    text:
                      "Bonus of $" +
                      money(bonusAmount) +
                      " is credited after approval and carries trading conditions.",
                  },
                ]
              : []),
          ],
        }}
        submit={{
          label:
            selectedPayment?.toLowerCase() === "crypto"
              ? "Process payment"
              : "Submit request",
          onClick: submitHandler,
          disabled: !ctaEnabled,
          loading: creatingLoading || isSubmitting,
          reason:
            !formData.accountNumber || !formData.depositAmount
              ? "Select an account and enter an amount"
              : !selectedPayment
              ? "Choose a payment method"
              : !agreeToTerms
              ? "Accept the terms to continue"
              : "Finish the steps above to continue",
        }}
      >
          {isInsuranceClaimDeposit ? (
            <div
              className="mb-5 rounded-card border px-5 py-4"
              style={{
                borderColor: isDark ? "rgba(15, 159, 110,0.24)" : "rgba(15, 159, 110,0.18)",
                background: isDark ? "rgba(15, 159, 110,0.08)" : "rgba(15, 159, 110,0.06)",
              }}
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold" style={{ color: colors.text }}>
                    Insurance Claim Deposit Flow
                  </div>
                  <div className="mt-1 text-sm" style={{ color: colors.softText }}>
                    Claim amount <strong>${money(claimPrefill?.claimAmount)}</strong> has
                    been auto-filled for account <strong>{claimPrefill?.mt5Account}</strong>.
                    You only need to pay the insurance charge from this page.
                  </div>
                </div>

                <div
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.08)" : "#ffffff",
                    color: colors.success,
                  }}
                >
                  Claim-funded deposit
                </div>
              </div>
            </div>
          ) : null}

          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
              colors={colors}
              icon={<Wallet className="h-5 w-5" />}
              label="Selected Account"
              value={formData.accountNumber || "—"}
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
                  `$${accountBalance || 0}`
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
              hint={`Rate ₹${siteConfig?.dollarDepositRate || 0}`}
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
                  <div className="flex flex-wrap items-center gap-3">
                    <span>Account: {formData.accountNumber || "—"}</span>
                    <span>Amount: ${money(baseAmount)}</span>
                    <span>INR: ₹ {money(inrAmount)}</span>
                  </div>
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
                        <select
                          name="accountNumber"
                          value={formData.accountNumber}
                          onChange={handleInputChange}
                          style={{
                            ...selectStyle,
                            opacity: isInsuranceClaimDeposit ? 0.78 : 1,
                          }}
                          disabled={isInsuranceClaimDeposit}
                        >
                          <option value="" style={optionStyle}>
                            Select Account
                          </option>

                          {loggedUser?.accounts?.map((account: any, index: number) => (
                            <option
                              key={index}
                              value={account.accountNumber}
                              style={optionStyle}
                            >
                              {account.accountNumber} ({account.accountType})
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
                        Deposit Amount (USD)
                      </label>

                      <div className="relative">
                        <DollarSign
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                          style={{ color: isDark ? mutedTextColor : colors.primaryBtn }}
                        />
                        <input
                          type="number"
                          name="depositAmount"
                          placeholder="Enter amount"
                          value={formData.depositAmount}
                          onChange={handleInputChange}
                          className="w-full py-[13px] pl-10 pr-4 text-sm font-semibold placeholder:text-primary"
                          style={{
                            ...inputStyle,
                            opacity: isInsuranceClaimDeposit ? 0.78 : 1,
                          }}
                          disabled={isInsuranceClaimDeposit}
                        />
                      </div>
                    </div>
                  </div>

                  {!isInsuranceClaimDeposit ? (
                    <div className="mt-5">
                      <div
                        className="mb-3 text-sm font-semibold uppercase tracking-[0.08em]"
                        style={{ color: mutedTextColor }}
                      >
                        Quick Select Amount
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {quickAmounts.map((amount) => {
                          const isActive = Number(formData.depositAmount) === amount;

                          return (
                            <button
                              key={amount}
                              type="button"
                              onClick={() => handleQuickAmountSelect(amount)}
                              className="border px-4 py-4 text-center text-sm font-semibold transition-all duration-300"
                              style={{
                                borderColor: isActive ? colors.accent : colors.inputBorder,
                                background: isActive ? colors.accentSoft : colors.surfaceSoft,
                                color: isActive ? accentColor : titleColor,
                                borderRadius: "16px",
                                boxShadow: isActive
                                  ? "0 0 0 4px rgba(42, 86, 220,0.10), 0 12px 24px rgba(42, 86, 220,0.14)"
                                  : !isDark
                                  ? "0 8px 18px rgba(42, 86, 220,0.06)"
                                  : "none",
                              }}
                            >
                              ${amount}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

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
                title="Bonus & Insurance"
                isOpen={openStep === 2}
                isCompleted={step2Completed}
                colors={colors}
                onChange={() => setOpenStep(2)}
                summary={
                  <div className="flex flex-wrap items-center gap-3">
                    {bonusQuote?.eligible ? (
                      <span style={{ color: wantBonus ? colors.success : colors.muted }}>
                        Bonus: {wantBonus ? `Applied ${bonusPercent}%` : "Not applied"}
                      </span>
                    ) : (
                      <span style={{ color: colors.muted }}>Bonus: Not available</span>
                    )}

                    {insuranceQuote?.eligible ? (
                      <span style={{ color: wantInsurance ? colors.success : colors.muted }}>
                        Insurance: {wantInsurance ? `Applied +$${money(insuranceChargeAmount)}` : "Not applied"}
                      </span>
                    ) : (
                      <span style={{ color: colors.muted }}>Insurance: Not available</span>
                    )}

                    <span>Total Payable: ${money(finalPayableAmount)}</span>
                  </div>
                }
              >
                <div className="p-5">
                  <div
                    className="mb-5 rounded-card border px-4 py-3 text-sm"
                    style={{
                      borderColor: colors.border,
                      background: colors.surfaceSoft,
                      color: colors.softText,
                    }}
                  >
                    Applicable deposit bonus and insurance are selected by default. You can
                    untick them before continuing, except insurance is locked for claim-funded deposits.
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <SectionCard
                      className="p-4"
                      style={{
                        background: colors.surface,
                        borderColor: bonusQuote?.eligible ? "rgba(15, 159, 110,0.25)" : colors.border,
                        boxShadow: colors.cardShadow,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card border"
                          style={{
                            background: bonusQuote?.eligible
                              ? isDark
                                ? "rgba(15, 159, 110,0.12)"
                                : "rgba(15, 159, 110,0.08)"
                              : colors.surfaceSoft,
                            borderColor: bonusQuote?.eligible
                              ? "rgba(15, 159, 110,0.25)"
                              : colors.border,
                            color: bonusQuote?.eligible ? colors.success : colors.softText,
                          }}
                        >
                          <Gift className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-semibold" style={{ color: colors.text }}>
                                Apply Deposit Bonus
                              </div>
                              <div className="mt-1 text-sm" style={{ color: colors.softText }}>
                                Bonus will be added after deposit approval.
                              </div>
                            </div>

                            {bonusQuote?.eligible ? (
                              <input
                                type="checkbox"
                                checked={wantBonus}
                                onChange={(e) => setWantBonus(e.target.checked)}
                                className="mt-1 h-4 w-4"
                                style={{ accentColor: colors.primaryBtn }}
                              />
                            ) : null}
                          </div>

                          {bonusLoading ? (
                            <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: colors.muted }}>
                              <LoaderIcon color={accentColor} />
                              Checking bonus eligibility...
                            </div>
                          ) : bonusQuote?.eligible ? (
                            <div
                              className="mt-4 rounded-card border p-3 text-sm"
                              style={{
                                borderColor: "rgba(15, 159, 110,0.22)",
                                background: isDark
                                  ? "rgba(15, 159, 110,0.10)"
                                  : "rgba(15, 159, 110,0.07)",
                                color: colors.success,
                              }}
                            >
                              Eligible for <strong>{Number(bonusQuote?.bonusPercent || 0)}%</strong> bonus ={" "}
                              <strong>${money(Number(bonusQuote?.bonusAmount || 0))}</strong>
                            </div>
                          ) : (
                            <div
                              className="mt-4 rounded-card border p-3 text-sm"
                              style={{
                                borderColor: colors.border,
                                background: colors.surfaceSoft,
                                color: colors.muted,
                              }}
                            >
                              Deposit bonus is not available for this amount.
                            </div>
                          )}
                        </div>
                      </div>
                    </SectionCard>

                    <SectionCard
                      className="p-4"
                      style={{
                        background: colors.surface,
                        borderColor: insuranceQuote?.eligible ? "rgba(42, 86, 220,0.28)" : colors.border,
                        boxShadow: colors.cardShadow,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card border"
                          style={{
                            background: insuranceQuote?.eligible
                              ? isDark
                                ? "rgba(79, 125, 246,0.12)"
                                : "rgba(42, 86, 220,0.08)"
                              : colors.surfaceSoft,
                            borderColor: insuranceQuote?.eligible
                              ? "rgba(42, 86, 220,0.28)"
                              : colors.border,
                            color: insuranceQuote?.eligible ? colors.accent : colors.softText,
                          }}
                        >
                          <ShieldCheck className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-semibold" style={{ color: colors.text }}>
                                Apply Insurance
                              </div>
                              <div className="mt-1 text-sm" style={{ color: colors.softText }}>
                                Insurance charge is added to the payable amount when selected.
                              </div>
                            </div>

                            {insuranceQuote?.eligible ? (
                              <input
                                type="checkbox"
                                checked={wantInsurance}
                                onChange={(e) => setWantInsurance(e.target.checked)}
                                className="mt-1 h-4 w-4"
                                style={{ accentColor: colors.primaryBtn }}
                                disabled={isInsuranceClaimDeposit}
                              />
                            ) : null}
                          </div>

                          {insuranceLoading ? (
                            <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: colors.muted }}>
                              <LoaderIcon color={accentColor} />
                              Checking insurance eligibility...
                            </div>
                          ) : insuranceQuote?.eligible ? (
                            <div
                              className="mt-4 rounded-card border p-3 text-sm"
                              style={{
                                borderColor: "rgba(42, 86, 220,0.26)",
                                background: isDark
                                  ? "rgba(79, 125, 246,0.10)"
                                  : "rgba(42, 86, 220,0.08)",
                                color: colors.accent,
                              }}
                            >
                              Charge <strong>{Number(insuranceQuote?.insuranceChargesPercent || 0)}%</strong> ={" "}
                              <strong>${money(insuranceQuote?.insuranceChargeAmount || 0)}</strong>
                              {isInsuranceClaimDeposit ? (
                                <span className="mt-2 block text-xs" style={{ color: colors.softText }}>
                                  Insurance is mandatory for claim-funded deposits.
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <div
                              className="mt-4 rounded-card border p-3 text-sm"
                              style={{
                                borderColor: colors.border,
                                background: colors.surfaceSoft,
                                color: colors.muted,
                              }}
                            >
                              Insurance is not available for this amount.
                            </div>
                          )}
                        </div>
                      </div>
                    </SectionCard>
                  </div>

                  <div
                    className="mt-5 rounded-card border p-4"
                    style={{
                      borderColor: colors.border,
                      background: colors.surfaceSoft,
                    }}
                  >
                    <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                      <div>
                        <div style={{ color: colors.muted }}>Base Deposit</div>
                        <div className="mt-1 font-bold" style={{ color: colors.text }}>
                          ${money(baseAmount)}
                        </div>
                      </div>

                      <div>
                        <div style={{ color: colors.muted }}>Insurance Charge</div>
                        <div className="mt-1 font-bold" style={{ color: colors.text }}>
                          {wantInsurance && insuranceQuote?.eligible ? `+$${money(insuranceChargeAmount)}` : "$0"}
                        </div>
                      </div>

                      <div>
                        <div style={{ color: colors.muted }}>Total Payable</div>
                        <div className="mt-1 font-bold" style={{ color: colors.primaryBtn }}>
                          ${money(finalPayableAmount)}
                        </div>
                      </div>
                    </div>

                    {bonusQuote?.eligible && wantBonus ? (
                      <div
                        className="mt-3 rounded-card px-3 py-2 text-xs"
                        style={{
                          background: isDark
                            ? "rgba(15, 159, 110,0.10)"
                            : "rgba(15, 159, 110,0.08)",
                          color: colors.success,
                        }}
                      >
                        Bonus selected: <strong>${money(bonusAmount)}</strong> will be credited after approval.
                      </div>
                    ) : null}
                  </div>

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
                title="Payment Method"
                isOpen={openStep === 3}
                isCompleted={step3Completed}
                colors={colors}
                onChange={() => setOpenStep(3)}
                summary={
                  <>
                    <span className="font-semibold" style={{ color: colors.text }}>
                      {selectedPayment || "No method selected"}
                    </span>
                    {methodInteractionDone ? (
                      <span className="ml-2" style={{ color: colors.softText }}>
                        • details viewed
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
                      Select Payment Method
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {uniqueActiveMethods.map((method: any, index: number) => {
                        const active = selectedPayment === method.name;

                        return (
                          <motion.button
                            key={`${method.name}-${index}`}
                            type="button"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleMethodSelect(method.name)}
                            className="w-full border px-4 py-4 text-left transition-all duration-300"
                            style={{
                              borderColor: active ? colors.accent : colors.inputBorder,
                              background: active ? colors.accentSoft : colors.surface,
                              borderRadius: "18px",
                              boxShadow: active
                                ? "0 0 0 4px rgba(42, 86, 220,0.10), 0 12px 26px rgba(42, 86, 220,0.14)"
                                : !isDark
                                ? "0 8px 18px rgba(42, 86, 220,0.06)"
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
                                {method.icon || "💳"}
                              </div>

                              <div className="min-w-0 flex-1">
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
                                  Secure funding option
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

                  {selectedPayment ? (
                    <div
                      className="mb-5 border px-4 py-3"
                      style={{
                        borderRadius: "16px",
                        borderColor: colors.inputBorder,
                        background: colors.surfaceSoft,
                        boxShadow: !isDark ? colors.inputShadow : "none",
                      }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold" style={{ color: colors.text }}>
                            {selectedPayment}
                          </div>
                          <div className="mt-1 text-xs" style={{ color: colors.muted }}>
                            Tap change below or click the card again to reopen modal and view details.
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowPaymentModal(true)}
                          className="inline-flex items-center gap-2 border px-4 py-2 text-xs font-semibold uppercase"
                          style={{
                            borderColor: colors.inputBorder,
                            background: colors.surface,
                            color: colors.accent,
                            borderRadius: "12px",
                          }}
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                          Change
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {selectedPayment ? (
                    <>
                      <SelectedPaymentMethod
                        {...paymentProps}
                        methodInteractionDone={methodInteractionDone}
                      />

                      {!methodInteractionDone ? (
                        <div
                          className="border border-dashed px-4 py-8 text-center"
                          style={{
                            borderColor: colors.accent,
                            background: colors.accentSoft,
                            borderRadius: "16px",
                            boxShadow: !isDark ? colors.inputShadow : "none",
                          }}
                        >
                          <p className="text-sm font-medium" style={{ color: colors.accent }}>
                            Opened method selected.
                          </p>
                          <p className="mt-1 text-sm" style={{ color: colors.softText }}>
                            Close the modal after payment. Then screenshot upload and transaction ID fields will appear here.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-5 flex justify-end">
                          <button
                            type="button"
                            onClick={handleContinueStep3}
                            className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold uppercase"
                            style={{
                              background: colors.primaryBtn,
                              color: "#fff",
                              borderRadius: "14px",
                              opacity: canContinueStep3 ? 1 : 0.7,
                            }}
                          >
                            Continue
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </>
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
                      className="mt-4 overflow-hidden border"
                      style={{
                        borderColor: colors.border,
                        background: colors.surface,
                        borderRadius: "20px",
                        boxShadow: colors.cardShadow,
                      }}
                    >
                      <div
                        className="border-b px-5 py-4"
                        style={{
                          borderColor: colors.border,
                          background: colors.surfaceSoft,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Wallet className="h-5 w-5" style={{ color: colors.accent }} />
                          <h3
                            className="text-base font-semibold"
                            style={{ color: colors.text }}
                          >
                            Payment Summary
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-3 px-5 py-4">
                        <div className="flex items-center justify-between">
                          <span style={{ color: colors.softText }}>
                            {isInsuranceClaimDeposit ? "Claim Amount" : "Deposit Amount"}
                          </span>
                          <span className="font-semibold" style={{ color: colors.text }}>
                            ${money(baseAmount)}
                          </span>
                        </div>

                        {insuranceLoading ? (
                          <div className="flex items-center justify-between">
                            <span style={{ color: colors.softText }}>Insurance</span>
                            <span style={{ color: colors.muted }}>Checking...</span>
                          </div>
                        ) : insuranceQuote?.eligible ? (
                          <div className="flex items-center justify-between">
                            <span style={{ color: colors.softText }}>
                              Insurance Charges ({Number(insuranceQuote?.insuranceChargesPercent || 0)}%)
                              {wantInsurance ? (
                                <span className="ml-2 text-xs" style={{ color: colors.success }}>
                                  Applied
                                </span>
                              ) : (
                                <span className="ml-2 text-xs" style={{ color: colors.muted }}>
                                  Optional
                                </span>
                              )}
                            </span>

                            <span className="font-semibold" style={{ color: colors.text }}>
                              {wantInsurance ? `+$${money(insuranceChargeAmount)}` : "$0"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span style={{ color: colors.softText }}>Insurance</span>
                            <span style={{ color: colors.muted }}>Not available</span>
                          </div>
                        )}

                        {bonusLoading ? (
                          <div className="text-sm" style={{ color: colors.muted }}>
                            Checking bonus...
                          </div>
                        ) : bonusQuote?.eligible ? (
                          <div className="flex items-center justify-between gap-4">
                            <span style={{ color: colors.softText }}>
                              Deposit Bonus ({Number(bonusQuote?.bonusPercent || 0)}%)
                              {wantBonus ? (
                                <span className="ml-2 text-xs" style={{ color: colors.success }}>
                                  Applied
                                </span>
                              ) : (
                                <span className="ml-2 text-xs" style={{ color: colors.muted }}>
                                  Not applied
                                </span>
                              )}
                            </span>
                            <span className="font-semibold" style={{ color: colors.text }}>
                              {wantBonus ? `+$${money(bonusAmount)}` : "$0"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span style={{ color: colors.softText }}>Deposit Bonus</span>
                            <span style={{ color: colors.muted }}>Not available</span>
                          </div>
                        )}

                        <div
                          className="flex items-center justify-between border-t pt-3"
                          style={{ borderColor: colors.border }}
                        >
                          <span className="text-sm font-semibold" style={{ color: colors.text }}>
                            Total Payable
                          </span>
                          <span
                            className="text-lg font-bold"
                            style={{ color: colors.primaryBtn }}
                          >
                            ${money(finalPayableAmount)}
                          </span>
                        </div>

                        {bonusQuote?.eligible && wantBonus ? (
                          <div
                            className="rounded-card px-3 py-2 text-xs"
                            style={{
                              background: isDark
                                ? "rgba(15, 159, 110,0.10)"
                                : "rgba(15, 159, 110,0.08)",
                              color: colors.success,
                            }}
                          >
                            After approval, you will receive <strong>${money(bonusAmount)}</strong> bonus
                            in your bonus wallet ({bonusPercent}%).
                          </div>
                        ) : null}

                        {isInsuranceClaimDeposit ? (
                          <div
                            className="rounded-card px-3 py-2 text-xs"
                            style={{
                              background: isDark
                                ? "rgba(79, 125, 246,0.10)"
                                : "rgba(42, 86, 220,0.08)",
                              color: colors.accent,
                            }}
                          >
                            This is a claim-funded deposit. The claim amount will be treated as the
                            base deposit and you are only paying the insurance charge here.
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-6 border p-4" style={{ ...subtleCard() }}>
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={agreeToTerms}
                          onChange={(e) => setAgreeToTerms(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded"
                          style={{ accentColor: colors.primaryBtn }}
                        />

                        <span className="text-sm" style={{ color: titleColor }}>
                          I agree to the{" "}
                          <a
                            href={siteConfig?.tNcLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                            style={{ color: colors.link }}
                          >
                            Terms & Conditions
                          </a>
                        </span>
                      </label>
                    </div>

                    {/* The submit lives in the FormPage summary rail, and
                        as a sticky bar on phones, so it is never scrolled
                        past above an open keyboard. */}
                  </div>
                </SectionCard>
              </div>
            </div>
          </div>

      </FormPage>

      {showPreview && previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.75)" }}
        >
          <div
            className="max-h-[90vh] max-w-3xl overflow-auto border p-5"
            style={{
              borderColor: colors.border,
              background: colors.surface,
              borderRadius: "20px",
            }}
          >
            <div className="mb-4 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" style={{ color: accentColor }} />
              <h3 className="text-lg font-semibold" style={{ color: titleColor }}>
                Upload Preview
              </h3>
            </div>

            <img
              src={previewUrl}
              alt="Preview"
              className="h-auto max-w-full rounded-card"
            />

            <button
              type="button"
              onClick={togglePreview}
              className="mt-4 w-full px-6 py-3 font-semibold"
              style={{
                background: colors.primaryBtn,
                color: "#fff",
                borderRadius: "14px",
              }}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {txnModal}
    </>
  );
}
