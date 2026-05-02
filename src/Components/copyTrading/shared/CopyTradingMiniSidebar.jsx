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

const getLinks = (role) => {
  if (role === "admin") {
    return [
      {
        label: "Overview",
        to: "/admin/copy-trading/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Masters",
        to: "/admin/copy-trading/masters",
        icon: UserRoundCog,
      },
      {
        label: "Copiers",
        to: "/admin/copy-trading/copiers",
        icon: Users,
      },
      {
        label: "Trade Monitor",
        to: "/admin/copy-trading/trades",
        icon: RadioTower,
      },

    ];
  }

  return [
    {
      label: "Overview",
      to: "/user/copy-trading/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Explore Masters",
      to: "/user/copy-trading/masters",
      icon: UserRoundCog,
    },
    {
      label: "My Copied Accounts",
      to: "/user/copy-trading/my-accounts",
      icon: Link2,
    },
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
  ];
};

const CopyTradingMiniSidebar = ({ role = "user", isDark }) => {
  const links = getLinks(role);

  const shellStyle = {
    borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(245,158,11,0.14)",
    background: isDark
      ? "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(15,23,42,0.90))"
      : "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,251,235,0.82))",
    boxShadow: isDark
      ? "0 18px 55px rgba(0,0,0,0.28)"
      : "0 14px 40px rgba(245,158,11,0.08)",
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
        <div className="pointer-events-none absolute -right-12 top-0 h-36 w-36 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-14 -left-12 h-40 w-40 rounded-full bg-orange-400/12 blur-3xl" />

        <div className="relative z-10 flex min-h-full flex-col">
          <div className="mb-5 flex items-center gap-3">
            <div
              className={cx(
                "flex h-12 w-12 items-center justify-center rounded-2xl border",
                isDark
                  ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              )}
            >
              <Copy className="h-6 w-6" />
            </div>

            <div>
              <p
                className={cx(
                  "text-sm font-bold",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                Copy Trading
              </p>
              <p
                className={cx(
                  "text-xs",
                  isDark ? "text-white/50" : "text-slate-500"
                )}
              >
                {role === "admin" ? "Admin Panel" : "Client Panel"}
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            {links.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cx(
                      "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200",
                      isActive
                        ? isDark
                          ? "border-amber-400/30 bg-amber-500/15 text-amber-200 shadow-[0_10px_30px_rgba(245,158,11,0.12)]"
                          : "border-amber-200 bg-amber-50 text-amber-700 shadow-[0_10px_24px_rgba(245,158,11,0.10)]"
                        : isDark
                        ? "border-white/10 bg-white/[0.025] text-white/65 hover:bg-white/[0.06] hover:text-white"
                        : "border-amber-100/70 bg-white/70 text-slate-600 hover:border-amber-200 hover:bg-amber-50/70 hover:text-amber-700"
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div
            className={cx(
              "mt-5 rounded-2xl border p-4 text-xs leading-5 xl:mt-auto",
              isDark
                ? "border-white/10 bg-white/[0.035] text-white/55"
                : "border-amber-100 bg-amber-50/60 text-slate-600"
            )}
          >
            <div
              className={cx(
                "mb-2 flex items-center gap-2 font-bold",
                isDark ? "text-amber-200" : "text-amber-700"
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              Risk Notice
            </div>
            Copy trading follows master activity. Profit is not guaranteed.
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CopyTradingMiniSidebar;