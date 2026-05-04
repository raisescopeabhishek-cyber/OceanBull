import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  DollarSign,
  Filter,
  Percent,
  RefreshCw,
  RadioTower,
  RotateCcw,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { copyTradingApi } from "../api/copyTradingApi";
import {
  cx,
  formatDateTime,
  formatMoney,
  getNestedUser,
  getTradeClosePrice,
  getTradeOpenPrice,
  getTradeProfit,
  getTradeSymbol,
  getTradeTicket,
  getTradeTime,
  getTradeType,
  getTradeVolume,
  normalizeTradeRows,
  pickAccountNumber,
} from "../utils/copyTradingHelpers";
import CopyTradingEmptyState from "../shared/CopyTradingEmptyState";
import CopyTradingTable from "../shared/CopyTradingTable";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const toNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") return fallback;

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const formatPercent = (value) => {
  const number = toNumber(value, 0);

  return `${number.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`;
};

const formatSignedMoney = (value) => {
  const number = toNumber(value, 0);
  const sign = number > 0 ? "+" : "";

  return `${sign}${formatMoney(number)}`;
};

const getProfitAmount = (value) => {
  const number = toNumber(value, 0);
  return number > 0 ? number : 0;
};

const getLossAmount = (value) => {
  const number = toNumber(value, 0);
  return number < 0 ? Math.abs(number) : 0;
};

const getProfitClass = (value, isDark) => {
  const number = toNumber(value, 0);

  if (number > 0) return "text-emerald-500";
  if (number < 0) return "text-red-500";

  return isDark ? "text-white/60" : "text-slate-500";
};

const getUserMt5Accounts = (user) => {
  const output = [];

  const push = (value) => {
    if (!value) return;

    const account = String(value).trim();

    if (account && account !== "000" && !output.includes(account)) {
      output.push(account);
    }
  };

  push(user?.mt5Account);
  push(user?.MT5Account);
  push(user?.accountNumber);
  push(user?.account);
  push(user?.login);
  push(user?.Login);

  const accountArrays = [
    user?.accounts,
    user?.mt5Accounts,
    user?.tradingAccounts,
    user?.challenges,
    user?.liveAccounts,
  ];

  accountArrays.forEach((list) => {
    if (!Array.isArray(list)) return;

    list.forEach((item) => {
      if (typeof item === "string" || typeof item === "number") {
        push(item);
        return;
      }

      push(pickAccountNumber(item));
      push(item?.mt5Account);
      push(item?.MT5Account);
      push(item?.accountNumber);
      push(item?.account);
      push(item?.login);
      push(item?.Login);
    });
  });

  return output;
};

const getCopierAccount = (row) => {
  return String(
    row?.copierAccount ||
      row?.CopierAccount ||
      row?.copyAccount ||
      row?.CopyAccount ||
      row?.clientAccount ||
      row?.ClientAccount ||
      row?.login ||
      row?.Login ||
      row?.MT5Account ||
      row?.mt5Account ||
      row?.account ||
      ""
  ).trim();
};

const getMasterValue = (master, key, fallback = "-") => {
  return (
    master?.details?.[key] ??
    master?.raw?.masterAccount?.[key] ??
    master?.raw?.MasterAccount?.[key] ??
    master?.details?.data?.[key] ??
    master?.raw?.[key] ??
    master?.[key] ??
    fallback
  );
};

const getMasterAccount = (master) => {
  return String(
    master?.account ||
      getMasterValue(master, "login", "") ||
      getMasterValue(master, "Login", "") ||
      getMasterValue(master, "MT5Account", "") ||
      getMasterValue(master, "mt5Account", "") ||
      ""
  ).trim();
};

const getMasterName = (master) => {
  return String(
    getMasterValue(master, "name", "") ||
      getMasterValue(master, "nickname", "") ||
      getMasterValue(master, "NickName", "") ||
      "-"
  );
};

const getMasterCommission = (master) => {
  return toNumber(getMasterValue(master, "commission", 0), 0);
};

const getMasterMinInvest = (master) => {
  return toNumber(
    getMasterValue(master, "min_invest", 0) ||
      getMasterValue(master, "minInvest", 0) ||
      getMasterValue(master, "minimumInvestment", 0) ||
      0,
    0
  );
};

const getMasterCopiers = (master) => {
  return Array.isArray(master?.copiers) ? master.copiers : [];
};

