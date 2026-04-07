// Components/user/bonus/components/BonusStatCard.jsx
import React from "react";

const BonusStatCard = ({ isDark, icon, label, value, helper }) => {
  return (
    <div
      className={[
        "rounded-[24px] border p-4",
        isDark
          ? "border-white/10 bg-white/[0.04]"
          : "border-orange-100 bg-white/80",
      ].join(" ")}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400/20 to-amber-300/20">
        {icon}
      </div>

      <p
        className={[
          "text-xs font-semibold uppercase tracking-[0.16em]",
          isDark ? "text-white/45" : "text-slate-500",
        ].join(" ")}
      >
        {label}
      </p>

      <div className="mt-2 text-2xl font-bold">{value}</div>

      {helper ? (
        <p
          className={[
            "mt-2 text-sm",
            isDark ? "text-white/45" : "text-slate-500",
          ].join(" ")}
        >
          {helper}
        </p>
      ) : null}
    </div>
  );
};

export default BonusStatCard;