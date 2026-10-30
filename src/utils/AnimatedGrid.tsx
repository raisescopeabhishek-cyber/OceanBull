import { motion } from "framer-motion";
import { useMemo } from "react";
import { useSelector } from "react-redux";

const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) =>
    (Number.isFinite(n) ? n : 0)
  );
  return { r, g, b };
};

const rgba = (v: any, a = 1) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export const AnimatedGrid = () => {
  const themeConfig = useSelector((s: any) => s.user?.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  if (!theme?.effectsEnabled) return null;
  if ((theme?.pattern || "grid") !== "grid") return null;

  const gridLine = theme?.accent || "79 125 246";
  const stripe = theme?.gradientTo || theme?.accent || "23 157 166";

  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.1,
          backgroundImage: `
            linear-gradient(${rgba(gridLine, 0.18)} 1px, transparent 1px),
            linear-gradient(90deg, ${rgba(gridLine, 0.18)} 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(120% 80% at 50% -10%, black 55%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(120% 80% at 50% -10%, black 55%, transparent 80%)",
        }}
      />

      <motion.div
        className="absolute inset-0"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        style={{
          opacity: 0.18,
          background: `repeating-linear-gradient(90deg, ${rgba(
            stripe,
            0.1
          )} 0 2px, transparent 2px 8px)`,
        }}
      />
    </div>
  );
};