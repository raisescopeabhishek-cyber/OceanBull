// Components/user/bonus/components/BonusMiniSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PieChart,
  Landmark,
  Wallet,
  BadgeDollarSign,
  CandlestickChart,
  ChevronRight,
} from "lucide-react";

const menu = [
  {
    label: "Dashboard",
    path: "/user/bonus/dashboard",
    icon: LayoutDashboard,
    desc: "Full bonus command center",
  },
  {
    label: "Overview",
    path: "/user/bonus/overview",
    icon: PieChart,
    desc: "Wallet & account insights",
  },
  {
    label: "Deposits",
    path: "/user/bonus/deposits",
    icon: Landmark,
    desc: "Deposit bonus history",
  },
  {
    label: "Ledger",
    path: "/user/bonus/ledger",
    icon: Wallet,
    desc: "Wallet movement tracking",
  },
  {
    label: "Payouts",
    path: "/user/bonus/payouts",
    icon: BadgeDollarSign,
    desc: "Trade bonus credit logs",
  },
  {
    label: "Trades",
    path: "/user/bonus/trades",
    icon: CandlestickChart,
    desc: "Eligible and processed trades",
  },
];

const BonusMiniSidebar = ({ isDark }) => {
  return (
    <aside
      className={[
        "overflow-hidden rounded-[28px] border backdrop-blur-xl",
        isDark
          ? "border-white/10 bg-white/[0.035]"
          : "border-orange-100/80 bg-white/70",
      ].join(" ")}
    >
      <div className="p-5">
        <div
          className={[
            "rounded-[24px] border p-5",
            isDark
              ? "border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02]"
              : "border-orange-100 bg-gradient-to-br from-white to-orange-50/80",
          ].join(" ")}
        >
          <div
            className={[
              "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
              isDark
                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                : "border-emerald-200 bg-emerald-50 text-emerald-700",
            ].join(" ")}
          >
            Bonus Center
          </div>

          <h2 className="text-xl font-bold">Bonus Wallet Suite</h2>

          <p
            className={[
              "mt-2 text-sm leading-6",
              isDark ? "text-white/55" : "text-slate-600",
            ].join(" ")}
          >
            Track deposit bonus, wallet movements, payout batches, and trade
            bonus processing in one place.
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
                  [
                    "group flex items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-200",
                    isActive
                      ? isDark
                        ? "border-blue-400/30 bg-blue-500/10 text-white"
                        : "border-orange-200 bg-orange-50 text-slate-900"
                      : isDark
                      ? "border-white/10 bg-white/[0.025] text-white/70 hover:bg-white/[0.05]"
                      : "border-orange-100 bg-white/60 text-slate-700 hover:bg-orange-50/70",
                  ].join(" ")
                }
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={[
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                      isDark
                        ? "bg-white/[0.06] text-blue-200"
                        : "bg-orange-100 text-orange-700",
                    ].join(" ")}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.label}</p>
                    <p
                      className={[
                        "truncate text-xs",
                        isDark ? "text-white/45" : "text-slate-500",
                      ].join(" ")}
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
      </div>
    </aside>
  );
};

export default BonusMiniSidebar;