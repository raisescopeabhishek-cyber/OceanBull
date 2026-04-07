// Components/user/bonus/components/BonusEmptyState.jsx
import React from "react";
import { Inbox } from "lucide-react";

const BonusEmptyState = ({ isDark, title = "No data found", subtitle }) => {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[24px] border border-dashed p-6 text-center">
      <div
        className={[
          "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl",
          isDark ? "bg-white/[0.05]" : "bg-orange-50",
        ].join(" ")}
      >
        <Inbox size={24} />
      </div>

      <h4 className="text-lg font-semibold">{title}</h4>
      <p
        className={[
          "mt-2 max-w-md text-sm",
          isDark ? "text-white/50" : "text-slate-600",
        ].join(" ")}
      >
        {subtitle || "Try changing filters or come back after more activity."}
      </p>
    </div>
  );
};

export default BonusEmptyState;