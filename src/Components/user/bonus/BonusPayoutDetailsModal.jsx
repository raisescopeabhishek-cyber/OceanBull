// Components/user/bonus/BonusPayoutDetailsModal.jsx
import React from "react";
import { createPortal } from "react-dom";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  CandlestickChart,
  Clock3,
  FileText,
  Hash,
  ListChecks,
  TrendingDown,
  TrendingUp,
  Wallet,
  WalletCards,
  X,
} from "lucide-react";
import { formatCurrency, formatDate, formatNumber } from "./utils/bonusHelpers";
import BonusStatusBadge from "./components/BonusStatusBadge";

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

const formatRelativeTime = (iso) => {
  if (!iso) return "N/A";

  const normalized = normalizeDateInput(iso);
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
  overlay: isDark ? "bg-black/70" : "bg-slate-900/45",

  modal: isDark
    ? "border-white/15 bg-[#0b1220] text-white shadow-[0_30px_80px_rgba(0,0,0,0.50)]"
    : "border-orange-200/90 bg-white text-slate-900 shadow-[0_30px_80px_rgba(251,146,60,0.20)]",

  header: isDark
    ? "border-white/15 bg-white/[0.025]"
    : "border-orange-200/80 bg-gradient-to-r from-orange-50/45 via-white/75 to-white/50",

  card: isDark
    ? "border-white/15 bg-white/[0.035]"
    : "border-orange-200/75 bg-white/85 shadow-[0_10px_24px_rgba(251,146,60,0.07)]",

  cardSoft: isDark
    ? "border-white/15 bg-white/[0.025]"
    : "border-orange-200/75 bg-orange-50/25",

  tableWrap: isDark
    ? "border-white/15 bg-white/[0.025]"
    : "border-orange-200/80 bg-white/85 shadow-[0_10px_26px_rgba(251,146,60,0.08)]",

  tableHead: isDark
    ? "border-white/15 bg-white/[0.035] text-white/45"
    : "border-orange-200/80 bg-orange-50/55 text-slate-500",

  tableRow: isDark
    ? "border-white/12 hover:bg-white/[0.035]"
    : "border-orange-200/65 hover:bg-orange-50/35",

  text: isDark ? "text-white" : "text-slate-900",
  muted: isDark ? "text-white/45" : "text-slate-500",
  softText: isDark ? "text-white/65" : "text-slate-600",

  iconBox: isDark
    ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
    : "border-orange-300/80 bg-orange-50/70 text-orange-500 shadow-[0_0_0_3px_rgba(251,146,60,0.05)]",

  chip: isDark
    ? "border-white/15 bg-white/[0.04] text-white/70"
    : "border-orange-200/85 bg-orange-50/55 text-orange-600 shadow-[0_0_0_3px_rgba(251,146,60,0.04)]",

  accountChip: isDark
    ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
    : "border-orange-300/85 bg-orange-50/70 text-orange-600 shadow-[0_0_0_3px_rgba(251,146,60,0.05)]",

  amountChip: isDark
    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
    : "border-emerald-200/90 bg-emerald-50/85 text-emerald-700 shadow-[0_0_0_3px_rgba(16,185,129,0.05)]",

  bonusChip: isDark
    ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
    : "border-orange-200/90 bg-orange-50/70 text-orange-600 shadow-[0_0_0_3px_rgba(251,146,60,0.05)]",

  walletChip: isDark
    ? "border-purple-400/25 bg-purple-500/10 text-purple-200"
    : "border-purple-100 bg-purple-50/80 text-purple-700 shadow-[0_0_0_3px_rgba(168,85,247,0.04)]",

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

  dangerButton: isDark
    ? "border-red-400/20 bg-red-500/10 text-red-300 hover:bg-red-500/15"
    : "border-red-200/80 bg-red-50/75 text-red-600 hover:bg-red-100/60",

  timeChip: isDark
    ? "border-white/15 bg-white/[0.04] text-blue-300"
    : "border-orange-200/90 bg-orange-50/60 text-orange-600 shadow-[0_0_0_3px_rgba(251,146,60,0.04)]",
});

const IconBox = ({ theme, children }) => (
  <div
    className={cx(
      "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-[1.5px]",
      theme.iconBox
    )}
  >
    {children}
  </div>
);

