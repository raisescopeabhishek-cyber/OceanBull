import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Banknote,
  ChartCandlestick,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Palette,
  Settings2,
  ShieldCheck,
  UserCog,
  Wallet,
} from "lucide-react";
import { toast } from "react-toastify";

import NavRail from "@/Components/ui/NavRail";
import { useSidebar } from "@/Components/ui/SidebarContext";
import { backendApi } from "@/utils/apiClients";

const icon = (Icon) => <Icon className="h-[18px] w-[18px]" />;

/** Super-admin navigation — platform configuration. */
const Sidebar = () => {
  const navigate = useNavigate();
  const { open, closeSidebar } = useSidebar();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      const res = await backendApi.post("/auth/s-admin/logout");
      toast.success(res?.data?.message || "Signed out");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Sign out failed");
    } finally {
      setLoggingOut(false);
      // The local session is cleared either way, so always leave the panel.
      navigate("/s-admin/login", { replace: true });
    }
  };

  const groups = [
    {
      label: "Accounts",
      items: [
        { name: "Platform", path: "/s-admin/dashboard", icon: icon(LayoutDashboard) },
        { name: "Groups", path: "/s-admin/Group", icon: icon(Banknote) },
        {
          name: "Account Types",
          path: "/s-admin/configure-account-types",
          icon: icon(CreditCard),
        },
      ],
    },
    {
      label: "Programs",
      items: [
        { name: "Deposit Bonus", path: "/s-admin/DepositBonusConfig", icon: icon(Wallet) },
        { name: "Lot Bonus", path: "/s-admin/TradeLotBonusConfig", icon: icon(ChartCandlestick) },
        { name: "Insurance", path: "/s-admin/InsuranceConfig", icon: icon(ShieldCheck) },
      ],
    },
    {
      label: "Settings",
      items: [
        { name: "Theme", path: "/s-admin/theme-config", icon: icon(Palette) },
        { name: "Site Configuration", path: "/s-admin/site-configuration", icon: icon(Settings2) },
        { name: "Admin Info", path: "/s-admin/admin-information", icon: icon(UserCog) },
      ],
    },
  ];

  const footer = (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-[13.5px] font-medium text-loss transition-colors hover:bg-loss-soft disabled:opacity-50"
    >
      <LogOut className="h-[18px] w-[18px]" />
      {loggingOut ? "Signing out..." : "Sign out"}
    </button>
  );

  return (
    <NavRail
      groups={groups}
      tag="Super admin"
      footer={footer}
      open={open}
      onClose={closeSidebar}
    />
  );
};

export default Sidebar;
