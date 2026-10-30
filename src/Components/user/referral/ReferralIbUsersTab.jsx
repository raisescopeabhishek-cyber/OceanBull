import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Info,
  Layers3,
  RefreshCw,
  Search,
  Users,
  Wallet,
} from "lucide-react";

import {
  buttonSecondary,
  EmptyState,
  inputBase,
  panelCard,
  StatCard,
  cx,
  muted,
  titleText,
} from "./components/ReferralPrimitives";
import { formatMoney } from "./hooks/useReferralPanel";

const ITEMS_PER_PAGE = 10;

const safeNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const format4 = (value) => safeNumber(value).toFixed(4);

const getSafeEmailKey = (email) => email || "unknown";

const buildAccountPairs = (rows = []) => {
  return rows
    .filter((row) => row?.accountNumber)
    .map((row) => {
      const account = String(row.accountNumber || "").trim();
      const level = row?.level === undefined || row?.level === null ? "" : String(row.level);
      return `${account}:${level}`;
    })
    .join(",");
};

const buildCloseTradePath = (email, rows = []) => {
  const accountPairs = buildAccountPairs(rows);
  const safeId = encodeURIComponent(email || rows?.[0]?.accountNumber || "unknown");

  if (!accountPairs) {
    return `/user/referral/ib-users/${safeId}/close-trades`;
  }

  return `/user/referral/ib-users/${safeId}/close-trades?accounts=${encodeURIComponent(
    accountPairs
  )}`;
};

const buildSingleAccountCloseTradePath = (row) => {
  const emailOrAccount = encodeURIComponent(row?.email || row?.accountNumber || "unknown");
  const accountPairs = buildAccountPairs([row]);
  const level = row?.level === undefined || row?.level === null ? "" : String(row.level);

  return `/user/referral/ib-users/${row?.accountNumber}/close-trades`;
};

