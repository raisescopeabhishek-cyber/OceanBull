// Components/user/bonus/components/BonusEmptyState.jsx
import React from "react";
import { Inbox } from "lucide-react";

const BonusEmptyState = ({ isDark, title = "No data found", subtitle }) => {
  return (
    <div
      className={[
        "flex min-h-[240px] flex-col items-center justify-center rounded-card border border-dashed p-6 text-center transition-all duration-300","border-line bg-surface-2 ring-1 ring-line"
      ].join(" ")}
    >
      <div
        className={[
          "mb-4 flex h-14 w-14 items-center justify-center rounded-card border","border-line bg-primary-soft text-primary",
        ].join(" ")}
      >
        <Inbox size={24} />
      </div>

      <h4
        className={[
          "text-lg font-semibold","text-text",
        ].join(" ")}
      >
        {title}
      </h4>

      <p
        className={[
          "mt-2 max-w-md text-sm leading-6","text-subtle",
        ].join(" ")}
      >
        {subtitle || "Try changing filters or come back after more activity."}
      </p>
    </div>
  );
};

export default BonusEmptyState;