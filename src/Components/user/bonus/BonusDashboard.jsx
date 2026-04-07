// Components/user/bonus/BonusDashboard.jsx
import React from "react";
import { useSelector } from "react-redux";
import {
  Coins,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock3,
  Layers3,
  Activity,
} from "lucide-react";
import { useBonusDashboard } from "./hooks/useBonusDashboard";
import { formatCurrency, formatNumber } from "./utils/bonusHelpers";
import BonusHero from "./components/BonusHero";
import BonusSectionCard from "./components/BonusSectionCard";
import BonusStatCard from "./components/BonusStatCard";
import BonusTableLoader from "./components/BonusTableLoader";
import BonusStatusBadge from "./components/BonusStatusBadge";
import BonusEmptyState from "./components/BonusEmptyState";

const BonusDashboard = () => {
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

  const wallet = data?.wallet || {};
  const tradeOverview = data?.tradeOverview || {};
  const recentLedger = data?.recentLedger || [];
  const recentDeposits = data?.recentDeposits || [];
  const recentPayouts = data?.recentPayouts || [];

  return (
    <div>
      <BonusHero
        isDark={isDark}
        title="Bonus Wallet Dashboard"
        subtitle="Monitor current bonus wallet, deposit bonus performance, trade bonus credits, active slabs, recent wallet movements, and bonus trade processing from one place."
        rightContent={
          <div>
            <p
              className={[
                "text-xs uppercase tracking-[0.16em]",
                isDark ? "text-white/40" : "text-slate-500",
              ].join(" ")}
            >
              Current Bonus Wallet
            </p>
            <h3 className="mt-1 text-2xl font-bold">
              {formatCurrency(wallet.currentBonusWallet)}
            </h3>
          </div>
        }
      />

      <div className="space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <BonusStatCard
            isDark={isDark}
            icon={<Coins size={22} />}
            label="Bonus Wallet"
            value={formatCurrency(wallet.currentBonusWallet)}
            helper="Current available wallet bonus"
          />
          <BonusStatCard
            isDark={isDark}
            icon={<ArrowDownCircle size={22} />}
            label="Total Lot"
            value={formatNumber(tradeOverview.totalLot)}
            helper="All tracked bonus trade lots"
          />
          <BonusStatCard
            isDark={isDark}
            icon={<ArrowUpCircle size={22} />}
            label="Eligible Trades"
            value={formatNumber(tradeOverview.eligibleTrades)}
            helper="Trades considered for bonus logic"
          />
          <BonusStatCard
            isDark={isDark}
            icon={<Clock3 size={22} />}
            label="Unprocessed Trades"
            value={formatNumber(tradeOverview.unprocessedTrades)}
            helper="Still waiting for bonus processing"
          />
          <BonusStatCard
            isDark={isDark}
            icon={<Layers3 size={22} />}
            label="Processed Trades"
            value={formatNumber(tradeOverview.processedTrades)}
            helper="Already marked in payout flow"
          />
          <BonusStatCard
            isDark={isDark}
            icon={<Activity size={22} />}
            label="Total Trades"
            value={formatNumber(tradeOverview.totalTrades)}
            helper="All bonus-tracked close trades"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <BonusSectionCard
            isDark={isDark}
            title="Recent Wallet Ledger"
            subtitle="Latest movements in your bonus wallet"
          >
            {recentLedger.length === 0 ? (
              <BonusEmptyState
                isDark={isDark}
                title="No ledger activity"
                subtitle="Once deposit bonus or trade bonus movements happen, they will appear here."
              />
            ) : (
              <div className="space-y-3">
                {recentLedger.map((item) => (
                  <div
                    key={item._id}
                    className={[
                      "flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between",
                      isDark
                        ? "border-white/10 bg-white/[0.03]"
                        : "border-orange-100 bg-orange-50/40",
                    ].join(" ")}
                  >
                    <div>
                      <p className="font-semibold">{item.type}</p>
                      <p
                        className={[
                          "mt-1 text-sm",
                          isDark ? "text-white/45" : "text-slate-500",
                        ].join(" ")}
                      >
                        Before: {formatCurrency(item.balanceBefore)} → After:{" "}
                        {formatCurrency(item.balanceAfter)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BonusSectionCard>

          <BonusSectionCard
            isDark={isDark}
            title="Recent Trade Bonus Payouts"
            subtitle="Latest credited, skipped, or failed payout batches"
          >
            {recentPayouts.length === 0 ? (
              <BonusEmptyState
                isDark={isDark}
                title="No payout records"
                subtitle="Trade bonus payout batches will appear here once processed."
              />
            ) : (
              <div className="space-y-3">
                {recentPayouts.map((item) => (
                  <div
                    key={item._id}
                    className={[
                      "flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between",
                      isDark
                        ? "border-white/10 bg-white/[0.03]"
                        : "border-orange-100 bg-orange-50/40",
                    ].join(" ")}
                  >
                    <div>
                      <p className="font-semibold">{item.mt5Account}</p>
                      <p
                        className={[
                          "mt-1 text-sm",
                          isDark ? "text-white/45" : "text-slate-500",
                        ].join(" ")}
                      >
                        Lot: {formatNumber(item.totalLot)} • Wallet:{" "}
                        {formatCurrency(item.walletBefore)} →{" "}
                        {formatCurrency(item.walletAfter)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <BonusStatusBadge isDark={isDark} status={item.status} />
                      <p className="text-lg font-bold">
                        {formatCurrency(item.bonusAmount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BonusSectionCard>
        </div>

        <BonusSectionCard
          isDark={isDark}
          title="Recent Deposit Bonus Entries"
          subtitle="Quick look at latest deposits and associated bonus"
        >
          {recentDeposits.length === 0 ? (
            <BonusEmptyState
              isDark={isDark}
              title="No deposit bonus entries"
              subtitle="Approved deposits with bonus will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr
                    className={[
                      "text-xs uppercase tracking-[0.16em]",
                      isDark ? "text-white/40" : "text-slate-500",
                    ].join(" ")}
                  >
                    <th className="px-4 py-3">MT5 Account</th>
                    <th className="px-4 py-3">Deposit</th>
                    <th className="px-4 py-3">Bonus</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeposits.map((item) => (
                    <tr
                      key={item._id}
                      className={[
                        "border-t",
                        isDark ? "border-white/10" : "border-orange-100",
                      ].join(" ")}
                    >
                      <td className="px-4 py-4 font-semibold">{item.mt5Account}</td>
                      <td className="px-4 py-4">{formatCurrency(item.deposit)}</td>
                      <td className="px-4 py-4">{formatCurrency(item.bonus)}</td>
                      <td className="px-4 py-4">
                        <BonusStatusBadge isDark={isDark} status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </BonusSectionCard>
      </div>
    </div>
  );
};

export default BonusDashboard;