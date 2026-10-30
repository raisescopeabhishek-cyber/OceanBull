import { Outlet } from "react-router-dom";

import Header from "@/Components/Admin/Header";
import Sidebar from "@/Components/Admin/Sidebar";
import { SidebarProvider } from "@/Components/ui/SidebarContext";

/**
 * Admin console shell — 264px sidebar, sticky 64px top bar, content capped
 * at 1440px, per the prototype.
 */
const AdminLayout = () => (
  <SidebarProvider>
    <div className="min-h-dvh bg-canvas text-text">
      <Sidebar />

      <div className="flex min-h-dvh flex-col lg:ml-[264px]">
        <Header />

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="page-enter mx-auto flex w-full max-w-[1440px] flex-col gap-5">
            <Outlet />
          </div>
        </main>

        <footer className="px-4 pb-5 pt-2 sm:px-6 lg:px-8">
          <p className="mx-auto w-full max-w-[1440px] text-xs text-subtle">
            Every approval and rejection is written to the audit log.
          </p>
        </footer>
      </div>
    </div>
  </SidebarProvider>
);

export default AdminLayout;
