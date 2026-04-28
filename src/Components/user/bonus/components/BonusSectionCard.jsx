// Components/user/bonus/components/BonusSectionCard.jsx
import React from "react";
import { Sparkles } from "lucide-react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const BonusSectionCard = ({ isDark, title, subtitle, rightSlot, children }) => {
  const theme = {
    card: isDark
  ? "border-white/15 bg-white/[0.035] shadow-[0_16px_42px_rgba(0,0,0,0.24)] ring-1 ring-white/[0.04]"
  : "border-orange-200/70 bg-white/90 shadow-[0_12px_30px_rgba(251,146,60,0.07)] ring-1 ring-orange-100/60",

headerBorder: isDark ? "border-white/15" : "border-orange-200/65",

icon: isDark
  ? "border-blue-400/25 bg-blue-500/10 text-blue-300"
  : "border-orange-300/65 bg-orange-50/70 text-orange-500",

    headerBg: isDark
      ? "bg-white/[0.018]"
      : "bg-gradient-to-r from-orange-50/35 via-white/60 to-white/30",

    title: isDark ? "text-white" : "text-slate-900",

    subtitle: isDark ? "text-white/50" : "text-slate-500",

    // icon: isDark
    //   ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
    //   : "border-orange-200/70 bg-orange-50/60 text-orange-500",
  };

  return (
    <div
      className={cx(
        "overflow-hidden rounded-[24px] border transition-all duration-300",
        theme.card
      )}
    >
      <div
        className={cx(
          "flex flex-col gap-4 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
          theme.headerBorder,
          theme.headerBg
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cx(
              "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border",
              theme.icon
            )}
          >
            <Sparkles className="h-4 w-4" />
          </div>

          <div>
            <h3 className={cx("text-lg font-bold", theme.title)}>{title}</h3>

            {subtitle ? (
              <p className={cx("mt-1 text-sm leading-6", theme.subtitle)}>
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
};

export default BonusSectionCard;