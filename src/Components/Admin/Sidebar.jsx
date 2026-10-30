import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  BadgeCheck,
  CircleDollarSign,
  Copy,
  Gift,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Network,
  ShieldCheck,
  UserRoundCog,
  Users2,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

import NavRail from "@/Components/ui/NavRail";
import { useSidebar } from "@/Components/ui/SidebarContext";
import { backendApi } from "@/utils/apiClients";
import { resetAdmin } from "../../redux/adminSlice";
import { mt5AccountsStore } from "../../services/mt5Accounts";

const icon = (Icon) => <Icon className="h-[18px] w-[18px]" />;

/**
 * Admin navigation.
 *
 * All presentation lives in NavRail; this file is the destination list,
 * grouped the way the prototype groups them, plus the logout call.
 */
const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { open, closeSidebar } = useSidebar();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    mt5AccountsStore.reset();
    setLoggingOut(true);
    const loadingToast = toast.loading("Signing out...");

    try {
      const res = await backendApi.post("/auth/admin/logout");

      dispatch(resetAdmin());
      toast.success(res?.data?.message || "Signed out", { id: loadingToast });

      if (res?.data?.redirectTo) {
        window.location.href = res.data.redirectTo;
        return;
      }
      navigate("/admin/login", { replace: true });
    } catch (err) {
      // The session is gone locally either way, so finish the sign-out.
      dispatch(resetAdmin());
      toast.success("Signed out", { id: loadingToast });
      navigate("/admin/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const groups = [
    {
      items: [
        {
          name: "Dashboard",
          path: "/admin/dashboard",
          icon: icon(LayoutDashboard),
        },
      ],
    },
    {
      label: "Clients",
      items: [
        { name: "Clients", path: "/admin/manage-users", icon: icon(Users2) },
        { name: "KYC Review", path: "/admin/kyc-users", icon: icon(BadgeCheck) },
      ],
    },
    {
      label: "Money",
      items: [
        { name: "Funds", path: "/admin/deposit", icon: icon(Wallet) },
        { name: "Payouts", path: "/admin/withdrawal", icon: icon(HandCoins) },
        { name: "Bonus", path: "/admin/BonusReports", icon: icon(Gift) },
        {
          name: "Insurance",
          path: "/admin/insurance-report",
          icon: icon(ShieldCheck),
        },
      ],
    },
    {
      label: "Partners",
      items: [
        { name: "Copy Trading", path: "/admin/copy-trading", icon: icon(Copy) },
        {
          name: "Referral",
          icon: icon(Network),
          children: [
            { name: "IB Users", path: "/admin/ib-users" },
            { name: "IB Payouts", path: "/admin/ib-withdrawal" },
          ],
        },
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
      tag="Admin"
      footer={footer}
      open={open}
      onClose={closeSidebar}
    />
  );
};

export default Sidebar;
