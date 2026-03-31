import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Landmark,
  Upload,
  CheckCircle2,
  DollarSign,
  Image as ImageIcon,
  ChevronDown,
  ReceiptText,
} from "lucide-react";

import UserNewChallengeHook from "../../../hooks/user/UseNewChallengeHook";
import { userApi } from "../../../utils/apiClients";
import SelectedPaymentMethod from "./SelectedPaymentMethod";

/* -------------------- theme helpers -------------------- */
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

function SummaryRow({
  label,
  value,
  theme,
  isDark,
}: {
  label: string;
  value: string;
  theme: any;
  isDark: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-2xl border px-4 py-3"
      style={{
        borderColor: isDark
          ? rgba(theme?.border || "255 255 255", 0.1)
          : "rgba(251,146,60,0.14)",
        background: isDark
          ? "rgba(255,255,255,0.025)"
          : "rgba(255,255,255,0.78)",
      }}
    >
      <span
        className="text-sm"
        style={{
          color: isDark
            ? rgba(theme?.fg || "255 255 255", 0.58)
            : "rgba(100,116,139,0.95)",
        }}
      >
        {label}
      </span>

      <span
        className="text-sm font-semibold text-right"
        style={{
          color: isDark
            ? rgba(theme?.fg || "255 255 255", 0.92)
            : "rgba(30,41,59,0.96)",
        }}
      >
        {value}
      </span>
    </div>
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
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    try {
      getPaymentMethod?.();
    } catch {}
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
              className="mx-2 rounded-full px-6 py-2 font-semibold transition-all"
              style={{
                background: isDark
                  ? "linear-gradient(90deg, rgba(59,130,246,0.95), rgba(34,211,238,0.9))"
                  : "linear-gradient(90deg, rgba(249,115,22,0.96), rgba(251,146,60,0.92))",
                color: "#fff",
                boxShadow: isDark
                  ? "0 14px 34px rgba(59,130,246,0.22)"
                  : "0 14px 34px rgba(249,115,22,0.18)",
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
                  : "rgba(51,65,85,0.94)",
              }}
            >
              {part}
            </span>
          )
        );
    },
    [isDark, theme?.fg]
  );

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

  const ctaEnabled =
    selectedPayment &&
    agreeToTerms &&
    formData.depositAmount &&
    formData.accountNumber &&
    !isSubmitting &&
    !creatingLoading;

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
    optionStyle,
    subtleCard,
    C: {
      accent: theme?.accent || "59 130 246",
      primary: theme?.primary || theme?.accent || "147 51 234",
      fg: theme?.fg || "255 255 255",
      mutedFg: theme?.mutedFg || theme?.fg || "255 255 255",
      border: theme?.border || theme?.inputBorder || "255 255 255",
      surface1: theme?.surface1 || theme?.bg || "0 0 0",
      surface2: theme?.surface2 || theme?.card || "18 18 18",
      primaryFg: theme?.primaryFg || "0 0 0",
      success: theme?.success || "34 197 94",
      warning: theme?.warning || "234 179 8",
      danger: theme?.danger || "244 63 94",
      radius: theme?.radius || "18px",
    },
  };

  const inrAmount =
    Number(formData.depositAmount || 0) *
    Number(siteConfig?.dollarDepositRate || 0);

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
            <TrendingUp className="h-4 w-4" style={{ color: accentColor }} />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: mutedTextColor }}
            >
              deposit · funding · account
            </span>
          </div>

          <h1
            className="text-3xl font-bold sm:text-4xl"
            style={{
              color: titleColor,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Deposit Funds
          </h1>

          <p className="mt-2 text-sm sm:text-[15px]" style={{ color: mutedTextColor }}>
            Choose account, enter amount, select payment method, and submit your
            deposit request securely.
          </p>
        </div>

        <div className="p-4 sm:p-5 md:p-6">
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              theme={theme}
              isDark={isDark}
              icon={<Wallet className="h-5 w-5" />}
              label="Selected Account"
              value={formData.accountNumber || "—"}
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

            {siteConfig?.inrUi !== false ? (
              <StatCard
                theme={theme}
                isDark={isDark}
                icon={<Landmark className="h-5 w-5" />}
                label="INR Amount"
                value={`₹ ${inrAmount || 0}`}
                hint={`Rate: ₹${siteConfig?.dollarDepositRate || 0}`}
                tone="info"
              />
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SectionCard theme={theme} isDark={isDark} className="p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                      className="mb-2 flex items-center gap-2 text-sm font-semibold"
                      style={{ color: titleColor }}
                    >
                      <DollarSign className="h-4 w-4" style={{ color: accentColor }} />
                      2. Enter Deposit Amount
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

                <div className="mt-7">
                  <label
                    className="mb-3 flex items-center gap-2 text-sm font-semibold"
                    style={{ color: titleColor }}
                  >
                    <CreditCard className="h-4 w-4" style={{ color: accentColor }} />
                    3. Choose Payment Method
                  </label>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <AnimatePresence initial={false}>
                      {uniqueActiveMethods.map((method: any, index: number) => {
                        const active = selectedPayment === method.name;

                        return (
                          <motion.button
                            key={`${method.name}-${index}`}
                            type="button"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedPayment(method.name)}
                            className="rounded-2xl border px-4 py-4 transition-all duration-300"
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
                            <div className="flex flex-col items-center justify-center gap-2 text-center">
                              <span className="text-2xl">{method.icon || "💳"}</span>
                              <span
                                className="text-sm font-semibold"
                                style={{
                                  color: active
                                    ? isDark
                                      ? "rgba(191,219,254,0.96)"
                                      : "rgba(194,65,12,0.96)"
                                    : titleColor,
                                }}
                              >
                                {method.name}
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-7">
                  <SelectedPaymentMethod {...paymentProps} />
                </div>

                <div className="mt-7">
                  <label
                    className="mb-2 flex items-center gap-2 text-sm font-semibold"
                    style={{ color: titleColor }}
                  >
                    <ReceiptText className="h-4 w-4" style={{ color: accentColor }} />
                    4. Payment Confirmation
                  </label>

                  <label
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4"
                    style={{
                      borderColor: isDark
                        ? rgba(theme?.border || "255 255 255", 0.12)
                        : "rgba(251,146,60,0.14)",
                      background: isDark
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(255,255,255,0.82)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded"
                      style={{ accentColor: rgb(theme?.accent || "59 130 246") }}
                    />

                    <span
                      className="text-sm"
                      style={{ color: titleColor }}
                    >
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

                <div className="mt-8 flex justify-center sm:justify-start">
                  <motion.button
                    type="button"
                    whileHover={{ scale: ctaEnabled ? 1.02 : 1 }}
                    whileTap={{ scale: ctaEnabled ? 0.98 : 1 }}
                    onClick={submitHandler}
                    disabled={!ctaEnabled}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold"
                    style={{
                      ...primaryButtonStyle,
                      opacity: ctaEnabled ? 1 : 0.65,
                      cursor: ctaEnabled ? "pointer" : "not-allowed",
                    }}
                  >
                    {creatingLoading || isSubmitting ? (
                      <LoaderIcon color="#ffffff" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}

                    <span>
                      {selectedPayment?.toLowerCase() === "crypto"
                        ? "Process Payment"
                        : "Submit Deposit"}
                    </span>
                  </motion.button>
                </div>
              </SectionCard>
            </div>

            <div className="lg:col-span-5">
              <SectionCard theme={theme} isDark={isDark} className="p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" style={{ color: accentColor }} />
                  <h3 className="text-lg font-semibold" style={{ color: titleColor }}>
                    Review & Summary
                  </h3>
                </div>

                <div className="space-y-3">
                  <SummaryRow
                    label="Account Number"
                    value={formData.accountNumber || "—"}
                    theme={theme}
                    isDark={isDark}
                  />
                  <SummaryRow
                    label="Account Type"
                    value={accountType || "—"}
                    theme={theme}
                    isDark={isDark}
                  />
                  <SummaryRow
                    label="Deposit Amount"
                    value={formData.depositAmount ? `$${formData.depositAmount}` : "—"}
                    theme={theme}
                    isDark={isDark}
                  />
                  <SummaryRow
                    label="Payment Method"
                    value={selectedPayment || "—"}
                    theme={theme}
                    isDark={isDark}
                  />
                  <SummaryRow
                    label="Transaction ID"
                    value={formData.transactionId || "—"}
                    theme={theme}
                    isDark={isDark}
                  />
                  {siteConfig?.inrUi !== false ? (
                    <SummaryRow
                      label="INR Conversion"
                      value={`₹ ${inrAmount || 0}`}
                      theme={theme}
                      isDark={isDark}
                    />
                  ) : null}
                </div>

                <div
                  className="mt-5 rounded-2xl border px-4 py-3 text-xs leading-5"
                  style={{
                    borderColor: isDark
                      ? rgba(theme?.border || "255 255 255", 0.1)
                      : "rgba(251,146,60,0.14)",
                    background: isDark
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(255,255,255,0.72)",
                    color: mutedTextColor,
                  }}
                >
                  Please make sure your account number, selected payment method,
                  amount, and proof details are correct before submitting the
                  request.
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </SectionCard>

      {showPreview && previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.75)" }}
        >
          <div
            className="max-h-[90vh] max-w-3xl overflow-auto rounded-[24px] border p-5"
            style={{
              background: isDark
                ? "linear-gradient(180deg, rgba(17,24,39,0.96), rgba(10,15,23,0.98))"
                : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,247,240,0.96))",
              borderColor: isDark
                ? rgba(theme?.border || "255 255 255", 0.12)
                : "rgba(251,146,60,0.16)",
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
              className="h-auto max-w-full rounded-xl"
            />

            <button
              type="button"
              onClick={togglePreview}
              className="mt-4 w-full rounded-full px-6 py-3 font-semibold"
              style={{
                background: isDark
                  ? "rgba(239,68,68,0.9)"
                  : "rgba(220,38,38,0.92)",
                color: "#fff",
              }}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {showPaymentModal && paymentData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.75)" }}
        >
          <div
            className="w-full max-w-md rounded-[24px] border p-6"
            style={{
              background: isDark
                ? "linear-gradient(180deg, rgba(17,24,39,0.96), rgba(10,15,23,0.98))"
                : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,247,240,0.96))",
              borderColor: isDark
                ? rgba(theme?.border || "255 255 255", 0.12)
                : "rgba(251,146,60,0.16)",
            }}
          >
            <div className="space-y-4 text-center">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border"
                style={{
                  borderColor: isDark
                    ? "rgba(16,185,129,0.18)"
                    : "rgba(16,185,129,0.16)",
                  background: isDark
                    ? "rgba(16,185,129,0.10)"
                    : "rgba(240,253,244,0.90)",
                }}
              >
                <div className="text-3xl">✅</div>
              </div>

              <h3
                className="text-2xl font-bold"
                style={{ color: titleColor, fontFamily: "'Poppins', sans-serif" }}
              >
                Payment Initiated
              </h3>

              <div
                className="rounded-2xl border p-4 text-left"
                style={subtleCard()}
              >
                <p style={{ color: titleColor }}>
                  <span style={{ color: mutedTextColor }}>Pay Amount:</span>{" "}
                  {paymentData.pay_amount} {paymentData.pay_currency}
                </p>
                <p style={{ color: titleColor }}>
                  <span style={{ color: mutedTextColor }}>To Address:</span>{" "}
                  {paymentData.pay_address}
                </p>
                <p style={{ color: titleColor }}>
                  <span style={{ color: mutedTextColor }}>Price:</span>{" "}
                  {paymentData.price_amount} {paymentData.price_currency}
                </p>

                {paymentData.expiration_estimate_date && (
                  <p style={{ color: titleColor }}>
                    <span style={{ color: mutedTextColor }}>Expires:</span>{" "}
                    {new Date(paymentData.expiration_estimate_date).toLocaleString()}
                  </p>
                )}

                <p style={{ color: titleColor }}>
                  <span style={{ color: mutedTextColor }}>Payment ID:</span>{" "}
                  {paymentData.payment_id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-full rounded-full py-3 font-semibold"
                style={{
                  background: isDark
                    ? "linear-gradient(90deg, rgba(59,130,246,0.95), rgba(34,211,238,0.9))"
                    : "linear-gradient(90deg, rgba(249,115,22,0.96), rgba(251,146,60,0.92))",
                  color: "#fff",
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}