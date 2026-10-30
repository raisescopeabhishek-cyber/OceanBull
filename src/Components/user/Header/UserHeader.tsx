import React, { useEffect, useRef, useState } from "react";
import {
  User,
  Menu,
  Bell,
  X,
  Sun,
  Moon,
  LogOut,
  CheckCircle,
  Wallet,
  ShieldCheck,
  Copy,
  LifeBuoy,
  Gift,
  Users,
  Monitor,
  ScrollText,
  CirclePlus,
  Sparkles,
  BadgeDollarSign,
} from "lucide-react";

import { openNewChallengeModal } from "../../../redux/user/userSlice";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

import { backendApi } from "../../../utils/apiClients";
import { setNotification, setLoggedUser } from "../../../redux/user/userSlice";
import { mt5AccountsStore } from "../../../services/mt5Accounts";
import { useTheme } from "@/theme/ThemeProvider";
import { useSidebar } from "@/Components/ui/SidebarContext";
import { IconButton } from "@/Components/ui/Button";
import { FloatingParticles } from "../../../utils/FloatingParticles";

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

const getIconButtonStyle = (colors) => ({
  width: 36,
  height: 36,
  borderRadius: "999px",
  border: `1px solid ${rgba(...colors.border.split(",").map(Number), 0.16)}`,
  background: rgba(...colors.surface.split(",").map(Number), 0.35),
});

const menuItemStyle = (colors) => ({
  color: rgba(...colors.fg.split(",").map(Number), 0.92),
});

const menuItemHoverStyle = (colors) => ({
  background: rgba(...colors.accent.split(",").map(Number), 0.08),
});

const DropdownIcon = ({ children, colors }) => {
  return (
    <span
      className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-card border"
      style={{
        borderColor: rgba(...colors.border.split(",").map(Number), 0.12),
        background: rgba(...colors.accent.split(",").map(Number), 0.08),
        color: rgba(...colors.accent.split(",").map(Number), 1),
      }}
    >
      {children}
    </span>
  );
};

