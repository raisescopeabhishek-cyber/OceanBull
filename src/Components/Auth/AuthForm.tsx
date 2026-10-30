import React, { useEffect, useMemo, useState } from "react";
import useLogin from "./useLogin";
import { AnimatedGrid } from "./AnimatedGrid";
import { GlassCard } from "./GlassCard";
import { PasswordInput } from "./PasswordInput";
import { FloatingParticles } from "../../utils/FloatingParticles.js";
import { useSelector } from "react-redux";
import sidebarBg from "@/assets/sidebar.png";

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

  const themeConfig = useSelector((state: any) => state.user?.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const adminMode = useSelector((state: any) => state.adminTheme?.mode || "light");
  const isDark = adminMode === "dark";

  const adminSiteConfig = useSelector((state: any) => state.admin?.siteConfig);
  const userSiteConfig = useSelector((state: any) => state.user?.siteConfig);
  const siteConfig = adminSiteConfig || userSiteConfig || {};
  const baseHeight = siteConfig.logoSize || 4;
  const radius = theme?.radius || "16px";

  const [spotlight, setSpotlight] = useState({
    x: 300,
    y: 180,
    visible: false,
  });

  useEffect(() => {
    const raw = sessionStorage.getItem("AUTO_ADMIN_LOGIN");
    if (!raw) return;

    try {
      const payload = JSON.parse(raw);

      const email = payload?.email;
      const password = payload?.password;
      const ts = payload?.ts;

      const isFresh = typeof ts === "number" && Date.now() - ts < 30_000;

      if (email && password && isFresh) {
        sessionStorage.removeItem("AUTO_ADMIN_LOGIN");
        reset({ email, password, role: "admin" });
        handleSubmit(onSubmit)();
      }
    } catch {
      sessionStorage.removeItem("AUTO_ADMIN_LOGIN");
    }
  }, [handleSubmit, onSubmit, reset]);

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlight({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });
  };

  const handlePointerLeave = () => {
    setSpotlight((prev) => ({ ...prev, visible: false }));
  };

  /* ------------------------------- styles -------------------------------- */

  const pageBgStyle = {
    minHeight: "100vh",
    background: isDark
      ? `linear-gradient(180deg, #0a111f 0%, #0b0f14 35%, #06080b 100%)`
      : `linear-gradient(180deg, #f3f5f9 0%, #fff7f2 45%, #fff1e8 100%)`,
    color: isDark ? "rgb(255,255,255)" : "rgb(15, 24, 41)",
  } as React.CSSProperties;

  const pageOverlayStyle = {
    background: isDark
      ? `radial-gradient(1200px 600px at 18% 0%, ${rgba(
          theme?.glow || theme?.accent || "79 125 246",
          0.14
        )}, transparent 60%),
         radial-gradient(900px 480px at 82% 12%, ${rgba(
           theme?.gradientTo || "23 157 166",
           0.12
         )}, transparent 55%),
         radial-gradient(700px 400px at 50% 100%, rgba(0,0,0,0.45), transparent 70%)`
      : `linear-gradient(180deg, rgba(255,255,255,0.80) 0%, rgba(255,250,246,0.74) 50%, rgba(255,245,238,0.78) 100%)`,
  } as React.CSSProperties;

  const spotlightStyle = {
    opacity: spotlight.visible ? 1 : 0,
    background: isDark
      ? `radial-gradient(260px circle at ${spotlight.x}px ${spotlight.y}px, rgba(79, 125, 246,0.16), rgba(79, 125, 246,0.08) 34%, transparent 70%)`
      : `radial-gradient(260px circle at ${spotlight.x}px ${spotlight.y}px, rgba(255,255,255,0.38), rgba(224, 191, 108,0.08) 38%, transparent 72%)`,
  } as React.CSSProperties;

  const brandTitleStyle = {
    backgroundImage: isDark
      ? `linear-gradient(90deg, ${rgb(
          theme?.gradientFrom || theme?.accent || "79 125 246"
        )}, ${rgb(theme?.gradientTo || "192 132 252")})`
      : `linear-gradient(90deg, rgb(42, 86, 220), rgb(79, 125, 246))`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  } as React.CSSProperties;

  const badge = (kind: "success" | "warning" | "danger") => {
    const map: any = {
      success: theme?.success || theme?.primary || "15 159 110",
      warning: theme?.warning || "163 113 37",
      danger: theme?.danger || "220 58 58",
    };
    const c = map[kind];

    return {
      borderRadius: "999px",
      background: isDark ? rgba(c, 0.12) : rgba(c, 0.08),
      border: `1px solid ${rgba(c, isDark ? 0.26 : 0.18)}`,
      color: rgba(c, 0.92),
      backdropFilter: "blur(10px)",
      boxShadow: isDark
        ? "none"
        : `0 10px 30px ${rgba(c, 0.08)}`,
    } as React.CSSProperties;
  };

  const fieldStyle = {
    borderRadius: radius,
    background: isDark
      ? rgba(theme?.input || theme?.surface2 || "15 24 41", 0.30)
      : "rgba(255,255,255,0.72)",
    border: `1px solid ${
      isDark
        ? rgba(theme?.inputBorder || theme?.border || "255 255 255", 0.18)
        : "rgba(79, 125, 246,0.14)"
    }`,
    color: isDark
      ? rgba(theme?.fg || "255 255 255", 0.92)
      : "rgba(15, 24, 41,0.92)",
    outline: "none",
    backdropFilter: "blur(12px)",
    boxShadow: isDark
      ? "none"
      : "0 12px 30px rgba(79, 125, 246,0.06)",
  } as React.CSSProperties;

  const labelStyle = {
    color: isDark
      ? rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.7)
      : "rgba(71,85,105,0.88)",
    letterSpacing: "0.08em",
  } as React.CSSProperties;

  const primaryBtnStyle = {
    borderRadius: radius,
    border: `1px solid ${
      isDark
        ? rgba(theme?.ring || theme?.accent || "79 125 246", 0.28)
        : "rgba(42, 86, 220,0.22)"
    }`,
    background: isDark
      ? `linear-gradient(90deg, ${rgba(
          theme?.gradientFrom || theme?.accent || "79 125 246",
          0.6
        )}, ${rgba(theme?.gradientTo || "23 157 166", 0.55)})`
      : "linear-gradient(90deg, rgba(42, 86, 220,0.96), rgba(79, 125, 246,0.92))",
    color: isDark ? rgba(theme?.accentFg || "255 255 255", 0.98) : "#fff",
    boxShadow: isDark
      ? `0 18px 60px ${rgba(
          theme?.glow || theme?.accent || "79 125 246",
          0.22
        )}`
      : "0 18px 50px rgba(42, 86, 220,0.22)",
  } as React.CSSProperties;

  const helperTextStyle = {
    color: isDark
      ? rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.55)
      : "rgba(123, 135, 154,0.88)",
  } as React.CSSProperties;

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={pageBgStyle}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      {/* base image for light mode */}
      {!isDark && (
        <div
          aria-hidden
          className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-95"
          style={{ backgroundImage: `url(${sidebarBg})` }}
        />
      )}

      {/* overlays */}
      <div aria-hidden className="absolute inset-0" style={pageOverlayStyle} />

      {isDark && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1px),
              radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "14px 14px, 14px 14px",
            backgroundPosition: "0 0, 7px 7px",
          }}
        />
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-200"
        style={spotlightStyle}
      />

      <AnimatedGrid />
      <FloatingParticles />

      {/* extra ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full blur-3xl"
        style={{
          background: isDark
            ? rgba(theme?.accent || "79 125 246", 0.12)
            : "rgba(79, 125, 246,0.10)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full blur-3xl"
        style={{
          background: isDark
            ? rgba(theme?.gradientTo || "23 157 166", 0.12)
            : "rgba(42, 86, 220,0.10)",
        }}
      />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-8 px-6 py-12 md:grid-cols-2 md:gap-10 lg:py-16">
        {/* Left */}
        <div className="flex flex-col items-center justify-center text-center md:items-start md:text-left">
          <div
            className={[
              "mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.22em] uppercase backdrop-blur-md","border-line bg-surface-2 text-muted",
            ].join(" ")}
          >
            Admin Panel
          </div>

          <div className="relative">
            {siteConfig?.logo ? (
              <img
                src={siteConfig.logo}
                alt={siteConfig?.siteName || "Logo"}
                className="object-contain w-44 md:w-56"
                style={{ height: `${baseHeight}rem` }}
              />
            ) : (
              <h1
                className="text-4xl font-extrabold tracking-tight md:text-5xl"
                style={brandTitleStyle}
              >
                {siteConfig?.siteName || "Admin Portal"}
              </h1>
            )}
          </div>

          <p
            className="mt-5 max-w-xl text-base leading-7"
            style={{ color: isDark ? rgba(theme?.mutedFg || theme?.fg, 0.72) : "rgba(71,85,105,0.92)" }}
          >
            Real-time market data, advanced analytics, and client management —
            in one elegant dashboard.
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

        {/* Right */}
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-md">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-card blur-3xl"
              style={{
                background: isDark
                  ? `radial-gradient(circle, ${rgba(
                      theme?.glow || theme?.accent || "79 125 246",
                      0.18
                    )} 0%, transparent 65%)`
                  : "radial-gradient(circle, rgba(79, 125, 246,0.14) 0%, transparent 65%)",
              }}
            />

            <GlassCard
              className={[
                "relative w-full overflow-hidden rounded-card border p-6 md:p-8 backdrop-blur-xl","border-line bg-surface-2",
              ].join(" ")}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                  background: isDark
                    ? "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))"
                    : "linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,247,240,0.18))",
                }}
              />

              <div className="relative z-10 mb-8 text-center">
                <h2
                  className="text-2xl font-semibold tracking-tight md:text-3xl"
                  style={{
                    color: isDark
                      ? rgba(theme?.fg || "255 255 255", 0.92)
                      : "rgb(15, 24, 41)",
                  }}
                >
                  Admin Login
                </h2>
                <p className="mt-2 text-sm" style={helperTextStyle}>
                  Enter your credentials to continue
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 space-y-5">
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
                    className="w-full px-4 py-3 transition duration-300"
                    style={fieldStyle}
                    {...register("email")}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLInputElement).style.boxShadow = isDark
                        ? `0 0 0 3px ${rgba(
                            theme?.ring || theme?.accent || "79 125 246",
                            0.22
                          )}`
                        : "0 0 0 3px rgba(42, 86, 220,0.14)";
                      (e.currentTarget as HTMLInputElement).style.borderColor = isDark
                        ? rgba(theme?.ring || theme?.accent || "79 125 246", 0.45)
                        : "rgba(42, 86, 220,0.35)";
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLInputElement).style.boxShadow = "none";
                      (e.currentTarget as HTMLInputElement).style.borderColor = isDark
                        ? rgba(
                            theme?.inputBorder || theme?.border || "255 255 255",
                            0.18
                          )
                        : "rgba(79, 125, 246,0.14)";
                    }}
                  />

                  {errors.email && (
                    <p
                      className="text-xs font-medium"
                      style={{
                        color: isDark
                          ? rgba(theme?.danger || "220 58 58", 0.9)
                          : "rgb(220,38,38)",
                      }}
                    >
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

                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    registration={register("password")}
                    error={errors.password?.message as string | undefined}
                    inputClassName="w-full px-4 py-3 transition duration-300"
                    inputStyle={fieldStyle as any}
                    onFocusStyle={{
                      boxShadow: isDark
                        ? `0 0 0 3px ${rgba(
                            theme?.ring || theme?.accent || "79 125 246",
                            0.22
                          )}`
                        : "0 0 0 3px rgba(42, 86, 220,0.14)",
                      borderColor: isDark
                        ? rgba(theme?.ring || theme?.accent || "79 125 246", 0.45)
                        : "rgba(42, 86, 220,0.35)",
                    }}
                    onBlurStyle={{
                      boxShadow: "none",
                      borderColor: isDark
                        ? rgba(
                            theme?.inputBorder || theme?.border || "255 255 255",
                            0.18
                          )
                        : "rgba(79, 125, 246,0.14)",
                    }}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative inline-flex w-full items-center justify-center overflow-hidden px-4 py-3 font-semibold transition duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                  style={primaryBtnStyle}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = isDark
                      ? `0 0 26px ${rgba(
                          theme?.glow || theme?.accent || "79 125 246",
                          0.24
                        )}`
                      : "0 0 26px rgba(42, 86, 220,0.22)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = isDark
                      ? `0 18px 60px ${rgba(
                          theme?.glow || theme?.accent || "79 125 246",
                          0.22
                        )}`
                      : "0 18px 50px rgba(42, 86, 220,0.22)";
                  }}
                >
                  <span className="relative z-10">
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                          style={{
                            borderColor: isDark
                              ? rgba(theme?.accentFg || "255 255 255", 0.55)
                              : "rgba(255,255,255,0.75)",
                          }}
                        />
                        Please wait…
                      </span>
                    ) : (
                      "Login"
                    )}
                  </span>

                  <span
                    className="absolute inset-0 opacity-0 blur-2xl transition group-hover:opacity-100"
                    style={{
                      background: isDark
                        ? `radial-gradient(40% 60% at 50% 50%, ${rgba(
                            theme?.accent || "79 125 246",
                            0.35
                          )}, ${rgba(
                            theme?.gradientTo || "23 157 166",
                            0.15
                          )} 70%, transparent 80%)`
                        : "radial-gradient(40% 60% at 50% 50%, rgba(79, 125, 246,0.30), rgba(42, 86, 220,0.16) 70%, transparent 80%)",
                    }}
                  />
                </button>

                {/* Server error */}
                {errors.root?.message && (
                  <p
                    className="text-center text-sm font-medium"
                    style={{
                      color: isDark
                        ? rgba(theme?.danger || "220 58 58", 0.9)
                        : "rgb(220,38,38)",
                    }}
                  >
                    {errors.root.message as string}
                  </p>
                )}
              </form>

              <div className="relative z-10 mt-8 text-center text-xs" style={helperTextStyle}>
                &copy; {new Date().getFullYear()} Admin Portal. All rights reserved.
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;