const parseDateToTimestamp = (value) => {
  if (!value) return 0;

  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  if (typeof value === "number") {
    const timestamp = value < 10000000000 ? value * 1000 : value;
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  const cleanValue = String(value).trim();

  if (!cleanValue) return 0;

  if (/^\d+$/.test(cleanValue)) {
    const numberValue = Number(cleanValue);
    const timestamp =
      numberValue < 10000000000 ? numberValue * 1000 : numberValue;
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  const normalizedValue = cleanValue.includes("T")
    ? cleanValue
    : cleanValue.replace(" ", "T");

  const date = new Date(normalizedValue);

  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const formatAgoFromTimestamp = (timestamp) => {
  if (!timestamp) return "-";

  const diffMs = Date.now() - timestamp;

  if (diffMs < 0) return "Just now";

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  }

  return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
};

const getMasterCreatedTimestamp = (master) => {
  const candidates = [
    master?.created_at,
    master?.createdAt,
    master?.CreatedAt,
    master?.created_date,
    master?.createdDate,
    master?.updated_at,
    master?.updatedAt,
    master?.UpdatedAt,

    master?.details?.created_at,
    master?.details?.createdAt,
    master?.details?.CreatedAt,
    master?.details?.created_date,
    master?.details?.createdDate,
    master?.details?.updated_at,
    master?.details?.updatedAt,
    master?.details?.UpdatedAt,

    master?.raw?.created_at,
    master?.raw?.createdAt,
    master?.raw?.CreatedAt,
    master?.raw?.created_date,
    master?.raw?.createdDate,
    master?.raw?.updated_at,
    master?.raw?.updatedAt,
    master?.raw?.UpdatedAt,

    master?.raw?.masterAccount?.created_at,
    master?.raw?.masterAccount?.createdAt,
    master?.raw?.masterAccount?.CreatedAt,
    master?.raw?.masterAccount?.created_date,
    master?.raw?.masterAccount?.createdDate,
    master?.raw?.masterAccount?.updated_at,
    master?.raw?.masterAccount?.updatedAt,
    master?.raw?.masterAccount?.UpdatedAt,

    master?.raw?.MasterAccount?.created_at,
    master?.raw?.MasterAccount?.createdAt,
    master?.raw?.MasterAccount?.CreatedAt,
    master?.raw?.MasterAccount?.created_date,
    master?.raw?.MasterAccount?.createdDate,
  ];

  for (const value of candidates) {
    const timestamp = parseDateToTimestamp(value);

    if (timestamp) return timestamp;
  }

  return 0;
};

const getCopierCreatedTimestamp = (copier) => {
  const candidates = [
    copier?.created_at,
    copier?.createdAt,
    copier?.CreatedAt,
    copier?.created_date,
    copier?.createdDate,
    copier?.updated_at,
    copier?.updatedAt,
    copier?.UpdatedAt,
    copier?.details?.created_at,
    copier?.details?.createdAt,
    copier?.details?.CreatedAt,
  ];

  for (const value of candidates) {
    const timestamp = parseDateToTimestamp(value);

    if (timestamp) return timestamp;
  }

  return 0;
};

const formatTimestampDate = (timestamp) => {
  if (!timestamp) return "-";

  return new Date(timestamp).toLocaleString();
};

const formatMasterCreatedDate = (master) => {
  return formatTimestampDate(getMasterCreatedTimestamp(master));
};

const formatMasterCreatedAgo = (master) => {
  return formatAgoFromTimestamp(getMasterCreatedTimestamp(master));
};

const formatCopierCreatedDate = (copier) => {
  return formatTimestampDate(getCopierCreatedTimestamp(copier));
};

const formatCopierCreatedAgo = (copier) => {
  return formatAgoFromTimestamp(getCopierCreatedTimestamp(copier));
};

const getTradeMasterCommission = (row) => {
  return toNumber(
    row?.masterCommission ??
      row?.MasterCommission ??
      row?.master_commission ??
      row?.masterCommissionAmount ??
      row?.MasterCommissionAmount ??
      row?.commissionEarned ??
      row?.CommissionEarned ??
      row?.earnedCommission ??
      row?.EarnedCommission ??
      0,
    0
  );
};

const getTradeCommissionRate = (row, fallbackCommission = 0) => {
  return toNumber(
    row?.commissionRate ??
      row?.CommissionRate ??
      row?.commissionPercent ??
      row?.CommissionPercent ??
      row?.commission_percent ??
      row?.masterCommissionPercent ??
      row?.MasterCommissionPercent ??
      row?.commission ??
      row?.Commission ??
      fallbackCommission ??
      0,
    0
  );
};

const getTradeStatus = (row) => {
  const status =
    row?.__tradeStatus ||
    row?.tradeStatus ||
    row?.status ||
    row?.Status ||
    "";

  if (status) return String(status).toLowerCase();

  if (row?.Close_Time || row?.CloseTime || row?.closeTime) return "closed";

  return "open";
};

const calculateCommissionFromProfit = (profit, rate) => {
  const safeProfit = toNumber(profit, 0);
  const safeRate = toNumber(rate, 0);

  if (safeProfit <= 0 || safeRate <= 0) return 0;

  return (safeProfit * safeRate) / 100;
};

const getEffectiveTradeCommission = (row, fallbackCommission = 0) => {
  const apiCommission = getTradeMasterCommission(row);

  if (apiCommission !== 0) return apiCommission;

  const profit = toNumber(getTradeProfit(row), 0);
  const rate = getTradeCommissionRate(row, fallbackCommission);

  return calculateCommissionFromProfit(profit, rate);
};

const getTradeSourceAccount = (row, fallbackAccount = "") => {
  return String(
    row?.copierAccount ||
      row?.CopierAccount ||
      row?.copyAccount ||
      row?.CopyAccount ||
      row?.clientAccount ||
      row?.ClientAccount ||
      row?.copier ||
      row?.Copier ||
      row?.login ||
      row?.Login ||
      row?.MT5Account ||
      row?.mt5Account ||
      row?.account ||
      fallbackAccount ||
      ""
  ).trim();
};

const buildTradeCommissionSummary = ({
  rows = [],
  fallbackCommission = 0,
  fallbackCopierAccount = "",
}) => {
  const summary = {
    totalTrades: rows.length,
    openTrades: 0,
    closedTrades: 0,
    grossProfit: 0,
    grossLoss: 0,
    netProfit: 0,
    commission: 0,
    positiveProfitTrades: 0,
    lossTrades: 0,
    commissionRows: 0,
    byCopier: [],
  };

  const copierMap = new Map();

  rows.forEach((row) => {
    const status = getTradeStatus(row);
    const profit = toNumber(getTradeProfit(row), 0);
    const profitAmount = getProfitAmount(profit);
    const lossAmount = getLossAmount(profit);
    const commission = getEffectiveTradeCommission(row, fallbackCommission);
    const copierAccount = getTradeSourceAccount(row, fallbackCopierAccount);

    if (status === "closed") {
      summary.closedTrades += 1;
    } else {
      summary.openTrades += 1;
    }

    if (profit > 0) {
      summary.positiveProfitTrades += 1;
    }

    if (profit < 0) {
      summary.lossTrades += 1;
    }

    if (commission !== 0) {
      summary.commissionRows += 1;
    }

    summary.grossProfit += profitAmount;
    summary.grossLoss += lossAmount;
    summary.netProfit += profit;
    summary.commission += commission;

    if (copierAccount) {
      if (!copierMap.has(copierAccount)) {
        copierMap.set(copierAccount, {
          account: copierAccount,
          trades: 0,
          grossProfit: 0,
          grossLoss: 0,
          netProfit: 0,
          commission: 0,
        });
      }

      const item = copierMap.get(copierAccount);
      item.trades += 1;
      item.grossProfit += profitAmount;
      item.grossLoss += lossAmount;
      item.netProfit += profit;
      item.commission += commission;
    }
  });

  summary.byCopier = Array.from(copierMap.values()).sort(
    (a, b) => Math.abs(b.commission) - Math.abs(a.commission)
  );

  return summary;
};

const AgoBadge = ({ isDark, children }) => {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold",
        isDark
          ? "border-white/10 bg-white/[0.04] text-white/70"
          : "border-emerald-100 bg-emerald-50 text-emerald-700"
      )}
    >
      <Clock3 className="h-3.5 w-3.5" />
      {children}
    </span>
  );
};

