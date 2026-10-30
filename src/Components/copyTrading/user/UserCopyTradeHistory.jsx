import React, { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Search } from "lucide-react";

import { copyTradingApi } from "../api/copyTradingApi";
import {
  asArray,
  cx,
  formatDateTime,
  getNestedUser,
  getTradeAccount,
  getTradeClosePrice,
  getTradeOpenPrice,
  getTradeProfit,
  getTradeSymbol,
  getTradeTicket,
  getTradeTime,
  getTradeType,
  getTradeVolume,
  getUserIdFromUser,
  normalizeTradeRows,
} from "../utils/copyTradingHelpers";
import CopyTradingEmptyState from "../shared/CopyTradingEmptyState";
import CopyTradingTable from "../shared/CopyTradingTable";

const getPayloadData = (res) => {
  return res?.data?.data || res?.data || res || null;
};

const pickStatus = (row) => {
  const status = row?._tradeStatus || row?.__tradeStatus || row?.status || row?.type || "-";

  if (status === "close") return "closed";

  return String(status || "-");
};

const addStatusToRows = (rows = [], status = "open") => {
  return rows.map((row) => ({
    ...row,
    _tradeStatus: status,
  }));
};

const makeCopierFallbackRows = ({ input, copierAccount, status }) => {
  const rawRows = asArray(input);

  return rawRows
    .map((item) => item?.master_trade || item)
    .filter(Boolean)
    .map((trade) => ({
      ...trade,
      MT5Account: copierAccount,
      mt5Account: copierAccount,
      account: copierAccount,
      _tradeStatus: status,
      _fallbackFromMaster: true,
    }));
};

const buildCopierRowsFromComparison = ({ input, account, status }) => {
  const normalizedRows = normalizeTradeRows({
    input,
    account,
    mode: "copier",
  });

  if (normalizedRows.length > 0) {
    return addStatusToRows(normalizedRows, status);
  }

  const totalTrades = Number(input?.total_trades || 0);

  if (totalTrades <= 0) {
    return [];
  }

  return makeCopierFallbackRows({
    input,
    copierAccount: account,
    status,
  });
};

const filterRowsByTab = (rows = [], tab = "all") => {
  if (tab === "all") return rows;

  return rows.filter((row) => {
    const rowStatus = pickStatus(row).toLowerCase();

    if (tab === "open") return rowStatus === "open";
    if (tab === "closed") return rowStatus === "closed" || rowStatus === "close";

    return true;
  });
};

