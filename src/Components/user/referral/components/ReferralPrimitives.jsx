import React from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";

export const cx = (...classes) => classes.filter(Boolean).join(" ");

export const panelCard = (isDark, extra = "") =>
  cx(
    "rounded-card border backdrop-blur-xl","border-line bg-surface-2",
    extra
  );

export const softCard = (isDark, extra = "") =>
  cx(
    "rounded-card border","border-line bg-surface-2",
    extra
  );

export const pill = (isDark, extra = "") =>
  cx(
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]","border-line bg-primary-soft text-primary",
    extra
  );

export const inputBase = (isDark, extra = "") =>
  cx(
    "w-full rounded-card border px-4 py-3 outline-none transition-all","border-line bg-surface-2 text-text placeholder:text-subtle focus:border-line focus:bg-surface-2",
    extra
  );

export const buttonPrimary = (isDark, extra = "") =>
  cx(
    "inline-flex items-center gap-2 rounded-card px-4 py-3 text-sm font-semibold transition-all","text-text hover:scale-[1.01]",
    extra
  );

export const buttonSecondary = (isDark, extra = "") =>
  cx(
    "inline-flex items-center gap-2 rounded-card border px-4 py-3 text-sm font-semibold transition-all","border-line bg-surface-2 text-text hover:bg-surface-2",
    extra
  );

export const muted = (isDark) => ("text-subtle");
export const softMuted = (isDark) =>"text-subtle";

export const titleText = (isDark) =>"text-text";

export function StatCard({
  isDark,
  icon: Icon,
  title,
  value,
  subtitle,
  tone = "sky",
}) {
  const tones = {
    sky: {
      wrap:"to-transparent",
      icon:"border-line bg-primary-soft text-primary",
    },
    violet: {
      wrap:"via-fuchsia-500/10 to-transparent",
      icon:"border-line bg-primary-soft text-primary",
    },
    emerald: {
      wrap:"to-transparent",
      icon:"border-success bg-success-soft text-success",
    },
    amber: {
      wrap:"to-transparent",
      icon:"border-line bg-primary-soft text-primary",
    },
  };

  const theme = tones[tone] || tones.sky;

  return (
    <div
      className={cx(
        "rounded-card border p-5",
        theme.wrap,"border-line"
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className={cx(
            "flex h-12 w-12 items-center justify-center rounded-card border",
            theme.icon
          )}
        >
          <Icon size={20} />
        </div>

        <ArrowUpRight
          size={16}
          className={"text-subtle"}
        />
      </div>

      <p className={cx("text-sm font-medium", muted(isDark))}>{title}</p>
      <h3 className={cx("mt-2 text-2xl font-bold", titleText(isDark))}>
        {value}
      </h3>
      {subtitle ? (
        <p className={cx("mt-2 text-xs", softMuted(isDark))}>{subtitle}</p>
      ) : null}
    </div>
  );
}

export function EmptyState({
  isDark,
  title,
  text,
  actionLabel,
  onAction,
  loading = false,
}) {
  return (
    <div className={panelCard(isDark, "p-8 sm:p-10 text-center")}>
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-card">
        <Sparkles className={"text-primary"} />
      </div>

      <h2 className={cx("text-2xl font-bold", titleText(isDark))}>{title}</h2>
      <p className={cx("mx-auto mt-3 max-w-xl text-sm leading-7", muted(isDark))}>
        {text}
      </p>

      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          disabled={loading}
          className={buttonPrimary(isDark, "mt-6")}
        >
          {loading ? "Please wait..." : actionLabel}
        </button>
      ) : null}
    </div>
  );
}