import React, { useMemo, useState, type CSSProperties } from "react";
import { useSelector } from "react-redux";
import Loader from "../Loader/Loader";
import ModernHeading from "../lib/ModernHeading";
import { FloatingParticles } from "../../utils/FloatingParticles";
import { AnimatedGrid } from "../../utils/AnimatedGrid";

/* -------------------- theme helpers (RGB strings -> css) ------------------- */
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

export default function UserEconomicCalendar() {
  const [loading, setLoading] = useState(true);

  // ✅ dynamic theme (same as LoginLogs / UserReferal)
  const themeConfig = useSelector((state: any) => state.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const radius = theme?.radius || "14px";

  const pageBgStyle: CSSProperties = {
    minHeight: "100vh",
    padding: "40px",
    position: "relative",
    overflow: "hidden",
    background: `radial-gradient(1200px 600px at 18% 0%, ${rgba(theme?.glow || theme?.accent, 0.16)}, transparent 60%),
                 radial-gradient(900px 480px at 82% 12%, ${rgba(theme?.gradientTo || theme?.accent, 0.12)}, transparent 55%),
                 linear-gradient(135deg, ${rgb(theme?.bg || "0 0 0")}, ${rgb(theme?.surface1 || theme?.bg || "0 0 0")}, ${rgb(
      theme?.bg || "0 0 0"
    )})`,
    color: rgb(theme?.fg || "255 255 255"),
  };

  const cardStyle: CSSProperties = {
    borderRadius: "22px",
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    background: `linear-gradient(135deg,
      ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.72)},
      ${rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.78)},
      ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.72)})`,
    boxShadow: `0 18px 70px ${rgba(theme?.shadowColor || "0 0 0", 0.55)}`,
    backdropFilter: "blur(16px)",
  };

  const panelStyle: CSSProperties = {
    borderRadius: radius,
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12)}`,
    background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.16),
  };

  return (
    <div style={pageBgStyle}>
      <AnimatedGrid />
      <FloatingParticles />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="py-2 mb-4">
          <ModernHeading text={"Economic Calendar"} />
        </div>

        <div className="w-full flex flex-col items-center h-[calc(100vh-140px)] relative" style={cardStyle}>
          {loading && (
            <div className="absolute inset-0 flex justify-center items-center" style={{ borderRadius: "22px" }}>
              <Loader />
            </div>
          )}

          <div className="w-full h-full p-4 flex flex-col justify-center items-center" style={panelStyle}>
            <iframe
              src='https://s.tradingview.com/embed-widget/events/?locale=en#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A%22%22%2C%22isTransparent%22%3Atrue%2C%22colorTheme%22%3A%22dark%22%2C%22importanceFilter%22%3A%22-1%2C0%2C1%22%7D'
              width="100%"
              height="100%"
              className="w-full h-full rounded-xl"
              title="Forex Market Economic Calendar"
              onLoad={() => setLoading(false)}
              style={{
                border: "none",
                borderRadius: radius,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
