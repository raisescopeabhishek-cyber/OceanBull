// src/pages/theme/utils/themeMisc.js

export const genId = () => `theme_${Date.now()}_${Math.random().toString(16).slice(2)}`;

export const normalizeBoolean = (v, fallback = true) => {
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return fallback;
};

export const normalizePattern = (v) => {
  const s = String(v || "").toLowerCase();
  if (s === "grid" || s === "dots" || s === "none") return s;
  return "grid";
};
