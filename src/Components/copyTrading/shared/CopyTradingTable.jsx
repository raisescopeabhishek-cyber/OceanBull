import React from "react";
import { cx } from "../utils/copyTradingHelpers";

const CopyTradingTable = ({
  isDark,
  columns = [],
  rows = [],
  renderRow,
  minWidth = "1000px",
}) => {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-[22px] border",
        isDark
          ? "border-white/10 bg-white/[0.025]"
          : "border-emerald-100 bg-white/90 shadow-[0_10px_26px_rgba(16,185,129,0.07)]"
      )}
    >
      <div className="overflow-x-auto">
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
                <th key={column} className="px-4 py-3">
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => renderRow(row, index))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CopyTradingTable;