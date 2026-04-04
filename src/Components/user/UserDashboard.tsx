import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import UserDashboardBalanceCards from "./dashboard/UserDashboardCards";
import UseUserHook from "../../hooks/user/UseUserHook";
import UserDashboardTransaction from "./dashboard/UserDashboardTransaction";
import UserDashboardTradeHistory from "./dashboard/UserDashboardTradeHistory";
import { motion } from "framer-motion";
import { FloatingParticles } from "../../utils/FloatingParticles";
import { AnimatedGrid } from "../../utils/AnimatedGrid";

/* -------------------- theme helpers (RGB strings -> css) ------------------- */
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

/* --- Ticker (theme driven) --- */
const Ticker = ({ items, theme }: { items: any[]; theme: any }) => {
  const border = `1px solid ${rgba(
    theme?.border || theme?.inputBorder || "255 255 255",
    0.14
  )}`;

  const bg = `linear-gradient(90deg,
    ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.55)},
    ${rgba(theme?.bg || "0 0 0", 0.55)},
    ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.55)}
  )`;

  const stripeC = theme?.accent || "59 130 246";
  const pos = theme?.success || theme?.primary || "34 197 94";
  const neg = theme?.danger || "244 63 94";

  return (
    <div
      className="relative overflow-hidden rounded-2xl backdrop-blur-md"
      style={{ border, background: bg }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.1,
          backgroundImage: `repeating-linear-gradient(90deg, ${rgba(
            stripeC,
            0.18
          )} 0 2px, transparent 2px 8px)`,
        }}
      />

      <div className="whitespace-nowrap animate-[marquee_24s_linear_infinite] py-2">
        {items.map((c, i) => {
          const up = c.change24h >= 0;
          const cMain = up ? pos : neg;

          return (
            <span
              key={c.symbol + i}
              className="inline-flex items-center mx-4 gap-2 text-sm"
            >
              <span
                className="font-mono"
                style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.75) }}
              >
                {c.symbol}
              </span>

              <span
                className="font-semibold"
                style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}
              >
                {c.price.toLocaleString()}
              </span>

              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: rgba(cMain, 0.14),
                  border: `1px solid ${rgba(cMain, 0.28)}`,
                  color: rgba(cMain, 0.92),
                }}
              >
                {up ? "▲" : "▼"} {Math.abs(c.change24h).toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>

      {/* keyframes */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default function UserDashboard() {
  const { getUpdateLoggedUser } = UseUserHook();

  // ✅ dynamic theme from redux
  const themeConfig = useSelector((state: any) => state.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const trendingCoins = useMemo(
    () => [
      { symbol: "BTCUSDT", name: "Bitcoin", price: 61234.12, change24h: 2.14 },
      { symbol: "ETHUSDT", name: "Ethereum", price: 2431.78, change24h: -0.86 },
      { symbol: "SOLUSDT", name: "Solana", price: 162.45, change24h: 4.21 },
      { symbol: "XRPUSDT", name: "XRP", price: 0.62, change24h: 1.37 },
      { symbol: "DOGEUSDT", name: "Dogecoin", price: 0.146, change24h: -2.05 },
      { symbol: "ADAUSDT", name: "Cardano", price: 0.48, change24h: 0.72 },
      { symbol: "ARBUSDT", name: "Arbitrum", price: 1.24, change24h: -1.23 },
    ],
    []
  );


  useEffect(() => {
    const run = async () => {
      try {
        // await getUpdateLoggedUser();
      } catch (e) {
        console.error("Dashboard init:", e);
      }
    };
    run();
    const id = setInterval(run, 3000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ page bg (same pattern like LoginLogs)
  const pageBgStyle = {
    minHeight: "100vh",
    background: `radial-gradient(1200px 600px at 18% 0%, ${rgba(
      theme?.glow || theme?.accent,
      0.16
    )}, transparent 60%),
                 radial-gradient(900px 480px at 82% 12%, ${rgba(
                   theme?.gradientTo || theme?.accent,
                   0.12
                 )}, transparent 55%),
                 linear-gradient(135deg, ${rgb(
                   theme?.bg || "0 0 0"
                 )}, ${rgb(theme?.surface1 || theme?.bg || "0 0 0")}, ${rgb(
      theme?.bg || "0 0 0"
    )})`,
    color: "",
  } as React.CSSProperties;

  return (
    <motion.div
      className="p-4 md:p-6 pb-10 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      This Feature is Comming Soon.. please visit other sections
      <FloatingParticles />
      <AnimatedGrid />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-4">
          <Ticker items={[...trendingCoins, ...trendingCoins]} theme={theme} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <UserDashboardBalanceCards />
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 grid-cols-1 gap-6 mt-6 mb-20"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <UserDashboardTransaction />
          <UserDashboardTradeHistory />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
