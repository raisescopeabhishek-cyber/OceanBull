// Components/user/bonus/components/BonusStatusBadge.jsx
import React from "react";
import { getStatusTone } from "../utils/bonusHelpers";

const toneClasses = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
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