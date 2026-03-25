import React, { useMemo, useState } from "react";
import {
  LogOut,
  User,
  KeyRound,
  Shield,
  SunMedium,
  MoonStar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleSuperadminTheme } from "@/redux/superadminThemeSlice";
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const isSafeImageSrc = (src) => {
  if (typeof src !== "string") return false;
  const s = src.trim();
  if (!s) return false;
  const allowed = /^(https?:|data:image\/|blob:)/i;
  if (!allowed.test(s)) return false;
  if (/^javascript:/i.test(s)) return false;
  return true;
};

const getSafeText = (value, fallback) => {
  if (typeof value !== "string") return fallback;
  const t = value.trim();
  return t ? t : fallback;
};

const DummyLogo = ({ label = "LOGO", heightRem = 4.5, isDark }) => {
  return (
    <div
      className={[
        "w-44 rounded-2xl border flex items-center justify-center gap-2",
        isDark
          ? "border-white/15 bg-gradient-to-b from-white/10 to-black/20 shadow-[0_10px_20px_rgba(0,0,0,0.45)]"
          : "border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-[0_10px_20px_rgba(15,23,42,0.08)]",
      ].join(" ")}
      style={{ height: `${heightRem}rem` }}
      aria-label="Dummy Logo"
    >
      <Shield className={isDark ? "text-white/70" : "text-slate-600"} size={18} />
      <span
        className={[
          "text-[11px] tracking-[0.22em] font-semibold",
          isDark ? "text-white/70" : "text-slate-600",
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  );
};

const Header = () => {
  const adminSiteConfig = useSelector((store) => store.admin?.siteConfig);
  const userSiteConfig = useSelector((store) => store.user?.siteConfig);
  const mode = useSelector((store) => store.superadminTheme?.mode || "dark");
  const isDark = mode === "dark";
  const siteConfig = adminSiteConfig || userSiteConfig || {};

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const safeHeightRem = useMemo(() => {
    const n = Number(siteConfig?.logoSize);
    return Number.isFinite(n) ? clamp(n, 2.5, 10) : 4.5;
  }, [siteConfig?.logoSize]);

  const safeAlt = useMemo(() => {
    return getSafeText(siteConfig?.siteName, "Logo");
  }, [siteConfig?.siteName]);

  const safeLogoSrc = useMemo(() => {
    const raw = siteConfig?.logo;
    return isSafeImageSrc(raw) ? raw.trim() : null;
  }, [siteConfig?.logo]);

  const [logoBroken, setLogoBroken] = useState(false);

  const shouldRenderLogo = Boolean(safeLogoSrc) && !logoBroken;

  return (
    <header className="relative sticky top-0 z-50 w-full overflow-hidden">
      <div
        className={[
          "border-b transition-colors duration-300",
          isDark
            ? "bg-[#0a0d12] border-white/10"
            : "bg-white/80 border-slate-200 backdrop-blur-xl",
        ].join(" ")}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: isDark
              ? `
                radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
                radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)
              `
              : `
                radial-gradient(rgba(15,23,42,0.08) 1px, transparent 1px),
                radial-gradient(rgba(59,130,246,0.06) 1px, transparent 1px)
              `,
            backgroundSize: "12px 12px, 12px 12px",
            backgroundPosition: "0 0, 6px 6px",
            opacity: isDark ? 0.18 : 0.5,
          }}
        />

        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(70% 55% at 50% 35%, rgba(59,130,246,0.09), transparent 55%), radial-gradient(100% 140% at 50% 0%, transparent 55%, rgba(0,0,0,0.45) 100%)"
              : "radial-gradient(70% 55% at 50% 35%, rgba(59,130,246,0.10), transparent 55%), radial-gradient(100% 140% at 50% 0%, transparent 55%, rgba(255,255,255,0.85) 100%)",
          }}
        />

        <div className="relative px-6 py-3">
          <div className="flex items-center justify-between">
            <div
              className={[
                "flex items-center gap-2",
                isDark ? "text-white/75" : "text-slate-700",
              ].join(" ")}
            >
              <KeyRound size={16} className={isDark ? "text-white/65" : "text-slate-500"} />
              <span className="tracking-[0.22em] text-[11px] sm:text-xs font-semibold">
                SUPERADMIN SECURITY WORLD
              </span>
            </div>
            <div
              className={[
                "text-[11px] hidden sm:block",
                isDark ? "text-white/35" : "text-slate-500",
              ].join(" ")}
            >
              Protected Area • Authorized Personnel Only
            </div>
          </div>
        </div>

        <div className="relative py-4 sm:py-5">
          <div className="flex items-center justify-between px-6">
            <div className="w-0 md:w-0" />

            <div className="flex-1 flex items-center justify-center">
              {shouldRenderLogo ? (
                <img
                  src={safeLogoSrc}
                  alt={safeAlt}
                  className="object-contain w-44 drop-shadow-[0_8px_14px_rgba(0,0,0,0.18)]"
                  style={{ height: `${safeHeightRem}rem` }}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  draggable={false}
                  onError={() => setLogoBroken(true)}
                />
              ) : (
                <DummyLogo
                  heightRem={safeHeightRem}
                  label={getSafeText(siteConfig?.siteName, "LOGO")}
                  isDark={isDark}
                />
              )}
            </div>

            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-3">
              <button
                className={[
                  "grid h-10 w-10 place-items-center rounded-xl border transition",
                  isDark
                    ? "border-white/10 bg-white/[0.05] text-white/70 hover:bg-white/[0.09] hover:text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")}
                aria-label="Toggle theme"
                title="Toggle theme"
                onClick={() => dispatch(toggleSuperadminTheme())}
              >
                {isDark ? <SunMedium size={18} /> : <MoonStar size={18} />}
              </button>

              <button
                className={[
                  "grid h-10 w-10 place-items-center rounded-xl border transition",
                  isDark
                    ? "border-white/10 bg-white/[0.05] text-white/70 hover:bg-white/[0.09] hover:text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")}
                aria-label="Profile"
              >
                <User size={18} />
              </button>

              <button
                className={[
                  "grid h-10 w-10 place-items-center rounded-xl border transition",
                  isDark
                    ? "border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15"
                    : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
                ].join(" ")}
                aria-label="Logout"
                onClick={() => navigate("/s-admin/login")}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>

        <div
          className={[
            "h-px",
            isDark
              ? "bg-gradient-to-r from-transparent via-white/10 to-transparent"
              : "bg-gradient-to-r from-transparent via-slate-200 to-transparent",
          ].join(" ")}
        />
      </div>
    </header>
  );
};

export default Header;