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

const AdminTradeMonitor = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [masterAccount, setMasterAccount] = useState("");
  const [tab, setTab] = useState("master");
  const [rows, setRows] = useState([]);
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

      setRows(asArray(res));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load trades");
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
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>

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
          columns={["Ticket", "Symbol", "Type", "Volume", "Price", "Profit", "Open Time"]}
          rows={rows}
          minWidth="1100px"
          renderRow={(row, index) => (
            <tr
              key={row?.Ticket || row?.ticket || index}
              className={cx(
                "border-t",
                isDark ? "border-white/10" : "border-emerald-100"
              )}
            >
              <td className="px-4 py-4 font-bold">
                {row?.Ticket || row?.ticket || "-"}
              </td>
              <td className="px-4 py-4">{row?.Symbol || row?.symbol || "-"}</td>
              <td className="px-4 py-4">{row?.Action ?? row?.type ?? "-"}</td>
              <td className="px-4 py-4">{row?.Volume || row?.volume || "-"}</td>
              <td className="px-4 py-4">
                {row?.Price || row?.OpenPrice || row?.PriceOpen || "-"}
              </td>
              <td className="px-4 py-4">{row?.Profit || row?.profit || "0"}</td>
              <td className="px-4 py-4">
                {formatDateTime(row?.OpenTime || row?.Time || row?.createdAt)}
              </td>
            </tr>
          )}
        />
      )}
    </div>
  );
};

export default AdminTradeMonitor;