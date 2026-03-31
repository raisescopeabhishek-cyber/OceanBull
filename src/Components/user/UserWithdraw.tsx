import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
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
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import { userApi } from "../../utils/apiClients";
import { withdrawRequestMail } from "./emails/WithdrwalsMails";

const UserWithdraw = () => {
  const mode = useSelector((store: any) => store.userTheme?.mode || "light");
  const loggedUser = useSelector((store: any) => store.user.loggedUser);
  const siteConfig = useSelector((state: any) => state.user.siteConfig);

  const isDark = mode === "dark";

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

  const inrAmount = useMemo(() => {
    if (!amount || !dollarRate) return "0";
    return (parseFloat(amount) * Number(dollarRate)).toFixed(2);
  }, [amount, dollarRate]);

  useEffect(() => {
    const isValid =
      account && selectedGateway && amount && parseFloat(amount) > 0;
    setIsFormValid(Boolean(isValid));
  }, [account, selectedGateway, amount]);

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

      if (sendOtpRes?.data?.otp) {
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
          selectedGateway === "Bank Transfer"
            ? selectedGateway
            : selectWallet,
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
        selectAccount("");
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

  const stepItems = [
    { step: 1, title: "Details", icon: CreditCard },
    { step: 2, title: "Processing", icon: Loader2 },
    { step: 3, title: "Verify", icon: Shield },
    { step: 4, title: "Complete", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-[calc(100vh-260px)] p-1 sm:p-2 md:p-4">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div
          className={[
            "mb-6 overflow-hidden rounded-[28px] border backdrop-blur-xl",
            isDark
              ? "border-white/10 bg-white/[0.045] shadow-[0_20px_70px_rgba(0,0,0,0.45)]"
              : "border-orange-100/80 bg-white/70 shadow-[0_18px_50px_rgba(251,146,60,0.10)]",
          ].join(" ")}
        >
          <div
            className={[
              "relative px-4 py-5 sm:px-6 sm:py-6",
              isDark
                ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]"
                : "bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,247,240,0.80))]",
            ].join(" ")}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div
                  className={[
                    "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                    isDark
                      ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                      : "border-orange-200 bg-orange-50 text-orange-700",
                  ].join(" ")}
                >
                  <Wallet size={14} />
                  Funds Withdrawal
                </div>

                <h1 className="text-2xl font-bold sm:text-3xl">
                  Withdraw Funds
                </h1>

                <p
                  className={[
                    "mt-2 max-w-2xl text-sm sm:text-[15px]",
                    isDark ? "text-white/55" : "text-slate-600",
                  ].join(" ")}
                >
                  Secure withdrawal flow with trading account balance check, OTP
                  verification, and wallet destination details.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div
                  className={[
                    "rounded-2xl border px-4 py-3 backdrop-blur-md",
                    isDark
                      ? "border-white/10 bg-white/[0.04]"
                      : "border-orange-100 bg-white/70",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        isDark
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-emerald-50 text-emerald-700",
                      ].join(" ")}
                    >
                      <Shield size={18} />
                    </div>
                    <div>
                      <p
                        className={[
                          "text-[11px] uppercase tracking-[0.16em]",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        Security
                      </p>
                      <p className="text-sm font-semibold">OTP Protected</p>
                    </div>
                  </div>
                </div>

                <div
                  className={[
                    "rounded-2xl border px-4 py-3 backdrop-blur-md",
                    isDark
                      ? "border-white/10 bg-white/[0.04]"
                      : "border-orange-100 bg-white/70",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        isDark
                          ? "bg-blue-500/10 text-blue-300"
                          : "bg-orange-50 text-orange-700",
                      ].join(" ")}
                    >
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p
                        className={[
                          "text-[11px] uppercase tracking-[0.16em]",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        Balance
                      </p>
                      <p className="text-sm font-semibold">
                        Live Equity Check
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={[
                    "rounded-2xl border px-4 py-3 backdrop-blur-md",
                    isDark
                      ? "border-white/10 bg-white/[0.04]"
                      : "border-orange-100 bg-white/70",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        isDark
                          ? "bg-cyan-500/10 text-cyan-300"
                          : "bg-amber-50 text-amber-700",
                      ].join(" ")}
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-current animate-pulse" />
                    </div>
                    <div>
                      <p
                        className={[
                          "text-[11px] uppercase tracking-[0.16em]",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        Status
                      </p>
                      <p className="text-sm font-semibold">Active Flow</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={[
                "pointer-events-none absolute inset-x-0 top-0 h-px",
                isDark
                  ? "bg-gradient-to-r from-transparent via-blue-300/30 to-transparent"
                  : "bg-gradient-to-r from-transparent via-orange-300/70 to-transparent",
              ].join(" ")}
            />
          </div>
        </div>

        {/* Steps */}
        <div
          className={[
            "mb-6 rounded-[28px] border p-4 sm:p-5 backdrop-blur-xl",
            isDark
              ? "border-white/10 bg-white/[0.035]"
              : "border-orange-100/80 bg-white/60",
          ].join(" ")}
        >
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {stepItems.map(({ step, title, icon: Icon }, index) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={[
                    "flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300",
                    currentStep >= step
                      ? isDark
                        ? "border-blue-400/30 bg-blue-500/15 text-blue-200"
                        : "border-orange-200 bg-orange-50 text-orange-700"
                      : isDark
                      ? "border-white/10 bg-white/[0.03] text-white/45"
                      : "border-slate-200 bg-white text-slate-400",
                  ].join(" ")}
                >
                  <Icon
                    className={step === 2 && currentStep === 2 ? "animate-spin" : ""}
                    size={18}
                  />
                </div>

                <div>
                  <p
                    className={[
                      "text-xs uppercase tracking-[0.15em]",
                      isDark ? "text-white/35" : "text-slate-500",
                    ].join(" ")}
                  >
                    Step {step}
                  </p>
                  <p className="text-sm font-semibold">{title}</p>
                </div>

                {index < stepItems.length - 1 && (
                  <ArrowRight
                    size={16}
                    className={isDark ? "text-white/20" : "text-slate-300"}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left */}
          <div className="xl:col-span-2">
            <div
              className={[
                "rounded-[28px] border backdrop-blur-xl",
                isDark
                  ? "border-white/10 bg-white/[0.035] shadow-[0_20px_70px_rgba(0,0,0,0.40)]"
                  : "border-orange-100/80 bg-white/65 shadow-[0_16px_50px_rgba(251,146,60,0.10)]",
              ].join(" ")}
            >
              <div
                className={[
                  "h-px",
                  isDark
                    ? "bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    : "bg-gradient-to-r from-transparent via-orange-200 to-transparent",
                ].join(" ")}
              />

              <div className="p-4 sm:p-6">
                {currentStep === 1 && (
                  <form onSubmit={withdrawalHandler} className="space-y-6">
                    {/* Account */}
                    <div
                      className={[
                        "rounded-[24px] border p-4",
                        isDark
                          ? "border-white/10 bg-white/[0.03]"
                          : "border-orange-100/70 bg-white/70",
                      ].join(" ")}
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-sm font-semibold">
                          <TrendingUp
                            size={16}
                            className={
                              isDark ? "text-blue-300" : "text-orange-600"
                            }
                          />
                          Trading Account
                        </label>

                        {balanceLoading ? (
                          <RotateCw
                            size={18}
                            className={`animate-spin ${
                              isDark ? "text-blue-300" : "text-orange-600"
                            }`}
                          />
                        ) : numericBalance ? (
                          <div
                            className={[
                              "rounded-full border px-4 py-1 text-sm font-semibold",
                              isDark
                                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700",
                            ].join(" ")}
                          >
                            ${numericBalance.toLocaleString()}
                          </div>
                        ) : null}
                      </div>

                      <select
                        value={account}
                        onChange={(e) => {
                          const v = e.target.value;
                          selectAccount(v);
                          const selectedAcc = loggedUser?.accounts?.find(
                            (acc: any) =>
                              String(acc.accountNumber) === String(v)
                          );
                          setAccountType(selectedAcc?.accountType || "");
                        }}
                        className={[
                          "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition",
                          isDark
                            ? "border-white/10 bg-white/[0.04] text-white"
                            : "border-orange-100 bg-white text-slate-800",
                        ].join(" ")}
                      >
                        <option value="" disabled>
                          Select Trading Account
                        </option>
                        {loggedUser?.accounts?.map((acc: any, index: number) => (
                          <option key={index} value={acc.accountNumber}>
                            {acc.accountNumber} ({acc.accountType})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Method */}
                    <div
                      className={[
                        "rounded-[24px] border p-4",
                        isDark
                          ? "border-white/10 bg-white/[0.03]"
                          : "border-orange-100/70 bg-white/70",
                      ].join(" ")}
                    >
                      <label className="mb-4 flex items-center gap-2 text-sm font-semibold">
                        <Zap
                          size={16}
                          className={isDark ? "text-blue-300" : "text-orange-600"}
                        />
                        Withdrawal Method
                      </label>

                      <div
                        onClick={() => setSelectedGateway("Wallet Transfer")}
                        className={[
                          "relative cursor-pointer rounded-2xl border p-4 transition-all",
                          selectedGateway === "Wallet Transfer"
                            ? isDark
                              ? "border-blue-400/30 bg-blue-500/10"
                              : "border-orange-200 bg-orange-50"
                            : isDark
                            ? "border-white/10 bg-white/[0.03]"
                            : "border-slate-200 bg-white",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={[
                              "flex h-12 w-12 items-center justify-center rounded-xl",
                              isDark
                                ? "bg-blue-500/15 text-blue-300"
                                : "bg-orange-100 text-orange-700",
                            ].join(" ")}
                          >
                            <Wallet size={22} />
                          </div>

                          <div>
                            <h3 className="font-semibold">Crypto Wallet</h3>
                            <p
                              className={[
                                "text-sm",
                                isDark ? "text-white/55" : "text-slate-500",
                              ].join(" ")}
                            >
                              Withdraw directly to your wallet
                            </p>
                          </div>
                        </div>

                        {selectedGateway === "Wallet Transfer" && (
                          <CheckCircle2
                            size={22}
                            className={`absolute right-4 top-4 ${
                              isDark ? "text-emerald-300" : "text-emerald-600"
                            }`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Wallet type */}
                    {selectedGateway === "Wallet Transfer" && (
                      <div
                        className={[
                          "rounded-[24px] border p-4",
                          isDark
                            ? "border-white/10 bg-white/[0.03]"
                            : "border-orange-100/70 bg-white/70",
                        ].join(" ")}
                      >
                        <label className="mb-4 flex items-center gap-2 text-sm font-semibold">
                          <Wallet
                            size={16}
                            className={
                              isDark ? "text-cyan-300" : "text-orange-600"
                            }
                          />
                          Choose Wallet Type
                        </label>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {walletOptions.map((option) => (
                            <div
                              key={option.value}
                              onClick={() => setSelectWallet(option.value)}
                              className={[
                                "cursor-pointer rounded-2xl border p-4 transition-all",
                                selectWallet === option.value
                                  ? isDark
                                    ? "border-blue-400/30 bg-blue-500/10"
                                    : "border-orange-200 bg-orange-50"
                                  : isDark
                                  ? "border-white/10 bg-white/[0.03]"
                                  : "border-slate-200 bg-white",
                              ].join(" ")}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{option.icon}</span>
                                <span className="text-sm font-medium">
                                  {option.label}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Amount */}
                    <div
                      className={[
                        "rounded-[24px] border p-4",
                        isDark
                          ? "border-white/10 bg-white/[0.03]"
                          : "border-orange-100/70 bg-white/70",
                      ].join(" ")}
                    >
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-sm font-semibold">
                          <BadgeDollarSign
                            size={16}
                            className={
                              isDark ? "text-emerald-300" : "text-emerald-600"
                            }
                          />
                          Withdrawal Amount
                        </label>

                        {inrUiEnabled && amount && (
                          <div
                            className={[
                              "rounded-full border px-3 py-1 text-sm font-semibold",
                              isDark
                                ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
                                : "border-amber-200 bg-amber-50 text-amber-700",
                            ].join(" ")}
                          >
                            ₹ {inrAmount}
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                          <Banknote
                            size={20}
                            className={isDark ? "text-white/35" : "text-slate-400"}
                          />
                        </div>

                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className={[
                            "w-full rounded-2xl border py-4 pl-12 pr-4 text-lg font-semibold outline-none transition",
                            isDark
                              ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30"
                              : "border-orange-100 bg-white text-slate-800 placeholder:text-slate-400",
                          ].join(" ")}
                        />

                        {amount &&
                          numericBalance &&
                          parseFloat(amount) > numericBalance && (
                            <AlertCircle
                              size={20}
                              className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                                isDark ? "text-rose-300" : "text-rose-600"
                              }`}
                            />
                          )}
                      </div>

                      {amount &&
                        numericBalance &&
                        parseFloat(amount) > numericBalance && (
                          <p
                            className={[
                              "mt-3 flex items-center gap-2 text-sm",
                              isDark ? "text-rose-300" : "text-rose-600",
                            ].join(" ")}
                          >
                            <AlertCircle size={16} />
                            Insufficient balance
                          </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={!isFormValid || isWithdrawing}
                      className={[
                        "flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-4 text-lg font-semibold transition-all",
                        isFormValid && !isWithdrawing
                          ? isDark
                            ? "bg-blue-500/90 text-white hover:bg-blue-500"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                          : isDark
                          ? "cursor-not-allowed bg-white/[0.06] text-white/35"
                          : "cursor-not-allowed bg-slate-100 text-slate-400",
                      ].join(" ")}
                    >
                      {isWithdrawing ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Processing Request...
                        </>
                      ) : (
                        <>
                          Request Withdrawal
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {currentStep === 3 && showOtpInput && (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto max-w-md text-center"
                  >
                    <div
                      className={[
                        "rounded-[24px] border p-6",
                        isDark
                          ? "border-white/10 bg-white/[0.03]"
                          : "border-orange-100/70 bg-white/75",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl",
                          isDark
                            ? "bg-blue-500/10 text-blue-300"
                            : "bg-orange-100 text-orange-700",
                        ].join(" ")}
                      >
                        <Shield size={30} />
                      </div>

                      <h3 className="text-2xl font-bold">Verify Your Identity</h3>
                      <p
                        className={[
                          "mt-2 text-sm",
                          isDark ? "text-white/55" : "text-slate-600",
                        ].join(" ")}
                      >
                        Enter the OTP sent to your email
                      </p>

                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        placeholder="000000"
                        className={[
                          "mt-5 w-full rounded-2xl border px-4 py-4 text-center text-2xl font-mono tracking-[0.35em] outline-none",
                          isDark
                            ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/25"
                            : "border-orange-100 bg-white text-slate-800 placeholder:text-slate-400",
                        ].join(" ")}
                      />

                      <button
                        type="button"
                        onClick={verifyOtpHandler}
                        disabled={!otp || apiLoader}
                        className={[
                          "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold transition-all",
                          !otp || apiLoader
                            ? isDark
                              ? "cursor-not-allowed bg-white/[0.06] text-white/35"
                              : "cursor-not-allowed bg-slate-100 text-slate-400"
                            : isDark
                            ? "bg-emerald-500/90 text-white hover:bg-emerald-500"
                            : "bg-emerald-500 text-white hover:bg-emerald-600",
                        ].join(" ")}
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
                      className={[
                        "rounded-[24px] border p-6",
                        isDark
                          ? "border-emerald-400/15 bg-emerald-500/5"
                          : "border-emerald-200 bg-emerald-50/80",
                      ].join(" ")}
                    >
                      <div className="mb-4 flex justify-center">
                        <div
                          className={[
                            "flex h-20 w-20 items-center justify-center rounded-full",
                            isDark
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-emerald-100 text-emerald-700",
                          ].join(" ")}
                        >
                          <CheckCircle2 size={44} />
                        </div>
                      </div>

                      <h3
                        className={[
                          "text-3xl font-bold",
                          isDark ? "text-emerald-300" : "text-emerald-700",
                        ].join(" ")}
                      >
                        Withdrawal Successful!
                      </h3>

                      <p
                        className={[
                          "mt-2 text-sm",
                          isDark ? "text-white/55" : "text-slate-600",
                        ].join(" ")}
                      >
                        Your withdrawal request has been submitted successfully.
                      </p>

                      <div
                        className={[
                          "mt-5 rounded-2xl border p-4",
                          isDark
                            ? "border-emerald-400/15 bg-white/[0.03]"
                            : "border-emerald-200 bg-white/70",
                        ].join(" ")}
                      >
                        <p className="font-semibold">Amount: ${amount}</p>
                        {inrUiEnabled && (
                          <p
                            className={[
                              "mt-1 text-sm",
                              isDark ? "text-white/55" : "text-slate-600",
                            ].join(" ")}
                          >
                            (~ ₹ {inrAmount})
                          </p>
                        )}
                        <p
                          className={[
                            "mt-2 text-sm",
                            isDark ? "text-white/45" : "text-slate-500",
                          ].join(" ")}
                        >
                          Processing time: 1–3 business days
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <div
                    className={[
                      "mt-5 flex items-center gap-3 rounded-2xl border p-4 text-sm",
                      isDark
                        ? "border-rose-400/15 bg-rose-500/10 text-rose-300"
                        : "border-rose-200 bg-rose-50 text-rose-700",
                    ].join(" ")}
                  >
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {selectedGateway && (
              <div
                className={[
                  "rounded-[28px] border p-5 backdrop-blur-xl",
                  isDark
                    ? "border-white/10 bg-white/[0.035]"
                    : "border-orange-100/80 bg-white/65",
                ].join(" ")}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={[
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      isDark
                        ? "bg-blue-500/10 text-blue-300"
                        : "bg-orange-100 text-orange-700",
                    ].join(" ")}
                  >
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Destination Details</h3>
                    <p
                      className={[
                        "text-sm",
                        isDark ? "text-white/50" : "text-slate-500",
                      ].join(" ")}
                    >
                      Selected withdrawal target
                    </p>
                  </div>
                </div>

                {selectedGateway === "Wallet Transfer" && (
                  <div className="space-y-3">
                    <div
                      className={[
                        "flex items-center justify-between rounded-2xl border px-4 py-3",
                        isDark
                          ? "border-white/10 bg-white/[0.03]"
                          : "border-orange-100 bg-white/70",
                      ].join(" ")}
                    >
                      <span
                        className={isDark ? "text-white/55" : "text-slate-500"}
                      >
                        Wallet Type
                      </span>
                      <span className="font-medium">{selectWallet}</span>
                    </div>

                    <div
                      className={[
                        "rounded-2xl border px-4 py-3",
                        isDark
                          ? "border-white/10 bg-white/[0.03]"
                          : "border-orange-100 bg-white/70",
                      ].join(" ")}
                    >
                      <p
                        className={[
                          "mb-2 text-sm",
                          isDark ? "text-white/55" : "text-slate-500",
                        ].join(" ")}
                      >
                        Address
                      </p>
                      <p
                        className={[
                          "break-all rounded-xl px-3 py-2 text-xs font-medium",
                          isDark
                            ? "bg-white/[0.04] text-white/85"
                            : "bg-slate-50 text-slate-700",
                        ].join(" ")}
                      >
                        {getWalletAddress(selectWallet)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div
              className={[
                "rounded-[28px] border p-5 text-center backdrop-blur-xl",
                isDark
                  ? "border-emerald-400/15 bg-emerald-500/5"
                  : "border-emerald-200 bg-emerald-50/80",
              ].join(" ")}
            >
              <div
                className={[
                  "mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl",
                  isDark
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-emerald-100 text-emerald-700",
                ].join(" ")}
              >
                <Shield size={24} />
              </div>

              <h3
                className={[
                  "text-lg font-bold",
                  isDark ? "text-emerald-300" : "text-emerald-700",
                ].join(" ")}
              >
                Secure Transaction
              </h3>

              <p
                className={[
                  "mt-2 text-sm",
                  isDark ? "text-white/55" : "text-slate-600",
                ].join(" ")}
              >
                Your withdrawal flow is protected with account validation and OTP
                verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserWithdraw;