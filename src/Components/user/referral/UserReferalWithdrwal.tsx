import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeDollarSign, Loader2, WalletCardsIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { backendApi } from "../../../utils/apiClients";
import ModernHeading from "../../lib/ModernHeading";
import useAutoUpdateLoggedUser from "../../../hooks/user/UseAutoUpdateLoggedUser";

// ✨ bring in the same ambient visuals used in UserReferal
import { FloatingParticles } from "../../../utils/FloatingParticles";
import { AnimatedGrid } from "../../../utils/AnimatedGrid";

export const UserReferralWithdrawal = () => {
  const loggedUser = useSelector((store: any) => store.user.loggedUser);
  const [selectedGateway, setSelectedGateway] = useState("Bank Transfer");
  const [apiLoader, setApiLoader] = useState(false);
  const [error, setError] = useState("");
  const balance = Number(loggedUser?.ibBalance || 0).toFixed(4);
  const [amount, setAmount] = useState("");
  const [selectWallet, setSelectWallet] = useState("usdtTrc20");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  useAutoUpdateLoggedUser();

  const currentDateTime = new Date();
  const formattedDateTime =
    currentDateTime.toLocaleDateString("en-GB") +
    ", " +
    currentDateTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  const customContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Withdrawal Request Confirmation - Arena Trade</title>
      <style>
        body, html { margin: 0; padding: 0; font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f3f5f9; }
        .container { max-width: 600px; margin: 0 auto; padding: 5px; background-color: #ffffff; }
        .header { background-color: #19422df2; color: #ffffff; padding: 20px 15px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 22px; letter-spacing: 1px; }
        .content { padding: 10px 20px; }
        .cta-button { display: inline-block; padding: 12px 24px; background-color: #0f9f6e; color: #FFFFFF; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
        .footer { background-color: #19422df2; color: #ffffff; text-align: center; padding: 5px 10px; font-size: 12px; border-radius: 0 0 10px 10px; }
        .footer-info { margin-top: 6px; }
        .footer-info a { color: #bed2ff; text-decoration: none; }
        .withdrawal-details { background-color: #f8f8f8; border-left: 4px solid #0f9f6e; padding: 15px; margin: 20px 0; }
        .withdrawal-details p { margin: 5px 0; }
        .highlight { font-weight: bold; color: #0a2342; }
        .risk-warning { color: #C70039; padding: 5px; font-size: 12px; line-height: 1.4; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>Commission Withdrwal Requested</h1></div>
        <div class="content">
          <p>Dear ${loggedUser?.firstName + " " + loggedUser?.lastName},</p>
          <p>We have received your Commision withdrawal request and are currently processing it.<br><br>
          Our team is working diligently to verify your details, and you will be notified as soon as the verification is complete.</p>
          <div class="withdrawal-details">
            <p>Username: <span class="highlight">${loggedUser.email}</span></p>
            <p>Total Amount: <span class="highlight">${balance}</span></p>
            <p>Withdrwal Amount: <span class="highlight">${amount}</span></p>
            <p>Processing time: <span class="highlight"> 1-3 business days</span></p>
            <p>Updated Date: <span class="highlight">${formattedDateTime}</span></p>
          </div>
          <p>Thank you for choosing us.</p>
          <p>Happy trading!</p>
          <p>Best regards,<br>The ${import.meta.env.VITE_WEBSITE_NAME || "Forex"} Team</p>
          <hr>
          <div class="risk-warning">
            <strong>Risk Warning:</strong> Trading CFDs carries high risk and may result in losses beyond your initial investment. Trade only with money you can afford to lose and understand the risks.<br><br>
            Our services are not for U.S. citizens or in jurisdictions where they violate local laws.
          </div>
        </div>
        <div class="footer">
          <div class="footer-info">
            <p>Website: <a href="https://${import.meta.env.VITE_EMAIL_WEBSITE}"> ${import.meta.env.VITE_EMAIL_WEBSITE}</a> | E-mail: <a href="mailto:${import.meta.env.VITE_EMAIL_EMAIL || ""}">${import.meta.env.VITE_EMAIL_EMAIL || ""}</a></p>
            <p>© 2025 ${import.meta.env.VITE_WEBSITE_NAME || ""}. All Rights Reserved</p>
          </div>
        </div>
      </div>
    </body>
    </html>`;

  // --- submit ---
  const withdrawalHandler = async (e: any) => {
    e.preventDefault();
    if (isWithdrawing) return;

    setApiLoader(true);
    setError("");
    setIsWithdrawing(true);

    try {
      const balNum = Number(balance);
      const amtNum = Number(amount);

      if (balNum <= 0) {
        setError(`You don't have sufficient balance for withdrawal.`);
      } else if (Number.isNaN(amtNum) || amtNum <= 0) {
        setError(`Enter a valid withdrawal amount.`);
      } else if (amtNum > balNum) {
        setError(`Amount must be less than or equal to $${balance}`);
      } else {
        await backendApi.post(`/add-referral-withdrawal`, {
          referralId: loggedUser.referralAccount,
          method: selectedGateway === "Bank Transfer" ? selectedGateway : selectWallet,
          amount: amtNum,
          status: "pending",
          userId: loggedUser._id,
          managerIndex: import.meta.env.VITE_MANAGER_INDEX,
          totalBalance: balance,
          level: 1,
        });

        await backendApi.post(`/custom-mail`, {
          email: loggedUser.email,
          content: customContent,
          subject: "IB Withdrawal Requested",
        });

        toast.success("Withdrawal Requested");
      }
    } catch (error) {
      toast.error("Something went wrong!!");
      console.log("error while withdraw", error);
    } finally {
      setApiLoader(false);
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <AnimatedGrid />
      <FloatingParticles />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-5xl mx-auto border border-line rounded-card p-4 sm:p-6"
      >
        {/* Header Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 rounded-full px-4 py-2 border border-line text-muted hover:bg-surface transition-all"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <ModernHeading text="Withdraw IB Commission" />
          </div>

          {/* Withdrawable Amount Pill */}
          <div className="text-right w-full md:w-auto">
            <h1 className="font-semibold text-sm text-muted">Withdrawable amount</h1>
            <div className="bg-warning-soft border border-warning px-4 py-1 rounded-full mt-1">
              <p className="text-muted font-semibold text-sm">${balance}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={withdrawalHandler} className="space-y-6">
          {/* Method + Wallet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full">
              <label htmlFor="gateway" className="block text-sm font-medium text-muted mb-2">
                Method
              </label>
              <select
                id="gateway"
                value={selectedGateway}
                onChange={(e) => setSelectedGateway(e.target.value)}
                className="block w-full p-3 rounded-card bg-surface-3 backdrop-blur-sm border border-line text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option className="bg-surface text-muted" value="Bank Transfer">Bank Transfer</option>
                <option className="bg-surface text-muted" value="Wallet Transfer">Wallet Transfer</option>
              </select>
            </div>

            {selectedGateway === "Wallet Transfer" && (
              <div className="w-full">
                <label htmlFor="account" className="block text-sm font-medium text-muted mb-2">
                  Choose Wallet
                </label>
                <select
                  id="account"
                  value={selectWallet}
                  onChange={(e) => setSelectWallet(e.target.value)}
                  className="block w-full p-3 rounded-card bg-surface-3 backdrop-blur-sm border border-line text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option className="bg-surface text-muted" value="usdtTrc20">USDT (Trc20)</option>
                  <option className="bg-surface text-muted" value="usdtBep20">USDT (Bep20)</option>
                  <option className="bg-surface text-muted" value="binanceId">Binance ID</option>
                  <option className="bg-surface text-muted" value="btcAddress">BTC Address</option>
                </select>
              </div>
            )}
          </div>

          {/* Account Details Card */}
          <div className="bg-surface border border-line rounded-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-soft rounded-card flex items-center justify-center">
                <WalletCardsIcon className="text-primary w-5 h-5" />
              </div>
              <h2 className="text-muted font-semibold">Account details</h2>
            </div>

            {selectedGateway === "Bank Transfer" ? (
              <div className="grid sm:grid-cols-2 gap-3 text-muted">
                <p>Bank Name: <span className="font-semibold text-muted">{loggedUser?.bankDetails?.bankName}</span></p>
                <p>Holder Name: <span className="font-semibold text-muted">{loggedUser?.bankDetails?.holderName}</span></p>
                <p>Account Number: <span className="font-semibold text-muted">{loggedUser?.bankDetails?.accountNumber}</span></p>
                <p>IFSC Code: <span className="font-semibold text-muted">{loggedUser?.bankDetails?.ifscCode}</span></p>
                <p>Swift Code: <span className="font-semibold text-muted">{loggedUser?.bankDetails?.swiftCode}</span></p>
                <p>UPI ID: <span className="font-semibold text-muted">{loggedUser?.bankDetails?.upiId}</span></p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3 text-muted">
                {selectWallet === "usdtTrc20" && (
                  <p>USDT TRC20: <span className="font-semibold text-muted">{loggedUser?.walletDetails?.tetherAddress}</span></p>
                )}
                {selectWallet === "usdtBep20" && (
                  <p>USDT BEP20: <span className="font-semibold text-muted">{loggedUser?.walletDetails?.ethAddress}</span></p>
                )}
                {selectWallet === "binanceId" && (
                  <p>Binance ID: <span className="font-semibold text-muted">{loggedUser?.walletDetails?.accountNumber}</span></p>
                )}
                {selectWallet === "btcAddress" && (
                  <p>BTC Address: <span className="font-semibold text-muted">{loggedUser?.walletDetails?.trxAddress}</span></p>
                )}
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-muted mb-2">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BadgeDollarSign className="h-5 w-5 text-primary" />
              </div>
              <input
                type="text"
                id="amount"
                className="w-full pl-12 pr-4 py-3 rounded-card bg-surface-3 backdrop-blur-sm border border-line text-muted placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isWithdrawing}
            className={`w-full flex justify-center items-center gap-2 py-3 rounded-2xl font-semibold text-text transition-all
              ${isWithdrawing
                ? "bg-surface border border-line cursor-not-allowed"
                : "shadow-blue-500/25"}`}
          >
            {isWithdrawing ? "Processing..." : "Submit Withdrawal"}
            {(apiLoader || isWithdrawing) && <Loader2 className="animate-spin" />}
          </button>

          {/* Error */}
          {error && (
            <div className="text-center">
              <p className="text-danger font-medium">{error}</p>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
};
