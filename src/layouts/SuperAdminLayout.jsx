import { Outlet } from "react-router-dom";

import Sidebar from "@/Components/SuperAdmin/Sidebar";
import Header from "@/Components/SuperAdmin/Header";
import { SidebarProvider } from "@/Components/ui/SidebarContext";

/** Super-admin shell — platform configuration. */
const SuperAdminLayout = () => (
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
            Theme changes apply to the client portal and admin console once published.
          </p>
        </footer>
      </div>
    </div>
  </SidebarProvider>
);

export default SuperAdminLayout;
