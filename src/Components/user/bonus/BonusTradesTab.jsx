import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  BadgeCheck,
  CandlestickChart,
  ChevronDown,
  Clock3,
  Hash,
  ListChecks,
  ReceiptText,
  SearchCheck,
  ShieldCheck,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { useBonusTrades } from "./hooks/useBonusTrades";
import BonusFilterBar from "./components/BonusFilterBar";
import BonusEmptyState from "./components/BonusEmptyState";
import BonusStatusBadge from "./components/BonusStatusBadge";
import BonusTableLoader from "./components/BonusTableLoader";
import { formatDate, formatNumber } from "./utils/bonusHelpers";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const normalizeDateInput = (value) => {
  if (!value) return null;

  if (value instanceof Date) return value;

  const str = String(value).trim();

  // Supports MT5 style: "2026.04.28 17:17:01"
  const mt5Match = str.match(
    /^(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/
  );

  if (mt5Match) {
    const [, year, month, day, hour, minute, second] = mt5Match;
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  }

  return value;
};

const formatRelativeTime = (value) => {
  if (!value) return "N/A";

  const normalized = normalizeDateInput(value);
  const date = new Date(normalized);

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
  else if (minutes < 60) {
    text = `${minutes} ${minutes === 1 ? "min" : "mins"} ago`;
  } else if (hours < 24) {
    text = `${hours} ${hours === 1 ? "hr" : "hrs"} ago`;
  } else if (days === 1) {
    text = "Yesterday";
  } else if (days < 7) {
    text = `${days} days ago`;
  } else if (weeks < 5) {
    text = `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  } else if (months < 12) {
    text = `${months} ${months === 1 ? "month" : "months"} ago`;
  } else {
    text = `${years} ${years === 1 ? "year" : "years"} ago`;
  }

  if (isFuture && text !== "Just now") {
    return text.replace("ago", "from now");
  }

  return text;
};

const formatSafeDate = (value) => {
  const normalized = normalizeDateInput(value);
  return formatDate(normalized);
};

const formatPrice = (value) => {
  const num = Number(value);

  if (!Number.isFinite(num)) return "-";

  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  });
};

const getTheme = (isDark) => ({
  text: isDark ? "text-white" : "text-slate-900",
  muted: isDark ? "text-white/45" : "text-slate-500",
  softText: isDark ? "text-white/65" : "text-slate-600",

  wrapper: isDark ? "bg-transparent" : "bg-orange-50/10",

  filterCard: isDark
    ? "border-white/15 bg-white/[0.03] shadow-[0_16px_42px_rgba(0,0,0,0.24)]"
    : "border-orange-200/90 bg-white/85 shadow-[0_12px_30px_rgba(251,146,60,0.08)]",

  filterHeader: isDark
    ? "border-white/15 bg-white/[0.025]"
    : "border-orange-200/80 bg-gradient-to-r from-orange-50/45 via-white/75 to-white/50",

  filterWrap: isDark
    ? "border-white/15 bg-white/[0.025]"
    : "border-orange-200/75 bg-orange-50/25",

  filterIcon: isDark
    ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
    : "border-orange-300/80 bg-orange-50/70 text-orange-500 shadow-[0_0_0_3px_rgba(251,146,60,0.05)]",

  filterBadge: isDark
    ? "border-white/15 bg-white/[0.04] text-white/65"
    : "border-orange-200/85 bg-orange-50/60 text-orange-600 shadow-[0_0_0_3px_rgba(251,146,60,0.04)]",

  tableWrap: isDark
    ? "border-white/15 bg-white/[0.025]"
    : "border-orange-200/80 bg-white/85 shadow-[0_10px_26px_rgba(251,146,60,0.08)]",

  tableHead: isDark
    ? "border-white/15 bg-white/[0.035] text-white/45"
    : "border-orange-200/80 bg-orange-50/55 text-slate-500",

  tableRow: isDark
    ? "border-white/12 hover:bg-white/[0.035]"
    : "border-orange-200/65 hover:bg-orange-50/35",

  iconBox: isDark
    ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
    : "border-orange-300/80 bg-orange-50/70 text-orange-500 shadow-[0_0_0_3px_rgba(251,146,60,0.05)]",

  chip: isDark
    ? "border-white/15 bg-white/[0.04] text-white/70"
    : "border-orange-200/85 bg-orange-50/55 text-orange-600 shadow-[0_0_0_3px_rgba(251,146,60,0.04)]",

  accountChip: isDark
    ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
    : "border-orange-300/85 bg-orange-50/70 text-orange-600 shadow-[0_0_0_3px_rgba(251,146,60,0.05)]",

  symbolChip: isDark
    ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
    : "border-orange-200/90 bg-orange-50/70 text-orange-600 shadow-[0_0_0_3px_rgba(251,146,60,0.05)]",

  openPriceChip: isDark
    ? "border-cyan-400/25 bg-cyan-500/10 text-cyan-200"
    : "border-sky-100 bg-sky-50/85 text-sky-700 shadow-[0_0_0_3px_rgba(14,165,233,0.04)]",

  closePriceChip: isDark
    ? "border-orange-400/25 bg-orange-500/10 text-orange-200"
    : "border-orange-200/90 bg-orange-50/75 text-orange-700 shadow-[0_0_0_3px_rgba(251,146,60,0.05)]",

  openTimeChip: isDark
    ? "border-cyan-400/25 bg-cyan-500/10 text-cyan-200"
    : "border-sky-100 bg-sky-50/85 text-sky-700 shadow-[0_0_0_3px_rgba(14,165,233,0.04)]",

  closeTimeChip: isDark
    ? "border-orange-400/25 bg-orange-500/10 text-orange-200"
    : "border-orange-200/90 bg-orange-50/75 text-orange-700 shadow-[0_0_0_3px_rgba(251,146,60,0.05)]",

  profitPositive: isDark
    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
    : "border-emerald-200/90 bg-emerald-50/85 text-emerald-700",

  profitNegative: isDark
    ? "border-red-400/25 bg-red-500/10 text-red-300"
    : "border-red-200/90 bg-red-50/85 text-red-700",

  statCard: isDark
    ? "border-white/15 bg-white/[0.035]"
    : "border-orange-200/75 bg-white/85 shadow-[0_10px_24px_rgba(251,146,60,0.07)]",
});

const SoftIconBox = ({ theme, children }) => (
  <div
    className={cx(
      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[1.5px]",
      theme.iconBox
    )}
  >
    {children}
  </div>
);

const SummaryCard = ({ theme, icon, label, value }) => (
  <div className={cx("rounded-2xl border-[1.5px] px-4 py-3", theme.statCard)}>
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

const TimeCell = ({ theme, date, label, variant = "default" }) => {
  if (!date) {
    return <span className={cx("text-xs", theme.muted)}>N/A</span>;
  }

  const chipClass =
    variant === "open"
      ? theme.openTimeChip
      : variant === "close"
      ? theme.closeTimeChip
      : theme.chip;

  return (
    <div className="min-w-[150px]">
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
          chipClass
        )}
      >
        <Clock3 className="h-3.5 w-3.5" />
        {formatRelativeTime(date)}
      </div>

      <p className={cx("mt-1 text-[11px] leading-4", theme.muted)}>
        {formatSafeDate(date)}
      </p>
    </div>
  );
};

const PriceCell = ({ theme, type, value }) => {
  const isOpen = type === "open";

  return (
    <div
      className={cx(
        "inline-flex min-w-[125px] items-center gap-2 rounded-2xl border-[1.5px] px-3 py-2",
        isOpen ? theme.openPriceChip : theme.closePriceChip
      )}
    >
      <div
        className={cx(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-current/20 bg-white/30",
          isOpen ? "text-sky-600" : "text-orange-600"
        )}
      >
        {isOpen ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] opacity-70">
          {isOpen ? "Open" : "Close"}
        </p>
        <p className="mt-0.5 font-mono text-sm font-bold">
          {value}
        </p>
      </div>
    </div>
  );
};

const BonusTradesTab = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";
  const theme = useMemo(() => getTheme(isDark), [isDark]);

  // By default open
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    mt5Account: "",
    bonusProcessed: "",
    isBonusEligible: "",
    from: "",
    to: "",
  });

  const { data, loading } = useBonusTrades(filters);
  const rows = Array.isArray(data) ? data : [];

  const fields = useMemo(
    () => [
      {
        name: "mt5Account",
        label: "MT5 Account",
        placeholder: "Search MT5 account",
      },
      {
        name: "bonusProcessed",
        label: "Processed",
        type: "select",
        placeholder: "All Processed Status",
        options: [
          { label: "Processed", value: "true" },
          { label: "Unprocessed", value: "false" },
        ],
      },
      {
        name: "isBonusEligible",
        label: "Eligible",
        type: "select",
        placeholder: "All Eligibility",
        options: [
          { label: "Eligible", value: "true" },
          { label: "Not Eligible", value: "false" },
        ],
      },
      { name: "from", label: "From Date", type: "date" },
      { name: "to", label: "To Date", type: "date" },
    ],
    []
  );

  const activeFilterCount = useMemo(() => {
    return ["mt5Account", "bonusProcessed", "isBonusEligible", "from", "to"].filter(
      (key) => String(filters[key] || "").trim()
    ).length;
  }, [filters]);

  const summary = useMemo(() => {
    const totalLot = rows.reduce(
      (sum, item) => sum + Number(item?.lotSize || 0),
      0
    );

    const totalProfit = rows.reduce(
      (sum, item) => sum + Number(item?.profit || 0),
      0
    );

    const eligible = rows.filter((item) => !!item?.isBonusEligible).length;
    const processed = rows.filter((item) => !!item?.bonusProcessed).length;

    return {
      records: rows.length,
      totalLot,
      totalProfit,
      eligible,
      processed,
    };
  }, [rows]);

  const onChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const onReset = () => {
    setFilters({
      page: 1,
      limit: 10,
      mt5Account: "",
      bonusProcessed: "",
      isBonusEligible: "",
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
            icon={<TrendingUp className="h-5 w-5" />}
            label="Total Profit"
            value={formatNumber(summary.totalProfit)}
          />

          <SummaryCard
            theme={theme}
            icon={<BadgeCheck className="h-5 w-5" />}
            label="Processed"
            value={summary.processed}
          />
        </div>

        {/* Collapsible Filter */}
        <div
          className={cx(
            "overflow-hidden rounded-[22px] border-[1.5px]",
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
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-[1.5px]",
                  theme.filterIcon
                )}
              >
                <SlidersHorizontal className="h-5 w-5" />
              </div>

              <div>
                <h3 className={cx("text-base font-bold", theme.text)}>
                  Filter Bonus Trades
                </h3>
                <p className={cx("mt-1 text-sm leading-6", theme.muted)}>
                  Expand or collapse filters for account, eligibility, processing state, and date range.
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
                  "inline-flex h-10 w-10 items-center justify-center rounded-xl border-[1.5px] transition-all duration-300",
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
                    "rounded-[22px] border-[1.5px] p-4",
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
            title="No bonus trade records found"
            subtitle="Tracked close trades will appear here."
          />
        ) : (
          <div
            className={cx(
              "overflow-hidden rounded-[22px] border-[1.5px]",
              theme.tableWrap
            )}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1650px] text-left text-sm">
                <thead>
                  <tr
                    className={cx(
                      "border-b-[1.5px] text-xs uppercase tracking-[0.16em]",
                      theme.tableHead
                    )}
                  >
                    <th className="px-4 py-3">Open Time</th>
                    <th className="px-4 py-3">Close Time</th>
                    <th className="px-4 py-3">MT5 Account</th>
                    <th className="px-4 py-3">Position ID</th>
                    <th className="px-4 py-3">Symbol</th>
                    <th className="px-4 py-3">Lot</th>
                    <th className="px-4 py-3">Open Price</th>
                    <th className="px-4 py-3">Close Price</th>
                    <th className="px-4 py-3">Profit</th>
                    <th className="px-4 py-3">Eligible</th>
                    <th className="px-4 py-3">Processed</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((item) => {
                    const openDate =
                      item?.openTimeDate ||
                      item?.openTime ||
                      item?.createdAt ||
                      null;

                    const closeDate =
                      item?.closeTimeDate ||
                      item?.closeTime ||
                      item?.updatedAt ||
                      null;

                    return (
                      <tr
                        key={item._id}
                        className={cx(
                          "border-t-[1.5px] transition-colors duration-200",
                          theme.tableRow
                        )}
                      >
                        <td className="px-4 py-4 align-top">
                          <TimeCell
                            theme={theme}
                            date={openDate}
                            variant="open"
                          />
                        </td>

                        <td className="px-4 py-4 align-top">
                          <TimeCell
                            theme={theme}
                            date={closeDate}
                            variant="close"
                          />
                        </td>

                        <td className="px-4 py-4 align-top">
                          <span
                            className={cx(
                              "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold",
                              theme.accountChip
                            )}
                          >
                            <WalletCards className="h-3.5 w-3.5" />
                            #{item.mt5Account || "N/A"}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <span
                            className={cx(
                              "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold",
                              theme.chip
                            )}
                          >
                            <Hash className="h-3.5 w-3.5" />
                            {item.positionId || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <span
                            className={cx(
                              "inline-flex rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold",
                              theme.symbolChip
                            )}
                          >
                            {item.symbol || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <span
                            className={cx(
                              "inline-flex rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold",
                              theme.chip
                            )}
                          >
                            {formatNumber(item.lotSize)}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <PriceCell
                            theme={theme}
                            type="open"
                            value={item.openPrice}
                          />
                        </td>

                        <td className="px-4 py-4 align-top">
                          <PriceCell
                            theme={theme}
                            type="close"
                            value={item.closePrice}
                          />
                        </td>

                        <td className="px-4 py-4 align-top">
                          <span
                            className={cx(
                              "inline-flex rounded-full border-[1.5px] px-3 py-1 text-xs font-bold",
                              Number(item.profit || 0) >= 0
                                ? theme.profitPositive
                                : theme.profitNegative
                            )}
                          >
                            {formatNumber(item.profit)}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <BonusStatusBadge
                            isDark={isDark}
                            status={item.isBonusEligible ? "eligible" : "not eligible"}
                          />
                        </td>

                        <td className="px-4 py-4 align-top">
                          <BonusStatusBadge
                            isDark={isDark}
                            status={item.bonusProcessed ? "processed" : "pending"}
                          />
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
    </div>
  );
};

export default BonusTradesTab;