import React, { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShieldCheck, Sparkles, Lock } from "lucide-react";

import sidebarBg from "@/assets/sidebar.png";
import UserHeader from "@/Components/user/Header/UserHeader";
import UserSidebar from "@/Components/user/UserSidebar";
import UserNewChallenge from "@/Components/user/UserNewChallenge";
import { SidebarToggleProvider } from "@/Components/ui/SidebarToggleContext";

const UserLayout = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [glow, setGlow] = useState({
    x: 0,
    y: 0,
    visible: false,
  });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlow({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });
  };

  const handleMouseLeave = () => {
    setGlow((prev) => ({ ...prev, visible: false }));
  };

  const shellClasses = useMemo(() => {
    return [
      "relative min-h-screen overflow-hidden transition-all duration-300",
      isDark ? "text-white" : "text-slate-900",
    ].join(" ");
  }, [isDark]);

  return (
    <SidebarToggleProvider>
    <div
      className={shellClasses}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background: isDark
            ? "linear-gradient(180deg, #05070b 0%, #0a0f17 42%, #05070b 100%)"
            : "linear-gradient(180deg, #fffaf7 0%, #fff5ee 48%, #fff0e6 100%)",
        }}
      />

      {!isDark && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.20]"
          aria-hidden
          style={{
            backgroundImage: `url(${sidebarBg})`,
          }}
        />
      )}

      <div
        className="absolute inset-0"
        aria-hidden
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

      {isDark && (
        <div
          className="absolute inset-0 opacity-[0.14]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-200"
        style={{
          opacity: glow.visible ? 1 : 0,
          background: isDark
            ? `radial-gradient(320px circle at ${glow.x}px ${glow.y}px, rgba(59,130,246,0.16), rgba(59,130,246,0.08) 24%, transparent 68%)`
            : `radial-gradient(320px circle at ${glow.x}px ${glow.y}px, rgba(251,146,60,0.14), rgba(255,255,255,0.20) 26%, transparent 70%)`,
        }}
      />

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

      <UserSidebar />

      <div className="relative z-[2] min-h-screen md:ml-72 flex flex-col">
        <UserHeader />

        <main className="flex-1 px-4 pb-4 pt-2 sm:px-6 sm:pb-6">
          <div className="mx-auto w-full max-w-[1480px]">
            {/* Top Welcome Section */}
            {/* <div
              className={[
                "mb-6 overflow-hidden rounded-[30px] border backdrop-blur-xl transition-all duration-300",
                isDark
                  ? "border-white/10 bg-white/[0.045] shadow-[0_25px_80px_rgba(0,0,0,0.50)]"
                  : "border-orange-100/80 bg-white/65 shadow-[0_20px_60px_rgba(251,146,60,0.12)]",
              ].join(" ")}
            >
              <div
                className={[
                  "relative px-4 py-5 sm:px-6 sm:py-6",
                  isDark
                    ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]"
                    : "bg-[linear-gradient(135deg,rgba(255,255,255,0.85),rgba(255,247,240,0.80))]",
                ].join(" ")}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div
                      className={[
                        "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                        isDark
                          ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                          : "border-orange-200 bg-orange-50 text-orange-700",
                      ].join(" ")}
                    >
                      <Sparkles size={14} />
                      User Control Center
                    </div>

                    <h1 className="text-2xl font-bold sm:text-3xl">
                      Welcome to User Dashboard
                    </h1>

                    <p
                      className={[
                        "mt-2 max-w-2xl text-sm sm:text-[15px]",
                        isDark ? "text-white/55" : "text-slate-600",
                      ].join(" ")}
                    >
                      Unified user workspace for accounts, deposits, transfers,
                      trades, referrals, support, and platform access.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto">
                    <div
                      className={[
                        "rounded-2xl border px-4 py-3 backdrop-blur-md",
                        isDark
                          ? "border-white/10 bg-white/[0.04]"
                          : "border-orange-100 bg-white/70",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={[
                            "flex h-10 w-10 items-center justify-center rounded-xl",
                            isDark
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-emerald-50 text-emerald-700",
                          ].join(" ")}
                        >
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <p
                            className={[
                              "text-[11px] uppercase tracking-[0.16em]",
                              isDark ? "text-white/40" : "text-slate-500",
                            ].join(" ")}
                          >
                            Status
                          </p>
                          <p className="text-sm font-semibold">Protected</p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={[
                        "rounded-2xl border px-4 py-3 backdrop-blur-md",
                        isDark
                          ? "border-white/10 bg-white/[0.04]"
                          : "border-orange-100 bg-white/70",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={[
                            "flex h-10 w-10 items-center justify-center rounded-xl",
                            isDark
                              ? "bg-blue-500/10 text-blue-300"
                              : "bg-orange-50 text-orange-700",
                          ].join(" ")}
                        >
                          <Lock size={18} />
                        </div>
                        <div>
                          <p
                            className={[
                              "text-[11px] uppercase tracking-[0.16em]",
                              isDark ? "text-white/40" : "text-slate-500",
                            ].join(" ")}
                          >
                            Access
                          </p>
                          <p className="text-sm font-semibold">Authorized</p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={[
                        "rounded-2xl border px-4 py-3 backdrop-blur-md",
                        isDark
                          ? "border-white/10 bg-white/[0.04]"
                          : "border-orange-100 bg-white/70",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={[
                            "flex h-10 w-10 items-center justify-center rounded-xl",
                            isDark
                              ? "bg-cyan-500/10 text-cyan-300"
                              : "bg-amber-50 text-amber-700",
                          ].join(" ")}
                        >
                          <span className="h-2.5 w-2.5 rounded-full bg-current animate-pulse" />
                        </div>
                        <div>
                          <p
                            className={[
                              "text-[11px] uppercase tracking-[0.16em]",
                              isDark ? "text-white/40" : "text-slate-500",
                            ].join(" ")}
                          >
                            Session
                          </p>
                          <p className="text-sm font-semibold">Live</p>
                        </div>
                      </div>
                    </div>
                  </div>
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
            </div> */}

            {/* Main Content Shell */}
            <div
              className={[
                "relative overflow-hidden rounded-[30px] border backdrop-blur-xl transition-all duration-300",
                isDark
                  ? "border-white/10 bg-white/[0.035] shadow-[0_20px_70px_rgba(0,0,0,0.45)]"
                  : "border-orange-100/80 bg-white/60 shadow-[0_16px_50px_rgba(251,146,60,0.10)]",
              ].join(" ")}
            >
              <div
                className={[
                  "h-px",
                  isDark
                    ? "bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    : "bg-gradient-to-r from-transparent via-orange-200 to-transparent",
                ].join(" ")}
              />


              <div className="relative p-3 sm:p-4 md:p-0">
                <div
                  className={[
                    "min-h-[calc(100vh-250px)] rounded-[24px] border p-3 sm:p-0 transition-all duration-300",
                    isDark
                      ? "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]"
                      : "border-orange-100/70 bg-white/45",
                  ].join(" ")}
                >
                  <Outlet />
                </div>
              </div>

              <div
                className={[
                  "border-t px-6 py-3 text-center text-[11px]",
                  isDark
                    ? "border-white/10 text-white/30"
                    : "border-orange-100/80 text-slate-500",
                ].join(" ")}
              >
                © {new Date().getFullYear()} • User Dashboard
              </div>
            </div>
          </div>
        </main>

      </div>
      <UserNewChallenge />
    </div>
    </SidebarToggleProvider>
  );
};

export default UserLayout;