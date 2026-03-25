import { motion } from "framer-motion";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import "./ModernHeading.css";

const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) =>
    Number.isFinite(n) ? n : 0
  );
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

type Props = {
  text: string;
  animate?: boolean;
  showUnderline?: boolean;
  className?: string;                 // ✅ add
  wrapperStyle?: React.CSSProperties;  // ✅ add
  textStyle?: React.CSSProperties;     // ✅ add
};

export default function ModernHeading({
  text,
  animate = true,
  showUnderline = true,
  className = "",
  wrapperStyle,
  textStyle,
}: Props) {
  const themeConfig = useSelector((s: any) => s.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const from = theme?.gradientFrom || theme?.accent || "59 130 246";
  const to = theme?.gradientTo || theme?.primary || "147 51 234";
  const mid = theme?.accent || from;

  const h1CommonStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(90deg, ${rgb(from)}, ${rgb(mid)}, ${rgb(to)})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    textShadow: `0 10px 40px ${rgba(theme?.glow || from, 0.12)}`,
    ...textStyle,
  };

  return (
    <div className="modern-heading relative inline-block" style={wrapperStyle}>
      <motion.h1
        initial={animate ? { y: 30, opacity: 0 } : false}
        animate={animate ? { y: 0, opacity: 1 } : undefined}
        transition={animate ? { duration: 0.8, ease: "easeOut" } : undefined}
        className={`heading-text ${className}`}   // ✅ merge tailwind classes
        style={h1CommonStyle}
      >
        {text}
        <span className="heading-shine" />
      </motion.h1>

      {showUnderline && (
        <motion.div
          initial={animate ? { scaleX: 0 } : false}
          animate={animate ? { scaleX: 1 } : undefined}
          transition={animate ? { duration: 0.8, delay: 0.4, ease: "easeOut" } : undefined}
          className="heading-underline"
        >
          <svg width="100%" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
            <path d="M0,8 C25,0 75,0 100,8" fill="none" stroke="url(#neonGradient)" strokeWidth="2" className="neon-path" />
            <defs>
              <linearGradient id="neonGradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={rgb(from)} />
                <stop offset="50%" stopColor={rgb(mid)} />
                <stop offset="100%" stopColor={rgb(to)} />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      )}
    </div>
  );
}