const NotificationDropdown = ({ isOpen, onClose, userId, colors }) => {
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useSelector((state) => state.user?.notification) || [];

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const { data } = await backendApi.get(`/get-all-notification/${userId}`);
        if (data?.success) dispatch(setNotification(data.data));
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
  }, [userId, location.pathname, dispatch]);

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
      await backendApi.put(`/admin/mark-notification-read/${note._id}`);

      dispatch(
        setNotification(
          notifications.map((n) =>
            n._id === note._id ? { ...n, isRead: true } : n
          )
        )
      );

      if (note?.userLink) {
        navigate(note.userLink);
      } else if (note?.adminLink) {
        navigate(note.adminLink);
      }

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
            className="absolute right-0 top-10 z-50 w-80 overflow-hidden rounded-card border backdrop-blur-xl"
            style={{
              background: `linear-gradient(180deg, ${rgba(
                ...colors.bg.split(",").map(Number),
                0.96
              )}, ${rgba(...colors.surface.split(",").map(Number), 0.94)})`,
              borderColor: rgba(...colors.border.split(",").map(Number), 0.14),
              color: rgba(...colors.fg.split(",").map(Number), 1),
              boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
            }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{
                borderBottomColor: rgba(
                  ...colors.border.split(",").map(Number),
                  0.12
                ),
              }}
            >
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <p className="font-semibold">Notifications</p>
              </div>

              <button onClick={onClose} aria-label="Close notifications">
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
                      className="flex w-full flex-col border-b px-4 py-3 text-left transition-all"
                      style={{
                        borderBottomColor: rgba(
                          ...colors.border.split(",").map(Number),
                          0.08
                        ),
                        background: unread
                          ? rgba(...colors.accent.split(",").map(Number), 0.08)
                          : "transparent",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{note.title}</p>

                        <span
                          className="shrink-0 text-[10px]"
                          style={{
                            color: rgba(
                              ...colors.muted.split(",").map(Number),
                              0.75
                            ),
                          }}
                        >
                          {new Date(note.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <p
                        className="mt-1 text-xs"
                        style={{
                          color: rgba(
                            ...colors.muted.split(",").map(Number),
                            0.9
                          ),
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
                  style={{
                    color: rgba(...colors.muted.split(",").map(Number), 0.9),
                  }}
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

const UserDropdown = ({ isOpen, onClose, user, colors }) => {
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [hoveredItem, setHoveredItem] = useState(null);

  const dropdownItems = [
    {
      key: "profile",
      label: "Profile",
      icon: <User className="h-4 w-4" />,
      action: () => navigate("/user/profile"),
    },
    {
      key: "account",
      label: "Account Details",
      icon: <Wallet className="h-4 w-4" />,
      action: () => navigate("/user/account-details"),
    },
    {
      key: "refer",
      label: "Refer & Earn",
      icon: <Users className="h-4 w-4" />,
      action: () =>
        window.open("/user/referral/dashboard", "_blank", "noopener,noreferrer"),
    },
    {
      key: "bonus",
      label: "Bonus Rewards",
      icon: <Gift className="h-4 w-4" />,
      action: () =>
        window.open("/user/bonus/dashboard", "_blank", "noopener,noreferrer"),
    },
    {
      key: "insurance",
      label: "Insurance",
      icon: <Monitor className="h-4 w-4" />,
      action: () => navigate("/user/insurance-report"),
    },
    {
      key: "rules",
      label: "Rules & Definitions",
      icon: <ScrollText className="h-4 w-4" />,
      action: () => navigate("/user/UserRules"),
    },
    // insurance-report
    {
      key: "support",
      label: "Support Center",
      icon: <LifeBuoy className="h-4 w-4" />,
      action: () => navigate("/user/customer-support"),
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const logoutHandler = async () => {
    mt5AccountsStore.reset();
    dispatch(setLoggedUser(""));
    const loadingToast = toast.loading("Logging out...");

    try {
      const res = await backendApi.post("/auth/logout");

      toast.success(res?.data?.message || "Logged out successfully", {
        id: loadingToast,
      });

      if (res?.data?.redirectTo) {
        window.location.href = res.data.redirectTo;
        return;
      }

      navigate("/auth/login", { replace: true });
    } catch (err) {
      toast.success("Logged out", { id: loadingToast });
      navigate("/auth/login", { replace: true });
    }
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
            className="absolute right-0 top-10 z-50 w-64 overflow-hidden rounded-card border backdrop-blur-xl"
            style={{
              background: `linear-gradient(180deg, ${rgba(
                ...colors.bg.split(",").map(Number),
                0.96
              )}, ${rgba(...colors.surface.split(",").map(Number), 0.94)})`,
              borderColor: rgba(...colors.border.split(",").map(Number), 0.14),
              color: rgba(...colors.fg.split(",").map(Number), 1),
              boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
            }}
          >
            <div
              className="border-b px-4 py-3"
              style={{
                borderBottomColor: rgba(
                  ...colors.border.split(",").map(Number),
                  0.1
                ),
              }}
            >
              <p className="text-sm font-semibold">
                {user?.firstName || "User"}
              </p>
              <p
                className="mt-0.5 truncate text-xs"
                style={{
                  color: rgba(...colors.muted.split(",").map(Number), 0.72),
                }}
              >
                Welcome to your trading workspace
              </p>
            </div>

            <div className="p-2">
              {dropdownItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setHoveredItem(item.key)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="flex w-full items-center rounded-card px-2 py-2 text-sm font-semibold transition-all"
                  style={{
                    ...menuItemStyle(colors),
                    ...(hoveredItem === item.key
                      ? menuItemHoverStyle(colors)
                      : {}),
                  }}
                >
                  <DropdownIcon colors={colors}>{item.icon}</DropdownIcon>
                  {item.label}
                </button>
              ))}

              <div
                className="my-2 h-px"
                style={{
                  background: rgba(...colors.border.split(",").map(Number), 0.1),
                }}
              />

              <button
                onClick={logoutHandler}
                onMouseEnter={() => setHoveredItem("logout")}
                onMouseLeave={() => setHoveredItem(null)}
                className="flex w-full items-center rounded-card px-2 py-2 text-sm font-semibold transition-all"
                style={{
                  color: rgba(...colors.danger.split(",").map(Number), 1),
                  ...(hoveredItem === "logout"
                    ? {
                        background: rgba(
                          ...colors.danger.split(",").map(Number),
                          0.08
                        ),
                      }
                    : {}),
                }}
              >
                <span
                  className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-card border"
                  style={{
                    borderColor: rgba(
                      ...colors.danger.split(",").map(Number),
                      0.18
                    ),
                    background: rgba(...colors.danger.split(",").map(Number), 0.08),
                    color: rgba(...colors.danger.split(",").map(Number), 1),
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </span>
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UserHeader = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const loggedUser = useSelector((store) => store.user?.loggedUser);
  const siteConfig = useSelector((store) => store.user?.siteConfig);
  const notifications = useSelector((store) => store.user?.notification) || [];
  const mode = useSelector((store) => store.userTheme?.mode || "light");

  const dispatch = useDispatch();
  const { toggle: toggleTheme } = useTheme();
  const { open, openSidebar } = useSidebar();
  const navigate = useNavigate();

  const isDark = mode === "dark";
  const colors = getThemeColors(isDark);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const baseHeight = siteConfig?.logoSize || 4;

  const toggleThemeHandler = () => {
    toggleTheme();
  };

  useEffect(() => {
    if (!loggedUser?._id) return;

    const fetchNotifications = async () => {
      try {
        const { data } = await backendApi.get(
          `/get-all-notification/${loggedUser._id}`
        );

        if (data?.success) dispatch(setNotification(data.data));
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, [loggedUser?._id, dispatch]);

  return (
    <nav
      className="sticky top-0 z-50 h-16 w-full border-b backdrop-blur-xl"
      style={{
        color: rgba(...colors.fg.split(",").map(Number), 1),
        background: `linear-gradient(90deg, ${rgba(
          ...colors.bg.split(",").map(Number),
          0.92
        )}, ${rgba(...colors.surface2.split(",").map(Number), 0.78)}, ${rgba(
          ...colors.bg.split(",").map(Number),
          0.92
        )})`,
        borderBottomColor: rgba(...colors.border.split(",").map(Number), 0.14),
      }}
    >
      <FloatingParticles />

      <div className="flex h-full items-center justify-between px-3 md:px-5">
        <div className="relative flex min-w-0 items-center gap-2">
          <IconButton label="Open menu" onClick={openSidebar} aria-expanded={open} className="shrink-0 lg:hidden">
            <Menu className="h-[18px] w-[18px]" />
          </IconButton>
          <div className="min-w-0">
            <Link to="/user/dashboard" className="mr-2">
              {siteConfig?.logo ? (
                <img
                  src={siteConfig.logo}
                  alt={siteConfig.siteName || "Logo"}
                  className="block max-h-12 w-auto max-w-[64px] object-contain min-[375px]:max-w-[100px] md:hidden"
                  style={{ height: `${baseHeight * 0.8}rem` }}
                />
              ) : null}
            </Link>
          </div>
        </div>


        <div className="relative flex shrink-0 items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => dispatch(openNewChallengeModal())}
            className="hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all sm:inline-flex"
            style={{
              borderColor: rgba(...colors.accent.split(",").map(Number), 0.28),
              background: `linear-gradient(135deg, ${rgba(
                ...colors.accent.split(",").map(Number),
                0.16
              )}, ${rgba(...colors.surface.split(",").map(Number), 0.42)})`,
              color: rgba(...colors.accent.split(",").map(Number), 1),
              boxShadow: `0 10px 30px ${rgba(
                ...colors.accent.split(",").map(Number),
                0.12
              )}`,
            }}
          >
            <CirclePlus className="h-4 w-4" />
            New Trading Account
          </button>

          <button
            type="button"
            onClick={() => dispatch(openNewChallengeModal())}
            className="flex items-center justify-center transition sm:hidden"
            aria-label="New Trading Account"
            style={{
              ...getIconButtonStyle(colors),
              color: rgba(...colors.accent.split(",").map(Number), 1),
              background: rgba(...colors.accent.split(",").map(Number), 0.12),
            }}
          >
            <CirclePlus className="h-5 w-5" />
          </button>

          <button
            onClick={toggleThemeHandler}
            className="flex items-center justify-center transition"
            aria-label="Toggle theme"
            style={getIconButtonStyle(colors)}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => {
              setIsNotificationOpen((prev) => !prev);
              setIsDropdownOpen(false);
            }}
            className="relative flex items-center justify-center transition"
            aria-label="Notifications"
            style={getIconButtonStyle(colors)}
          >
            <Bell className="h-5 w-5" />

            {unreadCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px]"
                style={{
                  background: rgba(...colors.danger.split(",").map(Number), 1),
                  color: "#fff",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            userId={loggedUser?._id}
            colors={colors}
          />

          <div className="hidden items-center gap-1.5 sm:flex">
            <CheckCircle
              className="h-4 w-4"
              style={{
                color: rgba(...colors.success.split(",").map(Number), 1),
              }}
            />

            <p className="max-w-[90px] truncate whitespace-nowrap text-sm font-semibold">
              {loggedUser?.firstName || "User"}
            </p>
          </div>

          <button
            onClick={() => {
              setIsDropdownOpen((prev) => !prev);
              setIsNotificationOpen(false);
            }}
            className="flex items-center justify-center transition"
            aria-label="Open user menu"
            style={getIconButtonStyle(colors)}
          >
            <User className="h-4 w-4 md:h-5 md:w-5" />
          </button>

          <UserDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            user={loggedUser}
            colors={colors}
          />
        </div>
      </div>
    </nav>
  );
};

export default UserHeader;
