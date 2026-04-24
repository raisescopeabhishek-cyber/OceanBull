import React, { Fragment, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Eye,
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

const MAX_GROUPS_IN_CENTER = 8;

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
      const level =
        row?.level === undefined || row?.level === null ? "" : String(row.level);

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
  const emailOrAccount = encodeURIComponent(
    row?.email || row?.accountNumber || "unknown"
  );
  const accountPairs = buildAccountPairs([row]);
  const level =
    row?.level === undefined || row?.level === null ? "" : String(row.level);

  return `/user/referral/ib-users/${emailOrAccount}/close-trades?accounts=${encodeURIComponent(
    accountPairs
  )}${level ? `&level=${encodeURIComponent(level)}` : ""}`;
};

const ReferralCommissionTab = () => {
  const navigate = useNavigate();

  const {
    isDark,
    hasReferralAccount,
    totalCommission,
    ibBalance,
    approvedWithdrawalAmount,
    commissionsData,
    activeReferrals,
    loadingCommissions,
    refreshAll,
    generateReferralAccount,
    generatingAccount,
  } = useOutletContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUsers, setExpandedUsers] = useState({});

  const totalLots = useMemo(() => {
    return commissionsData.reduce(
      (sum, row) => sum + safeNumber(row?.totalLot),
      0
    );
  }, [commissionsData]);

  const groupedUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const rows = Array.isArray(commissionsData) ? commissionsData : [];

    const filtered = rows.filter((row) => {
      if (!q) return true;

      return (
        String(row?.email || "").toLowerCase().includes(q) ||
        String(row?.name || "").toLowerCase().includes(q) ||
        String(row?.country || "").toLowerCase().includes(q) ||
        String(row?.accountNumber || "").toLowerCase().includes(q) ||
        String(row?.level || "").toLowerCase().includes(q)
      );
    });

    const map = filtered.reduce((acc, row) => {
      const key = getSafeEmailKey(row?.email);

      if (!acc[key]) {
        acc[key] = {
          email: key,
          name: row?.name || "-",
          country: row?.country || "Unknown",
          rows: [],
          totalLot: 0,
          totalCommission: 0,
          accountCount: 0,
          levels: new Set(),
          countries: new Set(),
          activeRows: 0,
        };
      }

      acc[key].rows.push(row);
      acc[key].totalLot += safeNumber(row?.totalLot);
      acc[key].totalCommission += safeNumber(row?.totalCommission || row?.commission);
      acc[key].levels.add(row?.level ?? "-");
      acc[key].countries.add(row?.country || "Unknown");

      if (
        safeNumber(row?.totalLot) > 0 ||
        safeNumber(row?.totalCommission || row?.commission) > 0
      ) {
        acc[key].activeRows += 1;
      }

      return acc;
    }, {});

    return Object.values(map)
      .map((group) => {
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
            String(a?.accountNumber || "").localeCompare(
              String(b?.accountNumber || "")
            )
          ),
        };
      })
      .sort((a, b) => safeNumber(b.totalCommission) - safeNumber(a.totalCommission));
  }, [commissionsData, searchTerm]);

  const visibleGroups = useMemo(() => {
    return groupedUsers.slice(0, MAX_GROUPS_IN_CENTER);
  }, [groupedUsers]);

  const commissionStats = useMemo(() => {
    const rows = Array.isArray(commissionsData) ? commissionsData : [];
    const uniqueUsers = new Set(rows.map((row) => row?.email || "unknown")).size;
    const uniqueAccounts = new Set(
      rows.map((row) => String(row?.accountNumber || "").trim()).filter(Boolean)
    ).size;

    const activeRows = rows.filter(
      (row) =>
        safeNumber(row?.totalLot) > 0 ||
        safeNumber(row?.totalCommission || row?.commission) > 0
    ).length;

    return {
      uniqueUsers,
      uniqueAccounts,
      activeRows,
      activeRate: rows.length ? (activeRows / rows.length) * 100 : 0,
    };
  }, [commissionsData]);

  const toggleExpand = (email) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [email]: !prev[email],
    }));
  };

  const openAllCloseTrades = (group) => {
    navigate(buildCloseTradePath(group.email, group.rows), {
      state: {
        userGroup: {
          email: group.email,
          name: group.name,
          country: group.countriesText,
          accounts: group.rows,
        },
      },
    });
  };

  const openSingleAccountCloseTrades = (row) => {
    navigate(buildSingleAccountCloseTradePath(row), {
      state: {
        userGroup: {
          email: row?.email,
          name: row?.name,
          country: row?.country,
          accounts: [row],
        },
      },
    });
  };

  if (!hasReferralAccount) {
    return (
      <EmptyState
        isDark={isDark}
        title="Commission center is waiting"
        text="Generate your referral account first. Your earnings, lots, IB users, and withdrawal actions will appear here."
        actionLabel="Generate Referral Account"
        onAction={generateReferralAccount}
        loading={generatingAccount}
      />
    );
  }

  const quickCards = [
    {
      title: "Withdraw balance",
      desc: "Send a payout request from your available IB balance.",
      path: "/user/referral/withdraw",
    },
    {
      title: "Withdrawal history",
      desc: "Review pending and approved withdrawals.",
      path: "/user/referral/history",
    },
    {
      title: "Inspect IB users",
      desc: "See account-level lot and commission details.",
      path: "/user/referral/ib-users",
    },
  ];

  return (
    <div className="space-y-6">
      <section
        className={cx(
          "relative overflow-hidden rounded-[28px] border p-5 sm:p-6",
          isDark
            ? "border-white/10 bg-slate-950/50"
            : "border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-white"
        )}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-8 h-52 w-52 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div
              className={cx(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]",
                isDark
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                  : "border-emerald-100 bg-emerald-50 text-emerald-700"
              )}
            >
              <BadgeDollarSign className="h-3.5 w-3.5" />
              Commission Center
            </div>

            <h2
              className={cx(
                "mt-3 text-2xl font-black tracking-tight sm:text-3xl",
                titleText(isDark)
              )}
            >
              Commission center
            </h2>

            <p className={cx("mt-2 max-w-2xl text-sm leading-6", muted(isDark))}>
              A focused view for earnings, lots, payout state, and expandable
              user-wise account commission activity.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <button
              type="button"
              onClick={refreshAll}
              className={buttonSecondary(isDark)}
            >
              <RefreshCw
                size={16}
                className={loadingCommissions ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          isDark={isDark}
          icon={BadgeDollarSign}
          title="Total Commission"
          value={formatMoney(totalCommission, 4)}
          subtitle={`${commissionStats.uniqueUsers} unique IB users`}
          tone="emerald"
        />

        <StatCard
          isDark={isDark}
          icon={Wallet}
          title="Withdrawable Balance"
          value={formatMoney(ibBalance, 4)}
          subtitle="Available to request"
          tone="sky"
        />

        <StatCard
          isDark={isDark}
          icon={BarChart3}
          title="Total Lots"
          value={format4(totalLots)}
          subtitle={`${commissionStats.uniqueAccounts} MT5 accounts`}
          tone="violet"
        />

        <StatCard
          isDark={isDark}
          icon={BadgeDollarSign}
          title="Approved Withdrawals"
          value={formatMoney(approvedWithdrawalAmount, 4)}
          subtitle={`${activeReferrals} active IB users`}
          tone="amber"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.9fr]">
        <section className={panelCard(isDark, "overflow-hidden")}>
          <div
            className={cx(
              "flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between",
              isDark ? "border-white/10" : "border-sky-100"
            )}
          >
            <div>
              <h3 className={cx("text-lg font-black", titleText(isDark))}>
                Expandable commission users
              </h3>
              <p className={cx("mt-2 text-sm", muted(isDark))}>
                Click a user to expand all accounts. Open all close trades or inspect
                a single account.
              </p>
            </div>

            <div className="relative w-full lg:w-[320px]">
              <Search
                size={16}
                className={cx(
                  "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2",
                  isDark ? "text-white/35" : "text-slate-400"
                )}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search user, account, country..."
                className={inputBase(isDark, "w-full pl-10")}
              />
            </div>
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-[980px] w-full">
              <thead>
                <tr
                  className={cx(
                    "border-b text-left text-xs uppercase tracking-[0.16em]",
                    isDark
                      ? "border-white/10 bg-white/[0.03] text-white/45"
                      : "border-sky-100 bg-sky-50/60 text-slate-500"
                  )}
                >
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Accounts</th>
                  <th className="px-5 py-4">Levels</th>
                  <th className="px-5 py-4 text-right">Lots</th>
                  <th className="px-5 py-4 text-right">Commission</th>
                  <th className="px-5 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody
                className={cx(
                  "divide-y",
                  isDark ? "divide-white/5" : "divide-sky-100/80"
                )}
              >
                {visibleGroups.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className={cx("px-5 py-14 text-center text-sm", muted(isDark))}
                    >
                      No commission rows available yet.
                    </td>
                  </tr>
                ) : (
                  visibleGroups.map((group) => {
                    const expanded = !!expandedUsers[group.email];

                    return (
                      <Fragment key={group.email}>
                        <tr
                          onClick={() => toggleExpand(group.email)}
                          className={cx(
                            "cursor-pointer transition-all",
                            isDark ? "hover:bg-white/[0.04]" : "hover:bg-sky-50/70"
                          )}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={cx(
                                  "grid h-10 w-10 place-items-center rounded-2xl border",
                                  isDark
                                    ? "border-white/10 bg-white/[0.05] text-cyan-200"
                                    : "border-sky-100 bg-white text-sky-700"
                                )}
                              >
                                {expanded ? (
                                  <ChevronDown size={18} />
                                ) : (
                                  <ChevronRight size={18} />
                                )}
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

                          <td className="px-5 py-4">
                            <span
                              className={cx(
                                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold",
                                isDark
                                  ? "border-violet-400/20 bg-violet-400/10 text-violet-200"
                                  : "border-violet-100 bg-violet-50 text-violet-700"
                              )}
                            >
                              <Layers3 size={13} />
                              {group.accountCount} account(s)
                            </span>
                          </td>

                          <td className={cx("px-5 py-4 text-sm", muted(isDark))}>
                            {group.levelsText || "-"}
                          </td>

                          <td
                            className={cx(
                              "px-5 py-4 text-right text-sm",
                              muted(isDark)
                            )}
                          >
                            {format4(group.totalLot)}
                          </td>

                          <td
                            className={cx(
                              "px-5 py-4 text-right text-sm font-black",
                              titleText(isDark)
                            )}
                          >
                            {formatMoney(group.totalCommission, 4)}
                          </td>

                          <td className="px-5 py-4 text-center">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                openAllCloseTrades(group);
                              }}
                              className={cx(
                                "inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition-all",
                                isDark
                                  ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15"
                                  : "border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-100"
                              )}
                              title="View all account close trades"
                            >
                              <ArrowRight size={17} />
                            </button>
                          </td>
                        </tr>

                        {expanded &&
                          group.rows.map((row, index) => (
                            <tr
                              key={`${group.email}-${row?.accountNumber || index}-${
                                row?.level || "level"
                              }`}
                              className={cx(
                                isDark ? "bg-white/[0.02]" : "bg-sky-50/40"
                              )}
                            >
                              <td className="px-5 py-4 pl-20">
                                <p className={cx("font-semibold", titleText(isDark))}>
                                  Account #{index + 1}
                                </p>
                                <p className={cx("mt-1 text-xs", muted(isDark))}>
                                  {row?.country || "Unknown"}
                                </p>
                              </td>

                              <td
                                className={cx(
                                  "px-5 py-4 text-sm font-bold",
                                  titleText(isDark)
                                )}
                              >
                                {row?.accountNumber || "-"}
                              </td>

                              <td className={cx("px-5 py-4 text-sm", muted(isDark))}>
                                Level {row?.level ?? "-"}
                              </td>

                              <td
                                className={cx(
                                  "px-5 py-4 text-right text-sm",
                                  muted(isDark)
                                )}
                              >
                                {format4(row?.totalLot)}
                              </td>

                              <td
                                className={cx(
                                  "px-5 py-4 text-right text-sm font-bold",
                                  titleText(isDark)
                                )}
                              >
                                {formatMoney(
                                  row?.totalCommission || row?.commission || 0,
                                  4
                                )}
                              </td>

                              <td className="px-5 py-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => openSingleAccountCloseTrades(row)}
                                  className={cx(
                                    "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all",
                                    isDark
                                      ? "border-white/10 bg-white/[0.05] text-cyan-200 hover:bg-white/[0.08]"
                                      : "border-sky-100 bg-white text-sky-700 hover:bg-sky-50"
                                  )}
                                  title="View this account close trades"
                                >
                                  <Eye size={16} />
                                </button>
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
            {visibleGroups.length === 0 ? (
              <div className={cx("px-4 py-12 text-center text-sm", muted(isDark))}>
                No commission rows available yet.
              </div>
            ) : (
              visibleGroups.map((group) => {
                const expanded = !!expandedUsers[group.email];

                return (
                  <div
                    key={group.email}
                    className={cx(
                      "rounded-3xl border p-4",
                      isDark
                        ? "border-white/10 bg-white/[0.04]"
                        : "border-sky-100 bg-sky-50/60"
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
                        <p className={cx("mt-1 text-xs", muted(isDark))}>
                          {group.email}
                        </p>
                      </div>

                      <div
                        className={cx(
                          "grid h-9 w-9 place-items-center rounded-2xl border",
                          isDark
                            ? "border-white/10 bg-white/[0.05] text-cyan-200"
                            : "border-sky-100 bg-white text-sky-700"
                        )}
                      >
                        {expanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                      </div>
                    </button>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div
                        className={cx(
                          "rounded-2xl border p-3",
                          isDark
                            ? "border-white/10 bg-slate-950/40"
                            : "border-white bg-white"
                        )}
                      >
                        <p className={cx("text-xs", muted(isDark))}>Accounts</p>
                        <p className={cx("mt-1 font-black", titleText(isDark))}>
                          {group.accountCount}
                        </p>
                      </div>

                      <div
                        className={cx(
                          "rounded-2xl border p-3",
                          isDark
                            ? "border-white/10 bg-slate-950/40"
                            : "border-white bg-white"
                        )}
                      >
                        <p className={cx("text-xs", muted(isDark))}>Earned</p>
                        <p className={cx("mt-1 font-black", titleText(isDark))}>
                          {formatMoney(group.totalCommission, 4)}
                        </p>
                      </div>

                      <div
                        className={cx(
                          "rounded-2xl border p-3",
                          isDark
                            ? "border-white/10 bg-slate-950/40"
                            : "border-white bg-white"
                        )}
                      >
                        <p className={cx("text-xs", muted(isDark))}>Volume</p>
                        <p className={cx("mt-1 font-black", titleText(isDark))}>
                          {format4(group.totalLot)}
                        </p>
                      </div>

                      <div
                        className={cx(
                          "rounded-2xl border p-3",
                          isDark
                            ? "border-white/10 bg-slate-950/40"
                            : "border-white bg-white"
                        )}
                      >
                        <p className={cx("text-xs", muted(isDark))}>Levels</p>
                        <p className={cx("mt-1 font-black", titleText(isDark))}>
                          {group.levelsText || "-"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openAllCloseTrades(group)}
                      className={cx(
                        "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold",
                        isDark
                          ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
                          : "border-sky-100 bg-sky-50 text-sky-700"
                      )}
                    >
                      View all close trades
                      <ArrowRight size={16} />
                    </button>

                    {expanded && (
                      <div className="mt-4 space-y-3">
                        {group.rows.map((row, index) => (
                          <div
                            key={`${group.email}-mobile-${row?.accountNumber || index}-${
                              row?.level || "level"
                            }`}
                            className={cx(
                              "rounded-2xl border p-3",
                              isDark
                                ? "border-white/10 bg-slate-950/40"
                                : "border-white bg-white"
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

                              <button
                                type="button"
                                onClick={() => openSingleAccountCloseTrades(row)}
                                className={cx(
                                  "grid h-9 w-9 place-items-center rounded-xl border",
                                  isDark
                                    ? "border-white/10 bg-white/[0.05] text-cyan-200"
                                    : "border-sky-100 bg-sky-50 text-sky-700"
                                )}
                              >
                                <Eye size={16} />
                              </button>
                            </div>

                            <div className={cx("mt-3 text-xs leading-6", muted(isDark))}>
                              Volume: {format4(row?.totalLot)} · Earned:{" "}
                              {formatMoney(row?.totalCommission || row?.commission || 0, 4)}
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

          {groupedUsers.length > MAX_GROUPS_IN_CENTER && (
            <div
              className={cx(
                "flex flex-col gap-3 border-t p-5 sm:flex-row sm:items-center sm:justify-between",
                isDark ? "border-white/10" : "border-sky-100"
              )}
            >
              <p className={cx("text-sm", muted(isDark))}>
                Showing top {MAX_GROUPS_IN_CENTER} of {groupedUsers.length} grouped users.
              </p>

              <button
                type="button"
                onClick={() => navigate("/user/referral/ib-users")}
                className={buttonSecondary(isDark)}
              >
                View all IB users
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </section>

        <section className={panelCard(isDark, "p-6")}>
          <h3 className={cx("text-lg font-bold", titleText(isDark))}>
            Quick actions
          </h3>
          <p className={cx("mt-2 text-sm", muted(isDark))}>
            Jump directly into payout flow or deeper IB analysis.
          </p>

          <div className="mt-5 space-y-3">
            {quickCards.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={cx(
                  "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all",
                  isDark
                    ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]"
                    : "border-sky-100 bg-sky-50/50 hover:bg-sky-50"
                )}
              >
                <div>
                  <p className={cx("font-semibold", titleText(isDark))}>
                    {item.title}
                  </p>
                  <p className={cx("mt-1 text-sm", muted(isDark))}>
                    {item.desc}
                  </p>
                </div>

                <ArrowRight
                  size={18}
                  className={isDark ? "text-white/45" : "text-slate-500"}
                />
              </button>
            ))}
          </div>

          <div
            className={cx(
              "mt-6 rounded-3xl border p-4",
              isDark
                ? "border-white/10 bg-white/[0.04]"
                : "border-sky-100 bg-sky-50/60"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p
                  className={cx(
                    "text-xs font-bold uppercase tracking-[0.16em]",
                    muted(isDark)
                  )}
                >
                  Active rows
                </p>
                <p className={cx("mt-1 text-2xl font-black", titleText(isDark))}>
                  {commissionStats.activeRows}
                </p>
              </div>

              <div
                className={cx(
                  "grid h-12 w-12 place-items-center rounded-2xl border",
                  isDark
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                    : "border-emerald-100 bg-emerald-50 text-emerald-700"
                )}
              >
                <Users size={20} />
              </div>
            </div>

            <p className={cx("mt-3 text-sm", muted(isDark))}>
              {Number(commissionStats.activeRate || 0).toFixed(0)}% of commission rows
              have trading volume or earned commission.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReferralCommissionTab;