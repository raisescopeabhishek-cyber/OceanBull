import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Menu as MenuIcon,
  Users,
  CreditCard,
  SquareStackIcon,
  LogOut,
  LucideBadgeDollarSign,
  Banknote,
  HandCoins,
  Home,
} from "lucide-react";

import resetAdmin from "../../redux/adminSlice";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { backendApi } from "@/utils/apiClients";

/* =============================================================
   Modules
   ============================================================= */
const modules = [
  { name: "Dashboard", path: "/admin/dashboard", icon: <Home className="w-5 h-5" /> },
  { name: "Login Logs", path: "/admin/login-logs", icon: <ChevronRight className="w-5 h-5" /> },
  {
    name: "Manage Users",
    path: "/admin/manage-users/all-users",
    icon: <Users className="w-5 h-5" />,
    children: [
      { name: "KYC Updates", path: "/admin/kyc-users" },
      { name: "IB Users", path: "/admin/ib-users" },
      { name: "Email Verified", path: "/admin/manage-users/email-verified" },
      { name: "Email Unverified", path: "/admin/manage-users/email-unverified" },
      { name: "KYC Verified", path: "/admin/manage-users/kyc-verified" },
      { name: "KYC Unverified", path: "/admin/manage-users/kyc-unverified" },
      { name: "All Users", path: "/admin/manage-users/all-users" },
    ],
  },
  {
    name: "Deposits",
    path: "/admin/deposit/all",
    icon: <LucideBadgeDollarSign className="w-5 h-5" />,
    children: [
      { name: "Pending Deposits", path: "/admin/deposit/pending" },
      { name: "Approved Deposits", path: "/admin/deposit/approved" },
      { name: "Rejected Deposits", path: "/admin/deposit/rejected" },
      { name: "All Deposits", path: "/admin/deposit/all" },
    ],
  },
  {
    name: "Withdrawals",
    path: "/admin/withdrawal/all",
    icon: <Banknote className="w-5 h-5" />,
    children: [
      { name: "Pending Withdrawals", path: "/admin/withdrawal/pending" },
      { name: "Approved Withdrawals", path: "/admin/withdrawal/approved" },
      { name: "Rejected Withdrawals", path: "/admin/withdrawal/rejected" },
      { name: "All Withdrawals", path: "/admin/withdrawal/all" },
    ],
  },
  {
    name: "IB Withdrawals",
    path: "/admin/ib-withdrawal/all",
    icon: <HandCoins className="w-5 h-5" />,
    children: [
      { name: "Pending IB Withdrawals", path: "/admin/ib-withdrawal/pending" },
      { name: "Approved IB Withdrawals", path: "/admin/ib-withdrawal/approved" },
      { name: "Rejected IB Withdrawals", path: "/admin/ib-withdrawal/rejected" },
      { name: "All IB Withdrawals", path: "/admin/ib-withdrawal/all" },
    ],
  },
  { name: "Payment Getaways", path: "/admin/getway/manual", icon: <CreditCard className="w-5 h-5" /> },
  { name: "IB Zone", path: "/admin/ib-zone", icon: <SquareStackIcon className="w-5 h-5" /> },
  { name: "Logout", path: "/admin/login", icon: <LogOut className="w-5 h-5" /> },
];

/* ==================== Theme helpers (RGB strings -> CSS) =================== */
const safeRgbParts = (v) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) =>
    Number.isFinite(n) ? n : 0
  );
  return { r, g, b };
};

