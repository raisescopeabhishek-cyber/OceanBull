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
} from "lucide-react";

import UserNewChallengeHook from "../../../hooks/user/UseNewChallengeHook";
import { userApi } from "../../../utils/apiClients";
import SelectedPaymentMethod from "./SelectedPaymentMethod";

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
          iconBg: colors.isDark ? "rgba(16,185,129,0.14)" : "rgba(16,185,129,0.1)",
          iconColor: colors.success,
          border: colors.isDark ? "rgba(16,185,129,0.22)" : "rgba(16,185,129,0.18)",
        }
      : tone === "info"
      ? {
          iconBg: colors.isDark ? "rgba(59,130,246,0.14)" : "rgba(59,130,246,0.09)",
          iconColor: colors.accent,
          border: colors.isDark ? "rgba(59,130,246,0.22)" : "rgba(59,130,246,0.16)",
        }
      : tone === "warning"
      ? {
          iconBg: colors.isDark ? "rgba(245,158,11,0.14)" : "rgba(245,158,11,0.1)",
          iconColor: colors.warning,
          border: colors.isDark ? "rgba(245,158,11,0.22)" : "rgba(245,158,11,0.16)",
        }
      : {
          iconBg: colors.isDark ? "rgba(255,255,255,0.05)" : "rgba(17,24,39,0.04)",
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
                        : "rgba(17,24,39,0.06)",
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
        borderColor: colors.border,
        background: colors.surface,
        borderRadius: "20px",
        boxShadow: colors.cardShadow,
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
      ? rgba(theme?.accent || "96 165 250", 0.95)
      : rgb(theme?.accent || "37 99 235");

    return {
      isDark,
      pageBg: isDark ? "#0b1120" : "#f8fafc",
      heroBg: isDark
        ? "linear-gradient(135deg, rgba(30,41,59,1), rgba(15,23,42,1))"
        : "linear-gradient(135deg, #2563eb, #1d4ed8)",
      surface: isDark ? "rgba(15,23,42,0.92)" : "#ffffff",
      surfaceSoft: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
      surfaceMuted: isDark ? "rgba(255,255,255,0.03)" : "#f1f5f9",
      text: isDark ? "rgba(255,255,255,0.95)" : "#0f172a",
      muted: isDark ? "rgba(255,255,255,0.65)" : "#64748b",
      softText: isDark ? "rgba(255,255,255,0.78)" : "#475569",
      accent,
      accentSoft: isDark ? "rgba(96,165,250,0.12)" : "rgba(37,99,235,0.08)",
      success: isDark ? "rgba(52,211,153,0.95)" : "#16a34a",
      warning: isDark ? "rgba(251,191,36,0.95)" : "#d97706",
      danger: isDark ? "rgba(248,113,113,0.95)" : "#dc2626",
      link: isDark ? "rgba(147,197,253,1)" : "#2563eb",
      border: isDark
        ? rgba(theme?.border || "255 255 255", 0.12)
        : "rgba(15,23,42,0.08)",
      borderSoft: isDark
        ? rgba(theme?.border || "255 255 255", 0.08)
        : "rgba(15,23,42,0.06)",
      cardShadow: isDark
        ? "0 20px 45px rgba(0,0,0,0.28)"
        : "0 10px 30px rgba(15,23,42,0.06)",
      primaryBtn: "#f97316",
      primaryBtnHover: "#ea580c",
      primaryBtnText: "#ffffff",
      stepActiveBg: isDark ? "rgba(59,130,246,0.08)" : "rgba(37,99,235,0.05)",
      tableHead: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
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
  const [accountBalance, setAccountBalance] = useState<string | number>("");
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTxnModal, setShowTxnModal] = useState(false);

  const [txnLoading, setTxnLoading] = useState(false);
  const [txnError, setTxnError] = useState<string | null>(null);
  const [txnQ, setTxnQ] = useState("");
  const [depositTransactions, setDepositTransactions] = useState<any[]>([]);

  const [openStep, setOpenStep] = useState<1 | 2>(1);
  const [step1Completed, setStep1Completed] = useState(false);
  const [step2Completed, setStep2Completed] = useState(false);
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

  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (!formData.accountNumber) return;

      try {
        setBalanceLoading(true);
        setAccountBalance("");

        const res = await userApi.get(
          `/server-logger-info?account=${formData.accountNumber}`
        );

        if (res?.data?.data?.Equity != null) {
          setAccountBalance(res.data.data.Equity);
        } else {
          setAccountBalance("0.00");
        }
      } catch {
        setAccountBalance("0.00");
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchAccountInfo();
  }, [formData.accountNumber]);

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
        } else if (isInsuranceClaimDeposit) {
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
    if (!bonusQuote?.eligible) {
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
              className="mx-1 inline-flex rounded-xl px-4 py-2 text-sm font-semibold transition-all"
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
      navigate("/user/dashboard");
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
    background: colors.surface,
    color: colors.text,
    border: `1px solid ${colors.border}`,
  };

  const inputStyle: React.CSSProperties = {
    background: colors.surface,
    color: titleColor,
    border: `1px solid ${colors.border}`,
    borderRadius: "14px",
    outline: "none",
  };

  const optionStyle: React.CSSProperties = {
    background: isDark ? "#111827" : "#ffffff",
    color: isDark ? "#ffffff" : "#0f172a",
  };

  const subtleCard = (): React.CSSProperties => ({
    background: colors.surfaceSoft,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
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
    boxShadow: "0 12px 24px rgba(249,115,22,0.22)",
  };

  const claimFlowReady =
    !isInsuranceClaimDeposit || (wantInsurance && !!insuranceQuote?.eligible);

  const ctaEnabled =
    selectedPayment &&
    agreeToTerms &&
    formData.depositAmount &&
    formData.accountNumber &&
    !isSubmitting &&
    !creatingLoading &&
    Number(finalPayableAmount) > 0 &&
    claimFlowReady;

  const canContinueStep1 = !!formData.accountNumber && !!formData.depositAmount;
  const canContinueStep2 = !!selectedPayment;

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
      accent: theme?.accent || "37 99 235",
      primary: theme?.primary || theme?.accent || "249 115 22",
      fg: theme?.fg || "255 255 255",
      mutedFg: theme?.mutedFg || theme?.fg || "255 255 255",
      border: theme?.border || theme?.inputBorder || "209 213 219",
      surface1: theme?.surface1 || theme?.bg || "255 255 255",
      surface2: theme?.surface2 || theme?.card || "243 244 246",
      primaryFg: theme?.primaryFg || "255 255 255",
      success: theme?.success || "34 197 94",
      warning: theme?.warning || "234 179 8",
      danger: theme?.danger || "244 63 94",
      ring: theme?.ring || theme?.accent || "37 99 235",
      glow: theme?.accent || "37 99 235",
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
        background: isDark ? "rgba(16,185,129,0.12)" : "rgba(22,163,74,0.09)",
        border: isDark ? "1px solid rgba(16,185,129,0.22)" : "1px solid rgba(22,163,74,0.16)",
        color: colors.success,
      };
    }

    if (tone === "pending") {
      return {
        background: isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.08)",
        border: isDark ? "1px solid rgba(245,158,11,0.22)" : "1px solid rgba(245,158,11,0.16)",
        color: colors.warning,
      };
    }

    if (tone === "rejected") {
      return {
        background: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.08)",
        border: isDark ? "1px solid rgba(239,68,68,0.22)" : "1px solid rgba(239,68,68,0.16)",
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

  const handleMethodSelect = (methodName: string) => {
    setSelectedPayment(methodName);
    setShowPaymentModal(true);
  };

  const handleContinueStep2 = () => {
    if (!canContinueStep2) {
      toast.error("Please select a payment method.");
      return;
    }

    if (!methodInteractionDone) {
      toast.error("Please open and close the payment method details first.");
      return;
    }

    setStep2Completed(true);
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
                      : "0 30px 80px rgba(15,23,42,0.18)",
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
                          style={{ color: mutedTextColor }}
                        />
                        <input
                          value={txnQ}
                          onChange={(e) => setTxnQ(e.target.value)}
                          placeholder="Search by account, method, txn id, status..."
                          className="w-full border py-2.5 pl-9 pr-3 outline-none transition-all duration-300"
                          style={{
                            borderColor: colors.border,
                            background: colors.surface,
                            color: titleColor,
                            borderRadius: "14px",
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
                                      "Deposit",
                                      "Method",
                                      "Txn ID",
                                      "Insurance / Bonus",
                                      "Requested",
                                      "Proof",
                                      "Status",
                                      "approvedAt",
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
                                        ${money(item?.deposit)}
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
                                        className="px-4 py-3 text-center text-xs font-mono"
                                        style={{ color: mutedTextColor }}
                                      >
                                        {item?.transactionId || "—"}
                                      </td>

                                      <td className="px-4 py-4 align-top">
                                        <div className="space-y-2">
                                          <div
                                            className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                                            style={{
                                              borderColor: item.insuranceDetails
                                                ? "rgba(59,130,246,0.25)"
                                                : colors.border,
                                              background: item.insuranceDetails
                                                ? isDark
                                                  ? "rgba(59,130,246,0.12)"
                                                  : "rgba(59,130,246,0.08)"
                                                : colors.surfaceSoft,
                                              color: item.insuranceDetails ? colors.accent : colors.softText,
                                            }}
                                          >
                                            {item.insuranceDetails
                                              ? `Insurance: $${money(item.insuranceDetails.insuranceChargeAmount)} (${money(
                                                  item.insuranceDetails.insuranceChargesPercent
                                                )}%)`
                                              : "Insurance: No"}
                                          </div>

                                          <div
                                            className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                                            style={{
                                              borderColor:
                                                item.bonusDetails && Number(item.bonusDetails.bonusPercent) > 0
                                                  ? "rgba(16,185,129,0.25)"
                                                  : colors.border,
                                              background:
                                                item.bonusDetails && Number(item.bonusDetails.bonusPercent) > 0
                                                  ? isDark
                                                    ? "rgba(16,185,129,0.12)"
                                                    : "rgba(16,185,129,0.08)"
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

                                      <td
                                        className="px-4 py-3 text-center text-xs"
                                        style={{ color: mutedTextColor }}
                                      >
                                        {formatDate(item?.createdAt)}
                                      </td>

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

                                      <td className="px-4 py-3 text-center">
                                        <span
                                          className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold"
                                          style={statusStyle(item?.status)}
                                        >
                                          {(item?.status || "UNKNOWN").toString().toUpperCase()}
                                        </span>
                                      </td>

                                      <td className="px-4 py-4 align-top">
                                        <div className="space-y-1">
                                          <div className="text-sm" style={{ color: colors.text }}>
                                            Created: {formatDate(item.createdAt)}
                                          </div>

                                          <div className="text-xs" style={{ color: colors.muted }}>
                                            Updated: {formatDate(item.updatedAt)}
                                          </div>

                                          {item.approvedAt ? (
                                            <div className="text-xs" style={{ color: colors.success }}>
                                              Approved: {formatDate(item.approvedAt)}
                                            </div>
                                          ) : null}
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
                Deposit Funds
              </div>
              <div className="mt-2 text-sm text-white/80">
                Complete your deposit securely in 2 simple steps
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-6 text-sm text-white/90 md:flex">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Secure Deposit
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTxnModal(true)}
                className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15"
                style={{ borderRadius: "14px" }}
              >
                <History className="h-4 w-4" />
                Deposit Transactions
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 py-5 lg:px-6">
          {isInsuranceClaimDeposit ? (
            <div
              className="mb-5 rounded-[20px] border px-5 py-4"
              style={{
                borderColor: isDark ? "rgba(16,185,129,0.24)" : "rgba(16,185,129,0.18)",
                background: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.06)",
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
                    <span>Amount: ${money(baseAmount)}</span>

                    {insuranceQuote?.eligible && wantInsurance ? (
                      <span>
                        Insurance: +${money(insuranceChargeAmount)} (
                        {Number(insuranceQuote?.insuranceChargesPercent || 0)}%)
                      </span>
                    ) : (
                      <span style={{ color: colors.muted }}>Insurance: No</span>
                    )}

                    {bonusQuote?.eligible && wantBonus ? (
                      <span style={{ color: colors.success }}>
                        Bonus: +${money(bonusAmount)} ({bonusPercent}%)
                      </span>
                    ) : (
                      <span style={{ color: colors.muted }}>Bonus: No</span>
                    )}

                    <span>Total Payable: ${money(finalPayableAmount)}</span>
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
                          style={selectStyle}
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
                          style={{ color: mutedTextColor }}
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
                          style={{ color: mutedTextColor }}
                        />
                        <input
                          type="number"
                          name="depositAmount"
                          placeholder="Enter amount"
                          value={formData.depositAmount}
                          onChange={handleInputChange}
                          className="w-full py-[13px] pl-10 pr-4 text-sm font-semibold"
                          style={inputStyle}
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
                                borderColor: isActive ? colors.accent : colors.border,
                                background: isActive ? colors.accentSoft : colors.surfaceSoft,
                                color: isActive ? accentColor : titleColor,
                                borderRadius: "16px",
                                boxShadow: isActive
                                  ? "0 10px 20px rgba(37,99,235,0.08)"
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
                title="Payment Method"
                isOpen={openStep === 2}
                isCompleted={step2Completed}
                colors={colors}
                onChange={() => setOpenStep(2)}
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
                              borderColor: active ? colors.accent : colors.border,
                              background: active ? colors.accentSoft : colors.surface,
                              borderRadius: "18px",
                              boxShadow: active ? "0 10px 20px rgba(37,99,235,0.08)" : "none",
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
                        borderColor: colors.border,
                        background: colors.surfaceSoft,
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
                            borderColor: colors.border,
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
                          <label
                            className="flex items-start gap-3 rounded-2xl border p-4 cursor-pointer"
                            style={{
                              borderColor: colors.border,
                              background: colors.surfaceSoft,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={wantBonus}
                              onChange={(e) => setWantBonus(e.target.checked)}
                              className="mt-1 h-4 w-4"
                            />

                            <div>
                              <div className="font-semibold flex items-center gap-2" style={{ color: colors.text }}>
                                <Gift className="h-4 w-4" />
                                Apply Deposit Bonus
                              </div>

                              <div className="text-sm mt-1" style={{ color: colors.softText }}>
                                You are eligible for{" "}
                                <span className="font-semibold" style={{ color: colors.success }}>
                                  {bonusPercent}%
                                </span>{" "}
                                bonus ={" "}
                                <span className="font-semibold" style={{ color: colors.success }}>
                                  ${money(bonusAmount)}
                                </span>
                              </div>
                            </div>
                          </label>
                        ) : null}

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
                            className="rounded-xl px-3 py-2 text-xs"
                            style={{
                              background: isDark
                                ? "rgba(34,197,94,0.10)"
                                : "rgba(34,197,94,0.08)",
                              color: colors.success,
                            }}
                          >
                            After approval, you will receive <strong>${money(bonusAmount)}</strong> bonus
                            in your bonus wallet ({bonusPercent}%).
                          </div>
                        ) : null}

                        {isInsuranceClaimDeposit ? (
                          <div
                            className="rounded-xl px-3 py-2 text-xs"
                            style={{
                              background: isDark
                                ? "rgba(59,130,246,0.10)"
                                : "rgba(59,130,246,0.08)",
                              color: colors.accent,
                            }}
                          >
                            This is a claim-funded deposit. The claim amount will be treated as the
                            base deposit and you are only paying the insurance charge here.
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div
                      className="mt-4 text-base font-semibold"
                      style={{ color: colors.success }}
                    >
                      {formData.depositAmount && insuranceQuote?.eligible ? (
                        <div
                          className="mt-4 rounded-[20px] border p-4"
                          style={{
                            borderColor: colors.border,
                            background: colors.surfaceSoft,
                          }}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div
                                className="text-sm font-semibold"
                                style={{ color: colors.text }}
                              >
                                Insurance Availability
                              </div>

                              {insuranceLoading ? (
                                <p className="mt-1 text-sm" style={{ color: colors.muted }}>
                                  Checking insurance eligibility...
                                </p>
                              ) : insuranceQuote?.eligible ? (
                                <p className="mt-1 text-sm" style={{ color: colors.success }}>
                                  Insurance is available for this amount.
                                </p>
                              ) : (
                                <p className="mt-1 text-sm" style={{ color: colors.warning }}>
                                  Insurance is not available for this amount.
                                </p>
                              )}
                            </div>

                            {insuranceQuote?.eligible ? (
                              <label className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={wantInsurance}
                                  onChange={(e) => setWantInsurance(e.target.checked)}
                                  className="h-4 w-4"
                                  disabled={isInsuranceClaimDeposit}
                                />
                                <span
                                  className="text-sm font-medium"
                                  style={{ color: colors.text }}
                                >
                                  {isInsuranceClaimDeposit
                                    ? "Insurance applied for claim flow"
                                    : "I want insurance"}
                                </span>
                              </label>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
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
                        onClick={submitHandler}
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
                        {creatingLoading || isSubmitting ? (
                          <LoaderIcon color="#ffffff" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}

                        <span>
                          {selectedPayment?.toLowerCase() === "crypto"
                            ? "PROCESS PAYMENT"
                            : "SUBMIT REQUEST"}
                        </span>
                      </motion.button>
                    </motion.div>
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
            <div>© 2007-2026 secure checkout</div>
          </div>
        </div>
      </div>

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
              className="h-auto max-w-full rounded-xl"
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