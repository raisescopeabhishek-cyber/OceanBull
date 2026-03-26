import React, { useEffect, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { RiUserSharedFill } from "react-icons/ri";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  Mail,
  UserCog,
} from "lucide-react";
import { useSelector } from "react-redux";
import { superAdminApi } from "@/utils/apiClients";

const SadminAdminInfo = () => {
  const mode = useSelector((store) => store.superadminTheme?.mode || "dark");
  const isDark = mode === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);

  const hideTimerRef = useRef(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await superAdminApi.get(`/admin/user`);
      setAdmin(data?.data);
    } catch (err) {
      console.error("Error fetching admin details:", err);
      setError("Error: Could not fetch admin details");
      toast.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await superAdminApi.post(`/admin/create-n-update`, { email, password });
      await fetchDetails();
      setEmail("");
      setPassword("");
      toast.success("Updated Successfully");
    } catch (err) {
      console.error(err);
      setError("Error: Could not create/update admin");
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleShowCredentials = () => {
    if (showCredentials) {
      clearTimeout(hideTimerRef.current);
      setShowCredentials(false);
    } else {
      setShowCredentials(true);
      hideTimerRef.current = setTimeout(() => {
        setShowCredentials(false);
      }, 30000);
    }
  };

  const adminLoginHandler = async () => {
    if (!admin) {
      toast.error("Admin not fetched yet! Please try again.");
      return;
    }

    try {
      const res = await superAdminApi.post("/handleAuthentication", {
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
      });

      const url = res.data?.redirectTo || res.headers?.location;

      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      console.log(e);
      toast.error("Unable to login as admin");
    }
  };

  useEffect(() => {
    fetchDetails();
    return () => clearTimeout(hideTimerRef.current);
  }, []);

  const inputClass = [
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-300",
    isDark
      ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-blue-400/30 focus:ring-2 focus:ring-blue-500/20"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-200",
  ].join(" ");

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      <Toaster />

      <div className="mb-6">
        <div
          className={[
            "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
            isDark
              ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
              : "border-orange-200 bg-orange-50 text-orange-700",
          ].join(" ")}
        >
          <UserCog size={14} />
          Admin Information
        </div>

        <h2
          className={[
            "text-2xl sm:text-3xl font-bold tracking-tight",
            isDark ? "text-white" : "text-slate-900",
          ].join(" ")}
        >
          Admin Management
        </h2>

        <p
          className={[
            "mt-1 text-sm",
            isDark ? "text-white/50" : "text-slate-600",
          ].join(" ")}
        >
          Create, update, review, and securely access admin credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Left Side - Admin Form */}
        <div
          className={[
            "rounded-[24px] border p-5 sm:p-6 backdrop-blur-xl transition-all duration-300",
            isDark
              ? "border-white/10 bg-white/[0.04] shadow-[0_12px_35px_rgba(0,0,0,0.28)]"
              : "border-orange-100 bg-white/70 shadow-[0_12px_35px_rgba(251,146,60,0.10)]",
          ].join(" ")}
        >
          <div className="mb-5">
            <h3
              className={[
                "text-xl sm:text-2xl font-semibold",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              Update Admin Credentials
            </h3>

            <p
              className={[
                "mt-1 text-sm",
                isDark ? "text-white/45" : "text-slate-500",
              ].join(" ")}
            >
              Manage your admin credentials securely and keep them protected.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className={[
                  "mb-2 flex items-center gap-2 text-sm font-medium",
                  isDark ? "text-white/75" : "text-slate-700",
                ].join(" ")}
              >
                <Mail size={15} />
                Email Address
              </label>

              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className={[
                  "mb-2 flex items-center gap-2 text-sm font-medium",
                  isDark ? "text-white/75" : "text-slate-700",
                ].join(" ")}
              >
                <KeyRound size={15} />
                Password
              </label>

              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div
                className={[
                  "rounded-xl border px-4 py-3 text-sm font-medium",
                  isDark
                    ? "border-red-500/20 bg-red-500/10 text-red-300"
                    : "border-red-200 bg-red-50 text-red-600",
                ].join(" ")}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={[
                "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 disabled:opacity-50",
                isDark
                  ? "bg-blue-500/90 text-white hover:bg-blue-500 shadow-[0_10px_25px_rgba(59,130,246,0.25)]"
                  : "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_10px_25px_rgba(249,115,22,0.22)]",
              ].join(" ")}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {loading ? "Saving..." : "Save Admin Credentials"}
            </button>
          </form>
        </div>

        {/* Right Side - Credentials Display */}
        <div
          className={[
            "rounded-[24px] border p-5 sm:p-6 backdrop-blur-xl transition-all duration-300",
            isDark
              ? "border-white/10 bg-white/[0.04] shadow-[0_12px_35px_rgba(0,0,0,0.28)]"
              : "border-orange-100 bg-white/70 shadow-[0_12px_35px_rgba(251,146,60,0.10)]",
          ].join(" ")}
        >
          <div className="mb-5">
            <h3
              className={[
                "text-xl sm:text-2xl font-semibold",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              Admin Credentials
            </h3>

            <p
              className={[
                "mt-1 text-sm",
                isDark ? "text-white/45" : "text-slate-500",
              ].join(" ")}
            >
              Review stored admin credentials and open admin access securely.
            </p>
          </div>

          {loading && !admin ? (
            <div
              className={[
                "flex items-center justify-center rounded-[18px] border py-10",
                isDark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-slate-200 bg-slate-50",
              ].join(" ")}
            >
              <Loader2
                className={[
                  "h-8 w-8 animate-spin",
                  isDark ? "text-blue-300" : "text-orange-500",
                ].join(" ")}
              />
            </div>
          ) : admin ? (
            <div className="space-y-4">
              <button
                onClick={handleShowCredentials}
                className={[
                  "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                  isDark
                    ? "bg-white/[0.05] text-white hover:bg-white/[0.08] border border-white/10"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200",
                ].join(" ")}
              >
                {showCredentials ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {showCredentials ? "Hide Credentials" : "Show Admin Credentials"}
              </button>

              {showCredentials && (
                <div
                  className={[
                    "rounded-[20px] border p-5 transition-all duration-300",
                    isDark
                      ? "border-white/10 bg-black/20"
                      : "border-slate-200 bg-slate-50/90",
                  ].join(" ")}
                >
                  <h4
                    className={[
                      "mb-4 flex items-center gap-2 text-lg font-semibold",
                      isDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Admin Details
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <p
                        className={[
                          "text-xs uppercase tracking-[0.14em]",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        Email
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm font-medium break-all",
                          isDark ? "text-white/85" : "text-slate-800",
                        ].join(" ")}
                      >
                        {admin.email}
                      </p>
                    </div>

                    <div>
                      <p
                        className={[
                          "text-xs uppercase tracking-[0.14em]",
                          isDark ? "text-white/40" : "text-slate-500",
                        ].join(" ")}
                      >
                        Password
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm font-medium break-all",
                          isDark ? "text-white/85" : "text-slate-800",
                        ].join(" ")}
                      >
                        {admin.password}
                      </p>
                    </div>

                    <p
                      className={[
                        "pt-2 text-xs",
                        isDark ? "text-white/40" : "text-slate-500",
                      ].join(" ")}
                    >
                      Auto-hides in 30 seconds.
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={adminLoginHandler}
                className={[
                  "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                  isDark
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/15"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
                ].join(" ")}
              >
                <RiUserSharedFill size={20} />
                Login as Admin
              </button>
            </div>
          ) : (
            <div
              className={[
                "rounded-[18px] border py-10 text-center text-sm",
                isDark
                  ? "border-white/10 bg-white/[0.03] text-white/55"
                  : "border-slate-200 bg-slate-50 text-slate-500",
              ].join(" ")}
            >
              No credentials found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SadminAdminInfo;