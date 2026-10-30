// Components/user/bonus/BonusDashboard.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Coins,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock3,
  Layers3,
  Activity,
  WalletCards,
  TrendingUp,
  ReceiptText,
  BadgeDollarSign,
} from "lucide-react";
import { useBonusDashboard } from "./hooks/useBonusDashboard";
import { formatCurrency, formatNumber } from "./utils/bonusHelpers";
import BonusSectionCard from "./components/BonusSectionCard";
import BonusStatCard from "./components/BonusStatCard";
import BonusTableLoader from "./components/BonusTableLoader";


import BonusStatusBadge from "./components/BonusStatusBadge";
import BonusEmptyState from "./components/BonusEmptyState";
import BonusHero from "./components/BonusHero";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const getSoftTheme = (isDark) => ({
  text:"text-text",
  muted:"text-subtle",
  softText:"text-muted",

  pageSection:"bg-transparent",

  softPanel:"border-line bg-surface-2",

  softPanelHover:"hover:bg-surface-2",

  iconBox:"border-line bg-primary-soft text-primary",

  chip:"border-line bg-surface-2 text-muted",

  amountChip:"border-success bg-success-soft text-success",

  tableHead:"border-line bg-surface-2 text-subtle",

  tableRow:"border-line hover:bg-surface-2",

  tableCellText:"text-muted",
});

const SoftIconBox = ({ children, theme }) => (
  <div
    className={cx(
      "flex h-10 w-10 shrink-0 items-center justify-center rounded-card border",
      theme.iconBox
    )}
  >
    {children}
  </div>
);

const SoftActivityRow = ({
  isDark,
  theme,
  icon,
  title,
  subtitle,
  amount,
  children,
}) => (
  <div
    className={cx(
      "flex flex-col gap-3 rounded-card border p-4 transition-all duration-200 md:flex-row md:items-center md:justify-between",
      theme.softPanel,
      theme.softPanelHover
    )}
  >
    <div className="flex min-w-0 items-start gap-3">
      <SoftIconBox theme={theme}>{icon}</SoftIconBox>

      <div className="min-w-0">
        <p className={cx("truncate font-semibold", theme.text)}>{title}</p>
        <p className={cx("mt-1 text-sm leading-6", theme.muted)}>{subtitle}</p>
      </div>
    </div>

    <div className="flex shrink-0 items-center justify-end gap-3">
      {children}

      {amount !== undefined ? (
        <div
          className={cx(
            "rounded-card border px-3 py-2 text-right",
            theme.amountChip
          )}
        >
          <p className="text-xs font-medium opacity-75">Amount</p>
          <p className="text-base font-bold">{amount}</p>
        </div>
      ) : null}
    </div>
  </div>
);

const BonusDashboard = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";
  const theme = useMemo(() => getSoftTheme(isDark), [isDark]);

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
    <div className={cx("min-h-full", theme.pageSection)}>

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
                  <SoftActivityRow
                    key={item._id}
                    isDark={isDark}
                    theme={theme}
                    icon={<WalletCards className="h-5 w-5" />}
                    title={item.type}
                    subtitle={
                      <>
                        Before: {formatCurrency(item.balanceBefore)} → After:{" "}
                        {formatCurrency(item.balanceAfter)}
                      </>
                    }
                    amount={formatCurrency(item.amount)}
                  />
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
                  <SoftActivityRow
                    key={item._id}
                    isDark={isDark}
                    theme={theme}
                    icon={<BadgeDollarSign className="h-5 w-5" />}
                    title={item.mt5Account}
                    subtitle={
                      <>
                        Lot: {formatNumber(item.totalLot)} • Wallet:{" "}
                        {formatCurrency(item.walletBefore)} →{" "}
                        {formatCurrency(item.walletAfter)}
                      </>
                    }
                    amount={formatCurrency(item.bonusAmount)}
                  >
                    <BonusStatusBadge isDark={isDark} status={item.status} />
                  </SoftActivityRow>
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
            <div
              className={cx(
                "overflow-hidden rounded-card border","border-line"
              )}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm table-stack">
                  <thead>
                    <tr
                      className={cx(
                        "border-b text-xs uppercase tracking-[0.16em]",
                        theme.tableHead
                      )}
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
                        className={cx(
                          "border-t transition-colors duration-200",
                          theme.tableRow
                        )}
                      >
                        <td data-label="MT5 Account"
                          className={cx(
                            "px-4 py-4 font-semibold",
                            theme.tableCellText
                          )}
                        >
                          <span
                            className={cx(
                              "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
                              theme.chip
                            )}
                          >
                            #{item.mt5Account}
                          </span>
                        </td>

                        <td data-label="Deposit" className={cx("px-4 py-4", theme.tableCellText)}>
                          {formatCurrency(item.deposit)}
                        </td>

                        <td data-label="Bonus" className="px-4 py-4">
                          <span
                            className={cx(
                              "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                              theme.amountChip
                            )}
                          >
                            {formatCurrency(item.bonus)}
                          </span>
                        </td>

                        <td data-label="Status" className="px-4 py-4">
                          <BonusStatusBadge isDark={isDark} status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </BonusSectionCard>
      </div>
    </div>
  );
};

export default BonusDashboard;