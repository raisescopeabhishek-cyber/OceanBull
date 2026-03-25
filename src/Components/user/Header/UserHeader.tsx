import { useState, useEffect, useMemo, type CSSProperties } from "react";
import { User, CheckCircle, Menu, Bell } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import UseUserHook from "../../../hooks/user/UseUserHook";
import { handleToggleSidebar, setNotification } from "../../../redux/user/userSlice";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";
import { FloatingParticles } from "../../../utils/FloatingParticles";
import { backendApi } from "../../../utils/apiClients"; // ✅ you were using backendApi in code

/* -------------------- theme helpers (RGB strings -> css) ------------------- */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) => (Number.isFinite(n) ? n : 0));
  return { r, g, b };
};
const rgb = (v: any) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgb(${r}, ${g}, ${b})`;
};
const rgba = (v: any, a = 1) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const UserHeader = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const dispatch = useDispatch();
  const isSidebarOpen = useSelector((store: any) => store.user.isSidebarOpen);
  const loggedUser = useSelector((store: any) => store.user.loggedUser);
  const siteConfig = useSelector((state: any) => state.user.siteConfig);
  const notifications = useSelector((store: any) => store.user.notification) || [];

  // ✅ dynamic theme
  const themeConfig = useSelector((state: any) => state.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const baseHeight = siteConfig?.logoSize || 4; // in rem
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const sidebarHandler = () => dispatch(handleToggleSidebar(!isSidebarOpen));

  // ------------------------- themed styles -------------------------
  const navStyle: CSSProperties = {
    color: rgba(theme?.fg || "255 255 255", 0.95),
    background: `linear-gradient(90deg,
      ${rgba(theme?.bg || "0 0 0", 0.92)},
      ${rgba(theme?.sidebar || theme?.surface2 || "18 18 18", 0.88)},
      ${rgba(theme?.bg || "0 0 0", 0.92)}
    )`,
    borderBottom: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    backdropFilter: "blur(10px)",
  };

  const iconStyle: CSSProperties = { color: rgba(theme?.fg || "255 255 255", 0.85) };

  const pillBtnBase: CSSProperties = {
    background: "transparent",
    borderRadius: "999px",
    transition: "background 160ms ease",
  };

  const pillHoverBg = rgba(theme?.sidebarHover || theme?.surface2 || "18 18 18", 0.35);

  const badgeStyle: CSSProperties = {
    background: rgba(theme?.danger || "239 68 68", 0.92),
    color: rgb(theme?.dangerFg || "255 255 255"),
  };

  const verifiedStyle: CSSProperties = { color: rgba(theme?.success || "34 197 94", 0.9) };

  // Fetch notifications for logged user
  useEffect(() => {
    if (!loggedUser?._id) return;

    const fetchNotifications = async () => {
      try {
        const { data } = await backendApi.get(`/get-all-notification/${loggedUser._id}`);
        if (data?.success) dispatch(setNotification(data.data));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, [loggedUser?._id, dispatch]);

  return (
    <nav className="sticky top-0 z-50 h-16 w-full" style={navStyle}>
      <FloatingParticles />

      <div className="flex items-center justify-between md:px-5 h-full">
        {/* Left: Sidebar toggle + small logo (mobile) */}
        <div className="flex items-center gap-2 min-w-[80px]">
          <button
            className="sm:hidden p-1.5"
            onClick={sidebarHandler}
            style={pillBtnBase}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = pillHoverBg)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
          >
            <Menu style={iconStyle} />
          </button>

          <a href="/user/dashboard" className="mr-2">
            {siteConfig?.logo && (
              <img
                src={siteConfig.logo}
                alt={siteConfig?.siteName || "Logo"}
                className="block md:hidden object-contain w-auto"
                style={{ height: `${baseHeight * 0.75}rem` }}
              />
            )}
          </a>
        </div>

        {/* Center: Main logo */}
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

        {/* Right Side: Notifications + User */}
        <div className="relative flex items-center gap-3 min-w-[110px] justify-end pr-2 md:pr-0">
          {/* Notifications */}
          <button
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsDropdownOpen(false);
            }}
            className="relative flex items-center justify-center w-8 h-8"
            style={pillBtnBase}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = pillHoverBg)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
          >
            <Bell className="w-5 h-5" style={iconStyle} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 text-[10px] flex items-center justify-center rounded-full"
                style={badgeStyle}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} userId={loggedUser?._id} />

          {/* User */}
          <div className="flex items-center gap-1" style={{ color: rgba(theme?.fg || "255 255 255", 0.85) }}>
            <CheckCircle className="w-4 mt-1" style={verifiedStyle} />
            <p className="md:text-sm text-[10px] font-semibold whitespace-nowrap">
              {loggedUser?.firstName}
            </p>
          </div>

          <button
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              setIsNotificationOpen(false);
            }}
            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10"
            style={pillBtnBase}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = pillHoverBg)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
          >
            <User className="w-4 h-4 md:w-6 md:h-6" style={iconStyle} />
          </button>

          <UserDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} />
        </div>
      </div>
    </nav>
  );
};

export default UserHeader;
