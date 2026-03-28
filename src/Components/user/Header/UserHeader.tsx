import { useState, useEffect, useMemo, type CSSProperties } from "react";
import { User, CheckCircle, Menu, Bell, Sun, Moon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { handleToggleSidebar, setNotification } from "../../../redux/user/userSlice";
import { toggleUserTheme } from "../../../redux/userThemeSlice";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";
import { FloatingParticles } from "../../../utils/FloatingParticles";
import { backendApi } from "../../../utils/apiClients";

/* -------------------- theme helpers ------------------- */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) =>
    Number.isFinite(n) ? n : 0
  );
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
  const isSidebarOpen = useSelector((store: any) => store.user?.isSidebarOpen);
  const loggedUser = useSelector((store: any) => store.user?.loggedUser);
  const siteConfig = useSelector((state: any) => state.user?.siteConfig);
  const notifications = useSelector((store: any) => store.user?.notification) || [];

  const themeConfig = useSelector((state: any) => state.user?.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const mode = useSelector((state: any) => state.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const baseHeight = siteConfig?.logoSize || 4;
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const sidebarHandler = () => dispatch(handleToggleSidebar(!isSidebarOpen));
  const themeToggleHandler = () => dispatch(toggleUserTheme());

  const navStyle: CSSProperties = isDark
    ? {
        color: rgba(theme?.fg || "255 255 255", 0.95),
        background: `linear-gradient(90deg,
          ${rgba(theme?.bg || "0 0 0", 0.94)},
          ${rgba(theme?.sidebar || theme?.surface2 || "18 18 18", 0.90)},
          ${rgba(theme?.bg || "0 0 0", 0.94)}
        )`,
        borderBottom: `1px solid ${rgba(
          theme?.border || theme?.inputBorder || "255 255 255",
          0.14
        )}`,
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
      }
    : {
        color: "rgba(15,23,42,0.95)",
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.92), rgba(255,247,240,0.88), rgba(255,255,255,0.92))",
        borderBottom: "1px solid rgba(251,146,60,0.12)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 24px rgba(251,146,60,0.06)",
      };

  const iconStyle: CSSProperties = {
    color: isDark
      ? rgba(theme?.fg || "255 255 255", 0.85)
      : "rgba(71,85,105,0.92)",
  };

  const controlBtnStyle: CSSProperties = {
    borderRadius: "999px",
    transition: "all 160ms ease",
    border: isDark
      ? `1px solid ${rgba(theme?.border || "255 255 255", 0.1)}`
      : "1px solid rgba(251,146,60,0.10)",
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.68)",
    backdropFilter: "blur(8px)",
  };

  const controlHoverBg = isDark
    ? rgba(theme?.sidebarHover || theme?.surface2 || "18 18 18", 0.42)
    : "rgba(255,255,255,0.92)";

  const badgeStyle: CSSProperties = isDark
    ? {
        background: rgba(theme?.danger || "239 68 68", 0.92),
        color: rgb(theme?.dangerFg || "255 255 255"),
        boxShadow: `0 0 12px ${rgba(theme?.danger || "239 68 68", 0.35)}`,
      }
    : {
        background: "rgba(239,68,68,0.95)",
        color: "#fff",
        boxShadow: "0 0 12px rgba(239,68,68,0.18)",
      };

  const verifiedStyle: CSSProperties = {
    color: isDark
      ? rgba(theme?.success || "34 197 94", 0.9)
      : "rgb(22,163,74)",
  };

  const themeToggleStyle: CSSProperties = isDark
    ? {
        border: `1px solid ${rgba(
          theme?.ring || theme?.accent || "59 130 246",
          0.28
        )}`,
        background: `linear-gradient(135deg,
          ${rgba(theme?.surface2 || theme?.sidebar || "18 18 18", 0.65)},
          ${rgba(theme?.accent || "59 130 246", 0.12)}
        )`,
        color: rgba(theme?.accent || theme?.fg || "255 255 255", 0.95),
        boxShadow: `0 8px 24px ${rgba(
          theme?.glow || theme?.accent || "59 130 246",
          0.18
        )}`,
        backdropFilter: "blur(10px)",
      }
    : {
        border: "1px solid rgba(251,146,60,0.18)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,247,240,0.88))",
        color: "rgba(249,115,22,0.95)",
        boxShadow: "0 8px 24px rgba(251,146,60,0.12)",
        backdropFilter: "blur(10px)",
      };

  useEffect(() => {
    if (!loggedUser?._id) return;

    const fetchNotifications = async () => {
      try {
        const { data } = await backendApi.get(
          `/get-all-notification/${loggedUser._id}`
        );
        if (data?.success) {
          dispatch(setNotification(data.data));
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, [loggedUser?._id, dispatch]);

  return (
    <nav className="sticky top-0 z-50 h-16 w-full" style={navStyle}>
      <FloatingParticles />

      <div className="flex h-full items-center justify-between px-2 sm:px-3 md:px-5">
        <div className="flex min-w-[72px] items-center gap-2 sm:min-w-[90px]">
          <button
            type="button"
            className="sm:hidden flex h-9 w-9 items-center justify-center"
            onClick={sidebarHandler}
            style={controlBtnStyle}
            aria-label="Open sidebar"
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                controlHoverBg)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                controlBtnStyle.background as string)
            }
          >
            <Menu className="w-5 h-5" style={iconStyle} />
          </button>

          <a href="/user/dashboard" className="mr-1">
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

        <div className="flex flex-1 items-center justify-center px-2">
          {siteConfig?.logo ? (
            <img
              src={siteConfig.logo}
              alt={siteConfig?.siteName || "Logo"}
              className="object-contain max-w-[160px] sm:max-w-[190px] md:max-w-[220px]"
              style={{ height: `${baseHeight}rem` }}
            />
          ) : (
            <h2
              className="text-sm sm:text-base md:text-lg font-semibold tracking-wide"
              style={{
                color: isDark
                  ? rgba(theme?.fg || "255 255 255", 0.92)
                  : "rgba(30,41,59,0.95)",
              }}
            >
              User Panel
            </h2>
          )}
        </div>

        <div className="relative flex min-w-[150px] items-center justify-end gap-2 md:gap-3 pr-1 md:pr-0">
          <button
            type="button"
            onClick={themeToggleHandler}
            className="relative flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full"
            style={themeToggleStyle}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-1px) scale(1.02)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(0) scale(1)";
            }}
          >
            {isDark ? (
              <Sun className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <Moon className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsNotificationOpen((prev) => !prev);
              setIsDropdownOpen(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full"
            style={controlBtnStyle}
            aria-label="Open notifications"
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                controlHoverBg)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                controlBtnStyle.background as string)
            }
          >
            <Bell className="w-4 h-4 md:w-5 md:h-5" style={iconStyle} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[16px] h-4 px-[3px] text-[10px] flex items-center justify-center rounded-full"
                style={badgeStyle}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            userId={loggedUser?._id}
          />

          <div
            className="hidden sm:flex items-center gap-1.5"
            style={{
              color: isDark
                ? rgba(theme?.fg || "255 255 255", 0.85)
                : "rgba(51,65,85,0.92)",
            }}
          >
            <CheckCircle className="w-4 h-4" style={verifiedStyle} />
            <p className="text-sm font-semibold whitespace-nowrap max-w-[90px] truncate">
              {loggedUser?.firstName || "User"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsDropdownOpen((prev) => !prev);
              setIsNotificationOpen(false);
            }}
            className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full"
            style={controlBtnStyle}
            aria-label="Open user menu"
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                controlHoverBg)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                controlBtnStyle.background as string)
            }
          >
            <User className="w-4 h-4 md:w-5 md:h-5" style={iconStyle} />
          </button>

          <UserDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
          />
        </div>
      </div>
    </nav>
  );
};

export default UserHeader;