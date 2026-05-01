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
  getUserIdFromUser,
} from "../utils/copyTradingHelpers";
import CopyTradingTable from "../shared/CopyTradingTable";
import CopyTradingEmptyState from "../shared/CopyTradingEmptyState";

const getTradeRows = (res) => {
  const data = res?.data || res;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.trades)) return data.trades;
  if (Array.isArray(data?.data?.trades)) return data.data.trades;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.result)) return data.result;

  return asArray(res);
};

const getTrade = (row) => {
  return row?.master_trade || row?.trade || row;
};

const getTradeType = (trade) => {
  const value = trade?.BUY_SELL ?? trade?.Action ?? trade?.type;

  if (Number(value) === 0) return "BUY";
  if (Number(value) === 1) return "SELL";

  return value ?? "-";
};

const getTradePrice = (trade, tab) => {
  if (tab === "open") {
    return trade?.Price_Current ?? trade?.Open_Price ?? trade?.Price ?? "-";
  }

  if (tab === "closed") {
    return trade?.Close_Price ?? trade?.Open_Price ?? trade?.Price ?? "-";
  }

  return (
    trade?.Price_Current ??
    trade?.Close_Price ??
    trade?.Open_Price ??
    trade?.Price ??
    "-"
  );
};

const AdminTradeMonitor = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [masterAccount, setMasterAccount] = useState("");
  const [tab, setTab] = useState("master");
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadTrades = async () => {
    if (!masterAccount) {
      toast.error("Enter master account");
      return;
    }

    try {
      setLoading(true);

      const meRes = await copyTradingApi.getMeUser().catch(() => null);
      const userId = getUserIdFromUser(getNestedUser(meRes));

      const payload = {
        userId,
        masterAccount,
        page: 1,
        page_size: 30,
      };

      const res =
        tab === "open"
          ? await copyTradingApi.adminOpenTrades(payload)
          : tab === "closed"
          ? await copyTradingApi.adminClosedTrades(payload)
          : tab === "all"
          ? await copyTradingApi.adminTradesPage(payload)
          : await copyTradingApi.adminMasterTrades(payload);

      const data = res?.data || res;

      setMeta({
        type: data?.type || tab,
        totalTrades: data?.total_trades ?? data?.totalTrades ?? 0,
        totalPages: data?.total_pages ?? data?.totalPages ?? 1,
        currentPage: data?.current_page ?? data?.currentPage ?? 1,
      });

      setRows(getTradeRows(res));
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to load trades");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <div
        className={cx(
          "grid grid-cols-1 gap-3 rounded-[22px] border p-4 lg:grid-cols-[220px_1fr_140px]",
          isDark
            ? "border-white/10 bg-white/[0.035]"
            : "border-emerald-100 bg-white/90"
        )}
      >
        <select
          value={tab}
          onChange={(event) => setTab(event.target.value)}
          className="rounded-2xl border px-4 py-3 text-sm outline-none"
        >
          <option value="master">Master Trades</option>
          <option value="all">All Trades</option>
          <option value="open">Open Trades</option>
          <option value="closed">Closed Trades</option>
        </select>

        <input
          value={masterAccount}
          onChange={(event) => setMasterAccount(event.target.value)}
          placeholder="Enter master account"
          className="rounded-2xl border px-4 py-3 text-sm outline-none"
        />

        <button
          type="button"
          onClick={loadTrades}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search className="h-4 w-4" />
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {meta ? (
        <div
          className={cx(
            "grid grid-cols-1 gap-3 rounded-[22px] border p-4 sm:grid-cols-4",
            isDark
              ? "border-white/10 bg-white/[0.035]"
              : "border-emerald-100 bg-white/90"
          )}
        >
          <div>
            <p className="text-xs text-slate-500">Type</p>
            <p className="font-bold capitalize">{meta.type}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Total Trades</p>
            <p className="font-bold">{meta.totalTrades}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Page</p>
            <p className="font-bold">{meta.currentPage}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Total Pages</p>
            <p className="font-bold">{meta.totalPages}</p>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="p-5 text-sm">Loading trades...</div>
      ) : rows.length === 0 ? (
        <CopyTradingEmptyState
          isDark={isDark}
          title="No trades loaded"
          subtitle="Enter master account and search trades."
        />
      ) : (
        <CopyTradingTable
          isDark={isDark}
          columns={[
            "Ticket",
            "MT5 Account",
            "Symbol",
            "Type",
            "Lot",
            "Volume",
            "Open Price",
            "Current / Close Price",
            "Profit",
            "Open Time",
            "Close Time",
            "Copiers",
          ]}
          rows={rows}
          minWidth="1400px"
          renderRow={(row, index) => {
            const trade = getTrade(row);
            const associatedTrades = Array.isArray(row?.associated_trades)
              ? row.associated_trades
              : [];

            return (
              <tr
                key={trade?.Ticket || trade?.ticket || trade?.id || index}
                className={cx(
                  "border-t",
                  isDark ? "border-white/10" : "border-emerald-100"
                )}
              >
                <td className="px-4 py-4 font-bold">
                  {trade?.Ticket || trade?.ticket || "-"}
                </td>

                <td className="px-4 py-4">
                  {trade?.MT5Account || trade?.mt5Account || "-"}
                </td>

                <td className="px-4 py-4">
                  {trade?.Symbol || trade?.symbol || "-"}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={cx(
                      "rounded-full px-3 py-1 text-xs font-bold",
                      getTradeType(trade) === "BUY"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-red-500/10 text-red-600"
                    )}
                  >
                    {getTradeType(trade)}
                  </span>
                </td>

                <td className="px-4 py-4">
                  {trade?.Lot ?? trade?.lot ?? "-"}
                </td>

                <td className="px-4 py-4">
                  {trade?.Volume ?? trade?.volume ?? "-"}
                </td>

                <td className="px-4 py-4">
                  {trade?.Open_Price ??
                    trade?.OpenPrice ??
                    trade?.PriceOpen ??
                    "-"}
                </td>

                <td className="px-4 py-4">
                  {getTradePrice(trade, tab)}
                </td>

                <td
                  className={cx(
                    "px-4 py-4 font-bold",
                    Number(trade?.Profit || trade?.profit || 0) >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  )}
                >
                  {trade?.Profit ?? trade?.profit ?? "0"}
                </td>

                <td className="px-4 py-4">
                  {formatDateTime(
                    trade?.Open_Time ||
                      trade?.OpenTime ||
                      trade?.Time ||
                      trade?.createdAt
                  )}
                </td>

                <td className="px-4 py-4">
                  {formatDateTime(
                    trade?.Close_Time ||
                      trade?.CloseTime ||
                      trade?.closedAt
                  )}
                </td>

                <td className="px-4 py-4">
                  {associatedTrades.length}
                </td>
              </tr>
            );
          }}
        />
      )}
    </div>
  );
};

export default AdminTradeMonitor;