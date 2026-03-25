import { useEffect, useState, useCallback, useMemo } from "react";
import {
  BadgeDollarSign,
  Loader2,
  RotateCw,
  CreditCard,
  Wallet,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Banknote,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import ModernHeading from "../lib/ModernHeading";
import { AnimatedGrid } from "../../utils/AnimatedGrid";
import { FloatingParticles } from "../../utils/FloatingParticles";
import { FloatingOrbs } from "../../utils/FloatingOrbs";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { userApi } from "../../utils/apiClients";
import { withdrawRequestMail } from "./emails/WithdrwalsMails";

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

const MANAGER_INDEX = import.meta.env.VITE_MANAGER_INDEX;

const ModernWithdraw = () => {
  const loggedUser = useSelector((store: any) => store.user.loggedUser);
  const siteConfig = useSelector((state: any) => state.user.siteConfig);

  // ✅ Theme from redux (same structure as your other pages)
  const themeConfig = useSelector((s: any) => s.user.themeConfig);
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
      radius: theme?.radius || "22px",
      pattern: theme?.pattern || "grid",
      effectsEnabled: theme?.effectsEnabled ?? true,
    }),
    [theme]
  );

  const pageStyle: React.CSSProperties = useMemo(
    () => ({
      minHeight: "100vh",
      background: `radial-gradient(1100px 560px at 18% 0%, ${rgba(
        C.glow,
        0.16
      )}, transparent 60%),
                   radial-gradient(860px 480px at 82% 12%, ${rgba(
                     C.gradientTo,
                     0.12
                   )}, transparent 55%),
                   linear-gradient(135deg, ${rgb(C.bg)}, ${rgb(
        C.surface1
      )}, ${rgb(C.bg)})`,
      color: rgb(C.fg),
    }),
    [C]
  );

  const cardStyle: React.CSSProperties = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${rgba(
        C.surface1,
        0.86
      )}, ${rgba(C.bg, 0.92)}, ${rgba(C.surface1, 0.86)})`,
      border: `1px solid ${rgba(C.border, 0.16)}`,
      borderRadius: "24px",
      boxShadow: `0 0 90px ${rgba(C.glow, 0.12)}, inset 0 0 60px ${rgba(
        "0 0 0",
        0.28
      )}`,
    }),
    [C]
  );

  const sideCardStyle: React.CSSProperties = useMemo(
    () => ({
      background: rgba(C.surface2, 0.12),
      border: `1px solid ${rgba(C.border, 0.14)}`,
      borderRadius: "24px",
      boxShadow: `0 18px 60px ${rgba("0 0 0", 0.22)}`,
    }),
    [C]
  );

  const inputStyle = useMemo(
    () => ({
      background: rgba(C.surface2, 0.18),
      border: `1px solid ${rgba(C.border, 0.16)}`,
      color: rgba(C.fg, 0.92),
    }),
    [C]
  );

  const dollarRate = siteConfig?.dollarWithdrawalRate || 0;
  const inrUiEnabled = siteConfig?.inrUi !== false;

  const [selectedGateway, setSelectedGateway] = useState("");
  const [selectWallet, setSelectWallet] = useState("USDT(Trc20)");
  const [account, selectAccount] = useState("");
  const [amount, setAmount] = useState("");

  const [apiLoader, setApiLoader] = useState(false);
  const [error, setError] = useState("");

  const [balanceLoading, setBalanceLoading] = useState(false);
  const [accountBalance, setAccountBalance] = useState<string | number>("");
  const [accountType, setAccountType] = useState("");

  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);

  // INR equivalent
  const inrAmount = useMemo(() => {
    if (!amount || !dollarRate) return "0";
    return (parseFloat(amount) * Number(dollarRate)).toFixed(2);
  }, [amount, dollarRate]);

  // form validation
  useEffect(() => {
    const isValid = account && selectedGateway && amount && parseFloat(amount) > 0;
    setIsFormValid(Boolean(isValid));
  }, [account, selectedGateway, amount]);

  // Fetch MT5 / account info
  const fetchAccountInfo = useCallback(async () => {
    if (!account) return;

    setBalanceLoading(true);
    try {
      setAccountBalance("");
      const res = await userApi.get(
        `/server-logger-info?account=${account}`
      );

      if(res.status !== 200 ){
        console.log("res is not 200 server logger info.. error");
      }

      if (res?.data?.data?.Equity !== undefined && res.data.data.Equity !== null) {
        setAccountBalance(res.data.data.Equity);
      } else {
        setAccountBalance("");
      }
    } catch {
      // keep silent (UI already shows balance missing)
    } finally {
      setBalanceLoading(false);
    }
  }, [account]);

  useEffect(() => {
    if (account) fetchAccountInfo();
  }, [account, fetchAccountInfo]);

  const withdrawalHandler = async (e: any) => {
    e.preventDefault();
    if (isWithdrawing) return;

    setError("");

    if (!account || !selectedGateway || !amount || parseFloat(amount) <= 0) {
      setError("Please fill all fields correctly.");
      return;
    }

    if (parseFloat(amount) > Number(accountBalance || 0)) {
      setError("Insufficient balance for withdrawal!");
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

      if (sendOtpRes.data?.otp) {
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

      // double-check balance
      if (parseFloat(amount) > Number(accountBalance || 0)) {
        setError("You don't have balance for withdrawal !!");
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

      toast.success("Withdrawal Requested.", { id: toastId });
      setCurrentStep(4);
      setShowOtpInput(false);
      setOtp("");
      fetchAccountInfo();

      window.setTimeout(() => {
        setCurrentStep(1);
        setAmount("");
        selectAccount("");
        setSelectedGateway("");
        setSelectWallet("USDT(Trc20)");
      }, 3000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Withdrawal failed", { id: toastId });
    } finally {
      setApiLoader(false);
      setIsWithdrawing(false);
    }
  };

  // ✅ Only USDT wallets
  const walletOptions = [
    { value: "USDT(Trc20)", label: "USDT (TRC-20)", icon: "₮" },
    { value: "USDT(Bep20)", label: "USDT (BEP-20)", icon: "₮" },
  ];

  const getWalletAddress = (walletType: string) => {
    const mapping: Record<string, any> = {
      "USDT(Trc20)": loggedUser?.walletDetails?.tetherAddress,
      "USDT(Bep20)": loggedUser?.walletDetails?.ethAddress,
    };
    return mapping[walletType] || "Not configured";
  };

  const numericBalance = accountBalance ? Number(accountBalance) : 0;

  return (
    <div className="p-4 md:p-8 relative overflow-hidden" style={pageStyle}>
      {/* Background FX */}
      {C.effectsEnabled && (
        <>
          {C.pattern === "grid" ? <AnimatedGrid /> : null}
          {C.pattern === "dots" ? <FloatingParticles /> : null}
          <FloatingOrbs />
        </>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div className="text-center mb-4">
          <ModernHeading text="Withdraw Funds" />
        </motion.div>
        <p className="text-lg text-center" style={{ color: rgba(C.mutedFg, 0.65) }}>
          Secure and instant withdrawals to your preferred method
        </p>

        {/* Progress Steps */}
        <div className="mb-8 mt-7">
          <div className="flex justify-center items-center space-x-4 mb-6">
            {[
              { step: 1, title: "Details", icon: CreditCard },
              { step: 2, title: "Processing", icon: Loader2 },
              { step: 3, title: "Verify", icon: Shield },
              { step: 4, title: "Complete", icon: CheckCircle2 },
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 ${
                    currentStep >= step ? "text-white" : ""
                  } ${currentStep === step ? "scale-110" : ""}`}
                  style={{
                    background:
                      currentStep >= step
                        ? `linear-gradient(90deg, ${rgba(C.gradientFrom, 0.95)}, ${rgba(
                            C.gradientTo,
                            0.95
                          )})`
                        : "transparent",
                    borderColor:
                      currentStep >= step ? "transparent" : rgba(C.border, 0.22),
                    boxShadow:
                      currentStep === step ? `0 10px 30px ${rgba(C.glow, 0.22)}` : "none",
                  }}
                >
                  <Icon className={`w-5 h-5 ${currentStep === 2 && step === 2 ? "animate-spin" : ""}`} />
                </div>
                <span className="ml-2 text-sm" style={{ color: rgba(C.mutedFg, 0.65) }}>
                  {title}
                </span>
                {step < 4 && (
                  <ArrowRight className="w-4 h-4 ml-4" style={{ color: rgba(C.border, 0.35) }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="p-4 shadow-2xl" style={cardStyle}>
              {/* Step 1 */}
              {currentStep === 1 && (
                <form onSubmit={withdrawalHandler} className="space-y-8">
                  {/* Account */}
                  <div className="group">
                    <label className="flex items-center justify-between text-sm font-semibold mb-3" style={{ color: rgba(C.fg, 0.9) }}>
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" style={{ color: rgba(C.accent, 0.9) }} />
                        Trading Account
                      </span>

                      {balanceLoading ? (
                        <RotateCw className="w-5 h-5 animate-spin" style={{ color: rgba(C.accent, 0.9) }} />
                      ) : numericBalance ? (
                        <div
                          className="rounded-full px-4 py-1"
                          style={{
                            background: `linear-gradient(90deg, ${rgba(C.success, 0.12)}, ${rgba(C.success, 0.06)})`,
                            border: `1px solid ${rgba(C.success, 0.22)}`,
                          }}
                        >
                          <span className="font-bold" style={{ color: rgba(C.success, 0.95) }}>
                            ${numericBalance.toLocaleString()}
                          </span>
                        </div>
                      ) : null}
                    </label>

                    <select
                      value={account}
                      onChange={(e) => {
                        const v = e.target.value;
                        selectAccount(v);
                        const selectedAcc = loggedUser?.accounts?.find(
                          (acc: any) => String(acc.accountNumber) === String(v)
                        );
                        setAccountType(selectedAcc?.accountType || "");
                      }}
                      className="w-full rounded-2xl p-2 focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{
                        ...inputStyle,
                        outline: "none",
                        boxShadow: "none",
                      }}
                    >
                      <option value="" disabled style={{ background: rgb(C.surface1), color: rgba(C.fg, 0.85) }}>
                        Select Trading Account
                      </option>
                      {loggedUser?.accounts?.map((acc: any, index: number) => (
                        <option
                          key={index}
                          value={acc.accountNumber}
                          style={{ background: rgb(C.surface1), color: rgba(C.fg, 0.9) }}
                        >
                          {acc.accountNumber} ({acc.accountType})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Method */}
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: rgba(C.fg, 0.9) }}>
                      <Zap className="w-4 h-4" style={{ color: rgba(C.primary, 0.9) }} />
                      Withdrawal Method
                    </label>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Wallet ONLY */}
                      <div
                        onClick={() => setSelectedGateway("Wallet Transfer")}
                        className="relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          background:
                            selectedGateway === "Wallet Transfer"
                              ? `linear-gradient(135deg, ${rgba(C.primary, 0.16)}, ${rgba(
                                  C.gradientTo,
                                  0.10
                                )})`
                              : rgba(C.surface2, 0.10),
                          borderColor:
                            selectedGateway === "Wallet Transfer"
                              ? rgba(C.primary, 0.35)
                              : rgba(C.border, 0.16),
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="p-3 rounded-xl"
                            style={{
                              background: `linear-gradient(90deg, ${rgba(C.primary, 0.95)}, ${rgba(
                                C.gradientTo,
                                0.95
                              )})`,
                            }}
                          >
                            <Wallet className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold" style={{ color: rgba(C.fg, 0.92) }}>
                              Crypto Wallet
                            </h3>
                            <p className="text-sm" style={{ color: rgba(C.mutedFg, 0.6) }}>
                              To digital wallet
                            </p>
                          </div>
                        </div>

                        {selectedGateway === "Wallet Transfer" && (
                          <CheckCircle2
                            className="absolute top-4 right-4 w-6 h-6"
                            style={{ color: rgba(C.success, 0.95) }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Wallet type */}
                  {selectedGateway === "Wallet Transfer" && (
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: rgba(C.fg, 0.9) }}>
                        <Wallet className="w-4 h-4" style={{ color: rgba(C.gradientTo, 0.9) }} />
                        Choose Wallet Type
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        {walletOptions.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => setSelectWallet(option.value)}
                            className="p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                            style={{
                              background:
                                selectWallet === option.value
                                  ? `linear-gradient(90deg, ${rgba(C.gradientTo, 0.14)}, ${rgba(
                                      C.primary,
                                      0.14
                                    )})`
                                  : rgba(C.surface2, 0.10),
                              borderColor:
                                selectWallet === option.value
                                  ? rgba(C.gradientTo, 0.35)
                                  : rgba(C.border, 0.16),
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{option.icon}</span>
                              <span className="text-sm font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                                {option.label}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amount */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: rgba(C.fg, 0.9) }}>
                        <BadgeDollarSign className="w-4 h-4" style={{ color: rgba(C.success, 0.95) }} />
                        Withdrawal Amount
                      </label>

                      {inrUiEnabled && amount && (
                        <div
                          className="rounded-full px-3 py-1"
                          style={{
                            background: `linear-gradient(90deg, ${rgba(C.warning, 0.14)}, ${rgba(
                              C.danger,
                              0.10
                            )})`,
                            border: `1px solid ${rgba(C.warning, 0.22)}`,
                          }}
                        >
                          <span className="text-sm font-semibold" style={{ color: rgba(C.warning, 0.95) }}>
                            ₹ {inrAmount}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Banknote className="h-6 w-6" style={{ color: rgba(C.mutedFg, 0.45) }} />
                      </div>

                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 text-lg font-semibold"
                        style={{
                          ...inputStyle,
                          boxShadow: "none",
                        }}
                        placeholder="0.00"
                      />

                      {amount && numericBalance && parseFloat(amount) > numericBalance && (
                        <AlertCircle
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5"
                          style={{ color: rgba(C.danger, 0.95) }}
                        />
                      )}
                    </div>

                    {amount && numericBalance && parseFloat(amount) > numericBalance && (
                      <p className="text-sm flex items-center gap-2" style={{ color: rgba(C.danger, 0.95) }}>
                        <AlertCircle className="w-4 h-4" />
                        Insufficient balance
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!isFormValid || isWithdrawing}
                    className="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3"
                    style={{
                      background:
                        isFormValid && !isWithdrawing
                          ? `linear-gradient(90deg, ${rgba(C.gradientFrom, 0.95)}, ${rgba(
                              C.gradientTo,
                              0.95
                            )})`
                          : rgba(C.border, 0.10),
                      color:
                        isFormValid && !isWithdrawing
                          ? rgba(C.accentFg, 0.95)
                          : rgba(C.mutedFg, 0.55),
                      cursor:
                        isFormValid && !isWithdrawing ? "pointer" : "not-allowed",
                      boxShadow:
                        isFormValid && !isWithdrawing
                          ? `0 18px 46px ${rgba(C.glow, 0.20)}`
                          : "none",
                      transform: isFormValid && !isWithdrawing ? "translateZ(0)" : undefined,
                    }}
                  >
                    {isWithdrawing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Request...
                      </>
                    ) : (
                      <>
                        Request Withdrawal
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 3: OTP */}
              {currentStep === 3 && showOtpInput && (
                <div className="text-center space-y-6">
                  <div className="mb-6">
                    <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: rgba(C.accent, 0.9) }} />
                    <h3 className="text-2xl font-bold mb-2" style={{ color: rgba(C.fg, 0.92) }}>
                      Verify Your Identity
                    </h3>
                    <p style={{ color: rgba(C.mutedFg, 0.65) }}>
                      Enter the OTP sent to your email
                    </p>
                  </div>

                  <div className="max-w-xs mx-auto space-y-4">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-center text-2xl font-mono focus:outline-none focus:ring-2 tracking-widest"
                      style={{
                        ...inputStyle,
                        border: `1px solid ${rgba(C.border, 0.18)}`,
                      }}
                      placeholder="000000"
                      maxLength={6}
                    />

                    <button
                      type="button"
                      onClick={verifyOtpHandler}
                      disabled={!otp || apiLoader}
                      className="w-full py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{
                        background: `linear-gradient(90deg, ${rgba(C.success, 0.95)}, ${rgba(
                          C.gradientFrom,
                          0.85
                        )})`,
                        color: rgba(C.accentFg, 0.95),
                        boxShadow: `0 14px 36px ${rgba(C.success, 0.18)}`,
                      }}
                    >
                      {apiLoader ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Verify & Withdraw
                          <CheckCircle2 className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Success */}
              {currentStep === 4 && (
                <div className="text-center space-y-6">
                  <div className="animate-bounce">
                    <CheckCircle2 className="w-20 h-20 mx-auto mb-4" style={{ color: rgba(C.success, 0.95) }} />
                  </div>
                  <h3 className="text-3xl font-bold mb-2" style={{ color: rgba(C.success, 0.95) }}>
                    Withdrawal Successful!
                  </h3>
                  <p style={{ color: rgba(C.mutedFg, 0.65) }}>
                    Your withdrawal request has been processed successfully
                  </p>

                  <div
                    className="rounded-2xl p-6 max-w-sm mx-auto"
                    style={{
                      background: rgba(C.success, 0.10),
                      border: `1px solid ${rgba(C.success, 0.18)}`,
                    }}
                  >
                    <p className="font-semibold" style={{ color: rgba(C.success, 0.95) }}>
                      Amount: ${amount}
                    </p>
                    {inrUiEnabled && (
                      <p className="font-medium mt-1 text-sm" style={{ color: rgba(C.success, 0.8) }}>
                        (~ ₹ {inrAmount})
                      </p>
                    )}
                    <p className="text-sm mt-2" style={{ color: rgba(C.mutedFg, 0.6) }}>
                      Processing time: 1-3 business days
                    </p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div
                  className="mt-4 p-4 rounded-xl flex items-center gap-3"
                  style={{
                    background: rgba(C.danger, 0.10),
                    border: `1px solid ${rgba(C.danger, 0.18)}`,
                  }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: rgba(C.danger, 0.95) }} />
                  <p className="text-sm" style={{ color: rgba(C.danger, 0.95) }}>
                    {error}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            {selectedGateway && (
              <div className="p-6 shadow-xl" style={sideCardStyle}>
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-6 h-6" style={{ color: rgba(C.accent, 0.9) }} />
                  <h3 className="text-xl font-bold" style={{ color: rgba(C.fg, 0.92) }}>
                    Destination Details
                  </h3>
                </div>

                {selectedGateway === "Wallet Transfer" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2" style={{ borderBottom: `1px solid ${rgba(C.border, 0.12)}` }}>
                      <span className="text-sm" style={{ color: rgba(C.mutedFg, 0.65) }}>
                        Wallet Type
                      </span>
                      <span className="font-medium" style={{ color: rgba(C.fg, 0.9) }}>
                        {selectWallet}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm" style={{ color: rgba(C.mutedFg, 0.65) }}>
                        Address
                      </span>
                      <span
                        className="font-medium font-mono text-xs px-2 py-1 rounded"
                        style={{
                          background: rgba(C.surface3, 0.14),
                          border: `1px solid ${rgba(C.border, 0.12)}`,
                          color: rgba(C.fg, 0.9),
                          maxWidth: "62%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={getWalletAddress(selectWallet)}
                      >
                        {getWalletAddress(selectWallet)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security */}
            <div
              className="rounded-3xl p-6 text-center"
              style={{
                background: `linear-gradient(135deg, ${rgba(C.success, 0.10)}, ${rgba(
                  C.success,
                  0.04
                )})`,
                border: `1px solid ${rgba(C.success, 0.16)}`,
                borderRadius: "24px",
              }}
            >
              <Shield className="w-12 h-12 mx-auto mb-3" style={{ color: rgba(C.success, 0.95) }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: rgba(C.success, 0.95) }}>
                Secure Transaction
              </h3>
              <p className="text-sm" style={{ color: rgba(C.mutedFg, 0.65) }}>
                Your withdrawal is protected by bank-level security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernWithdraw;
