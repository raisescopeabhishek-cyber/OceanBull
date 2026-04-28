// Components/user/bonus/components/BonusMiniSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Landmark,
  Wallet,
  BadgeDollarSign,
  CandlestickChart,
  ChevronRight,
  Gift,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const menu = [
  {
    label: "Dashboard",
    path: "/user/bonus/dashboard",
    icon: LayoutDashboard,
    desc: "Full bonus command center",
  },
  {
    label: "Deposits Bonus",
    path: "/user/bonus/deposits",
    icon: Landmark,
    desc: "Deposit bonus history",
  },
  // {
  //   label: "Ledger",
  //   path: "/user/bonus/ledger",
  //   icon: Wallet,
  //   desc: "Wallet movement tracking",
  // },
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

const getTheme = (isDark) => ({
  sidebar: isDark
    ? "border-white/10 bg-white/[0.035] shadow-[0_18px_55px_rgba(0,0,0,0.34)]"
    : "border-orange-100/80 bg-white/85 shadow-[0_14px_34px_rgba(251,146,60,0.08)]",

  hero: isDark
    ? "border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))]"
    : "border-orange-100/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,247,237,0.72))]",

  heroIcon: isDark
    ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
    : "border-orange-200/70 bg-orange-50/70 text-orange-500 shadow-[0_0_0_3px_rgba(251,146,60,0.04)]",

  pill: isDark
    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
    : "border-orange-200/70 bg-orange-50/65 text-orange-600 shadow-[0_0_0_3px_rgba(251,146,60,0.035)]",

  title: isDark ? "text-white" : "text-slate-900",
  muted: isDark ? "text-white/50" : "text-slate-500",
  softText: isDark ? "text-white/65" : "text-slate-600",

  navBase: isDark
    ? "border-white/10 bg-white/[0.025] text-white/70 hover:bg-white/[0.055] hover:text-white"
    : "border-orange-100/75 bg-white/70 text-slate-700 hover:border-orange-200/80 hover:bg-orange-50/35 hover:text-slate-900",

  navActive: isDark
    ? "border-blue-400/25 bg-blue-500/10 text-white shadow-[0_0_0_3px_rgba(59,130,246,0.06)]"
    : "border-orange-200/90 bg-orange-50/65 text-slate-900 shadow-[0_0_0_3px_rgba(251,146,60,0.06)]",

  iconBase: isDark
    ? "border-white/10 bg-white/[0.045] text-white/65"
    : "border-orange-100/80 bg-white/85 text-orange-500",

  iconActive: isDark
    ? "border-blue-400/25 bg-blue-500/12 text-blue-300"
    : "border-orange-200/90 bg-white text-orange-600 shadow-[0_0_0_3px_rgba(251,146,60,0.04)]",

  footer: isDark
    ? "border-white/10 bg-white/[0.025]"
    : "border-orange-100/75 bg-orange-50/25",

  footerBadge: isDark
    ? "border-white/10 bg-white/[0.04] text-white/60"
    : "border-orange-100/80 bg-white/75 text-orange-600",
});

const BonusMiniSidebar = ({ isDark }) => {
  const theme = getTheme(isDark);

  return (
    <aside
      className={cx(
        "overflow-hidden rounded-[28px] border backdrop-blur-xl",
        "xl:sticky xl:top-4 xl:self-start",
        "xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto",
        theme.sidebar
      )}
    >
      <div className="p-4 sm:p-5">
        {/* Header Card */}
        <div className={cx("rounded-[24px] border p-5", theme.hero)}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className={cx("flex h-12 w-12 items-center justify-center rounded-2xl border", theme.heroIcon)}>
              <Gift className="h-6 w-6" />
            </div>

            <div
              className={cx(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                theme.pill
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Active
            </div>
          </div>

          <h2 className={cx("text-xl font-bold tracking-tight", theme.title)}>
            Bonus Wallet Suite
          </h2>

          <p className={cx("mt-2 text-sm leading-6", theme.muted)}>
            Track deposit bonus, wallet movements, payout batches, and trade bonus processing.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className={cx("rounded-2xl border px-3 py-2", theme.footerBadge)}>
              <p className="text-[10px] font-medium opacity-75">Module</p>
              <p className="mt-0.5 text-xs font-bold">Bonus</p>
            </div>

            <div className={cx("rounded-2xl border px-3 py-2", theme.footerBadge)}>
              <p className="text-[10px] font-medium opacity-75">Status</p>
              <p className="mt-0.5 text-xs font-bold">Synced</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-5 space-y-2.5">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cx(
                    "group relative flex items-center justify-between overflow-hidden rounded-2xl border px-3.5 py-3 transition-all duration-200",
                    isActive ? theme.navActive : theme.navBase
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cx(
                        "absolute left-0 top-1/2 h-9 w-1 -translate-y-1/2 rounded-r-full transition-all duration-200",
                        isActive
                          ? isDark
                            ? "bg-blue-400"
                            : "bg-orange-400"
                          : "bg-transparent"
                      )}
                    />

                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cx(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-200",
                          isActive ? theme.iconActive : theme.iconBase
                        )}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {item.label}
                        </p>

                        <p
                          className={cx(
                            "mt-0.5 truncate text-xs",
                            isActive
                              ? isDark
                                ? "text-white/55"
                                : "text-slate-500"
                              : theme.muted
                          )}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      size={16}
                      className={cx(
                        "shrink-0 opacity-45 transition-all duration-200 group-hover:translate-x-0.5",
                        isActive && "opacity-80"
                      )}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className={cx("mt-5 rounded-[22px] border p-4", theme.footer)}>
          <div className="flex items-start gap-3">
            <div className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", theme.heroIcon)}>
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className={cx("text-sm font-semibold", theme.title)}>
                Secure Bonus Area
              </p>

              <p className={cx("mt-1 text-xs leading-5", theme.muted)}>
                Bonus data is linked with your logged-in trading account.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Mini Label */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <WalletCards className={cx("h-4 w-4", isDark ? "text-white/35" : "text-orange-400")} />
          <span className={cx("text-xs font-medium", theme.muted)}>
            Bonus Wallet Center
          </span>
        </div>
      </div>
    </aside>
  );
};

export default BonusMiniSidebar;