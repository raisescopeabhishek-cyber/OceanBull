import { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  LayoutDashboard,
  RadioTower,
  TrendingUp,
  Users,
} from "lucide-react";

import CopyTradingMiniSidebar from "./CopyTradingMiniSidebar";
import { Badge, Button, Card, PageHeader } from "@/Components/ui";

/**
 * Copy-trading module shell, shared by the client and admin trees.
 *
 * The previous header was a green gradient band. Green is the profit colour
 * in this design system, so using it as page chrome competed with the P&L
 * figures inside the module. The header is now the standard one, and the
 * module reads as part of the same product as every other screen.
 */

const PAGES = {
  admin: [
    ["/masters", "Master management", "Create, update and monitor master trading accounts.", "Masters", TrendingUp],
    ["/copiers", "Copier management", "Create, update and monitor copier mappings.", "Copiers", Users],
    ["/trades", "Trade history", "Search master or copier trade history by MT5 account.", "Trades", RadioTower],
  ],
  user: [
    ["/my-master-accounts", "My master accounts", "Your master accounts, their linked copiers and trades.", "My masters", RadioTower],
    ["/my-copier-accounts", "My copier accounts", "The masters you copy, with master and copier trades side by side.", "My copiers", Users],
    ["/master-trades", "Master trades", "Search a master account and review its trade activity.", "Master trades", RadioTower],
    ["/copier-trades", "Copier trades", "Compare a copier's trades against its linked master.", "Copier trades", Users],
    ["/masters", "Explore master traders", "Choose a master trader, after reviewing commission and minimum investment.", "Masters", TrendingUp],
    ["/my-accounts", "My copied accounts", "The master accounts currently linked to your MT5 accounts.", "Copied accounts", Users],
    ["/trades", "Copy trade history", "All, open and closed copy-trading history.", "Trades", RadioTower],
  ],
};

const DEFAULTS = {
  admin: {
    title: "Copy trading overview",
    subtitle: "Masters, copiers, active mappings and reports.",
    active: "Dashboard",
    Icon: LayoutDashboard,
  },
  user: {
    title: "Copy trading",
    subtitle: "Your copy-trading summary, copied accounts and available masters.",
    active: "Dashboard",
    Icon: LayoutDashboard,
  },
};

/**
 * Longest-prefix wins, so `/my-master-accounts` is not swallowed by the
 * shorter `/masters` entry — the previous if-chain depended on its own
 * ordering for that, which is easy to break when a route is added.
 */
const getPageMeta = (pathname, role) => {
  const match = (PAGES[role] ?? PAGES.user).find(([segment]) =>
    pathname.includes(segment)
  );

  if (!match) return DEFAULTS[role] ?? DEFAULTS.user;

  const [, title, subtitle, active, Icon] = match;
  return { title, subtitle, active, Icon };
};

const CopyTradingLayout = ({ role = "user" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const meta = useMemo(
    () => getPageMeta(location.pathname, role),
    [location.pathname, role]
  );

  const backPath = role === "admin" ? "/admin/dashboard" : "/user/dashboard";

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
      <CopyTradingMiniSidebar role={role} isDark={isDark} />

      <div className="flex min-w-0 flex-col gap-4">
        <PageHeader
          breadcrumb={role === "admin" ? "Admin / Copy trading" : "Trading / Copy trading"}
          title={meta.title}
          description={meta.subtitle}
          actions={
            <>
              <Badge tone="primary" dot={false}>
                {meta.active}
              </Badge>
              <Button
                variant="secondary"
                onClick={() => navigate(backPath)}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Back
              </Button>
            </>
          }
        />

        <Card className="min-w-0 p-4 sm:p-5">
          <Outlet context={{ isDark, role }} />
        </Card>
      </div>
    </div>
  );
};

export default CopyTradingLayout;