const ReferralIbUsersTab = () => {
  const {
    isDark,
    hasReferralAccount,
    commissionsData,
    loadingCommissions,
    fetchCommissions,
    generateReferralAccount,
    generatingAccount,
  } = useOutletContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUsers, setExpandedUsers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const groupedUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const source = Array.isArray(commissionsData) ? commissionsData : [];

    const filtered = source.filter((item) => {
      if (!q) return true;

      return (
        String(item?.email || "").toLowerCase().includes(q) ||
        String(item?.name || "").toLowerCase().includes(q) ||
        String(item?.country || "").toLowerCase().includes(q) ||
        String(item?.accountNumber || "").toLowerCase().includes(q) ||
        String(item?.level || "").toLowerCase().includes(q)
      );
    });

    const map = filtered.reduce((acc, item) => {
      const key = getSafeEmailKey(item?.email);

      if (!acc[key]) {
        acc[key] = {
          email: key,
          name: item?.name || "-",
          country: item?.country || "Unknown",
          rows: [],
          totalLot: 0,
          totalCommission: 0,
          accountCount: 0,
          levels: new Set(),
          countries: new Set(),
          activeRows: 0,
        };
      }

      acc[key].rows.push(item);
      acc[key].totalLot += safeNumber(item?.totalLot);
      acc[key].totalCommission += safeNumber(item?.totalCommission);
      acc[key].levels.add(item?.level ?? "-");
      acc[key].countries.add(item?.country || "Unknown");

      if (safeNumber(item?.totalLot) > 0 || safeNumber(item?.totalCommission) > 0) {
        acc[key].activeRows += 1;
      }

      return acc;
    }, {});

    return Object.values(map).map((group) => {
      const uniqueAccounts = new Set(
        group.rows
          .map((row) => String(row?.accountNumber || "").trim())
          .filter(Boolean)
      );

      return {
        ...group,
        accountCount: uniqueAccounts.size,
        levelsText: Array.from(group.levels).join(", "),
        countriesText: Array.from(group.countries).join(", "),
        rows: group.rows.sort((a, b) =>
          String(a?.accountNumber || "").localeCompare(String(b?.accountNumber || ""))
        ),
      };
    });
  }, [commissionsData, searchTerm]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return groupedUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [groupedUsers, currentPage]);

  const totalPages = Math.max(1, Math.ceil(groupedUsers.length / ITEMS_PER_PAGE));

  const stats = useMemo(() => {
    const rows = Array.isArray(commissionsData) ? commissionsData : [];
    const uniqueEmails = new Set(rows.map((item) => item?.email || "unknown")).size;
    const uniqueAccounts = new Set(
      rows.map((item) => String(item?.accountNumber || "").trim()).filter(Boolean)
    ).size;

    const totalCommission = rows.reduce(
      (sum, item) => sum + safeNumber(item?.totalCommission),
      0
    );

    const totalVolume = rows.reduce((sum, item) => sum + safeNumber(item?.totalLot), 0);

    const activeAccounts = rows.filter(
      (item) => safeNumber(item?.totalCommission) > 0 || safeNumber(item?.totalLot) > 0
    ).length;

    const countryDistribution = rows.reduce((acc, item) => {
      const key = item?.country || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const topCountry =
      Object.entries(countryDistribution).sort((a, b) => b[1] - a[1])[0] || [
        "Unknown",
        0,
      ];

    return {
      totalRows: rows.length,
      uniqueEmails,
      uniqueAccounts,
      totalCommission,
      totalVolume,
      activeAccounts,
      topCountry,
      activeRate: rows.length ? (activeAccounts / rows.length) * 100 : 0,
    };
  }, [commissionsData]);

  const toggleExpand = (email) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [email]: !prev[email],
    }));
  };

  const expandAll = () => {
    const next = {};
    paginatedUsers.forEach((group) => {
      next[group.email] = true;
    });
    setExpandedUsers((prev) => ({ ...prev, ...next }));
  };

  const collapseAll = () => {
    const next = {};
    paginatedUsers.forEach((group) => {
      next[group.email] = false;
    });
    setExpandedUsers((prev) => ({ ...prev, ...next }));
  };

  if (!hasReferralAccount) {
    return (
      <EmptyState
        isDark={isDark}
        title="IB users panel is empty"
        text="Generate your referral account first. After that, your downstream IB user rows will appear here."
        actionLabel="Generate Referral Account"
        onAction={generateReferralAccount}
        loading={generatingAccount}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section
        className={cx(
          "relative overflow-hidden rounded-card border p-5 sm:p-6","border-line bg-surface"
        )}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary-soft blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-8 h-52 w-52 rounded-full bg-primary-soft blur-3xl" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div
              className={cx(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]","border-line bg-primary-soft text-primary"
              )}
            >
              <Users className="h-3.5 w-3.5" />
              IB Network
            </div>

            <h2 className={cx("mt-3 text-2xl font-black sm:text-3xl", titleText(isDark))}>
              IB users
            </h2>

            <p className={cx("mt-2 max-w-2xl text-sm leading-6", muted(isDark))}>
              Users are grouped by email. Expand a user to view all their trading
              accounts, levels, lots, and commission. Open the trade ledger from the
              parent row to see all accounts together.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative">
              <Search
                size={16}
                className={cx(
                  "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2","text-subtle"
                )}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user, email, country, account..."
                className={inputBase(isDark, "min-w-[290px] pl-10")}
              />
            </div>

            <button type="button" onClick={fetchCommissions} className={buttonSecondary(isDark)}>
              <RefreshCw size={16} className={loadingCommissions ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          isDark={isDark}
          icon={Users}
          title="Users"
          value={stats.uniqueEmails}
          subtitle={`${stats.totalRows} total account rows`}
          tone="sky"
        />

        <StatCard
          isDark={isDark}
          icon={Wallet}
          title="Accounts"
          value={stats.uniqueAccounts}
          subtitle="Unique MT5 accounts"
          tone="violet"
        />

        <StatCard
          isDark={isDark}
          icon={BadgeDollarSign}
          title="Commission"
          value={formatMoney(stats.totalCommission, 4)}
          subtitle="Total IB earning"
          tone="emerald"
        />

        <StatCard
          isDark={isDark}
          icon={BarChart3}
          title="Volume"
          value={format4(stats.totalVolume)}
          subtitle="Combined lot size"
          tone="amber"
        />

        <StatCard
          isDark={isDark}
          icon={Info}
          title="Active Rate"
          value={`${safeNumber(stats.activeRate).toFixed(0)}%`}
          subtitle={`${stats.activeAccounts} active rows`}
          tone="sky"
        />
      </div>

      <section className={panelCard(isDark, "overflow-hidden")}>
        <div
          className={cx(
            "flex flex-col gap-3 border-b p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between","border-line"
          )}
        >
          <div>
            <h3 className={cx("text-lg font-black", titleText(isDark))}>
              Grouped IB user accounts
            </h3>
            <p className={cx("mt-1 text-sm", muted(isDark))}>
              Click a user row to expand all accounts. Use the arrow action to open close trades.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={expandAll} className={buttonSecondary(isDark)}>
              Expand all
            </button>
            <button type="button" onClick={collapseAll} className={buttonSecondary(isDark)}>
              Collapse all
            </button>
          </div>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-[1120px] w-full table-stack">
            <thead>
              <tr
                className={cx(
                  "border-b text-left text-xs uppercase tracking-[0.16em]","border-line bg-surface-2 text-subtle"
                )}
              >
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Country</th>
                <th className="px-5 py-4">Accounts</th>
                <th className="px-5 py-4">Levels</th>
                <th className="px-5 py-4 text-right">Volume</th>
                <th className="px-5 py-4 text-right">Earned</th>
                <th className="px-5 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className={cx("divide-y","divide-line")}>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className={cx("px-5 py-14 text-center text-sm", muted(isDark))}>
                    No IB user rows found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((group) => {
                  const expanded = !!expandedUsers[group.email];
                  const canExpand = group.rows.length > 0;

                  return (
                    <Fragment key={group.email}>
                      <tr
                        onClick={() => canExpand && toggleExpand(group.email)}
                        className={cx(
                          "cursor-pointer transition-all","hover:bg-surface-2"
                        )}
                      >
                        <td data-label="User" className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cx(
                                "grid h-9 w-9 place-items-center rounded-card border","border-line bg-surface-2 text-primary"
                              )}
                            >
                              {expanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                            </div>

                            <div>
                              <p className={cx("font-black", titleText(isDark))}>
                                {group.name || "-"}
                              </p>
                              <p className={cx("mt-1 text-xs", muted(isDark))}>
                                {group.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td data-label="Country" className={cx("px-5 py-4 text-sm", muted(isDark))}>
                          {group.countriesText || "-"}
                        </td>

                        <td data-label="Accounts" className={cx("px-5 py-4 text-sm", titleText(isDark))}>
                          <span
                            className={cx(
                              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold","border-line bg-primary-soft text-primary"
                            )}
                          >
                            <Layers3 size={13} />
                            {group.accountCount} account(s)
                          </span>
                        </td>

                        <td data-label="Levels" className={cx("px-5 py-4 text-sm", muted(isDark))}>
                          {group.levelsText || "-"}
                        </td>

                        <td data-label="Volume" className={cx("px-5 py-4 text-right text-sm", muted(isDark))}>
                          {format4(group.totalLot)}
                        </td>

                        <td data-label="Earned" className={cx("px-5 py-4 text-right text-sm font-black", titleText(isDark))}>
                          {formatMoney(group.totalCommission, 4)}
                        </td>

                        <td data-label="Action" className="px-5 py-4 text-center">
                          <Link
                            to={buildCloseTradePath(group.email, group.rows)}
                            state={{
                              userGroup: {
                                email: group.email,
                                name: group.name,
                                country: group.countriesText,
                                accounts: group.rows,
                              },
                            }}
                            className={cx(
                              "inline-flex h-10 w-10 items-center justify-center rounded-card border transition-all","border-line bg-primary-soft text-primary hover:bg-primary-soft"
                            )}
                            onClick={(e) => e.stopPropagation()}
                            title="View all account close trades"
                          >
                            <ArrowRight size={17} />
                          </Link>
                        </td>
                      </tr>

                      {expanded &&
                        group.rows.map((row, idx) => (
                          <tr
                            key={`${group.email}-${row?.accountNumber || idx}-${row?.level || "level"}`}
                            className={cx("bg-surface-2"
                            )}
                          >
                            <td data-label="User" className="px-5 py-4 pl-20">
                              <p className={cx("font-semibold", titleText(isDark))}>
                                Account #{idx + 1}
                              </p>
                              <p className={cx("mt-1 text-xs", muted(isDark))}>
                                {row?.name || "-"} · {row?.email || "-"}
                              </p>
                            </td>

                            <td data-label="Country" className={cx("px-5 py-4 text-sm", muted(isDark))}>
                              {row?.country || "-"}
                            </td>

                            <td data-label="Accounts" className={cx("px-5 py-4 text-sm font-bold", titleText(isDark))}>
                              {row?.accountNumber || "-"}
                            </td>

                            <td data-label="Levels" className={cx("px-5 py-4 text-sm", muted(isDark))}>
                              Level {row?.level ?? "-"}
                            </td>

                            <td data-label="Volume" className={cx("px-5 py-4 text-right text-sm", muted(isDark))}>
                              {format4(row?.totalLot)}
                            </td>

                            <td data-label="Earned" className={cx("px-5 py-4 text-right text-sm font-bold", titleText(isDark))}>
                              {formatMoney(row?.totalCommission || 0, 4)}
                            </td>

                            <td data-label="Action" className="px-5 py-4 text-center">
                              <Link
                                to={buildSingleAccountCloseTradePath(row)}
                                state={{
                                  userGroup: {
                                    email: row?.email,
                                    name: row?.name,
                                    country: row?.country,
                                    accounts: [row],
                                  },
                                }}
                                className={cx(
                                  "inline-flex h-9 w-9 items-center justify-center rounded-card border transition-all","border-line bg-surface-2 text-primary hover:bg-surface-2"
                                )}
                                title="View this account close trades"
                              >
                                <ArrowRight size={16} />
                              </Link>
                            </td>
                          </tr>
                        ))}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-3 lg:hidden">
          {paginatedUsers.length === 0 ? (
            <div className={cx("px-4 py-12 text-center text-sm", muted(isDark))}>
              No IB user rows found.
            </div>
          ) : (
            paginatedUsers.map((group) => {
              const expanded = !!expandedUsers[group.email];

              return (
                <div
                  key={group.email}
                  className={cx(
                    "rounded-card border p-4","border-line bg-surface-2"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(group.email)}
                    className="flex w-full items-start justify-between gap-3 text-left"
                  >
                    <div>
                      <p className={cx("text-lg font-black", titleText(isDark))}>
                        {group.name || "-"}
                      </p>
                      <p className={cx("mt-1 text-xs", muted(isDark))}>{group.email}</p>
                    </div>

                    <div
                      className={cx(
                        "grid h-9 w-9 place-items-center rounded-card border","border-line bg-surface-2 text-primary"
                      )}
                    >
                      {expanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                    </div>
                  </button>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className={cx("rounded-card border p-3","border-line bg-surface")}>
                      <p className={cx("text-xs", muted(isDark))}>Accounts</p>
                      <p className={cx("mt-1 font-black", titleText(isDark))}>
                        {group.accountCount}
                      </p>
                    </div>

                    <div className={cx("rounded-card border p-3","border-line bg-surface")}>
                      <p className={cx("text-xs", muted(isDark))}>Earned</p>
                      <p className={cx("mt-1 font-black", titleText(isDark))}>
                        {formatMoney(group.totalCommission, 4)}
                      </p>
                    </div>

                    <div className={cx("rounded-card border p-3","border-line bg-surface")}>
                      <p className={cx("text-xs", muted(isDark))}>Volume</p>
                      <p className={cx("mt-1 font-black", titleText(isDark))}>
                        {format4(group.totalLot)}
                      </p>
                    </div>

                    <div className={cx("rounded-card border p-3","border-line bg-surface")}>
                      <p className={cx("text-xs", muted(isDark))}>Levels</p>
                      <p className={cx("mt-1 font-black", titleText(isDark))}>
                        {group.levelsText || "-"}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={buildCloseTradePath(group.email, group.rows)}
                    state={{
                      userGroup: {
                        email: group.email,
                        name: group.name,
                        country: group.countriesText,
                        accounts: group.rows,
                      },
                    }}
                    className={cx(
                      "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-card border px-4 py-3 text-sm font-bold","border-line bg-primary-soft text-primary"
                    )}
                  >
                    View all close trades
                    <ArrowRight size={16} />
                  </Link>

                  {expanded && (
                    <div className="mt-4 space-y-3">
                      {group.rows.map((row, idx) => (
                        <div
                          key={`${group.email}-mobile-${row?.accountNumber || idx}-${row?.level || "level"}`}
                          className={cx(
                            "rounded-card border p-3","border-line bg-surface"
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className={cx("font-black", titleText(isDark))}>
                                {row?.accountNumber || "-"}
                              </p>
                              <p className={cx("mt-1 text-xs", muted(isDark))}>
                                Level {row?.level ?? "-"} · {row?.country || "-"}
                              </p>
                            </div>

                            <Link
                              to={buildSingleAccountCloseTradePath(row)}
                              state={{
                                userGroup: {
                                  email: row?.email,
                                  name: row?.name,
                                  country: row?.country,
                                  accounts: [row],
                                },
                              }}
                              className={cx(
                                "grid h-9 w-9 place-items-center rounded-card border","border-line bg-surface-2 text-primary"
                              )}
                            >
                              <ArrowRight size={16} />
                            </Link>
                          </div>

                          <div className={cx("mt-3 text-xs leading-6", muted(isDark))}>
                            Volume: {format4(row?.totalLot)} · Earned:{" "}
                            {formatMoney(row?.totalCommission || 0, 4)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 ? (
          <div
            className={cx(
              "flex items-center justify-center gap-3 border-t p-5","border-line"
            )}
          >
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className={buttonSecondary(
                isDark,
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              )}
            >
              Prev
            </button>

            <span className={cx("text-sm", muted(isDark))}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className={buttonSecondary(
                isDark,
                currentPage === totalPages ? "pointer-events-none opacity-50" : ""
              )}
            >
              Next
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default ReferralIbUsersTab;