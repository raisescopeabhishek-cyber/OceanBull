import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Menu,
  LayoutDashboard,
  ShieldEllipsis,
  ArrowUpDown,
  BarChart3,
  CircleFadingPlus,
  ArrowLeftRight,
  ArrowDownCircle,
  Users2,
  MonitorSmartphone,
  CalendarDays,
  Newspaper,
  Copy,
  LifeBuoy,
  UserCog,
  KeyRound,
  LockKeyhole,
  BadgeDollarSign,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Wallet2,
} from "lucide-react";

import sidebarBg from "@/assets/sidebar.png";

const modules = [
  {
    name: "Dashboard",
    path: "/user/dashboard",
    subtitle: "Quick Overview",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  // {
  //   name: "Challenges",
  //   path: "/user/challenges",
  //   subtitle: "Account Progress",
  //   icon: <ShieldEllipsis className="w-5 h-5" />,
  //   children: [
  //     {
  //       name: "My Challenges",
  //       path: "/user/challenges",
  //       icon: <ShieldCheck className="w-4 h-4" />,
  //     },
  //   ],
  // },

//   {
//   name: "Bonus",
//   path: "/user/bonus/dashboard",
//   subtitle: "Track Your Bonus",
//   icon: <Wallet2 className="w-5 h-5" />,
// },


   {
  name: "My Accounts",
  path: "/user/challenges",
  subtitle: "Track Your Progress",
  icon: <ShieldEllipsis className="w-5 h-5" />,
},

{
  name: "Fund",
  subtitle: "Add Balance",
  path: "/user/deposit",
  icon: <CircleFadingPlus className="w-4 h-4" />,
},

{
  name: "Payout",
  subtitle: "Withdraw Earnings",
  path: "/user/withdraw",
  icon: <ArrowDownCircle className="w-4 h-4" />,
},

{
  name: "Trades",
  path: "/user/trade-history",
  subtitle: "Trade History",
  icon: <BarChart3 className="w-5 h-5" />,
},

{
  name: "Transfer",
  subtitle: "Payments & Transfers",
  path: "/user/transfer",
  icon: <ArrowLeftRight className="w-4 h-4" />,
},



// {
//   name: "Transactions",
//   path: "/user/transaction",
//   subtitle: "Payments & Transfers",
//   icon: <ArrowUpDown className="w-5 h-5" />,
//   children: [
//     {
//       name: "Transactions",
//       path: "/user/transaction",
//       icon: <ArrowUpDown className="w-4 h-4" />,
//     },
//     {
//       name: "Transfer",
//       path: "/user/transfer",
//       icon: <ArrowLeftRight className="w-4 h-4" />,
//     },
//   ],
// },


{
    name: "Market",
    path: "/user/economic-calendar",
    subtitle: "Calendar & News",
    icon: <CalendarDays className="w-5 h-5" />,
    children: [
      {
        name: "Economic Calendar",
        path: "/user/economic-calendar",
        icon: <CalendarDays className="w-4 h-4" />,
      },
      {
        name: "Forex News",
        path: "/user/forex-news",
        icon: <Newspaper className="w-4 h-4" />,
      },
    ],
  },




  //     {
  //   name: "Referral",
  //   path: "/user/platform",
  //   subtitle: "Access Tools",
  //   icon: <Users2 className="w-5 h-5" />,
  // },


  //      {
  //   name: "Copy Trading",
  //   path: "/user/platform",
  //   subtitle: "Access Tools",
  //   icon: <Copy className="w-5 h-5" />,
  // },


  //  {
  //   name: "Support",
  //   path: "/user/platform",
  //   subtitle: "Access Tools",
  //   icon: <LifeBuoy className="w-5 h-5" />,
  // },


  // {
  //   name: "Referral",
  //   path: "/user/referrals",
  //   subtitle: "Partner Network",
  //   icon: <Users2 className="w-5 h-5" />,
  //   children: [
  //     {
  //       name: "Referral Zone",
  //       path: "/user/referrals",
  //       icon: <Users2 className="w-4 h-4" />,
  //     },
  //   ],
  // },
  // {
  //   name: "Copy Trading",
  //   path: "/user/copy-trading",
  //   subtitle: "Copy & Requests",
  //   icon: <Copy className="w-5 h-5" />,
  //   children: [
  //     {
  //       name: "Copy Trading",
  //       path: "/user/copy-trading",
  //       icon: <Copy className="w-4 h-4" />,
  //     },
  //     {
  //       name: "Copy Request",
  //       path: "/user/copy-request",
  //       icon: <BadgeDollarSign className="w-4 h-4" />,
  //     },
  //   ],
  // },
  // {
  //   name: "Support",
  //   path: "/user/customer-support",
  //   subtitle: "Tickets & Help",
  //   icon: <LifeBuoy className="w-5 h-5" />,
  //   children: [
  //     {
  //       name: "Customer Support",
  //       path: "/user/customer-support",
  //       icon: <LifeBuoy className="w-4 h-4" />,
  //     },
  //     {
  //       name: "Ticket Dashboard",
  //       path: "/user/ticketDashboard",
  //       icon: <LifeBuoy className="w-4 h-4" />,
  //     },
  //   ],
  // },
  {
    name: "Profile",
    path: "/user/profile",
    subtitle: "Personal Settings",
    icon: <UserCog className="w-5 h-5" />,
    children: [
      {
        name: "Profile",
        path: "/user/profile",
        icon: <UserCog className="w-4 h-4" />,
      },
      {
        name: "Account Details",
        path: "/user/account-details",
        icon: <ShieldCheck className="w-4 h-4" />,
      },
      {
        name: "Change Password",
        path: "/user/change-password",
        icon: <KeyRound className="w-4 h-4" />,
      },
      {
        name: "Master Password",
        path: "/user/master-password",
        icon: <LockKeyhole className="w-4 h-4" />,
      },
      {
        name: "Investor Password",
        path: "/user/investor-password",
        icon: <LockKeyhole className="w-4 h-4" />,
      },
    ],
  },
];

const SidebarContent = ({ close }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const siteConfig = useSelector((store) => store.user?.siteConfig || {});
  const loggedUser = useSelector((store) => store.user?.loggedUser || {});

  const [openMenus, setOpenMenus] = useState({
    Challenges:
      location.pathname.startsWith("/user/new-challenge") ||
      location.pathname.startsWith("/user/challenges"),
    Transactions:
      location.pathname.startsWith("/user/transaction") ||
      location.pathname.startsWith("/user/deposit") ||
      location.pathname.startsWith("/user/transfer") ||
      location.pathname.startsWith("/user/withdraw"),
    Referral: location.pathname.startsWith("/user/referrals"),
    Market:
      location.pathname.startsWith("/user/economic-calendar") ||
      location.pathname.startsWith("/user/forex-news"),
    "Copy Trading":
      location.pathname.startsWith("/user/copy-trading") ||
      location.pathname.startsWith("/user/copy-request"),
    Support:
      location.pathname.startsWith("/user/customer-support") ||
      location.pathname.startsWith("/user/ticketDashboard"),
    Profile:
      location.pathname.startsWith("/user/profile") ||
      location.pathname.startsWith("/user/account-details") ||
      location.pathname.startsWith("/user/change-password") ||
      location.pathname.startsWith("/user/master-password") ||
      location.pathname.startsWith("/user/investor-password"),
  });

  const [sidebarGlow, setSidebarGlow] = useState({
    x: 160,
    y: 200,
    visible: false,
  });

  const baseHeight = siteConfig?.logoSize || 4;
  const hasAccounts = Boolean(loggedUser?.accounts?.length);

  const isPathActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const moduleStates = useMemo(() => {
    return modules.reduce((acc, mod) => {
      const active = mod.children
        ? mod.children.some((child) => isPathActive(child.path)) || isPathActive(mod.path)
        : isPathActive(mod.path);

      acc[mod.name] = active;
      return acc;
    }, {});
  }, [location.pathname]);

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    e.currentTarget.style.setProperty("--x", `${x}px`);
    e.currentTarget.style.setProperty("--y", `${y}px`);
  };

  const handleSidebarMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSidebarGlow({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });
  };

  const handleSidebarLeave = () => {
    setSidebarGlow((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div
      onMouseMove={handleSidebarMove}
      onMouseLeave={handleSidebarLeave}
      className={[
        "relative h-full overflow-hidden transition-colors duration-300",
        isDark ? "text-white" : "text-slate-900",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: isDark
            ? "linear-gradient(180deg, #0d1117 0%, #0b0f14 35%, #06080b 100%)"
            : "linear-gradient(180deg, #fffaf7 0%, #fff7f2 45%, #fff1e8 100%)",
        }}
      />

      {!isDark && (
        <div
          aria-hidden
          className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-90"
          style={{
            backgroundImage: `url(${sidebarBg})`,
          }}
        />
      )}

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(70% 45% at 50% 0%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(90% 100% at 50% 100%, rgba(0,0,0,0.55), transparent 75%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,250,246,0.72) 50%, rgba(255,245,238,0.78) 100%)",
        }}
      />

      {isDark && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1px),
              radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "14px 14px, 14px 14px",
            backgroundPosition: "0 0, 7px 7px",
          }}
        />
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-200"
        style={{
          opacity: sidebarGlow.visible ? 1 : 0,
          background: isDark
            ? `radial-gradient(240px circle at ${sidebarGlow.x}px ${sidebarGlow.y}px, rgba(59,130,246,0.16), rgba(96,165,250,0.08) 30%, transparent 68%)`
            : `radial-gradient(240px circle at ${sidebarGlow.x}px ${sidebarGlow.y}px, rgba(255,255,255,0.30), rgba(251,191,36,0.08) 35%, transparent 72%)`,
        }}
      />

      <div
        className={[
          "relative z-[2] h-full border-r backdrop-blur-xl transition-colors duration-300",
          isDark
            ? "border-white/10 bg-white/[0.03] shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
            : "border-orange-100/80 bg-white/55 shadow-[0_20px_50px_rgba(251,146,60,0.10)]",
        ].join(" ")}
      >
        <div
          className={[
            "relative border-b px-5 py-5 transition-colors duration-300",
            isDark ? "border-white/10" : "border-orange-100/80",
          ].join(" ")}
        >
          <div
            className={[
              "absolute inset-x-0 bottom-0 h-px",
              isDark
                ? "bg-gradient-to-r from-transparent via-white/10 to-transparent"
                : "bg-gradient-to-r from-transparent via-orange-200/70 to-transparent",
            ].join(" ")}
          />

          <div className="flex items-center gap-3">
            <div
              className={[
                "grid h-16 w-16 place-items-center rounded-2xl border",
                isDark
                  ? "border-white/10 bg-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                  : "border-orange-100 bg-white/85 shadow-[0_10px_30px_rgba(251,146,60,0.12)]",
              ].join(" ")}
            >
              {siteConfig?.logo ? (
                <img
                  src={siteConfig.logo}
                  alt={siteConfig?.siteName || "Logo"}
                  className="object-contain w-auto"
                  style={{ height: `${baseHeight * 0.55}rem` }}
                />
              ) : (
                <ShieldCheck
                  className={
                    isDark ? "h-5 w-5 text-white/85" : "h-5 w-5 text-orange-600"
                  }
                />
              )}
            </div>

            <div className="min-w-0">
              <div
                className={[
                  "truncate text-[11px] font-semibold tracking-[0.28em]",
                  isDark ? "text-white/80" : "text-slate-700",
                ].join(" ")}
              >
                USER
              </div>
              <div
                className={[
                  "mt-0.5 truncate text-[11px]",
                  isDark ? "text-white/40" : "text-slate-500",
                ].join(" ")}
              >
                {siteConfig?.siteName || "Trading Workspace"}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4">
          <button
            onClick={() => {
              navigate("/user/copy-trading/dashboard");
              close?.();
            }}
            className={[
              "w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300",
              isDark
                ? "bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 text-white shadow-[0_12px_30px_rgba(59,130,246,0.25)] hover:brightness-110"
                : "bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-[0_12px_28px_rgba(249,115,22,0.22)] hover:brightness-105",
            ].join(" ")}
          >
            Copy Trading
          </button>
        </div>

        <div className="px-4 pt-3">
          <div
            className={[
              "inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold",
              hasAccounts
                ? isDark
                  ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : isDark
                ? "border border-red-400/20 bg-red-500/10 text-red-300"
                : "border border-red-200 bg-red-50 text-red-700",
            ].join(" ")}
          >
            <span
              className={[
                "h-2.5 w-2.5 rounded-full",
                hasAccounts ? "bg-current" : "bg-current",
              ].join(" ")}
            />
            {hasAccounts ? "Active Account Status" : "No Active Account"}
          </div>
        </div>

        <div
          className={[
            "h-[calc(100%-170px)] overflow-y-auto px-4 py-4 scrollbar-thin",
            isDark
              ? "scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20"
              : "scrollbar-track-transparent scrollbar-thumb-orange-200 hover:scrollbar-thumb-orange-300",
          ].join(" ")}
        >
          <nav className="space-y-3">
            {modules.map((mod) => {
              const active = moduleStates[mod.name];
              const isOpen = mod.children ? openMenus[mod.name] ?? active : false;

              return (
                <div key={mod.name}>
                  <button
                    onMouseMove={handlePointerMove}
                    onClick={() => {
                      if (mod.children) {
                        toggleMenu(mod.name);
                        return;
                      }

                      navigate(mod.path);
                      close?.();
                    }}
                    className={[
                      "group relative w-full overflow-hidden rounded-xl px-3 py-2 text-left transition-all duration-300",
                      "flex items-center justify-between hover:z-10",
                      isDark
                        ? ""
                        : "hover:bg-white/65 hover:shadow-[0_0_20px_rgba(251,146,60,0.14)]",
                    ].join(" ")}
                    style={{
                      "--x": "50%",
                      "--y": "50%",
                    }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background: isDark
                          ? "radial-gradient(140px circle at var(--x) var(--y), rgba(96,165,250,0.22), transparent 60%)"
                          : "radial-gradient(140px circle at var(--x) var(--y), rgba(251,146,60,0.18), transparent 60%)",
                      }}
                    />

                    <div
                      className="pointer-events-none absolute inset-[1px] rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background: isDark
                          ? "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))"
                          : "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,247,240,0.25))",
                      }}
                    />

                    {active && (
                      <div
                        className={[
                          "absolute inset-y-3 left-0 w-[3px] rounded-r-full",
                          isDark
                            ? "bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]"
                            : "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.45)]",
                        ].join(" ")}
                      />
                    )}

                    <div className="relative z-10 flex items-center gap-3">
                      <div
                        className={[
                          "grid h-10 w-10 place-items-center rounded-xl border transition duration-300",
                          active
                            ? isDark
                              ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                              : "border-orange-200 bg-orange-50/90 text-orange-700"
                            : isDark
                            ? "border-white/10 bg-black/20 text-white/70 group-hover:text-white"
                            : "border-orange-100 bg-white/85 text-slate-600 group-hover:text-slate-900",
                        ].join(" ")}
                      >
                        {mod.icon}
                      </div>

                      <div className="min-w-0">
                        <div
                          className={[
                            "truncate text-sm font-medium tracking-[0.03em] transition-colors duration-300",
                            active
                              ? isDark
                                ? "text-white"
                                : "text-slate-900"
                              : isDark
                              ? "text-white/80 group-hover:text-white"
                              : "text-slate-700 group-hover:text-slate-900",
                          ].join(" ")}
                        >
                          {mod.name}
                        </div>

                        <div
                          className={[
                            "mt-0.5 text-[11px] transition-colors duration-300",
                            isDark
                              ? "text-white/35 group-hover:text-white/60"
                              : "text-slate-500 group-hover:text-slate-700",
                          ].join(" ")}
                        >
                          {mod.subtitle}
                        </div>
                      </div>
                    </div>

                    {mod.children && (
                      <div
                        className={[
                          "relative z-10 grid h-8 w-8 place-items-center rounded-lg border transition duration-300",
                          active
                            ? isDark
                              ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                              : "border-orange-200 bg-orange-50 text-orange-700"
                            : isDark
                            ? "border-white/10 bg-black/20 text-white/55 group-hover:text-white/80"
                            : "border-orange-100 bg-white/85 text-slate-500 group-hover:text-slate-800",
                        ].join(" ")}
                      >
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </button>

                  {mod.children && (
                    <div
                      className={[
                        "grid transition-all duration-300 ease-out",
                        isOpen
                          ? "mt-2 grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0",
                      ].join(" ")}
                    >
                      <div className="overflow-hidden">
                        <div className="ml-3 space-y-1">
                          {mod.children.map((child) => {
                            const childActive = isPathActive(child.path);

                            return (
                              <button
                                key={child.name}
                                onMouseMove={handlePointerMove}
                                onClick={() => {
                                  navigate(child.path);
                                  close?.();
                                }}
                                className={[
                                  "group/child relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-2 text-left transition-all duration-200",
                                  "hover:z-10",
                                  isDark ? "" : "hover:bg-white/55",
                                ].join(" ")}
                                style={{
                                  "--x": "50%",
                                  "--y": "50%",
                                }}
                              >
                                <div
                                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/child:opacity-100"
                                  style={{
                                    background: isDark
                                      ? "radial-gradient(120px circle at var(--x) var(--y), rgba(96,165,250,0.20), transparent 60%)"
                                      : "radial-gradient(120px circle at var(--x) var(--y), rgba(251,146,60,0.15), transparent 60%)",
                                  }}
                                />

                                <div
                                  className={[
                                    "relative z-10 h-2.5 w-2.5 rounded-full",
                                    childActive
                                      ? isDark
                                        ? "bg-blue-300 shadow-[0_0_10px_rgba(147,197,253,0.9)]"
                                        : "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.45)]"
                                      : isDark
                                      ? "bg-white/30"
                                      : "bg-slate-300",
                                  ].join(" ")}
                                />

                                <div className="relative z-10 min-w-0 flex-1">
                                  <div
                                    className={[
                                      "truncate text-sm font-medium transition-colors duration-300",
                                      childActive
                                        ? isDark
                                          ? "text-blue-100"
                                          : "text-orange-800"
                                        : isDark
                                        ? "text-white/80 group-hover/child:text-white"
                                        : "text-slate-700 group-hover/child:text-slate-900",
                                    ].join(" ")}
                                  >
                                    {child.name}
                                  </div>
                                </div>

                                {childActive && (
                                  <div
                                    className={[
                                      "relative z-10 h-2 w-2 rounded-full animate-pulse",
                                      isDark
                                        ? "bg-blue-300 shadow-[0_0_10px_rgba(147,197,253,0.9)]"
                                        : "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.45)]",
                                    ].join(" ")}
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div
            className={[
              "mt-4 border-t px-1 pt-4 text-[10px]",
              isDark ? "border-white/10 text-white/35" : "border-orange-100 text-slate-500",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <span>v1.0</span>
              <span className="inline-flex items-center gap-1">
                <span
                  className={[
                    "h-1.5 w-1.5 animate-pulse rounded-full",
                    isDark ? "bg-emerald-400" : "bg-emerald-500",
                  ].join(" ")}
                />
                Live
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 md:block">
        <SidebarContent />
      </aside>

      {!mobileOpen && (
        <div className="fixed left-4 top-4 z-[70] md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className={[
              "grid h-11 w-11 place-items-center rounded-xl border backdrop-blur-md transition",
              "hover:scale-105 hover:brightness-110 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]",
              isDark
                ? "border-white/10 bg-[#111]/90 text-white/85 shadow-[0_12px_30px_rgba(0,0,0,0.45)] hover:bg-white/[0.08]"
                : "border-orange-100 bg-white/90 text-slate-700 shadow-[0_12px_30px_rgba(251,146,60,0.12)] hover:bg-orange-50/70",
            ].join(" ")}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      )}

      <div
        className={[
          "fixed inset-0 z-[80] transition-all duration-300 md:hidden",
          mobileOpen
            ? "pointer-events-auto bg-black/40 backdrop-blur-[2px]"
            : "pointer-events-none bg-black/0",
        ].join(" ")}
      >
        <button
          aria-label="Close sidebar backdrop"
          className="absolute inset-0"
          onClick={() => setMobileOpen(false)}
        />

        <aside
          className={[
            "absolute left-0 top-0 h-screen w-72 max-w-[86vw] transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <SidebarContent close={() => setMobileOpen(false)} />
        </aside>
      </div>
    </>
  );
};

export default UserSidebar;