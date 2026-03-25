import { useState, useRef, useEffect, useMemo } from "react";
import { User, LogOut, Bell, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import { adminApi } from "../../utils/apiClients";
import { setNotification } from "../../redux/adminSlice"; // adjust slice path if needed
import { handleToggleSidebar } from "../../redux/user/userSlice"; // if you have an admin toggle, swap this import
import { FloatingParticles } from "../../utils/FloatingParticles";

/* -------------------- theme helpers (RGB strings -> css) ------------------- */
const safeRgbParts = (v) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) => (Number.isFinite(n) ? n : 0));
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

/* ---------------- Notification Dropdown ---------------- */
const NotificationDropdown = ({ isOpen, onClose, adminId, theme }) => {
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useSelector((state) => state.admin.notification) || [];
  const radius = theme?.radius || "14px";

  useEffect(() => {
    if (!adminId) return;
    const fetchNotifications = async () => {
      try {
        const { data } = await adminApi.get(`/get-all-notification/${adminId}`);
        if (data.success) dispatch(setNotification(data.data));
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, [adminId, location.pathname, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = async (note) => {
    try {
      await adminApi.put(`/admin/mark-notification-read/${note._id}`);
      dispatch(
        setNotification(
          notifications.map((n) => (n._id === note._id ? { ...n, isRead: true } : n))
        )
      );
      if (note.adminLink) navigate(note.adminLink);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 right-0 top-10 w-80 overflow-hidden"
            style={{
              borderRadius: radius,
              background: `linear-gradient(180deg, ${rgba(theme?.bg || "0 0 0", 0.95)}, ${rgba(
                theme?.surface2 || theme?.card || "18 18 18",
                0.92
              )})`,
              border: `1px solid ${rgba(theme?.border || "255 255 255", 0.14)}`,
              boxShadow: `0 18px 60px ${rgba(theme?.shadowColor || "0 0 0", 0.5)}`,
              color: rgb(theme?.fg || "255 255 255"),
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-2 border-b"
              style={{ borderBottomColor: rgba(theme?.border || "255 255 255", 0.12) }}
            >
              <p className="font-semibold">Notifications</p>
              <button
                onClick={onClose}
                aria-label="Close"
                className="transition-colors"
                style={{ color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.7) }}
                onMouseEnter={(e) => (e.currentTarget.style.color = rgba(theme?.fg || "255 255 255", 0.95))}
                onMouseLeave={(e) => (e.currentTarget.style.color = rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.7))}
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((note, index) => {
                  const unread = !note.isRead;
                  return (
                    <motion.button
                      key={note._id}
                      onClick={() => handleNotificationClick(note)}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="w-full text-left px-4 py-3 transition-all flex flex-col border-b"
                      style={{
                        borderBottomColor: rgba(theme?.border || "255 255 255", 0.1),
                        background: unread ? rgba(theme?.accent || "59 130 246", 0.08) : "transparent",
                        color: unread ? rgba(theme?.fg || "255 255 255", 0.92) : rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.75),
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = rgba(theme?.rowHover || theme?.surface3 || "30 30 30", 0.22))}
                      onMouseLeave={(e) => (e.currentTarget.style.background = unread ? rgba(theme?.accent || "59 130 246", 0.08) : "transparent")}
                    >
                      <div className="flex justify-between items-center">
                        <p className="text-sm">{note.title}</p>
                        <span className="text-[10px]" style={{ color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.55) }}>
                          {new Date(note.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.55) }}>
                        {note.message}
                      </p>
                    </motion.button>
                  );
                })
              ) : (
                <p className="px-4 py-2 text-sm" style={{ color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.6) }}>
                  No notifications
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------------- Admin Dropdown ---------------- */
const AdminDropdown = ({ isOpen, onClose, admin, theme }) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const radius = theme?.radius || "14px";

  const logoutHandler = () => {
    // clear admin state or token
    navigate("/login");
  };

  const menuItems = [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div ref={dropdownRef} className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 right-0 top-10 w-48 overflow-hidden"
            style={{
              borderRadius: radius,
              background: `linear-gradient(180deg, ${rgba(theme?.bg || "0 0 0", 0.95)}, ${rgba(
                theme?.surface2 || theme?.card || "18 18 18",
                0.92
              )})`,
              border: `1px solid ${rgba(theme?.border || "255 255 255", 0.14)}`,
              boxShadow: `0 18px 60px ${rgba(theme?.shadowColor || "0 0 0", 0.5)}`,
              color: rgb(theme?.fg || "255 255 255"),
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="py-1">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center px-4 py-2 text-sm transition-all"
                  style={{ color: rgba(theme?.fg || "255 255 255", 0.85) }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = rgba(theme?.rowHover || theme?.surface3 || "30 30 30", 0.22))}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {item.label}
                </Link>
              ))}

              <button
                onClick={logoutHandler}
                className="flex items-center w-full px-4 py-2 text-sm font-semibold transition-all"
                style={{ color: rgba(theme?.danger || "244 63 94", 0.95) }}
                onMouseEnter={(e) => (e.currentTarget.style.background = rgba(theme?.danger || "244 63 94", 0.12))}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------------- Main Admin Header (THEME-APPLIED) ---------------- */
const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // NOTE: you were reading sidebar open from admin slice but toggling user slice.
  // Keeping your current logic, but making it safe.
  const isSidebarOpen = useSelector((store) => store.admin.isSidebarOpen);
  const dispatch = useDispatch();

  const admin = useSelector((store) => store.admin.adminUser);

  // Theme from user slice
  const themeConfig = useSelector((store) => store.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const radius = theme?.radius || "14px";

  // 🔥 Try admin.siteConfig first, then fall back to user.siteConfig
  const adminSiteConfig = useSelector((store) => store.admin.siteConfig);
  const userSiteConfig = useSelector((store) => store.user.siteConfig);
  const siteConfig = adminSiteConfig || userSiteConfig || {};

  const baseHeight = siteConfig.logoSize || 4;
  const notifications = useSelector((store) => store.admin.notification) || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const sidebarHandler = () => dispatch(handleToggleSidebar(!isSidebarOpen));

  return (
    <nav
      className="sticky top-0 z-50 h-16 w-full"
      style={{
        color: rgb(theme?.fg || "255 255 255"),
        background: `linear-gradient(90deg, ${rgba(theme?.bg || "0 0 0", 0.92)}, ${rgba(
          theme?.headerRow || theme?.surface3 || "30 30 30",
          0.72
        )}, ${rgba(theme?.bg || "0 0 0", 0.92)})`,
        borderBottom: `1px solid ${rgba(theme?.border || "255 255 255", 0.14)}`,
        position: "sticky",
        top: 0,
      }}
    >
      {/* particle layer */}
      {theme?.effectsEnabled !== false && <FloatingParticles />}

      <Sidebar />

      <div className="flex justify-between items-center md:px-5 h-full">
        {/* Left: Sidebar Toggle + Logo */}
        <div className="flex gap-2 items-center">
          <button
            className="sm:hidden"
            onClick={sidebarHandler}
            aria-label="Toggle sidebar"
            style={{
              width: 34,
              height: 34,
              borderRadius: "999px",
              border: `1px solid ${rgba(theme?.border || "255 255 255", 0.16)}`,
              background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.2),
              color: rgba(theme?.fg || "255 255 255", 0.9),
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = rgba(theme?.rowHover || theme?.surface3 || "30 30 30", 0.24))}
            onMouseLeave={(e) => (e.currentTarget.style.background = rgba(theme?.surface2 || theme?.card || "18 18 18", 0.2))}
          >
            <User className="w-4 h-4 mx-auto" />
          </button>

          <a href="/admin/dashboard" className="mr-4">
            {siteConfig.logo ? (
              <img
                src={siteConfig.logo}
                alt={siteConfig.siteName || "Logo"}
                className="block md:hidden object-contain w-auto dynamic-logo"
              />
            ) : null}

            <style jsx>{`
              .dynamic-logo {
                height: ${baseHeight * 0.8}rem;
              }
              @media (min-width: 640px) {
                .dynamic-logo {
                  height: ${baseHeight * 0.666}rem;
                }
              }
              @media (min-width: 768px) {
                .dynamic-logo {
                  height: ${baseHeight}rem;
                }
              }
              @media (min-width: 1024px) {
                .dynamic-logo {
                  height: ${baseHeight * 1.2}rem;
                }
              }
            `}</style>
          </a>
        </div>

        {/* Center Title / Logo */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {siteConfig?.logo && (
            <img
              src={siteConfig.logo}
              alt={siteConfig?.siteName || "Logo"}
              className="object-contain w-44"
              style={{ height: `${baseHeight}rem` }}
            />
          )}
        </div>

        {/* Right: Notifications + Admin */}
        <div className="relative flex items-center gap-3 pr-3">
          {/* Bell */}
          <button
            onClick={() => {
              setIsNotificationOpen((v) => !v);
              setIsDropdownOpen(false);
            }}
            className="relative flex items-center justify-center transition"
            aria-label="Notifications"
            style={{
              width: 34,
              height: 34,
              borderRadius: "999px",
              border: `1px solid ${rgba(theme?.border || "255 255 255", 0.16)}`,
              background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.2),
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = rgba(theme?.rowHover || theme?.surface3 || "30 30 30", 0.24))}
            onMouseLeave={(e) => (e.currentTarget.style.background = rgba(theme?.surface2 || theme?.card || "18 18 18", 0.2))}
          >
            <Bell className="w-5 h-5" style={{ color: rgba(theme?.fg || "255 255 255", 0.85) }} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 text-[10px] flex items-center justify-center rounded-full"
                style={{
                  background: rgb(theme?.danger || "244 63 94"),
                  color: rgb(theme?.dangerFg || "255 255 255"),
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            adminId={admin?._id}
            theme={theme}
          />

          {/* Admin name */}
          <div className="flex items-center gap-1">
            <p className="md:text-sm text-[10px] font-semibold whitespace-nowrap" style={{ color: rgba(theme?.fg || "255 255 255", 0.82) }}>
              {admin?.firstName}
            </p>
          </div>

          {/* Admin avatar */}
          <button
            onClick={() => {
              setIsDropdownOpen((v) => !v);
              setIsNotificationOpen(false);
            }}
            className="flex items-center justify-center transition"
            aria-label="Open admin menu"
            style={{
              width: 34,
              height: 34,
              borderRadius: "999px",
              border: `1px solid ${rgba(theme?.border || "255 255 255", 0.16)}`,
              background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.2),
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = rgba(theme?.rowHover || theme?.surface3 || "30 30 30", 0.24))}
            onMouseLeave={(e) => (e.currentTarget.style.background = rgba(theme?.surface2 || theme?.card || "18 18 18", 0.2))}
          >
            <User className="w-4 h-4 md:w-6 md:h-6" style={{ color: rgba(theme?.fg || "255 255 255", 0.85) }} />
          </button>

          <AdminDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            admin={admin}
            theme={theme}
          />
        </div>
      </div>
    </nav>
  );
};

export default Header;
