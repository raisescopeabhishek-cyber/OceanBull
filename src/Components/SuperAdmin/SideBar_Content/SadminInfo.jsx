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
    "w-full rounded-card border px-4 py-3 text-sm outline-none transition-all duration-300","border-line bg-surface-2 text-text placeholder:text-subtle focus:border-line focus:ring-2 focus:ring-primary",
  ].join(" ");

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      <Toaster />

      <div className="mb-6">
        <div
          className={[
            "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]","border-line bg-primary-soft text-primary",
          ].join(" ")}
        >
          <UserCog size={14} />
          Admin Information
        </div>

        <h2
          className={[
            "text-2xl sm:text-3xl font-bold tracking-tight","text-text",
          ].join(" ")}
        >
          Admin Management
        </h2>

        <p
          className={[
            "mt-1 text-sm","text-subtle",
          ].join(" ")}
        >
          Create, update, review, and securely access admin credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Left Side - Admin Form */}
        <div
          className={[
            "rounded-card border p-5 sm:p-6 backdrop-blur-xl transition-all duration-300","border-line bg-surface-2",
          ].join(" ")}
        >
          <div className="mb-5">
            <h3
              className={[
                "text-xl sm:text-2xl font-semibold","text-text",
              ].join(" ")}
            >
              Update Admin Credentials
            </h3>

            <p
              className={[
                "mt-1 text-sm","text-subtle",
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
                  "mb-2 flex items-center gap-2 text-sm font-medium","text-muted",
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
                  "mb-2 flex items-center gap-2 text-sm font-medium","text-muted",
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
                  "rounded-card border px-4 py-3 text-sm font-medium","border-danger bg-danger-soft text-danger",
                ].join(" ")}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={[
                "inline-flex w-full items-center justify-center gap-2 rounded-card px-4 py-3 text-sm font-semibold transition-all duration-300 disabled:opacity-50","bg-primary-soft text-text hover:bg-primary",
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
            "rounded-card border p-5 sm:p-6 backdrop-blur-xl transition-all duration-300","border-line bg-surface-2",
          ].join(" ")}
        >
          <div className="mb-5">
            <h3
              className={[
                "text-xl sm:text-2xl font-semibold","text-text",
              ].join(" ")}
            >
              Admin Credentials
            </h3>

            <p
              className={[
                "mt-1 text-sm","text-subtle",
              ].join(" ")}
            >
              Review stored admin credentials and open admin access securely.
            </p>
          </div>

          {loading && !admin ? (
            <div
              className={[
                "flex items-center justify-center rounded-card border py-10","border-line bg-surface-2",
              ].join(" ")}
            >
              <Loader2
                className={[
                  "h-8 w-8 animate-spin","text-primary",
                ].join(" ")}
              />
            </div>
          ) : admin ? (
            <div className="space-y-4">
              <button
                onClick={handleShowCredentials}
                className={[
                  "inline-flex w-full items-center justify-center gap-2 rounded-card px-4 py-3 text-sm font-semibold transition-all duration-300","bg-surface-2 text-text hover:bg-surface-2 border border-line",
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
                    "rounded-card border p-5 transition-all duration-300","border-line bg-black/60",
                  ].join(" ")}
                >
                  <h4
                    className={[
                      "mb-4 flex items-center gap-2 text-lg font-semibold","text-text",
                    ].join(" ")}
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Admin Details
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <p
                        className={[
                          "text-xs uppercase tracking-[0.14em]","text-subtle",
                        ].join(" ")}
                      >
                        Email
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm font-medium break-all","text-muted",
                        ].join(" ")}
                      >
                        {admin.email}
                      </p>
                    </div>

                    <div>
                      <p
                        className={[
                          "text-xs uppercase tracking-[0.14em]","text-subtle",
                        ].join(" ")}
                      >
                        Password
                      </p>
                      <p
                        className={[
                          "mt-1 text-sm font-medium break-all","text-muted",
                        ].join(" ")}
                      >
                        {admin.password}
                      </p>
                    </div>

                    <p
                      className={[
                        "pt-2 text-xs","text-subtle",
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
                  "inline-flex w-full items-center justify-center gap-2 rounded-card px-4 py-3 text-sm font-semibold transition-all duration-300","bg-success-soft text-success border border-success hover:bg-success-soft",
                ].join(" ")}
              >
                <RiUserSharedFill size={20} />
                Login as Admin
              </button>
            </div>
          ) : (
            <div
              className={[
                "rounded-card border py-10 text-center text-sm","border-line bg-surface-2 text-subtle",
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