const rgb = (v) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgb(${r}, ${g}, ${b})`;
};

const rgba = (v, a = 1) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const clampRadius = (r) => {
  const v = String(r ?? "14px").trim();
  if (v === "0" || v === "0px") return "0px";
  return v || "14px";
};

/* =============================================================
   Neon Rail
   ============================================================= */
const NeonRail = ({ active, theme }) => {
  if (!active) return <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r" />;
  const a = theme?.accent ?? "59 130 246";
  const p = theme?.sidebarHover ?? theme?.primary ?? theme?.success ?? "34 197 94";
  return (
    <span
      className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r"
      style={{
        background: `linear-gradient(180deg, ${rgba(p, 0.95)}, ${rgba(a, 0.95)}, ${rgba(p, 0.95)})`,
        boxShadow: `0 0 18px ${rgba(theme?.glow ?? a, 0.55)}`,
      }}
    />
  );
};

/* =============================================================
   Sidebar
   ============================================================= */
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();

  const themeConfig = useSelector((s) => s.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const radius = clampRadius(theme?.radius);
  const effectsEnabled = theme?.effectsEnabled !== false;
  const pattern = theme?.pattern;

  useEffect(() => {
    const parent = modules.find(
      (m) => m.children && m.children.some((c) => location.pathname.startsWith(c.path))
    );
    if (parent) setOpenMenu(parent.name);
    else setOpenMenu(null);
  }, [location.pathname]);

  const toggleMenu = (name) => setOpenMenu((prev) => (prev === name ? null : name));
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  // ---------- Colors ----------
  const C = {
    bg: theme?.bg ?? "0 0 0",
    fg: theme?.fg ?? "255 255 255",
    mutedFg: theme?.mutedFg ?? "203 213 225",
    border: theme?.border ?? theme?.inputBorder ?? "255 255 255",
    card: theme?.card ?? theme?.surface2 ?? "18 18 18",
    surface1: theme?.surface1 ?? theme?.bg ?? "0 0 0",
    accent: theme?.accent ?? "59 130 246",
    ring: theme?.ring ?? theme?.accent ?? "59 130 246",
    glow: theme?.glow ?? theme?.accent ?? "59 130 246",
    sidebar: theme?.sidebar ?? theme?.surface2 ?? "18 18 18",
    sidebarHover: theme?.sidebarHover ?? theme?.rowHover ?? "40 40 40",
    success: theme?.success ?? theme?.primary ?? "34 197 94",
    gradientFrom: theme?.gradientFrom ?? theme?.accent ?? "59 130 246",
    gradientTo: theme?.gradientTo ?? "147 51 234",
  };

  // ---------- Styles ----------
  const mobileBtnStyle = {
    borderRadius: radius,
    border: `1px solid ${rgba(C.border, 0.22)}`,
    background: `linear-gradient(135deg, ${rgba(C.sidebar, 0.92)}, ${rgba(C.surface1, 0.72)}, ${rgba(C.sidebar, 0.92)})`,
    color: rgba(C.fg, 0.92),
    boxShadow: `0 0 26px ${rgba(C.glow, 0.18)}`,
  };

  const overlayStyle = {
    background: `linear-gradient(180deg, ${rgba(C.bg, 0.62)}, ${rgba(C.bg, 0.72)})`,
  };

  const asideStyle = {
    color: rgb(C.fg),
    borderRight: `1px solid ${rgba(C.border, 0.14)}`,
  };

  const bgLayerStyle = {
    background: `linear-gradient(135deg, ${rgba(C.sidebar, 0.98)}, ${rgba(C.bg, 0.98)}, ${rgba(C.sidebar, 0.98)})`,
  };

  const glowLayerStyle = {
    opacity: effectsEnabled ? 1 : 0,
    background: `
      radial-gradient(60% 70% at 12% 0%, ${rgba(C.glow, 0.20)}, transparent 60%),
      radial-gradient(60% 70% at 90% 100%, ${rgba(C.gradientTo, 0.18)}, transparent 60%),
      radial-gradient(40% 40% at 50% 50%, ${rgba(C.accent, 0.06)}, transparent 65%)
    `,
  };

  const gridOverlayStyle =
    pattern === "grid"
      ? {
          opacity: effectsEnabled ? 0.10 : 0,
          backgroundImage: `linear-gradient(${rgba(C.accent, 0.22)} 1px, transparent 1px),
                            linear-gradient(90deg, ${rgba(C.accent, 0.22)} 1px, transparent 1px)`,
          backgroundSize: "46px 46px",
          maskImage: "radial-gradient(120% 80% at 50% 0%, black 58%, transparent 86%)",
          WebkitMaskImage: "radial-gradient(120% 80% at 50% 0%, black 58%, transparent 86%)",
        }
      : { opacity: 0 };

  const brandGradient = {
    backgroundImage: `linear-gradient(90deg, ${rgb(C.gradientFrom)}, ${rgb(C.gradientTo)})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    textShadow: `0 0 24px ${rgba(C.glow, 0.12)}`,
  };

  const dividerStyle = {
    background: `linear-gradient(90deg, transparent, ${rgba(C.accent, 0.35)}, transparent)`,
  };

  const iconChipStyle = (active) => ({
    borderRadius: "12px",
    border: `1px solid ${active ? rgba(C.accent, 0.30) : rgba(C.border, 0.10)}`,
    background: active
      ? `linear-gradient(135deg, ${rgba(C.accent, 0.14)}, ${rgba(C.success, 0.10)})`
      : rgba(C.card, 0.18),
  });

  const parentBtnStyle = (active) => ({
    borderRadius: radius,
    background: active ? rgba(C.accent, 0.10) : "transparent",
    border: `1px solid ${active ? rgba(C.accent, 0.24) : rgba(C.border, 0.08)}`,
    boxShadow: active ? `0 0 0 1px ${rgba(C.ring, 0.14)} inset` : "none",
  });

  const labelStyle = (active) => ({
    color: active ? rgba(C.accent, 0.95) : rgba(C.fg, 0.78),
  });

  const childBtnStyle = (active) => ({
    borderRadius: "10px",
    background: active ? rgba(C.sidebarHover, 0.22) : "transparent",
    color: active ? rgba(C.accent, 0.95) : rgba(C.fg, 0.72),
    border: `1px solid ${active ? rgba(C.accent, 0.22) : "transparent"}`,
  });

  // ✅ NEW: centralized logout handler (await backend call)
  const handleLogout = async () => {
    const t = toast.loading("Logging out…");
    try {
      const res = await backendApi.post("/auth/admin/logout"); // ✅ hits POST /api/auth/admin/logout
         if (res.data.redirectTo) window.location.href = res.data.redirectTo;
      toast.success("Logged out", { id: t });
    } catch (e) {
      // even if request fails, still clear local state
      dispatch(resetAdmin());
      toast.success("Logged out", { id: t });
    } finally {
      navigate("/admin/login", { replace: true });
      setMobileOpen(false);
          dispatch(resetAdmin());
    }
  };

  return (
    <>

      {/* Mobile Toggle Button */}
      {!mobileOpen && (
        <motion.button
          onClick={() => setMobileOpen(true)}
          whileTap={{ scale: 0.94 }}
          className="fixed top-4 left-4 z-[60] p-2 transition"
          style={mobileBtnStyle}
          aria-label="Open sidebar"
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 0 34px ${rgba(C.glow, 0.24)}`;
            e.currentTarget.style.borderColor = rgba(C.accent, 0.35);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `0 0 26px ${rgba(C.glow, 0.18)}`;
            e.currentTarget.style.borderColor = rgba(C.border, 0.22);
          }}
        >
          <MenuIcon className="w-5 h-5" />
        </motion.button>
      )}

      {/* Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={overlayStyle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="admin-themed-sidebar"
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed left-0 top-0 z-50 h-screen w-64 overflow-hidden shadow-2xl"
            style={asideStyle}
          >
            {/* Background layers */}
            <div className="absolute inset-0" style={bgLayerStyle} />
            <div className="absolute inset-0" style={glowLayerStyle} />
            <div className="absolute inset-0 pointer-events-none" style={gridOverlayStyle} />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ boxShadow: `inset 0 0 0 1px ${rgba(C.border, 0.10)}` }}
            />

            {/* Content */}
            <div className="relative flex h-full flex-col px-3 py-4">
              {/* Brand Title */}
              <div className="mb-4 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold" style={brandGradient}>
                    Admin Panel
                  </span>
                </div>
                <span className="h-[1px] flex-1 ml-3" style={dividerStyle} />
              </div>

              {/* Menu */}
              <div className="user-custom-scrollbar relative flex-1 overflow-y-auto pb-16">
                {modules.map((mod) => {
                  const anyChildActive = mod.children?.some((c) => location.pathname.startsWith(c.path));
                  const active = isActive(mod.path) || anyChildActive;
                  const open = openMenu === mod.name;

                  return (
                    <div key={mod.name} className="mb-1">
                      {/* Parent Item */}
                      <button
                        onClick={() => {
                          if (mod.name === "Logout") {
                            handleLogout();
                            return;
                          }

                          if (mod.children) toggleMenu(mod.name);
                          else {
                            navigate(mod.path);
                            setMobileOpen(false);
                          }
                        }}
                        className="relative block w-full px-3 py-2.5 text-left transition-all"
                        style={parentBtnStyle(active)}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.background = rgba(C.sidebarHover, 0.18);
                            e.currentTarget.style.borderColor = rgba(C.border, 0.14);
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor = rgba(C.border, 0.08);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <NeonRail active={active} theme={theme} />

                          <div className="flex h-9 w-9 items-center justify-center" style={iconChipStyle(active)}>
                            <span style={{ color: active ? rgba(C.accent, 0.95) : rgba(C.fg, 0.72) }}>
                              {mod.icon}
                            </span>
                          </div>

                          <span className="text-[12px] font-semibold tracking-wide" style={labelStyle(active)}>
                            {mod.name}
                          </span>

                          {mod.children && (
                            <span className="ml-auto" style={{ color: rgba(C.mutedFg, 0.6) }}>
                              {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Children */}
                      {mod.children && (
                        <AnimatePresence initial={false}>
                          <motion.div
                            key={`${mod.name}-collapse`}
                            initial={false}
                            animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="ml-6 mt-2 overflow-hidden"
                          >
                            <div className="max-h-60 overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]">
                              {mod.children.map((child) => {
                                const childActive = location.pathname === child.path;
                                return (
                                  <button
                                    key={child.name}
                                    onClick={() => {
                                      navigate(child.path);
                                      setMobileOpen(false);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm w-full text-left transition duration-200 font-medium"
                                    style={childBtnStyle(childActive)}
                                    onMouseEnter={(e) => {
                                      if (!childActive) e.currentTarget.style.background = rgba(C.sidebarHover, 0.16);
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!childActive) e.currentTarget.style.background = "transparent";
                                    }}
                                  >
                                    <span
                                      className="h-1.5 w-1.5 rounded-full"
                                      style={{ background: rgba(C.accent, childActive ? 0.95 : 0.60) }}
                                    />
                                    {child.name}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer mini */}
              <div
                className="mt-2 pt-2 text-[10px]"
                style={{
                  borderTop: `1px solid ${rgba(C.border, 0.12)}`,
                  color: rgba(C.mutedFg, 0.55),
                }}
              >
                <div className="flex items-center justify-between px-1">
                  <span>v1.0</span>
                  <span className="inline-flex items-center gap-1">
                    <span
                      className="h-1.5 w-1.5 animate-pulse rounded-full"
                      style={{ background: rgba(C.success, 0.9) }}
                    />
                    Live
                  </span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
