import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import UserHeader from "@/Components/user/Header/UserHeader";
import UserSidebar from "@/Components/user/UserSidebar";
import UserNewChallenge from "@/Components/user/UserNewChallenge";
import { SidebarProvider } from "@/Components/ui/SidebarContext";
import { useMt5Accounts } from "@/hooks/useMt5Accounts";

/**
 * Client portal shell — 264px sidebar, sticky 64px top bar, content capped
 * at 1440px, per the prototype.
 */
const UserLayout = () => {
  const accounts = useSelector((store) => store.user.loggedUser?.accounts);
  useMt5Accounts(accounts || []);

  return (
    <SidebarProvider>
      <div className="min-h-dvh bg-canvas text-text">
        <UserSidebar />

        <div className="flex min-h-dvh flex-col lg:ml-[264px]">
          <UserHeader />

          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
            <div className="page-enter mx-auto flex w-full max-w-[1440px] flex-col gap-5">
              <Outlet />
            </div>
          </main>

          <footer className="px-4 pb-5 pt-2 sm:px-6 lg:px-8">
            <p className="mx-auto w-full max-w-[1440px] text-xs text-subtle">
              Trading leveraged products carries a high level of risk.
            </p>
          </footer>
        </div>

        <UserNewChallenge />
      </div>
    </SidebarProvider>
  );
};

export default UserLayout;
