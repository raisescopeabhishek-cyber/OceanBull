import React, { useMemo } from "react";
import { useSelector } from "react-redux";

/* helpers */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) => (Number.isFinite(n) ? n : 0));
  return { r, g, b };
};
const rgba = (v: any, a = 1) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export default function DynamicLoder() {
  const themeConfig = useSelector((s: any) => s.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  return (
    <div className="flex justify-center items-center w-full">
      <div
        className="animate-spin rounded-full h-8 w-8 border-b-2"
        style={{ borderBottomColor: rgba(theme?.accent || "79 125 246", 0.95) }}
      />
    </div>
  );
}
