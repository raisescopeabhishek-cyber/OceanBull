import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BadgeDollarSign,
  Copy,
  Link2,
  Share2,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  ArrowRight,
} from "lucide-react";

import {
  buttonPrimary,
  buttonSecondary,
  EmptyState,
  panelCard,
  softCard,
  StatCard,
  cx,
  muted,
  titleText,
} from "./components/ReferralPrimitives";
import { formatMoney } from "./hooks/useReferralPanel";

const ReferralDashboard = () => {
  const navigate = useNavigate();

  const {
    isDark,
    hasReferralAccount,
    referralLink,
    totalCommission,
    totalReferrals,
    activeReferrals,
    approvedWithdrawalAmount,
    commissionRateLabel,
    generateReferralAccount,
    generatingAccount,
    loggedUser,
  } = useOutletContext();

  const copyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied");
  };

  const shareNow = async () => {
    if (!referralLink) return;

    const message = `Join me and earn with this broker — sign up here: ${referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Referral Link",
          text: message,
          url: referralLink,
        });
        return;
      } catch (error) {
        // ignore
      }
    }

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  if (!hasReferralAccount) {
    return (
      <EmptyState
        isDark={isDark}
        title="Launch your Referral Studio"
        text="This new referral self-panel is ready. Generate your affiliate account first, then you’ll get your own referral link, commission dashboard, IB users, and withdrawal center."
        actionLabel="Generate Referral Account"
        onAction={generateReferralAccount}
        loading={generatingAccount}
      />
    );
  }

  const quickLinks = [
    {
      title: "Open Overview",
      desc: "See your link, sharing blocks, and account summary.",
      path: "/user/referral/overview",
    },
    {
      title: "Commission Center",
      desc: "Check earnings, volume, and active IB performance.",
      path: "/user/referral/commission",
    },
    {
      title: "Withdraw Now",
      desc: "Submit IB withdrawal using bank or wallet.",
      path: "/user/referral/withdraw",
    },
    {
      title: "View History",
      desc: "Track pending, approved, and rejected withdrawals.",
      path: "/user/referral/history",
    },
    {
      title: "IB Users",
      desc: "Inspect underlying accounts and close-trade access.",
      path: "/user/referral/ib-users",
    },
    {
      title: "My Referrals",
      desc: "See the users who joined through your referral link.",
      path: "/user/referral/my-referrals",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          isDark={isDark}
          icon={BadgeDollarSign}
          title="Total Earned"
          value={formatMoney(totalCommission, 4)}
          subtitle="All-time referral commission"
          tone="emerald"
        />

        <StatCard
          isDark={isDark}
          icon={Users}
          title="Total Referrals"
          value={totalReferrals}
          subtitle="Users connected to your invite"
          tone="sky"
        />

        <StatCard
          isDark={isDark}
          icon={TrendingUp}
          title="Active Traders"
          value={activeReferrals}
          subtitle="IB users currently producing data"
          tone="violet"
        />

        <StatCard
          isDark={isDark}
          icon={Wallet}
          title="Approved Payouts"
          value={formatMoney(approvedWithdrawalAmount, 4)}
          subtitle="Already approved and released"
          tone="amber"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_.9fr]">
        <section className={panelCard(isDark, "p-6 relative overflow-hidden")}>
          <div className="pointer-events-none absolute -top-10 right-0 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div
                  className={cx(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                    isDark
                      ? "border-cyan-400/20 bg-cyan-500/10 text-cyan-200"
                      : "border-cyan-200 bg-cyan-50 text-cyan-700"
                  )}
                >
                  <Sparkles size={13} />
                  Launchpad
                </div>

                <h2 className={cx("mt-3 text-2xl font-bold", titleText(isDark))}>
                  Your referral command center
                </h2>
                <p className={cx("mt-2 max-w-2xl text-sm leading-7", muted(isDark))}>
                  This panel replaces the old single-screen referral tabs with a
                  dedicated module. You now have your own route, sidebar, header,
                  and unique visual identity.
                </p>
              </div>

              <div
                className={softCard(
                  isDark,
                  "min-w-[180px] px-4 py-3 text-right"
                )}
              >
                <p className={cx("text-xs uppercase tracking-[0.18em]", muted(isDark))}>
                  Commission Rate
                </p>
                <h3 className={cx("mt-2 text-3xl font-bold", titleText(isDark))}>
                  {commissionRateLabel}
                </h3>
              </div>
            </div>

            <div className={softCard(isDark, "mt-6 p-4")}>
              <p className={cx("mb-2 text-sm font-medium", muted(isDark))}>
                Referral Link
              </p>

              <div className="flex flex-col gap-3 xl:flex-row">
                <div
                  className={cx(
                    "flex min-h-[54px] flex-1 items-center rounded-2xl border px-4 text-sm",
                    isDark
                      ? "border-white/10 bg-white/[0.05] text-white/85"
                      : "border-sky-100 bg-white text-slate-700"
                  )}
                >
                  <Link2 size={16} className="mr-2 shrink-0 opacity-60" />
                  <span className="truncate">{referralLink}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyLink}
                    className={buttonSecondary(isDark)}
                  >
                    <Copy size={16} />
                    Copy
                  </button>

                  <button
                    type="button"
                    onClick={shareNow}
                    className={buttonPrimary(isDark)}
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className={softCard(isDark, "p-4")}>
                <Shield size={18} className={isDark ? "text-cyan-200" : "text-sky-700"} />
                <h4 className={cx("mt-3 font-semibold", titleText(isDark))}>
                  Unique Identity
                </h4>
                <p className={cx("mt-2 text-sm leading-6", muted(isDark))}>
                  Your referral ID is active and ready to use.
                </p>
                <p className={cx("mt-3 text-lg font-bold", titleText(isDark))}>
                  {loggedUser?.referralAccount}
                </p>
              </div>

              <div className={softCard(isDark, "p-4")}>
                <Users size={18} className={isDark ? "text-cyan-200" : "text-sky-700"} />
                <h4 className={cx("mt-3 font-semibold", titleText(isDark))}>
                  Direct Growth
                </h4>
                <p className={cx("mt-2 text-sm leading-6", muted(isDark))}>
                  Track your real referral count and conversion activity.
                </p>
                <p className={cx("mt-3 text-lg font-bold", titleText(isDark))}>
                  {totalReferrals} users
                </p>
              </div>

              <div className={softCard(isDark, "p-4")}>
                <TrendingUp size={18} className={isDark ? "text-cyan-200" : "text-sky-700"} />
                <h4 className={cx("mt-3 font-semibold", titleText(isDark))}>
                  Trading Activity
                </h4>
                <p className={cx("mt-2 text-sm leading-6", muted(isDark))}>
                  IB users producing lot/commission data appear here.
                </p>
                <p className={cx("mt-3 text-lg font-bold", titleText(isDark))}>
                  {activeReferrals} active
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={panelCard(isDark, "p-6")}>
          <h3 className={cx("text-lg font-bold", titleText(isDark))}>
            Quick route map
          </h3>
          <p className={cx("mt-2 text-sm leading-6", muted(isDark))}>
            Every major referral action now lives in its own page instead of one
            overloaded tab component.
          </p>

          <div className="mt-5 space-y-3">
            {quickLinks.map((item) => (
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
                  <p className={cx("mt-1 text-sm", muted(isDark))}>{item.desc}</p>
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

export default ReferralDashboard;