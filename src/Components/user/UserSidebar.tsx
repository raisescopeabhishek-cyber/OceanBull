import { useState, useEffect, useRef, useMemo, type CSSProperties } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2,
  ArrowUpDown,
  ShieldEllipsis,
  ReceiptPoundSterlingIcon,
  HardDriveDownloadIcon,
  CircleFadingPlus,
  ArrowLeftRight,
  ArrowDownCircleIcon,
  SquareStackIcon,
  Menu as MenuIcon,
  X as CloseIcon,
  BadgeCheck,
  ShieldBan,
} from "lucide-react";
import { useSelector } from "react-redux";
import ModernHeading from "../lib/ModernHeading";
import sidebarBg from "@/assets/sidebar.png";

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

const NeonRail = ({ active, style }: { active: boolean; style: CSSProperties }) => (
  <span
    className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r"
    style={active ? style : { background: "transparent" }}
  />
);

const MenuItem = ({
  icon: Icon,
  label,
  link,
  onClick,
  theme,
  isDark,
}: {
  icon: any;
  label: string;
  link: string;
  onClick: () => void;
  theme: any;
  isDark: boolean;
}) => {
  const railStyle: CSSProperties = {
    background: isDark
      ? `linear-gradient(180deg, ${rgba(
          theme?.success || theme?.accent || "34 197 94",
          0.95
        )}, ${rgba(theme?.info || theme?.gradientTo || "59 130 246", 0.9)}, ${rgba(
          theme?.success || theme?.accent || "34 197 94",
          0.95
        )})`
      : "linear-gradient(180deg, rgba(249,115,22,0.95), rgba(251,146,60,0.9), rgba(249,115,22,0.95))",
    boxShadow: isDark
      ? `0 0 18px ${rgba(theme?.success || theme?.accent || "34 197 94", 0.5)}`
      : "0 0 18px rgba(249,115,22,0.35)",
  };

  const activeBg = isDark
    ? rgba(theme?.sidebarActive || theme?.surface2 || "18 18 18", 0.28)
    : "rgba(255,255,255,0.62)";

  const hoverBg = isDark
    ? rgba(theme?.sidebarHover || theme?.surface2 || "18 18 18", 0.22)
    : "rgba(255,255,255,0.45)";

  const activeRing = isDark
    ? `0 0 0 1px ${rgba(theme?.ring || theme?.accent || "59 130 246", 0.25)}`
    : "0 0 0 1px rgba(249,115,22,0.18)";

  const hoverRing = isDark
    ? `0 0 0 1px ${rgba(theme?.ring || theme?.accent || "59 130 246", 0.18)}`
    : "0 0 0 1px rgba(251,146,60,0.14)";

  const iconWrapActive: CSSProperties = isDark
    ? {
        border: `1px solid ${rgba(theme?.ring || theme?.accent || "59 130 246", 0.28)}`,
        background: `linear-gradient(135deg, ${rgba(
          theme?.gradientFrom || theme?.accent || "59 130 246",
          0.16
        )}, ${rgba(theme?.gradientTo || theme?.accent || "147 51 234", 0.12)})`,
      }
    : {
        border: "1px solid rgba(251,146,60,0.18)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,247,240,0.75))",
      };

  const iconWrapInactive: CSSProperties = isDark
    ? {
        border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12)}`,
        background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.18),
      }
    : {
        border: "1px solid rgba(251,146,60,0.12)",
        background: "rgba(255,255,255,0.72)",
      };

  return (
    <NavLink
      to={link}
      onClick={onClick}
      className="relative block rounded-xl px-3 py-2.5"
      style={({ isActive }) => ({
        background: isActive ? activeBg : "transparent",
        boxShadow: isActive ? activeRing : "none",
      })}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        if (!el.getAttribute("data-active")) el.style.background = hoverBg;
        if (!el.getAttribute("data-active")) el.style.boxShadow = hoverRing;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.background = "";
        el.style.boxShadow = "";
      }}
    >
      {({ isActive }) => (
        <motion.div
          layout
          whileHover={{ x: 4 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="flex items-center gap-3"
        >
          <NeonRail active={isActive} style={railStyle} />

          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={isActive ? iconWrapActive : iconWrapInactive}
          >
            <Icon
              size={18}
              style={{
                color: isDark
                  ? rgba(theme?.accent || theme?.gradientFrom || "59 130 246", isActive ? 0.95 : 0.8)
                  : isActive
                    ? "rgba(249,115,22,0.95)"
                    : "rgba(71,85,105,0.85)",
              }}
            />
          </div>

          <span
            className="text-[12px] font-semibold tracking-wide"
            style={{
              color: isDark
                ? isActive
                  ? rgba(theme?.accent || "59 130 246", 0.9)
                  : rgba(theme?.fg || "255 255 255", 0.78)
                : isActive
                  ? "rgba(249,115,22,0.95)"
                  : "rgba(51,65,85,0.88)",
            }}
          >
            {label}
          </span>
        </motion.div>
      )}
    </NavLink>
  );
};

const sidebarVariants = {
  open: {
    width: 260,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
  closed: {
    width: 0,
    opacity: 0,
    transition: { type: "spring", stiffness: 260, damping: 26, when: "afterChildren" },
  },
};

const contentVariants = {
  open: { opacity: 1, x: 0, transition: { delay: 0.05 } },
  closed: { opacity: 0, x: -12 },
};

export default function UserSidebar({ siteConfig }: { siteConfig?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const baseHeight = siteConfig?.logoSize || 4;

  const loggedUser = useSelector((state: any) => state.user.loggedUser);
  const themeConfig = useSelector((state: any) => state.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const mode = useSelector((state: any) => state.userTheme?.mode || "light");
  const isDark = mode === "dark";

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isSmallScreen) setIsOpen(true);
    else setIsOpen(false);
  }, [isSmallScreen]);

  const closeSidebar = () => {
    if (isSmallScreen) setIsOpen(false);
  };

  const toggleSidebar = () => setIsOpen((p) => !p);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isSmallScreen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen && isSmallScreen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isSmallScreen]);

  const menuItems = [
    { icon: BarChart2, label: "Dashboard", link: "/user/dashboard" },
    { icon: ShieldEllipsis, label: "Accounts", link: "/user/challenges" },
    { icon: ArrowUpDown, label: "Transactions", link: "/user/transaction" },
    { icon: BarChart2, label: "Trades", link: "/user/trade-history" },
    { icon: CircleFadingPlus, label: "Deposit", link: "/user/deposit" },
    { icon: ArrowLeftRight, label: "Transfer", link: "/user/transfer" },
    { icon: ArrowDownCircleIcon, label: "Withdraw", link: "/user/withdraw" },
    { icon: SquareStackIcon, label: "IB Zone", link: "/user/referrals" },
    { icon: HardDriveDownloadIcon, label: "Platform", link: "/user/platform" },
    { icon: ReceiptPoundSterlingIcon, label: "Economic Calendar", link: "/user/economic-calendar" },
  ];

  const toggleBtnStyle: CSSProperties = isDark
    ? {
        border: `1px solid ${rgba(theme?.ring || theme?.accent || "59 130 246", 0.22)}`,
        background: `linear-gradient(135deg,
          ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.82)},
          ${rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.78)},
          ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.82)}
        )`,
        color: rgba(theme?.accent || "59 130 246", 0.9),
        boxShadow: `0 0 22px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.22)}`,
      }
    : {
        border: "1px solid rgba(251,146,60,0.16)",
        background: "rgba(255,255,255,0.88)",
        color: "rgba(249,115,22,0.9)",
        boxShadow: "0 10px 30px rgba(251,146,60,0.12)",
        backdropFilter: "blur(12px)",
      };

  const overlayStyle: CSSProperties = {
    background: isDark ? rgba(theme?.shadowColor || "0 0 0", 0.55) : "rgba(15,23,42,0.18)",
    backdropFilter: "blur(6px)",
  };

  const asideStyle: CSSProperties = {
    color: isDark ? rgba(theme?.fg || "255 255 255", 0.92) : "rgb(15,23,42)",
  };

  const bg1: CSSProperties = isDark
    ? {
        background: `linear-gradient(135deg, ${rgb(
          theme?.bg || "0 0 0"
        )}, ${rgb(theme?.surface1 || theme?.bg || "0 0 0")}, ${rgb(
          theme?.bg || "0 0 0"
        )})`,
      }
    : {
        background: "linear-gradient(180deg, #fffaf7 0%, #fff7f2 45%, #fff1e8 100%)",
      };

  const bg2: CSSProperties = isDark
    ? {
        opacity: 0.12,
        background: `radial-gradient(60% 70% at 10% 0%, ${rgba(
          theme?.accent || "59 130 246",
          0.55
        )}, transparent 60%),
                   radial-gradient(60% 70% at 90% 100%, ${rgba(
                     theme?.gradientTo || theme?.accent || "147 51 234",
                     0.45
                   )}, transparent 60%)`,
      }
    : {
        background: `
          radial-gradient(circle at 10% 10%, rgba(251,146,60,0.12), transparent 28%),
          radial-gradient(circle at 100% 100%, rgba(245,158,11,0.08), transparent 32%),
          linear-gradient(180deg, rgba(255,255,255,0.60), rgba(255,247,240,0.38))
        `,
      };

  const ringStyle: CSSProperties = isDark
    ? {
        boxShadow: `inset 0 0 0 1px ${rgba(
          theme?.border || theme?.inputBorder || "255 255 255",
          0.12
        )}`,
      }
    : {
        boxShadow: "inset 0 0 0 1px rgba(251,146,60,0.10)",
      };

  const statusActive: CSSProperties = isDark
    ? {
        color: rgba(theme?.successFg || theme?.fg || "255 255 255", 0.9),
        background: rgba(theme?.success || "34 197 94", 0.12),
        boxShadow: `inset 0 0 0 1px ${rgba(theme?.success || "34 197 94", 0.22)}`,
      }
    : {
        color: "rgb(21,128,61)",
        background: "rgba(34,197,94,0.10)",
        boxShadow: "inset 0 0 0 1px rgba(34,197,94,0.18)",
      };

  const statusInactive: CSSProperties = isDark
    ? {
        color: rgba(theme?.dangerFg || theme?.fg || "255 255 255", 0.9),
        background: rgba(theme?.danger || "244 63 94", 0.12),
        boxShadow: `inset 0 0 0 1px ${rgba(theme?.danger || "244 63 94", 0.22)}`,
      }
    : {
        color: "rgb(185,28,28)",
        background: "rgba(239,68,68,0.10)",
        boxShadow: "inset 0 0 0 1px rgba(239,68,68,0.18)",
      };

  const ctaWrap: CSSProperties = isDark
    ? {
        background: `linear-gradient(90deg, ${rgba(
          theme?.accent || "59 130 246",
          0.16
        )}, ${rgba(theme?.gradientTo || "147 51 234", 0.12)})`,
        boxShadow: `inset 0 0 0 1px ${rgba(
          theme?.ring || theme?.accent || "59 130 246",
          0.18
        )}`,
        backdropFilter: "blur(10px)",
      }
    : {
        background: "linear-gradient(90deg, rgba(255,255,255,0.72), rgba(255,247,240,0.55))",
        boxShadow: "inset 0 0 0 1px rgba(251,146,60,0.12)",
        backdropFilter: "blur(10px)",
      };

  const ctaBtn: CSSProperties = isDark
    ? {
        background: `linear-gradient(90deg,
          ${rgb(theme?.gradientFrom || theme?.accent || "59 130 246")},
          ${rgb(theme?.accent || theme?.primary || "34 197 94")},
          ${rgb(theme?.gradientTo || "147 51 234")}
        )`,
        color: rgb(theme?.primaryFg || "0 0 0"),
        boxShadow: `0 10px 30px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.28)}`,
      }
    : {
        background: "linear-gradient(90deg, rgba(249,115,22,0.96), rgba(251,146,60,0.92))",
        color: "#fff",
        boxShadow: "0 10px 30px rgba(249,115,22,0.20)",
      };

  return (
    <>
      {!isOpen && isSmallScreen && (
        <motion.button
          onClick={toggleSidebar}
          whileTap={{ scale: 0.94 }}
          className="fixed top-4 left-4 z-[60] rounded-xl p-2"
          style={toggleBtnStyle}
        >
          <MenuIcon size={18} />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && isSmallScreen && (
          <motion.div
            className="fixed inset-0 z-40"
            style={overlayStyle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        ref={sidebarRef as any}
        className="fixed left-0 top-0 z-50 h-screen overflow-hidden shadow-2xl w-[290px]"
        style={asideStyle}
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={isSmallScreen ? sidebarVariants : undefined}
      >
        <div className="absolute inset-0" style={bg1} />
        {!isDark && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.18]"
            style={{ backgroundImage: `url(${sidebarBg})` }}
          />
        )}
        <div className="absolute inset-0" style={bg2} />
        <div className="absolute inset-0 rounded-none" style={ringStyle} />

        <motion.div
          className="relative flex h-full flex-col px-3 py-4 backdrop-blur-xl"
          variants={contentVariants}
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <Link
              to="/user/dashboard"
              onClick={closeSidebar}
              className="flex items-center gap-2"
            >
              {siteConfig?.logo ? (
                <img
                  src={siteConfig.logo}
                  alt="Logo"
                  className="object-contain w-auto"
                  style={{ height: `${baseHeight}rem` }}
                />
              ) : (
                <ModernHeading
                  text="User Panel"
                  animate={false}
                  showUnderline={false}
                  className="text-[20px] font-extrabold leading-none whitespace-nowrap tracking-tight"
                  wrapperStyle={{ maxWidth: 9999 }}
                />
              )}
            </Link>

            {isSmallScreen && (
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2"
                style={{
                  color: isDark ? rgba(theme?.fg || "255 255 255", 0.82) : "rgba(71,85,105,0.9)",
                }}
              >
                <CloseIcon size={18} />
              </button>
            )}
          </div>

          <div
            className="mb-4 flex items-center gap-2 self-stretch rounded-xl px-3 py-2 text-xs font-semibold tracking-wide"
            style={loggedUser?.accounts?.length ? statusActive : statusInactive}
          >
            {loggedUser?.accounts?.length ? <BadgeCheck size={14} /> : <ShieldBan size={14} />}
            {loggedUser?.accounts?.length ? "Active" : "Inactive"}
          </div>

          <motion.div
            className="sticky top-0 z-10 mb-3 rounded-xl p-2"
            style={ctaWrap}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              to="/user/new-challenge"
              onClick={closeSidebar}
              className="block w-full rounded-lg py-2 text-center text-sm font-extrabold tracking-wide hover:brightness-110"
              style={ctaBtn}
            >
              Open Account
            </Link>
          </motion.div>

          <div className="user-custom-scrollbar relative flex-1 overflow-y-auto pb-16">
            <AnimatePresence initial={false}>
              {menuItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="mb-1"
                >
                  <MenuItem
                    icon={item.icon}
                    label={item.label}
                    link={item.link}
                    onClick={closeSidebar}
                    theme={theme}
                    isDark={isDark}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div
            className="mt-2 pt-2 text-[10px]"
            style={{
              borderTop: isDark
                ? `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12)}`
                : "1px solid rgba(251,146,60,0.10)",
              color: isDark
                ? rgba(theme?.mutedFg || theme?.fg, 0.55)
                : "rgba(100,116,139,0.82)",
            }}
          >
            <div className="flex items-center justify-between px-1">
              <span>v1.0</span>
              <span className="inline-flex items-center gap-1">
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full"
                  style={{
                    background: isDark
                      ? rgba(theme?.success || "34 197 94", 0.95)
                      : "rgba(34,197,94,0.95)",
                  }}
                />
                Live
              </span>
            </div>
          </div>
        </motion.div>
      </motion.aside>
    </>
  );
}