import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Radar } from "lucide-react";

import ReferralMiniSidebar from "./components/ReferralMiniSidebar";
import { cx, panelCard, pill } from "./components/ReferralPrimitives";
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

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)] p-3 sm:p-4">
      <ReferralMiniSidebar isDark={isDark} />

      <div className={panelCard(isDark, "min-h-[780px] overflow-hidden relative")}>
        <div className="pointer-events-none absolute -right-12 top-0 h-52 w-52 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-[-50px] h-52 w-52 rounded-full bg-violet-500/15 blur-3xl" />

        <div
          className={cx(
            "relative border-b px-4 py-4 sm:px-6",
            isDark ? "border-white/10" : "border-sky-100"
          )}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/user/dashboard")}
                className={cx(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                  isDark
                    ? "bg-white/5 text-white hover:bg-white/10"
                    : "bg-sky-50 text-sky-700 hover:bg-sky-100"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>

              <div>
                <div className={pill(isDark)}>
                  <Radar size={13} />
                  Self Panel
                </div>
                <h1 className={cx("mt-2 text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                  {currentTitle}
                </h1>
                <p className={cx("mt-1 text-sm", isDark ? "text-white/55" : "text-slate-600")}>
                  {panel.hasReferralAccount
                    ? `Referral ID: ${panel.loggedUser?.referralAccount}`
                    : "Create your referral identity and start earning commission."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                className={cx(
                  "rounded-2xl border px-4 py-2 text-sm",
                  isDark
                    ? "border-white/10 bg-white/[0.04] text-white/75"
                    : "border-sky-100 bg-white text-slate-600"
                )}
              >
                Referrals:{" "}
                <span className={cx("font-bold", isDark ? "text-white" : "text-slate-900")}>
                  {panel.totalReferrals}
                </span>
              </div>

              <div
                className={cx(
                  "rounded-2xl border px-4 py-2 text-sm",
                  isDark
                    ? "border-white/10 bg-white/[0.04] text-white/75"
                    : "border-sky-100 bg-white text-slate-600"
                )}
              >
                Earned:{" "}
                <span className={cx("font-bold", isDark ? "text-white" : "text-slate-900")}>
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