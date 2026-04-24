import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import UseUserHook from "@/hooks/user/UseUserHook";
import { CFgenerateRandomNumber } from "@/utils/CustomFunctions";
import { userApi } from "@/utils/apiClients";

export const formatMoney = (value = 0, digits = 2) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;

export const formatDateTime = (iso) => {
  if (!iso) return "--";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) +
    ", " +
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  );
};

export const timeAgo = (iso) => {
  if (!iso) return "--";
  const created = new Date(iso);
  const diff = Math.max(0, Date.now() - created.getTime());

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (mins) parts.push(`${mins}m`);

  return parts.length ? `${parts.join(" ")} ago` : "just now";
};

export const methodLabel = (method = "") => {
  const v = String(method).toLowerCase();

  if (
    ["usdttrc20", "usdt(trc20)", "usdt_trc20", "usdt-trc20", "usdt trc20"].includes(v)
  ) {
    return "USDT (TRC20)";
  }

  if (
    ["usdtbep20", "usdt(bep20)", "usdt_bep20", "usdt-bep20", "usdt bep20"].includes(v)
  ) {
    return "USDT (BEP20)";
  }

  if (["binanceid", "binance id"].includes(v)) return "Binance ID";
  if (["btcaddress", "btc address"].includes(v)) return "BTC Address";
  if (["bank", "bank transfer"].includes(v)) return "Bank Transfer";

  return method || "--";
};

