import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  LogOut,
  HandCoins,
  ShieldCheck,
  LayoutDashboard,
  UserRoundCog,
  BadgeCheck,
  Wallet,
  Users2,
  CircleDollarSign,
} from "lucide-react";
import { backendApi } from "@/utils/apiClients";
import toast from "react-hot-toast";
import resetAdmin from "../../redux/adminSlice";
import sidebarBg from "@/assets/sidebar.png";

const modules = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    subtitle: "Quick Overview",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: "Client",
    path: "/admin/manage-users",
    subtitle: "Client Control",
    icon: <UserRoundCog className="w-5 h-5" />,
  },
  {
    name: "Manage Kyc",
    path: "/admin/kyc-users",
    subtitle: "Verify Profiles",
    icon: <BadgeCheck className="w-5 h-5" />,
  },
  {
    name: "Funds",
    path: "/admin/deposit",
    subtitle: "Deposit Records",
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    name: "Payout",
    path: "/admin/withdrawal",
    subtitle: "Withdraw Requests",
    icon: <HandCoins className="w-5 h-5" />,
  },

    {
    name: "Bonus",
    path: "/admin/BonusReports",
    subtitle: "Client Control",
    icon: <UserRoundCog className="w-5 h-5" />,
  },
  {
  name: "Insurance",
  path: "/admin/insurance-report",
  subtitle: "Coverage Reports",
  icon: <ShieldCheck className="w-5 h-5" />,
},


  {
    name: "Referral",
    path: "/admin/manage-users/all-users",
    subtitle: "Partner Network",
    icon: <Users2 className="w-5 h-5" />,
    children: [
      {
        name: "Users",
        path: "/admin/ib-users",
        icon: <Users2 className="w-4 h-4" />,
      },
      {
        name: "Payout",
        path: "/admin/ib-withdrawal",
        icon: <CircleDollarSign className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "Logout",
    path: "/admin/login",
    icon: <LogOut className="w-5 h-5" />,
    danger: true,
  },
];

const SidebarContent = ({ close }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const mode = useSelector((store) => store.adminTheme?.mode || "light");
  const isDark = mode === "dark";

  const [openMenus, setOpenMenus] = useState({
    Referral:
      location.pathname.startsWith("/admin/ib-users") ||
      location.pathname.startsWith("/admin/ib-withdrawal") ||
      location.pathname.startsWith("/admin/manage-users/all-users"),
  });

  const [logoutLoading, setLogoutLoading] = useState(false);
  const [sidebarGlow, setSidebarGlow] = useState({
    x: 160,
    y: 200,
    visible: false,
  });

  const isPathActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const moduleStates = useMemo(() => {
    return modules.reduce((acc, mod) => {
      const active = mod.children
        ? mod.children.some((child) => isPathActive(child.path)) || isPathActive(mod.path)
        : mod.path
        ? isPathActive(mod.path)
        : false;

      acc[mod.name] = active;
      return acc;
    }, {});
  }, [location.pathname]);

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);

    const loadingToast = toast.loading("Logging out...");

    try {
      const res = await backendApi.post("/auth/admin/logout");

      if (res?.data?.redirectTo) {
        dispatch(resetAdmin());
        toast.success(res?.data?.message || "Logged out successfully", {
          id: loadingToast,
        });
        window.location.href = res.data.redirectTo;
        return;
      }

      dispatch(resetAdmin());
      toast.success(res?.data?.message || "Logged out successfully", {
        id: loadingToast,
      });
      close?.();
      navigate("/admin/login", { replace: true });
    } catch (err) {
      dispatch(resetAdmin());
      toast.success("Logged out", { id: loadingToast });
      close?.();
      navigate("/admin/login", { replace: true });
    } finally {
      setLogoutLoading(false);
    }
  };

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
            "relative px-5 py-5 border-b transition-colors duration-300",
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
                "grid h-11 w-11 place-items-center rounded-2xl border",
                isDark
                  ? "border-white/10 bg-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                  : "border-orange-100 bg-white/85 shadow-[0_10px_30px_rgba(251,146,60,0.12)]",
              ].join(" ")}
            >
              <ShieldCheck
                className={
                  isDark ? "w-5 h-5 text-white/85" : "w-5 h-5 text-orange-600"
                }
              />
            </div>

            <div>
              <div
                className={[
                  "text-[11px] font-semibold tracking-[0.28em]",
                  isDark ? "text-white/80" : "text-slate-700",
                ].join(" ")}
              >
                ADMIN
              </div>
              <div
                className={[
                  "mt-0.5 text-[11px]",
                  isDark ? "text-white/40" : "text-slate-500",
                ].join(" ")}
              >
                Security World
              </div>
            </div>
          </div>
        </div>

        <div
          className={[
            "h-[calc(100%-88px)] overflow-y-auto px-4 py-4 scrollbar-thin",
            isDark
              ? "scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20"
              : "scrollbar-track-transparent scrollbar-thumb-orange-200 hover:scrollbar-thumb-orange-300",
          ].join(" ")}
        >
          <nav className="space-y-3">
            {modules.map((mod) => {
              const active = moduleStates[mod.name];
              const isOpen = mod.children ? openMenus[mod.name] ?? active : false;
              const isDanger = mod.danger;

              return (
                <div key={mod.name}>
                  <button
                    onMouseMove={handlePointerMove}
                    onClick={() => {
                      if (mod.children) {
                        toggleMenu(mod.name);
                        return;
                      }

                      if (mod.name === "Logout") {
                        handleLogout();
                        return;
                      }

                      navigate(mod.path);
                      close?.();
                    }}
                    disabled={mod.name === "Logout" && logoutLoading}
                    className={[
                      "group relative w-full overflow-hidden px-3 py-2 text-left transition-all duration-300",
                      "flex items-center justify-between rounded-xl",
                      "hover:z-10",
                      !isDanger &&
                        (isDark
                          ? ""
                          : "hover:bg-white/65 hover:shadow-[0_0_20px_rgba(251,146,60,0.14)]"),
                      isDanger &&
                        (isDark
                          ? ""
                          : "hover:bg-red-50/80 hover:shadow-[0_0_20px_rgba(239,68,68,0.10)]"),
                    ].join(" ")}
                    style={{
                      "--x": "50%",
                      "--y": "50%",
                    }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background: isDanger
                          ? isDark
                            ? "radial-gradient(140px circle at var(--x) var(--y), rgba(248,113,113,0.22), transparent 60%)"
                            : "radial-gradient(140px circle at var(--x) var(--y), rgba(239,68,68,0.18), transparent 60%)"
                          : isDark
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

                    {active && !isDanger && (
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
                          mod.danger
                            ? isDark
                              ? "border-red-400/20 bg-red-500/10 text-red-300"
                              : "border-red-200 bg-red-50 text-red-600"
                            : active
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
                            mod.danger
                              ? isDark
                                ? "text-red-200"
                                : "text-red-700"
                              : active
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

                        {!mod.children && mod.name !== "Logout" && (
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
                        )}

                        {mod.children && (
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
                        )}

                        {mod.name === "Logout" && (
                          <div
                            className={[
                              "mt-0.5 text-[11px] transition-colors duration-300",
                              isDark
                                ? "text-red-200/60 group-hover:text-red-200"
                                : "text-red-500 group-hover:text-red-600",
                            ].join(" ")}
                          >
                            End secure session
                          </div>
                        )}
                      </div>
                    </div>

                    {mod.children && (
                      <div
                        className={[
                          "relative z-10 grid h-8 w-8 place-items-center rounded-lg border transition duration-300",
                          active
                            ? isDark
                              ? "border-blue-400/20 text-blue-200 bg-blue-500/10"
                              : "border-orange-200 bg-orange-50 text-orange-700"
                            : isDark
                            ? "border-white/10 bg-black/20 text-white/55 group-hover:text-white/80"
                            : "border-orange-100 bg-white/85 text-slate-500 group-hover:text-slate-800",
                        ].join(" ")}
                      >
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </button>

                  {mod.children && (
                    <div
                      className={[
                        "grid transition-all duration-300 ease-out",
                        isOpen
                          ? "grid-rows-[1fr] opacity-100 mt-2"
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
                                  "group/child relative flex w-full items-center gap-3 px-3 py-2 text-left transition-all duration-200 overflow-hidden rounded-xl",
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

                                <div className="relative z-10 flex-1 min-w-0">
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
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mode = useSelector((store) => store.adminTheme?.mode || "light");
  const isDark = mode === "dark";

  return (
    <>
      <aside className="hidden md:block fixed left-0 top-0 z-0 h-screen w-72">
        <SidebarContent />
      </aside>

      {!mobileOpen && (
        <div className="md:hidden fixed top-4 left-4 z-[70]">
          <button
            onClick={() => setMobileOpen(true)}
            className={[
              "grid h-11 w-11 place-items-center rounded-xl border backdrop-blur-md transition",
              "hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:scale-105 hover:brightness-110",
              isDark
                ? "border-white/10 bg-[#111]/90 text-white/85 shadow-[0_12px_30px_rgba(0,0,0,0.45)] hover:bg-white/[0.08]"
                : "border-orange-100 bg-white/90 text-slate-700 shadow-[0_12px_30px_rgba(251,146,60,0.12)] hover:bg-orange-50/70",
            ].join(" ")}
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      )}

      <div
        className={[
          "md:hidden fixed inset-0 z-[80] transition-all duration-300",
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

export default Sidebar;