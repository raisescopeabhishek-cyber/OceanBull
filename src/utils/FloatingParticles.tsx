import { motion } from "framer-motion";
import { useMemo } from "react";
import { useSelector } from "react-redux";

/* -------------------- theme helpers (RGB strings -> css) ------------------- */
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

export const FloatingParticles = ({ count = 20 }: { count?: number }) => {
  const themeConfig = useSelector((s: any) => s.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  // ✅ IMPORTANT: effect OFF or pattern not dots => don't render
  if (!theme?.effectsEnabled) return null;
  if ((theme?.pattern || "grid") !== "dots") return null;

  const dots = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        dur: Math.random() * 3 + 2,
        delay: Math.random() * 2,
      })),
    [count]
  );

  const c = theme?.accent || "59 130 246";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: 4,
            height: 4,
            background: rgba(c, 0.9),
            boxShadow: `0 0 18px ${rgba(c, 0.20)}`,
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -110, opacity: [0, 1, 0] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay }}
        />
      ))}
    </div>
  );
};
