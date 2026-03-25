import React, { useEffect, useMemo } from "react";
import useLogin from "./useLogin";
import { AnimatedGrid } from "./AnimatedGrid";
import { GlassCard } from "./GlassCard";
import { PasswordInput } from "./PasswordInput";
import { FloatingParticles } from "../../utils/FloatingParticles.js";
import { useSelector } from "react-redux";

/* -------------------- theme helpers (RGB strings -> css) ------------------- */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0")
    .trim()
    .replace(/,/g, " ");
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

const AuthForm: React.FC = () => {
  const { form, onSubmit, loading } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  // Theme from Redux (user.themeConfig)
  const themeConfig = useSelector((state: any) => state.user?.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const radius = theme?.radius || "14px";

  // Get siteConfig (admin first, then user fallback)
  const adminSiteConfig = useSelector((state: any) => state.admin?.siteConfig);
  const userSiteConfig = useSelector((state: any) => state.user?.siteConfig);
  const siteConfig = adminSiteConfig || userSiteConfig || {};
  const baseHeight = siteConfig.logoSize || 4; // rem

  useEffect(() => {
    const raw = sessionStorage.getItem("AUTO_ADMIN_LOGIN");
    if (!raw) return;

    try {
      const payload = JSON.parse(raw);

      const email = payload?.email;
      const password = payload?.password;
      const ts = payload?.ts;

      // ✅ basic validation + TTL (e.g. 30 seconds)
      const isFresh = typeof ts === "number" && Date.now() - ts < 30_000;

      if (email && password && isFresh) {
        // avoid auto-login loops
        sessionStorage.removeItem("AUTO_ADMIN_LOGIN");

        // ✅ fill form
        reset({ email, password, role: "admin" });

        // ✅ auto submit
        handleSubmit(onSubmit)();
      }
    } catch {
      sessionStorage.removeItem("AUTO_ADMIN_LOGIN");
    }
  }, [handleSubmit, onSubmit, reset]);

  /* ------------------------------- styles -------------------------------- */
  const pageBgStyle = {
    minHeight: "100vh",
    background: `radial-gradient(1200px 600px at 18% 0%, ${rgba(
      theme?.glow || theme?.accent,
      0.16
    )}, transparent 60%),
                 radial-gradient(900px 480px at 82% 12%, ${rgba(
                   theme?.gradientTo || theme?.accent,
                   0.12
                 )}, transparent 55%),
                 linear-gradient(135deg, ${rgb(theme?.bg || "0 0 0")}, ${rgb(
      theme?.surface1 || theme?.bg || "0 0 0"
    )}, ${rgb(theme?.bg || "0 0 0")})`,
    color: rgb(theme?.fg || "255 255 255"),
  } as React.CSSProperties;

  const brandTitleStyle = {
    backgroundImage: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "59 130 246")}, ${rgb(
      theme?.gradientTo || "147 51 234"
    )})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  } as React.CSSProperties;

  const badge = (kind: "success" | "warning" | "danger") => {
    const map: any = {
      success: theme?.success || theme?.primary || "34 197 94",
      warning: theme?.warning || "234 179 8",
      danger: theme?.danger || "244 63 94",
    };
    const c = map[kind];
    return {
      borderRadius: "999px",
      background: rgba(c, 0.12),
      border: `1px solid ${rgba(c, 0.26)}`,
      color: rgba(c, 0.92),
      backdropFilter: "blur(10px)",
    } as React.CSSProperties;
  };

  const fieldStyle = {
    borderRadius: radius,
    background: rgba(theme?.input || theme?.surface2 || "18 18 18", 0.28),
    border: `1px solid ${rgba(theme?.inputBorder || theme?.border || "255 255 255", 0.18)}`,
    color: rgba(theme?.fg || "255 255 255", 0.92),
    outline: "none",
    backdropFilter: "blur(10px)",
  } as React.CSSProperties;

  const labelStyle = {
    color: rgba(theme?.mutedFg || theme?.fg, 0.7),
    letterSpacing: "0.08em",
  } as React.CSSProperties;

  const primaryBtnStyle = {
    borderRadius: radius,
    border: `1px solid ${rgba(theme?.ring || theme?.accent || "59 130 246", 0.28)}`,
    background: `linear-gradient(90deg, ${rgba(theme?.gradientFrom || theme?.accent || "59 130 246", 0.6)}, ${rgba(
      theme?.gradientTo || "147 51 234",
      0.55
    )})`,
    color: rgba(theme?.accentFg || "255 255 255", 0.98),
    boxShadow: `0 18px 60px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.22)}`,
  } as React.CSSProperties;

  const helperTextStyle = {
    color: rgba(theme?.mutedFg || theme?.fg, 0.55),
  } as React.CSSProperties;

  return (
    <div className="relative min-h-screen overflow-hidden" style={pageBgStyle}>
      <AnimatedGrid />
      <FloatingParticles />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 py-12 md:grid-cols-2 md:gap-10 lg:py-16">
        {/* Left: Branding */}
        <div className="flex flex-col items-center justify-center text-center md:items-start md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl" style={brandTitleStyle}>
            {siteConfig?.logo ? (
              <img
                src={siteConfig.logo}
                alt={siteConfig?.siteName || "Logo"}
                className="object-contain w-44"
                style={{ height: `${baseHeight}rem` }}
              />
            ) : (
              siteConfig?.siteName || "Admin Portal"
            )}
          </h1>

          <p className="mt-4 max-w-xl text-base" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.7) }}>
            Real-time market data, advanced analytics, and client management — in one elegant dashboard.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 text-xs font-medium" style={badge("success")}>
              Approved
            </span>
            <span className="px-3 py-1 text-xs font-medium" style={badge("warning")}>
              Pending
            </span>
            <span className="px-3 py-1 text-xs font-medium" style={badge("danger")}>
              Rejected
            </span>
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex items-center justify-center">
          <GlassCard className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                Admin Login
              </h2>
              <p className="mt-2 text-sm" style={helperTextStyle}>
                Enter your credentials to continue
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider"
                  style={labelStyle}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  className="w-full px-4 py-3 transition"
                  style={fieldStyle}
                  {...register("email")}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLInputElement).style.boxShadow = `0 0 0 3px ${rgba(
                      theme?.ring || theme?.accent || "59 130 246",
                      0.22
                    )}`;
                    (e.currentTarget as HTMLInputElement).style.borderColor = rgba(
                      theme?.ring || theme?.accent || "59 130 246",
                      0.45
                    );
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLInputElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLInputElement).style.borderColor = rgba(
                      theme?.inputBorder || theme?.border || "255 255 255",
                      0.18
                    );
                  }}
                />
                {errors.email && (
                  <p className="text-xs font-medium" style={{ color: rgba(theme?.danger || "244 63 94", 0.9) }}>
                    {errors.email.message as string}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider"
                  style={labelStyle}
                >
                  Password
                </label>

                {/* PasswordInput should accept className/style passthrough; if it doesn't, update that component too. */}
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  registration={register("password")}
                  error={errors.password?.message as string | undefined}
                  inputClassName="w-full px-4 py-3 transition"
                  inputStyle={fieldStyle as any}
                  onFocusStyle={{
                    boxShadow: `0 0 0 3px ${rgba(theme?.ring || theme?.accent || "59 130 246", 0.22)}`,
                    borderColor: rgba(theme?.ring || theme?.accent || "59 130 246", 0.45),
                  }}
                  onBlurStyle={{
                    boxShadow: "none",
                    borderColor: rgba(theme?.inputBorder || theme?.border || "255 255 255", 0.18),
                  }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative inline-flex w-full items-center justify-center overflow-hidden px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                style={primaryBtnStyle}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 26px ${rgba(
                    theme?.glow || theme?.accent || "59 130 246",
                    0.24
                  )}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 18px 60px ${rgba(
                    theme?.glow || theme?.accent || "59 130 246",
                    0.22
                  )}`;
                }}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                      style={{ borderColor: rgba(theme?.accentFg || "255 255 255", 0.55) }}
                    />
                    Please wait…
                  </span>
                ) : (
                  "Login"
                )}
                <span
                  className="absolute inset-0 -z-10 opacity-0 blur-2xl transition will-change-transform group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(40% 60% at 50% 50%, ${rgba(
                      theme?.accent || "59 130 246",
                      0.35
                    )}, ${rgba(theme?.gradientTo || "147 51 234", 0.15)} 70%, transparent 80%)`,
                  }}
                />
              </button>

              {/* Server error */}
              {errors.root?.message && (
                <p className="text-center text-sm font-medium" style={{ color: rgba(theme?.danger || "244 63 94", 0.9) }}>
                  {errors.root.message as string}
                </p>
              )}
            </form>

            <div className="mt-8 text-center text-xs" style={helperTextStyle}>
              &copy; {new Date().getFullYear()} Admin Portal. All rights reserved.
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
