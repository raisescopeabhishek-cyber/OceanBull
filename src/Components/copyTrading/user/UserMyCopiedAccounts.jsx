import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { RefreshCw, Search, X } from "lucide-react";

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

const getCopierAccount = (row) => {
  return (
    row?.mt5Account ||
    row?.MT5Account ||
    row?.copierAccount ||
    row?.clientAccount ||
    row?.account ||
    row?.login ||
    row?.Login ||
    ""
  );
};

const getCommission = (row) => {
  return row?.commission || row?.Commission || 0;
};

const getMinimumInvest = (row) => {
  return row?.min_invest || row?.minInvest || row?.minimumInvestment || 0;
};

const UserMyCopiedAccounts = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
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

  const filteredRows = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();

    if (!q) return rows;

    return rows.filter((row) => {
      const masterAccount = pickMasterAccount(row);
      const copierAccount = getCopierAccount(row);
      const commission = getCommission(row);
      const minInvest = getMinimumInvest(row);

      const searchableText = [
        masterAccount,
        copierAccount,
        commission,
        minInvest,
        "active",
        row?.status,
        row?.Status,
        row?.name,
        row?.nickname,
        row?.email,
        JSON.stringify(row || {}),
      ]
        .filter((item) => item !== undefined && item !== null)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(q);
    });
  }, [rows, search]);

  if (loading) {
    return (
      <div
        className={cx(
          "p-5 text-sm",
          isDark ? "text-white/70" : "text-slate-600"
        )}
      >
        Loading copied accounts...
      </div>
    );
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
      <div
        className={cx(
          "grid grid-cols-1 gap-3 rounded-[22px] border p-4 lg:grid-cols-[1fr_auto]",
          isDark
            ? "border-white/10 bg-white/[0.035]"
            : "border-emerald-100 bg-white/90 shadow-[0_10px_24px_rgba(16,185,129,0.06)]"
        )}
      >
        <div className="relative">
          <Search
            className={cx(
              "absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2",
              isDark ? "text-white/45" : "text-slate-400"
            )}
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by master account, copier account, commission..."
            className={cx(
              "w-full rounded-2xl border px-11 py-3 text-sm outline-none transition-all",
              isDark
                ? "border-white/10 bg-slate-950 text-white placeholder:text-white/40 focus:border-emerald-400/60"
                : "border-emerald-100 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-400"
            )}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className={cx(
                "absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-1.5",
                isDark
                  ? "text-white/50 hover:bg-white/10 hover:text-white"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              )}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={loadRows}
          disabled={loading}
          className={cx(
            "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60",
            isDark
              ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
              : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
          )}
        >
          <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div
        className={cx(
          "rounded-[18px] border px-4 py-3 text-sm",
          isDark
            ? "border-white/10 bg-white/[0.025] text-white/65"
            : "border-emerald-100 bg-emerald-50/60 text-slate-600"
        )}
      >
        Showing <b>{filteredRows.length}</b> of <b>{rows.length}</b> copied
        accounts
      </div>

      {filteredRows.length === 0 ? (
        <CopyTradingEmptyState
          isDark={isDark}
          title="No matching copied accounts"
          subtitle="Try searching with another master account, copier account, or commission value."
        />
      ) : (
        <CopyTradingTable
          isDark={isDark}
          columns={[
            "Master Account",
            "Copier Account",
            "Commission",
            "Minimum Invest",
            "Status",
          ]}
          rows={filteredRows}
          renderRow={(row, index) => {
            const masterAccount = pickMasterAccount(row) || "-";
            const copierAccount = getCopierAccount(row) || "-";
            const commission = getCommission(row);
            const minInvest = getMinimumInvest(row);

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
                <td className="whitespace-nowrap px-4 py-4 font-bold">
                  #{masterAccount}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  #{copierAccount}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  {commission}%
                </td>

                <td className="whitespace-nowrap px-4 py-4">${minInvest}</td>

                <td className="whitespace-nowrap px-4 py-4">
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
                    Active
                  </span>
                </td>
              </tr>
            );
          }}
        />
      )}
    </div>
  );
};

export default UserMyCopiedAccounts;