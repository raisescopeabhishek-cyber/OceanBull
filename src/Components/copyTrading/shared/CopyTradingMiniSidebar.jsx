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
  ];
};

const CopyTradingMiniSidebar = ({ role = "user", isDark }) => {
  const links = getLinks(role);

  return (
    <aside
      className={cx(
        "rounded-[28px] border p-4",
        isDark
          ? "border-white/10 bg-white/[0.035]"
          : "border-emerald-100 bg-white/90 shadow-[0_14px_34px_rgba(16,185,129,0.08)]"
      )}
    >
      <div className="mb-5 flex items-center gap-3">
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

        <div>
          <p
            className={cx(
              "text-sm font-bold",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            Copy Trading
          </p>
          <p className={cx("text-xs", isDark ? "text-white/50" : "text-slate-500")}>
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
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all",
                  isActive
                    ? isDark
                      ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : isDark
                    ? "border-white/10 bg-white/[0.025] text-white/65 hover:bg-white/[0.06]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-emerald-50/60"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div
        className={cx(
          "mt-5 rounded-2xl border p-4 text-xs leading-5",
          isDark
            ? "border-white/10 bg-white/[0.025] text-white/55"
            : "border-emerald-100 bg-emerald-50/50 text-slate-600"
        )}
      >
        <div className="mb-2 flex items-center gap-2 font-bold">
          <ShieldCheck className="h-4 w-4" />
          Risk Notice
        </div>
        Copy trading follows master activity. Profit is not guaranteed.
      </div>
    </aside>
  );
};

export default CopyTradingMiniSidebar;