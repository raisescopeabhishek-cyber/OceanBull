import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Gift,
  RefreshCw,
  Server,
  ShieldCheck,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { userApi } from "@/utils/apiClients";
import { useMt5Accounts } from "@/hooks/useMt5Accounts";
import MonthlyTradeCommissionGraph from "./MonthlyTradeCommissionGraph";
import UserBonusUsageGauge from "./UserBonusUsageGauge";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  PageHeader,
  StatCard,
  Well,
} from "@/Components/ui";
import { ArrowDownCircle, CircleFadingPlus, Network } from "lucide-react";

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
  const accountIds = useMemo(
    () => (loggedUser?.accounts || []).map((account: any) => account.accountNumber),
    [loggedUser?.accounts]
  );
  const { data: allAccounts, byLogin } = useMt5Accounts(accountIds);
  const balancesLoaded = accountIds.every((id: string | number) => Number.isFinite(byLogin[String(id)]?.Balance));
  const equitiesLoaded = accountIds.every((id: string | number) => Number.isFinite(byLogin[String(id)]?.Equity));

  

  const isDark = mode === "dark";

  const [greeting, setGreeting] = useState("Welcome back");
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [recentDeposits, setRecentDeposits] = useState<any[]>([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState<any[]>([]);
  const [openTrades, setOpenTrades] = useState<any[]>([]);
  const [openTradesLoading, setOpenTradesLoading] = useState(false);
  const [openTradesError, setOpenTradesError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [financialSummary, setSummary] = useState<DashboardSummary>(
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

  // Live account ticks update only MT5 totals; history APIs load independently.
  const summary = useMemo(() => ({
    ...financialSummary,
    ...aggregateAccountOverview(allAccounts, financialSummary.currency),
    totalAccounts: accountIds.length,
  }), [financialSummary, allAccounts, accountIds.length]);

  const allServerNames = useMemo(() => {
    const names = (loggedUser?.accounts || [])
      .map((acc: any) =>
        acc?.serverName ||
        acc?.server ||
        acc?.mt5Server ||
        acc?.summary?.serverName ||
        ""
      )
      .filter(Boolean);

    return Array.from(new Set(names));
  }, [loggedUser?.accounts]);

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

      // Keep the rows as well: the dashboard lists recent activity, and
      // refetching the same endpoint for it would be wasteful.
      setRecentDeposits(payload);

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

      setRecentWithdrawals(payload);

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
        ...getEmptyDashboardSummary(baseCurrency),
        totalDeposit,
        totalWithdrawal,
        totalBonus,
        totalIbCommission,
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


  /* Poll the existing authenticated API; never present a failed request as flat. */
  useEffect(() => {
    setOpenTrades([]);
    setOpenTradesError("");
    if (!accountIds.length) {
      setOpenTradesLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    setOpenTradesLoading(true);

    const refreshTrades = async () => {
      try {
        const results = await Promise.allSettled(
          accountIds.map((id: any) =>
            userApi.get("/server-fetch-open-trade", {
              params: { MT5Accont: id },
              signal: controller.signal,
              timeout: 15000,
            })
          )
        );
        if (cancelled) return;
        const rows: any[] = [];
        let failures = 0;
        results.forEach((res: any, i) => {
          if (res.status !== "fulfilled" || res.value?.data?.success === false) {
            failures += 1;
            return;
          }
          const payload = res.value?.data;
          const list = Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload) ? payload : null;
          if (!list) { failures += 1; return; }
          list.forEach((item: any, index: number) => {
            const side = item?.BUY_SELL;
            rows.push({
              id: `${accountIds[i]}-${item?.Ticket ?? item?.ticket ?? index}`,
              symbol: String(item?.Symbol ?? item?.symbol ?? "—"),
              side: side === 0 || side === "0" ? "BUY" : side === 1 || side === "1" ? "SELL" : "—",
              lots: item?.Lot != null && Number.isFinite(Number(item.Lot))
                ? Number(item.Lot) : toNumber(item?.Volume, 0) / 10000,
              openPrice: item?.Open_Price ?? item?.openPrice ?? "—",
              currentPrice: item?.Current_Price ?? item?.currentPrice ?? null,
              profit: toNumber(item?.Profit, 0),
            });
          });
        });
        setOpenTrades(rows);
        setOpenTradesError(failures
          ? failures === accountIds.length
            ? "Unable to load open trades. Retrying automatically."
            : "Some accounts could not be loaded. Showing available positions; retrying automatically."
          : "");
      } catch {
        if (!cancelled) setOpenTradesError("Unable to refresh open trades. Retrying automatically.");
      } finally {
        if (!cancelled) {
          setOpenTradesLoading(false);
          timer = setTimeout(refreshTrades, 10000);
        }
      }
    };
    refreshTrades();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [accountIds]);


  const selectedAccountSummary = useMemo(() => {
    return insuranceEligibleAccounts.find(
      (item) => item.accountNumber === selectedInsuranceAccount
    );
  }, [insuranceEligibleAccounts, selectedInsuranceAccount]);

  const sectionShell = cx(
    "h-full rounded-card border backdrop-blur-xl","border-line bg-surface-2"
  );

  const metricShell = cx(
    "relative min-h-[182px] h-full overflow-hidden rounded-card border p-5 backdrop-blur-xl transition-all duration-300","border-line bg-surface-2 hover:bg-surface-2"
  );

  const mutedText ="text-subtle";
  const strongText ="text-text";
  const statsGridClass = "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3";

  const getSummaryTone = (tone: SummaryItem["tone"]) => {
    if (tone === "primary") {
      return "bg-primary-soft text-primary";
    }

    if (tone === "warning") {
      return "bg-primary-soft text-primary";
    }

    return "bg-success-soft text-success";
  };

  const insurancePopupModal =
    isClient && insurancePopupOpen
      ? createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.25 }}
              className={cx(
                "relative w-full max-w-5xl overflow-hidden rounded-card border","border-line bg-surface text-text"
              )}
            >
              <button
                type="button"
                onClick={closeInsurancePopup}
                className={cx(
                  "absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border transition","border-line bg-surface-2 text-muted hover:bg-surface-2"
                )}
              >
                <X size={18} />
              </button>

              <div
                className={cx(
                  "px-6 py-6 sm:px-7 sm:py-7",""
                )}
              >
                <div className="flex items-start gap-4 pr-10">
                  <div
                    className={cx(
                      "flex h-14 w-14 shrink-0 items-center justify-center rounded-card","bg-success-soft text-success"
                    )}
                  >
                    <ShieldCheck size={28} />
                  </div>

                  <div>
                    <p
                      className={cx(
                        "text-xs font-semibold uppercase tracking-[0.18em]","text-success"
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
                    "border-b px-6 py-5 lg:border-b-0 lg:border-r","border-line bg-surface-2"
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
                            "w-full rounded-card border p-4 text-left transition",
                            isSelected
                              ?"border-success bg-success-soft"
                              :"border-line bg-surface-2 hover:bg-surface-2"
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
                                "rounded-full px-2.5 py-1 text-[11px] font-semibold","bg-surface text-muted"
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
                              "inline-flex items-center gap-2 rounded-card px-4 py-2.5 text-sm font-semibold transition",
                              insuranceDetailsLoading ||
                                insuranceClaimLoading ||
                                !insuranceClaimDetails?.coverages?.length
                                ? "cursor-not-allowed bg-surface-3 text-muted"
                                :"bg-success text-text hover:bg-success"
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
                            "mb-4 rounded-card border px-4 py-3 text-sm","border-danger bg-danger-soft text-danger"
                          )}
                        >
                          {insuranceClaimError}
                        </div>
                      ) : null}

                      {insuranceClaimSuccess ? (
                        <div
                          className={cx(
                            "mb-4 rounded-card border px-4 py-3 text-sm","border-success bg-success-soft text-success"
                          )}
                        >
                          {insuranceClaimSuccess}
                        </div>
                      ) : null}

                      {insuranceDetailsLoading ? (
                        <div
                          className={cx(
                            "flex min-h-[240px] items-center justify-center rounded-card border","border-line bg-surface-2"
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
                                "rounded-card border p-4","border-line bg-surface-2"
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
                                    "inline-flex items-center justify-center gap-2 rounded-card px-4 py-2.5 text-sm font-semibold transition sm:min-w-[130px]",
                                    insuranceClaimLoading ||
                                      claimingCoverageId === coverage.coverageId
                                      ? "cursor-not-allowed bg-surface-3 text-muted"
                                      :"bg-primary text-text hover:bg-primary"
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
                            "rounded-card border px-4 py-8 text-center","border-line bg-surface-2"
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
                        "flex min-h-[240px] items-center justify-center rounded-card border","border-line bg-surface-2"
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
                "w-full max-w-2xl rounded-card border","border-line bg-surface text-text"
              )}
            >
              <div
                className={cx(
                  "border-b px-6 py-5","border-line"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={cx(
                        "text-xs font-semibold uppercase tracking-[0.18em]","text-primary"
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
                      "inline-flex h-10 w-10 items-center justify-center rounded-full border transition","border-line bg-surface-2 text-muted hover:bg-surface-2"
                    )}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                <div
                  className={cx(
                    "rounded-card border p-4","border-line bg-surface-2"
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
                      "rounded-card px-4 py-3 text-sm font-semibold transition","bg-surface-2 text-muted hover:bg-surface-2"
                    )}
                  >
                    Cancel
                  </button> */}

                  <button
                    type="button"
                    onClick={handleClaimWithoutInsurance}
                    disabled={insuranceClaimLoading}
                    className={cx(
                      "rounded-card px-4 py-3 text-sm font-semibold transition",
                      insuranceClaimLoading
                        ? "cursor-not-allowed bg-surface-3 text-muted"
                        :"bg-primary text-text hover:bg-primary"
                    )}
                  >
                    {insuranceClaimLoading ? "Processing..." : "Claim Now"}
                  </button>

                  <button
                    type="button"
                    onClick={handleClaimWithInsurance}
                    className={cx(
                      "rounded-card px-4 py-3 text-sm font-semibold transition","bg-success text-text hover:bg-success"
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

  /* The headline figure is equity, with balance and the funding totals
     beside it. The old cards carried placeholder sparkline arrays and
     developer notes ("Loaded from deposit API") as their captions; both are
     gone, because a chart drawn from invented numbers and a caption written
     for us are worse than none. */
  const equityTrend =
    summary.totalEquity > summary.totalBalance
      ? "up"
      : summary.totalEquity < summary.totalBalance
      ? "down"
      : "flat";

  const floating = summary.totalEquity - summary.totalBalance;

  /* ---------------------------------------------------------------- derived
     Figures the prototype's dashboard shows. Live balance and equity come
     from the MT5 socket, so each is reported as unavailable rather than as
     zero when that feed has not answered for an account. */
  const accountRows = useMemo(
    () =>
      (allAccounts || []).map((acct: any) => {
        const login = String(
          acct?.accountNumber ?? acct?.login ?? acct?.mt5Account ?? ""
        );
        const live = byLogin?.[login];
        const balance = Number(live?.Balance);
        const equity = Number(live?.Equity);
        const floating =
          Number.isFinite(balance) && Number.isFinite(equity)
            ? equity - balance
            : null;

        return {
          login,
          type: acct?.accountType || acct?.groupName || "—",
          leverage: acct?.leverage || "—",
          balance: Number.isFinite(balance) ? balance : null,
          equity: Number.isFinite(equity) ? equity : null,
          floating,
          status: String(acct?.groupName || "").toLowerCase().includes("demo")
            ? "Demo"
            : "Active",
        };
      }),
    [allAccounts, byLogin]
  );

  const liveTotals = useMemo(() => {
    let balance = 0;
    let equity = 0;
    let margin = 0;
    let marginFree = 0;
    let marginLevel: number | null = null;
    let any = false;

    accountIds.forEach((id: any) => {
      const live = byLogin?.[String(id)];
      if (!live) return;
      any = true;
      balance += Number(live.Balance) || 0;
      equity += Number(live.Equity) || 0;
      margin += Number(live.Margin) || 0;
      marginFree += Number(live.MarginFree) || 0;
      if (Number.isFinite(Number(live.MarginLevel))) {
        marginLevel = Math.max(marginLevel ?? 0, Number(live.MarginLevel));
      }
    });

    return { balance, equity, margin, marginFree, marginLevel, any };
  }, [accountIds, byLogin]);

  /* Recent activity: deposits and withdrawals merged, newest first. */
  const activity = useMemo(() => {
    const rows = [
      ...(recentDeposits || []).map((d: any) => ({
        kind: "Deposit",
        detail: [d?.method, d?.mt5Account && `to #${d.mt5Account}`]
          .filter(Boolean)
          .join(" "),
        amount: toNumber(d?.deposit ?? d?.amount, 0),
        status: d?.status || "pending",
        at: d?.createdAt || d?.updatedAt,
      })),
      ...(recentWithdrawals || []).map((w: any) => ({
        kind: "Payout",
        detail: [w?.method, w?.mt5Account && `from #${w.mt5Account}`]
          .filter(Boolean)
          .join(" "),
        amount: -toNumber(w?.amount, 0),
        status: w?.status || "pending",
        at: w?.createdAt || w?.updatedAt,
      })),
    ];

    return rows
      .sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime())
      .slice(0, 5);
  }, [recentDeposits, recentWithdrawals]);

  const money = (v: any) => formatCurrency(toNumber(v, 0), summary.currency);
  const dash = "—";

  const statusTone = (s: string) => {
    const v = String(s).toLowerCase();
    if (["approved", "completed", "active", "success"].includes(v)) return "success";
    if (["rejected", "failed", "declined"].includes(v)) return "danger";
    if (v === "demo") return "info";
    return "warning";
  };

  return (
    <>
      <PageHeader
        title={greeting + (loggedUser?.firstName ? `, ${loggedUser.firstName}` : "")}
        description="Here is where your accounts stand today."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("/user/transfer")}>
              Transfer
            </Button>
            <Button variant="secondary" onClick={() => navigate("/user/withdraw")}>
              Payout
            </Button>
            <Button onClick={() => navigate("/user/deposit")}>Fund account</Button>
          </>
        }
      />

      {errorText ? (
        <Card className="border-warning/40 bg-warning-soft px-5 py-3.5">
          <p className="text-[13px] text-warning">{errorText}</p>
        </Card>
      ) : null}

      {/* ---- hero + health ---- */}
      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="ob-contour flex flex-col gap-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[12.5px] text-subtle">
                Total balance across {accountRows.length}{" "}
                {accountRows.length === 1 ? "account" : "accounts"}
              </p>
              <p className="numeric mt-1.5 text-[34px] font-semibold leading-[1.1] tracking-[-0.025em]">
                {liveTotals.any ? money(liveTotals.balance) : dash}
              </p>
              <p className="mt-1.5 text-[13px] font-semibold">
                {liveTotals.any ? (
                  <>
                    <span
                      className={
                        liveTotals.equity - liveTotals.balance >= 0
                          ? "text-profit"
                          : "text-loss"
                      }
                    >
                      {liveTotals.equity - liveTotals.balance >= 0 ? "+" : ""}
                      {money(liveTotals.equity - liveTotals.balance)}
                    </span>
                    <span className="text-subtle">
                      {" "}
                      floating &middot; equity {money(liveTotals.equity)}
                    </span>
                  </>
                ) : (
                  <span className="text-subtle">
                    Waiting for live account data
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* The equity trend needs a history feed; until one is wired this
              states that plainly rather than drawing an invented line. */}
          <div className="grid min-h-[140px] place-items-center rounded-xl border border-dashed border-line bg-surface-2/60 px-4 py-6 text-center">
            <div>
              <p className="text-[13px] font-medium text-text">
                Equity history
              </p>
              <p className="mx-auto mt-1 max-w-[38ch] text-xs text-subtle">
                A balance and equity curve appears here once the account
                history feed is connected.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Well>
              <p className="text-[12.5px] text-subtle">Free margin</p>
              <p className="numeric mt-0.5 text-base font-semibold">
                {liveTotals.any ? money(liveTotals.marginFree) : dash}
              </p>
            </Well>
            <Well>
              <p className="text-[12.5px] text-subtle">Margin level</p>
              <p className="numeric mt-0.5 text-base font-semibold">
                {liveTotals.marginLevel != null
                  ? `${liveTotals.marginLevel.toFixed(1)}%`
                  : dash}
              </p>
            </Well>
            <Well>
              <p className="text-[12.5px] text-subtle">Open positions</p>
              <p className="numeric mt-0.5 text-base font-semibold">
                {openTradesLoading || openTradesError ? dash : openTrades.length}
              </p>
            </Well>
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            title="Account health"
            subtitle="Funding and verification status"
            actions={
              <Badge tone={loggedUser?.kycVerified ? "success" : "warning"}>
                {loggedUser?.kycVerified ? "Verified" : "KYC pending"}
              </Badge>
            }
          />
          <CardBody className="flex-1 pt-2">
            {!loggedUser?.kycVerified ? (
              <div className="mb-4 rounded-xl border border-warning/40 bg-warning-soft p-3.5">
                <p className="text-[13px] font-semibold text-warning">
                  Finish verification to withdraw
                </p>
                <p className="mt-1 text-xs text-muted">
                  Payouts stay on hold until your documents are approved.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2.5"
                  onClick={() => navigate("/user/account-details")}
                >
                  Complete KYC
                </Button>
              </div>
            ) : null}

            <dl className="flex flex-col">
              {[
                { k: "Deposited", v: money(summary.totalDeposit) },
                { k: "Withdrawn", v: money(summary.totalWithdrawal) },
                { k: "Bonus wallet", v: money(summary.totalBonus) },
                {
                  k: "Margin used",
                  v: liveTotals.any ? money(liveTotals.margin) : dash,
                },
                { k: "Accounts", v: String(accountRows.length) },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-b-0"
                >
                  <dt className="text-[13px] text-muted">{row.k}</dt>
                  <dd className="numeric text-[13px] font-semibold">{row.v}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
      </div>

      {/* ---- stat row ---- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total deposits"
          value={money(summary.totalDeposit)}
          tone="ok"
          icon={<CircleFadingPlus className="h-4 w-4" />}
          helper={`${(recentDeposits || []).length} requests`}
        />
        <StatCard
          label="Total payouts"
          value={money(summary.totalWithdrawal)}
          tone="warn"
          icon={<ArrowDownCircle className="h-4 w-4" />}
          helper={`${(recentWithdrawals || []).length} requests`}
        />
        <StatCard
          label="IB commission"
          value={money(summary.totalIbCommission)}
          tone="info"
          icon={<Network className="h-4 w-4" />}
        />
      </div>

      {/* ---- accounts + activity ---- */}
      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader
            title="MT5 accounts"
            subtitle="Balances update live from the trading server"
            actions={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate("/user/challenges")}
              >
                Open account
              </Button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {["Account", "Leverage", "Balance", "Equity", "Floating P/L", "Status"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`whitespace-nowrap border-b border-line bg-surface-2 px-5 py-2.5 text-xs font-semibold text-subtle ${
                          i >= 2 && i <= 4 ? "text-right" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {accountRows.length ? (
                  accountRows.map((a) => (
                    <tr
                      key={a.login}
                      className="transition-colors hover:bg-surface-3 [&:last-child>td]:border-b-0"
                    >
                      <td className="whitespace-nowrap border-b border-line px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-surface-3 text-[11px] font-bold text-muted">
                            MT5
                          </span>
                          <div>
                            <b className="numeric">#{a.login}</b>
                            <div className="text-xs text-subtle">{a.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b border-line px-5 py-3">
                        {a.leverage}
                      </td>
                      <td className="numeric whitespace-nowrap border-b border-line px-5 py-3 text-right">
                        {a.balance != null ? money(a.balance) : dash}
                      </td>
                      <td className="numeric whitespace-nowrap border-b border-line px-5 py-3 text-right">
                        {a.equity != null ? money(a.equity) : dash}
                      </td>
                      <td
                        className={`numeric whitespace-nowrap border-b border-line px-5 py-3 text-right ${
                          a.floating == null
                            ? "text-subtle"
                            : a.floating >= 0
                            ? "text-profit"
                            : "text-loss"
                        }`}
                      >
                        {a.floating == null
                          ? dash
                          : `${a.floating >= 0 ? "+" : ""}${money(a.floating)}`}
                      </td>
                      <td className="whitespace-nowrap border-b border-line px-5 py-3">
                        <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center">
                      <p className="font-medium">No trading accounts yet</p>
                      <p className="mt-1 text-[12.5px] text-subtle">
                        Open an account to start trading.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader
            title="Recent activity"
            subtitle="Deposits and payouts"
            actions={
              <button
                type="button"
                onClick={() => navigate("/user/transaction")}
                className="text-[13px] font-medium text-primary-text hover:underline"
              >
                View all
              </button>
            }
          />
          {activity.length ? (
            <div className="flex flex-col">
              {activity.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-b-0"
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9px] ${
                      row.amount >= 0
                        ? "bg-profit-soft text-profit"
                        : "bg-warning-soft text-warning"
                    }`}
                  >
                    {row.amount >= 0 ? (
                      <CircleFadingPlus className="h-4 w-4" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold">{row.kind}</p>
                    <p className="truncate text-xs text-subtle">
                      {row.detail || dash}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`numeric text-[13px] font-semibold ${
                        String(row.status).toLowerCase() === "rejected"
                          ? "text-subtle line-through"
                          : ""
                      }`}
                    >
                      {row.amount >= 0 ? "+" : ""}
                      {money(Math.abs(row.amount))}
                    </p>
                    <Badge tone={statusTone(row.status)} className="mt-1">
                      {row.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <p className="font-medium">No activity yet</p>
              <p className="mt-1 text-[12.5px] text-subtle">
                Deposits and payouts will appear here.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* ---- open trades ---- */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Open trades"
          subtitle="Across all accounts"
          actions={
            <Badge tone={openTradesError ? "warning" : openTrades.length ? "success" : "neutral"}>
              {openTradesLoading ? "Loading" : openTradesError ? "Unavailable" : openTrades.length ? "Auto-refresh" : "Flat"}
            </Badge>
          }
        />
        {openTradesError && <p role="alert" className="px-5 py-3 text-sm text-loss">{openTradesError}</p>}
        {openTrades.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {["Symbol", "Side", "Lots", "Open price", "Current", "P/L"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`whitespace-nowrap border-b border-line bg-surface-2 px-5 py-2.5 text-xs font-semibold text-subtle ${
                          i >= 2 ? "text-right" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {openTrades.map((t: any) => (
                  <tr
                    key={t.id}
                    className="transition-colors hover:bg-surface-3 [&:last-child>td]:border-b-0"
                  >
                    <td className="whitespace-nowrap border-b border-line px-5 py-3 font-semibold">
                      {t.symbol}
                    </td>
                    <td className="whitespace-nowrap border-b border-line px-5 py-3">
                      <Badge tone={t.side === "BUY" ? "success" : t.side === "SELL" ? "danger" : "neutral"} dot={false}>
                        {t.side}
                      </Badge>
                    </td>
                    <td className="numeric whitespace-nowrap border-b border-line px-5 py-3 text-right">
                      {Number(t.lots).toFixed(2)}
                    </td>
                    <td className="numeric whitespace-nowrap border-b border-line px-5 py-3 text-right">
                      {t.openPrice}
                    </td>
                    <td className="numeric whitespace-nowrap border-b border-line px-5 py-3 text-right">
                      {t.currentPrice ?? dash}
                    </td>
                    <td
                      className={`numeric whitespace-nowrap border-b border-line px-5 py-3 text-right font-semibold ${
                        toNumber(t.profit, 0) >= 0 ? "text-profit" : "text-loss"
                      }`}
                    >
                      {toNumber(t.profit, 0) >= 0 ? "+" : ""}
                      {money(t.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <p className="font-medium">
              {openTradesLoading ? "Loading open trades" : openTradesError ? "Open trades unavailable" : "No open trades"}
            </p>
            <p className="mt-1 text-[12.5px] text-subtle">
              Positions open on your MT5 accounts appear here.
            </p>
          </div>
        )}
      </Card>

      {/* Existing features the prototype does not cover. They keep their
          place below the sections it does specify. */}
      <UserBonusUsageGauge />
      <MonthlyTradeCommissionGraph />

      {insurancePopupModal}
    </>
  );
}
