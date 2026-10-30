import { useState, useRef, useEffect } from "react";
import {
  User,
  LogOut,
  Bell,
  X,
  Sun,
  Moon,
  Menu,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";

import { adminApi } from "../../utils/apiClients";
import { setNotification } from "../../redux/adminSlice";
import { handleToggleSidebar } from "../../redux/user/userSlice";
import { toggleAdminTheme } from "../../redux/adminThemeSlice";
import { FloatingParticles } from "../../utils/FloatingParticles";
import { mt5AccountsStore } from "../../services/mt5Accounts";

/* helpers */
const rgba = (r, g, b, a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`;

const getThemeColors = (isDark) => {
  return isDark
    ? {
        fg: "255,255,255",
        muted: "255,255,255",
        bg: "5,7,11",
        surface: "17,24,39",
        surface2: "30,41,59",
        border: "255,255,255",
        accent: "59,130,246",
        danger: "244,63,94",
        success: "16,185,129",
      }
    : {
        fg: "15,23,42",
        muted: "71,85,105",
        bg: "255,250,247",
        surface: "255,255,255",
        surface2: "255,244,235",
        border: "251,146,60",
        accent: "249,115,22",
        danger: "244,63,94",
        success: "5,150,105",
      };
};

/* Notification Dropdown */
const NotificationDropdown = ({ isOpen, onClose, adminId, colors }) => {
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useSelector((state) => state.admin.notification) || [];

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = async (note) => {
    try {
      await adminApi.put(`/admin/mark-notification-read/${note._id}`);
      dispatch(
        setNotification(
          notifications.map((n) =>
            n._id === note._id ? { ...n, isRead: true } : n
          )
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
            className="absolute z-50 right-0 top-10 w-80 overflow-hidden rounded-2xl border backdrop-blur-xl"
            style={{
              background: `linear-gradient(180deg, ${rgba(...colors.bg.split(",").map(Number), 0.96)}, ${rgba(...colors.surface.split(",").map(Number), 0.94)})`,
              borderColor: rgba(...colors.border.split(",").map(Number), 0.14),
              color: rgba(...colors.fg.split(",").map(Number), 1),
              boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{
                borderBottomColor: rgba(...colors.border.split(",").map(Number), 0.12),
              }}
            >
              <p className="font-semibold">Notifications</p>
              <button onClick={onClose}>
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
                        borderBottomColor: rgba(...colors.border.split(",").map(Number), 0.08),
                        background: unread
                          ? rgba(...colors.accent.split(",").map(Number), 0.08)
                          : "transparent",
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{note.title}</p>
                        <span
                          className="text-[10px]"
                          style={{
                            color: rgba(...colors.muted.split(",").map(Number), 0.75),
                          }}
                        >
                          {new Date(note.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p
                        className="text-xs mt-1"
                        style={{
                          color: rgba(...colors.muted.split(",").map(Number), 0.9),
                        }}
                      >
                        {note.message}
                      </p>
                    </motion.button>
                  );
                })
              ) : (
                <p
                  className="px-4 py-3 text-sm"
                  style={{ color: rgba(...colors.muted.split(",").map(Number), 0.9) }}
                >
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

/* Admin Dropdown */
const AdminDropdown = ({ isOpen, onClose, admin, colors }) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const logoutHandler = () => {
    mt5AccountsStore.reset();
    navigate("/auth/admin/login");
  };

  return (
    <div ref={dropdownRef} className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 right-0 top-10 w-48 overflow-hidden rounded-2xl border backdrop-blur-xl"
            style={{
              background: `linear-gradient(180deg, ${rgba(...colors.bg.split(",").map(Number), 0.96)}, ${rgba(...colors.surface.split(",").map(Number), 0.94)})`,
              borderColor: rgba(...colors.border.split(",").map(Number), 0.14),
              color: rgba(...colors.fg.split(",").map(Number), 1),
              boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
            }}
          >
            <div className="py-2">
              <div className="px-4 py-2 text-sm font-semibold">
                {admin?.firstName || "Admin"}
              </div>


  <div className="px-4 cursor-pointer py-2 text-sm font-semibold" onClick={()=>{navigate("/admin/login-logs")}}>
                Logs
              </div>



                <div className="px-4 cursor-pointer py-2 text-sm font-semibold" onClick={()=>{navigate("/admin/getway/manual")}}>
                Gateway Settings
              </div>


                <div className="px-4 cursor-pointer py-2 text-sm font-semibold" onClick={()=>{navigate("/admin/ib-zone")}}>
                Referral Zone
              </div>


                  <div className="px-4 cursor-pointer py-2 text-sm font-semibold" onClick={()=>{navigate("/admin/RulesManagement")}}>
                Rules
              </div>


              <button
                onClick={logoutHandler}
                className="flex items-center w-full px-4 py-2 text-sm font-semibold transition-all"
                style={{
                  color: rgba(...colors.danger.split(",").map(Number), 1),
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const isSidebarOpen = useSelector((store) => store.admin?.isSidebarOpen);
  const admin = useSelector((store) => store.admin?.adminUser);
  const adminSiteConfig = useSelector((store) => store.admin?.siteConfig);
  const userSiteConfig = useSelector((store) => store.user?.siteConfig);
  const notifications = useSelector((store) => store.admin?.notification) || [];
  const mode = useSelector((store) => store.adminTheme?.mode || "light");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isDark = mode === "dark";
  const colors = getThemeColors(isDark);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const siteConfig = adminSiteConfig || userSiteConfig || {};
  const baseHeight = siteConfig.logoSize || 4;

  const sidebarHandler = () => {
    dispatch(handleToggleSidebar(!isSidebarOpen));
  };

  const toggleThemeHandler = () => {
    dispatch(toggleAdminTheme());
  };

  return (
    <nav
      className="sticky top-0 z-50 h-16 w-full border-b backdrop-blur-xl"
      style={{
        color: rgba(...colors.fg.split(",").map(Number), 1),
        background: `linear-gradient(90deg, ${rgba(...colors.bg.split(",").map(Number), 0.92)}, ${rgba(...colors.surface2.split(",").map(Number), 0.78)}, ${rgba(...colors.bg.split(",").map(Number), 0.92)})`,
        borderBottomColor: rgba(...colors.border.split(",").map(Number), 0.14),
      }}
    >
      <FloatingParticles />

      <div className="flex justify-between items-center px-3 md:px-5 h-full">
        <div className="flex gap-2 items-center">
          <button
            className="md:hidden flex items-center justify-center"
            onClick={sidebarHandler}
            aria-label="Toggle sidebar"
            style={{
              width: 36,
              height: 36,
              borderRadius: "999px",
              border: `1px solid ${rgba(...colors.border.split(",").map(Number), 0.16)}`,
              background: rgba(...colors.surface.split(",").map(Number), 0.35),
            }}
          >
            <Menu className="w-4 h-4" />
          </button>

          <Link to="/admin/dashboard" className="mr-2">
            {siteConfig.logo ? (
              <img
                src={siteConfig.logo}
                alt={siteConfig.siteName || "Logo"}
                className="block md:hidden object-contain w-auto"
                style={{ height: `${baseHeight * 0.8}rem` }}
              />
            ) : null}
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center">
          {siteConfig?.logo ? (
            <img
              src={siteConfig.logo}
              alt={siteConfig?.siteName || "Logo"}
              className="object-contain w-40 md:w-44"
              style={{ height: `${baseHeight}rem` }}
            />
          ) : (
            <h1 className="font-bold text-sm md:text-base">Admin Panel</h1>
          )}
        </div>

        <div className="relative flex items-center gap-2 md:gap-3">

            <p className="hidden cursor-pointer sm:block text-sm font-semibold whitespace-nowrap" onClick={()=>{navigate("/admin/ib-users")}}>
            Network
          </p>
          <button
            onClick={toggleThemeHandler}
            className="flex items-center justify-center transition"
            aria-label="Toggle theme"
            style={{
              width: 36,
              height: 36,
              borderRadius: "999px",
              border: `1px solid ${rgba(...colors.border.split(",").map(Number), 0.16)}`,
              background: rgba(...colors.surface.split(",").map(Number), 0.35),
            }}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          

          <button
            onClick={() => {
              setIsNotificationOpen((prev) => !prev);
              setIsDropdownOpen(false);
            }}
            className="relative flex items-center justify-center transition"
            aria-label="Notifications"
            style={{
              width: 36,
              height: 36,
              borderRadius: "999px",
              border: `1px solid ${rgba(...colors.border.split(",").map(Number), 0.16)}`,
              background: rgba(...colors.surface.split(",").map(Number), 0.35),
            }}
          >

            
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] flex items-center justify-center rounded-full"
                style={{
                  background: rgba(...colors.danger.split(",").map(Number), 1),
                  color: "#fff",
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
            colors={colors}
          />



          <button
            onClick={() => {
              setIsDropdownOpen((prev) => !prev);
              setIsNotificationOpen(false);
            }}
            className="flex items-center justify-center transition"
            aria-label="Open admin menu"
            style={{
              width: 36,
              height: 36,
              borderRadius: "999px",
              border: `1px solid ${rgba(...colors.border.split(",").map(Number), 0.16)}`,
              background: rgba(...colors.surface.split(",").map(Number), 0.35),
            }}
          >
            <User className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <AdminDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            admin={admin}
            colors={colors}
          />
        </div>
      </div>
    </nav>
  );
};

export default Header;
