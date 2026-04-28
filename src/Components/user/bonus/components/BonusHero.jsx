// Components/user/bonus/components/BonusHero.jsx
import React from "react";
import { WalletCards, Sparkles } from "lucide-react";

const BonusHero = ({ isDark, title, subtitle, rightContent }) => {
  return (
    <div
      className={[
        "relative overflow-hidden border-b px-5 py-5 sm:px-6 sm:py-6",
        isDark
          ? "border-white/10 bg-white/[0.012]"
          : "border-orange-100/70 bg-gradient-to-r from-orange-50/25 via-white/50 to-white/30",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(circle at top left, rgba(59,130,246,0.10), transparent 34%)"
            : "radial-gradient(circle at top left, rgba(251,146,60,0.10), transparent 34%), radial-gradient(circle at bottom right, rgba(255,237,213,0.20), transparent 34%)",
        }}
      />

      <div className="relative z-[1] flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div
            className={[
              "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
              isDark
                ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                : "border-orange-200/70 bg-orange-50/60 text-orange-600 shadow-[0_0_0_3px_rgba(251,146,60,0.035)]",
            ].join(" ")}
          >
            <Sparkles size={14} />
            Bonus Wallet Center
          </div>

          <h1
            className={[
              "text-2xl font-bold sm:text-3xl",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            {title}
          </h1>

          <p
            className={[
              "mt-2 max-w-3xl text-sm leading-6 sm:text-[15px]",
              isDark ? "text-white/55" : "text-slate-500",
            ].join(" ")}
          >
            {subtitle}
          </p>
        </div>

        <div
          className={[
            "flex items-center gap-4 rounded-[24px] border px-4 py-4 transition-all duration-300",
            isDark
              ? "border-white/10 bg-white/[0.04]"
              : "border-orange-100/70 bg-white/80 shadow-[0_12px_30px_rgba(251,146,60,0.06)]",
          ].join(" ")}
        >
          <div
            className={[
              "flex h-14 w-14 items-center justify-center rounded-2xl border",
              isDark
                ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                : "border-orange-200/70 bg-orange-50/65 text-orange-500 shadow-[0_0_0_3px_rgba(251,146,60,0.04)]",
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