import React from "react";
import { useOutletContext } from "react-router-dom";
import { RefreshCw, UserPlus, Users, TrendingUp } from "lucide-react";

import {
  buttonSecondary,
  EmptyState,
  panelCard,
  softCard,
  StatCard,
  cx,
  muted,
  titleText,
} from "./components/ReferralPrimitives";
import { formatDateTime } from "./hooks/useReferralPanel";

const ReferralMyReferralsTab = () => {
  const {
    isDark,
    hasReferralAccount,
    loggedUser,
    totalReferrals,
    activeReferrals,
    commissionRateLabel,
    refreshAll,
    generateReferralAccount,
    generatingAccount,
  } = useOutletContext();

  const referredUsers = loggedUser?.referredUsers || [];

  if (!hasReferralAccount) {
    return (
      <EmptyState
        isDark={isDark}
        title="No referral account yet"
        text="Generate your referral account first. After that, users who join with your link will appear here."
        actionLabel="Generate Referral Account"
        onAction={generateReferralAccount}
        loading={generatingAccount}
      />
    );
  }

  const initialsOf = (user) => {
    const source = user?.name || user?.email || "U";
    return source.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={cx("text-2xl font-bold", titleText(isDark))}>
            My referrals
          </h2>
          <p className={cx("mt-2 text-sm", muted(isDark))}>
            Direct invited users connected through your referral link.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshAll}
          className={buttonSecondary(isDark)}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          isDark={isDark}
          icon={Users}
          title="Total Referrals"
          value={totalReferrals}
          subtitle="Direct invited users"
          tone="sky"
        />

        <StatCard
          isDark={isDark}
          icon={TrendingUp}
          title="Active IB Users"
          value={activeReferrals}
          subtitle="Users producing trading data"
          tone="emerald"
        />

        <StatCard
          isDark={isDark}
          icon={UserPlus}
          title="Commission Rate"
          value={commissionRateLabel}
          subtitle="Configured referral percentage"
          tone="violet"
        />
      </div>

      <section className={panelCard(isDark, "p-6")}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className={cx("text-lg font-bold", titleText(isDark))}>
              Referred user list
            </h3>
            <p className={cx("mt-2 text-sm", muted(isDark))}>
              A clean directory view for your direct referrals.
            </p>
          </div>

          <div
            className={cx(
              "rounded-card border px-4 py-2 text-sm font-semibold","border-line bg-primary-soft text-primary"
            )}
          >
            {referredUsers.length} users
          </div>
        </div>

        {referredUsers.length === 0 ? (
          <div className={softCard(isDark, "mt-5 p-8 text-center")}>
            <p className={cx("text-sm", muted(isDark))}>
              No referrals yet.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {referredUsers.map((user, index) => (
              <div key={user?._id || user?.email || index} className={softCard(isDark, "p-4")}>
                <div className="flex items-start gap-3">
                  <div
                    className={cx(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-card text-sm font-bold","bg-primary-soft text-primary"
                    )}
                  >
                    {initialsOf(user)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={cx("truncate font-semibold", titleText(isDark))}>
                      {user?.name || "User"}
                    </p>
                    <p className={cx("mt-1 truncate text-sm", muted(isDark))}>
                      {user?.email || "No email"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={cx(
                          "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]","border-success bg-success-soft text-success"
                        )}
                      >
                        Active
                      </span>

                      {user?.createdAt ? (
                        <span
                          className={cx(
                            "inline-flex rounded-full border px-3 py-1 text-[11px]","border-line bg-surface-2 text-subtle"
                          )}
                        >
                          {formatDateTime(user.createdAt)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ReferralMyReferralsTab;