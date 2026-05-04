import React from "react";
import { cx } from "../utils/copyTradingHelpers";

const CopyTradingTable = ({
  isDark,
  columns = [],
  rows = [],
  renderRow,
  minWidth = "1000px",
  emptyTitle = "No data found",
  emptySubtitle = "There is no record available right now.",
  footer = null,
}) => {
  const colSpan = Math.max(columns.length, 1);

  return (
    <div
      className={cx(
        "overflow-hidden rounded-[22px] border",
        isDark
          ? "border-white/10 bg-white/[0.025]"
          : "border-emerald-100 bg-white/90 shadow-[0_10px_26px_rgba(16,185,129,0.07)]"
      )}
    >
      <div className="max-w-full overflow-x-auto">
        <table
          className="w-full text-left text-sm"
          style={{
            minWidth,
          }}
        >
          <thead>
            <tr
              className={cx(
                "border-b text-xs uppercase tracking-[0.16em]",
                isDark
                  ? "border-white/10 bg-white/[0.035] text-white/45"
                  : "border-emerald-100 bg-emerald-50/80 text-slate-500"
              )}
            >
              {columns.map((column) => (
                <th key={column} className="whitespace-nowrap px-4 py-3">
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((row, index) => renderRow(row, index))
            ) : (
              <tr>
                <td colSpan={colSpan} className="px-4 py-10 text-center">
                  <div
                    className={cx(
                      "mx-auto max-w-md rounded-2xl border p-6",
                      isDark
                        ? "border-white/10 bg-white/[0.025] text-white"
                        : "border-emerald-100 bg-emerald-50/40 text-slate-900"
                    )}
                  >
                    <p className="text-sm font-black">{emptyTitle}</p>
                    <p
                      className={cx(
                        "mt-1 text-xs leading-5",
                        isDark ? "text-white/50" : "text-slate-500"
                      )}
                    >
                      {emptySubtitle}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

          {footer && <tfoot>{footer}</tfoot>}
        </table>
      </div>
    </div>
  );
};

export default CopyTradingTable;