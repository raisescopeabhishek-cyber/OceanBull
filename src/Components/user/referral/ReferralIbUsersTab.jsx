import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { RefreshCw, Info, ArrowRight } from "lucide-react";

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
  const [expandedEmails, setExpandedEmails] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  const filteredData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return commissionsData;

    return commissionsData.filter((item) => {
      return (
        String(item?.email || "").toLowerCase().includes(q) ||
        String(item?.name || "").toLowerCase().includes(q) ||
        String(item?.country || "").toLowerCase().includes(q) ||
        String(item?.accountNumber || "").toLowerCase().includes(q)
      );
    });
  }, [commissionsData, searchTerm]);

  const groupedData = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      const key = item?.email || "unknown";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [filteredData]);

  const emails = useMemo(() => Object.keys(groupedData), [groupedData]);

  const paginatedEmails = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return emails.slice(start, start + ITEMS_PER_PAGE);
  }, [emails, currentPage]);

  const totalPages = Math.max(1, Math.ceil(emails.length / ITEMS_PER_PAGE));

  const stats = useMemo(() => {
    const totalUsers = commissionsData.length;
    const uniqueEmails = new Set(
      commissionsData.map((item) => item?.email)
    ).size;

    const totalCommission = commissionsData.reduce(
      (sum, item) => sum + Number(item?.totalCommission || 0),
      0
    );

    const totalVolume = commissionsData.reduce(
      (sum, item) => sum + Number(item?.totalLot || 0),
      0
    );

    const activeUsers = commissionsData.filter(
      (item) =>
        Number(item?.totalCommission || 0) > 0 ||
        Number(item?.totalLot || 0) > 0
    ).length;

    const countryDistribution = commissionsData.reduce((acc, item) => {
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
      totalUsers,
      uniqueEmails,
      totalCommission,
      totalVolume,
      activeUsers,
      topCountry,
      activeRate: totalUsers ? (activeUsers / totalUsers) * 100 : 0,
    };
  }, [commissionsData]);

  const toggleExpand = (email) => {
    setExpandedEmails((prev) => ({
      ...prev,
      [email]: !prev[email],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className={cx("text-2xl font-bold", titleText(isDark))}>
            IB users
          </h2>
          <p className={cx("mt-2 text-sm", muted(isDark))}>
            Search and inspect grouped IB users connected to your referral account.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 md:flex-row lg:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, country or account..."
            className={inputBase(isDark, "min-w-[280px]")}
          />

          <button
            type="button"
            onClick={fetchCommissions}
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          isDark={isDark}
          icon={Info}
          title="Total Rows"
          value={stats.totalUsers}
          subtitle={`${stats.uniqueEmails} unique emails`}
          tone="sky"
        />

        <StatCard
          isDark={isDark}
          icon={Info}
          title="Total Commission"
          value={formatMoney(stats.totalCommission, 4)}
          subtitle="Sum of user commission values"
          tone="emerald"
        />

        <StatCard
          isDark={isDark}
          icon={Info}
          title="Total Volume"
          value={Number(stats.totalVolume || 0).toFixed(4)}
          subtitle="Combined lot size"
          tone="violet"
        />

        <StatCard
          isDark={isDark}
          icon={Info}
          title="Top Country"
          value={String(stats.topCountry?.[0] || "Unknown")}
          subtitle={`${stats.topCountry?.[1] || 0} users`}
          tone="amber"
        />

        <StatCard
          isDark={isDark}
          icon={Info}
          title="Active Rate"
          value={`${Number(stats.activeRate || 0).toFixed(0)}%`}
          subtitle={`${stats.activeUsers} active users`}
          tone="sky"
        />
      </div>

      <section className={panelCard(isDark, "p-6")}>
        <div className="overflow-x-auto">
          <table className="min-w-[1080px] w-full">
            <thead>
              <tr
                className={cx(
                  "border-b text-left text-xs uppercase tracking-[0.16em]",
                  isDark
                    ? "border-white/10 text-white/45"
                    : "border-sky-100 text-slate-500"
                )}
              >
                <th className="px-4 py-3">Name / Email</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Volume</th>
                <th className="px-4 py-3">Earned</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedEmails.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className={cx("px-4 py-12 text-center text-sm", muted(isDark))}
                  >
                    No IB user rows found.
                  </td>
                </tr>
              ) : (
                paginatedEmails.map((email) => {
                  const rows = groupedData[email] || [];
                  const first = rows[0] || {};
                  const expanded = !!expandedEmails[email];

                  return (
                    <Fragment key={email}>
                      <tr
                        onClick={() => rows.length > 1 && toggleExpand(email)}
                        className={cx(
                          "border-b cursor-pointer",
                          isDark ? "border-white/5" : "border-sky-100/80"
                        )}
                      >
                        <td className="px-4 py-4">
                          <p className={cx("font-semibold", titleText(isDark))}>
                            {first?.name || "-"}
                          </p>
                          <p className={cx("mt-1 text-xs", muted(isDark))}>
                            {email}
                          </p>
                        </td>

                        <td className={cx("px-4 py-4 text-sm", muted(isDark))}>
                          {first?.country || "-"}
                        </td>

                        <td className={cx("px-4 py-4 text-sm", muted(isDark))}>
                          {first?.accountNumber || "-"}
                        </td>

                        <td className={cx("px-4 py-4 text-sm", muted(isDark))}>
                          {first?.level ?? "-"}
                        </td>

                        <td className={cx("px-4 py-4 text-sm", muted(isDark))}>
                          {Number(first?.totalLot || 0).toFixed(4)}
                        </td>

                        <td className={cx("px-4 py-4 text-sm", titleText(isDark))}>
                          {Number(first?.totalCommission || 0).toFixed(4)}
                        </td>
                        {/* user/referral/ib-users/:id/close-trades */}

                        <td className="px-4 py-4">
                          <Link
                            to={`/user/referral/ib-users/${first?.accountNumber}/close-trades`}
                            className={cx(
                              "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all",
                              isDark
                                ? "border-white/10 bg-white/[0.05] text-cyan-200 hover:bg-white/[0.08]"
                                : "border-sky-100 bg-white text-sky-700 hover:bg-sky-50"
                            )}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ArrowRight size={16} />
                          </Link>
                        </td>
                      </tr>

                      {expanded &&
                        rows.slice(1).map((row, idx) => (
                          <tr
                            key={`${email}-${idx}`}
                            className={cx(
                              "border-b",
                              isDark ? "border-white/5" : "border-sky-100/80"
                            )}
                          >
                            <td className="px-4 py-4 pl-10">
                              <p className={cx("font-medium", titleText(isDark))}>
                                {row?.name || "-"}
                              </p>
                              <p className={cx("mt-1 text-xs", muted(isDark))}>
                                {row?.email || "-"}
                              </p>
                            </td>

                            <td className={cx("px-4 py-4 text-sm", muted(isDark))}>
                              {row?.country || "-"}
                            </td>

                            <td className={cx("px-4 py-4 text-sm", muted(isDark))}>
                              {row?.accountNumber || "-"}
                            </td>

                            <td className={cx("px-4 py-4 text-sm", muted(isDark))}>
                              {row?.level ?? "-"}
                            </td>

                            <td className={cx("px-4 py-4 text-sm", muted(isDark))}>
                              {Number(row?.totalLot || 0).toFixed(4)}
                            </td>

                            <td className={cx("px-4 py-4 text-sm", titleText(isDark))}>
                              {Number(row?.totalCommission || 0).toFixed(4)}
                            </td>

                            <td className="px-4 py-4">
                              <Link
                                to={`/user/referral-close-trades/${row?.accountNumber}?level=${row?.level}`}
                                className={cx(
                                  "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all",
                                  isDark
                                    ? "border-white/10 bg-white/[0.05] text-cyan-200 hover:bg-white/[0.08]"
                                    : "border-sky-100 bg-white text-sky-700 hover:bg-sky-50"
                                )}
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

        {totalPages > 1 ? (
          <div
            className={cx(
              "mt-5 flex items-center justify-center gap-3 border-t pt-5",
              isDark ? "border-white/10" : "border-sky-100"
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
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