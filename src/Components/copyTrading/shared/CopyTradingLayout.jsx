import React, { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Copy,
  LayoutDashboard,
  RadioTower,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

import CopyTradingMiniSidebar from "./CopyTradingMiniSidebar";
import { cx } from "../utils/copyTradingHelpers";

const getTheme = (isDark) => ({
  pageBg: isDark ? "#0b1120" : "#f7fffb",
  pageText: isDark ? "text-white" : "text-slate-900",

  shell: isDark
    ? "border-white/10 bg-white/[0.035] shadow-[0_18px_55px_rgba(0,0,0,0.38)]"
    : "border-emerald-100 bg-white/90 shadow-[0_14px_34px_rgba(16,185,129,0.08)]",

  header: isDark
    ? "border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,1),rgba(6,78,59,0.88))]"
    : "border-emerald-200/70 bg-[linear-gradient(135deg,#10b981,#047857)]",

  button: isDark
    ? "border-white/10 bg-white/[0.05] text-white/80 hover:bg-white/[0.09]"
    : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50",

  badge: isDark
    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
    : "border-emerald-200 bg-emerald-50 text-emerald-700",

  contentBg: isDark ? "bg-white/[0.015]" : "bg-emerald-50/20",
});

const getPageMeta = (pathname, role) => {
  if (pathname.includes("/masters")) {
    return {
      title: role === "admin" ? "Master Management" : "Explore Master Traders",
      subtitle:
        role === "admin"
          ? "Add, update, and manage master accounts."
          : "Choose a master trader and start copy trading after checking commission and minimum investment.",
      active: "Masters",
      icon: <TrendingUp className="h-6 w-6" />,
    };
  }

  if (pathname.includes("/my-accounts") || pathname.includes("/copiers")) {
    return {
      title: role === "admin" ? "Copier Management" : "My Copied Accounts",
      subtitle:
        role === "admin"
          ? "Monitor copier accounts, mapping, and copy status."
          : "Track master accounts currently linked with your MT5 accounts.",
      active: role === "admin" ? "Copiers" : "Copied Accounts",
      icon: <Users className="h-6 w-6" />,
    };
  }

  if (pathname.includes("/trades")) {
    return {
      title: role === "admin" ? "Trade Monitor" : "Copy Trade History",
      subtitle:
        role === "admin"
          ? "Monitor master and copier trade activity."
          : "Review all, open, and closed copied trade history.",
      active: "Trades",
      icon: <RadioTower className="h-6 w-6" />,
    };
  }

  return {
    title: role === "admin" ? "Copy Trading Overview" : "Copy Trading Dashboard",
    subtitle:
      role === "admin"
        ? "Monitor masters, copiers, active mappings, and trade activity."
        : "View your copy trading summary, copied accounts, and available masters.",
    active: "Dashboard",
    icon: <LayoutDashboard className="h-6 w-6" />,
  };
};

const HeaderStat = ({ label, value }) => (
  <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-xl">
    <p className="text-xs text-white/75">{label}</p>
    <p className="mt-1 truncate text-base font-bold">{value}</p>
  </div>
);

const CopyTradingLayout = ({ role = "user" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const theme = useMemo(() => getTheme(isDark), [isDark]);
  const pageMeta = useMemo(
    () => getPageMeta(location.pathname, role),
    [location.pathname, role]
  );

  const backPath = role === "admin" ? "/admin/dashboard" : "/user/dashboard";

  return (
    <div
      className={cx("min-h-screen w-full p-3 sm:p-4", theme.pageText)}
      style={{ background: theme.pageBg }}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <CopyTradingMiniSidebar role={role} isDark={isDark} />

        <div
          className={cx(
            "min-h-[720px] overflow-hidden rounded-[28px] border backdrop-blur-xl",
            theme.shell
          )}
        >
          <div
            className={cx(
              "relative overflow-hidden border-b px-4 py-5 sm:px-6",
              theme.header
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at top left, rgba(255,255,255,0.16), transparent 30%), radial-gradient(circle at bottom right, rgba(209,250,229,0.14), transparent 38%)",
              }}
            />

            <div className="relative z-[1] flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
                  {pageMeta.icon}
                </div>

                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                    <Copy className="h-3.5 w-3.5" />
                    Copy Trading · {role === "admin" ? "Admin" : "Client"}
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {pageMeta.title}
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                    {pageMeta.subtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                <HeaderStat label="Section" value={pageMeta.active} />
                <HeaderStat label="Mode" value={role === "admin" ? "Admin" : "Client"} />
                <HeaderStat label="Status" value="Synced" />
              </div>
            </div>
          </div>

          <div
            className={cx(
              "flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6",
              isDark ? "border-white/10" : "border-emerald-100"
            )}
          >
            <button
              type="button"
              onClick={() => navigate(backPath)}
              className={cx(
                "inline-flex w-fit items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all",
                theme.button
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            <div
              className={cx(
                "inline-flex w-fit items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-semibold",
                theme.badge
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              Copy trading module connected
            </div>
          </div>

          <div className={cx("min-h-[560px] p-3 sm:p-4", theme.contentBg)}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyTradingLayout;