import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  CalendarDays,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  Activity,
  Globe2,
  Gauge,
  Shield,
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
          : "rgba(245,158,11,0.14)",
        background: isDark
          ? "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))"
          : "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,251,235,0.82))",
        boxShadow: isDark
          ? "0 18px 50px rgba(0,0,0,0.28)"
          : "0 14px 40px rgba(245,158,11,0.08)",
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
          iconBg: isDark ? "rgba(59,130,246,0.12)" : "rgba(245,158,11,0.08)",
          iconColor: isDark ? "rgba(96,165,250,0.95)" : "rgba(245,158,11,0.95)",
          border: isDark ? "rgba(59,130,246,0.18)" : "rgba(245,158,11,0.14)",
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
            : "rgba(245,158,11,0.14)",
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

export default function UserEconomicCalendar() {
  const [loading, setLoading] = useState(true);
  const [showStatsOverview, setShowStatsOverview] = useState(true);

  const themeConfig = useSelector((state: any) => state.user.themeConfig);
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
    : "rgba(245,158,11,0.95)";

  const heroBg = isDark
    ? "linear-gradient(135deg, rgba(30,41,59,1), rgba(15,23,42,1))"
    : "linear-gradient(135deg, #fb923c, #f59e0b)";

  const iframeCardStyle: React.CSSProperties = {
    borderRadius: "22px",
    border: isDark
      ? `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`
      : "1px solid rgba(245,158,11,0.14)",
    background: isDark
      ? "rgba(255,255,255,0.03)"
      : "rgba(255,255,255,0.88)",
    overflow: "hidden",
    position: "relative",
    boxShadow: isDark ? "none" : "0 10px 24px rgba(245,158,11,0.06)",
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
          className="relative overflow-hidden px-5 py-6 sm:px-6"
          style={{
            background: heroBg,
          }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-12 top-0 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-white" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                  market · events · calendar
                </span>
              </div>

              <h1
                className="text-3xl font-bold text-white sm:text-4xl"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Economic Calendar
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-white/80 sm:text-[15px]">
                Track high-impact economic events, market-moving announcements,
                and trading schedule data in one clean view.
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
                  : "rgba(245,158,11,0.14)",
                background: isDark
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(255,255,255,0.84)",
                boxShadow: isDark ? "none" : "0 8px 20px rgba(245,158,11,0.05)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border"
                  style={{
                    borderColor: isDark
                      ? rgba(theme?.border || "255 255 255", 0.12)
                      : "rgba(245,158,11,0.14)",
                    background: isDark
                      ? "rgba(59,130,246,0.10)"
                      : "rgba(255,251,235,0.75)",
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
                    Calendar Overview
                  </div>
                  <div className="text-xs" style={{ color: mutedTextColor }}>
                    Event coverage, impact focus and live market visibility
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
                      icon={<CalendarDays className="h-5 w-5" />}
                      label="Coverage"
                      value="Global Events"
                      hint="Major macro announcements"
                      tone="info"
                    />

                    <StatCard
                      theme={theme}
                      isDark={isDark}
                      icon={<Gauge className="h-5 w-5" />}
                      label="Impact Focus"
                      value="Low to High"
                      hint="All event importance levels"
                      tone="warning"
                    />

                    <StatCard
                      theme={theme}
                      isDark={isDark}
                      icon={<Globe2 className="h-5 w-5" />}
                      label="Source"
                      value="TradingView"
                      hint="Embedded live calendar widget"
                      tone="default"
                    />

                    <StatCard
                      theme={theme}
                      isDark={isDark}
                      icon={<Shield className="h-5 w-5" />}
                      label="Visibility"
                      value="Live Tracking"
                      hint="Instant event monitoring"
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
                    : "rgba(255,251,235,0.80)",
                  color: accentColor,
                }}
              >
                <Activity size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: titleColor }}>
                  Live Calendar Feed
                </h3>
                <p className="text-sm" style={{ color: mutedTextColor }}>
                  Embedded economic events dashboard with real-time visibility
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

              <iframe
                src='https://s.tradingview.com/embed-widget/events/?locale=en#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A%22%22%2C%22isTransparent%22%3Atrue%2C%22colorTheme%22%3A%22dark%22%2C%22importanceFilter%22%3A%22-1%2C0%2C1%22%7D'
                width="100%"
                height="100%"
                title="Forex Market Economic Calendar"
                onLoad={() => setLoading(false)}
                style={{
                  border: "none",
                  width: "100%",
                  height: "100%",
                  borderRadius: "22px",
                }}
              />
            </div>
          </SectionCard>
        </div>
      </SectionCard>
    </motion.div>
  );
}