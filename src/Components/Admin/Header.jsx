import { useState, useRef, useEffect } from "react";
import { LogOut, Bell, X, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { adminApi } from "../../utils/apiClients";
import { setNotification } from "../../redux/adminSlice";
import ThemeToggle from "@/Components/ui/ThemeToggle";
import { IconButton } from "@/Components/ui/Button";
import { useSidebar } from "@/Components/ui/SidebarContext";
import { mt5AccountsStore } from "../../services/mt5Accounts";

/**
 * The two dropdowns used to be drawn from a `getThemeColors(isDark)` map of
 * raw rgb triples, turned into inline `rgba()` strings at render. That froze
 * their colours at render time and kept a second, divergent palette alive
 * next to the design tokens. They are plain token classes now, so they follow
 * the theme with everything else.
 */

/* Notification Dropdown */
const NotificationDropdown = ({ isOpen, onClose, adminId }) => {
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

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} className="relative">
      <div className="absolute right-0 top-10 z-50 w-80 overflow-hidden rounded-card border border-line bg-surface shadow-raised">
        <div className="flex items-center justify-between border-b border-line bg-surface-2 px-3 py-2">
          <p className="lbl-sm text-text">Notifications</p>
          <IconButton label="Close notifications" onClick={onClose} size="sm">
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        <div className="max-h-72 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((note) => {
              const unread = !note.isRead;

              return (
                <button
                  key={note._id}
                  type="button"
                  onClick={() => handleNotificationClick(note)}
                  className={[
                    "flex w-full flex-col border-b border-line px-3 py-2.5 text-left transition-colors last:border-b-0",
                    unread
                      ? "border-l-2 border-l-primary bg-primary-soft"
                      : "hover:bg-surface-2",
                  ].join(" ")}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-medium text-text">
                      {note.title}
                    </p>
                    <span className="numeric shrink-0 text-[10px] text-subtle">
                      {new Date(note.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{note.message}</p>
                </button>
              );
            })
          ) : (
            <p className="px-3 py-4 text-center text-sm text-subtle">
              No notifications
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* Admin Dropdown */
const AdminDropdown = ({ isOpen, onClose, admin }) => {
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

  const links = [
    ["Logs", "/admin/login-logs"],
    ["Gateway settings", "/admin/getway/manual"],
    ["Referral zone", "/admin/ib-zone"],
    ["Rules", "/admin/RulesManagement"],
  ];

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} className="relative">
      <div className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-card border border-line bg-surface shadow-raised">
        <div className="border-b border-line bg-surface-2 px-3 py-2">
          <p className="truncate text-sm font-semibold text-text">
            {admin?.firstName || "Admin"}
          </p>
          {admin?.email ? (
            <p className="numeric truncate text-[11px] text-subtle">
              {admin.email}
            </p>
          ) : null}
        </div>

        <div className="py-1">
          {links.map(([label, path]) => (
            <button
              key={path}
              type="button"
              onClick={() => {
                navigate(path);
                onClose();
              }}
              className="block w-full px-3 py-2 text-left text-[13px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={logoutHandler}
          className="flex w-full items-center gap-2 border-t border-line px-3 py-2.5 text-[13px] font-semibold text-danger transition-colors hover:bg-danger-soft"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );
};

/**
 * Admin command bar.
 *
 * Replaces the old 64px gradient nav (with animated particles behind it) with
 * a 48px bar carrying the breadcrumb, the site logo and the account controls.
 * The mobile sidebar trigger lives in NavRail now, so the bar leaves room for
 * it at phone width instead of rendering a second, dead toggle.
 */
/**
 * Admin top bar — 64px, glass over the canvas, per the prototype.
 *
 * Carries the section/page trail on the left and the account controls on the
 * right, with the sidebar trigger shown below `lg` where the sidebar becomes
 * a drawer.
 */
const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const admin = useSelector((store) => store.admin?.adminUser);
  const adminSiteConfig = useSelector((store) => store.admin?.siteConfig);
  const userSiteConfig = useSelector((store) => store.user?.siteConfig);
  const notifications = useSelector((store) => store.admin?.notification) || [];

  const navigate = useNavigate();
  const { openSidebar } = useSidebar();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const siteConfig = adminSiteConfig || userSiteConfig || {};

  const name = admin?.name || admin?.email || "Administrator";
  const initials = String(name)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line px-4 sm:px-6 lg:px-8">
      <IconButton
        label="Open menu"
        onClick={openSidebar}
        className="lg:hidden"
      >
        <Menu className="h-[18px] w-[18px]" />
      </IconButton>

      <div className="min-w-0">
        <p className="text-[11.5px] leading-4 text-subtle">Administration</p>
        <h1 className="truncate text-[15px] font-semibold leading-5 tracking-[-0.01em]">
          {siteConfig?.siteName || "Ocean Bull"}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate("/admin/ib-users")}
          className="hidden text-[13px] font-medium text-muted transition-colors hover:text-text sm:block"
        >
          Network
        </button>

        <ThemeToggle />

        <div className="relative">
          <IconButton
            label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
            onClick={() => {
              setIsNotificationOpen((prev) => !prev);
              setIsDropdownOpen(false);
            }}
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 ? (
              <span className="numeric absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-[color:rgb(var(--canvas))]">
                {unreadCount}
              </span>
            ) : null}
          </IconButton>

          <NotificationDropdown
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            adminId={admin?._id}
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsDropdownOpen((prev) => !prev);
              setIsNotificationOpen(false);
            }}
            aria-label="Account menu"
            className="flex h-[38px] items-center gap-2 rounded-field border border-line bg-surface py-0 pl-1 pr-2 transition-colors hover:border-line-strong hover:bg-surface-3"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary-text">
              {initials || "AD"}
            </span>
            <span className="hidden max-w-[120px] truncate text-[13px] font-medium sm:block">
              {name}
            </span>
          </button>

          <AdminDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            admin={admin}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
