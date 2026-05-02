import React, { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Search } from "lucide-react";

import { copyTradingApi } from "../api/copyTradingApi";
import {
  cx,
  formatDateTime,
  getNestedUser,
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

const UserMasterTradeHistory = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [masterAccount, setMasterAccount] = useState("");
  const [status, setStatus] = useState("all");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTrades = async () => {
    const cleanMasterAccount = String(masterAccount || "").trim();

    if (!cleanMasterAccount) {
      toast.error("Enter master account");
      return;
    }

    try {
      setLoading(true);

      const userRes = await copyTradingApi.getMeUser();
      const user = getNestedUser(userRes);
      const userId = getUserIdFromUser(user);

      const res = await copyTradingApi.userMasterTrades({
        userId,
        masterAccount: cleanMasterAccount,
        status,
        page: 1,
        page_size: 20,
      });

      const normalizedRows = normalizeTradeRows({
        input: res,
        account: cleanMasterAccount,
        mode: "master",
      });

      setRows(normalizedRows);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load master trades"
      );
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
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className={cx(
            "rounded-2xl border px-4 py-3 text-sm outline-none",
            isDark
              ? "border-white/10 bg-slate-950 text-white"
              : "border-slate-200 bg-white text-slate-900"
          )}
        >
          <option value="all">All Master Trades</option>
          <option value="open">Open Trades</option>
          <option value="closed">Closed Trades</option>
        </select>

        <input
          value={masterAccount}
          onChange={(event) => setMasterAccount(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              loadTrades();
            }
          }}
          placeholder="Enter master account"
          className={cx(
            "rounded-2xl border px-4 py-3 text-sm outline-none",
            isDark
              ? "border-white/10 bg-slate-950 text-white placeholder:text-white/40"
              : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
          )}
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

      {loading ? (
        <div
          className={cx(
            "p-5 text-sm",
            isDark ? "text-white/70" : "text-slate-600"
          )}
        >
          Loading master trades...
        </div>
      ) : rows.length === 0 ? (
        <CopyTradingEmptyState
          isDark={isDark}
          title="No master trades loaded"
          subtitle="Enter a master account and search."
        />
      ) : (
        <CopyTradingTable
          isDark={isDark}
          columns={[
            "Ticket",
            "Symbol",
            "Type",
            "Volume",
            "Open Price",
            "Close Price",
            "Profit",
            "Time",
          ]}
          rows={rows}
          minWidth="1150px"
          renderRow={(row, index) => {
            const ticket = getTradeTicket(row);
            const profit = Number(getTradeProfit(row) || 0);

            return (
              <tr
                key={`${ticket}-${index}`}
                className={cx(
                  "border-t",
                  isDark ? "border-white/10" : "border-emerald-100"
                )}
              >
                <td className="px-4 py-4 font-bold">{ticket}</td>

                <td className="px-4 py-4">{getTradeSymbol(row)}</td>

                <td className="px-4 py-4">{getTradeType(row)}</td>

                <td className="px-4 py-4">{getTradeVolume(row)}</td>

                <td className="px-4 py-4">{getTradeOpenPrice(row)}</td>

                <td className="px-4 py-4">{getTradeClosePrice(row)}</td>

                <td
                  className={cx(
                    "px-4 py-4 font-bold",
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

                <td className="px-4 py-4">
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

export default UserMasterTradeHistory;