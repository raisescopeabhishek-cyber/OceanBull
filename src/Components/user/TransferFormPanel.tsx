import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ArrowRightLeft,
  ArrowRight,
  RefreshCcw,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

type AccountType = {
  accountNumber: string;
  accountType?: string;
  type?: string;
  currency?: string;
  accountCurrency?: string;
};

type Props = {
  colors: any;
  fromAccount: string;
  setFromAccount: React.Dispatch<React.SetStateAction<string>>;
  toAccount: string;
  setToAccount: React.Dispatch<React.SetStateAction<string>>;
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  fromAccountBalance: string | number;
  toAccountBalance: string | number;
  loadingFromBalance: boolean;
  loadingToBalance: boolean;
  fromAccountOptions: AccountType[];
  toAccountOptions: AccountType[];
  refreshBalances: () => void;
  handleSubmit: () => void;
  isTransferLoading: boolean;
};

const formatBalance = (value: string | number) => {
  const num = Number(value || 0);
  if (Number.isNaN(num)) return "0.00";
  return num.toFixed(2);
};

const getAccountLabel = (account: AccountType) =>
  account?.accountType || account?.type || "Standard";

function CheckoutStep({
  step,
  title,
  isOpen,
  isCompleted,
  summary,
  onChange,
  children,
  colors,
}: any) {
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
          background: isOpen ? colors.accentSoft : colors.surface,
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
              {isCompleted ? <CheckCircle2 className="h-4 w-4" style={{ color: colors.success }} /> : null}
            </div>

            {!isOpen && summary ? (
              <div className="mt-2 text-[14px]" style={{ color: colors.softText }}>
                {summary}
              </div>
            ) : null}
          </div>
        </div>

        {!isOpen ? (
          <button
            type="button"
            onClick={onChange}
            className="shrink-0 border px-5 py-2.5 text-sm font-semibold"
            style={{
              borderColor: colors.border,
              color: colors.accent,
              background: colors.surface,
              borderRadius: "12px",
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

export default function TransferFormPanel({
  colors,
  fromAccount,
  setFromAccount,
  toAccount,
  setToAccount,
  amount,
  setAmount,
  fromAccountBalance,
  toAccountBalance,
  loadingFromBalance,
  loadingToBalance,
  fromAccountOptions,
  toAccountOptions,
  refreshBalances,
  handleSubmit,
  isTransferLoading,
}: Props) {
  const [openStep, setOpenStep] = useState<1 | 2>(1);
  const [step1Completed, setStep1Completed] = useState(false);
  const [step2Completed, setStep2Completed] = useState(false);

  const titleColor = colors.text;
  const mutedTextColor = colors.muted;

  const projectedSourceBalance = Number(fromAccountBalance || 0) - Number(amount || 0);

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
    background: colors.isDark ? "#111827" : "#ffffff",
    color: colors.isDark ? "#ffffff" : "#0f172a",
  };

  const subtleCard = (): React.CSSProperties => ({
    background: colors.surfaceSoft,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
  });

  const canContinueStep1 = !!fromAccount && !!toAccount && fromAccount !== toAccount;
  const canContinueStep2 = !!amount && Number(amount) > 0 && Number(amount) <= Number(fromAccountBalance || 0);
  const ctaEnabled = canContinueStep1 && canContinueStep2 && !isTransferLoading;

  const quickAmounts = useMemo(() => [100, 500, 1000, 5000, 10000], []);

  return (
    <div className="space-y-4">
      <CheckoutStep
        step={1}
        title="Select Accounts"
        isOpen={openStep === 1}
        isCompleted={step1Completed}
        colors={colors}
        onChange={() => setOpenStep(1)}
        summary={
          <>
            <span className="font-semibold" style={{ color: colors.text }}>
              {fromAccount || "No source"}
            </span>
            {toAccount ? (
              <span className="ml-2" style={{ color: colors.softText }}>
                → {toAccount}
              </span>
            ) : null}
          </>
        }
      >
        <div className="p-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_auto_1fr] md:items-start">
            <div>
              <label className="mb-2 block text-sm font-semibold" style={{ color: titleColor }}>
                From Account
              </label>

              <div className="relative">
                <select value={fromAccount} onChange={(e) => setFromAccount(e.target.value)} style={selectStyle}>
                  <option value="" style={optionStyle}>
                    Select source wallet
                  </option>
                  {fromAccountOptions.map((account) => {
                    const currency = account.currency || account.accountCurrency || "USD";
                    return (
                      <option key={account.accountNumber} value={account.accountNumber} style={optionStyle}>
                        {account.accountNumber} • {currency}
                      </option>
                    );
                  })}
                </select>

                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: mutedTextColor }}
                />
              </div>

              {fromAccount ? (
                <div className="mt-3 border p-4" style={{ ...subtleCard() }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs" style={{ color: colors.muted }}>
                        Wallet Type
                      </div>
                      <div className="mt-1 text-sm font-semibold" style={{ color: titleColor }}>
                        {getAccountLabel(
                          fromAccountOptions.find((a) => a.accountNumber === fromAccount) || {
                            accountNumber: fromAccount,
                          }
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs" style={{ color: colors.muted }}>
                        Balance
                      </div>
                      <div className="mt-1 text-sm font-bold" style={{ color: titleColor }}>
                        {loadingFromBalance ? "Loading..." : `$${formatBalance(fromAccountBalance)}`}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex items-end justify-center md:pb-3">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border transition-all"
                style={{
                  borderColor: colors.border,
                  background: colors.surface,
                  color: colors.accent,
                }}
                onClick={() => {
                  if (!fromAccount && !toAccount) return;
                  const oldFrom = fromAccount;
                  const oldTo = toAccount;
                  setFromAccount(oldTo);
                  setToAccount(oldFrom);
                }}
              >
                <ArrowRightLeft size={18} />
              </motion.button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold" style={{ color: titleColor }}>
                To Account
              </label>

              <div className="relative">
                <select value={toAccount} onChange={(e) => setToAccount(e.target.value)} style={selectStyle}>
                  <option value="" style={optionStyle}>
                    Select destination wallet
                  </option>
                  {toAccountOptions.map((account) => {
                    const currency = account.currency || account.accountCurrency || "USD";
                    return (
                      <option key={account.accountNumber} value={account.accountNumber} style={optionStyle}>
                        {account.accountNumber} • {currency}
                      </option>
                    );
                  })}
                </select>

                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: mutedTextColor }}
                />
              </div>

              {toAccount ? (
                <div className="mt-3 border p-4" style={{ ...subtleCard() }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs" style={{ color: colors.muted }}>
                        Wallet Type
                      </div>
                      <div className="mt-1 text-sm font-semibold" style={{ color: titleColor }}>
                        {getAccountLabel(
                          toAccountOptions.find((a) => a.accountNumber === toAccount) || {
                            accountNumber: toAccount,
                          }
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs" style={{ color: colors.muted }}>
                        Balance
                      </div>
                      <div className="mt-1 text-sm font-bold" style={{ color: titleColor }}>
                        {loadingToBalance ? "Loading..." : `$${formatBalance(toAccountBalance)}`}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!canContinueStep1) return;
                setStep1Completed(true);
                setOpenStep(2);
              }}
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
        title="Transfer Amount"
        isOpen={openStep === 2}
        isCompleted={step2Completed}
        colors={colors}
        onChange={() => setOpenStep(2)}
        summary={
          <>
            <span className="font-semibold" style={{ color: colors.text }}>
              ${formatBalance(amount || 0)}
            </span>
            <span className="ml-2" style={{ color: colors.softText }}>
              • projected source ${formatBalance(projectedSourceBalance > 0 ? projectedSourceBalance : 0)}
            </span>
          </>
        }
      >
        <div className="p-5">
          <div>
            <label className="mb-2 block text-sm font-semibold" style={{ color: titleColor }}>
              Transfer Amount (USD)
            </label>

            <div className="relative">
              <DollarSign
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: mutedTextColor }}
              />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full py-[13px] pl-10 pr-4 text-sm font-semibold"
                style={inputStyle}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(String(quickAmount))}
                  className="rounded-full border px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    borderColor: colors.border,
                    background: colors.surface,
                    color: titleColor,
                  }}
                >
                  ${quickAmount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div
              className="border p-4"
              style={{
                borderColor: colors.border,
                background: colors.surfaceSoft,
                borderRadius: "16px",
              }}
            >
              <div className="text-xs" style={{ color: colors.muted }}>
                Source Balance
              </div>
              <div className="mt-1 font-semibold" style={{ color: titleColor }}>
                ${formatBalance(fromAccountBalance || 0)}
              </div>
            </div>

            <div
              className="border p-4"
              style={{
                borderColor: colors.border,
                background: colors.surfaceSoft,
                borderRadius: "16px",
              }}
            >
              <div className="text-xs" style={{ color: colors.muted }}>
                Destination Balance
              </div>
              <div className="mt-1 font-semibold" style={{ color: titleColor }}>
                ${formatBalance(toAccountBalance || 0)}
              </div>
            </div>

            <div
              className="border p-4"
              style={{
                borderColor: colors.border,
                background: colors.surfaceSoft,
                borderRadius: "16px",
              }}
            >
              <div className="text-xs" style={{ color: colors.muted }}>
                Projected Source
              </div>
              <div className="mt-1 font-semibold" style={{ color: titleColor }}>
                ${formatBalance(projectedSourceBalance > 0 ? projectedSourceBalance : 0)}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={refreshBalances}
              className="inline-flex items-center justify-center gap-2 border px-5 py-3 text-sm font-semibold transition-all duration-300"
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
              onClick={() => {
                if (!canContinueStep2) return;
                setStep2Completed(true);
              }}
              className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold uppercase"
              style={{
                background: colors.primaryBtn,
                color: "#fff",
                borderRadius: "14px",
                opacity: canContinueStep2 ? 1 : 0.7,
              }}
            >
              Review Transfer
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 flex justify-end">
            <motion.button
              type="button"
              whileHover={{ scale: ctaEnabled ? 1.01 : 1 }}
              whileTap={{ scale: ctaEnabled ? 0.99 : 1 }}
              onClick={handleSubmit}
              disabled={!ctaEnabled}
              className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold"
              style={{
                borderRadius: "14px",
                color: colors.primaryBtnText,
                background: colors.primaryBtn,
                boxShadow: "0 12px 24px rgba(249,115,22,0.22)",
                opacity: ctaEnabled ? 1 : 0.65,
                cursor: ctaEnabled ? "pointer" : "not-allowed",
              }}
            >
              {isTransferLoading ? <span>Loading...</span> : <CheckCircle2 className="h-4 w-4" />}
              <span>SUBMIT TRANSFER</span>
            </motion.button>
          </div>
        </div>
      </CheckoutStep>
    </div>
  );
}