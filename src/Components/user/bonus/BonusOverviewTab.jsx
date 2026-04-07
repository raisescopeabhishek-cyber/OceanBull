// Components/user/bonus/BonusOverviewTab.jsx
import React from "react";
import { useSelector } from "react-redux";
import { useBonusDashboard } from "./hooks/useBonusDashboard";
import BonusHero from "./components/BonusHero";
import BonusSectionCard from "./components/BonusSectionCard";
import BonusTableLoader from "./components/BonusTableLoader";
import BonusEmptyState from "./components/BonusEmptyState";
import { formatCurrency } from "./utils/bonusHelpers";

const BonusOverviewTab = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";
  const { data, loading } = useBonusDashboard();

  if (loading) {
    return (
      <div className="p-5 sm:p-6">
        <BonusTableLoader rows={8} />
      </div>
    );
  }

  const profile = data?.profile || {};
  const wallet = data?.wallet || {};
  const depositConfigs = data?.activeDepositBonusConfigs || [];
  const tradeConfigs = data?.activeTradeLotConfigs || [];

  return (
    <div>
      <BonusHero
        isDark={isDark}
        title="Bonus Overview"
        subtitle="See your linked trading accounts, active wallet balance, and bonus configuration slabs currently active for the system."
        rightContent={
          <div>
            <p className={isDark ? "text-white/45 text-xs" : "text-slate-500 text-xs"}>
              Linked Accounts
            </p>
            <h3 className="mt-1 text-2xl font-bold">
              {profile?.accounts?.length || 0}
            </h3>
          </div>
        }
      />

      <div className="space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <BonusSectionCard
            isDark={isDark}
            title="Profile Snapshot"
            subtitle="Basic user bonus profile information"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className={isDark ? "text-white/45 text-sm" : "text-slate-500 text-sm"}>
                  Name
                </p>
                <p className="mt-1 text-base font-semibold">{profile?.name || "-"}</p>
              </div>
              <div>
                <p className={isDark ? "text-white/45 text-sm" : "text-slate-500 text-sm"}>
                  Email
                </p>
                <p className="mt-1 text-base font-semibold">{profile?.email || "-"}</p>
              </div>
              <div>
                <p className={isDark ? "text-white/45 text-sm" : "text-slate-500 text-sm"}>
                  Bonus Wallet
                </p>
                <p className="mt-1 text-base font-semibold">
                  {formatCurrency(wallet.currentBonusWallet)}
                </p>
              </div>
              <div>
                <p className={isDark ? "text-white/45 text-sm" : "text-slate-500 text-sm"}>
                  Total Balance
                </p>
                <p className="mt-1 text-base font-semibold">
                  {formatCurrency(wallet.totalBalance)}
                </p>
              </div>
            </div>
          </BonusSectionCard>

          <BonusSectionCard
            isDark={isDark}
            title="Trading Accounts"
            subtitle="Accounts mapped under your user profile"
          >
            {profile?.accounts?.length ? (
              <div className="space-y-3">
                {profile.accounts.map((acc, idx) => (
                  <div
                    key={`${acc.accountNumber}-${idx}`}
                    className={[
                      "rounded-2xl border p-4",
                      isDark
                        ? "border-white/10 bg-white/[0.03]"
                        : "border-orange-100 bg-orange-50/40",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{acc.accountNumber}</p>
                        <p
                          className={[
                            "text-sm",
                            isDark ? "text-white/45" : "text-slate-500",
                          ].join(" ")}
                        >
                          {/* {acc.accountType} • {acc.platform || "MT5"} • {acc.groupName} */}
                        </p>
                      </div>
                      {/* <div className="text-sm font-medium">{acc.leverage}</div> */}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <BonusEmptyState
                isDark={isDark}
                title="No trading accounts found"
                subtitle="Linked accounts will appear here once available in user profile."
              />
            )}
          </BonusSectionCard>
        </div>

        {/* <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <BonusSectionCard
            isDark={isDark}
            title="Active Deposit Bonus Slabs"
            subtitle="Configured deposit amount based bonus slabs"
          >
            {depositConfigs.length ? (
              <div className="space-y-3">
                {depositConfigs.map((item) => (
                  <div
                    key={item._id}
                    className={[
                      "flex items-center justify-between rounded-2xl border p-4",
                      isDark
                        ? "border-white/10 bg-white/[0.03]"
                        : "border-orange-100 bg-orange-50/40",
                    ].join(" ")}
                  >
                    <div>
                      <p className="font-semibold">{formatCurrency(item.depositAmount)}</p>
                      <p
                        className={[
                          "text-sm",
                          isDark ? "text-white/45" : "text-slate-500",
                        ].join(" ")}
                      >
                        Deposit threshold
                      </p>
                    </div>
                    <div className="text-lg font-bold">{item.bonusPercent}%</div>
                  </div>
                ))}
              </div>
            ) : (
              <BonusEmptyState isDark={isDark} title="No active deposit slabs" />
            )}
          </BonusSectionCard>

          <BonusSectionCard
            isDark={isDark}
            title="Active Trade Bonus Slabs"
            subtitle="Configured lot based payout slabs"
          >
            {tradeConfigs.length ? (
              <div className="space-y-3">
                {tradeConfigs.map((item) => (
                  <div
                    key={item._id}
                    className={[
                      "flex items-center justify-between rounded-2xl border p-4",
                      isDark
                        ? "border-white/10 bg-white/[0.03]"
                        : "border-orange-100 bg-orange-50/40",
                    ].join(" ")}
                  >
                    <div>
                      <p className="font-semibold">
                        {item.minLot} - {item.maxLot} Lots
                      </p>
                      <p
                        className={[
                          "text-sm",
                          isDark ? "text-white/45" : "text-slate-500",
                        ].join(" ")}
                      >
                        Active bonus range
                      </p>
                    </div>
                    <div className="text-lg font-bold">
                      {formatCurrency(item.bonusAmount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <BonusEmptyState isDark={isDark} title="No active trade slabs" />
            )}
          </BonusSectionCard>
        </div> */}
      </div>
    </div>
  );
};

export default BonusOverviewTab;