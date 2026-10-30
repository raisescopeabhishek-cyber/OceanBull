import {
  ArrowDownCircle,
  ArrowLeftRight,
  BarChart3,
  CalendarDays,
  CircleFadingPlus,
  Copy,
  LayoutDashboard,
  Newspaper,
  ShieldEllipsis,
  UserCog,
} from "lucide-react";

import NavRail from "@/Components/ui/NavRail";
import { useSidebar } from "@/Components/ui/SidebarContext";

const icon = (Icon: any) => <Icon className="h-[18px] w-[18px]" />;

/**
 * Client portal navigation.
 *
 * The destination set matches what the previous sidebar actually rendered —
 * referral, copy-trading, support and bonus were commented out there, so they
 * stay out here rather than appearing unannounced.
 */
const UserSidebar = () => {
  const { open, closeSidebar } = useSidebar();

  const groups = [
    {
      items: [
        { name: "Dashboard", path: "/user/dashboard", icon: icon(LayoutDashboard) },
        { name: "My Accounts", path: "/user/challenges", icon: icon(ShieldEllipsis) },
      ],
    },
    {
      label: "Funds",
      items: [
        { name: "Fund", path: "/user/deposit", icon: icon(CircleFadingPlus) },
        { name: "Payout", path: "/user/withdraw", icon: icon(ArrowDownCircle) },
        { name: "Transfer", path: "/user/transfer", icon: icon(ArrowLeftRight) },
        { name: "Trades", path: "/user/trade-history", icon: icon(BarChart3) },
      ],
    },
    {
      label: "Trading",
      items: [
        { name: "Copy Trading", path: "/user/copy-trading", icon: icon(Copy) },
        {
          name: "Market",
          icon: icon(CalendarDays),
          children: [
            { name: "Economic Calendar", path: "/user/economic-calendar" },
            { name: "Forex News", path: "/user/forex-news" },
          ],
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          name: "Profile",
          icon: icon(UserCog),
          children: [
            { name: "Profile", path: "/user/profile" },
            { name: "Account Details", path: "/user/account-details" },
            { name: "Change Password", path: "/user/change-password" },
            { name: "Master Password", path: "/user/master-password" },
            { name: "Investor Password", path: "/user/investor-password" },
          ],
        },
      ],
    },
  ];

  return <NavRail groups={groups} open={open} onClose={closeSidebar} />;
};

export default UserSidebar;
