import React from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";

export const cx = (...classes) => classes.filter(Boolean).join(" ");

export const panelCard = (isDark, extra = "") =>
  cx(
    "rounded-[28px] border backdrop-blur-xl",
    isDark
      ? "border-white/10 bg-white/[0.035] shadow-[0_20px_70px_-30px_rgba(0,0,0,0.75)]"
      : "border-sky-100/80 bg-white/80 shadow-[0_20px_70px_-30px_rgba(14,165,233,0.24)]",
    extra
  );

export const softCard = (isDark, extra = "") =>
  cx(
    "rounded-[24px] border",
    isDark ? "border-white/10 bg-white/[0.04]" : "border-sky-100 bg-sky-50/60",
    extra
  );

export const pill = (isDark, extra = "") =>
  cx(
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
    isDark
      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
      : "border-cyan-200 bg-cyan-50 text-cyan-700",
    extra
  );

export const inputBase = (isDark, extra = "") =>
  cx(
    "w-full rounded-2xl border px-4 py-3 outline-none transition-all",
    isDark
      ? "border-white/10 bg-white/[0.05] text-white placeholder:text-white/35 focus:border-cyan-400/40 focus:bg-white/[0.07]"
      : "border-sky-100 bg-white text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:bg-sky-50/50",
    extra
  );

export const buttonPrimary = (isDark, extra = "") =>
  cx(
    "inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
    isDark
      ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 text-slate-950 hover:scale-[1.01]"
      : "bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600 text-white hover:scale-[1.01]",
    extra
  );

export const buttonSecondary = (isDark, extra = "") =>
  cx(
    "inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all",
    isDark
      ? "border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.09]"
      : "border-sky-100 bg-white text-slate-700 hover:bg-sky-50",
    extra
  );

export const muted = (isDark) => (isDark ? "text-white/60" : "text-slate-600");
export const softMuted = (isDark) =>
  isDark ? "text-white/40" : "text-slate-500";

export const titleText = (isDark) =>
  isDark ? "text-white" : "text-slate-900";

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
      wrap: isDark
        ? "from-cyan-400/20 via-blue-500/10 to-transparent"
        : "from-sky-100 via-cyan-50 to-transparent",
      icon: isDark
        ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
        : "border-sky-200 bg-sky-100 text-sky-700",
    },
    violet: {
      wrap: isDark
        ? "from-violet-400/20 via-fuchsia-500/10 to-transparent"
        : "from-violet-100 via-fuchsia-50 to-transparent",
      icon: isDark
        ? "border-violet-400/20 bg-violet-400/10 text-violet-200"
        : "border-violet-200 bg-violet-100 text-violet-700",
    },
    emerald: {
      wrap: isDark
        ? "from-emerald-400/20 via-teal-500/10 to-transparent"
        : "from-emerald-100 via-teal-50 to-transparent",
      icon: isDark
        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
        : "border-emerald-200 bg-emerald-100 text-emerald-700",
    },
    amber: {
      wrap: isDark
        ? "from-amber-400/20 via-orange-500/10 to-transparent"
        : "from-amber-100 via-orange-50 to-transparent",
      icon: isDark
        ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
        : "border-amber-200 bg-amber-100 text-amber-700",
    },
  };

  const theme = tones[tone] || tones.sky;

  return (
    <div
      className={cx(
        "rounded-[24px] border bg-gradient-to-br p-5",
        theme.wrap,
        isDark ? "border-white/10" : "border-sky-100"
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className={cx(
            "flex h-12 w-12 items-center justify-center rounded-2xl border",
            theme.icon
          )}
        >
          <Icon size={20} />
        </div>

        <ArrowUpRight
          size={16}
          className={isDark ? "text-white/35" : "text-slate-400"}
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
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20">
        <Sparkles className={isDark ? "text-cyan-200" : "text-sky-700"} />
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