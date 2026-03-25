// Sidebar.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Menu,
  LogOut,
  CreditCard,
  Banknote,
  ShieldCheck,
  X,
  Palette, // ✅ NEW
} from "lucide-react";
import { backendApi } from "@/utils/apiClients";
import { toast } from "react-toastify";

const modules = [
  {
    name: "Account Configuration",
    path: "/s-admin",
    icon: <CreditCard className="w-5 h-5" />,
    children: [
      {
        name: "Platform",
        path: "/s-admin/Platform",
        icon: <CreditCard className="w-4 h-4 text-white/60" />,
      },
      {
        name: "Group",
        path: "/s-admin/Group",
        icon: <Banknote className="w-4 h-4 text-white/60" />,
      },
      {
        name: "Configure Account Types",
        path: "/s-admin/configure-account-types",
        icon: <Banknote className="w-4 h-4 text-white/60" />,
      },
    ],
  },

  // ✅ NEW SECTION
  {
    name: "Theme Config",
    path: "/s-admin/theme-config",
    icon: <Palette className="w-5 h-5" />,
  },

  {
    name: "Site Configuration",
    path: "/s-admin/site-configuration",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: "Admin Info",
    path: "/s-admin/admin-information",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: "Logout",
    path: "/s-admin/login",
    icon: <LogOut className="w-5 h-5" />,
  },
];

const SidebarContent = ({ close }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);

    try {
      const res = await backendApi.post("/auth/s-admin/logout");
      const data = res?.data;

      toast.success(data?.message || "Logged out");
      close?.();
      navigate("/s-admin/login", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Logout failed";
      toast.error(msg);

      // even if server fails, still kick user out of UI
      close?.();
      navigate("/s-admin/login", { replace: true });
    } finally {
      setLogoutLoading(false);
    }
  };

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="relative h-full overflow-hidden">
      {/* dotted background inside sidebar */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: "#2b2b2b",
          backgroundImage: `
            radial-gradient(rgba(255,255,255,0.20) 1px, transparent 1px),
            radial-gradient(rgba(0,0,0,0.20) 1px, transparent 1px)
          `,
          backgroundSize: "12px 12px, 12px 12px",
          backgroundPosition: "0 0, 6px 6px",
          opacity: 0.18,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(80% 55% at 50% 30%, rgba(255,255,255,0.06), transparent 55%), radial-gradient(100% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      <div
        className="relative h-full border-r border-black/50 shadow-[0_20px_60px_rgba(0,0,0,0.55)]
      bg-gradient-black from-[#3a3a3a]/70 to-[#1f1f1f]/90 backdrop-blur-sm"
      >
        {/* Top bar */}
        <div className="px-4 py-4 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-white/65" size={18} />
            <div>
              <div className="tracking-[0.22em] text-[11px] font-semibold text-white/75">
                SUPERADMIN
              </div>
              <div className="text-[10px] text-white/35 -mt-0.5">
                Security World
              </div>
            </div>
          </div>

          {close && (
            <button
              onClick={close}
              className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          )}
        </div>

        {/* Scroll area */}
        <div className="h-[calc(100%-64px)] overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/15 hover:scrollbar-thumb-white/25 transition-colors">
          {/* Brand block */}
          <div className="mb-5 rounded-xl border border-white/10 bg-black/15 p-4 shadow-inner">
            <div className="text-lg font-extrabold tracking-wide text-white/80">
              MASTER
            </div>
            <div className="text-xs tracking-[0.18em] text-white/45 mt-1">
              Management Simplified
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {modules.map((mod) => {
              const active = isActive(mod.path);
              const isOpen = openMenus[mod.name] || active;

              return (
                <div key={mod.name}>
                  <button
                    onClick={() => {
                      if (mod.children) {
                        toggleMenu(mod.name);
                      } else {
                        if (mod.name === "Logout") {
                          handleLogout();
                        } else {
                          navigate(mod.path);
                          close?.();
                        }
                      }
                    }}
                    className={[
                      "w-full rounded-xl px-4 py-3 text-left",
                      "flex items-center justify-between",
                      "border transition",
                      active
                        ? "bg-white/10 border-white/15 shadow-[0_10px_22px_rgba(0,0,0,0.35)]"
                        : "bg-black/10 border-white/10 hover:bg-white/10",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white/70">{mod.icon}</span>
                      <span className="text-sm font-medium tracking-wide text-white/80">
                        {mod.name}
                      </span>
                    </div>

                    {mod.children && (
                      <span className="text-white/55">
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </button>

                  {mod.children && (
                    <div
                      className={[
                        "ml-2 mt-2 overflow-hidden",
                        "transition-[max-height,opacity] duration-500 ease-in-out",
                        isOpen ? "max-h-56 opacity-100" : "max-h-0 opacity-0",
                      ].join(" ")}
                    >
                      <div className="rounded-xl border border-white/10 bg-black/10 p-2">
                        {mod.children.map((child) => {
                          const childActive = location.pathname === child.path;

                          return (
                            <button
                              key={child.name}
                              onClick={() => {
                                navigate(child.path);
                                close?.();
                              }}
                              className={[
                                "w-full rounded-lg px-3 py-2",
                                "flex items-center gap-2 text-left text-sm",
                                "transition",
                                childActive
                                  ? "bg-white/10 text-white border border-white/10"
                                  : "text-white/70 hover:bg-white/10",
                              ].join(" ")}
                            >
                              {child.icon}
                              {child.name}
                            </button>
                          );
                        })}
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

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block fixed top-0 left-0 h-screen w-72 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile button */}
      {!mobileOpen && (
        <div className="md:hidden fixed top-4 left-4 z-[60]">
          <button
            onClick={() => setMobileOpen(true)}
            className={[
              "h-11 w-11 rounded-lg",
              "bg-gradient-to-b from-[#3a3a3a] to-[#1f1f1f]",
              "border border-black/50",
              "shadow-[0_12px_30px_rgba(0,0,0,0.55)]",
              "grid place-items-center",
              "hover:brightness-110 active:brightness-95 transition",
            ].join(" ")}
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5 text-white/80" />
          </button>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <button
            aria-label="Close sidebar backdrop"
            className="md:hidden fixed inset-0 z-50 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed top-0 left-0 z-[55] h-screen w-72 max-w-[85vw]">
            <SidebarContent close={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;
