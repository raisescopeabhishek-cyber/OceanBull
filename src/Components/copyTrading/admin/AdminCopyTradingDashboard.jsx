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
        "rounded-card border p-5","border-line bg-surface-2"
      )}
    >
      <div className="flex items-center gap-2 text-sm font-black">
        {icon}
        {label}
      </div>

      <div className="mt-3 text-3xl font-black">{value}</div>

      <p className={cx("mt-1 text-xs","text-subtle")}>
        {subtitle}
      </p>
    </div>
  );
};

const RecentTable = ({ isDark, title, rows, type }) => {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-card border","border-line bg-surface-2"
      )}
    >
      <div className={cx("border-b p-4","border-line")}>
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
          <table className="w-full min-w-[720px] text-left text-sm table-stack">
            <thead>
              <tr
                className={cx(
                  "border-b text-xs uppercase tracking-[0.16em]","border-line bg-surface-2 text-subtle"
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
                      "border-t","border-line"
                    )}
                  >
                    <td data-label="Account" className="whitespace-nowrap px-4 py-4 font-black">
                      #{type === "copier" ? pickCopierLogin(row) : pickLogin(row)}
                    </td>

                    {type === "copier" && (
                      <td data-label="Master" className="whitespace-nowrap px-4 py-4 font-bold">
                        #{pickMasterLogin(row)}
                      </td>
                    )}

                    <td data-label="Name" className="whitespace-nowrap px-4 py-4">
                      {valueOf(row, ["name", "Name", "nickname"], "-")}
                    </td>

                    <td data-label="Created" className="whitespace-nowrap px-4 py-4">
                      {createdTime ? new Date(createdTime).toLocaleString() : "-"}
                    </td>

                    <td data-label="Ago" className="whitespace-nowrap px-4 py-4 text-success font-bold">
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
          <p className={cx("mt-1 text-sm","text-subtle")}>
            Admin report for masters, copiers, and trading activity.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className={cx(
            "inline-flex items-center gap-2 rounded-card border px-4 py-3 text-sm font-black disabled:opacity-60","border-line bg-surface-2 text-text"
          )}
        >
          <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          isDark={isDark}
          icon={<RadioTower className="h-4 w-4 text-success" />}
          label="Masters"
          value={activeMasters}
          subtitle="Total master accounts"
        />
        <StatCard
          isDark={isDark}
          icon={<Users className="h-4 w-4 text-success" />}
          label="Copiers"
          value={activeCopiers}
          subtitle="Total copier accounts"
        />
        <StatCard
          isDark={isDark}
          icon={<CopyCheck className="h-4 w-4 text-success" />}
          label="Links"
          value={activeCopiers}
          subtitle="Active copier mappings"
        />
        <StatCard
          isDark={isDark}
          icon={<TrendingUp className="h-4 w-4 text-success" />}
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