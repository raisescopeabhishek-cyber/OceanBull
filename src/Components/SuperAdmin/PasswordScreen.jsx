// PasswordScreen.jsx
import React, { useMemo, useState } from "react";
import { ShieldCheck, Lock, Loader2, AlertCircle, KeyRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { backendApi } from "../../utils/apiClients";

const PasswordScreen = () => {
  const [password, setPassword] = useState("");
  const [username] = useState(""); // UI only (keep if you want)
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
        // backend sometimes returns 200 with success:false (just in case)
        const msg = data?.message || "Invalid password";
        throw new Error(msg);
      }

      toast.success(data?.message || "Authenticated");

      const redirectTo = location.state?.from || "/s-admin/Group";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg = err?.message || "Invalid password";
      toast.error(msg);  // ✅ backend message toast
      setError(msg);     // ✅ inline error
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#2b2b2b] overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: "#2b2b2b",
          backgroundImage: `
            radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px),
            radial-gradient(rgba(0,0,0,0.22) 1px, transparent 1px)
          `,
          backgroundSize: "12px 12px, 12px 12px",
          backgroundPosition: "0 0, 6px 6px",
          opacity: 0.22,
        }}
      />

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 40%, rgba(255,255,255,0.06), transparent 55%), radial-gradient(100% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="relative w-full max-w-4xl">
        <div className="rounded-2xl border border-black/50 shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden bg-gradient-to-b from-[#3a3a3a] to-[#1f1f1f]">
          <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
            <div className="flex items-center justify-center gap-2">
              <KeyRound className="text-white/70" size={18} />
              <h1 className="tracking-[0.22em] text-xs sm:text-sm font-semibold text-white/75">
                SUPERADMIN SECURITY WORLD
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5 mt-20">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black/55">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full h-12 pl-10 pr-3 rounded-md bg-[#d9d9d9] text-black placeholder:text-black/50 border border-black/20 outline-none focus:ring-2 focus:ring-green-500/50"
                    autoComplete="current-password"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-md border border-red-400/30 bg-red-500/10 text-red-200 px-3 py-2 text-sm">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={[
                    "w-full h-12 rounded-md font-semibold tracking-wide",
                    "bg-gradient-to-b from-green-500 to-green-700",
                    "text-white shadow-[0_10px_22px_rgba(0,0,0,0.35)]",
                    "hover:brightness-110 active:brightness-95 transition",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2",
                  ].join(" ")}
                >
                  {isLoading && <Loader2 className="animate-spin" size={18} />}
                  {isLoading ? "Authenticating..." : "LOGIN"}
                </button>
              </form>
            </div>

            <div className="relative p-6 sm:p-8 border-t md:border-t-0 md:border-l border-white/10 bg-gradient-to-br from-white/5 to-transparent">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-white/5 blur-2xl" />
                <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-black/25 blur-2xl" />
              </div>

              <div className="relative h-full flex flex-col items-center justify-center text-center">
                <div className="w-40 h-40 rounded-full border border-white/10 bg-black/15 flex items-center justify-center shadow-inner">
                  <div className="w-28 h-28 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                    <ShieldCheck size={54} className="text-white/65" />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-3xl font-extrabold tracking-wide text-white/80">MASTER</div>
                  <div className="text-xs tracking-[0.18em] text-white/45 mt-1">Management Simplified</div>

                  <div className="mt-5 text-xs text-white/35 leading-relaxed max-w-xs">
                    Protected Area • Super Admin Access Only
                    <br />
                    Use your secure password to continue.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-3 border-t border-white/10 text-center text-[11px] text-white/30">
            © {new Date().getFullYear()} • Authorized Personnel Only
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordScreen;
