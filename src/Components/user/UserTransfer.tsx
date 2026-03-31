import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowRightLeft,
  Wallet,
  ArrowRight,
  RefreshCw,
  Landmark,
  BadgeDollarSign,
  ShieldCheck,
  CheckCircle2,
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
    };
  };
  userTheme?: {
    mode?: "light" | "dark";
  };
};

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

const formatBalance = (value: string | number) => {
  const num = Number(value || 0);
  if (Number.isNaN(num)) return "0.00";
  return num.toFixed(2);
};

const getAccountLabel = (account: AccountType) => {
  return (
    account?.accountType ||
    account?.type ||
    "Standard"
  );
};

const UserTransfer = () => {
  const mode = useSelector((store: RootState) => store.userTheme?.mode || "light");
  const loggedUser = useSelector((store: RootState) => store.user?.loggedUser);

  const isDark = mode === "dark";

  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");

  const [fromAccountBalance, setFromAccountBalance] = useState<string | number>("");
  const [toAccountBalance, setToAccountBalance] = useState<string | number>("");

  const [loadingFromBalance, setLoadingFromBalance] = useState(false);
  const [loadingToBalance, setLoadingToBalance] = useState(false);
  const [isTransferLoading, setIsTransferLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const accounts = useMemo(() => loggedUser?.accounts || [], [loggedUser]);

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

  const fromMeta = getAccountMeta(fromAccount);
  const toMeta = getAccountMeta(toAccount);
  const amountNum = Number(amount || 0);
  const sourceBalanceNum = Number(fromAccountBalance || 0);
  const projectedBalance = sourceBalanceNum - amountNum;

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1480px]">
        <div
          className={[
            "overflow-hidden rounded-[28px] border backdrop-blur-xl transition-all duration-300",
            isDark
              ? "border-white/10 bg-white/[0.04] shadow-[0_25px_70px_rgba(0,0,0,0.45)]"
              : "border-orange-100/80 bg-white/70 shadow-[0_18px_55px_rgba(251,146,60,0.10)]",
          ].join(" ")}
        >
          <div
            className={[
              "relative overflow-hidden border-b px-4 py-5 sm:px-6 sm:py-6",
              isDark
                ? "border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]"
                : "border-orange-100/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,247,240,0.80))]",
            ].join(" ")}
          >
            <div
              className={[
                "absolute inset-x-0 top-0 h-px",
                isDark
                  ? "bg-gradient-to-r from-transparent via-blue-300/30 to-transparent"
                  : "bg-gradient-to-r from-transparent via-orange-300/70 to-transparent",
              ].join(" ")}
            />

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div
                  className={[
                    "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                    isDark
                      ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                      : "border-orange-200 bg-orange-50 text-orange-700",
                  ].join(" ")}
                >
                  <ArrowRightLeft size={14} />
                  Internal Wallet Transfer
                </div>

                <h1 className="text-2xl font-bold sm:text-3xl">
                  Transfer Between Accounts
                </h1>

                <p
                  className={[
                    "mt-2 max-w-2xl text-sm sm:text-[15px]",
                    isDark ? "text-white/55" : "text-slate-600",
                  ].join(" ")}
                >
                  Move funds securely between your linked trading wallets with
                  real-time balance visibility and quick amount actions.
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
                          ? "bg-blue-500/10 text-blue-300"
                          : "bg-orange-50 text-orange-700",
                      ].join(" ")}
                    >
                      <Wallet size={18} />
                    </div>
                    <div>
                      <p
                        className={[
                          "text-[11px] uppercase tracking-[0.16em]",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        Accounts
                      </p>
                      <p className="text-sm font-semibold">{accounts.length} Linked</p>
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
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-emerald-50 text-emerald-700",
                      ].join(" ")}
                    >
                      <ShieldCheck size={18} />
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
                      <p className="text-sm font-semibold">Protected</p>
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
                      <BadgeDollarSign size={18} />
                    </div>
                    <div>
                      <p
                        className={[
                          "text-[11px] uppercase tracking-[0.16em]",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        Transfer
                      </p>
                      <p className="text-sm font-semibold">Instant Flow</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 md:p-5">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_0.75fr]">
              <div
                className={[
                  "rounded-[24px] border p-4 sm:p-5",
                  isDark
                    ? "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]"
                    : "border-orange-100/80 bg-white/70",
                ].join(" ")}
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold sm:text-xl">
                      Transfer Details
                    </h2>
                    <p
                      className={[
                        "mt-1 text-sm",
                        isDark ? "text-white/50" : "text-slate-500",
                      ].join(" ")}
                    >
                      Select your source and destination wallets, then enter the
                      amount to transfer.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={refreshBalances}
                    className={[
                      "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.07]"
                        : "border-orange-100 bg-orange-50 text-slate-700 hover:bg-orange-100/70",
                    ].join(" ")}
                  >
                    <RefreshCw size={15} />
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                  <div
                    className={[
                      "rounded-[22px] border p-4",
                      isDark
                        ? "border-white/10 bg-white/[0.03]"
                        : "border-orange-100/80 bg-orange-50/40",
                    ].join(" ")}
                  >
                    <label
                      className={[
                        "mb-2 block text-xs font-semibold uppercase tracking-[0.18em]",
                        isDark ? "text-blue-200" : "text-orange-700",
                      ].join(" ")}
                    >
                      From Account
                    </label>

                    <div className="relative">
                      <select
                        value={fromAccount}
                        onChange={(e) => setFromAccount(e.target.value)}
                        className={[
                          "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all",
                          isDark
                            ? "border-white/10 bg-white/[0.05] text-white"
                            : "border-orange-100 bg-white text-slate-800",
                        ].join(" ")}
                      >
                        <option value="">Select source wallet</option>
                        {fromAccountOptions.map((account) => {
                          const currency =
                            account.currency || account.accountCurrency || "USD";

                          return (
                            <option
                              key={account.accountNumber}
                              value={account.accountNumber}
                            >
                              {account.accountNumber} • {currency}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {fromAccount && (
                      <div
                        className={[
                          "mt-4 rounded-2xl border p-4",
                          isDark
                            ? "border-white/10 bg-blue-500/5"
                            : "border-orange-100 bg-white/80",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={[
                                "flex h-11 w-11 items-center justify-center rounded-xl",
                                isDark
                                  ? "bg-blue-500/10 text-blue-300"
                                  : "bg-orange-50 text-orange-700",
                              ].join(" ")}
                            >
                              <Wallet size={18} />
                            </div>

                            <div>
                              <p
                                className={[
                                  "text-xs uppercase tracking-[0.16em]",
                                  isDark ? "text-white/40" : "text-slate-500",
                                ].join(" ")}
                              >
                                Wallet Type
                              </p>
                              <p className="text-sm font-semibold">
                                {getAccountLabel(fromMeta as AccountType)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p
                              className={[
                                "text-xs uppercase tracking-[0.16em]",
                                isDark ? "text-white/40" : "text-slate-500",
                              ].join(" ")}
                            >
                              Balance
                            </p>
                            <p className="text-lg font-bold">
                              {loadingFromBalance
                                ? "Loading..."
                                : `$${formatBalance(fromAccountBalance)}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <motion.button
                      type="button"
                      onClick={handleSwapAccounts}
                      whileTap={{ scale: 0.96 }}
                      className={[
                        "flex h-12 w-12 items-center justify-center rounded-2xl border transition-all",
                        isDark
                          ? "border-white/10 bg-white/[0.05] text-blue-300 hover:bg-white/[0.08]"
                          : "border-orange-100 bg-white text-orange-700 hover:bg-orange-50",
                      ].join(" ")}
                    >
                      <ArrowRightLeft size={18} />
                    </motion.button>
                  </div>

                  <div
                    className={[
                      "rounded-[22px] border p-4",
                      isDark
                        ? "border-white/10 bg-white/[0.03]"
                        : "border-orange-100/80 bg-orange-50/40",
                    ].join(" ")}
                  >
                    <label
                      className={[
                        "mb-2 block text-xs font-semibold uppercase tracking-[0.18em]",
                        isDark ? "text-cyan-200" : "text-amber-700",
                      ].join(" ")}
                    >
                      To Account
                    </label>

                    <div className="relative">
                      <select
                        value={toAccount}
                        onChange={(e) => setToAccount(e.target.value)}
                        className={[
                          "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all",
                          isDark
                            ? "border-white/10 bg-white/[0.05] text-white"
                            : "border-orange-100 bg-white text-slate-800",
                        ].join(" ")}
                      >
                        <option value="">Select destination wallet</option>
                        {toAccountOptions.map((account) => {
                          const currency =
                            account.currency || account.accountCurrency || "USD";

                          return (
                            <option
                              key={account.accountNumber}
                              value={account.accountNumber}
                            >
                              {account.accountNumber} • {currency}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {toAccount && (
                      <div
                        className={[
                          "mt-4 rounded-2xl border p-4",
                          isDark
                            ? "border-white/10 bg-cyan-500/5"
                            : "border-orange-100 bg-white/80",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={[
                                "flex h-11 w-11 items-center justify-center rounded-xl",
                                isDark
                                  ? "bg-cyan-500/10 text-cyan-300"
                                  : "bg-amber-50 text-amber-700",
                              ].join(" ")}
                            >
                              <Landmark size={18} />
                            </div>

                            <div>
                              <p
                                className={[
                                  "text-xs uppercase tracking-[0.16em]",
                                  isDark ? "text-white/40" : "text-slate-500",
                                ].join(" ")}
                              >
                                Wallet Type
                              </p>
                              <p className="text-sm font-semibold">
                                {getAccountLabel(toMeta as AccountType)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p
                              className={[
                                "text-xs uppercase tracking-[0.16em]",
                                isDark ? "text-white/40" : "text-slate-500",
                              ].join(" ")}
                            >
                              Balance
                            </p>
                            <p className="text-lg font-bold">
                              {loadingToBalance
                                ? "Loading..."
                                : `$${formatBalance(toAccountBalance)}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={[
                    "mt-5 rounded-[24px] border p-4 sm:p-5",
                    isDark
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-orange-100/80 bg-white/75",
                  ].join(" ")}
                >
                  <label
                    className={[
                      "mb-3 block text-xs font-semibold uppercase tracking-[0.18em]",
                      isDark ? "text-white/60" : "text-slate-600",
                    ].join(" ")}
                  >
                    Transfer Amount
                  </label>

                  <div
                    className={[
                      "flex items-center gap-3 rounded-[20px] border px-4 py-4 sm:px-5",
                      isDark
                        ? "border-white/10 bg-white/[0.05]"
                        : "border-orange-100 bg-orange-50/50",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "text-2xl font-semibold",
                        isDark ? "text-white/40" : "text-slate-400",
                      ].join(" ")}
                    >
                      $
                    </span>

                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className={[
                        "w-full bg-transparent text-2xl font-bold outline-none sm:text-3xl",
                        isDark ? "text-white placeholder:text-white/20" : "text-slate-900 placeholder:text-slate-300",
                      ].join(" ")}
                    />

                    <span
                      className={[
                        "text-sm font-medium",
                        isDark ? "text-white/45" : "text-slate-500",
                      ].join(" ")}
                    >
                      USD
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {[100, 500, 1000, 5000, 10000].map((quickAmount) => (
                      <button
                        key={quickAmount}
                        type="button"
                        onClick={() => setAmount(String(quickAmount))}
                        className={[
                          "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                          isDark
                            ? "border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.08]"
                            : "border-orange-100 bg-white text-slate-700 hover:bg-orange-50",
                        ].join(" ")}
                      >
                        ${quickAmount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p
                    className={[
                      "text-sm",
                      isDark ? "text-white/45" : "text-slate-500",
                    ].join(" ")}
                  >
                    Transfers are processed securely using your linked wallet
                    configuration.
                  </p>

                  <motion.button
                    type="button"
                    onClick={handleSubmit}
                    whileTap={{ scale: 0.98 }}
                    disabled={isTransferLoading}
                    className={[
                      "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition-all sm:min-w-[190px]",
                      isDark
                        ? "bg-blue-500 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-500/60"
                        : "bg-orange-500 text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-400",
                    ].join(" ")}
                  >
                    {isTransferLoading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Transfer Now
                        <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              <div className="space-y-5">
                <div
                  className={[
                    "rounded-[24px] border p-4 sm:p-5",
                    isDark
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-orange-100/80 bg-white/70",
                  ].join(" ")}
                >
                  <h3 className="text-lg font-semibold">Transfer Summary</h3>
                  <p
                    className={[
                      "mt-1 text-sm",
                      isDark ? "text-white/50" : "text-slate-500",
                    ].join(" ")}
                  >
                    Review the transfer before submitting.
                  </p>

                  <div className="mt-4 space-y-3">
                    <div
                      className={[
                        "rounded-2xl border p-4",
                        isDark
                          ? "border-white/10 bg-white/[0.03]"
                          : "border-orange-100 bg-orange-50/40",
                      ].join(" ")}
                    >
                      <p
                        className={[
                          "text-xs uppercase tracking-[0.16em]",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        From
                      </p>
                      <p className="mt-1 font-semibold">
                        {fromAccount || "Not selected"}
                      </p>
                    </div>

                    <div
                      className={[
                        "rounded-2xl border p-4",
                        isDark
                          ? "border-white/10 bg-white/[0.03]"
                          : "border-orange-100 bg-orange-50/40",
                      ].join(" ")}
                    >
                      <p
                        className={[
                          "text-xs uppercase tracking-[0.16em]",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        To
                      </p>
                      <p className="mt-1 font-semibold">
                        {toAccount || "Not selected"}
                      </p>
                    </div>

                    <div
                      className={[
                        "rounded-2xl border p-4",
                        isDark
                          ? "border-white/10 bg-white/[0.03]"
                          : "border-orange-100 bg-orange-50/40",
                      ].join(" ")}
                    >
                      <p
                        className={[
                          "text-xs uppercase tracking-[0.16em]",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        Amount
                      </p>
                      <p className="mt-1 text-xl font-bold">
                        ${formatBalance(amount || 0)}
                      </p>
                    </div>

                    <div
                      className={[
                        "rounded-2xl border p-4",
                        isDark
                          ? "border-white/10 bg-white/[0.03]"
                          : "border-orange-100 bg-orange-50/40",
                      ].join(" ")}
                    >
                      <p
                        className={[
                          "text-xs uppercase tracking-[0.16em]",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        Projected Source Balance
                      </p>
                      <p className="mt-1 font-semibold">
                        {fromAccount && amount
                          ? `$${formatBalance(projectedBalance > 0 ? projectedBalance : 0)}`
                          : "--"}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={[
                    "rounded-[24px] border p-4 sm:p-5",
                    isDark
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-orange-100/80 bg-white/70",
                  ].join(" ")}
                >
                  <h3 className="text-lg font-semibold">Quick Notes</h3>

                  <div className="mt-4 space-y-3">
                    {[
                      "Source and destination wallets must be different.",
                      "Balance is fetched from the selected account before transfer.",
                      "After successful transfer, balances refresh automatically.",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div
                          className={[
                            "mt-0.5 flex h-6 w-6 items-center justify-center rounded-full",
                            isDark
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-emerald-50 text-emerald-700",
                          ].join(" ")}
                        >
                          <CheckCircle2 size={14} />
                        </div>
                        <p
                          className={[
                            "text-sm leading-6",
                            isDark ? "text-white/65" : "text-slate-600",
                          ].join(" ")}
                        >
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm"
              >
                <div
                  className={[
                    "w-full max-w-md rounded-[28px] border p-6 text-center shadow-2xl",
                    isDark
                      ? "border-white/10 bg-[#0b1220] text-white"
                      : "border-orange-100 bg-white text-slate-900",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
                      isDark
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-emerald-50 text-emerald-700",
                    ].join(" ")}
                  >
                    <CheckCircle2 size={30} />
                  </div>

                  <h3 className="text-xl font-bold">Transfer Successful</h3>
                  <p
                    className={[
                      "mt-2 text-sm",
                      isDark ? "text-white/55" : "text-slate-600",
                    ].join(" ")}
                  >
                    Your funds were moved successfully between the selected
                    accounts.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UserTransfer;