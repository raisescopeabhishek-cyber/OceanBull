import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Copy,
  LayoutDashboard,
  Link2,
  RadioTower,
  ShieldCheck,
  UserRoundCog,
  Users,
} from "lucide-react";

import { cx } from "../utils/copyTradingHelpers";

const adminGroups = [
  {
    title: "Admin Report",
    links: [
      {
        label: "Overview",
        to: "/admin/copy-trading/dashboard",
        icon: LayoutDashboard,
        end: true,
      },
      {
        label: "Masters CRUD",
        to: "/admin/copy-trading/masters",
        icon: UserRoundCog,
      },
      {
        label: "Copiers CRUD",
        to: "/admin/copy-trading/copiers",
        icon: Users,
      },
      {
        label: "Trade History",
        to: "/admin/copy-trading/trades",
        icon: BarChart3,
      },
    ],
  },
];

const userGroups = [
  {
    title: "Client Overview",
    links: [
      {
        label: "Overview",
        to: "/user/copy-trading/dashboard",
        icon: LayoutDashboard,
        end: true,
      },
      {
        label: "Explore Masters",
        to: "/user/copy-trading/masters",
        icon: UserRoundCog,
      },
    ],
  },
  {
    title: "My Accounts",
    links: [
      {
        label: "My Master",
        to: "/user/copy-trading/my-master-accounts",
        icon: RadioTower,
      },
      {
        label: "My Copier",
        to: "/user/copy-trading/my-copier-accounts",
        icon: Users,
      },
    ],
  },
  {
    title: "Trade Reports",
    links: [
      {
        label: "Trade History",
        to: "/user/copy-trading/trades",
        icon: BarChart3,
      },
      {
        label: "Master Trades",
        to: "/user/copy-trading/master-trades",
        icon: RadioTower,
      },
      {
        label: "Copier Trades",
        to: "/user/copy-trading/copier-trades",
        icon: Users,
      },
    ],
  },
];

const getGroups = (role) => {
  return role === "admin" ? adminGroups : userGroups;
};

const getNavClass = ({ isActive, isDark }) => {
  return cx(
    "group flex items-center gap-3 rounded-card border px-4 py-3 text-sm font-semibold transition-all duration-200",
    isActive
      ? "border-primary/40 bg-primary-soft text-primary-text"
      : "border-line bg-surface-2 text-muted hover:border-primary/40 hover:bg-primary-soft hover:text-primary-text"
  );
};

const GroupTitle = ({ title, isDark }) => {
  return (
    <p
      className={cx(
        "px-2 pb-2 pt-4 text-[11px] font-black uppercase tracking-[0.18em]","text-subtle"
      )}
    >
      {title}
    </p>
  );
};

const CopyTradingMiniSidebar = ({ role = "user", isDark }) => {
  const groups = getGroups(role);


  return (
    <div className="h-fit xl:w-[300px] xl:shrink-0">
      <aside
        className={cx(
          "h-fit overflow-hidden rounded-card border border-line bg-surface p-4 shadow-card",
          "xl:sticky xl:top-4 xl:max-h-[calc(100dvh-6rem)] xl:overflow-y-auto"
        )}
      >

        <div className="relative z-10 flex min-h-full flex-col">
          <div
            className={cx(
              "mb-5 rounded-card border p-4","border-line bg-surface-2"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cx(
                  "flex h-12 w-12 items-center justify-center rounded-card border","border-primary/40 bg-primary-soft text-primary-text"
                )}
              >
                <Copy className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <p
                  className={cx(
                    "truncate text-sm font-black","text-text"
                  )}
                >
                  Copy Trading
                </p>

                <p
                  className={cx(
                    "mt-0.5 text-xs","text-subtle"
                  )}
                >
                  {role === "admin" ? "Admin Panel" : "Client Panel"}
                </p>
              </div>
            </div>

            <div
              className={cx(
                "mt-4 inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]",
                role === "admin"
                  ? "border-primary/40 bg-primary-soft text-primary-text"
                  : "border-line bg-surface-2 text-muted"
              )}
            >
              {role === "admin" ? "Admin Mode" : "User Mode"}
            </div>
          </div>

          <nav className="space-y-3">
            {groups.map((group) => (
              <div key={group.title}>
                <GroupTitle title={group.title} isDark={isDark} />

                <div className="space-y-2">
                  {group.links.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={Boolean(item.end)}
                        className={({ isActive }) =>
                          getNavClass({ isActive, isDark })
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div
            className={cx(
              "mt-5 rounded-card border p-4 text-xs leading-5 xl:mt-auto","border-line bg-surface-2 text-subtle"
            )}
          >
            <div
              className={cx(
                "mb-2 flex items-center gap-2 font-bold","text-success"
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              Risk Notice
            </div>

            {role === "admin"
              ? "Monitor copy trading carefully before changing masters or copier mappings."
              : "Copy trading follows master activity. Profit is not guaranteed."}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CopyTradingMiniSidebar;