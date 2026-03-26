import React, { useMemo, useState } from "react";
import {
  ShieldCheck,
  Lock,
  Loader2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { backendApi } from "../../utils/apiClients";
import sidebarBg from "@/assets/sidebar.png";

const PasswordScreen = () => {
  const mode = useSelector((store) => store.superadminTheme?.mode || "dark");
  const isDark = mode === "dark";

  const [password, setPassword] = useState("");
  const [username] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const canSubmit = useMemo(() => {
    return password.trim().length > 0 && !isLoading;
  }, [password, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await backendApi.post("/auth/s-admin-login", {
        password: password.trim(),
      });

      const data = res.data;

      if (!data?.success) {
        const msg = data?.message || "Invalid password";
        throw new Error(msg);
      }

      toast.success(data?.message || "Authenticated");

      const redirectTo = location.state?.from || "/s-admin/Group";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg = err?.message || "Invalid password";
      toast.error(msg);
      setError(msg);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={[
        "relative min-h-screen overflow-hidden flex items-center justify-center p-4 transition-all duration-300",
        isDark ? "text-white" : "text-slate-900",
      ].join(" ")}
    >
      {/* Base Background */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: isDark
            ? "linear-gradient(180deg, #05070b 0%, #0a0f17 42%, #05070b 100%)"
            : "linear-gradient(180deg, #fffaf7 0%, #fff5ee 48%, #fff0e6 100%)",
        }}
      />

      {/* Light background image */}
      {!isDark && (
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.20]"
          style={{
            backgroundImage: `url(${sidebarBg})`,
          }}
        />
      )}

      {/* Overlay texture */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: isDark
            ? `
              radial-gradient(circle at 20% 20%, rgba(59,130,246,0.14), transparent 25%),
              radial-gradient(circle at 80% 0%, rgba(56,189,248,0.08), transparent 22%),
              radial-gradient(circle at 50% 100%, rgba(255,255,255,0.03), transparent 35%)
            `
            : `
              radial-gradient(circle at 15% 20%, rgba(251,146,60,0.14), transparent 24%),
              radial-gradient(circle at 85% 0%, rgba(255,255,255,0.85), transparent 30%),
              linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25))
            `,
        }}
      />

      {/* Dots texture for dark */}
      {isDark && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
      )}

      {/* Blurred blobs */}
      <div
        aria-hidden
        className={[
          "absolute -top-24 -left-20 h-72 w-72 rounded-full blur-3xl",
          isDark ? "bg-blue-500/10" : "bg-orange-300/20",
        ].join(" ")}
      />
      <div
        aria-hidden
        className={[
          "absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl",
          isDark ? "bg-cyan-400/10" : "bg-amber-200/25",
        ].join(" ")}
      />

      <div className="relative z-[2] w-full max-w-5xl">
        <div
          className={[
            "overflow-hidden rounded-[30px] border backdrop-blur-xl transition-all duration-300",
            isDark
              ? "border-white/10 bg-white/[0.045] shadow-[0_25px_80px_rgba(0,0,0,0.50)]"
              : "border-orange-100/80 bg-white/65 shadow-[0_20px_60px_rgba(251,146,60,0.12)]",
          ].join(" ")}
        >
          {/* top bar */}
          <div
            className={[
              "relative px-6 py-4 border-b",
              isDark
                ? "border-white/10 bg-white/[0.03]"
                : "border-orange-100/80 bg-white/40",
            ].join(" ")}
          >
            <div className="flex items-center justify-center gap-2">
              <KeyRound
                className={isDark ? "text-blue-200/80" : "text-orange-600"}
                size={18}
              />
              <h1
                className={[
                  "tracking-[0.22em] text-xs sm:text-sm font-semibold uppercase",
                  isDark ? "text-white/80" : "text-slate-800",
                ].join(" ")}
              >
                Superadmin Security World
              </h1>
            </div>

            <div
              className={[
                "pointer-events-none absolute inset-x-0 top-0 h-px",
                isDark
                  ? "bg-gradient-to-r from-transparent via-blue-300/30 to-transparent"
                  : "bg-gradient-to-r from-transparent via-orange-300/70 to-transparent",
              ].join(" ")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Side */}
            <div className="p-6 sm:p-8 md:p-10">
              <div className="mb-8">
                <div
                  className={[
                    "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                    isDark
                      ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                      : "border-orange-200 bg-orange-50 text-orange-700",
                  ].join(" ")}
                >
                  <ShieldCheck size={14} />
                  Secure Login
                </div>

                <h2
                  className={[
                    "text-2xl sm:text-3xl font-bold tracking-tight",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  Welcome Back
                </h2>

                <p
                  className={[
                    "mt-2 text-sm",
                    isDark ? "text-white/50" : "text-slate-600",
                  ].join(" ")}
                >
                  Enter your super admin password to continue to the protected
                  dashboard.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    className={[
                      "mb-2 flex items-center gap-2 text-sm font-medium",
                      isDark ? "text-white/75" : "text-slate-700",
                    ].join(" ")}
                  >
                    <Lock size={15} />
                    Password
                  </label>

                  <div className="relative">
                    <div
                      className={[
                        "absolute left-3 top-1/2 -translate-y-1/2",
                        isDark ? "text-white/40" : "text-slate-500",
                      ].join(" ")}
                    >
                      <Lock size={18} />
                    </div>

                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={[
                        "w-full h-12 pl-10 pr-3 rounded-xl border text-sm outline-none transition-all duration-300",
                        isDark
                          ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-blue-400/30 focus:ring-2 focus:ring-blue-500/20"
                          : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200",
                      ].join(" ")}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div
                    className={[
                      "flex items-start gap-2 rounded-xl border px-3 py-3 text-sm",
                      isDark
                        ? "border-red-500/20 bg-red-500/10 text-red-300"
                        : "border-red-200 bg-red-50 text-red-600",
                    ].join(" ")}
                  >
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={[
                    "w-full h-12 rounded-xl font-semibold tracking-wide transition-all duration-300",
                    "disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                    isDark
                      ? "bg-blue-500/90 text-white hover:bg-blue-500 shadow-[0_10px_25px_rgba(59,130,246,0.25)]"
                      : "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_10px_25px_rgba(249,115,22,0.22)]",
                  ].join(" ")}
                >
                  {isLoading && <Loader2 className="animate-spin" size={18} />}
                  {isLoading ? "Authenticating..." : "Login"}
                </button>
              </form>
            </div>

            {/* Right Side */}
            <div
              className={[
                "relative p-6 sm:p-8 md:p-10 border-t md:border-t-0 md:border-l",
                isDark
                  ? "border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent"
                  : "border-orange-100/80 bg-gradient-to-br from-white/40 to-orange-50/40",
              ].join(" ")}
            >
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className={[
                    "absolute -right-24 -bottom-24 h-80 w-80 rounded-full blur-2xl",
                    isDark ? "bg-white/5" : "bg-orange-200/30",
                  ].join(" ")}
                />
                <div
                  className={[
                    "absolute -left-24 -top-24 h-80 w-80 rounded-full blur-2xl",
                    isDark ? "bg-black/25" : "bg-white/60",
                  ].join(" ")}
                />
              </div>

              <div className="relative h-full flex flex-col items-center justify-center text-center">
                <div
                  className={[
                    "w-40 h-40 rounded-full border flex items-center justify-center shadow-inner",
                    isDark
                      ? "border-white/10 bg-black/15"
                      : "border-orange-100 bg-white/80",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "w-28 h-28 rounded-2xl border flex items-center justify-center",
                      isDark
                        ? "border-white/10 bg-white/5"
                        : "border-orange-100 bg-orange-50/60",
                    ].join(" ")}
                  >
                    <ShieldCheck
                      size={54}
                      className={isDark ? "text-white/65" : "text-orange-600"}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div
                    className={[
                      "text-3xl font-extrabold tracking-wide",
                      isDark ? "text-white/85" : "text-slate-900",
                    ].join(" ")}
                  >
                    MASTER
                  </div>

                  <div
                    className={[
                      "text-xs tracking-[0.18em] mt-1 uppercase",
                      isDark ? "text-white/45" : "text-slate-500",
                    ].join(" ")}
                  >
                    Management Simplified
                  </div>

                  <div
                    className={[
                      "mt-5 text-xs leading-relaxed max-w-xs",
                      isDark ? "text-white/35" : "text-slate-500",
                    ].join(" ")}
                  >
                    Protected Area • Super Admin Access Only
                    <br />
                    Use your secure password to continue.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={[
              "px-6 py-3 border-t text-center text-[11px]",
              isDark
                ? "border-white/10 text-white/30"
                : "border-orange-100/80 text-slate-500",
            ].join(" ")}
          >
            © {new Date().getFullYear()} • Authorized Personnel Only
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordScreen;