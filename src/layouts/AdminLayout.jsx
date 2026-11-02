import React, { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShieldCheck, Sparkles, Lock } from "lucide-react";

import Header from "@/Components/Admin/Header";
import Sidebar from "@/Components/Admin/Sidebar";
import sidebarBg from "@/assets/sidebar.png";
import { SidebarToggleProvider } from "@/Components/ui/SidebarToggleContext";

const AdminLayout = () => {
  const mode = useSelector((store) => store.adminTheme?.mode || "light");
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

      <Sidebar />

      <div className="relative z-[2] md:ml-72 min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 px-4 pb-4 pt-2 sm:px-6 sm:pb-6">
          <div className="mx-auto w-full max-w-[1480px]">

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

              <div
                className={[
                  "flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-orange-100/80 bg-white/40",
                ].join(" ")}
              >
                <div>
                  <h2
                    className={[
                      "text-sm font-semibold uppercase tracking-[0.18em]",
                      isDark ? "text-white/85" : "text-slate-800",
                    ].join(" ")}
                  >
                    Admin Workspace
                  </h2>
                  <p
                    className={[
                      "mt-1 text-xs",
                      isDark ? "text-white/40" : "text-slate-500",
                    ].join(" ")}
                  >
                    Manage users, records, logs, and system actions
                  </p>
                </div>

                <div
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] w-fit",
                    isDark
                      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700",
                  ].join(" ")}
                >
                  <span className="h-2 w-2 rounded-full bg-current opacity-90" />
                  Secure Environment
                </div>
              </div>

              <div className="relative p-3 sm:p-4 md:p-5">
                <div
                  className={[
                    "min-h-[calc(100vh-250px)] rounded-[24px] border p-3  transition-all duration-300",
                    isDark
                      ? "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]"
                      : "border-orange-200 bg-white/90",
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
                © {new Date().getFullYear()} • Admin Operations Dashboard
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    </SidebarToggleProvider>
  );
};

export default AdminLayout;