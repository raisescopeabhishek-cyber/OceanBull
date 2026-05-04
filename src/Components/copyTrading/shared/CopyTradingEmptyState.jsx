import React from "react";
import { Inbox } from "lucide-react";
import { cx } from "../utils/copyTradingHelpers";

const CopyTradingEmptyState = ({
  isDark,
  title = "No data found",
  subtitle = "There is no record available right now.",
  icon = null,
  minHeight = "min-h-[260px]",
}) => {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center rounded-[24px] border p-8 text-center",
        minHeight,
        isDark
          ? "border-white/10 bg-white/[0.035] text-white"
          : "border-emerald-100 bg-white/90 text-slate-900 shadow-[0_10px_26px_rgba(16,185,129,0.07)]"
      )}
    >
      <div
        className={cx(
          "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border",
          isDark
            ? "border-white/10 bg-white/[0.04] text-white/60"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
        )}
      >
        {icon || <Inbox className="h-7 w-7" />}
      </div>

      <h3 className="text-base font-bold">{title}</h3>

      <p
        className={cx(
          "mt-2 max-w-md text-sm leading-6",
          isDark ? "text-white/55" : "text-slate-500"
        )}
      >
        {subtitle}
      </p>
    </div>
  );
};

export default CopyTradingEmptyState;