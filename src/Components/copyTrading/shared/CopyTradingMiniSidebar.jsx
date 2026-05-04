import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Copy,
  LayoutDashboard,
  Link2,
  RadioTower,
  ShieldCheck,
  UserRoundCog,
  Users,
} from "lucide-react";

import { cx } from "../utils/copyTradingHelpers";

const adminGroups = [
  {
    title: "Admin Report",
    links: [
      {
        label: "Overview",
        to: "/admin/copy-trading/dashboard",
        icon: LayoutDashboard,
        end: true,
      },
      {
        label: "Masters CRUD",
        to: "/admin/copy-trading/masters",
        icon: UserRoundCog,
      },
      {
        label: "Copiers CRUD",
        to: "/admin/copy-trading/copiers",
        icon: Users,
      },
      {
        label: "Trade History",
        to: "/admin/copy-trading/trades",
        icon: BarChart3,
      },
    ],
  },
];

const userGroups = [
  {
    title: "Client Overview",
    links: [
      {
        label: "Overview",
        to: "/user/copy-trading/dashboard",
        icon: LayoutDashboard,
        end: true,
      },
      {
        label: "Explore Masters",
        to: "/user/copy-trading/masters",
        icon: UserRoundCog,
      },
    ],
  },
  {
    title: "My Accounts",
    links: [
      {
        label: "My Master",
        to: "/user/copy-trading/my-master-accounts",
        icon: RadioTower,
      },
      {
        label: "My Copier",
        to: "/user/copy-trading/my-copier-accounts",
        icon: Users,
      },
    ],
  },
  {
    title: "Trade Reports",
    links: [
      {
        label: "Trade History",
        to: "/user/copy-trading/trades",
        icon: BarChart3,
      },
      {
        label: "Master Trades",
        to: "/user/copy-trading/master-trades",
        icon: RadioTower,
      },
      {
        label: "Copier Trades",
        to: "/user/copy-trading/copier-trades",
        icon: Users,
      },
    ],
  },
];

const getGroups = (role) => {
  return role === "admin" ? adminGroups : userGroups;
};

const getNavClass = ({ isActive, isDark }) => {
  return cx(
    "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200",
    isActive
      ? isDark
        ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200 shadow-[0_10px_30px_rgba(16,185,129,0.14)]"
        : "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-[0_10px_24px_rgba(16,185,129,0.12)]"
      : isDark
      ? "border-white/10 bg-white/[0.025] text-white/65 hover:border-emerald-400/20 hover:bg-emerald-500/10 hover:text-emerald-100"
      : "border-emerald-100/70 bg-white/70 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-emerald-700"
  );
};

const GroupTitle = ({ title, isDark }) => {
  return (
    <p
      className={cx(
        "px-2 pb-2 pt-4 text-[11px] font-black uppercase tracking-[0.18em]",
        isDark ? "text-white/35" : "text-slate-400"
      )}
    >
      {title}
    </p>
  );
};

const CopyTradingMiniSidebar = ({ role = "user", isDark }) => {
  const groups = getGroups(role);

  const shellStyle = {
    borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(16,185,129,0.16)",
    background: isDark
      ? "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(6,78,59,0.22))"
      : "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(236,253,245,0.88))",
    boxShadow: isDark
      ? "0 18px 55px rgba(0,0,0,0.28)"
      : "0 14px 40px rgba(16,185,129,0.10)",
    backdropFilter: "blur(10px)",
  };

  return (
    <div className="relative h-fit xl:min-h-[calc(100vh-2rem)] xl:w-[300px] xl:shrink-0">
      <aside
        className={cx(
          "relative h-fit overflow-hidden rounded-[26px] border p-4 transition-all duration-300",
          "xl:fixed xl:left-4 xl:top-4 xl:z-[50] xl:h-[calc(100vh-2rem)] xl:w-[300px] xl:overflow-y-auto xl:overflow-x-hidden"
        )}
        style={shellStyle}
      >
        <div className="pointer-events-none absolute -right-12 top-0 h-36 w-36 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-14 -left-12 h-40 w-40 rounded-full bg-green-400/12 blur-3xl" />

        <div className="relative z-10 flex min-h-full flex-col">
          <div
            className={cx(
              "mb-5 rounded-[22px] border p-4",
              isDark
                ? "border-white/10 bg-white/[0.035]"
                : "border-emerald-100 bg-white/75"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cx(
                  "flex h-12 w-12 items-center justify-center rounded-2xl border",
                  isDark
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                )}
              >
                <Copy className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <p
                  className={cx(
                    "truncate text-sm font-black",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  Copy Trading
                </p>

                <p
                  className={cx(
                    "mt-0.5 text-xs",
                    isDark ? "text-white/50" : "text-slate-500"
                  )}
                >
                  {role === "admin" ? "Admin Panel" : "Client Panel"}
                </p>
              </div>
            </div>

            <div
              className={cx(
                "mt-4 inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]",
                role === "admin"
                  ? isDark
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : isDark
                  ? "border-white/10 bg-white/[0.04] text-white/70"
                  : "border-emerald-100 bg-emerald-50 text-slate-600"
              )}
            >
              {role === "admin" ? "Admin Mode" : "User Mode"}
            </div>
          </div>

          <nav className="space-y-3">
            {groups.map((group) => (
              <div key={group.title}>
                <GroupTitle title={group.title} isDark={isDark} />

                <div className="space-y-2">
                  {group.links.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={Boolean(item.end)}
                        className={({ isActive }) =>
                          getNavClass({ isActive, isDark })
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div
            className={cx(
              "mt-5 rounded-2xl border p-4 text-xs leading-5 xl:mt-auto",
              isDark
                ? "border-white/10 bg-white/[0.035] text-white/55"
                : "border-emerald-100 bg-emerald-50/60 text-slate-600"
            )}
          >
            <div
              className={cx(
                "mb-2 flex items-center gap-2 font-bold",
                isDark ? "text-emerald-200" : "text-emerald-700"
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              Risk Notice
            </div>

            {role === "admin"
              ? "Monitor copy trading carefully before changing masters or copier mappings."
              : "Copy trading follows master activity. Profit is not guaranteed."}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CopyTradingMiniSidebar;