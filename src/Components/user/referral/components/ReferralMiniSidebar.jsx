import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Share2,
  BadgeDollarSign,
  Wallet,
  History,
  Users,
  UserPlus,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { cx, panelCard } from "./ReferralPrimitives";

const menu = [
  {
    label: "Dashboard",
    path: "/user/referral/dashboard",
    icon: LayoutDashboard,
    desc: "Referral home cockpit",
  },
  {
    label: "Overview",
    path: "/user/referral/overview",
    icon: Share2,
    desc: "Link, sharing, profile",
  },
  {
    label: "Commission",
    path: "/user/referral/commission",
    icon: BadgeDollarSign,
    desc: "Earnings and volume",
  },
  {
    label: "Withdraw",
    path: "/user/referral/withdraw",
    icon: Wallet,
    desc: "Request IB payout",
  },
  {
    label: "History",
    path: "/user/referral/history",
    icon: History,
    desc: "Withdrawal records",
  },
  {
    label: "IB Users",
    path: "/user/referral/ib-users",
    icon: Users,
    desc: "Accounts under you",
  },
  // {
  //   label: "My Referrals",
  //   path: "/user/referral/my-referrals",
  //   icon: UserPlus,
  //   desc: "Direct invited users",
  // },
];

const ReferralMiniSidebar = ({ isDark }) => {
  return (
    <aside className={panelCard(isDark, "overflow-hidden relative")}>
      <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative p-5">
        <div
          className={cx(
            "rounded-[24px] border p-5",
            isDark
              ? "border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.03]"
              : "border-sky-100 bg-gradient-to-br from-white via-sky-50 to-cyan-50"
          )}
        >
          <div
            className={cx(
              "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
              isDark
                ? "border-cyan-400/20 bg-cyan-500/10 text-cyan-200"
                : "border-cyan-200 bg-cyan-50 text-cyan-700"
            )}
          >
            <Sparkles size={13} />
            Referral Studio
          </div>

          <h2 className={cx("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>
            Affiliate Control Room
          </h2>

          <p
            className={cx(
              "mt-2 text-sm leading-6",
              isDark ? "text-white/55" : "text-slate-600"
            )}
          >
            A cleaner self-panel for referral growth, earnings, IB users,
            and payout tracking.
          </p>
        </div>

        <div className="mt-5 space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cx(
                    "group flex items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-200",
                    isActive
                      ? isDark
                        ? "border-cyan-400/30 bg-cyan-400/10 text-white"
                        : "border-sky-200 bg-sky-50 text-slate-900"
                      : isDark
                      ? "border-white/10 bg-white/[0.025] text-white/70 hover:bg-white/[0.05]"
                      : "border-sky-100 bg-white/70 text-slate-700 hover:bg-sky-50/80"
                  )
                }
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cx(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                      isDark
                        ? "bg-white/[0.06] text-cyan-200"
                        : "bg-sky-100 text-sky-700"
                    )}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.label}</p>
                    <p
                      className={cx(
                        "truncate text-xs",
                        isDark ? "text-white/45" : "text-slate-500"
                      )}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>

                <ChevronRight
                  size={16}
                  className="shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5"
                />
              </NavLink>
            );
          })}
        </div>

        <div
          className={cx(
            "mt-5 rounded-[22px] border p-4",
            isDark
              ? "border-white/10 bg-white/[0.03]"
              : "border-sky-100 bg-sky-50/60"
          )}
        >
          <p className={cx("text-xs uppercase tracking-[0.18em]", isDark ? "text-white/35" : "text-slate-500")}>
            Visual Theme
          </p>
          <p className={cx("mt-2 text-sm leading-6", isDark ? "text-white/65" : "text-slate-600")}>
            Unlike the bonus panel’s warm orange look, this module uses a
            cooler cyan-violet identity to feel like a separate product area.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default ReferralMiniSidebar;