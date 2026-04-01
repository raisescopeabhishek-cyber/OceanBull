import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  CreditCard,
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
  BadgeCheck,
  ShieldCheck,
  Percent,
  PencilLine,
  ArrowRight,
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
      className={["overflow-hidden border transition-all duration-300", className].join(" ")}
      style={{
        borderColor: isDark
          ? rgba(theme?.border || "255 255 255", 0.1)
          : "rgba(0,0,0,0.08)",
        background: isDark ? "rgba(17,24,39,0.9)" : "#ffffff",
        boxShadow: isDark
          ? "0 10px 30px rgba(0,0,0,0.25)"
          : "0 1px 2px rgba(0,0,0,0.08)",
        borderRadius: "4px",
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
          iconBg: isDark ? "rgba(59,130,246,0.12)" : "rgba(40,116,240,0.10)",
          iconColor: isDark ? "rgba(96,165,250,0.95)" : "rgba(40,116,240,0.95)",
          border: isDark ? "rgba(59,130,246,0.18)" : "rgba(40,116,240,0.16)",
        }
      : tone === "warning"
      ? {
          iconBg: isDark ? "rgba(245,158,11,0.12)" : "rgba(255,159,0,0.10)",
          iconColor: isDark ? "rgba(251,191,36,0.95)" : "rgba(180,83,9,0.95)",
          border: isDark ? "rgba(245,158,11,0.18)" : "rgba(255,159,0,0.16)",
        }
      : {
          iconBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(245,247,250,1)",
          iconColor: isDark ? "rgba(255,255,255,0.88)" : "rgba(17,24,39,0.92)",
          border: isDark
            ? rgba(theme?.border || "255 255 255", 0.12)
            : "rgba(0,0,0,0.08)",
        };

  return (
    <SectionCard theme={theme} isDark={isDark} className="p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl border"
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
                : "rgba(107,114,128,0.96)",
            }}
          >
            {label}
          </div>

          <div
            className="text-lg font-bold"
            style={{
              color: isDark
                ? rgba(theme?.fg || "255 255 255", 0.94)
                : "rgba(17,24,39,0.98)",
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
                  : "rgba(107,114,128,0.88)",
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
            : "rgba(0,0,0,0.08)",
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(245,247,250,1)",
          color: isDark
            ? rgba(theme?.fg || "255 255 255", 0.7)
            : "rgba(107,114,128,0.9)",
        }}
      >
        ⚪
      </div>

      <p
        className="font-semibold"
        style={{
          color: isDark
            ? rgba(theme?.fg || "255 255 255", 0.92)
            : "rgba(17,24,39,0.96)",
        }}
      >
        {title}
      </p>

      <p
        className="mt-1 text-sm"
        style={{
          color: isDark
            ? rgba(theme?.fg || "255 255 255", 0.58)
            : "rgba(107,114,128,0.95)",
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
      className="overflow-x-auto border"
      style={{
        borderColor: isDark
          ? rgba(theme?.border || "255 255 255", 0.12)
          : "rgba(0,0,0,0.08)",
        borderRadius: "4px",
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
                    : "rgba(0,0,0,0.06)"
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
                        : "rgba(243,244,246,1)",
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
  isDark,
}: {
  step: number;
  title: string;
  isOpen: boolean;
  isCompleted: boolean;
  summary?: React.ReactNode;
  onChange?: () => void;
  children?: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <div
      className="overflow-hidden border"
      style={{
        borderColor: "rgba(0,0,0,0.08)",
        background: "#fff",
        borderRadius: "4px",
      }}
    >
      <div
        className="flex items-start justify-between gap-4 px-5 py-4"
        style={{
          background: isOpen ? "#fff7e6" : "#fff",
          borderBottom: isOpen ? "none" : "1px solid rgba(0,0,0,0.06)",
          color: isOpen ? "#fff" : "#555",
        }}
      >
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-sm text-xs font-bold"
            style={{
              background: isOpen ? "#fff" : "#f0f0f0",
              color: isOpen ? "#fff7e6" : "#555",
            }}
          >
            {step}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold uppercase">{title}</span>
              {isCompleted && !isOpen ? (
                <CheckCircle2 className="h-4 w-4 text-[#fff7e6]" />
              ) : null}
            </div>

            {!isOpen && summary ? (
              <div className="mt-2 text-[15px] text-[#212121]">{summary}</div>
            ) : null}
          </div>
        </div>

        {!isOpen && onChange ? (
          <button
            type="button"
            onClick={onChange}
            className="shrink-0 border px-6 py-3 text-sm font-semibold uppercase"
            style={{
              borderColor: "rgba(0,0,0,0.12)",
              color: "#fff7e6",
              background: "#fff",
              borderRadius: "2px",
              minWidth: "132px",
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
  const { getPaymentMethod } = UserNewChallengeHook();

  const loggedUser = useSelector((s: any) => s.user?.loggedUser);
  const siteConfig = useSelector((s: any) => s.user?.siteConfig);
  const paymentMethods = useSelector((s: any) => s.user?.paymentMethods);
  const themeConfig = useSelector((s: any) => s.user?.themeConfig);
  const mode = useSelector((s: any) => s.userTheme?.mode || "light");

  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const isDark = mode === "dark";

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const submitRequestRef = useRef<HTMLDivElement | null>(null);
  const blinkTimeoutRef = useRef<any>(null);

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
          deposit: item.deposit ?? item.amount ?? 0,
          method: (item.method || "N/A").toString(),
          transactionId: item.transactionId || item.txnId || item.trxId || "—",
          createdAt: item.createdAt || item.created_at || item.created || null,
          updatedAt: item.updatedAt || item.updated_at || item.updated || null,
          depositSS: item.depositSS || item.attachment || item.file || null,
          status: item.status || "unknown",
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
              className="mx-1 inline-flex rounded-sm px-4 py-2 text-sm font-semibold transition-all"
              style={{
                background: "#fb641b",
                color: "#fff",
              }}
            >
              Pay Now
            </button>
          ) : (
            <span
              key={idx}
              style={{
                color: isDark
                  ? rgba(theme?.fg || "255 255 255", 0.78)
                  : "rgba(55,65,81,0.94)",
              }}
            >
              {part}
            </span>
          )
        );
    },
    [isDark, theme?.fg]
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

    if (selectedPayment?.toLowerCase() === "crypto") {
      return handleCryptoPayment({
        price_amount: Number(formData.depositAmount),
        price_currency: "usd",
        pay_currency: "usdttrc20",
        order_id: `${loggedUser?._id}-${Date.now()}`,
        order_description: `Deposit for ${formData.accountNumber}`,
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
        deposit: formData.depositAmount,
        status: "pending",
        accountType,
        method: selectedPayment,
        transactionId: formData.transactionId,
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

  const titleColor = isDark
    ? rgba(theme?.fg || "255 255 255", 0.96)
    : "rgba(17,24,39,0.98)";

  const mutedTextColor = isDark
    ? rgba(theme?.fg || "255 255 255", 0.62)
    : "rgba(107,114,128,0.96)";

  const accentColor = isDark
    ? "rgba(96,165,250,0.95)"
    : "#fff7e6";

  const selectStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "2px",
    padding: "13px 42px 13px 14px",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
    color: isDark ? rgba(theme?.fg || "255 255 255", 0.92) : "rgba(31,41,55,0.96)",
    border: isDark
      ? `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`
      : "1px solid #d1d5db",
  };

  const inputStyle: React.CSSProperties = {
    background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
    color: titleColor,
    border: isDark
      ? `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`
      : "1px solid #d1d5db",
    borderRadius: "2px",
    outline: "none",
  };

  const optionStyle: React.CSSProperties = {
    background: isDark ? "#111827" : "#ffffff",
    color: isDark ? "#ffffff" : "#0f172a",
  };

  const subtleCard = (): React.CSSProperties => ({
    background: isDark ? "rgba(255,255,255,0.03)" : "#fafafa",
    border: isDark
      ? `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`
      : "1px solid rgba(0,0,0,0.08)",
    borderRadius: "4px",
  });

  const panelStyle: React.CSSProperties = {
    background: isDark ? "rgba(17,24,39,0.92)" : "#ffffff",
    border: isDark
      ? `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`
      : "1px solid rgba(0,0,0,0.08)",
    borderRadius: "4px",
    boxShadow: isDark
      ? "0 10px 30px rgba(0,0,0,0.22)"
      : "0 1px 2px rgba(0,0,0,0.08)",
  };

  const primaryButtonStyle: React.CSSProperties = {
    borderRadius: "2px",
    color: "#fff",
    background: "#fb641b",
    boxShadow: "0 1px 2px rgba(0,0,0,0.14)",
  };

  const ctaEnabled =
    selectedPayment &&
    agreeToTerms &&
    formData.depositAmount &&
    formData.accountNumber &&
    !isSubmitting &&
    !creatingLoading;

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
    textPrimary: isDark ? "rgba(255,255,255,0.94)" : "rgba(17,24,39,0.98)",
    textSecondary: isDark ? "rgba(255,255,255,0.64)" : "rgba(107,114,128,0.96)",
    textSoft: isDark ? "rgba(255,255,255,0.78)" : "rgba(55,65,81,0.94)",
    badgeText: isDark ? "rgba(191,219,254,0.96)" : "#fff7e6",
    C: {
      accent: theme?.accent || "40 116 240",
      primary: theme?.primary || theme?.accent || "251 100 27",
      fg: theme?.fg || "255 255 255",
      mutedFg: theme?.mutedFg || theme?.fg || "255 255 255",
      border: theme?.border || theme?.inputBorder || "209 213 219",
      surface1: theme?.surface1 || theme?.bg || "255 255 255",
      surface2: theme?.surface2 || theme?.card || "243 244 246",
      primaryFg: theme?.primaryFg || "255 255 255",
      success: theme?.success || "34 197 94",
      warning: theme?.warning || "234 179 8",
      danger: theme?.danger || "244 63 94",
      ring: theme?.ring || theme?.accent || "40 116 240",
      glow: theme?.accent || "40 116 240",
      radius: theme?.radius || "4px",
      accentFg: theme?.accentFg || "255 255 255",
    },
    showPaymentModal,
    setShowPaymentModal,
    setMethodInteractionDone,
  };

  const statusStyle = (status: any) => {
    const tone = statusTone(status);

    if (tone === "approved") {
      return {
        background: isDark ? "rgba(16,185,129,0.12)" : "rgba(22,163,74,0.08)",
        border: isDark ? "1px solid rgba(16,185,129,0.22)" : "1px solid rgba(22,163,74,0.16)",
        color: isDark ? "rgba(52,211,153,0.95)" : "rgba(21,128,61,0.95)",
      };
    }

    if (tone === "pending") {
      return {
        background: isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.08)",
        border: isDark ? "1px solid rgba(245,158,11,0.22)" : "1px solid rgba(245,158,11,0.16)",
        color: isDark ? "rgba(251,191,36,0.95)" : "rgba(180,83,9,0.95)",
      };
    }

    if (tone === "rejected") {
      return {
        background: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.08)",
        border: isDark ? "1px solid rgba(239,68,68,0.22)" : "1px solid rgba(239,68,68,0.16)",
        color: isDark ? "rgba(248,113,113,0.95)" : "rgba(185,28,28,0.95)",
      };
    }

    return {
      background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6",
      border: isDark
        ? `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`
        : "1px solid rgba(0,0,0,0.08)",
      color: titleColor,
    };
  };

  const filteredDepositTransactions = useMemo(() => {
    if (!txnQ.trim()) return depositTransactions;

    const term = txnQ.trim().toLowerCase();

    return depositTransactions.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? "").toLowerCase().includes(term)
      )
    );
  }, [txnQ, depositTransactions]);

  const txnStats = useMemo(() => {
    const total = filteredDepositTransactions.reduce(
      (sum, item: any) => sum + (Number(item.deposit) || 0),
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
      pending,
      rows: filteredDepositTransactions.length,
    };
  }, [filteredDepositTransactions]);

  const savingsAmount = Math.max(Math.round(inrAmount * 0.02), 0);

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
                  className="flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden border"
                  style={{
                    borderColor: isDark
                      ? rgba(theme?.border || "255 255 255", 0.12)
                      : "rgba(0,0,0,0.12)",
                    background: isDark ? "#0f172a" : "#f1f3f6",
                    boxShadow: isDark
                      ? "0 30px 80px rgba(0,0,0,0.45)"
                      : "0 30px 80px rgba(0,0,0,0.16)",
                    borderRadius: "8px",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="border-b px-4 py-4 sm:px-6"
                    style={{
                      borderColor: isDark
                        ? rgba(theme?.border || "255 255 255", 0.1)
                        : "rgba(0,0,0,0.08)",
                      background: isDark ? "rgba(255,255,255,0.02)" : "#ffffff",
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
                            borderColor: isDark
                              ? rgba(theme?.border || "255 255 255", 0.12)
                              : "rgba(0,0,0,0.12)",
                            background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                            color: titleColor,
                            borderRadius: "4px",
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
                            color: isDark
                              ? "rgba(248,113,113,0.95)"
                              : "rgba(220,38,38,0.95)",
                            borderRadius: "4px",
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
                        label="Deposits Total"
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
                          placeholder="Search by account, method, txn id, status..."
                          className="w-full border py-2.5 pl-9 pr-3 outline-none transition-all duration-300"
                          style={{
                            borderColor: isDark
                              ? rgba(theme?.border || "255 255 255", 0.12)
                              : "rgba(0,0,0,0.12)",
                            background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                            color: titleColor,
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                    </div>

                    <SectionCard theme={theme} isDark={isDark}>
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

                              <SkeletonTable cols={8} theme={theme} isDark={isDark} />
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
                                theme={theme}
                                isDark={isDark}
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
                                      : "#f9fafb",
                                    borderBottom: isDark
                                      ? `1px solid ${rgba(theme?.border || "255 255 255", 0.1)}`
                                      : "1px solid rgba(0,0,0,0.08)",
                                  }}
                                >
                                  <tr>
                                    {[
                                      "Account",
                                      "Type",
                                      "Deposit",
                                      "Method",
                                      "Txn ID",
                                      "Requested",
                                      "Proof",
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
                                  {filteredDepositTransactions.map((item: any, i: number) => (
                                    <tr
                                      key={item?._id || `${item.mt5Account}-${i}`}
                                      style={{
                                        borderBottom: isDark
                                          ? `1px solid ${rgba(theme?.border || "255 255 255", 0.08)}`
                                          : "1px solid rgba(0,0,0,0.06)",
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
                                          className="inline-flex rounded-sm border px-3 py-1 text-[11px] font-semibold"
                                          style={{
                                            background: isDark
                                              ? "rgba(59,130,246,0.10)"
                                              : "rgba(219,234,254,0.72)",
                                            borderColor: isDark
                                              ? "rgba(59,130,246,0.18)"
                                              : "rgba(40,116,240,0.16)",
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
                                          className="inline-flex rounded-sm border px-2 py-1 text-[11px] font-semibold"
                                          style={{
                                            background: isDark
                                              ? "rgba(255,255,255,0.03)"
                                              : "#ffffff",
                                            borderColor: isDark
                                              ? rgba(theme?.border || "255 255 255", 0.12)
                                              : "rgba(0,0,0,0.08)",
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
                                            style={{ color: accentColor }}
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
          background: isDark ? "#0b1120" : "#f1f3f6",
        }}
      >
        <div className="w-full" style={{ background: "#fff7e6" }}>
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 lg:px-6">
            <div className="leading-none">
              <div className="text-[30px] font-bold  text-white">Deposite Fund</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-6 text-sm text-white/90 md:flex">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Secure Invest
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTxnModal(true)}
                className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15"
                style={{ borderRadius: "4px" }}
              >
                <History className="h-4 w-4" />
                Deposit Transactions
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 py-5 lg:px-6">
          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
              theme={theme}
              isDark={isDark}
              icon={<Wallet className="h-5 w-5" />}
              label="Selected Account"
              value={formData.accountNumber || "—"}
              hint={accountType || "Choose account"}
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
              hint="Live equity"
              tone="success"
            />
            <StatCard
              theme={theme}
              isDark={isDark}
              icon={<Landmark className="h-5 w-5" />}
              label="INR Equivalent"
              value={`₹ ${money(inrAmount)}`}
              hint={`Rate ₹${siteConfig?.dollarDepositRate || 0}`}
              tone="info"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <div className="xl:col-span-8 space-y-4">
              <CheckoutStep
                step={1}
                title="Select Account"
                isOpen={openStep === 1}
                isCompleted={step1Completed}
                isDark={isDark}
                onChange={() => setOpenStep(1)}
                summary={
                  <>
                    <span className="font-semibold">
                      {formData.accountNumber || "No account selected"}
                    </span>
                    {formData.depositAmount ? (
                      <span className="ml-2 text-[#555]">
                        • ${money(formData.depositAmount)} • {accountType || "N/A"}
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
                        <select
                          name="accountNumber"
                          value={formData.accountNumber}
                          onChange={handleInputChange}
                          style={selectStyle}
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
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div
                      className="border p-4"
                      style={{
                        borderColor: "rgba(0,0,0,0.08)",
                        background: isDark ? "rgba(255,255,255,0.03)" : "#fafafa",
                        borderRadius: "4px",
                      }}
                    >
                      <div className="text-xs text-gray-500">Account Type</div>
                      <div className="mt-1 font-semibold" style={{ color: titleColor }}>
                        {accountType || "Not selected"}
                      </div>
                    </div>

                    <div
                      className="border p-4"
                      style={{
                        borderColor: "rgba(0,0,0,0.08)",
                        background: isDark ? "rgba(255,255,255,0.03)" : "#fafafa",
                        borderRadius: "4px",
                      }}
                    >
                      <div className="text-xs text-gray-500">Live Balance</div>
                      <div className="mt-1 font-semibold" style={{ color: titleColor }}>
                        {balanceLoading ? "Loading..." : `$${money(accountBalance)}`}
                      </div>
                    </div>

                    <div
                      className="border p-4"
                      style={{
                        borderColor: "rgba(0,0,0,0.08)",
                        background: isDark ? "rgba(255,255,255,0.03)" : "#fafafa",
                        borderRadius: "4px",
                      }}
                    >
                      <div className="text-xs text-gray-500">INR Conversion</div>
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
                        background: "#fb641b",
                        color: "#fff",
                        borderRadius: "2px",
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
                isDark={isDark}
                onChange={() => setOpenStep(2)}
                summary={
                  <>
                    <span className="font-semibold">{selectedPayment || "No method selected"}</span>
                    {methodInteractionDone ? (
                      <span className="ml-2 text-[#555]">• details viewed</span>
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
                              borderColor: active ? "#fff7e6" : "rgba(0,0,0,0.08)",
                              background: active ? "rgba(40,116,240,0.05)" : "#ffffff",
                              borderRadius: "4px",
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-10 w-10 items-center justify-center border text-lg"
                                style={{
                                  borderColor: active ? "#fff7e6" : "rgba(0,0,0,0.08)",
                                  background: "#f9fafb",
                                  borderRadius: "4px",
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
                    <div className="mb-5 rounded-sm border border-[#e0e0e0] bg-[#f9fafb] px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#212121]">
                            {selectedPayment}
                          </div>
                          <div className="mt-1 text-xs text-[#666]">
                            Tap change below or click the card again to reopen modal and view details.
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowPaymentModal(true)}
                          className="inline-flex items-center gap-2 border px-4 py-2 text-xs font-semibold uppercase"
                          style={{
                            borderColor: "rgba(0,0,0,0.12)",
                            background: "#fff",
                            color: "#fff7e6",
                            borderRadius: "2px",
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
                        <div className="rounded-sm border border-dashed border-[#c7d2fe] bg-[#f8fbff] px-4 py-8 text-center">
                          <p className="text-sm font-medium text-[#fff7e6]">
                            Opened method selected.
                          </p>
                          <p className="mt-1 text-sm text-[#666]">
                            Close the modal after payment. Then screenshot upload and transaction ID fields will appear here.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="mt-6 border p-4" style={{ ...subtleCard() }}>
                            <label className="flex cursor-pointer items-start gap-3">
                              <input
                                type="checkbox"
                                checked={agreeToTerms}
                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded"
                                style={{ accentColor: "#fff7e6" }}
                              />

                              <span className="text-sm" style={{ color: titleColor }}>
                                I agree to the{" "}
                                <a
                                  href={siteConfig?.tNcLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline"
                                  style={{ color: accentColor }}
                                >
                                  Terms & Conditions
                                </a>
                              </span>
                            </label>
                          </div>

                          <div className="mt-5 flex justify-end">
                            <button
                              type="button"
                              onClick={handleContinueStep2}
                              className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold uppercase"
                              style={{
                                background: "#fb641b",
                                color: "#fff",
                                borderRadius: "2px",
                                opacity: canContinueStep2 ? 1 : 0.7,
                              }}
                            >
                              Continue
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  ) : null}
                </div>
              </CheckoutStep>
            </div>

            <div className="xl:col-span-4">
              <div className="sticky top-4 space-y-4" ref={submitRequestRef}>
                <SectionCard theme={theme} isDark={isDark}>
                  <div className="p-5">
                    <div
                      className="mb-4 text-[28px] font-semibold leading-none"
                      style={{ color: titleColor }}
                    >
                      Price Details
                    </div>

                    <div
                      className="space-y-4 border p-4"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.02)" : "#fafafa",
                        borderColor: isDark
                          ? rgba(theme?.border || "255 255 255", 0.1)
                          : "rgba(0,0,0,0.08)",
                        borderRadius: "4px",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span style={{ color: titleColor }}>Price (1 item)</span>
                        <span style={{ color: titleColor }}>₹{money(inrAmount || 0)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span style={{ color: titleColor }}>Fees</span>
                        <span style={{ color: titleColor }}>
                          ₹{money(Math.round(inrAmount * 0.0025 || 0))}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span style={{ color: titleColor }}>Protect Promise Fee</span>
                        <span style={{ color: titleColor }}>
                          ₹{money(Math.round(inrAmount * 0.0015 || 0))}
                        </span>
                      </div>

                      <div
                        className="border-t pt-4"
                        style={{
                          borderColor: isDark
                            ? rgba(theme?.border || "255 255 255", 0.1)
                            : "rgba(0,0,0,0.08)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-lg font-semibold"
                            style={{ color: titleColor }}
                          >
                            Total Payable
                          </span>
                          <span
                            className="text-lg font-semibold"
                            style={{ color: titleColor }}
                          >
                            ₹{money(inrAmount || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="mt-4 text-base font-semibold"
                      style={{ color: "#388e3c" }}
                    >
                      Your Total Savings on this order ₹{money(savingsAmount)}
                    </div>

                    <div
                      className="mt-4 border px-4 py-3"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.02)" : "#fff7e6",
                        borderColor: isDark
                          ? rgba(theme?.border || "255 255 255", 0.1)
                          : "rgba(255,159,0,0.18)",
                        borderRadius: "4px",
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <Percent className="mt-0.5 h-4 w-4" style={{ color: "#ff9f00" }} />
                        <div className="text-sm" style={{ color: titleColor }}>
                          Save extra ₹{money(Math.max(Math.round(inrAmount * 0.0002), 0))} using reward points
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
                        onClick={submitHandler}
                        disabled={!ctaEnabled}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 px-7 py-3 text-sm font-bold"
                        style={{
                          ...primaryButtonStyle,
                          opacity: ctaEnabled ? 1 : 0.65,
                          cursor: ctaEnabled ? "pointer" : "not-allowed",
                          boxShadow: highlightSubmit
                            ? "0 0 0 4px rgba(251, 100, 27, 0.18), 0 0 22px rgba(251, 100, 27, 0.28)"
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

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
            <div className="flex flex-wrap items-center gap-4">
              <span>Policies: Returns Policy</span>
              <span>Terms of use</span>
              <span>Security</span>
              <span>Privacy</span>
            </div>
            <div>© 2007-2026 flipkart-style checkout</div>
          </div>
        </div>
      </div>

      {showPreview && previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.75)" }}
        >
          <div
            className="max-h-[90vh] max-w-3xl overflow-auto border bg-white p-5"
            style={{
              borderColor: isDark
                ? rgba(theme?.border || "255 255 255", 0.12)
                : "rgba(0,0,0,0.12)",
              borderRadius: "6px",
            }}
          >
            <div className="mb-4 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" style={{ color: accentColor }} />
              <h3
                className="text-lg font-semibold"
                style={{ color: titleColor }}
              >
                Upload Preview
              </h3>
            </div>

            <img
              src={previewUrl}
              alt="Preview"
              className="h-auto max-w-full rounded"
            />

            <button
              type="button"
              onClick={togglePreview}
              className="mt-4 w-full px-6 py-3 font-semibold"
              style={{
                background: "#fb641b",
                color: "#fff",
                borderRadius: "2px",
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