import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CircleDollarSign,
  Gift,
  Landmark,
  RefreshCw,
  Server,
  ShieldCheck,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { userApi } from "@/utils/apiClients";
import AccountOpenTradesMarketSection from "./AccountOpenTradesMarketSection";

const CARD_LINKS = [
  "/user/dashboard",
  "/user/dashboard",
  "/user/deposit",
  "/user/withdraw",
  "/user/bonus/dashboard",
  "/user/dashboard",
];

const INSURANCE_POPUP_ENDPOINT = "/insurance-claim-popup-status";
const INSURANCE_CLAIM_DETAILS_ENDPOINT = "/insurance-claim-details";
const INSURANCE_CLAIM_ENDPOINT = "/insurance-claim";

type DashboardSummary = {
  totalBalance: number;
  totalEquity: number;
  totalDeposit: number;
  totalWithdrawal: number;
  totalBonus: number;
  totalIbCommission: number;
  currency: string;
  currencies: string[];
  totalAccounts: number;
  hasMixedCurrencies: boolean;
};

type StatItem = {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  positive?: boolean;
  trend: number[];
  link?: string;
};

type SummaryItem = {
  title: string;
  value: string;
  icon: React.ReactNode;
  tone: "primary" | "warning" | "success";
};

type InsurancePopupAccount = {
  accountNumber: string;
  claimableAmount: number;
  unclaimedCount: number;
};

type InsurancePopupResponse = {
  success?: boolean;
  showInsuranceClaimPopup?: boolean;
  title?: string;
  message?: string;
  accounts?: InsurancePopupAccount[];
};

type InsuranceCoverageItem = {
  coverageId: string;
  claimAmount: number;
};

type InsuranceClaimDetailsResponse = {
  success?: boolean;
  accountNumber?: string;
  totalClaimAmount?: number;
  coverages?: InsuranceCoverageItem[];
};

type InsuranceClaimActionResponse = {
  success?: boolean;
  message?: string;
  creditedAmount?: number;
  redirectUrl?: string;
};

type InsuranceClaimDecisionPayload = {
  mt5Account: string;
  claimType: "single" | "all";
  coverageIds: string[];
  claimAmount: number;
};

type SvgPoint = {
  x: number;
  y: number;
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const toNumber = (value: unknown, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const formatCurrency = (value: number, currency = "USD") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(toNumber(value));
  } catch {
    return `${toNumber(value).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })} ${currency || ""}`.trim();
  }
};

const buildLinePath = (points: SvgPoint[]) =>
  points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

const buildAreaPath = (points: SvgPoint[], baseline: number) => {
  if (!points.length) return "";
  return `${buildLinePath(points)} L ${
    points[points.length - 1].x
  } ${baseline} L ${points[0].x} ${baseline} Z`;
};

const buildSparklinePoints = (
  values: number[],
  width: number,
  height: number,
  padding = 8
): SvgPoint[] => {
  if (!values.length) return [];

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = Math.max(maxValue - minValue, 1);

  return values.map((value, index) => ({
    x:
      padding +
      (index * (width - padding * 2)) / Math.max(values.length - 1, 1),
    y:
      height -
      padding -
      ((value - minValue) / range) * (height - padding * 2),
  }));
};

const getEmptyDashboardSummary = (currency = "USD"): DashboardSummary => ({
  totalBalance: 0,
  totalEquity: 0,
  totalDeposit: 0,
  totalWithdrawal: 0,
  totalBonus: 0,
  totalIbCommission: 0,
  currency,
  currencies: currency ? [currency] : [],
  totalAccounts: 0,
  hasMixedCurrencies: false,
});

const extractAccounts = (accountsData: any, loggedUser: any) => {
  if (Array.isArray(accountsData)) return accountsData;
  if (Array.isArray(accountsData?.accounts)) return accountsData.accounts;
  if (Array.isArray(accountsData?.data)) return accountsData.data;
  if (Array.isArray(loggedUser?.accounts)) return loggedUser.accounts;
  return [];
};

const pickValueFromSources = (sources: any[], keys: string[], fallback = 0) => {
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;

    for (const key of keys) {
      const value = source?.[key];
      if (value !== undefined && value !== null && value !== "") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
      }
    }
  }

  return fallback;
};

const pickStringFromSources = (
  sources: any[],
  keys: string[],
  fallback = ""
) => {
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;

    for (const key of keys) {
      const value = source?.[key];
      if (value !== undefined && value !== null && String(value).trim()) {
        return String(value).trim();
      }
    }
  }

  return fallback;
};

const aggregateAccountOverview = (
  accounts: any[],
  fallbackCurrency = "USD"
) => {
  if (!accounts.length) {
    return {
      totalBalance: 0,
      totalEquity: 0,
      currency: fallbackCurrency,
      currencies: fallbackCurrency ? [fallbackCurrency] : [],
      totalAccounts: 0,
      hasMixedCurrencies: false,
    };
  }

  const currencySet = new Set<string>();

  const totals = accounts.reduce(
    (acc, account) => {
      const sources = [
        account,
        account?.summary,
        account?.metrics,
        account?.overview,
        account?.wallet,
        account?.totals,
      ];

      const currency = pickStringFromSources(
        sources,
        [
          "currency",
          "Currency",
          "accountCurrency",
          "baseCurrency",
          "walletCurrency",
        ],
        ""
      );

      if (currency) currencySet.add(currency);

      acc.totalBalance += pickValueFromSources(sources, [
        "Balance",
        "balance",
        "totalBalance",
        "walletBalance",
        "mtBalance",
        "BALANCE",
      ]);

      acc.totalEquity += pickValueFromSources(sources, [
        "Equity",
        "equity",
        "totalEquity",
        "walletEquity",
        "mtEquity",
        "EQUITY",
      ]);

      return acc;
    },
    {
      totalBalance: 0,
      totalEquity: 0,
    }
  );

  const currencies = Array.from(currencySet);
  const resolvedCurrency = currencies[0] || fallbackCurrency || "USD";

  return {
    ...totals,
    currency: resolvedCurrency,
    currencies,
    totalAccounts: accounts.length,
    hasMixedCurrencies: currencies.length > 1,
  };
};

const isNoDataApiError = (error: any, keywords: string[] = []) => {
  const status = error?.response?.status;
  const message = String(
    error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      ""
  ).toLowerCase();

  if (status === 404) return true;

  return keywords.some((keyword) => message.includes(keyword.toLowerCase()));
};

const navigateToLink = (link?: string) => {
  if (!link || typeof window === "undefined") return;

  const isExternal = /^https?:\/\//i.test(link);

  if (isExternal) {
    window.open(link, "_blank", "noopener,noreferrer");
    return;
  }

  window.location.href = link;
};