const InfoCard = ({ theme, icon, label, value, valueClassName = "" }) => (
  <div className={cx("rounded-[20px] border-[1.5px] p-4", theme.card)}>
    <div className="flex items-start gap-3">
      <div
        className={cx(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[1.5px]",
          theme.iconBox
        )}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p
          className={cx(
            "text-xs font-semibold uppercase tracking-[0.16em]",
            theme.muted
          )}
        >
          {label}
        </p>

        <p
          className={cx(
            "mt-2 truncate text-base font-bold",
            theme.text,
            valueClassName
          )}
        >
          {value || "-"}
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
      : theme.timeChip;

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

const BonusPayoutDetailsModal = ({
  isDark,
  open,
  onClose,
  data,
  loading,
}) => {
  if (!open) return null;

  const theme = getTheme(isDark);
  const payout = data?.payout || {};
  const relatedTrades = data?.relatedTrades || [];

  const updatedDate =
    payout?.updatedAt || payout?.updated_at || payout?.modifiedAt || null;

  const processedDate =
    payout?.processedAt ||
    payout?.completedAt ||
    payout?.approvedAt ||
    payout?.payoutAt ||
    payout?.processed_at ||
    payout?.completed_at ||
    payout?.approved_at ||
    null;

  const modalContent = (
    <div
      className={cx(
        "fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-sm",
        theme.overlay
      )}
      onClick={onClose}
    >
      <div
        className={cx(
          "max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-[28px] border-[1.5px]",
          theme.modal
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={cx(
            "flex flex-col gap-4 border-b-[1.5px] px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
            theme.header
          )}
        >
          <div className="flex items-start gap-3">
            <IconBox theme={theme}>
              <BadgeDollarSign className="h-5 w-5" />
            </IconBox>

            <div>
              <div
                className={cx(
                  "mb-2 inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                  theme.chip
                )}
              >
                <ListChecks className="h-3.5 w-3.5" />
                Payout Breakdown
              </div>

              <h3 className={cx("text-xl font-bold", theme.text)}>
                Payout Details
              </h3>

              <p className={cx("mt-1 text-sm", theme.muted)}>
                Full trade bonus payout breakdown with related trade coverage.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={cx(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[1.5px] transition",
              theme.dangerButton
            )}
            aria-label="Close payout details modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-92px)] overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={cx(
                    "h-14 animate-pulse rounded-2xl border-[1.5px]",
                    isDark
                      ? "border-white/10 bg-white/[0.055]"
                      : "border-orange-100/70 bg-orange-50/45"
                  )}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <InfoCard
                  theme={theme}
                  icon={<WalletCards className="h-5 w-5" />}
                  label="MT5 Account"
                  value={payout.mt5Account}
                />

                <InfoCard
                  theme={theme}
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="Total Lot"
                  value={formatNumber(payout.totalLot)}
                />

                <InfoCard
                  theme={theme}
                  icon={<BadgeDollarSign className="h-5 w-5" />}
                  label="Bonus Amount"
                  value={formatCurrency(payout.bonusAmount)}
                />

                <InfoCard
                  theme={theme}
                  icon={<Clock3 className="h-5 w-5" />}
                  label="Created At"
                  value={formatRelativeTime(payout.createdAt)}
                />
              </div>

              {/* Main Details */}
              <div
                className={cx(
                  "rounded-[24px] border-[1.5px] p-4",
                  theme.cardSoft
                )}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <BonusStatusBadge isDark={isDark} status={payout.status} />

                  <span
                    className={cx(
                      "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold",
                      theme.walletChip
                    )}
                  >
                    <Wallet className="h-3.5 w-3.5" />
                    Wallet: {formatCurrency(payout.walletBefore)} →{" "}
                    {formatCurrency(payout.walletAfter)}
                  </span>

                  <span
                    className={cx(
                      "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold",
                      theme.chip
                    )}
                  >
                    <CandlestickChart className="h-3.5 w-3.5" />
                    Range: {payout?.matchedRange?.minLot ?? "-"} -{" "}
                    {payout?.matchedRange?.maxLot ?? "-"} Lots
                  </span>

                  <span
                    className={cx(
                      "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold",
                      theme.bonusChip
                    )}
                  >
                    <BadgeDollarSign className="h-3.5 w-3.5" />
                    Bonus: {formatCurrency(payout.bonusAmount)}
                  </span>
                </div>


                {payout?.note ? (
                  <div
                    className={cx(
                      "mt-4 rounded-2xl border-[1.5px] p-4",
                      theme.card
                    )}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-orange-500" />
                      <p
                        className={cx(
                          "text-xs font-semibold uppercase tracking-[0.14em]",
                          theme.muted
                        )}
                      >
                        Note
                      </p>
                    </div>

                    <p className={cx("text-sm leading-6", theme.softText)}>
                      {payout.note}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Related Trades */}
              <div
                className={cx(
                  "rounded-[24px] border-[1.5px] p-4",
                  theme.cardSoft
                )}
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <IconBox theme={theme}>
                      <BriefcaseBusiness className="h-5 w-5" />
                    </IconBox>

                    <div>
                      <h4 className={cx("text-lg font-bold", theme.text)}>
                        Related Trades
                      </h4>
                      <p className={cx("mt-1 text-sm", theme.muted)}>
                        Trades included in this payout calculation.
                      </p>
                    </div>
                  </div>

                  <span
                    className={cx(
                      "inline-flex w-fit rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold",
                      theme.chip
                    )}
                  >
                    {relatedTrades.length} trades
                  </span>
                </div>

                {relatedTrades.length === 0 ? (
                  <div
                    className={cx(
                      "rounded-2xl border-[1.5px] px-4 py-8 text-center text-sm",
                      theme.card
                    )}
                  >
                    <p className={theme.muted}>No related trades found.</p>
                  </div>
                ) : (
                  <div
                    className={cx(
                      "overflow-hidden rounded-[22px] border-[1.5px]",
                      theme.tableWrap
                    )}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1450px] text-left text-sm">
                        <thead>
                          <tr
                            className={cx(
                              "border-b-[1.5px] text-xs uppercase tracking-[0.16em]",
                              theme.tableHead
                            )}
                          >
                            <th className="px-4 py-3">Position ID</th>
                            <th className="px-4 py-3">MT5 Account</th>
                            <th className="px-4 py-3">Lot</th>
                            <th className="px-4 py-3">Symbol</th>
                            <th className="px-4 py-3">Open Price</th>
                            <th className="px-4 py-3">Close Price</th>
                            <th className="px-4 py-3">Profit</th>
                            <th className="px-4 py-3">Open Time</th>
                            <th className="px-4 py-3">Close Time</th>
                          </tr>
                        </thead>

                        <tbody>
                          {relatedTrades.map((trade) => {
                            const openDate =
                              trade?.openTimeDate ||
                              trade?.openTime ||
                              trade?.createdAt ||
                              null;

                            const closeDate =
                              trade?.closeTimeDate ||
                              trade?.closeTime ||
                              trade?.updatedAt ||
                              null;

                            return (
                              <tr
                                key={trade._id}
                                className={cx(
                                  "border-t-[1.5px] transition-colors duration-200",
                                  theme.tableRow
                                )}
                              >
                                <td className="px-4 py-4 align-top">
                                  <span
                                    className={cx(
                                      "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold",
                                      theme.chip
                                    )}
                                  >
                                    <Hash className="h-3.5 w-3.5" />
                                    {trade.positionId || "-"}
                                  </span>
                                </td>

                                <td className="px-4 py-4 align-top">
                                  <span
                                    className={cx(
                                      "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold",
                                      theme.accountChip
                                    )}
                                  >
                                    <WalletCards className="h-3.5 w-3.5" />
                                    #{trade.mt5Account || "N/A"}
                                  </span>
                                </td>

                                <td className="px-4 py-4 align-top">
                                  <span
                                    className={cx(
                                      "inline-flex rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold",
                                      theme.chip
                                    )}
                                  >
                                    {formatNumber(trade.lotSize)}
                                  </span>
                                </td>

                                <td className="px-4 py-4 align-top">
                                  <span
                                    className={cx(
                                      "inline-flex rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold",
                                      theme.bonusChip
                                    )}
                                  >
                                    {trade.symbol || "-"}
                                  </span>
                                </td>

                                <td className="px-4 py-4 align-top">
                                  <PriceCell
                                    theme={theme}
                                    type="open"
                                    value={trade.openPrice}
                                  />
                                </td>

                                <td className="px-4 py-4 align-top">
                                  <PriceCell
                                    theme={theme}
                                    type="close"
                                    value={trade.closePrice}
                                  />
                                </td>

                                <td className="px-4 py-4 align-top">
                                  <span
                                    className={cx(
                                      "inline-flex rounded-full border-[1.5px] px-3 py-1 text-xs font-bold",
                                      Number(trade.profit || 0) >= 0
                                        ? theme.profitPositive
                                        : theme.profitNegative
                                    )}
                                  >
                                    {formatNumber(trade.profit)}
                                  </span>
                                </td>

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
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BonusPayoutDetailsModal;