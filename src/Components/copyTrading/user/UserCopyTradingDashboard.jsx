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
      "rounded-card border p-4","border-line bg-surface-2"
    )}
  >
    <div className="flex items-center gap-3">
      <div
        className={cx(
          "flex h-11 w-11 items-center justify-center rounded-card border","border-success bg-success-soft text-success"
        )}
      >
        {icon}
      </div>

      <div>
        <p className={cx("text-xs","text-subtle")}>
          {label}
        </p>
        <p
          className={cx(
            "mt-1 text-lg font-bold","text-text"
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
            "rounded-card border p-5","border-line bg-surface-2"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-card border border-success bg-success-soft text-success">
              <RadioTower className="h-5 w-5" />
            </div>

            <div>
              <h3
                className={cx(
                  "text-base font-bold","text-text"
                )}
              >
                Copy Trading Quick Start
              </h3>
              <p
                className={cx(
                  "mt-2 text-sm leading-6","text-subtle"
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