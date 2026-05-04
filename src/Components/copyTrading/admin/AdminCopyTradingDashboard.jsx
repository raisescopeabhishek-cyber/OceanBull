import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  BarChart3,
  CopyCheck,
  RadioTower,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";

import { copyTradingApi } from "../api/copyTradingApi";
import { cx } from "../utils/copyTradingHelpers";
import CopyTradingEmptyState from "../shared/CopyTradingEmptyState";
import {
  formatAgo,
  pickCopierLogin,
  pickCreatedTime,
  pickLogin,
  pickMasterLogin,
  safeArray,
  valueOf,
} from "./adminCopyTradingHelpers";

const StatCard = ({ isDark, icon, label, value, subtitle }) => {
  return (
    <div
      className={cx(
        "rounded-[24px] border p-5",
        isDark
          ? "border-white/10 bg-white/[0.035]"
          : "border-emerald-100 bg-white/95 shadow-[0_10px_26px_rgba(16,185,129,0.07)]"
      )}
    >
      <div className="flex items-center gap-2 text-sm font-black">
        {icon}
        {label}
      </div>

      <div className="mt-3 text-3xl font-black">{value}</div>

      <p className={cx("mt-1 text-xs", isDark ? "text-white/45" : "text-slate-500")}>
        {subtitle}
      </p>
    </div>
  );
};

const RecentTable = ({ isDark, title, rows, type }) => {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-[24px] border",
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-emerald-100 bg-white/95 shadow-[0_10px_26px_rgba(16,185,129,0.07)]"
      )}
    >
      <div className={cx("border-b p-4", isDark ? "border-white/10" : "border-emerald-100")}>
        <h3 className="text-sm font-black">{title}</h3>
      </div>

      {!rows.length ? (
        <CopyTradingEmptyState
          isDark={isDark}
          title="No data found"
          subtitle="No recent records available."
        />
      ) : (
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr
                className={cx(
                  "border-b text-xs uppercase tracking-[0.16em]",
                  isDark
                    ? "border-white/10 bg-white/[0.035] text-white/45"
                    : "border-emerald-100 bg-emerald-50/80 text-slate-500"
                )}
              >
                <th className="px-4 py-3">Account</th>
                {type === "copier" && <th className="px-4 py-3">Master</th>}
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Ago</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => {
                const createdTime = pickCreatedTime(row);

                return (
                  <tr
                    key={`${pickLogin(row)}-${index}`}
                    className={cx(
                      "border-t",
                      isDark ? "border-white/10" : "border-emerald-100"
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-4 font-black">
                      #{type === "copier" ? pickCopierLogin(row) : pickLogin(row)}
                    </td>

                    {type === "copier" && (
                      <td className="whitespace-nowrap px-4 py-4 font-bold">
                        #{pickMasterLogin(row)}
                      </td>
                    )}

                    <td className="whitespace-nowrap px-4 py-4">
                      {valueOf(row, ["name", "Name", "nickname"], "-")}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {createdTime ? new Date(createdTime).toLocaleString() : "-"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-emerald-600 font-bold">
                      {formatAgo(createdTime)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AdminCopyTradingDashboard = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [masters, setMasters] = useState([]);
  const [copiers, setCopiers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const [mastersRes, copiersRes] = await Promise.all([
        copyTradingApi.adminGetMasters(),
        copyTradingApi.adminGetCopiers(),
      ]);

      setMasters(safeArray(mastersRes));
      setCopiers(safeArray(copiersRes));
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to load admin report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const recentMasters = useMemo(() => {
    return [...masters].sort((a, b) => pickCreatedTime(b) - pickCreatedTime(a)).slice(0, 8);
  }, [masters]);

  const recentCopiers = useMemo(() => {
    return [...copiers].sort((a, b) => pickCreatedTime(b) - pickCreatedTime(a)).slice(0, 8);
  }, [copiers]);

  const activeMasters = masters.length;
  const activeCopiers = copiers.length;

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Copy Trading Overview</h1>
          <p className={cx("mt-1 text-sm", isDark ? "text-white/50" : "text-slate-500")}>
            Admin report for masters, copiers, and trading activity.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className={cx(
            "inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black disabled:opacity-60",
            isDark
              ? "border-white/10 bg-white/[0.04] text-white"
              : "border-emerald-100 bg-white text-emerald-700"
          )}
        >
          <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          isDark={isDark}
          icon={<RadioTower className="h-4 w-4 text-emerald-600" />}
          label="Masters"
          value={activeMasters}
          subtitle="Total master accounts"
        />
        <StatCard
          isDark={isDark}
          icon={<Users className="h-4 w-4 text-emerald-600" />}
          label="Copiers"
          value={activeCopiers}
          subtitle="Total copier accounts"
        />
        <StatCard
          isDark={isDark}
          icon={<CopyCheck className="h-4 w-4 text-emerald-600" />}
          label="Links"
          value={activeCopiers}
          subtitle="Active copier mappings"
        />
        <StatCard
          isDark={isDark}
          icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
          label="Status"
          value="Live"
          subtitle="Copy trading module"
        />
      </div>

      {loading ? (
        <div className="p-5 text-sm">Loading report...</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <RecentTable
            isDark={isDark}
            title="Recent Masters"
            rows={recentMasters}
            type="master"
          />

          <RecentTable
            isDark={isDark}
            title="Recent Copiers"
            rows={recentCopiers}
            type="copier"
          />
        </div>
      )}
    </div>
  );
};

export default AdminCopyTradingDashboard;