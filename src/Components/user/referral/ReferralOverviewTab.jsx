import React from "react";
import { useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Copy,
  Link2,
  Share2,
  Sparkles,
  Users,
  BadgeDollarSign,
  TrendingUp,
} from "lucide-react";

import {
  buttonPrimary,
  buttonSecondary,
  EmptyState,
  panelCard,
  softCard,
  cx,
  muted,
  titleText,
} from "./components/ReferralPrimitives";

const ReferralOverviewTab = () => {
  const {
    isDark,
    hasReferralAccount,
    referralLink,
    commissionRateLabel,
    totalReferrals,
    activeReferrals,
    loggedUser,
    generateReferralAccount,
    generatingAccount,
  } = useOutletContext();

  if (!hasReferralAccount) {
    return (
      <EmptyState
        isDark={isDark}
        title="No referral account yet"
        text="Create your referral account first. Once active, this page will show your link, your sharing shortcuts, and your program details."
        actionLabel="Generate Referral Account"
        onAction={generateReferralAccount}
        loading={generatingAccount}
      />
    );
  }

  const shareText = `Join me and earn with this broker — sign up here: ${referralLink}`;

  const shareTargets = [
    {
      label: "WhatsApp",
      onClick: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText)}`,
          "_blank"
        ),
    },
    {
      label: "Facebook",
      onClick: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            referralLink
          )}`,
          "_blank"
        ),
    },
    {
      label: "X / Twitter",
      onClick: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText
          )}`,
          "_blank"
        ),
    },
    {
      label: "Native Share",
      onClick: async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: "Referral Link",
              text: shareText,
              url: referralLink,
            });
          } catch (error) {
            // ignore
          }
          return;
        }
        toast("Native share is not supported on this device.");
      },
    },
  ];

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied");
  };

  const steps = [
    {
      title: "Invite users",
      text: "Share your personal signup link directly from this panel.",
    },
    {
      title: "Track IB activity",
      text: "Once users start trading, their lot and commission records appear in your IB pages.",
    },
    {
      title: "Withdraw earnings",
      text: "When balance is available, request payout from the withdraw page.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.25fr_.95fr]">
        <section className={panelCard(isDark, "p-6")}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div
                className={cx(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]","border-line bg-primary-soft text-primary"
                )}
              >
                <Sparkles size={13} />
                Link & Identity
              </div>

              <h2 className={cx("mt-3 text-2xl font-bold", titleText(isDark))}>
                Your referral profile
              </h2>
              <p className={cx("mt-2 text-sm leading-7", muted(isDark))}>
                A dedicated self-service area for sharing, onboarding, and
                tracking referral growth.
              </p>
            </div>

            <div className={softCard(isDark, "px-4 py-3 text-right")}>
              <p className={cx("text-xs uppercase tracking-[0.18em]", muted(isDark))}>
                Referral ID
              </p>
              <h3 className={cx("mt-2 text-2xl font-bold", titleText(isDark))}>
                {loggedUser?.referralAccount}
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
                  "flex min-h-[54px] flex-1 items-center rounded-card border px-4 text-sm","border-line bg-surface-2 text-muted"
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
                  Copy Link
                </button>

                <button
                  type="button"
                  onClick={shareTargets[3].onClick}
                  className={buttonPrimary(isDark)}
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className={softCard(isDark, "p-4")}>
                <div
                  className={cx(
                    "flex h-10 w-10 items-center justify-center rounded-card text-sm font-bold","bg-primary-soft text-primary"
                  )}
                >
                  0{index + 1}
                </div>

                <h4 className={cx("mt-4 font-semibold", titleText(isDark))}>
                  {step.title}
                </h4>
                <p className={cx("mt-2 text-sm leading-6", muted(isDark))}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className={panelCard(isDark, "p-6")}>
          <h3 className={cx("text-lg font-bold", titleText(isDark))}>
            Share channels
          </h3>
          <p className={cx("mt-2 text-sm leading-6", muted(isDark))}>
            Push your referral link faster through your preferred channel.
          </p>

          <div className="mt-5 grid gap-3">
            {shareTargets.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={cx(
                  "flex items-center justify-between rounded-card border px-4 py-4 text-left transition-all","border-line bg-surface-2 hover:bg-surface-2"
                )}
              >
                <div>
                  <p className={cx("font-semibold", titleText(isDark))}>
                    {item.label}
                  </p>
                  <p className={cx("mt-1 text-sm", muted(isDark))}>
                    Open and share your link instantly
                  </p>
                </div>

                <Share2
                  size={18}
                  className={"text-subtle"}
                />
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className={softCard(isDark, "p-4")}>
              <Users size={18} className={"text-primary"} />
              <p className={cx("mt-3 text-xs uppercase tracking-[0.18em]", muted(isDark))}>
                Direct Referrals
              </p>
              <h4 className={cx("mt-2 text-xl font-bold", titleText(isDark))}>
                {totalReferrals}
              </h4>
            </div>

            <div className={softCard(isDark, "p-4")}>
              <TrendingUp size={18} className={"text-primary"} />
              <p className={cx("mt-3 text-xs uppercase tracking-[0.18em]", muted(isDark))}>
                Active IB Users
              </p>
              <h4 className={cx("mt-2 text-xl font-bold", titleText(isDark))}>
                {activeReferrals}
              </h4>
            </div>

            <div className={softCard(isDark, "p-4")}>
              <BadgeDollarSign size={18} className={"text-primary"} />
              <p className={cx("mt-3 text-xs uppercase tracking-[0.18em]", muted(isDark))}>
                Commission Rate
              </p>
              <h4 className={cx("mt-2 text-xl font-bold", titleText(isDark))}>
                {commissionRateLabel}
              </h4>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReferralOverviewTab;