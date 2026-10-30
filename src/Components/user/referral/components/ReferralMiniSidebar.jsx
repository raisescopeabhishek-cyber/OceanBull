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
      <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-primary-soft blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-primary-soft blur-3xl" />

      <div className="relative p-5">
        <div
          className={cx(
            "rounded-card border p-5","border-line"
          )}
        >
          <div
            className={cx(
              "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]","border-line bg-primary-soft text-primary"
            )}
          >
            <Sparkles size={13} />
            Referral Studio
          </div>

          <h2 className={cx("text-xl font-bold","text-text")}>
            Affiliate Control Room
          </h2>

          <p
            className={cx(
              "mt-2 text-sm leading-6","text-subtle"
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
                    "group flex items-center justify-between rounded-card border px-4 py-3 transition-all duration-200",
                    isActive
                      ?"border-line bg-primary-soft text-text"
                      :"border-line bg-surface-2 text-muted hover:bg-surface-2"
                  )
                }
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cx(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-card","bg-surface-2 text-primary"
                    )}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.label}</p>
                    <p
                      className={cx(
                        "truncate text-xs","text-subtle"
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
            "mt-5 rounded-card border p-4","border-line bg-surface-2"
          )}
        >
          <p className={cx("text-xs uppercase tracking-[0.18em]","text-subtle")}>
            Visual Theme
          </p>
          <p className={cx("mt-2 text-sm leading-6","text-muted")}>
            Unlike the bonus panel’s warm orange look, this module uses a
            cooler cyan-violet identity to feel like a separate product area.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default ReferralMiniSidebar;