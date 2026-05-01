import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Copy,
  RadioTower,
  TrendingUp,
  UserRoundCog,
  WalletCards,
} from "lucide-react";
import toast from "react-hot-toast";

import { copyTradingApi } from "../api/copyTradingApi";
import {
  asArray,
  cx,
  formatNumber,
  getNestedUser,
  getUserAccountsFromUser,
  getUserIdFromUser,
  pickAccountNumber,
} from "../utils/copyTradingHelpers";
import CopyTradingEmptyState from "../shared/CopyTradingEmptyState";

const StatCard = ({ isDark, icon, label, value }) => (
  <div
    className={cx(
      "rounded-2xl border p-4",
      isDark
        ? "border-white/10 bg-white/[0.035]"
        : "border-emerald-100 bg-white/90 shadow-[0_10px_24px_rgba(16,185,129,0.07)]"
    )}
  >
    <div className="flex items-center gap-3">
      <div
        className={cx(
          "flex h-11 w-11 items-center justify-center rounded-2xl border",
          isDark
            ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
        )}
      >
        {icon}
      </div>

      <div>
        <p className={cx("text-xs", isDark ? "text-white/50" : "text-slate-500")}>
          {label}
        </p>
        <p
          className={cx(
            "mt-1 text-lg font-bold",
            isDark ? "text-white" : "text-slate-900"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  </div>
);

const UserCopyTradingDashboard = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [masters, setMasters] = useState([]);
  const [myMasters, setMyMasters] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const userRes = await copyTradingApi.getMeUser();
        const resolvedUser = getNestedUser(userRes);
        const userId = getUserIdFromUser(resolvedUser);

        setUser(resolvedUser);

        const [mastersRes, myMastersRes] = await Promise.all([
          copyTradingApi.userGetMasters(),
          userId
            ? copyTradingApi.userMyMasters({ userId })
            : Promise.resolve({ data: [] }),
        ]);

        setMasters(asArray(mastersRes));
        setMyMasters(asArray(myMastersRes));
      } catch (error) {
        console.error(error);
        toast.error("Failed to load copy trading dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const accounts = getUserAccountsFromUser(user);

  const summary = useMemo(
    () => ({
      totalMasters: masters.length,
      copiedMasters: myMasters.length,
      mt5Accounts: accounts.length,
      activeAccounts: accounts.filter((item) => pickAccountNumber(item)).length,
    }),
    [masters, myMasters, accounts]
  );

  if (loading) {
    return <div className="p-5 text-sm">Loading copy trading dashboard...</div>;
  }

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          isDark={isDark}
          icon={<UserRoundCog className="h-5 w-5" />}
          label="Available Masters"
          value={formatNumber(summary.totalMasters)}
        />

        <StatCard
          isDark={isDark}
          icon={<Copy className="h-5 w-5" />}
          label="Copied Masters"
          value={formatNumber(summary.copiedMasters)}
        />

        <StatCard
          isDark={isDark}
          icon={<WalletCards className="h-5 w-5" />}
          label="My MT5 Accounts"
          value={formatNumber(summary.mt5Accounts)}
        />

        <StatCard
          isDark={isDark}
          icon={<TrendingUp className="h-5 w-5" />}
          label="Active Accounts"
          value={formatNumber(summary.activeAccounts)}
        />
      </div>

      {masters.length === 0 ? (
        <CopyTradingEmptyState
          isDark={isDark}
          title="No master traders available"
          subtitle="Once admin adds master accounts, they will appear here."
        />
      ) : (
        <div
          className={cx(
            "rounded-[24px] border p-5",
            isDark
              ? "border-white/10 bg-white/[0.035]"
              : "border-emerald-100 bg-white/90"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
              <RadioTower className="h-5 w-5" />
            </div>

            <div>
              <h3
                className={cx(
                  "text-base font-bold",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                Copy Trading Quick Start
              </h3>
              <p
                className={cx(
                  "mt-2 text-sm leading-6",
                  isDark ? "text-white/55" : "text-slate-500"
                )}
              >
                Go to Explore Masters, select your MT5 account, check minimum
                investment and commission, then start copying.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCopyTradingDashboard;