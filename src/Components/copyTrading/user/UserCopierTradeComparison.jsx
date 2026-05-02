import React, { useMemo, useState } from "react";
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
      _status: status,
      _fallbackFromMaster: true,
    }));
};

const buildTradeRows = ({ input, account, mode, status }) => {
  const normalizedRows = normalizeTradeRows({
    input,
    account,
    mode,
  }).map((row) => ({
    ...row,
    _status: status,
  }));

  if (mode !== "copier") {
    return normalizedRows;
  }

  if (normalizedRows.length > 0) {
    return normalizedRows;
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

const TradeTableSection = ({ isDark, title, account, rows }) => {
  return (
    <div
      className={cx(
        "rounded-[24px] border p-4",
        isDark
          ? "border-white/10 bg-white/[0.035]"
          : "border-emerald-100 bg-white shadow-[0_10px_26px_rgba(16,185,129,0.07)]"
      )}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3
            className={cx(
              "text-base font-bold",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            {title}
          </h3>

          <p
            className={cx(
              "mt-1 text-sm",
              isDark ? "text-white/50" : "text-slate-500"
            )}
          >
            Account: <b>{account || "-"}</b>
          </p>
        </div>

        <span
          className={cx(
            "w-fit rounded-full px-3 py-1 text-xs font-bold",
            isDark
              ? "bg-white/[0.06] text-white/70"
              : "bg-emerald-50 text-emerald-700"
          )}
        >
          {rows.length} Trades
        </span>
      </div>

      {rows.length === 0 ? (
        <CopyTradingEmptyState
          isDark={isDark}
          title="No trades"
          subtitle="No trade data found for this account."
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
          minWidth="1100px"
          renderRow={(row, index) => {
            const profit = Number(getTradeProfit(row) || 0);

            return (
              <tr
                key={`${getTradeTicket(row)}-${getTradeAccount(row)}-${index}`}
                className={cx(
                  "border-t",
                  isDark ? "border-white/10" : "border-emerald-100"
                )}
              >
                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={cx(
                      "rounded-full px-2.5 py-1 text-xs font-bold capitalize",
                      row?._status === "open"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {row?._status || "-"}
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
                      ? "text-emerald-600"
                      : profit < 0
                      ? "text-red-500"
                      : isDark
                      ? "text-white"
                      : "text-slate-900"
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

const UserCopierTradeComparison = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [copierAccount, setCopierAccount] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadTrades = async () => {
    const cleanCopierAccount = String(copierAccount || "").trim();

    if (!cleanCopierAccount) {
      toast.error("Enter copier account");
      return;
    }

    try {
      setLoading(true);
      setData(null);

      const userRes = await copyTradingApi.getMeUser();
      const user = getNestedUser(userRes);
      const userId = getUserIdFromUser(user);

      const res = await copyTradingApi.userCopierVsMasterTrades({
        userId,
        copierAccount: cleanCopierAccount,
        page: 1,
        page_size: 20,
      });

      const payload = getPayloadData(res);

      setData(payload);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load copier trades"
      );
    } finally {
      setLoading(false);
    }
  };

  const finalCopierAccount = data?.copier?.account || copierAccount;
  const finalMasterAccount =
    data?.master?.account ||
    data?.copier?.details?.data?.masterId ||
    data?.copier?.details?.masterId ||
    "";

  const copierRows = useMemo(() => {
    if (!data) return [];

    const openRows = buildTradeRows({
      input: data?.copier?.open,
      account: finalCopierAccount,
      mode: "copier",
      status: "open",
    });

    const closedRows = buildTradeRows({
      input: data?.copier?.closed,
      account: finalCopierAccount,
      mode: "copier",
      status: "closed",
    });

    return [...openRows, ...closedRows];
  }, [data, finalCopierAccount]);

  const masterRows = useMemo(() => {
    if (!data) return [];

    const openRows = buildTradeRows({
      input: data?.master?.open,
      account: finalMasterAccount,
      mode: "master",
      status: "open",
    });

    const closedRows = buildTradeRows({
      input: data?.master?.closed,
      account: finalMasterAccount,
      mode: "master",
      status: "closed",
    });

    return [...openRows, ...closedRows];
  }, [data, finalMasterAccount]);

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <div
        className={cx(
          "grid grid-cols-1 gap-3 rounded-[22px] border p-4 lg:grid-cols-[1fr_140px]",
          isDark
            ? "border-white/10 bg-white/[0.035]"
            : "border-emerald-100 bg-white/90"
        )}
      >
        <input
          value={copierAccount}
          onChange={(event) => setCopierAccount(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              loadTrades();
            }
          }}
          placeholder="Enter copier account"
          className={cx(
            "rounded-2xl border px-4 py-3 text-sm outline-none",
            isDark
              ? "border-white/10 bg-slate-950 text-white placeholder:text-white/40"
              : "border-emerald-100 bg-white text-slate-900 placeholder:text-slate-400"
          )}
        />

        <button
          type="button"
          onClick={loadTrades}
          disabled={loading}
          className={cx(
            "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60",
            loading ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"
          )}
        >
          <Search className="h-4 w-4" />
          {loading ? "Loading" : "Search"}
        </button>
      </div>

      {loading ? (
        <div
          className={cx(
            "rounded-[22px] border p-5 text-sm",
            isDark
              ? "border-white/10 bg-white/[0.035] text-white/70"
              : "border-emerald-100 bg-white text-slate-600"
          )}
        >
          Loading copier and master trades...
        </div>
      ) : !data ? (
        <CopyTradingEmptyState
          isDark={isDark}
          title="No copier loaded"
          subtitle="Enter copier account to view copier and master trades."
        />
      ) : (
        <>
          <div
            className={cx(
              "grid grid-cols-1 gap-3 rounded-[22px] border p-4 text-sm md:grid-cols-4",
              isDark
                ? "border-white/10 bg-white/[0.035] text-white"
                : "border-emerald-100 bg-white text-slate-700"
            )}
          >
            <div>
              Copier Account: <b>{finalCopierAccount || "-"}</b>
            </div>

            <div>
              Master Account: <b>{finalMasterAccount || "-"}</b>
            </div>

            <div>
              Copier Trades: <b>{copierRows.length}</b>
            </div>

            <div>
              Master Trades: <b>{masterRows.length}</b>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <TradeTableSection
              isDark={isDark}
              title="Copier Trades"
              account={finalCopierAccount}
              rows={copierRows}
            />

            <TradeTableSection
              isDark={isDark}
              title="Master Trades"
              account={finalMasterAccount}
              rows={masterRows}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default UserCopierTradeComparison;