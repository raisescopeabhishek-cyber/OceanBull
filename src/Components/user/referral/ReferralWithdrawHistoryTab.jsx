import React, { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { RefreshCw, Clock, BadgeDollarSign, CheckCircle2, XCircle } from "lucide-react";

import {
  buttonSecondary,
  EmptyState,
  panelCard,
  StatCard,
  cx,
  muted,
  titleText,
} from "./components/ReferralPrimitives";
import {
  formatDateTime,
  formatMoney,
  methodLabel,
  timeAgo,
} from "./hooks/useReferralPanel";

const ReferralWithdrawHistoryTab = () => {
  const {
    isDark,
    hasReferralAccount,
    withdrawals,
    loadingWithdrawals,
    fetchWithdrawals,
    generateReferralAccount,
    generatingAccount,
  } = useOutletContext();

  const stats = useMemo(() => {
    const pending = withdrawals.filter(
      (item) => String(item?.status).toLowerCase() === "pending"
    );
    const approved = withdrawals.filter(
      (item) => String(item?.status).toLowerCase() === "approved"
    );
    const rejected = withdrawals.filter(
      (item) => String(item?.status).toLowerCase() === "rejected"
    );

    const sumAmount = (rows) =>
      rows.reduce((sum, row) => sum + Number(row?.amount || 0), 0);

    return {
      total: withdrawals.length,
      pendingCount: pending.length,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
      totalRequested: sumAmount(withdrawals),
      pendingAmount: sumAmount(pending),
      approvedAmount: sumAmount(approved),
    };
  }, [withdrawals]);

  if (!hasReferralAccount) {
    return (
      <EmptyState
        isDark={isDark}
        title="No withdrawal history yet"
        text="Generate your referral account first. Then every payout request will appear here with status and updated time."
        actionLabel="Generate Referral Account"
        onAction={generateReferralAccount}
        loading={generatingAccount}
      />
    );
  }

  const statusChip = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "approved") {
      return isDark
        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (value === "rejected") {
      return isDark
        ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
        : "border-rose-200 bg-rose-50 text-rose-700";
    }

    return isDark
      ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
      : "border-amber-200 bg-amber-50 text-amber-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={cx("text-2xl font-bold", titleText(isDark))}>
            Withdrawal history
          </h2>
          <p className={cx("mt-2 text-sm", muted(isDark))}>
            See every payout request with amount, method, and status.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchWithdrawals}
          className={buttonSecondary(isDark)}
        >
          <RefreshCw
            size={16}
            className={loadingWithdrawals ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          isDark={isDark}
          icon={BadgeDollarSign}
          title="Total Requested"
          value={formatMoney(stats.totalRequested, 4)}
          subtitle={`${stats.total} total requests`}
          tone="sky"
        />

        <StatCard
          isDark={isDark}
          icon={Clock}
          title="Pending"
          value={stats.pendingCount}
          subtitle={formatMoney(stats.pendingAmount, 4)}
          tone="amber"
        />

        <StatCard
          isDark={isDark}
          icon={CheckCircle2}
          title="Approved"
          value={stats.approvedCount}
          subtitle={formatMoney(stats.approvedAmount, 4)}
          tone="emerald"
        />

        <StatCard
          isDark={isDark}
          icon={XCircle}
          title="Rejected"
          value={stats.rejectedCount}
          subtitle="Not approved by admin"
          tone="violet"
        />
      </div>

      <section className={panelCard(isDark, "p-6")}>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead>
              <tr
                className={cx(
                  "border-b text-left text-xs uppercase tracking-[0.16em]",
                  isDark
                    ? "border-white/10 text-white/45"
                    : "border-sky-100 text-slate-500"
                )}
              >
                <th className="px-4 py-3">Total Balance</th>
                <th className="px-4 py-3">Withdraw Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {loadingWithdrawals ? (
                <tr>
                  <td
                    colSpan={5}
                    className={cx("px-4 py-12 text-center text-sm", muted(isDark))}
                  >
                    Loading withdrawal history...
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className={cx("px-4 py-12 text-center text-sm", muted(isDark))}
                  >
                    No withdrawal history available.
                  </td>
                </tr>
              ) : (
                withdrawals.map((item, index) => (
                  <tr
                    key={item?._id || index}
                    className={cx(
                      "border-b",
                      isDark ? "border-white/5" : "border-sky-100/80"
                    )}
                  >
                    <td className={cx("px-4 py-4 text-sm", titleText(isDark))}>
                      {formatMoney(item?.totalBalance || 0, 4)}
                    </td>

                    <td className={cx("px-4 py-4 text-sm", titleText(isDark))}>
                      {formatMoney(item?.amount || 0, 4)}
                    </td>

                    <td className={cx("px-4 py-4 text-sm", muted(isDark))}>
                      {methodLabel(item?.method)}
                    </td>

                    <td className="px-4 py-4">
                      <p className={cx("text-sm", titleText(isDark))}>
                        {formatDateTime(item?.updatedAt)}
                      </p>
                      <p className={cx("mt-1 text-xs", muted(isDark))}>
                        {timeAgo(item?.updatedAt)}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={cx(
                          "inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                          statusChip(item?.status)
                        )}
                      >
                        {String(item?.status || "pending").toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ReferralWithdrawHistoryTab;