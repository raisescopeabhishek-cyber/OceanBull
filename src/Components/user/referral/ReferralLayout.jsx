import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Radar } from "lucide-react";

import ReferralMiniSidebar from "./components/ReferralMiniSidebar";
import { cx } from "./components/ReferralPrimitives";
import useReferralPanel from "./hooks/useReferralPanel";

const titleMap = [
  ["/user/referral/dashboard", "Referral Dashboard"],
  ["/user/referral/overview", "Referral Overview"],
  ["/user/referral/commission", "Commission Center"],
  ["/user/referral/withdraw", "Withdraw Earnings"],
  ["/user/referral/history", "Withdrawal History"],
  ["/user/referral/ib-users", "IB Users"],
  ["/user/referral/my-referrals", "My Referrals"],
];

const ReferralLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const panel = useReferralPanel();

  const currentTitle =
    titleMap.find(([path]) => location.pathname.startsWith(path))?.[1] ||
    "Referral Center";

  const shellStyle = {
    borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(42, 86, 220,0.14)",
    background: isDark
      ? "linear-gradient(180deg, rgba(15, 24, 41,0.96), rgba(15, 24, 41,0.90))"
      : "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,251,235,0.82))",
    boxShadow: isDark
      ? "0 18px 55px rgba(0,0,0,0.34)"
      : "0 14px 40px rgba(42, 86, 220,0.08)",
    backdropFilter: "blur(10px)",
  };

  const headerStyle = {
    background: isDark
      ? "linear-gradient(135deg, rgba(19, 32, 52,1), rgba(15, 24, 41,1))"
      : "linear-gradient(135deg, #4f7df6, #2a56dc)",
  };

  const softCardStyle = {
    borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.22)",
    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(12px)",
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-3 sm:p-4 xl:grid-cols-[300px_minmax(0,1fr)]">
      <ReferralMiniSidebar isDark={isDark} />

      <div
        className="relative min-h-[780px] overflow-hidden rounded-card border transition-all duration-300"
        style={shellStyle}
      >
        <div className="pointer-events-none absolute -right-12 top-0 h-52 w-52 rounded-full bg-primary-soft blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-[-50px] h-52 w-52 rounded-full bg-primary-soft blur-3xl" />

        <div
          className="relative overflow-hidden px-4 py-5 sm:px-6"
          style={headerStyle}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-12 top-0 h-40 w-40 rounded-full bg-surface-3 blur-3xl" />
            <div className="absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-surface-2 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => navigate("/user/dashboard")}
                className="inline-flex shrink-0 items-center gap-2 rounded-card border border-line bg-surface-2 px-3 py-2 text-sm font-semibold text-text backdrop-blur-sm transition-all hover:bg-surface-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text backdrop-blur-sm">
                  <Radar size={13} />
                  Self Panel
                </div>

                <h1
                  className="mt-3 text-2xl font-bold tracking-tight text-text sm:text-3xl"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {currentTitle}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  {panel.hasReferralAccount
                    ? `Referral ID: ${panel.loggedUser?.referralAccount}`
                    : "Create your referral identity and start earning commission."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                className="rounded-card border px-4 py-2 text-sm"
                style={softCardStyle}
              >
                Referrals:{" "}
                <span className="font-bold text-text">
                  {panel.totalReferrals}
                </span>
              </div>

              <div
                className="rounded-card border px-4 py-2 text-sm"
                style={softCardStyle}
              >
                Earned:{" "}
                <span className="font-bold text-text">
                  ${Number(panel.totalCommission || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative p-4 sm:p-6">
          <Outlet context={{ ...panel, isDark }} />
        </div>
      </div>
    </div>
  );
};

export default ReferralLayout;