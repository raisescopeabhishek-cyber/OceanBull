import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import axios from "axios";

import UserNewChallengeHook from "../../../hooks/user/UseNewChallengeHook";
import { userApi, adminApi} from "../../../../src/utils/apiClients.js";
import SelectedPaymentMethod from "./SelectedPaymentMethod";

import { AnimatedGrid } from "../../../utils/AnimatedGrid";
import { FloatingParticles } from "../../../utils/FloatingParticles";
import { FloatingOrbs } from "../../../utils/FloatingOrbs";
import ModernHeading from "../../lib/ModernHeading";

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

const luminance = (v: any) => {
  const { r, g, b } = safeRgbParts(v);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

/** ========= Small inline SVG icons (no deps) ========= */
const TrendingUpIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const ActivityIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);
const WalletIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);
const DollarSignIcon = ({ color }: { color: string }) => (
  <svg
    className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2"
    style={{ color }}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
    />
  </svg>
);
const ShieldIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);
const StarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const LoaderIcon = ({ color }: { color: string }) => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" style={{ color }}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default function UserDeposit() {
  const navigate = useNavigate();
  const { getPaymentMethod } = UserNewChallengeHook();

  const loggedUser = useSelector((s: any) => s.user?.loggedUser);
  const siteConfig = useSelector((s: any) => s.user?.siteConfig);
  const paymentMethods = useSelector((s: any) => s.user?.paymentMethods);

  const themeConfig = useSelector((s: any) => s.user?.themeConfig);
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
      gradientFrom: theme?.gradientFrom || theme?.accent || "59 130 246",
      gradientTo: theme?.gradientTo || theme?.primary || "147 51 234",
      radius: theme?.radius || "18px",
      pattern: theme?.pattern || "grid",
      effectsEnabled: theme?.effectsEnabled ?? true,
    }),
    [theme]
  );

  const isDark = useMemo(() => luminance(C.bg) < 0.45, [C.bg]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (!formData.accountNumber) return;
      try {
        setBalanceLoading(true);
        setAccountBalance("");

        const res = await userApi.get(`/server-logger-info?account=${formData.accountNumber}`);
        

        if (res?.data?.data?.Equity != null) setAccountBalance(res?.data?.data?.Equity);
        else setAccountBalance("0.00");
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
    list.forEach((m: any) => {
      if (m?.status === "active" && m?.name && !namesSet.has(m.name)) {
        namesSet.add(m.name);
        unique.push(m);
      }
    });
    return unique;
  }, [paymentMethods]);

  // ✅ ALL bank transfer entries (if multiple)
  const bankTransfers = useMemo(() => {
    const list = Array.isArray(paymentMethods) ? paymentMethods : [];
    return list.filter((m: any) => m.status === "active" && m.name === "Bank Transfer");
  }, [paymentMethods]);

  // ✅ selected method object (IMPORTANT)
  const selectedMethod = useMemo(() => {
    const list = Array.isArray(paymentMethods) ? paymentMethods : [];
    return list.find((m: any) => m.name === selectedPayment);
  }, [paymentMethods, selectedPayment]);

  // ✅ now these are safe
  const paymentDetails = selectedMethod?.details;
  const paymentImage = selectedMethod?.image;
  const selectedBankTransfer = selectedMethod?.bankTransfer; // 👈 single bankTransfer object if present

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    if (name === "accountNumber") {
      const selected = loggedUser?.accounts?.find((a: any) => String(a.accountNumber) === String(value));
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

  const togglePreview = () => setShowPreview((s) => !s);

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
              className="mx-2 px-6 py-2 rounded-full font-semibold transition-all"
              style={{
                background: `linear-gradient(90deg, ${rgba(C.accent, 0.95)}, ${rgba(C.primary, 0.95)})`,
                color: rgb(C.primaryFg),
                boxShadow: `0 16px 40px ${rgba(C.accent, 0.18)}`,
              }}
            >
              Pay Now
            </button>
          ) : (
            <span key={idx} style={{ color: rgba(C.fg, 0.78) }}>
              {part}
            </span>
          )
        );
    },
    [C.accent, C.primary, C.primaryFg, C.fg]
  );

  const handleCryptoPayment = async (body: any) => {
    try {
      if (!loggedUser?._id || !loggedUser?.email || !formData.depositAmount || !formData.accountNumber) {
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
      Object.entries(body).forEach(([k, v]) => fd.append(k, String(v ?? "")));
      if (file) fd.append("depositSS", file);

      await userApi.post("/deposit", fd, { headers: { "Content-Type": "multipart/form-data" } });

      toast.success("Deposit request submitted.", { id: toastID });
      navigate("/user/dashboard");
    } catch {
      toast.error("Submission failed. Please try again.", { id: toastID });
    } finally {
      setCreatingLoading(false);
      setIsSubmitting(false);
    }
  };

  const pageBgStyle: React.CSSProperties = useMemo(
    () => ({
      minHeight: "100vh",
      background: `radial-gradient(1200px 600px at 18% 0%, ${rgba(C.glow, 0.16)}, transparent 60%),
                   radial-gradient(900px 480px at 82% 12%, ${rgba(C.gradientTo, 0.12)}, transparent 55%),
                   linear-gradient(135deg, ${rgb(C.bg)}, ${rgb(C.surface1)}, ${rgb(C.bg)})`,
      color: rgb(C.fg),
      colorScheme: isDark ? ("dark" as any) : ("light" as any),
    }),
    [C, isDark]
  );

  const panelStyle = (opacityA = 0.86): React.CSSProperties => ({
    background: `linear-gradient(135deg, ${rgba(C.surface1, opacityA)}, ${rgba(C.bg, 0.92)}, ${rgba(C.surface1, opacityA)})`,
    border: `1px solid ${rgba(C.border, 0.16)}`,
    borderRadius: C.radius || "18px",
    boxShadow: `0 0 90px ${rgba(C.glow, 0.12)}, inset 0 0 60px ${rgba("0 0 0", 0.28)}`,
  });

  const subtleCard = (): React.CSSProperties => ({
    background: rgba(C.surface2, 0.10),
    border: `1px solid ${rgba(C.border, 0.14)}`,
    borderRadius: "14px",
  });

  const inputStyle: React.CSSProperties = {
    background: rgba(C.surface2, 0.14),
    color: rgba(C.fg, 0.92),
    border: `1px solid ${rgba(C.border, 0.16)}`,
    borderRadius: "14px",
    outline: "none",
  };

  const optionStyle: React.CSSProperties = useMemo(
    () => ({
      background: rgb(C.surface1),
      color: rgba(C.fg, 0.9),
    }),
    [C.surface1, C.fg]
  );

  const ctaEnabled =
    selectedPayment &&
    agreeToTerms &&
    formData.depositAmount &&
    formData.accountNumber &&
    !isSubmitting &&
    !creatingLoading;

  const ctaStyle: React.CSSProperties = ctaEnabled
    ? {
        background: `linear-gradient(90deg, ${rgba(C.accent, 0.95)}, ${rgba(C.primary, 0.95)})`,
        color: rgb(C.primaryFg),
        boxShadow: `0 18px 46px ${rgba(C.accent, 0.18)}`,
      }
    : {
        background: rgba(C.mutedFg, 0.16),
        color: rgba(C.mutedFg, 0.55),
      };

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

    C,
    rgb,
    rgba,
    inputStyle,
    panelStyle,
    optionStyle,
    subtleCard,
  };

  return (
    <div className="relative overflow-hidden" style={pageBgStyle}>
      {C.effectsEnabled && (
        <>
          {C.pattern === "grid" ? <AnimatedGrid /> : null}
          {C.pattern === "dots" ? <FloatingParticles /> : null}
          <FloatingOrbs />
        </>
      )}

      <div className="relative z-10 p-6">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-xl backdrop-blur-sm"
              style={{
                background: `linear-gradient(90deg, ${rgba(C.accent, 0.16)}, ${rgba(C.primary, 0.12)})`,
                border: `1px solid ${rgba(C.border, 0.14)}`,
                color: rgba(C.accentFg || C.fg, 0.9),
              }}
            >
              <TrendingUpIcon />
            </div>
            <div>
              <motion.div className="text-start mb-4">
                <ModernHeading text=" Deposit Funds" />
              </motion.div>
              <p style={{ color: rgba(C.mutedFg, 0.6) }}>Fund your trading account instantly</p>
            </div>
          </div>

          <div className="flex gap-4">
            {siteConfig?.inrUi !== false && (
              <div className="p-4 rounded-xl backdrop-blur-md" style={subtleCard()}>
                <div className="text-sm" style={{ color: rgba(C.accent, 0.9) }}>
                  INR Amount
                </div>
                <div className="text-2xl font-bold" style={{ color: rgba(C.fg, 0.95) }}>
                  ₹ {Number(formData.depositAmount || 0) * Number(siteConfig?.dollarDepositRate || 0)}
                </div>
                <div className="text-xs" style={{ color: rgba(C.mutedFg, 0.6) }}>
                  Rate: ₹{siteConfig?.dollarDepositRate}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 backdrop-blur-xl" style={panelStyle(0.86)}>
              <div className="flex items-center gap-3 mb-4" style={{ color: rgba(C.accentFg || C.fg, 0.9) }}>
                <ActivityIcon />
                <h3 className="text-xl font-semibold" style={{ color: rgba(C.fg, 0.95) }}>
                  Trading Account
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm mb-2 block" style={{ color: rgba(C.mutedFg, 0.7) }}>
                    Select Account
                  </label>

                  <select
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 transition-all"
                    style={{ ...inputStyle, boxShadow: `0 0 0 0 ${rgba(C.ring, 0)}` }}
                    onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 4px ${rgba(C.ring, 0.18)}`)}
                    onBlur={(e) => (e.currentTarget.style.boxShadow = `0 0 0 0 ${rgba(C.ring, 0)}`)}
                  >
                    <option value="" style={optionStyle}>
                      Choose your account
                    </option>
                    {loggedUser?.accounts?.map((a: any, idx: number) => (
                      <option key={idx} value={a.accountNumber} style={optionStyle}>
                        {a.accountNumber} ({a.accountType})
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  className="p-4 rounded-xl transition-all duration-500"
                  style={{
                    background: `linear-gradient(90deg, ${rgba(C.success, 0.10)}, ${rgba(C.success, 0.06)})`,
                    border: `1px solid ${rgba(C.success, 0.22)}`,
                    opacity: formData.accountNumber ? 1 : 0.6,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: rgba(C.success, 0.9) }}>
                      Current Balance
                    </span>
                    {balanceLoading ? (
                      <LoaderIcon color={rgba(C.accentFg || C.fg, 0.8)} />
                    ) : (
                      <span className="text-2xl font-bold" style={{ color: rgba(C.fg, 0.95) }}>
                        ${accountBalance || 0}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 backdrop-blur-xl" style={panelStyle(0.86)}>
              <div className="flex items-center gap-3 mb-4" style={{ color: rgba(C.accentFg || C.fg, 0.9) }}>
                <WalletIcon />
                <h3 className="text-xl font-semibold" style={{ color: rgba(C.fg, 0.95) }}>
                  Deposit Amount
                </h3>
              </div>

              <div className="relative">
                <DollarSignIcon color={rgba(C.mutedFg, 0.55)} />
                <input
                  type="number"
                  name="depositAmount"
                  placeholder="Enter amount"
                  value={formData.depositAmount}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-4 text-lg font-semibold transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 4px ${rgba(C.ring, 0.18)}`)}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = `0 0 0 0 ${rgba(C.ring, 0)}`)}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[100, 500, 1000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setFormData((prev) => ({ ...prev, depositAmount: String(amount) }))}
                    className="py-2 px-3 rounded-lg transition-all text-sm font-semibold"
                    style={{
                      background: rgba(C.surface2, 0.16),
                      border: `1px solid ${rgba(C.border, 0.16)}`,
                      color: rgba(C.mutedFg, 0.7),
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = rgba(C.accent, 0.3);
                      (e.currentTarget as HTMLButtonElement).style.color = rgba(C.fg, 0.92);
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = rgba(C.border, 0.16);
                      (e.currentTarget as HTMLButtonElement).style.color = rgba(C.mutedFg, 0.7);
                    }}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 backdrop-blur-xl" style={panelStyle(0.86)}>
              <div className="flex items-center gap-3 mb-6">
                <div style={{ color: rgba(C.accentFg || C.fg, 0.9) }}>
                  <ShieldIcon />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: rgba(C.fg, 0.95) }}>
                  Payment Methods
                </h3>
                <div className="ml-auto" style={{ color: rgba(C.warning, 0.9) }}>
                  <StarIcon />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {uniqueActiveMethods.map((method: any, index: number) => {
                  const active = selectedPayment === method.name;
                  return (
                    <motion.div
                      key={`${method.name}-${index}`}
                      onClick={() => setSelectedPayment(method.name)}
                      whileHover={{ scale: 1.03, y: -2 }}
                      className="p-4 cursor-pointer rounded-xl transition-all border"
                      style={{
                        background: active
                          ? `linear-gradient(90deg, ${rgba(C.accent, 0.18)}, ${rgba(C.primary, 0.14)})`
                          : rgba(C.surface2, 0.1),
                        borderColor: active ? rgba(C.accent, 0.32) : rgba(C.border, 0.14),
                        boxShadow: active ? `0 18px 44px ${rgba(C.accent, 0.14)}` : "none",
                      }}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div
                          className="p-3 rounded-full"
                          style={{
                            background: active ? rgba(C.accent, 0.18) : rgba(C.surface3, 0.12),
                            color: active ? rgba(C.accentFg || C.fg, 0.92) : rgba(C.mutedFg, 0.7),
                            border: `1px solid ${active ? rgba(C.accent, 0.25) : rgba(C.border, 0.12)}`,
                          }}
                        >
                          <span className="text-base font-semibold">{method.icon || "💳"}</span>
                        </div>

                        <span className="text-sm font-medium" style={{ color: active ? rgba(C.fg, 0.95) : rgba(C.fg, 0.88) }}>
                          {method.name}
                        </span>

                        {active ? <div className="w-2 h-2 rounded-full" style={{ background: rgba(C.accent, 0.9) }} /> : null}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <SelectedPaymentMethod {...paymentProps} />

            <div className="space-y-6">
              <label
                className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all"
                style={{
                  background: rgba(C.surface2, 0.1),
                  borderColor: rgba(C.border, 0.14),
                }}
              >
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-5 h-5 rounded"
                  style={{ accentColor: rgb(C.accent) }}
                />
                <span style={{ color: rgba(C.fg, 0.9) }}>
                  I agree to the{" "}
                  <a
                    href={siteConfig?.tNcLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                    style={{ color: rgba(C.accent, 0.9) }}
                  >
                    Terms & Conditions
                  </a>
                </span>
              </label>

              <div className="flex justify-center">
                <button
                  onClick={submitHandler}
                  disabled={!ctaEnabled}
                  className="flex items-center justify-center py-4 px-12 rounded-full font-semibold text-lg transition-all"
                  style={{
                    ...ctaStyle,
                    opacity: ctaEnabled ? 1 : 0.65,
                    cursor: ctaEnabled ? "pointer" : "not-allowed",
                  }}
                >
                  {(creatingLoading || isSubmitting) && <LoaderIcon color={rgba(C.primaryFg || "0 0 0", 0.92)} />}
                  <span className="ml-2">{selectedPayment === "crypto" ? "Process Payment" : "Submit Request"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && previewUrl && (
          <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm" style={{ background: rgba("0 0 0", 0.78) }}>
            <div
              className="p-6 max-w-3xl max-h-[90vh] overflow-auto"
              style={{
                background: rgba(C.surface1, 0.92),
                border: `1px solid ${rgba(C.border, 0.16)}`,
                borderRadius: "18px",
              }}
            >
              <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded-lg shadow-2xl" />
              <button
                onClick={togglePreview}
                className="mt-4 w-full px-6 py-3 rounded-full font-semibold transition-all"
                style={{
                  background: rgba(C.danger, 0.85),
                  color: rgb(C.primaryFg),
                }}
              >
                Close Preview
              </button>
            </div>
          </div>
        )}

        {/* Crypto Modal (same as yours) */}
        {showPaymentModal && paymentData && (
          <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm" style={{ background: rgba("0 0 0", 0.78) }}>
            <div
              className="p-8 max-w-md w-full mx-4"
              style={{
                background: rgba(C.surface1, 0.92),
                border: `1px solid ${rgba(C.border, 0.16)}`,
                borderRadius: "18px",
              }}
            >
              <div className="text-center space-y-4">
                <div
                  className="rounded-full w-16 h-16 mx-auto flex items-center justify-center"
                  style={{
                    background: `linear-gradient(90deg, ${rgba(C.success, 0.18)}, ${rgba(C.success, 0.10)})`,
                    border: `1px solid ${rgba(C.success, 0.22)}`,
                  }}
                >
                  <div className="text-3xl">✅</div>
                </div>

                <h3 className="text-2xl font-bold" style={{ color: rgba(C.fg, 0.95) }}>
                  Payment Initiated
                </h3>

                <div className="text-left rounded-lg p-4" style={{ background: rgba(C.surface2, 0.14), border: `1px solid ${rgba(C.border, 0.14)}` }}>
                  <p style={{ color: rgba(C.fg, 0.82) }}>
                    <span style={{ color: rgba(C.mutedFg, 0.6) }}>Pay Amount:</span> {paymentData.pay_amount} {paymentData.pay_currency}
                  </p>
                  <p style={{ color: rgba(C.fg, 0.82) }}>
                    <span style={{ color: rgba(C.mutedFg, 0.6) }}>To Address:</span> {paymentData.pay_address}
                  </p>
                  <p style={{ color: rgba(C.fg, 0.82) }}>
                    <span style={{ color: rgba(C.mutedFg, 0.6) }}>Price:</span> {paymentData.price_amount} {paymentData.price_currency}
                  </p>
                  {paymentData.expiration_estimate_date && (
                    <p style={{ color: rgba(C.fg, 0.82) }}>
                      <span style={{ color: rgba(C.mutedFg, 0.6) }}>Expires:</span> {new Date(paymentData.expiration_estimate_date).toLocaleString()}
                    </p>
                  )}
                  <p style={{ color: rgba(C.fg, 0.82) }}>
                    <span style={{ color: rgba(C.mutedFg, 0.6) }}>Payment ID:</span> {paymentData.payment_id}
                  </p>
                </div>

                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full py-3 rounded-full font-semibold transition-all"
                  style={{
                    background: `linear-gradient(90deg, ${rgba(C.accent, 0.95)}, ${rgba(C.primary, 0.95)})`,
                    color: rgb(C.primaryFg),
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
