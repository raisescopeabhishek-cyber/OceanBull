import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { RefreshCw, Trash2 } from "lucide-react";

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

  const [user, setUser] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRows = async () => {
    try {
      setLoading(true);

      const userRes = await copyTradingApi.getMeUser();
      const resolvedUser = getNestedUser(userRes);
      const userId = getUserIdFromUser(resolvedUser);

      setUser(resolvedUser);

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

  const handleStopCopy = async (row) => {
    const mt5Account =
      row?.mt5Account ||
      row?.MT5Account ||
      row?.copierAccount ||
      row?.clientAccount ||
      row?.account;

    if (!mt5Account) {
      toast.error("MT5 account not found");
      return;
    }

    try {
      const res = await copyTradingApi.userStopCopy({ mt5Account });

      if (res?.success === false || res?.status === false) {
        toast.error(res?.message || "Unable to stop copying");
        return;
      }

      toast.success("Copying stopped successfully");
      loadRows();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to stop copying");
    }
  };

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
          className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-emerald-700"
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
          "Action",
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
              <td className="px-4 py-4">{row?.commission || row?.Commission || 0}%</td>
              <td className="px-4 py-4">
                ${row?.min_invest || row?.minInvest || row?.minimumInvestment || 0}
              </td>
              <td className="px-4 py-4">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
                  Active
                </span>
              </td>
              <td className="px-4 py-4">
                <button
                  type="button"
                  onClick={() => handleStopCopy(row)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Stop
                </button>
              </td>
            </tr>
          );
        }}
      />
    </div>
  );
};

export default UserMyCopiedAccounts;