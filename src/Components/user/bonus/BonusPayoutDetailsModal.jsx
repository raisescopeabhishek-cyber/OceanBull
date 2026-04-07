// Components/user/bonus/BonusPayoutDetailsModal.jsx
import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { formatCurrency, formatDate, formatNumber } from "./utils/bonusHelpers";
import BonusStatusBadge from "./components/BonusStatusBadge";

const BonusPayoutDetailsModal = ({
  isDark,
  open,
  onClose,
  data,
  loading,
}) => {
  if (!open) return null;

  const payout = data?.payout || {};
  const relatedTrades = data?.relatedTrades || [];

  const modalContent = (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
      <div
        className={[
          "max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[28px] border",
          isDark
            ? "border-white/10 bg-[#0b1220] text-white"
            : "border-orange-100 bg-white text-slate-900",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center justify-between border-b px-5 py-4",
            isDark ? "border-white/10" : "border-orange-100",
          ].join(" ")}
        >
          <div>
            <h3 className="text-xl font-bold">Payout Details</h3>
            <p
              className={
                isDark ? "text-sm text-white/45" : "text-sm text-slate-500"
              }
            >
              Full trade bonus payout breakdown
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={[
              "flex h-10 w-10 items-center justify-center rounded-xl border transition",
              isDark
                ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                : "border-orange-100 bg-orange-50 hover:bg-orange-100",
            ].join(" ")}
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-white/[0.06]"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <InfoCard
                  isDark={isDark}
                  label="MT5 Account"
                  value={payout.mt5Account}
                />
                <InfoCard
                  isDark={isDark}
                  label="Total Lot"
                  value={formatNumber(payout.totalLot)}
                />
                <InfoCard
                  isDark={isDark}
                  label="Bonus Amount"
                  value={formatCurrency(payout.bonusAmount)}
                />
                <InfoCard
                  isDark={isDark}
                  label="Created At"
                  value={formatDate(payout.createdAt)}
                />
              </div>

              <div
                className={[
                  "rounded-[24px] border p-4",
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-orange-100 bg-orange-50/40",
                ].join(" ")}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <BonusStatusBadge isDark={isDark} status={payout.status} />
                  <span className="text-sm">
                    Wallet: {formatCurrency(payout.walletBefore)} →{" "}
                    {formatCurrency(payout.walletAfter)}
                  </span>
                  <span className="text-sm">
                    Range: {payout?.matchedRange?.minLot ?? "-"} -{" "}
                    {payout?.matchedRange?.maxLot ?? "-"} Lots
                  </span>
                </div>

                {payout?.note ? (
                  <p
                    className={[
                      "mt-3 text-sm",
                      isDark ? "text-white/50" : "text-slate-600",
                    ].join(" ")}
                  >
                    {payout.note}
                  </p>
                ) : null}
              </div>

              <div
                className={[
                  "rounded-[24px] border p-4",
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-orange-100 bg-orange-50/40",
                ].join(" ")}
              >
                <h4 className="mb-4 text-lg font-bold">Related Trades</h4>

                {relatedTrades.length === 0 ? (
                  <p
                    className={
                      isDark ? "text-sm text-white/45" : "text-sm text-slate-500"
                    }
                  >
                    No related trades found.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full text-left">
                      <thead>
                        <tr
                          className={[
                            "text-xs uppercase tracking-[0.16em]",
                            isDark ? "text-white/40" : "text-slate-500",
                          ].join(" ")}
                        >
                          <th className="px-4 py-3">Position ID</th>
                          <th className="px-4 py-3">MT5 Account</th>
                          <th className="px-4 py-3">Lot</th>
                          <th className="px-4 py-3">Symbol</th>
                          <th className="px-4 py-3">Profit</th>
                          <th className="px-4 py-3">Close Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relatedTrades.map((trade) => (
                          <tr
                            key={trade._id}
                            className={[
                              "border-t",
                              isDark ? "border-white/10" : "border-orange-100",
                            ].join(" ")}
                          >
                            <td className="px-4 py-4">{trade.positionId}</td>
                            <td className="px-4 py-4">{trade.mt5Account}</td>
                            <td className="px-4 py-4">
                              {formatNumber(trade.lotSize)}
                            </td>
                            <td className="px-4 py-4">{trade.symbol}</td>
                            <td className="px-4 py-4">
                              {formatNumber(trade.profit)}
                            </td>
                            <td className="px-4 py-4">
                              {formatDate(trade.closeTimeDate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

const InfoCard = ({ isDark, label, value }) => (
  <div
    className={[
      "rounded-[20px] border p-4",
      isDark
        ? "border-white/10 bg-white/[0.03]"
        : "border-orange-100 bg-orange-50/40",
    ].join(" ")}
  >
    <p
      className={
        isDark
          ? "text-xs uppercase tracking-[0.16em] text-white/45"
          : "text-xs uppercase tracking-[0.16em] text-slate-500"
      }
    >
      {label}
    </p>
    <p className="mt-2 text-base font-semibold">{value || "-"}</p>
  </div>
);

export default BonusPayoutDetailsModal;