const buildClaimQueryString = (
  mt5Account: string,
  claimType: "single" | "all",
  coverageIds: string[]
) => {
  const params = new URLSearchParams();
  params.append("mt5Account", mt5Account);
  params.append("claimType", claimType);

  coverageIds.forEach((coverageId) => {
    params.append("coverageIds", coverageId);
  });

  return params.toString();
};

export default function UserDashboard() {
  const navigate = useNavigate();

  const mode = useSelector((store: any) => store.userTheme?.mode || "light");
  const userSiteconfig = useSelector((store: any) => store.user?.siteConfig);
  const loggedUser = useSelector((store: any) => store.user?.loggedUser);
  const accountsData = useSelector((store: any) => store.user?.accountsData);

  const isDark = mode === "dark";

  const [greeting, setGreeting] = useState("Welcome back");
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [summary, setSummary] = useState<DashboardSummary>(
    getEmptyDashboardSummary("USD")
  );

  const [insurancePopupOpen, setInsurancePopupOpen] = useState(false);
  const [insurancePopupTitle, setInsurancePopupTitle] = useState(
    "Congratulations 🎉"
  );
  const [insurancePopupMessage, setInsurancePopupMessage] = useState("");
  const [insuranceEligibleAccounts, setInsuranceEligibleAccounts] = useState<
    InsurancePopupAccount[]
  >([]);
  const [insurancePopupKey, setInsurancePopupKey] = useState("");

  const [selectedInsuranceAccount, setSelectedInsuranceAccount] = useState("");
  const [insuranceDetailsLoading, setInsuranceDetailsLoading] = useState(false);
  const [insuranceClaimLoading, setInsuranceClaimLoading] = useState(false);
  const [claimingCoverageId, setClaimingCoverageId] = useState<string | null>(
    null
  );
  const [insuranceClaimError, setInsuranceClaimError] = useState("");
  const [insuranceClaimSuccess, setInsuranceClaimSuccess] = useState("");
  const [insuranceClaimDetails, setInsuranceClaimDetails] =
    useState<InsuranceClaimDetailsResponse | null>(null);

  const [isClient, setIsClient] = useState(false);
  const [claimDecisionOpen, setClaimDecisionOpen] = useState(false);
  const [pendingClaimAction, setPendingClaimAction] =
    useState<InsuranceClaimDecisionPayload | null>(null);

  const allAccounts = useMemo(
    () => extractAccounts(accountsData, loggedUser),
    [accountsData, loggedUser]
  );

  const allServerNames = useMemo(() => {
    const names = allAccounts
      .map((acc: any) =>
        acc?.serverName ||
        acc?.server ||
        acc?.mt5Server ||
        acc?.summary?.serverName ||
        ""
      )
      .filter(Boolean);

    return Array.from(new Set(names));
  }, [allAccounts]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const previousOverflow = document.body.style.overflow;

    if (insurancePopupOpen || claimDecisionOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previousOverflow || "";
    }

    return () => {
      document.body.style.overflow = previousOverflow || "";
    };
  }, [insurancePopupOpen, claimDecisionOpen, isClient]);

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const fetchDepositTotal = useCallback(async (userId?: string) => {
    if (!userId) return 0;

    try {
      const res = await userApi.get(`/deposit/${userId}`);
      const payload = Array.isArray(res?.data?.data) ? res.data.data : [];

      return payload.reduce((sum: number, item: any) => {
        return (
          sum +
          toNumber(
            item?.deposit ??
              item?.amount ??
              item?.finalPayableAmount ??
              item?.baseDepositAmount,
            0
          )
        );
      }, 0);
    } catch (error: any) {
      if (
        isNoDataApiError(error, [
          "no deposit",
          "no deposits",
          "deposit not found",
        ])
      ) {
        return 0;
      }
      throw error;
    }
  }, []);

  const fetchWithdrawalTotal = useCallback(async (userId?: string) => {
    if (!userId) return 0;

    try {
      const res = await userApi.get(`/withdrawals/${userId}`);
      const payload = Array.isArray(res?.data?.data) ? res.data.data : [];

      return payload.reduce((sum: number, item: any) => {
        return (
          sum +
          toNumber(item?.amount ?? item?.withdrawal ?? item?.withdrawAmount, 0)
        );
      }, 0);
    } catch (error: any) {
      if (
        isNoDataApiError(error, [
          "no withdrawal",
          "no withdrawals",
          "withdrawal not found",
        ])
      ) {
        return 0;
      }
      throw error;
    }
  }, []);

  const fetchBonusTotalFromWallet = useCallback(() => {
    return toNumber(loggedUser?.bonusWallet, 0);
  }, [loggedUser?.bonusWallet]);

  const fetchIbCommissionTotalPlaceholder = useCallback(async (_userId?: string) => {
    return 0;
  }, []);

  const resetInsuranceStates = useCallback(() => {
    setInsuranceEligibleAccounts([]);
    setInsurancePopupMessage("");
    setInsurancePopupTitle("Congratulations 🎉");
    setInsurancePopupKey("");
    setInsurancePopupOpen(false);
    setSelectedInsuranceAccount("");
    setInsuranceClaimDetails(null);
    setInsuranceClaimError("");
    setInsuranceClaimSuccess("");
    setInsuranceDetailsLoading(false);
    setInsuranceClaimLoading(false);
    setClaimingCoverageId(null);
    setClaimDecisionOpen(false);
    setPendingClaimAction(null);
  }, []);

  const closeInsurancePopup = useCallback(() => {
    if (typeof window !== "undefined" && insurancePopupKey) {
      sessionStorage.setItem(insurancePopupKey, "seen");
    }
    setInsurancePopupOpen(false);
    setInsuranceClaimError("");
    setInsuranceClaimSuccess("");
  }, [insurancePopupKey]);

  const closeClaimDecision = useCallback(() => {
    setClaimDecisionOpen(false);
    setPendingClaimAction(null);
  }, []);

  const fetchInsuranceClaimDetails = useCallback(async (accountNumber: string) => {
    if (!accountNumber) return;

    setInsuranceDetailsLoading(true);
    setInsuranceClaimError("");
    setInsuranceClaimSuccess("");

    try {
      const res = await userApi.get(
        `${INSURANCE_CLAIM_DETAILS_ENDPOINT}/${accountNumber}`
      );

      const data: InsuranceClaimDetailsResponse = res?.data || {};

      setInsuranceClaimDetails({
        success: data?.success,
        accountNumber: data?.accountNumber || accountNumber,
        totalClaimAmount: toNumber(data?.totalClaimAmount, 0),
        coverages: Array.isArray(data?.coverages)
          ? data.coverages.map((item) => ({
              coverageId: String(item?.coverageId || ""),
              claimAmount: toNumber(item?.claimAmount, 0),
            }))
          : [],
      });
    } catch (error: any) {
      console.error("Insurance claim details fetch failed:", error);
      setInsuranceClaimDetails({
        success: false,
        accountNumber,
        totalClaimAmount: 0,
        coverages: [],
      });
      setInsuranceClaimError(
        error?.response?.data?.message ||
          "Unable to load insurance claim details."
      );
    } finally {
      setInsuranceDetailsLoading(false);
    }
  }, []);

  const updateInsuranceStateAfterClaim = useCallback(
    (
      accountNumber: string,
      claimedCoverageIds: string[],
      creditedAmount: number,
      claimType: "single" | "all"
    ) => {
      setInsuranceClaimDetails((prev) => {
        if (!prev || prev.accountNumber !== accountNumber) return prev;

        const previousCoverages = Array.isArray(prev.coverages)
          ? prev.coverages
          : [];

        const remainingCoverages = previousCoverages.filter(
          (item) => !claimedCoverageIds.includes(item.coverageId)
        );

        return {
          ...prev,
          coverages: remainingCoverages,
          totalClaimAmount: remainingCoverages.reduce(
            (sum, item) => sum + toNumber(item.claimAmount, 0),
            0
          ),
        };
      });

      setInsuranceEligibleAccounts((prev) => {
        const next = prev
          .map((item) => {
            if (item.accountNumber !== accountNumber) return item;

            if (claimType === "all") {
              return null;
            }

            const nextCount = Math.max(
              0,
              toNumber(item.unclaimedCount, 0) - claimedCoverageIds.length
            );

            const nextAmount = Math.max(
              0,
              toNumber(item.claimableAmount, 0) - creditedAmount
            );

            if (nextCount <= 0 || nextAmount <= 0) return null;

            return {
              ...item,
              unclaimedCount: nextCount,
              claimableAmount: nextAmount,
            };
          })
          .filter(Boolean) as InsurancePopupAccount[];

        if (!next.length) {
          if (typeof window !== "undefined" && insurancePopupKey) {
            sessionStorage.setItem(insurancePopupKey, "seen");
          }
          setInsurancePopupOpen(false);
          setSelectedInsuranceAccount("");
        } else {
          const accountStillExists = next.some(
            (item) => item.accountNumber === accountNumber
          );

          if (!accountStillExists) {
            setSelectedInsuranceAccount(next[0]?.accountNumber || "");
          }
        }

        return next;
      });
    },
    [insurancePopupKey]
  );

  const handleInsuranceClaim = useCallback(
    async (
      payload: {
        mt5Account: string;
        claimType: "single" | "all";
        coverageIds: string[];
      },
      options?: {
        redirectAfterSuccess?: boolean;
      }
    ) => {
      const { mt5Account, claimType, coverageIds } = payload;

      if (!mt5Account || !coverageIds.length) return;

      setInsuranceClaimError("");
      setInsuranceClaimSuccess("");

      if (claimType === "all") {
        setInsuranceClaimLoading(true);
      } else {
        setClaimingCoverageId(coverageIds[0]);
      }

      try {
        const queryString = buildClaimQueryString(
          mt5Account,
          claimType,
          coverageIds
        );

        const res = await userApi.get(`${INSURANCE_CLAIM_ENDPOINT}?${queryString}`);
        const data: InsuranceClaimActionResponse = res?.data || {};

        const creditedAmount = toNumber(data?.creditedAmount, 0);

        updateInsuranceStateAfterClaim(
          mt5Account,
          coverageIds,
          creditedAmount,
          claimType
        );

        const successMessage =
          data?.message ||
          (claimType === "all"
            ? "All insurance claimed successfully."
            : "Insurance claimed successfully.");

        setInsuranceClaimSuccess(successMessage);

        if (options?.redirectAfterSuccess && typeof window !== "undefined") {
          window.location.href = data?.redirectUrl || "/user/deposit";
        }
      } catch (error: any) {
        console.error("Insurance claim failed:", error);
        setInsuranceClaimError(
          error?.response?.data?.message || "Unable to process insurance claim."
        );
      } finally {
        setInsuranceClaimLoading(false);
        setClaimingCoverageId(null);
      }
    },
    [updateInsuranceStateAfterClaim]
  );

  const openClaimDecision = useCallback(
    (payload: InsuranceClaimDecisionPayload) => {
      setInsuranceClaimError("");
      setInsuranceClaimSuccess("");
      setPendingClaimAction(payload);
      setClaimDecisionOpen(true);
    },
    []
  );

  const handleClaimWithoutInsurance = useCallback(async () => {
    if (!pendingClaimAction) return;

    await handleInsuranceClaim({
      mt5Account: pendingClaimAction.mt5Account,
      claimType: pendingClaimAction.claimType,
      coverageIds: pendingClaimAction.coverageIds,
    });

    setClaimDecisionOpen(false);
    setPendingClaimAction(null);
  }, [pendingClaimAction, handleInsuranceClaim]);

  const handleClaimWithInsurance = useCallback(() => {
    if (!pendingClaimAction) return;

    navigate("/user/deposit", {
      state: {
        source: "insurance_claim",
        mt5Account: pendingClaimAction.mt5Account,
        claimType: pendingClaimAction.claimType,
        coverageIds: pendingClaimAction.coverageIds,
        claimAmount: pendingClaimAction.claimAmount,
        autoApplyInsurance: true,
        autoApplyBonus: true,
      },
    });

    setClaimDecisionOpen(false);
    setPendingClaimAction(null);
    setInsurancePopupOpen(false);
    setInsuranceClaimError("");
    setInsuranceClaimSuccess("");
  }, [navigate, pendingClaimAction]);

  const checkInsuranceEligibility = useCallback(async () => {
    try {
      const res = await userApi.get(INSURANCE_POPUP_ENDPOINT);
      const data: InsurancePopupResponse = res?.data || {};

      const accounts = Array.isArray(data?.accounts)
        ? data.accounts
            .map((item) => ({
              accountNumber: String(item?.accountNumber || "").trim(),
              claimableAmount: toNumber(item?.claimableAmount, 0),
              unclaimedCount: toNumber(item?.unclaimedCount, 0),
            }))
            .filter((item) => item.accountNumber)
        : [];

      if (!data?.showInsuranceClaimPopup || !accounts.length) {
        resetInsuranceStates();
        return;
      }

      const normalizedAccounts = accounts
        .map(
          (item) =>
            `${item.accountNumber}:${item.claimableAmount}:${item.unclaimedCount}`
        )
        .sort();

      const nextPopupKey = `insurance-claim-popup:${normalizedAccounts.join("|")}`;

      if (typeof window !== "undefined") {
        const alreadySeen = sessionStorage.getItem(nextPopupKey) === "seen";
        if (alreadySeen) return;
      }

      setInsuranceEligibleAccounts(accounts);
      setInsurancePopupTitle(data?.title || "Congratulations 🎉");
      setInsurancePopupMessage(
        data?.message || "You can claim insurance now."
      );
      setInsurancePopupKey(nextPopupKey);
      setInsurancePopupOpen(true);

      const firstAccount = accounts[0]?.accountNumber || "";
      setSelectedInsuranceAccount(firstAccount);
    } catch (error) {
      console.error("Insurance eligibility check failed:", error);
    }
  }, [resetInsuranceStates]);

  const loadDashboardSummary = useCallback(async () => {
    setRefreshing(true);
    setErrorText("");

    try {
      const baseCurrency =
        userSiteconfig?.currency ||
        userSiteconfig?.baseCurrency ||
        loggedUser?.currency ||
        "USD";

      const accountOverview = aggregateAccountOverview(allAccounts, baseCurrency);

      const [depositResult, withdrawalResult, ibResult] =
        await Promise.allSettled([
          fetchDepositTotal(loggedUser?._id),
          fetchWithdrawalTotal(loggedUser?._id),
          fetchIbCommissionTotalPlaceholder(loggedUser?._id),
        ]);

      const totalDeposit =
        depositResult.status === "fulfilled" ? depositResult.value : 0;

      const totalWithdrawal =
        withdrawalResult.status === "fulfilled" ? withdrawalResult.value : 0;

      const totalBonus = fetchBonusTotalFromWallet();

      const totalIbCommission =
        ibResult.status === "fulfilled" ? ibResult.value : 0;

      const failedBlocks: string[] = [];
      if (depositResult.status === "rejected") failedBlocks.push("deposit");
      if (withdrawalResult.status === "rejected") failedBlocks.push("withdrawal");
      if (ibResult.status === "rejected") failedBlocks.push("IB commission");

      if (failedBlocks.length) {
        setErrorText(
          `Some summary blocks could not be loaded: ${failedBlocks.join(", ")}.`
        );
      } else {
        setErrorText("");
      }

      setSummary({
        totalBalance: accountOverview.totalBalance,
        totalEquity: accountOverview.totalEquity,
        totalDeposit,
        totalWithdrawal,
        totalBonus,
        totalIbCommission,
        currency: accountOverview.currency,
        currencies: accountOverview.currencies,
        totalAccounts: accountOverview.totalAccounts,
        hasMixedCurrencies: accountOverview.hasMixedCurrencies,
      });

      setLastUpdated(new Date().toLocaleString());

      await checkInsuranceEligibility();
    } catch (error) {
      console.error("Failed to load dashboard summary:", error);
      setErrorText("Unable to load dashboard summary.");
      setSummary(
        getEmptyDashboardSummary(
          userSiteconfig?.currency ||
            userSiteconfig?.baseCurrency ||
            loggedUser?.currency ||
            "USD"
        )
      );
    } finally {
      setRefreshing(false);
    }
  }, [
    allAccounts,
    checkInsuranceEligibility,
    fetchBonusTotalFromWallet,
    fetchDepositTotal,
    fetchIbCommissionTotalPlaceholder,
    fetchWithdrawalTotal,
    loggedUser?._id,
    loggedUser?.currency,
    userSiteconfig?.baseCurrency,
    userSiteconfig?.currency,
  ]);

  useEffect(() => {
    loadDashboardSummary();
  }, [loadDashboardSummary]);

  useEffect(() => {
    if (!insurancePopupOpen) return;
    if (!selectedInsuranceAccount) return;

    fetchInsuranceClaimDetails(selectedInsuranceAccount);
  }, [
    insurancePopupOpen,
    selectedInsuranceAccount,
    fetchInsuranceClaimDetails,
  ]);

  const stats: StatItem[] = useMemo(
    () => [
      {
        title: "Total Balance",
        value: formatCurrency(summary.totalBalance, summary.currency),
        change: `Combined from ${summary.totalAccounts} account${
          summary.totalAccounts === 1 ? "" : "s"
        }`,
        icon: <Wallet size={20} />,
        positive: summary.totalBalance >= 0,
        trend: [0, 1, 0, 0.5, 0, 2, 0.1, 0],
        link: CARD_LINKS[0],
      },
      {
        title: "Total Equity",
        value: formatCurrency(summary.totalEquity, summary.currency),
        change: "Summed from accountsData",
        icon: <TrendingUp size={20} />,
        positive: summary.totalEquity >= summary.totalBalance,
        trend: [0.2, 0, 0.6, 0.1, 0.5, 0, 0.4, 0.1],
        link: CARD_LINKS[1],
      },
      {
        title: "Total Deposit",
        value: formatCurrency(summary.totalDeposit, summary.currency),
        change:
          summary.totalDeposit > 0 ? "Loaded from deposit API" : "No deposits yet",
        icon: <Landmark size={20} />,
        positive: summary.totalDeposit >= 0,
        trend: [0, 0.3, 0.1, 0.6, 0, 0.4, 0.2, 0.7],
        link: CARD_LINKS[2],
      },
      {
        title: "Total Withdrawal",
        value: formatCurrency(summary.totalWithdrawal, summary.currency),
        change:
          summary.totalWithdrawal > 0
            ? "Loaded from withdrawal API"
            : "No withdrawals yet",
        icon: <CircleDollarSign size={20} />,
        positive: summary.totalWithdrawal >= 0,
        trend: [0.5, 0.1, 0.4, 0, 0.3, 0.1, 0.6, 0],
        link: CARD_LINKS[3],
      },
      {
        title: "Total Bonus",
        value: formatCurrency(summary.totalBonus, summary.currency),
        change: "Loaded from loggedUser bonusWallet",
        icon: <Gift size={20} />,
        positive: summary.totalBonus >= 0,
        trend: [0, 0.4, 0.2, 0.5, 0.1, 0.3, 0, 0.6],
        link: CARD_LINKS[4],
      },
      {
        title: "Total IB Commission",
        value: formatCurrency(summary.totalIbCommission, summary.currency),
        change: "API placeholder ready",
        icon: <Gift size={20} />,
        positive: summary.totalIbCommission >= 0,
        trend: [0.3, 0, 0.5, 0.2, 0.6, 0.1, 0.4, 0],
        link: CARD_LINKS[5],
      },
    ],
    [summary]
  );

  const miniSummary: SummaryItem[] = [
    {
      title: "Server Name",
      value:
        allServerNames.length > 0
          ? allServerNames.join(", ")
          : userSiteconfig?.serverName || "Not Available",
      icon: <Server size={18} />,
      tone: "primary",
    },
    {
      title: "Total Accounts",
      value: String(summary.totalAccounts || 0),
      icon: <Wallet size={18} />,
      tone: "success",
    },
    {
      title: "Last Updated",
      value: lastUpdated || "Just now",
      icon: <RefreshCw size={18} />,
      tone: "warning",
    },
  ];

  const selectedAccountSummary = useMemo(() => {
    return insuranceEligibleAccounts.find(
      (item) => item.accountNumber === selectedInsuranceAccount
    );
  }, [insuranceEligibleAccounts, selectedInsuranceAccount]);

  const sectionShell = cx(
    "h-full rounded-[30px] border backdrop-blur-xl",
    isDark
      ? "border-white/10 bg-white/[0.04] shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
      : "border-orange-100/80 bg-white/75 shadow-[0_20px_60px_rgba(251,146,60,0.10)]"
  );

  const metricShell = cx(
    "relative min-h-[182px] h-full overflow-hidden rounded-[26px] border p-5 backdrop-blur-xl transition-all duration-300",
    isDark
      ? "border-white/10 bg-white/[0.045] hover:bg-white/[0.06]"
      : "border-orange-100/80 bg-white/90 hover:bg-white"
  );

  const mutedText = isDark ? "text-white/55" : "text-slate-500";
  const strongText = isDark ? "text-white" : "text-slate-900";
  const statsGridClass = "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3";

  const getSummaryTone = (tone: SummaryItem["tone"]) => {
    if (tone === "primary") {
      return isDark
        ? "bg-blue-500/10 text-blue-300"
        : "bg-orange-50 text-orange-700";
    }

    if (tone === "warning") {
      return isDark
        ? "bg-amber-500/10 text-amber-300"
        : "bg-amber-50 text-amber-700";
    }

    return isDark
      ? "bg-emerald-500/10 text-emerald-300"
      : "bg-emerald-50 text-emerald-700";
  };

  const insurancePopupModal =
    isClient && insurancePopupOpen
      ? createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.25 }}
              className={cx(
                "relative w-full max-w-5xl overflow-hidden rounded-[28px] border shadow-2xl",
                isDark
                  ? "border-white/10 bg-slate-900 text-white"
                  : "border-orange-100 bg-white text-slate-900"
              )}
            >
              <button
                type="button"
                onClick={closeInsurancePopup}
                className={cx(
                  "absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
                  isDark
                    ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                    : "border-orange-100 bg-white text-slate-600 hover:bg-orange-50"
                )}
              >
                <X size={18} />
              </button>

              <div
                className={cx(
                  "px-6 py-6 sm:px-7 sm:py-7",
                  isDark
                    ? "bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(59,130,246,0.10))]"
                    : "bg-[linear-gradient(135deg,rgba(255,247,237,1),rgba(236,253,245,1))]"
                )}
              >
                <div className="flex items-start gap-4 pr-10">
                  <div
                    className={cx(
                      "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
                      isDark
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-emerald-50 text-emerald-700"
                    )}
                  >
                    <ShieldCheck size={28} />
                  </div>

                  <div>
                    <p
                      className={cx(
                        "text-xs font-semibold uppercase tracking-[0.18em]",
                        isDark ? "text-emerald-300" : "text-emerald-700"
                      )}
                    >
                      Insurance Eligible
                    </p>

                    <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                      {insurancePopupTitle}
                    </h2>

                    <p className={cx("mt-2 text-sm sm:text-base", mutedText)}>
                      {insurancePopupMessage}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-[340px_minmax(0,1fr)]">
                <div
                  className={cx(
                    "border-b px-6 py-5 lg:border-b-0 lg:border-r",
                    isDark
                      ? "border-white/10 bg-white/[0.02]"
                      : "border-orange-100 bg-orange-50/30"
                  )}
                >
                  <div className="mb-4">
                    <p className={cx("text-xs uppercase tracking-[0.18em]", mutedText)}>
                      Eligible Accounts
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">
                      Select Account
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {insuranceEligibleAccounts.map((item) => {
                      const isSelected =
                        selectedInsuranceAccount === item.accountNumber;

                      return (
                        <button
                          key={item.accountNumber}
                          type="button"
                          onClick={() => {
                            setSelectedInsuranceAccount(item.accountNumber);
                            setInsuranceClaimError("");
                            setInsuranceClaimSuccess("");
                          }}
                          className={cx(
                            "w-full rounded-2xl border p-4 text-left transition",
                            isSelected
                              ? isDark
                                ? "border-emerald-400/40 bg-emerald-500/10"
                                : "border-emerald-300 bg-emerald-50"
                              : isDark
                              ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]"
                              : "border-orange-100 bg-white hover:bg-orange-50"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className={cx("text-xs uppercase tracking-[0.16em]", mutedText)}>
                                Account
                              </p>
                              <p className="mt-1 text-base font-semibold">
                                {item.accountNumber}
                              </p>
                            </div>

                            <div
                              className={cx(
                                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                isDark
                                  ? "bg-white/8 text-white/80"
                                  : "bg-white text-slate-700"
                              )}
                            >
                              {item.unclaimedCount} unclaimed
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className={cx("text-xs uppercase tracking-[0.16em]", mutedText)}>
                              Claimable Amount
                            </p>
                            <p className="mt-1 text-lg font-bold">
                              {formatCurrency(
                                item.claimableAmount,
                                summary.currency || "USD"
                              )}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="px-6 py-5 sm:px-7 sm:py-6">
                  {selectedInsuranceAccount ? (
                    <>
                      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className={cx("text-xs uppercase tracking-[0.18em]", mutedText)}>
                            Selected Account
                          </p>
                          <h3 className="mt-1 text-xl font-bold">
                            {selectedInsuranceAccount}
                          </h3>
                          <p className={cx("mt-2 text-sm", mutedText)}>
                            Unclaimed insurance coverages for this account are shown below.
                          </p>
                        </div>

                        <div className="flex flex-col items-start gap-2 sm:items-end">
                          <div className="text-left sm:text-right">
                            <p className={cx("text-xs uppercase tracking-[0.18em]", mutedText)}>
                              Total Claimable
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                              {formatCurrency(
                                toNumber(
                                  insuranceClaimDetails?.totalClaimAmount ??
                                    selectedAccountSummary?.claimableAmount,
                                  0
                                ),
                                summary.currency || "USD"
                              )}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={
                              insuranceDetailsLoading ||
                              insuranceClaimLoading ||
                              !insuranceClaimDetails?.coverages?.length
                            }
                            onClick={() =>
                              openClaimDecision({
                                mt5Account: selectedInsuranceAccount,
                                claimType: "all",
                                coverageIds: (
                                  insuranceClaimDetails?.coverages || []
                                ).map((item) => item.coverageId),
                                claimAmount: toNumber(
                                  insuranceClaimDetails?.totalClaimAmount,
                                  0
                                ),
                              })
                            }
                            className={cx(
                              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                              insuranceDetailsLoading ||
                                insuranceClaimLoading ||
                                !insuranceClaimDetails?.coverages?.length
                                ? "cursor-not-allowed bg-slate-300 text-slate-600"
                                : isDark
                                ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            )}
                          >
                            <ShieldCheck
                              size={16}
                              className={cx(insuranceClaimLoading && "animate-pulse")}
                            />
                            Claim All
                          </button>
                        </div>
                      </div>

                      {insuranceClaimError ? (
                        <div
                          className={cx(
                            "mb-4 rounded-2xl border px-4 py-3 text-sm",
                            isDark
                              ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
                              : "border-rose-200 bg-rose-50 text-rose-700"
                          )}
                        >
                          {insuranceClaimError}
                        </div>
                      ) : null}

                      {insuranceClaimSuccess ? (
                        <div
                          className={cx(
                            "mb-4 rounded-2xl border px-4 py-3 text-sm",
                            isDark
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          )}
                        >
                          {insuranceClaimSuccess}
                        </div>
                      ) : null}

                      {insuranceDetailsLoading ? (
                        <div
                          className={cx(
                            "flex min-h-[240px] items-center justify-center rounded-2xl border",
                            isDark
                              ? "border-white/10 bg-white/[0.03]"
                              : "border-orange-100 bg-orange-50/30"
                          )}
                        >
                          <div className="inline-flex items-center gap-2 text-sm">
                            <RefreshCw size={16} className="animate-spin" />
                            Loading claim details...
                          </div>
                        </div>
                      ) : insuranceClaimDetails?.coverages?.length ? (
                        <div className="space-y-3">
                          {insuranceClaimDetails.coverages.map((coverage, index) => (
                            <div
                              key={`${coverage.coverageId}-${index}`}
                              className={cx(
                                "rounded-2xl border p-4",
                                isDark
                                  ? "border-white/10 bg-white/[0.04]"
                                  : "border-orange-100 bg-orange-50/40"
                              )}
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                  <p className={cx("text-xs uppercase tracking-[0.16em]", mutedText)}>
                                    Coverage ID
                                  </p>
                                  <p className="mt-1 break-all text-sm font-medium">
                                    {coverage.coverageId}
                                  </p>

                                  <p className={cx("mt-3 text-xs uppercase tracking-[0.16em]", mutedText)}>
                                    Claim Amount
                                  </p>
                                  <p className="mt-1 text-lg font-bold">
                                    {formatCurrency(
                                      coverage.claimAmount,
                                      summary.currency || "USD"
                                    )}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  disabled={
                                    insuranceClaimLoading ||
                                    claimingCoverageId === coverage.coverageId
                                  }
                                  onClick={() =>
                                    openClaimDecision({
                                      mt5Account: selectedInsuranceAccount,
                                      claimType: "single",
                                      coverageIds: [coverage.coverageId],
                                      claimAmount: toNumber(
                                        coverage.claimAmount,
                                        0
                                      ),
                                    })
                                  }
                                  className={cx(
                                    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:min-w-[130px]",
                                    insuranceClaimLoading ||
                                      claimingCoverageId === coverage.coverageId
                                      ? "cursor-not-allowed bg-slate-300 text-slate-600"
                                      : isDark
                                      ? "bg-blue-500 text-white hover:bg-blue-400"
                                      : "bg-blue-600 text-white hover:bg-blue-700"
                                  )}
                                >
                                  <Gift
                                    size={16}
                                    className={cx(
                                      claimingCoverageId === coverage.coverageId &&
                                        "animate-pulse"
                                    )}
                                  />
                                  {claimingCoverageId === coverage.coverageId
                                    ? "Claiming..."
                                    : "Claim"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          className={cx(
                            "rounded-2xl border px-4 py-8 text-center",
                            isDark
                              ? "border-white/10 bg-white/[0.03]"
                              : "border-orange-100 bg-orange-50/30"
                          )}
                        >
                          <p className="text-base font-semibold">
                            No unclaimed insurance found
                          </p>
                          <p className={cx("mt-2 text-sm", mutedText)}>
                            This account does not have any active insurance coverage to claim.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div
                      className={cx(
                        "flex min-h-[240px] items-center justify-center rounded-2xl border",
                        isDark
                          ? "border-white/10 bg-white/[0.03]"
                          : "border-orange-100 bg-orange-50/30"
                      )}
                    >
                      <p className={cx("text-sm", mutedText)}>
                        Select an account to view insurance claim details.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>,
          document.body
        )
      : null;

  const claimDecisionModal =
    isClient && claimDecisionOpen && pendingClaimAction
      ? createPortal(
          <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              className={cx(
                "w-full max-w-2xl rounded-[28px] border shadow-2xl",
                isDark
                  ? "border-white/10 bg-slate-900 text-white"
                  : "border-orange-100 bg-white text-slate-900"
              )}
            >
              <div
                className={cx(
                  "border-b px-6 py-5",
                  isDark ? "border-white/10" : "border-orange-100"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={cx(
                        "text-xs font-semibold uppercase tracking-[0.18em]",
                        isDark ? "text-blue-300" : "text-blue-700"
                      )}
                    >
                      Claim Decision
                    </p>
                    <h3 className="mt-1 text-2xl font-bold">
                      Insure this claimed amount?
                    </h3>
                    <p className={cx("mt-2 text-sm", mutedText)}>
                      You selected{" "}
                      <span className="font-semibold">
                        {formatCurrency(
                          pendingClaimAction.claimAmount,
                          summary.currency || "USD"
                        )}
                      </span>{" "}
                      from account{" "}
                      <span className="font-semibold">
                        {pendingClaimAction.mt5Account}
                      </span>
                      .
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeClaimDecision}
                    className={cx(
                      "inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
                      isDark
                        ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                        : "border-orange-100 bg-white text-slate-600 hover:bg-orange-50"
                    )}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                <div
                  className={cx(
                    "rounded-2xl border p-4",
                    isDark
                      ? "border-white/10 bg-white/[0.04]"
                      : "border-orange-100 bg-orange-50/40"
                  )}
                >
                  <p className="text-sm leading-7">
                    If you click <span className="font-semibold">Claim With Insurance</span>, you
                    will be redirected to the deposit page. That page will be
                    auto-filled with this claim amount, insurance will be applied
                    by default, and the user will only pay the insurance charge.
                  </p>

                  <p className="mt-3 text-sm leading-7">
                    If you click <span className="font-semibold">Claim Now</span>, the
                    insurance claim will be processed immediately from here.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  {/* <button
                    type="button"
                    onClick={closeClaimDecision}
                    className={cx(
                      "rounded-xl px-4 py-3 text-sm font-semibold transition",
                      isDark
                        ? "bg-white/5 text-white/80 hover:bg-white/10"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    Cancel
                  </button> */}

                  <button
                    type="button"
                    onClick={handleClaimWithoutInsurance}
                    disabled={insuranceClaimLoading}
                    className={cx(
                      "rounded-xl px-4 py-3 text-sm font-semibold transition",
                      insuranceClaimLoading
                        ? "cursor-not-allowed bg-slate-300 text-slate-600"
                        : isDark
                        ? "bg-blue-500 text-white hover:bg-blue-400"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    {insuranceClaimLoading ? "Processing..." : "Claim Now"}
                  </button>

                  <button
                    type="button"
                    onClick={handleClaimWithInsurance}
                    className={cx(
                      "rounded-xl px-4 py-3 text-sm font-semibold transition",
                      isDark
                        ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    )}
                  >
                    Claim With Insurance
                  </button>
                </div>
              </div>
            </motion.div>
          </div>,
          document.body
        )
      : null;

  return (
    <motion.div
      className="relative overflow-hidden px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        aria-hidden
        style={{
          background: isDark
            ? `
              radial-gradient(circle at 12% 18%, rgba(59,130,246,0.10), transparent 24%),
              radial-gradient(circle at 88% 0%, rgba(34,211,238,0.08), transparent 22%),
              radial-gradient(circle at 50% 100%, rgba(255,255,255,0.03), transparent 32%)
            `
            : `
              radial-gradient(circle at 14% 20%, rgba(251,146,60,0.12), transparent 24%),
              radial-gradient(circle at 86% 0%, rgba(255,255,255,0.78), transparent 30%),
              linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.08))
            `,
        }}
      />

      <div className="relative z-[1] mx-auto flex max-w-7xl flex-col gap-5">
        <section className={cx("overflow-hidden", sectionShell)}>
          <div
            className={cx(
              "relative px-5 py-5 sm:px-6 sm:py-6",
              isDark
                ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]"
                : "bg-[linear-gradient(135deg,rgba(255,255,255,0.90),rgba(255,247,240,0.82))]"
            )}
          >
            <div
              className={cx(
                "pointer-events-none absolute inset-x-0 top-0 h-px",
                isDark
                  ? "bg-gradient-to-r from-transparent via-blue-300/30 to-transparent"
                  : "bg-gradient-to-r from-transparent via-orange-300/70 to-transparent"
              )}
            />

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div
                  className={cx(
                    "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]",
                    isDark
                      ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                      : "border-orange-200 bg-orange-50 text-orange-700"
                  )}
                >
                  <TrendingUp size={14} />
                  MT5 Overall Summary Dashboard
                </div>

                <h1
                  className={cx(
                    "text-2xl font-bold tracking-tight sm:text-3xl",
                    strongText
                  )}
                >
                  {greeting}, {loggedUser?.username || loggedUser?.name || "Trader"}
                </h1>

                <p className={cx("mt-2 max-w-2xl text-sm sm:text-[15px]", mutedText)}>
                  This dashboard gives you a complete overview of your trading
                  accounts in one place. You can quickly check your total balance,
                  equity, deposits, withdrawals, bonus wallet, and other earnings
                  to stay updated with your account activity.
                </p>

                {summary.hasMixedCurrencies ? (
                  <p className="mt-3 text-sm text-amber-500">
                    Multiple account currencies detected ({summary.currencies.join(", ")}).
                    Totals are combined directly, so backend normalization is recommended.
                  </p>
                ) : null}

                {errorText ? (
                  <p className="mt-3 text-sm text-rose-500">{errorText}</p>
                ) : null}
              </div>

              <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[320px] lg:items-end">
                <div className="flex w-full flex-col gap-3 sm:flex-row lg:justify-end">
                  <button
                    type="button"
                    onClick={loadDashboardSummary}
                    className={cx(
                      "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition",
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.07]"
                        : "border-orange-100 bg-white text-slate-700 hover:bg-orange-50"
                    )}
                  >
                    <RefreshCw
                      size={16}
                      className={cx(refreshing && "animate-spin")}
                    />
                    Refresh Summary
                  </button>
                </div>

                <div className="grid w-full gap-2 sm:grid-cols-3 lg:max-w-[640px]">
                  {miniSummary.map((item) => (
                    <div
                      key={item.title}
                      className={cx(
                        "rounded-2xl border px-4 py-3 backdrop-blur-md",
                        isDark
                          ? "border-white/10 bg-white/[0.04]"
                          : "border-orange-100 bg-white/80"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cx(
                            "flex h-8 w-8 items-center justify-center rounded-xl",
                            getSummaryTone(item.tone)
                          )}
                        >
                          {item.icon}
                        </div>

                        <div className="min-w-0">
                          <p
                            className={cx(
                              "text-[11px] uppercase tracking-[0.16em]",
                              mutedText
                            )}
                          >
                            {item.title}
                          </p>
                          <p className={cx("truncate text-sm font-semibold", strongText)}>
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={cx(sectionShell, "p-5 sm:p-6")}>
          <div className={statsGridClass}>
            {stats.map((item, index) => {
              const sparklineWidth = 4000;
              const sparklineHeight = 1000;

              const sparklinePoints = buildSparklinePoints(
                item.trend,
                sparklineWidth,
                sparklineHeight,
                10
              );

              const sparklinePath = buildLinePath(sparklinePoints);
              const sparklineAreaPath = buildAreaPath(
                sparklinePoints,
                sparklineHeight - 8
              );

              const areaId = `cardSparkArea-${index}`;
              const lineId = `cardSparkLine-${index}`;
              const glowId = `cardSparkGlow-${index}`;
              const glowLineId = `cardSparkGlowLine-${index}`;

              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  onClick={() => navigateToLink(item.link)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigateToLink(item.link);
                    }
                  }}
                  role={item.link ? "button" : undefined}
                  tabIndex={item.link ? 0 : -1}
                  className={cx(
                    metricShell,
                    item.link &&
                      "cursor-pointer hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                  )}
                >
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div
                      className={cx(
                        "absolute -right-6 top-4 h-24 w-24 rounded-full blur-3xl",
                        item.positive
                          ? isDark
                            ? "bg-emerald-400/20"
                            : "bg-orange-200/40"
                          : isDark
                          ? "bg-rose-400/15"
                          : "bg-rose-200/35"
                      )}
                    />

                    <div
                      className={cx(
                        "absolute right-5 top-5 h-px w-24",
                        item.positive
                          ? isDark
                            ? "bg-gradient-to-l from-cyan-300/45 to-transparent"
                            : "bg-gradient-to-l from-amber-400/45 to-transparent"
                          : isDark
                          ? "bg-gradient-to-l from-rose-300/40 to-transparent"
                          : "bg-gradient-to-l from-rose-400/35 to-transparent"
                      )}
                    />

                    <div
                      className={cx(
                        "absolute right-5 top-9 h-px w-16",
                        item.positive
                          ? isDark
                            ? "bg-gradient-to-l from-emerald-300/35 to-transparent"
                            : "bg-gradient-to-l from-orange-300/40 to-transparent"
                          : isDark
                          ? "bg-gradient-to-l from-rose-300/30 to-transparent"
                          : "bg-gradient-to-l from-rose-300/30 to-transparent"
                      )}
                    />

                    <div className="absolute right-[-50px] bottom-[-1px] h-[100px] w-[58%] opacity-95">
                      <svg
                        viewBox={`0 0 ${sparklineWidth} ${sparklineHeight}`}
                        className="h-full w-full"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <defs>
                          <linearGradient id={areaId} x1="0" y1="0" x2="1" y2="1">
                            <stop
                              offset="0%"
                              stopColor={
                                item.positive
                                  ? isDark
                                    ? "rgba(34,211,238,0.10)"
                                    : "rgba(245,158,11,0.10)"
                                  : isDark
                                  ? "rgba(251,113,133,0.10)"
                                  : "rgba(244,63,94,0.08)"
                              }
                            />
                            <stop
                              offset="70%"
                              stopColor={
                                item.positive
                                  ? isDark
                                    ? "rgba(74,222,128,0.06)"
                                    : "rgba(34,197,94,0.06)"
                                  : isDark
                                  ? "rgba(251,113,133,0.05)"
                                  : "rgba(244,63,94,0.04)"
                              }
                            />
                            <stop
                              offset="100%"
                              stopColor="rgba(255,255,255,0)"
                            />
                          </linearGradient>

                          <linearGradient id={lineId} x1="0" y1="0" x2="1" y2="0">
                            <stop
                              offset="0%"
                              stopColor={
                                item.positive
                                  ? isDark
                                    ? "rgba(74,222,128,0.55)"
                                    : "rgba(34,197,94,0.55)"
                                  : isDark
                                  ? "rgba(251,113,133,0.55)"
                                  : "rgba(239,68,68,0.50)"
                              }
                            />
                            <stop
                              offset="100%"
                              stopColor={
                                item.positive
                                  ? isDark
                                    ? "rgba(34,211,238,0.95)"
                                    : "rgba(245,158,11,0.95)"
                                  : isDark
                                  ? "rgba(251,113,133,0.90)"
                                  : "rgba(239,68,68,0.88)"
                              }
                            />
                          </linearGradient>

                          <linearGradient
                            id={glowLineId}
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                          >
                            <stop
                              offset="0%"
                              stopColor={
                                item.positive
                                  ? isDark
                                    ? "rgba(74,222,128,0.18)"
                                    : "rgba(34,197,94,0.16)"
                                  : isDark
                                  ? "rgba(251,113,133,0.18)"
                                  : "rgba(239,68,68,0.15)"
                              }
                            />
                            <stop
                              offset="100%"
                              stopColor={
                                item.positive
                                  ? isDark
                                    ? "rgba(34,211,238,0.42)"
                                    : "rgba(245,158,11,0.35)"
                                  : isDark
                                  ? "rgba(251,113,133,0.36)"
                                  : "rgba(239,68,68,0.30)"
                              }
                            />
                          </linearGradient>

                          <filter
                            id={glowId}
                            x="-50%"
                            y="-50%"
                            width="200%"
                            height="200%"
                          >
                            <feGaussianBlur stdDeviation="7" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        <path d={sparklineAreaPath} fill={`url(#${areaId})`} />

                        <path
                          d={sparklinePath}
                          fill="none"
                          stroke={`url(#${glowLineId})`}
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={0.9}
                          filter={`url(#${glowId})`}
                        />

                        <path
                          d={sparklinePath}
                          fill="none"
                          stroke={`url(#${lineId})`}
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <div
                      className={cx(
                        "absolute inset-y-0 left-0 w-[58%]",
                        isDark
                          ? "bg-gradient-to-r from-[rgba(10,14,24,0.88)] via-[rgba(10,14,24,0.62)] to-transparent"
                          : "bg-gradient-to-r from-[rgba(255,255,255,0.96)] via-[rgba(255,255,255,0.82)] to-transparent"
                      )}
                    />
                  </div>

                  <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 max-w-[68%]">
                        <p className={cx("text-sm", mutedText)}>{item.title}</p>
                        <h3
                          className={cx(
                            "mt-2 text-3xl font-bold leading-none tracking-tight",
                            strongText
                          )}
                        >
                          {item.value}
                        </h3>
                      </div>

                      <div
                        className={cx(
                          "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl backdrop-blur-md",
                          isDark
                            ? "bg-white/6 text-white/85"
                            : "bg-white/90 text-orange-700 shadow-[0_10px_22px_rgba(251,146,60,0.12)]"
                        )}
                      >
                        {item.icon}
                      </div>
                    </div>

                    <div className="flex items-end justify-between gap-3">
                      <span
                        className={cx(
                          "max-w-[72%] truncate rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md",
                          item.positive
                            ? isDark
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-emerald-50/95 text-emerald-700"
                            : isDark
                            ? "bg-rose-500/10 text-rose-300"
                            : "bg-rose-50/95 text-rose-700"
                        )}
                      >
                        {item.change}
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {insurancePopupModal}
        {claimDecisionModal}

        <AccountOpenTradesMarketSection />
      </div>
    </motion.div>
  );
}