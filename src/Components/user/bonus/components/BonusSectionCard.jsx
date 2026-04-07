// Components/user/bonus/components/BonusSectionCard.jsx
import React from "react";

const BonusSectionCard = ({ isDark, title, subtitle, rightSlot, children }) => {
  return (
    <div
      className={[
        "rounded-[24px] border",
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-orange-100 bg-white/80",
      ].join(" ")}
    >
      <div
        className={[
          "flex flex-col gap-4 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
          isDark ? "border-white/10" : "border-orange-100",
        ].join(" ")}
      >
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          {subtitle ? (
            <p
              className={[
                "mt-1 text-sm",
                isDark ? "text-white/50" : "text-slate-600",
              ].join(" ")}
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        {rightSlot ? <div>{rightSlot}</div> : null}
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
};

export default BonusSectionCard;