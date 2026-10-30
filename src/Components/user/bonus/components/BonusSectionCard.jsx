// Components/user/bonus/components/BonusSectionCard.jsx
import React from "react";
import { Sparkles } from "lucide-react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const BonusSectionCard = ({ isDark, title, subtitle, rightSlot, children }) => {
  const theme = {
    card:"border-line bg-surface-2 ring-1 ring-line",

headerBorder:"border-line",

icon:"border-line bg-primary-soft text-primary",

    headerBg:"bg-surface-2",

    title:"text-text",

    subtitle:"text-subtle",

    // icon: isDark
    //   ? "border-line bg-primary-soft text-primary"
    //   : "border-line bg-surface-2 text-primary",
  };

  return (
    <div
      className={cx(
        "overflow-hidden rounded-card border transition-all duration-300",
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
              "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-card border",
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