// Components/user/bonus/components/BonusStatCard.jsx
import React from "react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const BonusStatCard = ({ isDark, icon, label, value, helper }) => {
  const theme = {
   card: isDark
  ? "border-white/15 bg-white/[0.04] shadow-[0_16px_42px_rgba(0,0,0,0.24)] ring-1 ring-white/[0.04] hover:bg-white/[0.055]"
  : "border-orange-200/70 bg-white/90 shadow-[0_12px_30px_rgba(251,146,60,0.07)] ring-1 ring-orange-100/60 hover:border-orange-300/70 hover:bg-orange-50/25",

iconBox: isDark
  ? "border-blue-400/25 bg-blue-500/10 text-blue-300"
  : "border-orange-300/65 bg-orange-50/70 text-orange-500 shadow-[0_0_0_3px_rgba(251,146,60,0.04)]",

softBadge: isDark
  ? "border-white/15 bg-white/[0.035]"
  : "border-orange-200/70 bg-orange-50/45",

    label: isDark ? "text-white/45" : "text-slate-500",
    value: isDark ? "text-white" : "text-slate-900",
    helper: isDark ? "text-white/45" : "text-slate-500",

    // softBadge: isDark
    //   ? "border-white/10 bg-white/[0.035]"
    //   : "border-orange-100/70 bg-orange-50/35",
  };

  return (
    <div
      className={cx(
        "rounded-[24px] border p-4 transition-all duration-300",
        theme.card
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className={cx(
            "flex h-12 w-12 items-center justify-center rounded-2xl border",
            theme.iconBox
          )}
        >
          {icon}
        </div>

        <div
          className={cx(
            "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
            theme.softBadge,
            isDark ? "text-white/45" : "text-orange-500"
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