// Components/user/bonus/BonusPayoutsTab.jsx
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  BadgeDollarSign,
  CandlestickChart,
  ChevronDown,
  Clock3,
  Eye,
  Gift,
  ListChecks,
  ReceiptText,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  Wallet,
  WalletCards,
} from "lucide-react";

import { useBonusPayouts } from "./hooks/useBonusPayouts";
import BonusFilterBar from "./components/BonusFilterBar";
import BonusStatusBadge from "./components/BonusStatusBadge";
import BonusEmptyState from "./components/BonusEmptyState";
import BonusTableLoader from "./components/BonusTableLoader";
import BonusPayoutDetailsModal from "./BonusPayoutDetailsModal";
import { formatCurrency, formatDate, formatNumber } from "./utils/bonusHelpers";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const formatRelativeTime = (iso) => {
  if (!iso) return "N/A";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "N/A";

  const diffMs = Date.now() - date.getTime();
  const isFuture = diffMs < 0;
  const absMs = Math.abs(diffMs);

  const seconds = Math.floor(absMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let text = "Just now";

  if (seconds < 45) text = "Just now";
  else if (minutes < 60)
    text = `${minutes} ${minutes === 1 ? "min" : "mins"} ago`;
  else if (hours < 24)
    text = `${hours} ${hours === 1 ? "hr" : "hrs"} ago`;
  else if (days === 1) text = "Yesterday";
  else if (days < 7) text = `${days} days ago`;
  else if (weeks < 5)
    text = `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  else if (months < 12)
    text = `${months} ${months === 1 ? "month" : "months"} ago`;
  else text = `${years} ${years === 1 ? "year" : "years"} ago`;

  if (isFuture && text !== "Just now") {
    return text.replace("ago", "from now");
  }

  return text;
};

const getTheme = (isDark) => ({
  text:"text-text",
  muted:"text-subtle",
  softText:"text-muted",

  wrapper:"bg-transparent",

  filterCard:"border-line bg-surface-2",

  filterHeader:"border-line bg-surface-2",

  filterWrap:"border-line bg-surface-2",

  filterIcon:"border-line bg-primary-soft text-primary",

  filterBadge:"border-line bg-surface-2 text-muted",

  tableWrap:"border-line bg-surface-2",

  tableHead:"border-line bg-surface-2 text-subtle",

  tableRow:"border-line hover:bg-surface-2",

  iconBox:"border-line bg-primary-soft text-primary",

  chip:"border-line bg-surface-2 text-muted",

  accountChip:"border-line bg-primary-soft text-primary",

  amountChip:"border-success bg-success-soft text-success",

  bonusChip:"border-line bg-primary-soft text-primary",

  walletChip:"border-line bg-primary-soft text-primary",

  timeChip:"border-line bg-surface-2 text-primary",

  actionButton:"border-line bg-surface-2 text-muted hover:bg-surface-2",

  statCard:"border-line bg-surface-2",
});

const SoftIconBox = ({ theme, children }) => (
  <div
    className={cx(
      "flex h-10 w-10 shrink-0 items-center justify-center rounded-card border-[1.5px]",
      theme.iconBox
    )}
  >
    {children}
  </div>
);

const SummaryCard = ({ theme, icon, label, value }) => (
  <div className={cx("rounded-card border-[1.5px] px-4 py-3", theme.statCard)}>
    <div className="flex items-center gap-3">
      <SoftIconBox theme={theme}>{icon}</SoftIconBox>

      <div className="min-w-0">
        <p className={cx("text-xs", theme.muted)}>{label}</p>
        <p className={cx("mt-1 truncate text-base font-bold", theme.text)}>
          {value}
        </p>
      </div>
    </div>
  </div>
);

const TimeCell = ({ theme, date, label }) => {
  if (!date) {
    return <span className={cx("text-xs", theme.muted)}>N/A</span>;
  }

  return (
    <div className="min-w-[145px]">
      {label ? (
        <p
          className={cx(
            "mb-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
            theme.muted
          )}
        >
          {label}
        </p>
      ) : null}

      <div
        className={cx(
          "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-2.5 py-1 text-[11px] font-bold",
          theme.timeChip
        )}
      >
        <Clock3 className="h-3.5 w-3.5" />
        {formatRelativeTime(date)}
      </div>

      <p className={cx("mt-1 text-[11px] leading-4", theme.muted)}>
        {formatDate(date)}
      </p>
    </div>
  );
};

const BonusPayoutsTab = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";
  const theme = useMemo(() => getTheme(isDark), [isDark]);

  // By default open
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    mt5Account: "",
    from: "",
    to: "",
  });

  const {
    data,
    loading,
    selected,
    setSelected,
    detailsLoading,
    fetchDetails,
  } = useBonusPayouts(filters);

  const rows = Array.isArray(data) ? data : [];

  const fields = useMemo(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        placeholder: "All Status",
        options: [
          { label: "Success", value: "success" },
          { label: "Skipped", value: "skipped" },
          { label: "Failed", value: "failed" },
        ],
      },
      {
        name: "mt5Account",
        label: "MT5 Account",
        placeholder: "Search MT5 account",
      },
      { name: "from", label: "From Date", type: "date" },
      { name: "to", label: "To Date", type: "date" },
    ],
    []
  );

  const activeFilterCount = useMemo(() => {
    return ["status", "mt5Account", "from", "to"].filter((key) =>
      String(filters[key] || "").trim()
    ).length;
  }, [filters]);

  const summary = useMemo(() => {
    const totalBonus = rows.reduce(
      (sum, item) => sum + Number(item?.bonusAmount || 0),
      0
    );

    const totalLot = rows.reduce(
      (sum, item) => sum + Number(item?.totalLot || 0),
      0
    );

    const success = rows.filter(
      (item) => String(item?.status || "").toLowerCase() === "success"
    ).length;

    const failed = rows.filter(
      (item) => String(item?.status || "").toLowerCase() === "failed"
    ).length;

    return {
      records: rows.length,
      totalBonus,
      totalLot,
      success,
      failed,
    };
  }, [rows]);

  const onChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const onReset = () => {
    setFilters({
      page: 1,
      limit: 10,
      status: "",
      mt5Account: "",
      from: "",
      to: "",
    });
  };

  return (
    <div className={cx("min-h-full", theme.wrapper)}>
      <div className="space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            theme={theme}
            icon={<ReceiptText className="h-5 w-5" />}
            label="Records"
            value={summary.records}
          />

          <SummaryCard
            theme={theme}
            icon={<CandlestickChart className="h-5 w-5" />}
            label="Total Lot"
            value={formatNumber(summary.totalLot)}
          />

          <SummaryCard
            theme={theme}
            icon={<Gift className="h-5 w-5" />}
            label="Total Bonus"
            value={formatCurrency(summary.totalBonus)}
          />

          <SummaryCard
            theme={theme}
            icon={<ShieldCheck className="h-5 w-5" />}
            label="Success"
            value={summary.success}
          />
        </div>

        {/* Collapsible Filter */}
        <div
          className={cx(
            "overflow-hidden rounded-card border-[1.5px]",
            theme.filterCard
          )}
        >
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            aria-expanded={isFilterOpen}
            className={cx(
              "flex w-full flex-col gap-3 border-b-[1.5px] px-4 py-4 text-left transition-all duration-200 sm:flex-row sm:items-center sm:justify-between",
              theme.filterHeader
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cx(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-card border-[1.5px]",
                  theme.filterIcon
                )}
              >
                <SlidersHorizontal className="h-5 w-5" />
              </div>

              <div>
                <h3 className={cx("text-base font-bold", theme.text)}>
                  Filter Payout History
                </h3>
                <p className={cx("mt-1 text-sm leading-6", theme.muted)}>
                  Expand or collapse filters for status, MT5 account, and date range.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={cx(
                  "inline-flex rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold",
                  theme.filterBadge
                )}
              >
                {activeFilterCount
                  ? `${activeFilterCount} active`
                  : "No active filter"}
              </span>

              <span
                className={cx(
                  "inline-flex h-10 w-10 items-center justify-center rounded-card border-[1.5px] transition-all duration-300",
                  theme.filterBadge,
                  isFilterOpen && "rotate-180"
                )}
              >
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>
          </button>

          <div
            className={cx(
              "grid transition-all duration-300 ease-in-out",
              isFilterOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <div className="p-4">
                <div
                  className={cx(
                    "rounded-card border-[1.5px] p-4",
                    theme.filterWrap
                  )}
                >
                  <BonusFilterBar
                    isDark={isDark}
                    filters={filters}
                    onChange={onChange}
                    onReset={onReset}
                    fields={fields}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <BonusTableLoader rows={8} />
        ) : rows.length === 0 ? (
          <BonusEmptyState
            isDark={isDark}
            title="No payout records found"
            subtitle="Payout records will appear once trade bonus processing runs."
          />
        ) : (
          <div
            className={cx(
              "overflow-hidden rounded-card border-[1.5px]",
              theme.tableWrap
            )}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1380px] text-left text-sm table-stack">
                <thead>
                  <tr
                    className={cx(
                      "border-b-[1.5px] text-xs uppercase tracking-[0.16em]",
                      theme.tableHead
                    )}
                  >
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">MT5 Account</th>
                    <th className="px-4 py-3">Total Lot</th>
                    <th className="px-4 py-3">Matched Range</th>
                    <th className="px-4 py-3">Bonus Amount</th>
                    <th className="px-4 py-3">Wallet Flow</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Timeline</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((item) => {
                    const updatedDate =
                      item?.updatedAt ||
                      item?.updated_at ||
                      item?.modifiedAt ||
                      null;

                    const processedDate =
                      item?.processedAt ||
                      item?.completedAt ||
                      item?.approvedAt ||
                      item?.payoutAt ||
                      item?.processed_at ||
                      item?.completed_at ||
                      item?.approved_at ||
                      null;

                    return (
                      <tr
                        key={item._id}
                        className={cx(
                          "border-t-[1.5px] transition-colors duration-200",
                          theme.tableRow
                        )}
                      >
                        <td data-label="Date" className="px-4 py-4 align-top">
                          <TimeCell theme={theme} date={item.createdAt} />
                        </td>

                        <td data-label="MT5 Account" className="px-4 py-4 align-top">
                          <span
                            className={cx(
                              "inline-flex items-center gap-2 rounded-full border-[1.5px] px-3 py-1 text-xs font-bold",
                              theme.accountChip
                            )}
                          >
                            <WalletCards className="h-3.5 w-3.5" />
                            #{item.mt5Account || "N/A"}
                          </span>
                        </td>

                        <td data-label="Total Lot" className="px-4 py-4 align-top">
                          <span
                            className={cx(
                              "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold",
                              theme.chip
                            )}
                          >
                            <TrendingUp className="h-3.5 w-3.5" />
                            {formatNumber(item.totalLot)}
                          </span>
                        </td>

                        <td data-label="Matched Range" className="px-4 py-4 align-top">
                          <span
                            className={cx(
                              "inline-flex rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold",
                              theme.chip
                            )}
                          >
                            {item?.matchedRange?.minLot ?? "-"} -{" "}
                            {item?.matchedRange?.maxLot ?? "-"}
                          </span>
                        </td>

                        <td data-label="Bonus Amount" className="px-4 py-4 align-top">
                          <span
                            className={cx(
                              "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1 text-xs font-bold",
                              theme.bonusChip
                            )}
                          >
                            <BadgeDollarSign className="h-3.5 w-3.5" />
                            {formatCurrency(item.bonusAmount)}
                          </span>
                        </td>

                        <td data-label="Wallet Flow" className="px-4 py-4 align-top">
                          <span
                            className={cx(
                              "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold",
                              theme.walletChip
                            )}
                          >
                            <Wallet className="h-3.5 w-3.5" />
                            {formatCurrency(item.walletBefore)} →{" "}
                            {formatCurrency(item.walletAfter)}
                          </span>
                        </td>

                        <td data-label="Status" className="px-4 py-4 align-top">
                          <BonusStatusBadge
                            isDark={isDark}
                            status={item.status}
                          />
                        </td>

                        <td data-label="Timeline" className="px-4 py-4 align-top">
                          <div className="space-y-3">
                            {updatedDate ? (
                              <TimeCell
                                theme={theme}
                                date={updatedDate}
                              />
                            ) : (
                              <div
                                className={cx(
                                  "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-2.5 py-1 text-[11px] font-semibold",
                                  theme.chip
                                )}
                              >
                                <ListChecks className="h-3.5 w-3.5" />
                                No update yet
                              </div>
                            )}

                          </div>
                        </td>

                        <td data-label="Action" className="px-4 py-4 align-top">
                          <button
                            type="button"
                            onClick={() => fetchDetails(item._id)}
                            className={cx(
                              "inline-flex items-center gap-2 rounded-card border-[1.5px] px-3 py-2 text-sm font-semibold transition-all",
                              theme.actionButton
                            )}
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <BonusPayoutDetailsModal
        isDark={isDark}
        open={!!selected || detailsLoading}
        onClose={() => setSelected(null)}
        data={selected}
        loading={detailsLoading}
      />
    </div>
  );
};

export default BonusPayoutsTab;