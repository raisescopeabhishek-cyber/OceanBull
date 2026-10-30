import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  BadgeDollarSign,
  Landmark,
  WalletCards,
  Shield,
  Wallet,
} from "lucide-react";

import {
  buttonPrimary,
  EmptyState,
  inputBase,
  panelCard,
  softCard,
  cx,
  muted,
  titleText,
} from "./components/ReferralPrimitives";
import { formatMoney } from "./hooks/useReferralPanel";

const ReferralWithdrawTab = () => {
  const {
    isDark,
    hasReferralAccount,
    loggedUser,
    ibBalance,
    withdrawSubmitting,
    submitWithdrawal,
    generateReferralAccount,
    generatingAccount,
  } = useOutletContext();

  const [selectedGateway, setSelectedGateway] = useState("Bank Transfer");
  const [selectedWallet, setSelectedWallet] = useState("usdtTrc20");
  const [amount, setAmount] = useState("");

  if (!hasReferralAccount) {
    return (
      <EmptyState
        isDark={isDark}
        title="Withdraw page is not active yet"
        text="Generate your referral account first. After that, you’ll be able to request commission withdrawal from this page."
        actionLabel="Generate Referral Account"
        onAction={generateReferralAccount}
        loading={generatingAccount}
      />
    );
  }

  const accountDetails = useMemo(() => {
    if (selectedGateway === "Bank Transfer") {
      return [
        { label: "Bank Name", value: loggedUser?.bankDetails?.bankName },
        { label: "Holder Name", value: loggedUser?.bankDetails?.holderName },
        { label: "Account Number", value: loggedUser?.bankDetails?.accountNumber },
        { label: "IFSC Code", value: loggedUser?.bankDetails?.ifscCode },
        { label: "Swift Code", value: loggedUser?.bankDetails?.swiftCode },
        { label: "UPI ID", value: loggedUser?.bankDetails?.upiId },
      ];
    }

    if (selectedWallet === "usdtTrc20") {
      return [{ label: "USDT TRC20", value: loggedUser?.walletDetails?.tetherAddress }];
    }

    if (selectedWallet === "usdtBep20") {
      return [{ label: "USDT BEP20", value: loggedUser?.walletDetails?.ethAddress }];
    }

    if (selectedWallet === "binanceId") {
      return [{ label: "Binance ID", value: loggedUser?.walletDetails?.accountNumber }];
    }

    return [{ label: "BTC Address", value: loggedUser?.walletDetails?.trxAddress }];
  }, [loggedUser, selectedGateway, selectedWallet]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ok = await submitWithdrawal({
      selectedGateway,
      selectedWallet,
      amount,
    });

    if (ok) setAmount("");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className={panelCard(isDark, "p-6")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className={cx("text-2xl font-bold", titleText(isDark))}>
                Withdraw IB earnings
              </h2>
              <p className={cx("mt-2 text-sm", muted(isDark))}>
                Submit commission payout using bank transfer or wallet details.
              </p>
            </div>

            <div className={softCard(isDark, "px-4 py-3 text-right")}>
              <p className={cx("text-xs uppercase tracking-[0.18em]", muted(isDark))}>
                Available Balance
              </p>
              <h3 className={cx("mt-2 text-2xl font-bold", titleText(isDark))}>
                {formatMoney(ibBalance, 4)}
              </h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={cx("mb-2 block text-sm font-medium", titleText(isDark))}>
                  Withdrawal Method
                </label>
                <select
                  value={selectedGateway}
                  onChange={(e) => setSelectedGateway(e.target.value)}
                  className={inputBase(isDark)}
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Wallet Transfer">Wallet Transfer</option>
                </select>
              </div>

              {selectedGateway === "Wallet Transfer" ? (
                <div>
                  <label className={cx("mb-2 block text-sm font-medium", titleText(isDark))}>
                    Select Wallet
                  </label>
                  <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className={inputBase(isDark)}
                  >
                    <option value="usdtTrc20">USDT (TRC20)</option>
                    <option value="usdtBep20">USDT (BEP20)</option>
                    <option value="binanceId">Binance ID</option>
                    <option value="btcAddress">BTC Address</option>
                  </select>
                </div>
              ) : null}
            </div>

            <div>
              <label className={cx("mb-2 block text-sm font-medium", titleText(isDark))}>
                Amount
              </label>
              <div className="relative">
                <BadgeDollarSign
                  size={18}
                  className={cx(
                    "absolute left-4 top-1/2 -translate-y-1/2","text-subtle"
                  )}
                />
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter withdrawal amount"
                  className={inputBase(isDark, "pl-11")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={withdrawSubmitting}
              className={buttonPrimary(isDark, "w-full justify-center")}
            >
              {withdrawSubmitting ? "Processing..." : "Submit Withdrawal"}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <div className={panelCard(isDark, "p-6")}>
            <div className="flex items-center gap-3">
              <div
                className={cx(
                  "flex h-12 w-12 items-center justify-center rounded-card","bg-primary-soft text-primary"
                )}
              >
                {selectedGateway === "Bank Transfer" ? (
                  <Landmark size={20} />
                ) : (
                  <WalletCards size={20} />
                )}
              </div>

              <div>
                <h3 className={cx("text-lg font-bold", titleText(isDark))}>
                  Account details
                </h3>
                <p className={cx("text-sm", muted(isDark))}>
                  Destination details used for your payout request.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {accountDetails.map((item) => (
                <div key={item.label} className={softCard(isDark, "p-4")}>
                  <p className={cx("text-xs uppercase tracking-[0.18em]", muted(isDark))}>
                    {item.label}
                  </p>
                  <p className={cx("mt-2 break-all text-sm font-medium", titleText(isDark))}>
                    {item.value || "--"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className={panelCard(isDark, "p-6")}>
            <div className="flex items-center gap-3">
              <div
                className={cx(
                  "flex h-12 w-12 items-center justify-center rounded-card","bg-primary-soft text-primary"
                )}
              >
                <Shield size={20} />
              </div>

              <div>
                <h3 className={cx("text-lg font-bold", titleText(isDark))}>
                  Payout notes
                </h3>
                <p className={cx("text-sm", muted(isDark))}>
                  Keep this simple for users and safer for support.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                "Amount must be less than or equal to your available IB balance.",
                "Bank transfer uses your saved bank details automatically.",
                "Wallet transfer uses the selected saved wallet detail.",
                "Every request is submitted with pending status first.",
              ].map((text) => (
                <div key={text} className={softCard(isDark, "p-4")}>
                  <div className="flex items-start gap-3">
                    <Wallet
                      size={16}
                      className={"mt-1 text-primary"}
                    />
                    <p className={cx("text-sm leading-6", muted(isDark))}>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReferralWithdrawTab;