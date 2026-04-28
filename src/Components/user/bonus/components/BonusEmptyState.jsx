// Components/user/bonus/components/BonusEmptyState.jsx
import React from "react";
import { Inbox } from "lucide-react";

const BonusEmptyState = ({ isDark, title = "No data found", subtitle }) => {
  return (
    <div
      className={[
        "flex min-h-[240px] flex-col items-center justify-center rounded-[24px] border border-dashed p-6 text-center transition-all duration-300",
       isDark
  ? "border-white/15 bg-white/[0.025] ring-1 ring-white/[0.04]"
  : "border-orange-200/75 bg-orange-50/25 ring-1 ring-orange-100/60"
      ].join(" ")}
    >
      <div
        className={[
          "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border",
          isDark
            ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
            : "border-orange-200/70 bg-orange-50/65 text-orange-500 shadow-[0_0_0_3px_rgba(251,146,60,0.04)]",
        ].join(" ")}
      >
        <Inbox size={24} />
      </div>

      <h4
        className={[
          "text-lg font-semibold",
          isDark ? "text-white" : "text-slate-900",
        ].join(" ")}
      >
        {title}
      </h4>

      <p
        className={[
          "mt-2 max-w-md text-sm leading-6",
          isDark ? "text-white/50" : "text-slate-500",
        ].join(" ")}
      >
        {subtitle || "Try changing filters or come back after more activity."}
      </p>
    </div>
  );
};

export default BonusEmptyState;