// Components/user/bonus/components/BonusHero.jsx
import React from "react";
import { WalletCards, Sparkles } from "lucide-react";

const BonusHero = ({ isDark, title, subtitle, rightContent }) => {
  return (
    <div
      className={[
        "relative overflow-hidden border-b px-5 py-5 sm:px-6 sm:py-6",
        isDark ? "border-white/10" : "border-orange-100",
      ].join(" ")}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div
            className={[
              "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
              isDark
                ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                : "border-orange-200 bg-orange-50 text-orange-700",
            ].join(" ")}
          >
            <Sparkles size={14} />
            Bonus Wallet Center
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>

          <p
            className={[
              "mt-2 max-w-3xl text-sm sm:text-[15px]",
              isDark ? "text-white/55" : "text-slate-600",
            ].join(" ")}
          >
            {subtitle}
          </p>
        </div>

        <div
          className={[
            "flex items-center gap-4 rounded-[24px] border px-4 py-4",
            isDark
              ? "border-white/10 bg-white/[0.04]"
              : "border-orange-100 bg-white/80",
          ].join(" ")}
        >
          <div
            className={[
              "flex h-14 w-14 items-center justify-center rounded-2xl",
              isDark ? "bg-blue-500/10 text-blue-200" : "bg-orange-100 text-orange-700",
            ].join(" ")}
          >
            <WalletCards size={24} />
          </div>

          <div>{rightContent}</div>
        </div>
      </div>
    </div>
  );
};

export default BonusHero;