const UserCopyTradeHistory = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [account, setAccount] = useState("");
  const [tab, setTab] = useState("all");
  const [rows, setRows] = useState([]);
  const [accountInfo, setAccountInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadCopierFallbackTrades = async ({
    userId,
    cleanAccount,
    selectedStatus,
    currentInfo,
  }) => {
    const comparisonRes = await copyTradingApi.userCopierVsMasterTrades({
      userId,
      copierAccount: cleanAccount,
      page: 1,
      page_size: 50,
    });

    const comparisonData = getPayloadData(comparisonRes);

    const finalCopierAccount = comparisonData?.copier?.account || cleanAccount;
    const finalMasterAccount =
      comparisonData?.master?.account ||
      comparisonData?.copier?.details?.data?.masterId ||
      comparisonData?.copier?.details?.masterId ||
      currentInfo?.linkedMasterAccount ||
      "";

    const openRows = buildCopierRowsFromComparison({
      input: comparisonData?.copier?.open,
      account: finalCopierAccount,
      status: "open",
    });

    const closedRows = buildCopierRowsFromComparison({
      input: comparisonData?.copier?.closed,
      account: finalCopierAccount,
      status: "closed",
    });

    const finalRows = filterRowsByTab([...openRows, ...closedRows], selectedStatus);

    return {
      rows: finalRows,
      info: {
        account: finalCopierAccount,
        role: "copier",
        linkedMasterAccount: finalMasterAccount,
        selectedStatus,
        buckets: currentInfo?.buckets || [],
        isFallback: true,
      },
    };
  };

  const loadTrades = async () => {
    const cleanAccount = String(account || "").trim();

    if (!cleanAccount) {
      toast.error("Enter master or copier account");
      return;
    }

    try {
      setLoading(true);
      setRows([]);
      setAccountInfo(null);

      const userRes = await copyTradingApi.getMeUser();
      const user = getNestedUser(userRes);
      const userId = getUserIdFromUser(user);

      if (!userId) {
        toast.error("User not found");
        return;
      }

      const res = await copyTradingApi.userAccountTrades({
        userId,
        account: cleanAccount,
        status: tab,
        page: 1,
        page_size: 50,
      });

      const result = getPayloadData(res) || {};
      const apiRows = asArray(result?.rows);

      const baseInfo = {
        account: result?.account || cleanAccount,
        role: result?.role || "-",
        linkedMasterAccount: result?.linkedMasterAccount || "",
        selectedStatus: result?.selectedStatus || tab,
        buckets: result?.buckets || [],
        isFallback: false,
      };

      const hasBackendRows = apiRows.length > 0;
      const isCopier = String(baseInfo.role || "").toLowerCase() === "copier";
      const hasBucketTrades = asArray(baseInfo.buckets).some(
        (bucket) => Number(bucket?.total_trades || bucket?.count || 0) > 0
      );

      if (hasBackendRows) {
        setRows(apiRows);
        setAccountInfo(baseInfo);
        return;
      }

      if (isCopier && hasBucketTrades) {
        const fallback = await loadCopierFallbackTrades({
          userId,
          cleanAccount,
          selectedStatus: tab,
          currentInfo: baseInfo,
        });

        setRows(fallback.rows);
        setAccountInfo(fallback.info);
        return;
      }

      setRows([]);
      setAccountInfo(baseInfo);
    } catch (error) {
      console.error(error);

      setRows([]);
      setAccountInfo(null);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load trades. Please check account number."
      );
    } finally {
      setLoading(false);
    }
  };

  const emptySubtitle = account
    ? "No trades found for this account and selected filter."
    : "Enter master or copier account and search trade history.";

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <div
        className={cx(
          "grid grid-cols-1 gap-3 rounded-card border p-4 lg:grid-cols-[220px_1fr_140px]","border-line bg-surface-2"
        )}
      >
        <select
          value={tab}
          onChange={(event) => setTab(event.target.value)}
          className={cx(
            "rounded-card border px-4 py-3 text-sm outline-none","border-line bg-surface text-text"
          )}
        >
          <option value="all">All Trades</option>
          <option value="open">Open Trades</option>
          <option value="closed">Closed Trades</option>
        </select>

        <input
          value={account}
          onChange={(event) => setAccount(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              loadTrades();
            }
          }}
          placeholder="Enter master or copier account"
          className={cx(
            "rounded-card border px-4 py-3 text-sm outline-none","border-line bg-surface text-text placeholder:text-subtle"
          )}
        />

        <button
          type="button"
          onClick={loadTrades}
          disabled={loading}
          className={cx(
            "inline-flex items-center justify-center gap-2 rounded-card px-4 py-3 text-sm font-bold text-text disabled:cursor-not-allowed disabled:opacity-60",
            loading ? "bg-success" : "bg-success hover:bg-success"
          )}
        >
          <Search className="h-4 w-4" />
          {loading ? "Loading" : "Search"}
        </button>
      </div>

      {accountInfo && (
        <div
          className={cx(
            "grid grid-cols-1 gap-3 rounded-card border p-4 text-sm md:grid-cols-4","border-line bg-surface-2 text-text"
          )}
        >
          <div>
            Account: <b>{accountInfo.account}</b>
          </div>

          <div>
            Role: <b className="capitalize">{accountInfo.role}</b>
          </div>

          <div>
            Linked Master: <b>{accountInfo.linkedMasterAccount || "-"}</b>
          </div>

          <div>
            Trades: <b>{rows.length}</b>
          </div>
        </div>
      )}

      {loading ? (
        <div
          className={cx(
            "rounded-card border p-5 text-sm","border-line bg-surface-2 text-muted"
          )}
        >
          Loading trades...
        </div>
      ) : rows.length === 0 ? (
        <CopyTradingEmptyState
          isDark={isDark}
          title="No trades loaded"
          subtitle={emptySubtitle}
        />
      ) : (
        <CopyTradingTable
          isDark={isDark}
          columns={[
            "Status",
            "Ticket",
            "Account",
            "Symbol",
            "Type",
            "Lot",
            "Open Price",
            "Close Price",
            "Profit",
            "Time",
          ]}
          rows={rows}
          minWidth="1250px"
          renderRow={(row, index) => {
            const profit = Number(getTradeProfit(row) || 0);

            return (
              <tr
                key={`${getTradeTicket(row)}-${getTradeAccount(row)}-${index}`}
                className={cx(
                  "border-t","border-line"
                )}
              >
                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={cx(
                      "rounded-full px-2.5 py-1 text-xs font-bold capitalize",
                      pickStatus(row) === "open"
                        ? "bg-success-soft text-success"
                        : "bg-surface-3 text-muted"
                    )}
                  >
                    {pickStatus(row)}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-4 font-bold">
                  {getTradeTicket(row)}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  {getTradeAccount(row) || "-"}
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
                    "whitespace-nowrap px-4 py-4 font-bold",
                    profit > 0
                      ? "text-success"
                      : profit < 0
                      ? "text-danger"
                      :"text-text"
                  )}
                >
                  {getTradeProfit(row)}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  {formatDateTime(getTradeTime(row))}
                </td>
              </tr>
            );
          }}
        />
      )}
    </div>
  );
};

export default UserCopyTradeHistory;