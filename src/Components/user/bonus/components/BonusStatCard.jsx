// Components/user/bonus/components/BonusStatCard.jsx
import React from "react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const BonusStatCard = ({ isDark, icon, label, value, helper }) => {
  const theme = {
   card:"border-line bg-surface-2 ring-1 ring-line hover:bg-surface-2",

iconBox:"border-line bg-primary-soft text-primary",

softBadge:"border-line bg-surface-2",

    label:"text-subtle",
    value:"text-text",
    helper:"text-subtle",

    // softBadge: isDark
    //   ? "border-line bg-surface-2"
    //   : "border-line bg-surface-2",
  };

  return (
    <div
      className={cx(
        "rounded-card border p-4 transition-all duration-300",
        theme.card
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className={cx(
            "flex h-12 w-12 items-center justify-center rounded-card border",
            theme.iconBox
          )}
        >
          {icon}
        </div>

        <div
          className={cx(
            "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
            theme.softBadge,"text-subtle"
          )}
        >
          Bonus
        </div>
      </div>

      <p
        className={cx(
          "text-xs font-semibold uppercase tracking-[0.16em]",
          theme.label
        )}
      >
        {label}
      </p>

      <div className={cx("mt-2 text-2xl font-bold", theme.value)}>{value}</div>

      {helper ? (
        <p className={cx("mt-2 text-sm leading-6", theme.helper)}>{helper}</p>
      ) : null}
    </div>
  );
};

export default BonusStatCard;