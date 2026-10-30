// SuperAdmin_DashboardRouting.jsx
import { Routes, Route } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";

import Platform from "./SideBar_Content/Platform/Platform";
import GroupManagement from "./SideBar_Content/Groups/GroupManagement";
import AccountTypes from "./SideBar_Content/ConfigureAccountType/AccountTypes";
import SadminSiteConfiguration from "./SideBar_Content/SadminSiteConfiguration";
import SadminAdminInfo from "./SideBar_Content/SadminInfo";
import ThemeConfig from "./Theme/ThemeConfig";
// import ServerLogs from "./Logs/ServerLogs.jsx";

const SuperAdmin_DashboardRouting = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface">
      {/* ✅ SUPERADMIN SECURITY WORLD: dotted / tech background */}
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

      {/* ✅ subtle overlay + vignette */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 40%, rgba(255,255,255,0.06), transparent 55%), radial-gradient(100% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* ✅ Sidebar is separate + proper layout */}
      <Sidebar />

      {/* ✅ Content area (shifted right on desktop) */}
      <div className="relative flex flex-col min-h-screen md:ml-72">
        <Header />

        <main className="flex-1 overflow-y-auto text-text p-4 sm:p-6">
          {/* ✅ Framed container (same theme) */}
          <div className="mx-auto w-full max-w-[1400px] rounded-card border border-line overflow-hidden backdrop-blur-sm">
            {/* Title strip */}
            <div className="px-6 py-4 border-b border-line to-transparent">
              <div className="flex items-center justify-between">
                <h1 className="tracking-[0.22em] text-xs sm:text-sm font-semibold text-muted">
                  SUPERADMIN SECURITY WORLD
                </h1>
                <div className="text-[11px] text-subtle hidden sm:block">
                  Protected Area • Authorized Personnel Only
                </div>
              </div>
            </div>

            {/* Routes */}
            <div className="p-4 sm:p-6">
              <Routes>
                {/* ✅ index route for /s-admin */}
                <Route index element={<Platform />} />
                <Route path="dashboard" element={<Platform />} />

                <Route path="Group" element={<GroupManagement />} />
                <Route path="Platform" element={<Platform />} />
                <Route path="configure-account-types" element={<AccountTypes />} />

                <Route path="site-configuration" element={<SadminSiteConfiguration />} />
                <Route path="theme-config" element={<ThemeConfig />} />
                <Route path="admin-information" element={<SadminAdminInfo />} />
                {/* <Route path="server-logs" element={<ServerLogs />} /> */}
              </Routes>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-line text-center text-[11px] text-subtle">
              © {new Date().getFullYear()} • Super Admin Dashboard
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdmin_DashboardRouting;
