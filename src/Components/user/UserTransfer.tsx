import { useEffect, useState, useCallback, useMemo, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { userApi } from "../../utils/apiClients";
import ModernHeading from "../lib/ModernHeading";
import { FloatingParticles } from "../../utils/FloatingParticles";
import { AnimatedGrid } from "../../utils/AnimatedGrid";
import { FloatingOrbs } from "../../utils/FloatingOrbs";

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

/* ------------------------------ UI bits ---------------------------------- */
const CryptoIcon = ({ type }: { type?: string }) => {
  const icons: Record<string, string> = {
    BTC: "₿",
    ETH: "Ξ",
    USDT: "₮",
    Standard: "💎",
    Pro: "⚡",
    ECN: "🚀",
    Demo: "📊",
  };
  return <span className="text-2xl">{icons[String(type || "")] || "💰"}</span>;
};

const shortText = (v: any, max = 90) => {
  const s = typeof v === "string" ? v : v && typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
  return s.length > max ? s.slice(0, max) + "..." : s;
};

const getToastError = (e: any, fallback = "Something went wrong") => {
  const payload = e?.response?.data;
  const type = payload?.errorType; // "META" | "SERVER"
  const label = type === "META" ? "Meta Error" : "Server Error";

  const msg =
    payload?.error ||
    payload?.message ||
    e?.message ||
    fallback;

  return `${label}: ${shortText(msg, 110)}`;
};

const UserTransfer = () => {
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");

  const [fromAccountBalance, setFromAccountBalance] = useState<string | number>("");
  const [toAccountBalance, setToAccountBalance] = useState<string | number>("");

  const [balanceLoading, setBalanceLoading] = useState(false);
  const [isTransferLoading, setIsTransferLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);

  const loggedUser = useSelector((store: any) => store.user.loggedUser);

  // ✅ theme from redux
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
      radius: theme?.radius || "18px",
      pattern: theme?.pattern || "grid",
      effectsEnabled: theme?.effectsEnabled ?? true,
    }),
    [theme]
  );

  const pageBgStyle: React.CSSProperties = useMemo(
    () => ({
      minHeight: "100vh",
      background: `radial-gradient(1200px 600px at 18% 0%, ${rgba(C.glow, 0.16)}, transparent 60%),
                   radial-gradient(900px 480px at 82% 12%, ${rgba(C.gradientTo, 0.12)}, transparent 55%),
                   linear-gradient(135deg, ${rgb(C.bg)}, ${rgb(C.surface1)}, ${rgb(C.bg)})`,
      color: rgb(C.fg),
    }),
    [C]
  );

  const cardStyle: React.CSSProperties = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${rgba(C.surface1, 0.86)}, ${rgba(C.bg, 0.92)}, ${rgba(C.surface1, 0.86)})`,
      border: `1px solid ${rgba(C.border, 0.16)}`,
      borderRadius: "24px",
      boxShadow: `0 0 90px ${rgba(C.glow, 0.12)}, inset 0 0 60px ${rgba("0 0 0", 0.28)}`,
    }),
    [C]
  );

  const selectWrapStyle = (tone: "from" | "to"): React.CSSProperties => {
    const a = tone === "from" ? C.accent : C.primary;
    return {
      background: rgba(C.surface2, 0.14),
      border: `1px solid ${rgba(a, 0.28)}`,
      borderRadius: "18px",
    };
  };

  const pillBtnStyle: React.CSSProperties = {
    background: rgba(C.surface2, 0.16),
    border: `1px solid ${rgba(C.border, 0.16)}`,
    color: rgba(C.mutedFg, 0.75),
  };

  const ctaOuterGlow: React.CSSProperties = {
    background: `linear-gradient(135deg, ${rgba(C.gradientFrom, 0.55)}, ${rgba(C.gradientTo, 0.55)})`,
  };

  const ctaInner: React.CSSProperties = {
    background: `linear-gradient(135deg, ${rgba(C.surface2, 0.55)}, ${rgba(C.surface1, 0.85)}, ${rgba(C.surface2, 0.55)})`,
    borderRadius: "18px",
    color: rgba(C.fg, 0.95),
  };

  // Memoized account options from real user data
  const availableFromAccounts = useMemo(
    () => loggedUser?.accounts?.filter((acc: any) => acc.accountNumber !== toAccount) || [],
    [loggedUser, toAccount]
  );

  const availableToAccounts = useMemo(
    () => loggedUser?.accounts?.filter((acc: any) => acc.accountNumber !== fromAccount) || [],
    [loggedUser, fromAccount]
  );

  // Helper to safely get account metadata
  const getAccountMeta = useCallback(
    (accountNumber: string) =>
      loggedUser?.accounts?.find((a: any) => String(a.accountNumber) === String(accountNumber)) || {},
    [loggedUser]
  );

  // Balance fetch (Backend -> calls meta)
  const fetchAccountBalance = useCallback(
    async (accountNumber: string, setBalance: any) => {
      if (!accountNumber) return;

      try {
        setBalance("");
        setBalanceLoading(true);

        const res = await userApi.get(`/transfer/balance`, { params: { accountNumber } });
        setBalance(res?.data?.balance ?? "0.00");
      } catch (e: any) {
        toast.error(getToastError(e, "Failed to fetch balance"));
        setBalance("0.00");
      } finally {
        setBalanceLoading(false);
      }
    },
    []
  );

  const fromAccountInfo = useCallback(() => {
    fetchAccountBalance(fromAccount, setFromAccountBalance);
  }, [fromAccount, fetchAccountBalance]);

  const toAccountInfo = useCallback(() => {
    fetchAccountBalance(toAccount, setToAccountBalance);
  }, [toAccount, fetchAccountBalance]);

  // Validation
  const validateTransfer = useCallback(() => {
    if (!fromAccount || !toAccount) {
      toast.error("Both wallets must be selected!");
      return false;
    }
    if (fromAccount === toAccount) {
      toast.error("Source and destination wallets must be different!");
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount!");
      return false;
    }

    const fromBalanceNum = parseFloat(String(fromAccountBalance || "0"));
    const amountNum = parseFloat(amount);

    if (!Number.isNaN(fromBalanceNum) && amountNum > fromBalanceNum) {
      toast.error("Insufficient balance in source wallet!");
      return false;
    }

    return true;
  }, [fromAccount, toAccount, amount, fromAccountBalance]);

  const handleSubmit = useCallback(async () => {
    if (isTransferLoading || !validateTransfer()) return;

    const toastId = toast.loading("Processing your transfer. Please wait...");
    setIsTransferLoading(true);

    try {
      const res = await userApi.post(`/transfer`, {
        fromAccountNumber: fromAccount,
        toAccountNumber: toAccount,
        amount: Number(amount),
        note: "transfer",
      });

      setShowSuccess(true);
      window.setTimeout(() => setShowSuccess(false), 3000);

      toast.success(res?.data?.message || "Transfer completed successfully!", { id: toastId });
      setAmount("");

      const balances = res?.data?.balances;
      if (balances) {
        setFromAccountBalance(balances.from ?? "0.00");
        setToAccountBalance(balances.to ?? "0.00");
      } else {
        await Promise.all([fromAccountInfo(), toAccountInfo()]);
      }
    } catch (e: any) {
      toast.error(getToastError(e, "Transfer failed"), { id: toastId });
    } finally {
      setIsTransferLoading(false);
    }
  }, [
    isTransferLoading,
    validateTransfer,
    fromAccount,
    toAccount,
    amount,
    fromAccountInfo,
    toAccountInfo,
  ]);

  // Account selection handlers with transition
  const handleFromAccountChange = useCallback((value: string) => {
    startTransition(() => setFromAccount(value));
  }, []);

  const handleToAccountChange = useCallback((value: string) => {
    startTransition(() => setToAccount(value));
  }, []);

  useEffect(() => {
    fromAccountInfo();
  }, [fromAccountInfo]);

  useEffect(() => {
    toAccountInfo();
  }, [toAccountInfo]);

  return (
    <div className="relative overflow-hidden" style={pageBgStyle}>
      {C.effectsEnabled && (
        <>
          {C.pattern === "grid" ? <AnimatedGrid /> : null}
          {C.pattern === "dots" ? <FloatingParticles /> : null}
          <FloatingOrbs />
        </>
      )}

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, ${rgba(C.border, 0.10)} 1px, transparent 1px),
                            linear-gradient(to bottom, ${rgba(C.border, 0.10)} 1px, transparent 1px)`,
          backgroundSize: "14px 24px",
          opacity: 0.8,
          pointerEvents: "none",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <motion.div className="text-start mb-4">
            <ModernHeading text="Transfer Funds" />
          </motion.div>
          <p className="text-lg text-start" style={{ color: rgba(C.mutedFg, 0.65) }}>
            Lightning-fast transfers between your wallets
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative p-8"
          style={cardStyle}
        >
          {/* Success Overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
              >
                <div
                  className="backdrop-blur-xl rounded-3xl p-8"
                  style={{
                    background: rgba(C.success, 0.12),
                    border: `1px solid ${rgba(C.success, 0.30)}`,
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl mb-4"
                    style={{ color: rgba(C.success, 0.95) }}
                  >
                    ✓
                  </motion.div>
                  <p className="text-xl font-bold" style={{ color: rgba(C.success, 0.95) }}>
                    Transfer Successful!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Two Column Layout for Accounts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* From */}
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <label className="font-semibold text-sm uppercase tracking-wider mb-4 block" style={{ color: rgba(C.accent, 0.9) }}>
                From Wallet
              </label>

              <div className="relative group">
                <div
                  className="absolute inset-0 rounded-2xl blur transition duration-300"
                  style={{ background: `linear-gradient(90deg, ${rgba(C.accent, 0.6)}, ${rgba(C.gradientTo, 0.45)})`, opacity: 0.22 }}
                />
                <div className="relative p-3 backdrop-blur-sm transition-all duration-300" style={selectWrapStyle("from")}>
                  <select
                    value={fromAccount}
                    onChange={(e) => handleFromAccountChange(e.target.value)}
                    className="w-full bg-transparent font-medium text-lg focus:outline-none cursor-pointer"
                    style={{ color: rgba(C.fg, 0.95) }}
                    disabled={isPending}
                  >
                    <option value="" style={{ background: rgb(C.surface1), color: rgba(C.fg, 0.85) }}>
                      Select Source Wallet
                    </option>
                    {availableFromAccounts.map((account: any, index: number) => {
                      const currency = account.currency || account.accountCurrency || "USD";
                      return (
                        <option key={index} value={account.accountNumber} style={{ background: rgb(C.surface1), color: rgba(C.fg, 0.9) }}>
                          {account.accountNumber} • {currency}
                        </option>
                      );
                    })}
                  </select>

                  {fromAccount && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <CryptoIcon
                          type={
                            getAccountMeta(fromAccount).icon ||
                            getAccountMeta(fromAccount).accountType ||
                            getAccountMeta(fromAccount).type ||
                            "Standard"
                          }
                        />
                        <div>
                          <p className="text-xs" style={{ color: rgba(C.mutedFg, 0.65) }}>
                            Available Balance
                          </p>
                          {balanceLoading ? (
                            <motion.div
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="h-6 w-24 rounded"
                              style={{ background: rgba(C.border, 0.12) }}
                            />
                          ) : (
                            <p className="text-xl font-bold" style={{ color: rgba(C.fg, 0.95) }}>
                              ${String(fromAccountBalance || "0.00")}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* To */}
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <label className="font-semibold text-sm uppercase tracking-wider mb-4 block" style={{ color: rgba(C.primary, 0.9) }}>
                To Wallet
              </label>

              <div className="relative group">
                <div
                  className="absolute inset-0 rounded-2xl blur transition duration-300"
                  style={{ background: `linear-gradient(90deg, ${rgba(C.primary, 0.6)}, ${rgba(C.gradientFrom, 0.45)})`, opacity: 0.22 }}
                />
                <div className="relative p-3 backdrop-blur-sm transition-all duration-300" style={selectWrapStyle("to")}>
                  <select
                    value={toAccount}
                    onChange={(e) => handleToAccountChange(e.target.value)}
                    className="w-full bg-transparent font-medium text-lg focus:outline-none cursor-pointer"
                    style={{ color: rgba(C.fg, 0.95) }}
                    disabled={isPending}
                  >
                    <option value="" style={{ background: rgb(C.surface1), color: rgba(C.fg, 0.85) }}>
                      Select Destination Wallet
                    </option>
                    {availableToAccounts.map((account: any, index: number) => (
                      <option key={index} value={account.accountNumber} style={{ background: rgb(C.surface1), color: rgba(C.fg, 0.9) }}>
                        {account.accountNumber}
                      </option>
                    ))}
                  </select>

                  {toAccount && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <CryptoIcon
                          type={
                            getAccountMeta(toAccount).icon ||
                            getAccountMeta(toAccount).accountType ||
                            getAccountMeta(toAccount).type ||
                            "Standard"
                          }
                        />
                        <div>
                          <p className="text-xs" style={{ color: rgba(C.mutedFg, 0.65) }}>
                            Current Balance
                          </p>
                          {balanceLoading ? (
                            <motion.div
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="h-6 w-24 rounded"
                              style={{ background: rgba(C.border, 0.12) }}
                            />
                          ) : (
                            <p className="text-xl font-bold" style={{ color: rgba(C.fg, 0.95) }}>
                              ${String(toAccountBalance || "0.00")}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Transfer Arrow */}
          <motion.div className="flex justify-center my-5" animate={{ x: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <div className="flex items-center gap-2">
              <div className="h-px w-20" style={{ background: `linear-gradient(90deg, transparent, ${rgba(C.accent, 0.75)}, transparent)` }} />
              <motion.div className="text-3xl" style={{ color: rgba(C.accent, 0.9) }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                ⟶
              </motion.div>
              <div className="h-px w-20" style={{ background: `linear-gradient(90deg, transparent, ${rgba(C.primary, 0.75)}, transparent)` }} />
            </div>
          </motion.div>

          {/* Amount Input */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mb-8">
            <label className="font-semibold text-sm uppercase tracking-wider mb-4 block text-center" style={{ color: rgba(C.mutedFg, 0.65) }}>
              Transfer Amount
            </label>

            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                <div
                  className="absolute inset-0 rounded-2xl blur transition duration-300"
                  style={{
                    background: `linear-gradient(90deg, ${rgba(C.accent, 0.55)}, ${rgba(C.primary, 0.55)}, ${rgba(C.gradientTo, 0.55)})`,
                    opacity: 0.18,
                  }}
                />
                <div className="relative p-3 rounded-2xl" style={{ background: rgba(C.surface2, 0.14), border: `1px solid ${rgba(C.border, 0.16)}` }}>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl" style={{ color: rgba(C.mutedFg, 0.45) }}>
                      $
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 bg-transparent text-4xl font-bold focus:outline-none"
                      style={{ color: rgba(C.fg, 0.95) }}
                      required
                    />
                    <span className="text-lg" style={{ color: rgba(C.mutedFg, 0.6) }}>
                      USD
                    </span>
                  </div>

                  <div className="flex gap-3 mt-6 justify-center flex-wrap">
                    {[100, 500, 1000, 5000, 10000].map((quickAmount) => (
                      <motion.button
                        key={quickAmount}
                        type="button"
                        onClick={() => setAmount(quickAmount.toString())}
                        className="rounded-full px-4 py-2 text-sm font-semibold transition-all"
                        style={pillBtnStyle}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = rgba(C.accent, 0.30);
                          (e.currentTarget as HTMLButtonElement).style.color = rgba(C.fg, 0.92);
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = rgba(C.border, 0.16);
                          (e.currentTarget as HTMLButtonElement).style.color = rgba(C.mutedFg, 0.75);
                        }}
                      >
                        ${quickAmount.toLocaleString()}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Transfer Button */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="flex justify-center">
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={isTransferLoading}
              className="relative group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ cursor: isTransferLoading ? "not-allowed" : "pointer" }}
            >
              <div className="absolute inset-0 rounded-2xl blur-lg transition duration-300" style={{ ...ctaOuterGlow, opacity: 0.75 }} />
              <div className="relative px-12 py-5 rounded-2xl font-bold text-lg shadow-2xl" style={{ ...ctaInner, opacity: isTransferLoading ? 0.75 : 1 }}>
                {isTransferLoading ? (
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-5 h-5 border-2 border-t-transparent rounded-full"
                      style={{ borderColor: rgba(C.fg, 0.85) }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Processing Transfer...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Transfer Now</span>
                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      →
                    </motion.span>
                  </span>
                )}
              </div>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserTransfer;
