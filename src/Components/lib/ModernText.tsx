import React, { useMemo } from "react";
import { useSelector } from "react-redux";

/* helpers */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) => (Number.isFinite(n) ? n : 0));
  return { r, g, b };
};
const rgb = (v: any) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgb(${r}, ${g}, ${b})`;
};
const rgba = (v: any, a = 1) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export default function ModernText({ text }: { text: string }) {
  const themeConfig = useSelector((s: any) => s.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  return (
    <h1
      className="font-bold text-lg sm:text-xl md:text-2xl text-transparent bg-clip-text"
      style={{
        backgroundImage: `linear-gradient(90deg,
          ${rgb(theme?.gradientFrom || theme?.accent || "59 130 246")},
          ${rgb(theme?.gradientTo || "147 51 234")}
        )`,
        textShadow: `0 10px 40px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.15)}`,
      }}
    >
      {text}
    </h1>
  );
}
