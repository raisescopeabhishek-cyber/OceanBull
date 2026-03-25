// Header.jsx
import React, { useMemo, useState } from "react";
import { LogOut, User, KeyRound, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const isSafeImageSrc = (src) => {
  if (typeof src !== "string") return false;
  const s = src.trim();
  if (!s) return false;

  // Allow safe schemes only (edit if you want to restrict more)
  const allowed = /^(https?:|data:image\/|blob:)/i;
  if (!allowed.test(s)) return false;

  // Extra guard
  if (/^javascript:/i.test(s)) return false;

  return true;
};

const getSafeText = (value, fallback) => {
  if (typeof value !== "string") return fallback;
  const t = value.trim();
  return t ? t : fallback;
};

const DummyLogo = ({ label = "LOGO", heightRem = 4.5 }) => {
  return (
    <div
      className="w-44 rounded-xl border border-white/15 bg-gradient-to-b from-white/10 to-black/20 shadow-[0_10px_20px_rgba(0,0,0,0.45)] flex items-center justify-center gap-2"
      style={{ height: `${heightRem}rem` }}
      aria-label="Dummy Logo"
    >
      <Shield className="text-white/70" size={18} />
      <span className="text-[11px] tracking-[0.22em] font-semibold text-white/70">
        {label}
      </span>
    </div>
  );
};

const Header = () => {
  const adminSiteConfig = useSelector((store) => store.admin.siteConfig);
  const userSiteConfig = useSelector((store) => store.user.siteConfig);
  const siteConfig = adminSiteConfig || userSiteConfig || {};

  const navigate = useNavigate();

  const safeHeightRem = useMemo(() => {
    const n = Number(siteConfig?.logoSize);
    // UI-safe limits; adjust if you want
    return Number.isFinite(n) ? clamp(n, 2.5, 10) : 4.5;
  }, [siteConfig?.logoSize]);

  const safeAlt = useMemo(() => {
    return getSafeText(siteConfig?.siteName, "Logo");
  }, [siteConfig?.siteName]);

  const safeLogoSrc = useMemo(() => {
    const raw = siteConfig?.logo;
    return isSafeImageSrc(raw) ? raw.trim() : null;
  }, [siteConfig?.logo]);

  // If image fails to load, show dummy
  const [logoBroken, setLogoBroken] = useState(false);

  const shouldRenderLogo = Boolean(safeLogoSrc) && !logoBroken;

  return (
    <header className="relative sticky top-0 z-50 w-full overflow-hidden">
      <div className="bg-black border-b border-white/10">
        {/* dotted strip */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px),
              radial-gradient(rgba(0,0,0,0.18) 1px, transparent 1px)
            `,
            backgroundSize: "12px 12px, 12px 12px",
            backgroundPosition: "0 0, 6px 6px",
            opacity: 0.16,
          }}
        />

        {/* vignette */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(70% 55% at 50% 35%, rgba(255,255,255,0.05), transparent 55%), radial-gradient(100% 140% at 50% 0%, transparent 55%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* top mini bar */}
        <div className="relative px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/75">
              <KeyRound size={16} className="text-white/65" />
              <span className="tracking-[0.22em] text-[11px] sm:text-xs font-semibold">
                SUPERADMIN SECURITY WORLD
              </span>
            </div>
            <div className="text-[11px] text-white/35 hidden sm:block">
              Protected Area • Authorized Personnel Only
            </div>
          </div>
        </div>

        {/* main row */}
        <div className="relative py-4 sm:py-5">
          <div className="flex items-center justify-between px-6">
            {/* Left spacer (sidebar occupies left on desktop) */}
            <div className="w-0 md:w-0" />

            {/* Center Logo / Dummy */}
            <div className="flex-1 flex items-center justify-center">
              {shouldRenderLogo ? (
                <img
                  src={safeLogoSrc}
                  alt={safeAlt}
                  className="object-contain w-44 drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)]"
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
                />
              )}
            </div>

            {/* Right Actions */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 sm:gap-4">
              <button
                className="text-white/70 hover:text-white transition"
                aria-label="Profile"
              >
                <User size={20} />
              </button>
              <button
                className="text-white/70 hover:text-white transition"
                aria-label="Logout"
                onClick={() => navigate("/s-admin/login")}
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </header>
  );
};

export default Header;
