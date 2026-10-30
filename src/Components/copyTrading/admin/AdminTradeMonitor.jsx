import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { RefreshCw, Search } from "lucide-react";

import { copyTradingApi } from "../api/copyTradingApi";
import {
  cx,
  formatDateTime,
  formatMoney,
  getTradeClosePrice,
  getTradeOpenPrice,
  getTradeProfit,
  getTradeSymbol,
  getTradeTicket,
  getTradeTime,
  getTradeType,
  getTradeVolume,
  normalizeTradeRows,
} from "../utils/copyTradingHelpers";
import CopyTradingEmptyState from "../shared/CopyTradingEmptyState";
import CopyTradingTable from "../shared/CopyTradingTable";
import { formatAgo, parseTimestamp } from "./adminCopyTradingHelpers";

const AdminTradeMonitor = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("auto");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTrades = async () => {
    const cleanAccount = String(account || "").trim();

    if (!cleanAccount) {
      toast.error("Enter MT5 account.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        account: cleanAccount,
        mt5Account: cleanAccount,
        MT5Account: cleanAccount,
        status,
        role,
        page: 1,
        page_size: 200,
      };

      let res;

      if (status === "open") {
        res = await copyTradingApi.adminOpenTrades(payload);
      } else if (status === "closed") {
        res = await copyTradingApi.adminClosedTrades(payload);
      } else {
        res = await copyTradingApi.adminTradeHistory(payload);
      }

      const normalized = normalizeTradeRows({
        input: res?.data?.rows || res?.data || res,
        account: cleanAccount,
        mode: role === "copier" ? "copier" : "master",
      });

      setRows(normalized);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to load trades");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    const output = rows
      .filter((row) => {
        if (!q) return true;
        return JSON.stringify(row || {}).toLowerCase().includes(q);
      })
      .sort((a, b) => {
        return parseTimestamp(getTradeTime(b)) - parseTimestamp(getTradeTime(a));
      });

    return output;
  }, [rows, search]);

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <div>
        <h1 className="text-2xl font-black">Trade History Search</h1>
        <p className={cx("mt-1 text-sm","text-subtle")}>
          Search master or copier trade history by account.
        </p>
      </div>

      <div
        className={cx(
          "grid grid-cols-1 gap-3 rounded-card border p-4 xl:grid-cols-[170px_170px_1fr_160px]","border-line bg-surface-2"
        )}
      >
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className={cx(
            "rounded-card border px-4 py-3 text-sm font-bold outline-none","border-line bg-surface text-text"
          )}
        >
          <option value="all">All Trades</option>
          <option value="open">Open Trades</option>
          <option value="closed">Closed Trades</option>
        </select>

        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className={cx(
            "rounded-card border px-4 py-3 text-sm font-bold outline-none","border-line bg-surface text-text"
          )}
        >
          <option value="auto">Auto Role</option>
          <option value="master">Master</option>
          <option value="copier">Copier</option>
        </select>

        <input
          value={account}
          onChange={(event) => setAccount(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") loadTrades();
          }}
          placeholder="Enter master/copier MT5 account"
          className={cx(
            "rounded-card border px-4 py-3 text-sm font-semibold outline-none","border-line bg-surface text-text"
          )}
        />

        <button
          type="button"
          onClick={loadTrades}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-card bg-success px-4 py-3 text-sm font-black text-text hover:bg-success disabled:opacity-60"
        >
          <Search className="h-4 w-4" />
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {!!rows.length && (
        <div
          className={cx(
            "grid grid-cols-1 gap-3 rounded-card border p-4 md:grid-cols-[1fr_auto]","border-line bg-surface-2"
          )}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter loaded trades by symbol, ticket, type..."
            className={cx(
              "rounded-card border px-4 py-3 text-sm font-semibold outline-none","border-line bg-surface text-text"
            )}
          />

          <button
            type="button"
            onClick={loadTrades}
            disabled={loading}
            className={cx(
              "inline-flex items-center justify-center gap-2 rounded-card border px-4 py-3 text-sm font-bold","border-line bg-surface-2 text-text"
            )}
          >
            <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-5 text-sm">Loading trades...</div>
      ) : !filteredRows.length ? (
        <CopyTradingEmptyState
          isDark={isDark}
          title="No trades loaded"
          subtitle="Enter account number and search trade history."
        />
      ) : (
        <CopyTradingTable
          isDark={isDark}
          rows={filteredRows}
          minWidth="1250px"
          columns={[
            "Ticket",
            "Symbol",
            "Type",
            "Volume",
            "Open",
            "Close",
            "Profit",
            "Time",
            "Ago",
          ]}
          renderRow={(row, index) => {
            const ticket = getTradeTicket(row);
            const profit = Number(getTradeProfit(row) || 0);
            const tradeTime = getTradeTime(row);

            return (
              <tr
                key={`${ticket}-${index}`}
                className={cx(
                  "border-t","border-line"
                )}
              >
                <td className="whitespace-nowrap px-4 py-4 font-black">{ticket}</td>
                <td className="whitespace-nowrap px-4 py-4">{getTradeSymbol(row)}</td>
                <td className="whitespace-nowrap px-4 py-4">{getTradeType(row)}</td>
                <td className="whitespace-nowrap px-4 py-4">{getTradeVolume(row)}</td>
                <td className="whitespace-nowrap px-4 py-4">{getTradeOpenPrice(row)}</td>
                <td className="whitespace-nowrap px-4 py-4">{getTradeClosePrice(row)}</td>
                <td
                  className={cx(
                    "whitespace-nowrap px-4 py-4 font-black",
                    profit > 0 ? "text-success" : profit < 0 ? "text-danger" : ""
                  )}
                >
                  {formatMoney(profit)}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  {formatDateTime(tradeTime)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-bold text-success">
                  {formatAgo(tradeTime)}
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