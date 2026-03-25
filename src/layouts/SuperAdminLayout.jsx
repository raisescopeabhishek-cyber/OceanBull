import Sidebar from "@/Components/SuperAdmin/Sidebar";
import Header from "@/Components/SuperAdmin/Header";
import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const SuperAdminLayout = () => {
  const mode = useSelector((store) => store.superadminTheme?.mode || "dark");
  const isDark = mode === "dark";

  return (
    <div
      className={[
        "min-h-screen transition-colors duration-300",
        isDark
          ? "bg-[#06070a] text-white"
          : "bg-[#f4f7fb] text-slate-900",
      ].join(" ")}
    >
      <Sidebar />

      <div className="md:ml-72 min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 p-4 sm:p-6">
          <div
            className={[
              "mx-auto w-full max-w-[1400px] rounded-[24px] overflow-hidden border transition-all duration-300",
              isDark
                ? "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] shadow-[0_25px_70px_rgba(0,0,0,0.45)]"
                : "border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]",
            ].join(" ")}
          >
            <div
              className={[
                "px-6 py-4 border-b transition-colors duration-300",
                isDark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-slate-200 bg-slate-50/80",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1
                    className={[
                      "tracking-[0.20em] text-xs sm:text-sm font-semibold",
                      isDark ? "text-white/85" : "text-slate-800",
                    ].join(" ")}
                  >
                    SUPERADMIN SECURITY WORLD
                  </h1>
                  <p
                    className={[
                      "mt-1 text-[11px]",
                      isDark ? "text-white/40" : "text-slate-500",
                    ].join(" ")}
                  >
                    Protected Area • Authorized Personnel Only
                  </p>
                </div>

                <div
                  className={[
                    "hidden sm:flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                    isDark
                      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700",
                  ].join(" ")}
                >
                  <span className="h-2 w-2 rounded-full bg-current opacity-80" />
                  Secure Access
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <Outlet />
            </div>

            <div
              className={[
                "px-6 py-3 border-t text-center text-[11px] transition-colors duration-300",
                isDark
                  ? "border-white/10 text-white/30"
                  : "border-slate-200 text-slate-500",
              ].join(" ")}
            >
              © {new Date().getFullYear()} • Super Admin Dashboard
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;