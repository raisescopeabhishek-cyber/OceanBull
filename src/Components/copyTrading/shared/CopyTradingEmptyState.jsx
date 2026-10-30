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
        "flex flex-col items-center justify-center rounded-card border p-8 text-center",
        minHeight,"border-line bg-surface-2 text-text"
      )}
    >
      <div
        className={cx(
          "mb-4 flex h-14 w-14 items-center justify-center rounded-card border","border-line bg-surface-2 text-subtle"
        )}
      >
        {icon || <Inbox className="h-7 w-7" />}
      </div>

      <h3 className="text-base font-bold">{title}</h3>

      <p
        className={cx(
          "mt-2 max-w-md text-sm leading-6","text-subtle"
        )}
      >
        {subtitle}
      </p>
    </div>
  );
};

export default CopyTradingEmptyState;