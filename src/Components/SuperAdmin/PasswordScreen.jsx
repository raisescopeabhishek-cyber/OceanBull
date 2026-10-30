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
        "relative min-h-screen overflow-hidden flex items-center justify-center p-4 transition-all duration-300","text-text",
      ].join(" ")}
    >
      {/* Base Background */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: isDark
            ? "linear-gradient(180deg, #0a111f 0%, #0f1829 42%, #0a111f 100%)"
            : "linear-gradient(180deg, #f3f5f9 0%, #f7f9fc 48%, #eef2f7 100%)",
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
              radial-gradient(circle at 20% 20%, rgba(79, 125, 246,0.14), transparent 25%),
              radial-gradient(circle at 80% 0%, rgba(79, 125, 246,0.08), transparent 22%),
              radial-gradient(circle at 50% 100%, rgba(255,255,255,0.03), transparent 35%)
            `
            : `
              radial-gradient(circle at 15% 20%, rgba(79, 125, 246,0.14), transparent 24%),
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
          "absolute -top-24 -left-20 h-72 w-72 rounded-full blur-3xl","bg-primary-soft",
        ].join(" ")}
      />
      <div
        aria-hidden
        className={[
          "absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl","bg-primary-soft",
        ].join(" ")}
      />

      <div className="relative z-[2] w-full max-w-5xl">
        <div
          className={[
            "overflow-hidden rounded-card border backdrop-blur-xl transition-all duration-300","border-line bg-surface-2",
          ].join(" ")}
        >
          {/* top bar */}
          <div
            className={[
              "relative px-6 py-4 border-b","border-line bg-surface-2",
            ].join(" ")}
          >
            <div className="flex items-center justify-center gap-2">
              <KeyRound
                className={"text-primary"}
                size={18}
              />
              <h1
                className={[
                  "tracking-[0.22em] text-xs sm:text-sm font-semibold uppercase","text-muted",
                ].join(" ")}
              >
                Superadmin Security World
              </h1>
            </div>

            <div
              className={[
                "pointer-events-none absolute inset-x-0 top-0 h-px",
              ].join(" ")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Side */}
            <div className="p-6 sm:p-8 md:p-10">
              <div className="mb-8">
                <div
                  className={[
                    "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]","border-line bg-primary-soft text-primary",
                  ].join(" ")}
                >
                  <ShieldCheck size={14} />
                  Secure Login
                </div>

                <h2
                  className={[
                    "text-2xl sm:text-3xl font-bold tracking-tight","text-text",
                  ].join(" ")}
                >
                  Welcome Back
                </h2>

                <p
                  className={[
                    "mt-2 text-sm","text-subtle",
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
                      "mb-2 flex items-center gap-2 text-sm font-medium","text-muted",
                    ].join(" ")}
                  >
                    <Lock size={15} />
                    Password
                  </label>

                  <div className="relative">
                    <div
                      className={[
                        "absolute left-3 top-1/2 -translate-y-1/2","text-subtle",
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
                        "w-full h-12 pl-10 pr-3 rounded-card border text-sm outline-none transition-all duration-300","border-line bg-surface-2 text-text placeholder:text-subtle focus:border-line focus:ring-2 focus:ring-primary",
                      ].join(" ")}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div
                    className={[
                      "flex items-start gap-2 rounded-card border px-3 py-3 text-sm","border-danger bg-danger-soft text-danger",
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
                    "w-full h-12 rounded-card font-semibold tracking-wide transition-all duration-300",
                    "disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2","bg-primary-soft text-text hover:bg-primary",
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
                "relative p-6 sm:p-8 md:p-10 border-t md:border-t-0 md:border-l","border-line to-transparent",
              ].join(" ")}
            >
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className={[
                    "absolute -right-24 -bottom-24 h-80 w-80 rounded-full blur-2xl","bg-surface-2",
                  ].join(" ")}
                />
                <div
                  className={[
                    "absolute -left-24 -top-24 h-80 w-80 rounded-full blur-2xl","bg-black/60",
                  ].join(" ")}
                />
              </div>

              <div className="relative h-full flex flex-col items-center justify-center text-center">
                <div
                  className={[
                    "w-40 h-40 rounded-full border flex items-center justify-center shadow-inner","border-line bg-black/60",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "w-28 h-28 rounded-card border flex items-center justify-center","border-line bg-surface-2",
                    ].join(" ")}
                  >
                    <ShieldCheck
                      size={54}
                      className={"text-muted"}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div
                    className={[
                      "text-3xl font-extrabold tracking-wide","text-muted",
                    ].join(" ")}
                  >
                    MASTER
                  </div>

                  <div
                    className={[
                      "text-xs tracking-[0.18em] mt-1 uppercase","text-subtle",
                    ].join(" ")}
                  >
                    Management Simplified
                  </div>

                  <div
                    className={[
                      "mt-5 text-xs leading-relaxed max-w-xs","text-subtle",
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
              "px-6 py-3 border-t text-center text-[11px]","border-line text-subtle",
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