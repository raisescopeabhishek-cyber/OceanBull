import React, { useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  BadgeDollarSign,
  BarChart3,
  Wallet,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

import {
  buttonSecondary,
  EmptyState,
  panelCard,
  StatCard,
  cx,
  muted,
  titleText,
} from "./components/ReferralPrimitives";
import { formatMoney } from "./hooks/useReferralPanel";

const ReferralCommissionTab = () => {
  const navigate = useNavigate();

  const {
    isDark,
    hasReferralAccount,
    totalCommission,
    ibBalance,
    approvedWithdrawalAmount,
    commissionsData,
    activeReferrals,
    loadingCommissions,
    refreshAll,
    generateReferralAccount,
    generatingAccount,
  } = useOutletContext();

  const totalLots = useMemo(() => {
    return commissionsData.reduce(
      (sum, row) => sum + Number(row?.totalLot || 0),
      0
    );
  }, [commissionsData]);

  if (!hasReferralAccount) {
    return (
      <EmptyState
        isDark={isDark}
        title="Commission center is waiting"
        text="Generate your referral account first. Your earnings, lots, IB users, and withdrawal actions will appear here."
        actionLabel="Generate Referral Account"
        onAction={generateReferralAccount}
        loading={generatingAccount}
      />
    );
  }

  const recentRows = commissionsData.slice(0, 8);

  const quickCards = [
    {
      title: "Withdraw balance",
      desc: "Send a payout request from your available IB balance.",
      path: "/user/referral/withdraw",
    },
    {
      title: "Withdrawal history",
      desc: "Review pending and approved withdrawals.",
      path: "/user/referral/history",
    },
    {
      title: "Inspect IB users",
      desc: "See account-level lot and commission details.",
      path: "/user/referral/ib-users",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={cx("text-2xl font-bold", titleText(isDark))}>
            Commission center
          </h2>
          <p className={cx("mt-2 text-sm", muted(isDark))}>
            A focused view for earnings, lots, payout state, and IB activity.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshAll}
          className={buttonSecondary(isDark)}
        >
          <RefreshCw
            size={16}
            className={loadingCommissions ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          isDark={isDark}
          icon={BadgeDollarSign}
          title="Total Commission"
          value={formatMoney(totalCommission, 4)}
          subtitle="Lifetime IB earnings"
          tone="emerald"
        />

        <StatCard
          isDark={isDark}
          icon={Wallet}
          title="Withdrawable Balance"
          value={formatMoney(ibBalance, 4)}
          subtitle="Available to request"
          tone="sky"
        />

        <StatCard
          isDark={isDark}
          icon={BarChart3}
          title="Total Lots"
          value={Number(totalLots || 0).toFixed(4)}
          subtitle="Combined traded volume"
          tone="violet"
        />

        <StatCard
          isDark={isDark}
          icon={BadgeDollarSign}
          title="Approved Withdrawals"
          value={formatMoney(approvedWithdrawalAmount, 4)}
          subtitle={`${activeReferrals} active IB users`}
          tone="amber"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_.95fr]">
        <section className={panelCard(isDark, "p-6")}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className={cx("text-lg font-bold", titleText(isDark))}>
                Recent commission rows
              </h3>
              <p className={cx("mt-2 text-sm", muted(isDark))}>
                Quick snapshot of your latest IB-linked rows.
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-[860px] w-full">
              <thead>
                <tr
                  className={cx(
                    "border-b text-left text-xs uppercase tracking-[0.16em]",
                    isDark
                      ? "border-white/10 text-white/45"
                      : "border-sky-100 text-slate-500"
                  )}
                >
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Lots</th>
                  <th className="px-4 py-3">Commission</th>
                </tr>
              </thead>

              <tbody>
                {recentRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className={cx(
                        "px-4 py-10 text-center text-sm",
                        muted(isDark)
                      )}
                    >
                      No commission rows available yet.
                    </td>
                  </tr>
                ) : (
                  recentRows.map((row, index) => (
                    <tr
                      key={`${row?.email || "row"}-${index}`}
                      className={cx(
                        "border-b",
                        isDark ? "border-white/5" : "border-sky-100/80"
                      )}
                    >
                      <td className="px-4 py-4">
                        <p className={cx("font-semibold", titleText(isDark))}>
                          {row?.name || "-"}
                        </p>
                        <p className={cx("mt-1 text-xs", muted(isDark))}>
                          {row?.email || "-"}
                        </p>
                      </td>
                      <td className={cx("px-4 py-4 text-sm", muted(isDark))}>
                        {row?.country || "-"}
                      </td>
                      <td className={cx("px-4 py-4 text-sm", muted(isDark))}>
                        {row?.accountNumber || "-"}
                      </td>
                      <td className={cx("px-4 py-4 text-sm", muted(isDark))}>
                        {row?.level ?? "-"}
                      </td>
                      <td className={cx("px-4 py-4 text-sm", muted(isDark))}>
                        {Number(row?.totalLot || 0).toFixed(4)}
                      </td>
                      <td className={cx("px-4 py-4 text-sm", titleText(isDark))}>
                        {formatMoney(
                          row?.totalCommission || row?.commission || 0,
                          4
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={panelCard(isDark, "p-6")}>
          <h3 className={cx("text-lg font-bold", titleText(isDark))}>
            Quick actions
          </h3>
          <p className={cx("mt-2 text-sm", muted(isDark))}>
            Jump directly into payout flow or deeper IB analysis.
          </p>

          <div className="mt-5 space-y-3">
            {quickCards.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={cx(
                  "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all",
                  isDark
                    ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]"
                    : "border-sky-100 bg-sky-50/50 hover:bg-sky-50"
                )}
              >
                <div>
                  <p className={cx("font-semibold", titleText(isDark))}>
                    {item.title}
                  </p>
                  <p className={cx("mt-1 text-sm", muted(isDark))}>
                    {item.desc}
                  </p>
                </div>

                <ArrowRight
                  size={18}
                  className={isDark ? "text-white/45" : "text-slate-500"}
                />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReferralCommissionTab;