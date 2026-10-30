import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { cn } from "../lib/utils";

/**
 * Sidebar navigation — 264px, labelled, grouped, per the prototype.
 *
 * Items may be grouped under a quiet label, carry a count badge, or hold
 * children that expand in place. The active item is marked by a tinted row
 * and a brand bar on the left edge.
 *
 * Below `lg` the sidebar becomes a drawer, opened from the header's menu
 * button via the `onOpen` handler the layout passes down.
 *
 * groups: [{ label?, items: [{ name, path, icon, badge, children, onClick }] }]
 */

const isActive = (pathname, path) =>
  !!path && (pathname === path || pathname.startsWith(path + "/"));

const itemIsActive = (pathname, item) =>
  isActive(pathname, item.path) ||
  (item.children ?? []).some((c) => isActive(pathname, c.path));

const ChevronIcon = ({ className }) => (
  <svg
    className={cn("h-4 w-4 transition-transform duration-200", className)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const rowBase =
  "relative flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-[13.5px] font-medium transition-colors duration-150";

const NavItem = ({ item, pathname, onNavigate }) => {
  const active = itemIsActive(pathname, item);
  const [open, setOpen] = useState(active);

  if (item.children?.length) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            rowBase,
            "text-sidebar-text hover:bg-sidebar-hover hover:text-text",
            active && "text-text"
          )}
        >
          {item.icon ? (
            <span className="shrink-0 text-subtle">{item.icon}</span>
          ) : null}
          <span className="truncate">{item.name}</span>
          <ChevronIcon className={cn("ml-auto", open && "rotate-180")} />
        </button>

        {/* Height animates via a 0fr→1fr grid row, so no fixed max-height. */}
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            <div className="ml-[21px] mt-1 flex flex-col gap-0.5 border-l border-line pl-3">
              {item.children.map((child) => (
                <Link
                  key={child.path}
                  to={child.path}
                  onClick={onNavigate}
                  aria-current={isActive(pathname, child.path) ? "page" : undefined}
                  className={cn(
                    rowBase,
                    "h-8 text-[13px]",
                    isActive(pathname, child.path)
                      ? "bg-sidebar-active text-sidebar-active-text"
                      : "text-sidebar-text hover:bg-sidebar-hover hover:text-text"
                  )}
                >
                  <span className="truncate">{child.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const content = (
    <>
      {item.icon ? (
        <span
          className={cn(
            "shrink-0 transition-colors",
            active ? "text-primary-text" : "text-subtle"
          )}
        >
          {item.icon}
        </span>
      ) : null}
      <span className="truncate">{item.name}</span>
      {item.badge ? (
        <span className="numeric ml-auto rounded-full bg-primary-soft px-1.5 text-[11px] font-semibold text-primary-text">
          {item.badge}
        </span>
      ) : null}
      {active ? (
        <span
          aria-hidden="true"
          className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
        />
      ) : null}
    </>
  );

  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        disabled={item.disabled}
        className={cn(
          rowBase,
          "disabled:opacity-50",
          item.danger
            ? "text-loss hover:bg-loss-soft"
            : "text-sidebar-text hover:bg-sidebar-hover hover:text-text"
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        rowBase,
        active
          ? "bg-sidebar-active text-sidebar-active-text"
          : "text-sidebar-text hover:bg-sidebar-hover hover:text-text"
      )}
    >
      {content}
    </Link>
  );
};

const BrandMark = () => (
  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-primary text-white shadow-[inset_0_1px_0_rgb(255_255_255/.18)]">
    <svg
      className="h-[18px] w-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 15c2.2 0 2.8-2 5-2s2.8 2 5 2 2.8-2 5-2 2.2 1 3 1.4" />
      <path d="M3 10c2.2 0 2.8-2 5-2s2.8 2 5 2 2.8-2 5-2 2.2 1 3 1.4" opacity=".55" />
    </svg>
  </span>
);

/** The sidebar's contents, shared by the fixed rail and the mobile drawer. */
const SidebarBody = ({ groups, tag, footer, onNavigate, onClose }) => {
  const { pathname } = useLocation();

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandMark />
          <span className="truncate text-[15px] font-semibold tracking-[-0.01em]">
            Ocean Bull
          </span>
          {tag ? (
            <span className="rounded-md border border-line bg-surface-2 px-1.5 py-px text-[11px] font-medium text-muted">
              {tag}
            </span>
          ) : null}
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-8 w-8 place-items-center rounded-field text-muted hover:bg-surface-3 hover:text-text"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3 py-4"
        aria-label="Main"
      >
        {groups.map((group, i) => (
          <div key={group.label ?? i}>
            {group.label ? (
              <p className="mb-1.5 px-3 text-[11.5px] font-medium text-subtle">
                {group.label}
              </p>
            ) : null}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {footer ? (
        <div className="shrink-0 border-t border-line p-3">{footer}</div>
      ) : null}
    </>
  );
};

export const NavRail = ({ groups = [], tag, footer, open = false, onClose }) => (
  <>
    {/* Fixed sidebar from lg up. */}
    <aside className="pad-safe-t fixed left-0 top-0 z-40 hidden h-dvh w-[264px] flex-col border-r border-line bg-sidebar lg:flex">
      <SidebarBody groups={groups} tag={tag} footer={footer} />
    </aside>

    {/* Drawer below lg. */}
    <div
      className={cn(
        "fixed inset-0 z-[80] lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-[color:var(--scrim)] backdrop-blur-[2px] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      <aside
        className={cn(
          "pad-safe-t absolute left-0 top-0 flex h-dvh w-[280px] max-w-[86vw] flex-col",
          "border-r border-line bg-sidebar shadow-raised",
          "transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarBody
          groups={groups}
          tag={tag}
          footer={footer}
          onNavigate={onClose}
          onClose={onClose}
        />
      </aside>
    </div>
  </>
);

export default NavRail;
