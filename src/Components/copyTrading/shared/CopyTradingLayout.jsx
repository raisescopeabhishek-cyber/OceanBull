import React, { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Copy,
  LayoutDashboard,
  RadioTower,
  TrendingUp,
  Users,
} from "lucide-react";

import CopyTradingMiniSidebar from "./CopyTradingMiniSidebar";
import { cx } from "../utils/copyTradingHelpers";

const getTitleMap = (role = "user") => {
  if (role === "admin") {
    return [
      ["/admin/copy-trading/dashboard", "Copy Trading Overview"],
      ["/admin/copy-trading/masters", "Master Management"],
      ["/admin/copy-trading/copiers", "Copier Management"],
      ["/admin/copy-trading/trades", "Trade History"],
    ];
  }

  return [
    ["/user/copy-trading/dashboard", "Copy Trading Dashboard"],
    ["/user/copy-trading/masters", "Explore Master Traders"],
    ["/user/copy-trading/my-accounts", "My Copied Accounts"],
    ["/user/copy-trading/trades", "Copy Trade History"],
    ["/user/copy-trading/master-trades", "Master Trades"],
    ["/user/copy-trading/copier-trades", "Copier Trades"],
    ["/user/copy-trading/my-master-accounts", "My Master Accounts"],
    ["/user/copy-trading/my-copier-accounts", "My Copier Accounts"],
  ];
};

const getPageMeta = (pathname, role = "user") => {
  if (role === "admin") {
    if (pathname.includes("/masters")) {
      return {
        title: "Master Management",
        subtitle: "Create, update, delete, and monitor master trading accounts.",
        active: "Masters",
        icon: <TrendingUp className="h-6 w-6" />,
      };
    }

    if (pathname.includes("/copiers")) {
      return {
        title: "Copier Management",
        subtitle: "Create, update, delete, and monitor copier mappings.",
        active: "Copiers",
        icon: <Users className="h-6 w-6" />,
      };
    }

    if (pathname.includes("/trades")) {
      return {
        title: "Trade History",
        subtitle: "Search master or copier trade history by MT5 account.",
        active: "Trades",
        icon: <RadioTower className="h-6 w-6" />,
      };
    }

    return {
      title: "Copy Trading Overview",
      subtitle:
        "Monitor masters, copiers, active mappings, and copy-trading reports.",
      active: "Dashboard",
      icon: <LayoutDashboard className="h-6 w-6" />,
    };
  }

  if (pathname.includes("/my-master-accounts")) {
    return {
      title: "My Master Accounts",
      subtitle:
        "View only your CRM master accounts, linked copiers, and their open/closed trades.",
      active: "My Masters",
      icon: <RadioTower className="h-6 w-6" />,
    };
  }

  if (pathname.includes("/my-copier-accounts")) {
    return {
      title: "My Copier Accounts",
      subtitle:
        "View the master accounts you are copying and compare master/copier open and closed trades.",
      active: "My Copiers",
      icon: <Users className="h-6 w-6" />,
    };
  }

  if (pathname.includes("/master-trades")) {
    return {
      title: "Master Trades",
      subtitle: "Search a master account and review its trade activity.",
      active: "Master Trades",
      icon: <RadioTower className="h-6 w-6" />,
    };
  }

  if (pathname.includes("/copier-trades")) {
    return {
      title: "Copier Trades",
      subtitle:
        "Search a copier account and compare copier open/closed trades with linked master trades.",
      active: "Copier Trades",
      icon: <Users className="h-6 w-6" />,
    };
  }

  if (pathname.includes("/masters")) {
    return {
      title: "Explore Master Traders",
      subtitle:
        "Choose a master trader and start copy trading after reviewing commission and minimum investment.",
      active: "Masters",
      icon: <TrendingUp className="h-6 w-6" />,
    };
  }

  if (pathname.includes("/my-accounts")) {
    return {
      title: "My Copied Accounts",
      subtitle:
        "Track the master accounts currently linked with your MT5 accounts.",
      active: "Copied Accounts",
      icon: <Users className="h-6 w-6" />,
    };
  }

  if (pathname.includes("/trades")) {
    return {
      title: "Copy Trade History",
      subtitle: "Review all, open, and closed copy-trading history.",
      active: "Trades",
      icon: <RadioTower className="h-6 w-6" />,
    };
  }

  return {
    title: "Copy Trading Dashboard",
    subtitle:
      "View your copy-trading summary, copied accounts, and available masters.",
    active: "Dashboard",
    icon: <LayoutDashboard className="h-6 w-6" />,
  };
};

const SoftHeaderCard = ({ label, value, isDark }) => {
  const softCardStyle = {
    borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.22)",
    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(12px)",
  };

  return (
    <div className="rounded-2xl border px-4 py-2 text-sm" style={softCardStyle}>
      {label}: <span className="font-bold text-white">{value}</span>
    </div>
  );
};

const CopyTradingLayout = ({ role = "user" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const pageMeta = useMemo(
    () => getPageMeta(location.pathname, role),
    [location.pathname, role]
  );

  const currentTitle =
    getTitleMap(role).find(([path]) => location.pathname.startsWith(path))?.[1] ||
    pageMeta.title ||
    "Copy Trading";

  const backPath = role === "admin" ? "/admin/dashboard" : "/user/dashboard";

  const shellStyle = {
    borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(16,185,129,0.16)",
    background: isDark
      ? "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(6,78,59,0.20))"
      : "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(236,253,245,0.88))",
    boxShadow: isDark
      ? "0 18px 55px rgba(0,0,0,0.34)"
      : "0 14px 40px rgba(16,185,129,0.10)",
    backdropFilter: "blur(10px)",
  };

  const headerStyle = {
    background: isDark
      ? "linear-gradient(135deg, #064e3b, #022c22)"
      : "linear-gradient(135deg, #10b981, #059669, #047857)",
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-3 sm:p-4 xl:grid-cols-[300px_minmax(0,1fr)]">
      <CopyTradingMiniSidebar role={role} isDark={isDark} />

      <div
        className="relative min-h-[780px] overflow-hidden rounded-[26px] border transition-all duration-300"
        style={shellStyle}
      >
        <div className="pointer-events-none absolute -right-12 top-0 h-52 w-52 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-[-50px] h-52 w-52 rounded-full bg-green-400/12 blur-3xl" />

        <div
          className="relative overflow-hidden px-4 py-5 sm:px-6"
          style={headerStyle}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-12 top-0 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => navigate(backPath)}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                  <Copy size={13} />
                  {role === "admin" ? "Admin Panel" : "Self Panel"}
                </div>

                <h1
                  className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {currentTitle}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                  {pageMeta.subtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SoftHeaderCard
                isDark={isDark}
                label="Section"
                value={pageMeta.active}
              />

              <SoftHeaderCard
                isDark={isDark}
                label="Mode"
                value={role === "admin" ? "Admin" : "Client"}
              />
            </div>
          </div>
        </div>

        <div className="relative p-4 sm:p-6">
          <Outlet context={{ isDark, role }} />
        </div>
      </div>
    </div>
  );
};

export default CopyTradingLayout;