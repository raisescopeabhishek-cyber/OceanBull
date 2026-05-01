import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";

import { copyTradingApi } from "../api/copyTradingApi";
import {
  asArray,
  cx,
  getNestedUser,
  getUserIdFromUser,
  pickMasterAccount,
} from "../utils/copyTradingHelpers";
import CopyTradingEmptyState from "../shared/CopyTradingEmptyState";
import CopyTradingTable from "../shared/CopyTradingTable";

const UserMyCopiedAccounts = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRows = async () => {
    try {
      setLoading(true);

      const userRes = await copyTradingApi.getMeUser();
      const resolvedUser = getNestedUser(userRes);
      const userId = getUserIdFromUser(resolvedUser);

      if (!userId) {
        setRows([]);
        return;
      }

      const res = await copyTradingApi.userMyMasters({ userId });
      setRows(asArray(res));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load copied accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  if (loading) {
    return <div className="p-5 text-sm">Loading copied accounts...</div>;
  }

  if (!rows.length) {
    return (
      <div className="p-5 sm:p-6">
        <CopyTradingEmptyState
          isDark={isDark}
          title="No copied accounts yet"
          subtitle="Go to Explore Masters and start copying a master trader."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={loadRows}
          className={cx(
            "inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold",
            isDark
              ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
              : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
          )}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <CopyTradingTable
        isDark={isDark}
        columns={[
          "Master Account",
          "Copier Account",
          "Commission",
          "Minimum Invest",
          "Status",
        ]}
        rows={rows}
        renderRow={(row, index) => {
          const masterAccount = pickMasterAccount(row) || "-";
          const copierAccount =
            row?.mt5Account ||
            row?.MT5Account ||
            row?.copierAccount ||
            row?.clientAccount ||
            "-";

          return (
            <tr
              key={`${masterAccount}-${copierAccount}-${index}`}
              className={cx(
                "border-t transition-colors",
                isDark
                  ? "border-white/10 hover:bg-white/[0.035]"
                  : "border-emerald-100 hover:bg-emerald-50/40"
              )}
            >
              <td className="px-4 py-4 font-bold">#{masterAccount}</td>

              <td className="px-4 py-4">#{copierAccount}</td>

              <td className="px-4 py-4">
                {row?.commission || row?.Commission || 0}%
              </td>

              <td className="px-4 py-4">
                $
                {row?.min_invest ||
                  row?.minInvest ||
                  row?.minimumInvestment ||
                  0}
              </td>

              <td className="px-4 py-4">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
                  Active
                </span>
              </td>
            </tr>
          );
        }}
      />
    </div>
  );
};

export default UserMyCopiedAccounts;