const useReferralPanel = () => {
  const loggedUser = useSelector((store) => store.user?.loggedUser);
  const siteConfig = useSelector((store) => store.user?.siteConfig);

  const { getUpdateLoggedUser } = UseUserHook();

  const [commissionsData, setCommissionsData] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingCommissions, setLoadingCommissions] = useState(false);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [generatingAccount, setGeneratingAccount] = useState(false);
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  const hasReferralAccount = Boolean(loggedUser?.referralAccount);

  const referralLink = useMemo(() => {
    if (!loggedUser?.referralAccount) return "";
    return `${origin}/auth/signup/${loggedUser.referralAccount}`;
  }, [origin, loggedUser?.referralAccount]);

  const commissionRateLabel = useMemo(() => {
    const raw = siteConfig?.commissionPercent;
    if (raw === undefined || raw === null || raw === "") return "10%";
    return String(raw).includes("%") ? String(raw) : `${raw}%`;
  }, [siteConfig?.commissionPercent]);

  const totalCommission = useMemo(() => {
    const direct = commissionsData.reduce(
      (sum, row) => sum + Number(row?.commission || 0),
      0
    );

    const nested = commissionsData.reduce(
      (sum, row) => sum + Number(row?.totalCommission || 0),
      0
    );

    return direct > 0 ? direct : nested;
  }, [commissionsData]);

  const totalReferrals = loggedUser?.referredUsers?.length || 0;
  const activeReferrals = commissionsData.length;
  const ibBalance = Number(loggedUser?.ibBalance || 0);

  const approvedWithdrawalAmount = useMemo(() => {
    return withdrawals
      .filter((item) => String(item?.status).toLowerCase() === "approved")
      .reduce((sum, item) => sum + Number(item?.amount || 0), 0);
  }, [withdrawals]);

  const fetchCommissions = async () => {
    if (!loggedUser?.referralAccount) {
      setCommissionsData([]);
      return;
    }

    setLoadingCommissions(true);
    try {
      const res = await userApi.get(`/user-zone-ibs/${loggedUser.referralAccount}`);
      setCommissionsData(res?.data?.data || []);
    } catch (error) {
      setCommissionsData([]);
    } finally {
      setLoadingCommissions(false);
    }
  };

  const fetchWithdrawals = async () => {
    if (!loggedUser?._id) {
      setWithdrawals([]);
      return;
    }

    setLoadingWithdrawals(true);
    try {
      const res = await userApi.get(`/ib-withdrawals/${loggedUser._id}`);
      setWithdrawals((res?.data?.data || []).reverse());
    } catch (error) {
      setWithdrawals([]);
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  const refreshAll = async () => {
    try {
      await getUpdateLoggedUser();
      await Promise.allSettled([fetchCommissions(), fetchWithdrawals()]);
    } catch (error) {
      // silent
    }
  };

  const generateReferralAccount = async () => {
    if (generatingAccount) return;
    if (loggedUser?.referralAccount) {
      toast.success("Referral account already active");
      return;
    }

    const toastId = toast.loading("Generating referral account...");
    setGeneratingAccount(true);

    try {
      const randomNumber = CFgenerateRandomNumber(7);

      await userApi.put(`/update-user`, {
        id: loggedUser?._id,
        referralAccount: randomNumber,
      });

      await getUpdateLoggedUser();
      toast.success("Referral account created", { id: toastId });
    } catch (error) {
      toast.error(
        `Please try again later. ${error?.response?.data?.code ?? ""}`,
        { id: toastId }
      );
    } finally {
      setGeneratingAccount(false);
    }
  };

  const submitWithdrawal = async ({
    selectedGateway,
    selectedWallet,
    amount,
  }) => {
    if (withdrawSubmitting) return false;

    const amountNum = Number(amount);
    const balanceNum = Number(loggedUser?.ibBalance || 0);

    if (!balanceNum || balanceNum <= 0) {
      toast.error("You do not have enough balance for withdrawal.");
      return false;
    }

    if (Number.isNaN(amountNum) || amountNum <= 0) {
      toast.error("Enter a valid withdrawal amount.");
      return false;
    }

    if (amountNum > balanceNum) {
      toast.error(`Amount must be less than or equal to ${formatMoney(balanceNum, 4)}`);
      return false;
    }

    setWithdrawSubmitting(true);

    try {
      const method =
        selectedGateway === "Bank Transfer"
          ? selectedGateway
          : selectedWallet;

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

      await userApi.post(`/add-referral-withdrawal`, {
        referralId: loggedUser?.referralAccount,
        method,
        amount: amountNum,
        status: "pending",
        userId: loggedUser?._id,
        managerIndex: import.meta.env.VITE_MANAGER_INDEX,
        totalBalance: balanceNum,
        level: 1,
      });

      const customContent = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Withdrawal Request Confirmation</title>
          </head>
          <body>
            <div>
              <h2>Commission Withdrawal Requested</h2>
              <p>Dear ${loggedUser?.firstName || ""} ${loggedUser?.lastName || ""},</p>
              <p>We received your commission withdrawal request.</p>
              <p><b>Username:</b> ${loggedUser?.email || ""}</p>
              <p><b>Total Amount:</b> ${balanceNum}</p>
              <p><b>Withdrawal Amount:</b> ${amountNum}</p>
              <p><b>Updated:</b> ${formattedDateTime}</p>
            </div>
          </body>
        </html>
      `;

      try {
        await userApi.post(`/custom-mail`, {
          email: loggedUser?.email,
          content: customContent,
          subject: "IB Withdrawal Requested",
        });
      } catch (error) {
        // ignore
      }

      await Promise.allSettled([fetchWithdrawals(), getUpdateLoggedUser()]);
      toast.success("Withdrawal requested");
      return true;
    } catch (error) {
      toast.error("Something went wrong while submitting withdrawal");
      return false;
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  useEffect(() => {
    getUpdateLoggedUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loggedUser?.referralAccount) {
      fetchCommissions();
    } else {
      setCommissionsData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedUser?.referralAccount]);

  useEffect(() => {
    if (loggedUser?._id) {
      fetchWithdrawals();
    } else {
      setWithdrawals([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedUser?._id]);

  return {
    loggedUser,
    siteConfig,
    commissionsData,
    withdrawals,
    loadingCommissions,
    loadingWithdrawals,
    generatingAccount,
    withdrawSubmitting,
    hasReferralAccount,
    referralLink,
    commissionRateLabel,
    totalCommission,
    totalReferrals,
    activeReferrals,
    approvedWithdrawalAmount,
    ibBalance,
    fetchCommissions,
    fetchWithdrawals,
    refreshAll,
    generateReferralAccount,
    submitWithdrawal,
  };
};

export default useReferralPanel;