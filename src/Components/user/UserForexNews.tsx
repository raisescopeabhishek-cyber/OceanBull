import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Newspaper,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  Activity,
  Globe2,
  Gauge,
  Shield,
  BarChart3,
} from "lucide-react";

import Loader from "../Loader/Loader";

/* -------------------- theme helpers -------------------- */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0")
    .trim()
    .replace(/,/g, " ");
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

/* -------------------- shared ui -------------------- */
function SectionCard({
  children,
  theme,
  isDark,
  className = "",
}: {
  children: React.ReactNode;
  theme: any;
  isDark: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-[24px] border transition-all duration-300",
        className,
      ].join(" ")}
      style={{
        borderColor: isDark
          ? rgba(theme?.border || "255 255 255", 0.1)
          : "rgba(251,146,60,0.14)",
        background: isDark
          ? "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))"
          : "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,250,246,0.82))",
        boxShadow: isDark
          ? "0 18px 50px rgba(0,0,0,0.28)"
          : "0 14px 40px rgba(251,146,60,0.10)",
        backdropFilter: "blur(10px)",
      }}
    >
      {children}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  theme,
  isDark,
  tone = "default",
}: any) {
  const toneStyles =
    tone === "success"
      ? {
          iconBg: isDark ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.10)",
          iconColor: isDark ? "rgba(52,211,153,0.95)" : "rgba(5,150,105,0.95)",
          border: isDark ? "rgba(16,185,129,0.18)" : "rgba(16,185,129,0.16)",
        }
      : tone === "info"
      ? {
          iconBg: isDark ? "rgba(59,130,246,0.12)" : "rgba(249,115,22,0.10)",
          iconColor: isDark ? "rgba(96,165,250,0.95)" : "rgba(249,115,22,0.95)",
          border: isDark ? "rgba(59,130,246,0.18)" : "rgba(251,146,60,0.16)",
        }
      : tone === "warning"
      ? {
          iconBg: isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.10)",
          iconColor: isDark ? "rgba(251,191,36,0.95)" : "rgba(217,119,6,0.95)",
          border: isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.16)",
        }
      : {
          iconBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)",
          iconColor: isDark ? "rgba(255,255,255,0.88)" : "rgba(51,65,85,0.92)",
          border: isDark
            ? rgba(theme?.border || "255 255 255", 0.12)
            : "rgba(251,146,60,0.14)",
        };

  return (
    <SectionCard theme={theme} isDark={isDark} className="p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl border"
          style={{
            background: toneStyles.iconBg,
            color: toneStyles.iconColor,
            borderColor: toneStyles.border,
          }}
        >
          {icon}
        </div>

        <div>
          <div
            className="text-xs"
            style={{
              color: isDark
                ? rgba(theme?.fg || "255 255 255", 0.58)
                : "rgba(100,116,139,0.96)",
            }}
          >
            {label}
          </div>

          <div
            className="text-lg font-bold"
            style={{
              color: isDark
                ? rgba(theme?.fg || "255 255 255", 0.94)
                : "rgba(15,23,42,0.98)",
            }}
          >
            {value}
          </div>

          {hint ? (
            <div
              className="mt-1 text-[11px]"
              style={{
                color: isDark
                  ? rgba(theme?.fg || "255 255 255", 0.48)
                  : "rgba(100,116,139,0.88)",
              }}
            >
              {hint}
            </div>
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}

/* -------------------- widget -------------------- */
const TradingViewAdvancedChart = memo(function TradingViewAdvancedChart({
  isDark,
  onReady,
  radius = "18px",
}: {
  isDark: boolean;
  onReady?: () => void;
  radius?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.height = "100%";
    widget.style.width = "100%";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "FX_IDC:EURUSD",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "${isDark ? "dark" : "light"}",
        "style": "1",
        "locale": "en",
        "withdateranges": true,
        "allow_symbol_change": true,
        "save_image": false,
        "watchlist": [
          "FX_IDC:EURUSD",
          "FX_IDC:GBPUSD",
          "FX_IDC:USDJPY",
          "FX_IDC:USDCHF",
          "FX_IDC:AUDUSD",
          "FX_IDC:USDCAD"
        ],
        "support_host": "https://www.tradingview.com"
      }`;

    container.appendChild(widget);
    container.appendChild(script);

    const timer = window.setTimeout(() => {
      onReady?.();
    }, 1800);

    return () => {
      window.clearTimeout(timer);
      if (container) container.innerHTML = "";
    };
  }, [isDark, onReady]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container h-full w-full"
      style={{ borderRadius: radius, overflow: "hidden", minHeight: "520px" }}
    />
  );
});

export default function UserForexNews() {
  const [loading, setLoading] = useState(true);
  const [showStatsOverview, setShowStatsOverview] = useState(true);

  const themeConfig = useSelector((state: any) => state.user?.themeConfig);
  const mode = useSelector((state: any) => state.userTheme?.mode || "light");

  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const isDark = mode === "dark";

  const titleColor = isDark
    ? rgba(theme?.fg || "255 255 255", 0.96)
    : "rgba(15,23,42,0.98)";

  const mutedTextColor = isDark
    ? rgba(theme?.fg || "255 255 255", 0.62)
    : "rgba(100,116,139,0.96)";

  const accentColor = isDark
    ? "rgba(96,165,250,0.95)"
    : "rgba(249,115,22,0.95)";

  const iframeCardStyle: React.CSSProperties = {
    borderRadius: "22px",
    border: isDark
      ? `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`
      : "1px solid rgba(251,146,60,0.14)",
    background: isDark
      ? "rgba(255,255,255,0.03)"
      : "rgba(255,255,255,0.88)",
    overflow: "hidden",
    position: "relative",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <SectionCard theme={theme} isDark={isDark} className="overflow-hidden">
        <div
          className="border-b px-5 py-4 sm:px-6"
          style={{
            borderColor: isDark
              ? rgba(theme?.border || "255 255 255", 0.1)
              : "rgba(251,146,60,0.12)",
            background: isDark
              ? "rgba(255,255,255,0.02)"
              : "rgba(255,255,255,0.38)",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" style={{ color: accentColor }} />
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: mutedTextColor }}
                >
                  market · forex · news
                </span>
              </div>

              <h1
                className="text-3xl font-bold sm:text-4xl"
                style={{
                  color: titleColor,
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Forex News
              </h1>

              <p className="mt-2 text-sm sm:text-[15px]" style={{ color: mutedTextColor }}>
                Follow major forex pairs, market structure, and live chart-based
                activity from a clean embedded TradingView workspace.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowStatsOverview((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-[22px] border px-4 py-3 text-left transition-all duration-300"
              style={{
                borderColor: isDark
                  ? rgba(theme?.border || "255 255 255", 0.1)
                  : "rgba(251,146,60,0.14)",
                background: isDark
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(255,255,255,0.84)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border"
                  style={{
                    borderColor: isDark
                      ? rgba(theme?.border || "255 255 255", 0.12)
                      : "rgba(251,146,60,0.14)",
                    background: isDark
                      ? "rgba(59,130,246,0.10)"
                      : "rgba(255,237,213,0.65)",
                    color: accentColor,
                  }}
                >
                  <LayoutDashboard className="h-5 w-5" />
                </div>

                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: titleColor }}
                  >
                    Forex Overview
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: mutedTextColor }}
                  >
                    Symbol tracking, watchlist and embedded live chart access
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ color: mutedTextColor }}
                >
                  {showStatsOverview ? "Collapse" : "Expand"}
                </span>

                <motion.div
                  animate={{ rotate: showStatsOverview ? 0 : -180 }}
                  transition={{ duration: 0.25 }}
                >
                  {showStatsOverview ? (
                    <ChevronUp className="h-5 w-5" style={{ color: accentColor }} />
                  ) : (
                    <ChevronDown className="h-5 w-5" style={{ color: accentColor }} />
                  )}
                </motion.div>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {showStatsOverview && (
                <motion.div
                  key="stats-overview"
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                      theme={theme}
                      isDark={isDark}
                      icon={<Newspaper className="h-5 w-5" />}
                      label="Feed Type"
                      value="Advanced Chart"
                      hint="Live TradingView widget"
                      tone="info"
                    />

                    <StatCard
                      theme={theme}
                      isDark={isDark}
                      icon={<BarChart3 className="h-5 w-5" />}
                      label="Main Symbol"
                      value="EURUSD"
                      hint="Default chart pair"
                      tone="warning"
                    />

                    <StatCard
                      theme={theme}
                      isDark={isDark}
                      icon={<Globe2 className="h-5 w-5" />}
                      label="Watchlist"
                      value="6 Pairs"
                      hint="Major forex instruments"
                      tone="default"
                    />

                    <StatCard
                      theme={theme}
                      isDark={isDark}
                      icon={<Shield className="h-5 w-5" />}
                      label="Theme Sync"
                      value={isDark ? "Dark Mode" : "Light Mode"}
                      hint="Widget follows panel theme"
                      tone="success"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <SectionCard theme={theme} isDark={isDark} className="p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: isDark
                    ? "rgba(59,130,246,0.10)"
                    : "rgba(255,237,213,0.72)",
                  color: accentColor,
                }}
              >
                <Activity size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: titleColor }}>
                  Live Forex Chart
                </h3>
                <p
                  className="text-sm"
                  style={{ color: mutedTextColor }}
                >
                  Interactive TradingView chart with symbol switch and watchlist
                </p>
              </div>
            </div>

        <div style={iframeCardStyle} className="h-[72vh] min-h-[520px]">
  {loading && (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center"
      style={{
        background: isDark
          ? "rgba(2,6,23,0.68)"
          : "rgba(255,255,255,0.78)",
        backdropFilter: "blur(4px)",
      }}
    >
      <Loader />
    </div>
  )}

  <TradingViewAdvancedChart
    isDark={isDark}
    radius="22px"
    onReady={() => setLoading(false)}
  />
</div>
          </SectionCard>
        </div>
      </SectionCard>
    </motion.div>
  );
}