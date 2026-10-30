// Components/user/bonus/components/BonusStatusBadge.jsx
import React from "react";
import { getStatusTone } from "../utils/bonusHelpers";

const toneClasses = {
  success:
    "border-success bg-success-soft text-success shadow-[0_0_0_3px_rgba(16,185,129,0.04)]",
  danger:
    "border-danger bg-danger-soft text-danger shadow-[0_0_0_3px_rgba(244,63,94,0.04)]",
  warning:
    "border-line bg-surface-2 text-primary shadow-[0_0_0_3px_rgba(42,86,220,0.06)]",
  neutral:
    "border-line bg-surface-2 text-muted shadow-[0_0_0_3px_rgba(42,86,220,0.05)]",
};

const darkToneClasses = {
  success: "border-success bg-success-soft text-success",
  danger: "border-danger bg-danger-soft text-danger",
  warning: "border-line bg-primary-soft text-primary",
  neutral: "border-line bg-surface-2 text-muted",
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