const MiniStat = ({ isDark, icon, label, value, hint, tone = "emerald" }) => {
  const toneClass =
    tone === "red"
      ? isDark
        ? "border-red-400/20 bg-red-500/10 text-red-300"
        : "border-red-100 bg-red-50 text-red-700"
      : tone === "blue"
      ? isDark
        ? "border-sky-400/20 bg-sky-500/10 text-sky-300"
        : "border-sky-100 bg-sky-50 text-sky-700"
      : isDark
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
      : "border-emerald-100 bg-emerald-50 text-emerald-700";

  return (
    <div
      className={cx(
        "rounded-2xl border p-4",
        isDark
          ? "border-white/10 bg-white/[0.025]"
          : "border-emerald-100 bg-white/90"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={cx(
              "text-xs font-black uppercase tracking-[0.14em]",
              isDark ? "text-white/45" : "text-slate-500"
            )}
          >
            {label}
          </p>

          <p
            className={cx(
              "mt-2 text-xl font-black",
              isDark ? "text-white" : "text-slate-950"
            )}
          >
            {value}
          </p>

          {hint ? (
            <p
              className={cx(
                "mt-1 text-xs",
                isDark ? "text-white/45" : "text-slate-500"
              )}
            >
              {hint}
            </p>
          ) : null}
        </div>

        <div
          className={cx(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
            toneClass
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const TradeRows = ({
  isDark,
  rows,
  mode = "master",
  fallbackCommission = 0,
  fallbackCopierAccount = "",
}) => {
  const summary = useMemo(() => {
    return buildTradeCommissionSummary({
      rows,
      fallbackCommission,
      fallbackCopierAccount,
    });
  }, [rows, fallbackCommission, fallbackCopierAccount]);

  if (!rows.length) {
    return (
      <CopyTradingEmptyState
        isDark={isDark}
        title="No trades found"
        subtitle="No open or closed trades found for this account."
        minHeight="min-h-[190px]"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <MiniStat
          isDark={isDark}
          icon={<RadioTower className="h-4 w-4" />}
          label="Trades"
          value={summary.totalTrades}
          hint={`${summary.closedTrades} closed / ${summary.openTrades} open`}
          tone="blue"
        />

        <MiniStat
          isDark={isDark}
          icon={<TrendingUp className="h-4 w-4" />}
          label="Profit"
          value={formatMoney(summary.grossProfit)}
          hint={`${summary.positiveProfitTrades} profitable trades`}
          tone="emerald"
        />

        <MiniStat
          isDark={isDark}
          icon={<TrendingDown className="h-4 w-4" />}
          label="Loss"
          value={formatMoney(summary.grossLoss)}
          hint={`${summary.lossTrades} loss trades`}
          tone="red"
        />

        <MiniStat
          isDark={isDark}
          icon={<Wallet className="h-4 w-4" />}
          label="Master Commission"
          value={formatMoney(summary.commission)}
          hint={
            mode === "copier"
              ? "Earned from this copier"
              : "Direct/API commission"
          }
          tone="emerald"
        />

        <MiniStat
          isDark={isDark}
          icon={<Percent className="h-4 w-4" />}
          label="Commission Rate"
          value={formatPercent(fallbackCommission)}
          hint={`Net P/L: ${formatSignedMoney(summary.netProfit)}`}
          tone="blue"
        />
      </div>

      {mode === "copier" &&
        fallbackCommission > 0 &&
        summary.commission === 0 && (
          <div
            className={cx(
              "rounded-2xl border p-4 text-sm leading-6",
              isDark
                ? "border-yellow-400/20 bg-yellow-500/10 text-yellow-100"
                : "border-yellow-100 bg-yellow-50 text-yellow-800"
            )}
          >
            <b>Commission is showing 0.</b> Commission is calculated only on
            profitable trades. When a positive profit trade is available, the
            estimated commission will be calculated using: Profit × Commission%.
          </div>
        )}

      <CopyTradingTable
        isDark={isDark}
        minWidth="1380px"
        columns={[
          "Ticket",
          "Account",
          "Symbol",
          "Type",
          "Volume",
          "Open Price",
          "Close Price",
          "Profit",
          "Loss",
          "Rate %",
          "Master Commission",
          "Status",
          "Time",
        ]}
        rows={rows}
        emptyTitle="No trades found"
        emptySubtitle="No trade data found for this account."
        renderRow={(row, index) => {
          const profit = toNumber(getTradeProfit(row), 0);
          const profitAmount = getProfitAmount(profit);
          const lossAmount = getLossAmount(profit);
          const commissionRate = getTradeCommissionRate(
            row,
            fallbackCommission
          );
          const commission = getEffectiveTradeCommission(
            row,
            fallbackCommission
          );
          const account = getTradeSourceAccount(row, fallbackCopierAccount);
          const status = getTradeStatus(row);

          return (
            <tr
              key={`${getTradeTicket(row)}-${index}`}
              className={cx(
                "border-t transition-colors",
                isDark
                  ? "border-white/10 hover:bg-white/[0.035]"
                  : "border-emerald-100 hover:bg-emerald-50/40"
              )}
            >
              <td className="whitespace-nowrap px-4 py-4 font-bold">
                {getTradeTicket(row)}
              </td>

              <td className="whitespace-nowrap px-4 py-4">
                {account || "-"}
              </td>

              <td className="whitespace-nowrap px-4 py-4">
                {getTradeSymbol(row)}
              </td>

              <td className="whitespace-nowrap px-4 py-4">
                {getTradeType(row)}
              </td>

              <td className="whitespace-nowrap px-4 py-4">
                {getTradeVolume(row)}
              </td>

              <td className="whitespace-nowrap px-4 py-4">
                {getTradeOpenPrice(row)}
              </td>

              <td className="whitespace-nowrap px-4 py-4">
                {getTradeClosePrice(row)}
              </td>

              <td
                className={cx(
                  "whitespace-nowrap px-4 py-4 font-black",
                  profitAmount > 0
                    ? "text-emerald-500"
                    : isDark
                    ? "text-white/35"
                    : "text-slate-400"
                )}
              >
                {profitAmount > 0 ? formatMoney(profitAmount) : "-"}
              </td>

              <td
                className={cx(
                  "whitespace-nowrap px-4 py-4 font-black",
                  lossAmount > 0
                    ? "text-red-500"
                    : isDark
                    ? "text-white/35"
                    : "text-slate-400"
                )}
              >
                {lossAmount > 0 ? formatMoney(lossAmount) : "-"}
              </td>

              <td className="whitespace-nowrap px-4 py-4 font-bold">
                {commissionRate ? formatPercent(commissionRate) : "-"}
              </td>

              <td
                className={cx(
                  "whitespace-nowrap px-4 py-4 font-black",
                  commission > 0
                    ? "text-emerald-500"
                    : isDark
                    ? "text-white/45"
                    : "text-slate-400"
                )}
              >
                {formatMoney(commission)}
              </td>

              <td className="whitespace-nowrap px-4 py-4">
                <span
                  className={cx(
                    "rounded-full border px-2.5 py-1 text-xs font-black uppercase",
                    status === "closed"
                      ? isDark
                        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                        : "border-emerald-100 bg-emerald-50 text-emerald-700"
                      : isDark
                      ? "border-sky-400/20 bg-sky-500/10 text-sky-300"
                      : "border-sky-100 bg-sky-50 text-sky-700"
                  )}
                >
                  {status}
                </span>
              </td>

              <td className="whitespace-nowrap px-4 py-4">
                {formatDateTime(getTradeTime(row))}
              </td>
            </tr>
          );
        }}
        footer={
          <tr
            className={cx(
              "border-t text-sm font-black",
              isDark
                ? "border-white/10 bg-white/[0.035] text-white"
                : "border-emerald-100 bg-emerald-50/80 text-slate-950"
            )}
          >
            <td className="px-4 py-4" colSpan={7}>
              Total
            </td>

            <td className="whitespace-nowrap px-4 py-4 text-emerald-500">
              {formatMoney(summary.grossProfit)}
            </td>

            <td className="whitespace-nowrap px-4 py-4 text-red-500">
              {formatMoney(summary.grossLoss)}
            </td>

            <td className="whitespace-nowrap px-4 py-4">
              {formatPercent(fallbackCommission)}
            </td>

            <td className="whitespace-nowrap px-4 py-4 text-emerald-500">
              {formatMoney(summary.commission)}
            </td>

            <td className="px-4 py-4" colSpan={2}>
              Net P/L:{" "}
              <span className={getProfitClass(summary.netProfit, isDark)}>
                {formatSignedMoney(summary.netProfit)}
              </span>{" "}
              · {summary.commissionRows} commission rows
            </td>
          </tr>
        }
      />
    </div>
  );
};

const AccountTradePanel = ({
  isDark,
  userId,
  account,
  mode = "master",
  fallbackCommission = 0,
  fallbackCopierAccount = "",
}) => {
  const [status, setStatus] = useState("closed");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseInfo, setResponseInfo] = useState(null);

  const loadTrades = async (nextStatus = status) => {
    if (!account) return;

    try {
      setLoading(true);

      const res = await copyTradingApi.userAccountTrades({
        userId,
        account,
        status: nextStatus,
        page: 1,
        page_size: 50,
      });

      const payload = res?.data || res?.data?.data || res || {};
      const rawRows = payload?.rows || payload?.data?.rows || payload;

      const normalized = normalizeTradeRows({
        input: rawRows,
        account,
        mode,
      });

      setRows(normalized);
      setResponseInfo({
        account: payload?.account || account,
        role: payload?.role || mode,
        linkedMasterAccount: payload?.linkedMasterAccount || "",
        selectedStatus: payload?.selectedStatus || nextStatus,
        count: res?.meta?.count || payload?.meta?.count || normalized.length,
      });
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to load trades");
      setRows([]);
      setResponseInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const summary = useMemo(() => {
    return buildTradeCommissionSummary({
      rows,
      fallbackCommission,
      fallbackCopierAccount,
    });
  }, [rows, fallbackCommission, fallbackCopierAccount]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {["open", "closed", "all"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setStatus(item);
                loadTrades(item);
              }}
              className={cx(
                "rounded-xl border px-4 py-2 text-xs font-bold capitalize",
                status === item
                  ? "border-emerald-400 bg-emerald-500 text-white"
                  : isDark
                  ? "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
                  : "border-emerald-100 bg-white text-slate-600 hover:bg-emerald-50"
              )}
            >
              {item} Trades
            </button>
          ))}

          <button
            type="button"
            onClick={() => loadTrades(status)}
            disabled={loading}
            className={cx(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold disabled:opacity-60",
              isDark
                ? "border-white/10 bg-white/[0.04] text-white"
                : "border-emerald-100 bg-white text-emerald-700"
            )}
          >
            <RefreshCw
              className={cx("h-3.5 w-3.5", loading && "animate-spin")}
            />
            Refresh
          </button>
        </div>

        {responseInfo ? (
          <div
            className={cx(
              "rounded-xl border px-3 py-2 text-xs font-bold",
              isDark
                ? "border-white/10 bg-white/[0.04] text-white/70"
                : "border-emerald-100 bg-white text-slate-600"
            )}
          >
            {responseInfo.role} · {responseInfo.selectedStatus} ·{" "}
            {responseInfo.count} rows
          </div>
        ) : null}
      </div>

      {loading ? (
        <div
          className={cx(
            "rounded-2xl border p-5 text-sm font-bold",
            isDark
              ? "border-white/10 bg-white/[0.025] text-white/60"
              : "border-emerald-100 bg-white text-slate-500"
          )}
        >
          Loading trades...
        </div>
      ) : (
        <TradeRows
          isDark={isDark}
          rows={rows}
          mode={mode}
          fallbackCommission={fallbackCommission}
          fallbackCopierAccount={fallbackCopierAccount || account}
        />
      )}

      {mode === "copier" ? (
        <div
          className={cx(
            "rounded-2xl border p-4 text-sm",
            isDark
              ? "border-white/10 bg-white/[0.025] text-white/65"
              : "border-emerald-100 bg-white text-slate-600"
          )}
        >
          <b>Copier {fallbackCopierAccount || account}</b> estimated master
          commission:{" "}
          <span className="font-black text-emerald-500">
            {formatMoney(summary.commission)}
          </span>
        </div>
      ) : null}
    </div>
  );
};

const FilterInput = ({ isDark, value, onChange }) => {
  return (
    <div
      className={cx(
        "flex items-center gap-2 rounded-2xl border px-4 py-3",
        isDark
          ? "border-white/10 bg-white/[0.04] text-white"
          : "border-emerald-100 bg-white text-slate-900"
      )}
    >
      <Search className="h-4 w-4 text-emerald-600" />

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search master, copier, name, commission..."
        className={cx(
          "w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400",
          isDark ? "text-white" : "text-slate-900"
        )}
      />
    </div>
  );
};

const FilterSelect = ({ isDark, label, value, onChange, children }) => {
  return (
    <label className="space-y-2">
      <span
        className={cx(
          "text-xs font-black uppercase tracking-[0.14em]",
          isDark ? "text-white/45" : "text-slate-500"
        )}
      >
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cx(
          "w-full rounded-2xl border px-4 py-3 text-sm font-bold outline-none",
          isDark
            ? "border-white/10 bg-slate-950 text-white"
            : "border-emerald-100 bg-white text-slate-900"
        )}
      >
        {children}
      </select>
    </label>
  );
};

const PaginationButton = ({ isDark, disabled, onClick, children, label }) => {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-black transition-all disabled:cursor-not-allowed disabled:opacity-40",
        isDark
          ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
          : "border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50"
      )}
    >
      {children}
    </button>
  );
};

const UserMyMasterAccounts = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [userId, setUserId] = useState("");
  const [masters, setMasters] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [copierFilter, setCopierFilter] = useState("all");
  const [commissionFilter, setCommissionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const loadMasters = async () => {
    try {
      setLoading(true);

      const userRes = await copyTradingApi.getMeUser();
      const user = getNestedUser(userRes);

      const resolvedUserId = user?._id || user?.id || user?.userId || "";
      const accounts = getUserMt5Accounts(user);

      setUserId(resolvedUserId);

      if (!accounts.length) {
        setMasters([]);
        return;
      }

      const res = await copyTradingApi.userMyCopyAccounts({
        accounts,
      });

      const masterAccounts = Array.isArray(res?.data?.masterAccounts)
        ? res.data.masterAccounts
        : [];

      setMasters(masterAccounts);
      setPage(1);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to load master accounts");
      setMasters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasters();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchText, copierFilter, commissionFilter, sortBy, pageSize]);

  const totalCopiers = useMemo(() => {
    return masters.reduce((sum, master) => {
      return sum + getMasterCopiers(master).length;
    }, 0);
  }, [masters]);

  const averageCommission = useMemo(() => {
    if (!masters.length) return 0;

    const total = masters.reduce((sum, master) => {
      return sum + getMasterCommission(master);
    }, 0);

    return total / masters.length;
  }, [masters]);

  const filteredMasters = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let rows = masters.map((master, index) => ({
      master,
      index,
    }));

    if (search) {
      rows = rows.filter(({ master }) => {
        const masterAccount = getMasterAccount(master);
        const masterName = getMasterName(master);
        const commission = getMasterCommission(master);
        const minInvest = getMasterMinInvest(master);
        const createdDate = formatMasterCreatedDate(master);
        const createdAgo = formatMasterCreatedAgo(master);
        const copiers = getMasterCopiers(master);

        const copierText = copiers
          .map((copier) => {
            return [
              getCopierAccount(copier),
              copier?.name,
              copier?.Name,
              copier?.login,
              copier?.Login,
              formatCopierCreatedDate(copier),
              formatCopierCreatedAgo(copier),
            ].join(" ");
          })
          .join(" ");

        const fullText = [
          masterAccount,
          masterName,
          commission,
          minInvest,
          createdDate,
          createdAgo,
          copierText,
          JSON.stringify(master || {}),
        ]
          .join(" ")
          .toLowerCase();

        return fullText.includes(search);
      });
    }

    if (copierFilter !== "all") {
      rows = rows.filter(({ master }) => {
        const count = getMasterCopiers(master).length;

        if (copierFilter === "withCopiers") return count > 0;
        if (copierFilter === "noCopiers") return count === 0;
        if (copierFilter === "onePlus") return count >= 1;
        if (copierFilter === "twoPlus") return count >= 2;
        if (copierFilter === "fivePlus") return count >= 5;

        return true;
      });
    }

    if (commissionFilter !== "all") {
      rows = rows.filter(({ master }) => {
        const commission = getMasterCommission(master);

        if (commissionFilter === "free") return commission === 0;
        if (commissionFilter === "paid") return commission > 0;
        if (commissionFilter === "low") return commission > 0 && commission <= 5;
        if (commissionFilter === "medium")
          return commission > 5 && commission <= 15;
        if (commissionFilter === "high") return commission > 15;

        return true;
      });
    }

    rows.sort((a, b) => {
      const aTime = getMasterCreatedTimestamp(a.master);
      const bTime = getMasterCreatedTimestamp(b.master);
      const aAccount = Number(getMasterAccount(a.master) || 0);
      const bAccount = Number(getMasterAccount(b.master) || 0);
      const aCommission = getMasterCommission(a.master);
      const bCommission = getMasterCommission(b.master);
      const aCopiers = getMasterCopiers(a.master).length;
      const bCopiers = getMasterCopiers(b.master).length;
      const aMinInvest = getMasterMinInvest(a.master);
      const bMinInvest = getMasterMinInvest(b.master);

      if (sortBy === "oldest") {
        if (aTime !== bTime) return aTime - bTime;
        return a.index - b.index;
      }

      if (sortBy === "copiersHigh") return bCopiers - aCopiers;
      if (sortBy === "copiersLow") return aCopiers - bCopiers;
      if (sortBy === "commissionHigh") return bCommission - aCommission;
      if (sortBy === "commissionLow") return aCommission - bCommission;
      if (sortBy === "minInvestHigh") return bMinInvest - aMinInvest;
      if (sortBy === "minInvestLow") return aMinInvest - bMinInvest;
      if (sortBy === "accountAsc") return aAccount - bAccount;
      if (sortBy === "accountDesc") return bAccount - aAccount;

      if (bTime !== aTime) return bTime - aTime;
      return a.index - b.index;
    });

    return rows.map(({ master }) => master);
  }, [masters, searchText, copierFilter, commissionFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredMasters.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = filteredMasters.length ? (safePage - 1) * pageSize : 0;
  const endIndex = Math.min(startIndex + pageSize, filteredMasters.length);

  const paginatedMasters = useMemo(() => {
    return filteredMasters.slice(startIndex, endIndex);
  }, [filteredMasters, startIndex, endIndex]);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (searchText.trim()) count += 1;
    if (copierFilter !== "all") count += 1;
    if (commissionFilter !== "all") count += 1;
    if (sortBy !== "newest") count += 1;

    return count;
  }, [searchText, copierFilter, commissionFilter, sortBy]);

  const resetFilters = () => {
    setSearchText("");
    setCopierFilter("all");
    setCommissionFilter("all");
    setSortBy("newest");
    setPage(1);
  };

  const expandAllOnPage = () => {
    const next = {};

    paginatedMasters.forEach((master) => {
      const account = getMasterAccount(master);
      if (account) next[account] = true;
    });

    setExpanded((prev) => ({
      ...prev,
      ...next,
    }));
  };

  const collapseAllOnPage = () => {
    setExpanded((prev) => {
      const next = { ...prev };

      paginatedMasters.forEach((master) => {
        const account = getMasterAccount(master);
        if (account) delete next[account];
      });

      return next;
    });
  };

  if (loading) {
    return (
      <div
        className={cx(
          "p-5 text-sm",
          isDark ? "text-white/70" : "text-slate-600"
        )}
      >
        Loading your master accounts...
      </div>
    );
  }

  if (!masters.length) {
    return (
      <CopyTradingEmptyState
        isDark={isDark}
        title="No master account found"
        subtitle="Your CRM MT5 accounts are not currently registered as master accounts."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div
        className={cx(
          "grid grid-cols-1 gap-3 rounded-[22px] border p-4 md:grid-cols-4",
          isDark
            ? "border-white/10 bg-white/[0.035]"
            : "border-emerald-100 bg-white/90 shadow-[0_10px_24px_rgba(16,185,129,0.06)]"
        )}
      >
        <div
          className={cx(
            "rounded-2xl border p-4",
            isDark ? "border-white/10" : "border-emerald-100"
          )}
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <RadioTower className="h-4 w-4" />
            My Master Accounts
          </div>

          <div className="mt-2 text-2xl font-black">{masters.length}</div>
        </div>

        <div
          className={cx(
            "rounded-2xl border p-4",
            isDark ? "border-white/10" : "border-emerald-100"
          )}
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <Users className="h-4 w-4" />
            Total Linked Copiers
          </div>

          <div className="mt-2 text-2xl font-black">{totalCopiers}</div>
        </div>

        <div
          className={cx(
            "rounded-2xl border p-4",
            isDark ? "border-white/10" : "border-emerald-100"
          )}
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <DollarSign className="h-4 w-4" />
            Avg Commission
          </div>

          <div className="mt-2 text-2xl font-black">
            {formatPercent(averageCommission)}
          </div>
        </div>

        <div
          className={cx(
            "rounded-2xl border p-4",
            isDark ? "border-white/10" : "border-emerald-100"
          )}
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <Filter className="h-4 w-4" />
            Showing Results
          </div>

          <div className="mt-2 text-2xl font-black">
            {filteredMasters.length}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          className={cx(
            "text-sm",
            isDark ? "text-white/55" : "text-slate-500"
          )}
        >
          Showing{" "}
          <span className="font-bold">
            {filteredMasters.length ? startIndex + 1 : 0}-{endIndex}
          </span>{" "}
          of <span className="font-bold">{filteredMasters.length}</span>{" "}
          masters · Newest first by default
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={expandAllOnPage}
            disabled={!paginatedMasters.length}
            className={cx(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold disabled:opacity-50",
              isDark
                ? "border-white/10 bg-white/[0.04] text-white"
                : "border-emerald-100 bg-white text-emerald-700"
            )}
          >
            <ChevronDown className="h-3.5 w-3.5" />
            Expand Page
          </button>

          <button
            type="button"
            onClick={collapseAllOnPage}
            disabled={!paginatedMasters.length}
            className={cx(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold disabled:opacity-50",
              isDark
                ? "border-white/10 bg-white/[0.04] text-white"
                : "border-emerald-100 bg-white text-emerald-700"
            )}
          >
            <ChevronUp className="h-3.5 w-3.5" />
            Collapse Page
          </button>

          <button
            type="button"
            onClick={loadMasters}
            disabled={loading}
            className={cx(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold disabled:opacity-60",
              isDark
                ? "border-white/10 bg-white/[0.04] text-white"
                : "border-emerald-100 bg-white text-emerald-700"
            )}
          >
            <RefreshCw
              className={cx("h-3.5 w-3.5", loading && "animate-spin")}
            />
            Refresh Accounts
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setFiltersOpen((prev) => !prev)}
          className={cx(
            "flex w-full items-center justify-between gap-4 rounded-[22px] border p-4 text-left transition-all",
            isDark
              ? "border-white/10 bg-white/[0.035] text-white hover:bg-white/[0.06]"
              : "border-emerald-100 bg-white text-slate-950 shadow-[0_10px_24px_rgba(16,185,129,0.06)] hover:bg-emerald-50/40"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cx(
                "flex h-11 w-11 items-center justify-center rounded-2xl border",
                isDark
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-emerald-100 bg-emerald-50 text-emerald-700"
              )}
            >
              <Filter className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-sm font-black">Search & Filters</h3>
              <p
                className={cx(
                  "mt-1 text-xs",
                  isDark ? "text-white/45" : "text-slate-500"
                )}
              >
                Search master/copier accounts, filter by copiers or commission,
                and sort results.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeFilterCount ? (
              <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white">
                {activeFilterCount} Active
              </span>
            ) : null}

            {filtersOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </button>

        {filtersOpen && (
          <div
            className={cx(
              "rounded-[24px] border p-4",
              isDark
                ? "border-white/10 bg-white/[0.03]"
                : "border-emerald-100 bg-white/95 shadow-[0_10px_26px_rgba(16,185,129,0.07)]"
            )}
          >
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_1fr_1fr_1fr_0.8fr_auto]">
              <FilterInput
                isDark={isDark}
                value={searchText}
                onChange={setSearchText}
              />

              <FilterSelect
                isDark={isDark}
                label="Copier Filter"
                value={copierFilter}
                onChange={setCopierFilter}
              >
                <option value="all">All Masters</option>
                <option value="withCopiers">With Copiers</option>
                <option value="noCopiers">No Copiers</option>
                <option value="onePlus">1+ Copier</option>
                <option value="twoPlus">2+ Copiers</option>
                <option value="fivePlus">5+ Copiers</option>
              </FilterSelect>

              <FilterSelect
                isDark={isDark}
                label="Commission"
                value={commissionFilter}
                onChange={setCommissionFilter}
              >
                <option value="all">All Commission</option>
                <option value="free">0% Commission</option>
                <option value="paid">Paid Commission</option>
                <option value="low">Low: 1% - 5%</option>
                <option value="medium">Medium: 6% - 15%</option>
                <option value="high">High: 15%+</option>
              </FilterSelect>

              <FilterSelect
                isDark={isDark}
                label="Sort By"
                value={sortBy}
                onChange={setSortBy}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="copiersHigh">Copiers High</option>
                <option value="copiersLow">Copiers Low</option>
                <option value="commissionHigh">Commission High</option>
                <option value="commissionLow">Commission Low</option>
                <option value="minInvestHigh">Min Invest High</option>
                <option value="minInvestLow">Min Invest Low</option>
                <option value="accountAsc">Account ↑</option>
                <option value="accountDesc">Account ↓</option>
              </FilterSelect>

              <FilterSelect
                isDark={isDark}
                label="Page Size"
                value={pageSize}
                onChange={(value) => setPageSize(Number(value))}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </FilterSelect>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className={cx(
                    "inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                      : "border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50"
                  )}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {!filteredMasters.length ? (
        <CopyTradingEmptyState
          isDark={isDark}
          title="No matching master accounts"
          subtitle="Try changing search text or filters."
        />
      ) : (
        <div className="space-y-4">
          {paginatedMasters.map((master, index) => {
            const masterAccount = getMasterAccount(master);
            const copiers = getMasterCopiers(master);
            const isOpen = Boolean(expanded[masterAccount]);
            const masterCreatedAgo = formatMasterCreatedAgo(master);
            const masterCommission = getMasterCommission(master);

            return (
              <div
                key={`${masterAccount}-${startIndex + index}`}
                className={cx(
                  "overflow-hidden rounded-[24px] border",
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-emerald-100 bg-white/95 shadow-[0_10px_26px_rgba(16,185,129,0.07)]"
                )}
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [masterAccount]: !prev[masterAccount],
                    }))
                  }
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                        Master Account
                      </p>

                      <AgoBadge isDark={isDark}>
                        Created {masterCreatedAgo}
                      </AgoBadge>

                      <span
                        className={cx(
                          "inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-black",
                          isDark
                            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                            : "border-emerald-100 bg-emerald-50 text-emerald-700"
                        )}
                      >
                        <Percent className="h-3.5 w-3.5" />
                        {formatPercent(masterCommission)} Commission
                      </span>
                    </div>

                    <h3 className="mt-2 text-xl font-black">
                      {masterAccount}
                    </h3>

                    <p
                      className={cx(
                        "mt-2 text-sm",
                        isDark ? "text-white/55" : "text-slate-500"
                      )}
                    >
                      Name: {getMasterName(master)} · Commission:{" "}
                      {formatPercent(masterCommission)} · Min Invest: $
                      {getMasterMinInvest(master)} · Copiers: {copiers.length}
                    </p>

                    <p
                      className={cx(
                        "mt-1 text-xs",
                        isDark ? "text-emerald-200/70" : "text-emerald-700"
                      )}
                    >
                      Created: {formatMasterCreatedDate(master)}
                    </p>
                  </div>

                  {isOpen ? <ChevronUp /> : <ChevronDown />}
                </button>

                {isOpen && (
                  <div
                    className={cx(
                      "space-y-5 border-t p-5",
                      isDark ? "border-white/10" : "border-emerald-100"
                    )}
                  >
                    <div>
                      <h4 className="mb-3 text-sm font-black">
                        Master Trades
                      </h4>

                      <AccountTradePanel
                        isDark={isDark}
                        userId={userId}
                        account={masterAccount}
                        mode="master"
                        fallbackCommission={masterCommission}
                        fallbackCopierAccount={masterAccount}
                      />
                    </div>

                    <div>
                      <h4 className="mb-3 text-sm font-black">
                        Linked Copiers ({copiers.length})
                      </h4>

                      {!copiers.length ? (
                        <CopyTradingEmptyState
                          isDark={isDark}
                          title="No linked copiers found"
                          subtitle="This master account does not have copier details in the current API response."
                          minHeight="min-h-[190px]"
                        />
                      ) : (
                        <div className="space-y-4">
                          {copiers.map((copier, copierIndex) => {
                            const copierAccount = getCopierAccount(copier);
                            const copierCreatedAgo =
                              formatCopierCreatedAgo(copier);

                            return (
                              <div
                                key={`${copierAccount}-${copierIndex}`}
                                className={cx(
                                  "rounded-[20px] border p-4",
                                  isDark
                                    ? "border-white/10 bg-slate-950/40"
                                    : "border-emerald-100 bg-emerald-50/40"
                                )}
                              >
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">
                                        Copier Account
                                      </p>

                                      <AgoBadge isDark={isDark}>
                                        Linked {copierCreatedAgo}
                                      </AgoBadge>

                                      <span
                                        className={cx(
                                          "inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-black",
                                          isDark
                                            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                                            : "border-emerald-100 bg-white text-emerald-700"
                                        )}
                                      >
                                        <Wallet className="h-3.5 w-3.5" />
                                        Rate {formatPercent(masterCommission)}
                                      </span>
                                    </div>

                                    <h5 className="mt-2 text-base font-black">
                                      {copierAccount || "-"}
                                    </h5>

                                    <p
                                      className={cx(
                                        "mt-1 text-xs",
                                        isDark
                                          ? "text-white/45"
                                          : "text-slate-500"
                                      )}
                                    >
                                      Created: {formatCopierCreatedDate(copier)}
                                    </p>
                                  </div>

                                  <div
                                    className={cx(
                                      "rounded-xl border px-3 py-2 text-xs font-bold",
                                      isDark
                                        ? "border-white/10 bg-white/[0.04] text-white/70"
                                        : "border-emerald-100 bg-white text-slate-600"
                                    )}
                                  >
                                    Master {masterAccount}
                                  </div>
                                </div>

                                {copierAccount ? (
                                  <AccountTradePanel
                                    isDark={isDark}
                                    userId={userId}
                                    account={copierAccount}
                                    mode="copier"
                                    fallbackCommission={masterCommission}
                                    fallbackCopierAccount={copierAccount}
                                  />
                                ) : (
                                  <CopyTradingEmptyState
                                    isDark={isDark}
                                    title="Copier account missing"
                                    subtitle="This copier row does not contain an MT5 account number."
                                    minHeight="min-h-[190px]"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div
            className={cx(
              "flex flex-col gap-3 rounded-[22px] border p-4 sm:flex-row sm:items-center sm:justify-between",
              isDark
                ? "border-white/10 bg-white/[0.035]"
                : "border-emerald-100 bg-white/95 shadow-[0_10px_24px_rgba(16,185,129,0.06)]"
            )}
          >
            <div>
              <p
                className={cx(
                  "text-sm font-bold",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                Page {safePage} / {totalPages}
              </p>

              <p
                className={cx(
                  "mt-1 text-xs",
                  isDark ? "text-white/45" : "text-slate-500"
                )}
              >
                Showing {filteredMasters.length ? startIndex + 1 : 0}-{endIndex}{" "}
                of {filteredMasters.length}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PaginationButton
                isDark={isDark}
                label="First page"
                disabled={safePage === 1}
                onClick={() => setPage(1)}
              >
                <ChevronsLeft className="h-4 w-4" />
              </PaginationButton>

              <PaginationButton
                isDark={isDark}
                label="Previous page"
                disabled={safePage === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </PaginationButton>

              <div
                className={cx(
                  "rounded-xl border px-4 py-2 text-sm font-black",
                  isDark
                    ? "border-white/10 bg-white/[0.04] text-white"
                    : "border-emerald-100 bg-emerald-50 text-emerald-700"
                )}
              >
                {safePage} / {totalPages}
              </div>

              <PaginationButton
                isDark={isDark}
                label="Next page"
                disabled={safePage === totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </PaginationButton>

              <PaginationButton
                isDark={isDark}
                label="Last page"
                disabled={safePage === totalPages}
                onClick={() => setPage(totalPages)}
              >
                <ChevronsRight className="h-4 w-4" />
              </PaginationButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMyMasterAccounts;