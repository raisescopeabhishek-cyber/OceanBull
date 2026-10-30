// Components/user/bonus/components/BonusHero.jsx
import React from "react";
import { WalletCards, Sparkles } from "lucide-react";

const BonusHero = ({ isDark, title, subtitle, rightContent }) => {
  return (
    <div
      className={[
        "relative overflow-hidden border-b px-5 py-5 sm:px-6 sm:py-6","border-line bg-surface-2",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(circle at top left, rgba(79, 125, 246,0.10), transparent 34%)"
            : "radial-gradient(circle at top left, rgba(79, 125, 246,0.10), transparent 34%), radial-gradient(circle at bottom right, rgba(255,237,213,0.20), transparent 34%)",
        }}
      />

      <div className="relative z-[1] flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div
            className={[
              "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]","border-line bg-primary-soft text-primary",
            ].join(" ")}
          >
            <Sparkles size={14} />
            Bonus Wallet Center
          </div>

          <h1
            className={[
              "text-2xl font-bold sm:text-3xl","text-text",
            ].join(" ")}
          >
            {title}
          </h1>

          <p
            className={[
              "mt-2 max-w-3xl text-sm leading-6 sm:text-[15px]","text-subtle",
            ].join(" ")}
          >
            {subtitle}
          </p>
        </div>

        <div
          className={[
            "flex items-center gap-4 rounded-card border px-4 py-4 transition-all duration-300","border-line bg-surface-2",
          ].join(" ")}
        >
          <div
            className={[
              "flex h-14 w-14 items-center justify-center rounded-card border","border-line bg-primary-soft text-primary",
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