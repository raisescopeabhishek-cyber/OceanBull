// Components/user/bonus/components/BonusStatusBadge.jsx
import React from "react";
import { getStatusTone } from "../utils/bonusHelpers";

const toneClasses = {
  success:
    "border-emerald-100 bg-emerald-50/80 text-emerald-700 shadow-[0_0_0_3px_rgba(16,185,129,0.04)]",
  danger:
    "border-rose-100 bg-rose-50/80 text-rose-700 shadow-[0_0_0_3px_rgba(244,63,94,0.04)]",
  warning:
    "border-amber-100 bg-amber-50/80 text-amber-700 shadow-[0_0_0_3px_rgba(245,158,11,0.04)]",
  neutral:
    "border-orange-100/80 bg-orange-50/45 text-slate-600 shadow-[0_0_0_3px_rgba(251,146,60,0.035)]",
};

const darkToneClasses = {
  success: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
  danger: "border-rose-400/20 bg-rose-500/10 text-rose-200",
  warning: "border-amber-400/20 bg-amber-500/10 text-amber-200",
  neutral: "border-white/10 bg-white/[0.05] text-white/70",
};

const BonusStatusBadge = ({ isDark, status }) => {
  const tone = getStatusTone(status);

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
        isDark ? darkToneClasses[tone] : toneClasses[tone],
      ].join(" ")}
    >
      {status || "unknown"}
    </span>
  );
};

export default BonusStatusBadge;