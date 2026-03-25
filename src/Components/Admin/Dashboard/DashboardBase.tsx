import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { adminApi } from "../../../../src/utils/apiClients.js";

import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import {
  Users as UsersIcon,
  UserCheck,
  UserX,
  MailCheck,
  MailX,
  Wallet,
  Banknote,
  CreditCard,
  ArrowDownRight,
  TrendingUp,
  Info as InfoIcon,
} from "lucide-react";

/* -------------------------------- helpers --------------------------------- */
const monthsNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatNumber = (n) => (n || n === 0 ? Number(n).toLocaleString() : "-");
const formatMoney = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n || 0));

const normalizeMonthly = (row) => {
  if (row == null) return 0;
  if (typeof row === "number") return row;
  return Number(row.total ?? row.amount ?? row.value ?? row.approved ?? 0);
};

const pctChange = (arr) => {
  if (!Array.isArray(arr) || arr.length < 2) return 0;
  const prev = Number(arr[arr.length - 2]) || 0;
  const last = Number(arr[arr.length - 1]) || 0;
  if (prev === 0) return 0;
  return ((last - prev) / Math.abs(prev)) * 100;
};

const safeRgbParts = (v) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) => (Number.isFinite(n) ? n : 0));
  return { r, g, b };
};

const rgba = (v, a = 1) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const rgb = (v) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgb(${r}, ${g}, ${b})`;
};

/* --------------------------- FX vibe background --------------------------- */
const FloatingParticles = ({ theme }) => {
  const particleColor = theme?.primary || theme?.accent || "34 197 94";
  const enabled = theme?.effectsEnabled !== false;
  if (!enabled) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: rgba(particleColor, 0.9),
            boxShadow: `0 0 12px ${rgba(theme?.glow || theme?.accent || particleColor, 0.35)}`,
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -100, opacity: [0, 1, 0] }}
          transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}
    </div>
  );
};

const AnimatedGrid = ({ theme }) => {
  const enabled = theme?.effectsEnabled !== false;
  const pattern = theme?.pattern || "grid";
  if (!enabled || pattern !== "grid") return null;

  const gridStroke = theme?.accent || "59 130 246";
  const scanStroke = theme?.ring || theme?.accent || "59 130 246";

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.12,
          backgroundImage: `linear-gradient(${rgba(gridStroke, 0.22)} 1px, transparent 1px),
                            linear-gradient(90deg, ${rgba(gridStroke, 0.22)} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(120% 80% at 50% -10%, black 55%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(120% 80% at 50% -10%, black 55%, transparent 80%)",
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: 0.18,
          background: `repeating-linear-gradient(90deg, ${rgba(scanStroke, 0.14)} 0 2px, transparent 2px 8px)`,
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

/* --------------------------------- UI base -------------------------------- */
const Card = ({ children, className = "", style = {} }) => (
  <div className={className} style={style}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => <div className={className}>{children}</div>;

const InfoNote = ({ children, theme }) => (
  <div
    className="flex items-start gap-2 p-3 text-sm"
    style={{
      borderRadius: theme?.radius || "14px",
      border: `1px solid ${rgba(theme?.border || theme?.muted || "255 255 255", 0.12)}`,
      background: rgba(theme?.card || theme?.surface2 || "18 18 18", 0.6),
      color: rgba(theme?.fg || "255 255 255", 0.75),
    }}
  >
    <InfoIcon className="w-4 h-4 mt-0.5" style={{ color: rgba(theme?.accent || "59 130 246", 0.95) }} />
    <div>{children}</div>
  </div>
);

/* -------------------------- tiny components ------------------------------- */
const AnimatedCounter = ({ value = 0, duration = 700 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start;
    let raf;
    const total = Number(value || 0);
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      setCount(Math.floor(total * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span className="font-extrabold tabular-nums">{count.toLocaleString()}</span>;
};

const KPI = ({ title, value, icon: Icon, isMoney = false, theme, iconBg }) => {
  const radius = theme?.radius || "14px";
  return (
    <Card
      className="p-4 transition-colors"
      style={{
        borderRadius: radius,
        border: `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`,
        background: `linear-gradient(135deg, ${rgba(theme?.card || theme?.surface2 || "18 18 18", 0.7)}, ${rgba(
          theme?.surface1 || theme?.bg || "0 0 0",
          0.7
        )})`,
        boxShadow: `0 14px 40px ${rgba(theme?.shadowColor || "0 0 0", 0.35)}`,
      }}
    >
      <CardContent className="p-0" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
        <div className="flex items-center justify-between mb-2">
          <div
            className="p-2 rounded-lg"
            style={{
              background: iconBg || `linear-gradient(135deg, ${rgb(theme?.gradientFrom || theme?.accent || "59 130 246")}, ${rgb(theme?.gradientTo || "147 51 234")})`,
              boxShadow: `0 0 24px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.25)}`,
            }}
          >
            <Icon className="w-5 h-5" style={{ color: rgb(theme?.accentFg || "255 255 255") }} />
          </div>
          <span className="text-[10px] uppercase tracking-wider" style={{ color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.7) }}>
            Live
          </span>
        </div>

        <div className="text-xs" style={{ color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.72) }}>
          {title}
        </div>

        <div className="text-2xl">
          {isMoney ? <span className="font-extrabold">{formatMoney(value)}</span> : <AnimatedCounter value={Number(value || 0)} />}
        </div>
      </CardContent>
    </Card>
  );
};

/* ================================ MAIN ==================================== */
export default function DashboardBase() {
  const API_KEY = import.meta.env.VITE_API_KEY;

  // Theme from Redux
  const themeConfig = useSelector((state) => state.user.themeConfig);
  const theme = useMemo(() => {
    const t = themeConfig?.theme;
    // sensible fallback if redux not ready
    return (
      t || {
        accent: "59 130 246",
        accentFg: "255 255 255",
        bg: "0 0 0",
        fg: "255 255 255",
        card: "18 18 18",
        border: "255 255 255",
        ring: "59 130 246",
        gradientFrom: "59 130 246",
        gradientTo: "147 51 234",
        sidebar: "25 25 25",
        sidebarHover: "40 40 40",
        sidebarActive: "34 197 94",
        headerRow: "30 41 59",
        rowHover: "15 23 42",
        input: "6 101 234",
        inputBorder: "100 116 139",
        muted: "148 163 184",
        mutedFg: "203 213 225",
        placeholder: "148 163 184",
        primary: "34 197 94",
        primaryFg: "0 0 0",
        success: "34 197 94",
        successFg: "0 0 0",
        warning: "234 179 8",
        warningFg: "0 0 0",
        danger: "244 63 94",
        dangerFg: "255 255 255",
        info: "56 189 248",
        infoFg: "0 0 0",
        surface1: "10 10 10",
        surface2: "18 18 18",
        surface3: "30 30 30",
        shadowColor: "0 0 0",
        radius: "14px",
        pattern: "grid",
        effectsEnabled: true,
      }
    );
  }, [themeConfig]);

  const radius = theme?.radius || "14px";

  const [userReport, setUserReport] = useState(null);
  const [depositReport, setDepositReport] = useState(null);
  const [withdrawalReport, setWithdrawalReport] = useState(null);
  const [ibWithdrawalReport, setIbWithdrawalReport] = useState(null);

  // unified monthly series + totals
  const [depWdrMonthly, setDepWdrMonthly] = useState(null);
  const [depWdrTotals, setDepWdrTotals] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setErr("");

        const cfg = { headers: { "x-api-key": API_KEY } };

        const depWdrReq = adminApi
          .get(`/analytics/deposits-vs-withdrawals?months=12`, cfg)
          .then((r) => r?.data?.data)
          .catch(() => null);

        const [userRes, depRes, wdrRes, ibRes, depWdrRes] = await Promise.allSettled([
          adminApi.get(`/user-report`, cfg),
          adminApi.get(`/deposit-report`, cfg),
          adminApi.get(`/withdrawal-report`, cfg),
          adminApi.get(`/ib-withdrawal-report`, cfg),
          depWdrReq,
        ]);

        if (userRes.status === "fulfilled") setUserReport(userRes.value?.data?.data || {});
        if (depRes.status === "fulfilled") setDepositReport(depRes.value?.data?.data || {});
        if (wdrRes.status === "fulfilled") setWithdrawalReport(wdrRes.value?.data?.data || {});
        if (ibRes.status === "fulfilled") setIbWithdrawalReport(ibRes.value?.data?.data || {});
        if (depWdrRes.status === "fulfilled" && depWdrRes.value) {
          setDepWdrMonthly(Array.isArray(depWdrRes.value.months) ? depWdrRes.value.months : null);
          setDepWdrTotals(depWdrRes.value.totals || null);
        }
      } catch (e) {
        console.error(e);
        setErr("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [API_KEY]);

  /* --------------------- Derived metrics -------------------- */
  const totalUsers = userReport?.totalUsers ?? 0;
  const kycVerified = userReport?.kycVerified ?? 0;
  const kycUnverified = userReport?.kycUnverified ?? 0;
  const emailVerified = userReport?.emailVerified ?? 0;
  const emailUnverified = userReport?.emailUnverified ?? 0;
  const totalIbUsers = userReport?.totalIbUsers ?? 0;
  const totalReferralUsers = userReport?.totalReferralUsers ?? 0;

  // fallback monthlies from legacy endpoints
  const depMonthlyRaw = depositReport?.monthly || depositReport?.months || null;
  const wdrMonthlyRaw = withdrawalReport?.monthly || withdrawalReport?.months || null;

  const monthlyDeposits = Array.isArray(depMonthlyRaw) ? depMonthlyRaw.map(normalizeMonthly) : null;
  const monthlyWithdrawals = Array.isArray(wdrMonthlyRaw) ? wdrMonthlyRaw.map(normalizeMonthly) : null;

  // totals
  const totalDeposits =
    (monthlyDeposits?.reduce((s, v) => s + (Number(v) || 0), 0) || 0) || Number(depositReport?.totalAmount ?? depositReport?.approved ?? 0);

  const totalWithdrawals =
    (monthlyWithdrawals?.reduce((s, v) => s + (Number(v) || 0), 0) || 0) ||
    Number(withdrawalReport?.totalAmount ?? withdrawalReport?.approved ?? 0);

  // Use analytics totals if provided
  const chartTotalDeposits = depWdrTotals?.deposits ?? totalDeposits;
  const chartTotalWithdrawals = depWdrTotals?.withdrawals ?? totalWithdrawals;

  const depPending = depositReport?.pending ?? 0;
  const depRejected = depositReport?.rejected ?? 0;

  const wdrApproved = withdrawalReport?.approved ?? withdrawalReport?.totalAmount ?? 0;
  const wdrPending = withdrawalReport?.pending ?? 0;
  const wdrRejected = withdrawalReport?.rejected ?? 0;
  const wdrTotal = withdrawalReport?.total ?? 0;

  const ibApproved = ibWithdrawalReport?.approved ?? 0;
  const ibPending = ibWithdrawalReport?.pending ?? 0;
  const ibRejected = ibWithdrawalReport?.rejected ?? 0;
  const ibTodayApproved = ibWithdrawalReport?.todayApproved ?? 0;
  const ibLastWeekApproved = ibWithdrawalReport?.lastWeekApproved ?? 0;
  const ibLastMonthApproved = ibWithdrawalReport?.lastMonthApproved ?? 0;
  const ibTotal = ibWithdrawalReport?.total ?? 0;

  const labelFromMonth = (m, i) => {
    if (!m) return `M${(i ?? 0) + 1}`;
    if (m.label) return m.label;
    if (m.month && typeof m.month === "string") {
      const d = new Date(`${m.month}-01T00:00:00Z`);
      const idx = Number.isNaN(d.getTime()) ? null : d.getUTCMonth();
      return idx != null ? monthsNames[idx] : `M${(i ?? 0) + 1}`;
    }
    if (typeof m.monthIndex === "number") {
      return monthsNames[Math.max(0, Math.min(11, m.monthIndex - 1))];
    }
    return `M${(i ?? 0) + 1}`;
  };

  const monthlyDepVsWdr = useMemo(() => {
    if (Array.isArray(depWdrMonthly) && depWdrMonthly.length) {
      return depWdrMonthly.map((m, i) => ({
        name: labelFromMonth(m, i),
        deposits: Number(m.deposits || 0),
        withdrawals: Number(m.withdrawals || 0),
      }));
    }
    if (Array.isArray(depMonthlyRaw) && Array.isArray(wdrMonthlyRaw) && depMonthlyRaw.length && wdrMonthlyRaw.length) {
      const len = Math.min(depMonthlyRaw.length, wdrMonthlyRaw.length, 12);
      return Array.from({ length: len }, (_, i) => ({
        name: monthsNames[i] ?? `M${i + 1}`,
        deposits: normalizeMonthly(depMonthlyRaw[i]),
        withdrawals: normalizeMonthly(wdrMonthlyRaw[i]),
      }));
    }
    return null;
  }, [depWdrMonthly, depMonthlyRaw, wdrMonthlyRaw]);

  const depChange = pctChange(monthlyDepVsWdr?.map((d) => d.deposits) || []);
  const wdrChange = pctChange(monthlyDepVsWdr?.map((d) => d.withdrawals) || []);

  const userBarData = [
    { title: "Total Users", value: totalUsers },
    { title: "KYC Verified", value: kycVerified },
    { title: "KYC Unverified", value: kycUnverified },
    { title: "Email Verified", value: emailVerified },
    { title: "Email Unverified", value: emailUnverified },
    { title: "IB Users", value: totalIbUsers },
    { title: "Referrals", value: totalReferralUsers },
  ];

  const ibBarData = [
    { name: "Approved", value: Number(ibApproved || 0) },
    { name: "Pending", value: Number(ibPending || 0) },
    { name: "Rejected", value: Number(ibRejected || 0) },
  ];

  const safeDiv = (num, den) => (den ? (num / den) * 100 : 0);
  const mt5Radial = [
    { name: "KYC", pct: Number(safeDiv(kycVerified, totalUsers).toFixed(1)), fill: rgb(theme?.success || theme?.primary || "34 197 94") },
    { name: "Email", pct: Number(safeDiv(emailVerified, totalUsers).toFixed(1)), fill: rgb(theme?.accent || "59 130 246") },
    { name: "IB", pct: Number(safeDiv(totalIbUsers, totalUsers).toFixed(1)), fill: rgb(theme?.warning || "234 179 8") },
  ];

  const tickerItems = [
    { symbol: "DEPOSITS", price: chartTotalDeposits, change24h: depChange || 0 },
    { symbol: "WITHDRAWALS", price: chartTotalWithdrawals, change24h: wdrChange || 0 },
    { symbol: "USERS", price: totalUsers, change24h: 0 },
    { symbol: "IB APPROVED", price: ibApproved, change24h: 0 },
  ];

  // UI styles (theme driven)
  const outerStyle = {
    color: rgb(theme?.fg || "255 255 255"),
    background: `radial-gradient(1200px 600px at 18% 0%, ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.18)}, transparent 60%),
                 radial-gradient(900px 480px at 82% 12%, ${rgba(theme?.gradientTo || theme?.accent || "147 51 234", 0.14)}, transparent 55%),
                 linear-gradient(135deg, ${rgb(theme?.bg || "0 0 0")}, ${rgb(theme?.surface1 || "10 10 10")}, ${rgb(theme?.bg || "0 0 0")})`,
  };

  const sectionStyle = {
    borderRadius: radius,
    border: `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`,
    background: `linear-gradient(135deg, ${rgba(theme?.card || theme?.surface2 || "18 18 18", 0.7)}, ${rgba(
      theme?.surface1 || theme?.bg || "0 0 0",
      0.7
    )})`,
    backdropFilter: "blur(10px)",
    boxShadow: `0 14px 40px ${rgba(theme?.shadowColor || "0 0 0", 0.35)}`,
  };

  const chipStyle = {
    borderRadius: "999px",
    border: `1px solid ${rgba(theme?.border || theme?.accent || "255 255 255", 0.18)}`,
    background: rgba(theme?.accent || "59 130 246", 0.12),
    color: rgba(theme?.accent || "59 130 246", 0.95),
  };

  const tickStroke = rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.65);
  const gridStroke = rgba(theme?.fg || "255 255 255", 0.08);

  return (
    <motion.div className="p-4 md:p-6 pb-12 min-h-screen relative overflow-hidden" style={outerStyle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <FloatingParticles theme={theme} />
      <AnimatedGrid theme={theme} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-5">
          <h1
            className="text-3xl md:text-4xl font-extrabold drop-shadow"
            style={{
              backgroundImage: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "59 130 246")}, ${rgb(
                theme?.gradientTo || "147 51 234"
              )}, ${rgb(theme?.gradientFrom || theme?.accent || "59 130 246")})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Dashboard
          </h1>

          <div className="mt-2 flex items-center gap-3">
            <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider" style={chipStyle}>
              Live Overview
            </span>

            {err && (
              <span
                className="px-2 py-0.5 text-[11px] border"
                style={{
                  borderRadius: "999px",
                  borderColor: rgba(theme?.danger || "244 63 94", 0.25),
                  background: rgba(theme?.danger || "244 63 94", 0.14),
                  color: rgba(theme?.danger || "244 63 94", 0.95),
                }}
              >
                {err}
              </span>
            )}
          </div>
        </div>

        {/* Ticker */}
        <div className="mb-5">
          <div
            className="relative overflow-hidden border backdrop-blur-md"
            style={{
              borderRadius: radius,
              borderColor: rgba(theme?.border || "255 255 255", 0.12),
              background: `linear-gradient(90deg, ${rgba(theme?.card || theme?.surface2 || "18 18 18", 0.7)}, ${rgba(
                theme?.bg || "0 0 0",
                0.75
              )}, ${rgba(theme?.card || theme?.surface2 || "18 18 18", 0.7)})`,
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                opacity: 0.12,
                backgroundImage: `repeating-linear-gradient(90deg, ${rgba(theme?.accent || "59 130 246", 0.18)} 0 2px, transparent 2px 8px)`,
              }}
            />
            <div className="whitespace-nowrap animate-[marquee_24s_linear_infinite] py-2">
              {[...tickerItems, ...tickerItems].map((c, i) => {
                const up = c.change24h >= 0;
                return (
                  <span key={c.symbol + i} className="inline-flex items-center mx-4 gap-2 text-sm">
                    <span className="font-mono" style={{ color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.75) }}>
                      {c.symbol}
                    </span>
                    <span className="font-semibold">{formatNumber(c.price)}</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs border"
                      style={{
                        borderColor: rgba(up ? theme?.success || theme?.primary : theme?.danger, 0.25),
                        background: rgba(up ? theme?.success || theme?.primary : theme?.danger, 0.14),
                        color: rgba(up ? theme?.success || theme?.primary : theme?.danger, 0.95),
                      }}
                    >
                      {up ? "▲" : "▼"} {Math.abs(c.change24h).toFixed(2)}%
                    </span>
                  </span>
                );
              })}
            </div>
            <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPI
            title="Total Users"
            value={totalUsers}
            icon={UsersIcon}
            theme={theme}
            iconBg={`linear-gradient(135deg, ${rgb(theme?.accent || "59 130 246")}, ${rgb(theme?.info || "56 189 248")})`}
          />
          <KPI
            title="KYC Verified"
            value={kycVerified}
            icon={UserCheck}
            theme={theme}
            iconBg={`linear-gradient(135deg, ${rgb(theme?.success || theme?.primary || "34 197 94")}, ${rgb(theme?.accent || "59 130 246")})`}
          />
          <KPI
            title="Total Deposits"
            value={totalDeposits}
            icon={CreditCard}
            isMoney
            theme={theme}
            iconBg={`linear-gradient(135deg, ${rgb(theme?.gradientFrom || theme?.accent || "59 130 246")}, ${rgb(theme?.gradientTo || "147 51 234")})`}
          />
          <KPI
            title="Total Withdrawals"
            value={totalWithdrawals}
            icon={ArrowDownRight}
            isMoney
            theme={theme}
            iconBg={`linear-gradient(135deg, ${rgb(theme?.warning || "234 179 8")}, ${rgb(theme?.danger || "244 63 94")})`}
          />
        </div>

        {/* ======= Aligned rows (2 columns each) ======= */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Row 1: User Information */}
          <section style={sectionStyle}>
            <CardContent className="p-6" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
              <h2
                className="text-lg mb-4 font-semibold"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "59 130 246")}, ${rgb(
                    theme?.gradientTo || "147 51 234"
                  )})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                User Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Total Users", value: totalUsers, icon: <UsersIcon size={20} /> },
                  { title: "KYC Verified", value: kycVerified, icon: <UserCheck size={20} /> },
                  { title: "KYC Unverified", value: kycUnverified, icon: <UserX size={20} /> },
                  { title: "Email Verified", value: emailVerified, icon: <MailCheck size={20} /> },
                  { title: "Email Unverified", value: emailUnverified, icon: <MailX size={20} /> },
                  { title: "IB Users", value: totalIbUsers, icon: <Wallet size={20} /> },
                  { title: "Referrals", value: totalReferralUsers, icon: <Banknote size={20} /> },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="p-4 border transition"
                    style={{
                      borderRadius: radius,
                      borderColor: rgba(theme?.border || "255 255 255", 0.12),
                      background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.45),
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = rgba(theme?.surface3 || theme?.card || "30 30 30", 0.55);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = rgba(theme?.surface2 || theme?.card || "18 18 18", 0.45);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm" style={{ color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.8) }}>
                        {c.title}
                      </div>
                      <div style={{ color: rgba(theme?.accent || "59 130 246", 0.95) }}>{c.icon}</div>
                    </div>
                    <div className="mt-1 text-xl font-extrabold">{formatNumber(c.value)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </section>

          {/* User Report Overview */}
          <section style={sectionStyle}>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                User Report Overview
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userBarData}>
                    <CartesianGrid stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="title" stroke={tickStroke} tickLine={false} axisLine={false} />
                    <YAxis stroke={tickStroke} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.95),
                        border: `1px solid ${rgba(theme?.accent || "59 130 246", 0.5)}`,
                        borderRadius: 10,
                        color: rgb(theme?.fg || "255 255 255"),
                      }}
                    />
                    <Bar dataKey="value" fill={rgb(theme?.info || theme?.accent || "56 189 248")} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </section>

          {/* Row 2: Deposit & Withdraw Report */}
          <section style={sectionStyle}>
            <CardContent className="p-6">
              <h2
                className="text-lg mb-4 font-semibold"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${rgb(theme?.success || theme?.primary || "34 197 94")}, ${rgb(
                    theme?.accent || "59 130 246"
                  )})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Deposit & Withdraw Report
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { t: "Deposits (Total)", v: totalDeposits, money: true },
                  { t: "Deposits Pending", v: depPending, money: true },
                  { t: "Deposits Rejected", v: depRejected, money: true },
                  { t: "Withdrawals (Total)", v: totalWithdrawals, money: true },
                  { t: "Withdraw Approved", v: wdrApproved, money: true },
                  { t: "Withdraw Pending", v: wdrPending, money: true },
                  { t: "Withdraw Rejected", v: wdrRejected, money: true },
                ].map((x, i) => (
                  <div
                    key={i}
                    className="p-3 border"
                    style={{
                      borderRadius: radius,
                      borderColor: rgba(theme?.border || "255 255 255", 0.12),
                      background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.45),
                    }}
                  >
                    <div className="text-[12px]" style={{ color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.7) }}>
                      {x.t}
                    </div>
                    <div className="text-lg font-extrabold" style={{ color: rgba(theme?.fg || "255 255 255", 0.95) }}>
                      {x.money ? formatMoney(x.v) : formatNumber(x.v)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </section>

          {/* Deposits vs Withdrawals */}
          <Card
            className="transition-colors"
            style={{
              ...sectionStyle,
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: rgba(theme?.accent || "59 130 246", 0.95) }} />
                  <h2 className="text-lg font-semibold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                    Deposits vs Withdrawals
                  </h2>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <span
                    className="px-2 py-1 border"
                    style={{
                      borderRadius: radius,
                      background: rgba(theme?.accent || "59 130 246", 0.12),
                      borderColor: rgba(theme?.accent || "59 130 246", 0.28),
                    }}
                  >
                    <span style={{ color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.72) }}>Total Deposits:</span>{" "}
                    <span className="font-bold" style={{ color: rgba(theme?.accent || "59 130 246", 0.95) }}>
                      {formatMoney(chartTotalDeposits)}
                    </span>
                  </span>

                  <span
                    className="px-2 py-1 border"
                    style={{
                      borderRadius: radius,
                      background: rgba(theme?.danger || "244 63 94", 0.12),
                      borderColor: rgba(theme?.danger || "244 63 94", 0.28),
                    }}
                  >
                    <span style={{ color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.72) }}>Total Withdrawals:</span>{" "}
                    <span className="font-bold" style={{ color: rgba(theme?.danger || "244 63 94", 0.95) }}>
                      {formatMoney(chartTotalWithdrawals)}
                    </span>
                  </span>
                </div>
              </div>

              {Array.isArray(monthlyDepVsWdr) && monthlyDepVsWdr.length > 1 ? (
                <div className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyDepVsWdr} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="areaDeposits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={rgba(theme?.accent || "59 130 246", 0.95)} stopOpacity={0.95} />
                          <stop offset="95%" stopColor={rgba(theme?.accent || "59 130 246", 0)} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="areaWithdrawals" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={rgba(theme?.danger || "244 63 94", 0.95)} stopOpacity={0.95} />
                          <stop offset="95%" stopColor={rgba(theme?.danger || "244 63 94", 0)} stopOpacity={0} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid stroke={gridStroke} vertical={false} />
                      <XAxis dataKey="name" stroke={tickStroke} tickLine={false} axisLine={false} />
                      <YAxis stroke={tickStroke} tickLine={false} axisLine={false} />
                      <Tooltip
                        formatter={(val, name) => [formatMoney(val), name === "deposits" ? "Deposits" : "Withdrawals"]}
                        contentStyle={{
                          background: rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.95),
                          border: `1px solid ${rgba(theme?.success || theme?.primary || "34 197 94", 0.5)}`,
                          borderRadius: 10,
                          color: rgb(theme?.fg || "255 255 255"),
                        }}
                      />
                      <Legend formatter={(v) => (v === "deposits" ? "Deposits" : "Withdrawals")} />
                      <Area
                        type="monotone"
                        dataKey="deposits"
                        stroke={rgb(theme?.accent || "59 130 246")}
                        strokeWidth={2}
                        fill="url(#areaDeposits)"
                        name="deposits"
                      />
                      <Area
                        type="monotone"
                        dataKey="withdrawals"
                        stroke={rgb(theme?.danger || "244 63 94")}
                        strokeWidth={2}
                        fill="url(#areaWithdrawals)"
                        name="withdrawals"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ name: "Totals", Deposits: chartTotalDeposits, Withdrawals: chartTotalWithdrawals }]}>
                      <CartesianGrid stroke={gridStroke} vertical={false} />
                      <XAxis dataKey="name" stroke={tickStroke} tickLine={false} axisLine={false} />
                      <YAxis stroke={tickStroke} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.95),
                          border: `1px solid ${rgba(theme?.success || theme?.primary || "34 197 94", 0.5)}`,
                          borderRadius: 10,
                          color: rgb(theme?.fg || "255 255 255"),
                        }}
                        formatter={(val, key) => [formatMoney(val), key]}
                      />
                      <Legend />
                      <Bar dataKey="Deposits" fill={rgb(theme?.accent || "59 130 246")} radius={[8, 8, 0, 0]} />
                      <Bar dataKey="Withdrawals" fill={rgb(theme?.danger || "244 63 94")} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  {!monthlyDepVsWdr && (
                    <div className="mt-3">
                      <InfoNote theme={theme}>
                        Showing totals because the unified endpoint{" "}
                        <code
                          className="mx-1 px-2 py-0.5 border"
                          style={{
                            borderRadius: "10px",
                            borderColor: rgba(theme?.border || "255 255 255", 0.12),
                            background: rgba(theme?.bg || "0 0 0", 0.25),
                            color: rgba(theme?.fg || "255 255 255", 0.85),
                          }}
                        >
                          GET /api/analytics/deposits-vs-withdrawals?months=12
                        </code>{" "}
                        didn’t return a monthly array. Provide <code>data.months</code> as{" "}
                        <code
                          className="ml-1 px-2 py-0.5 border"
                          style={{
                            borderRadius: "10px",
                            borderColor: rgba(theme?.border || "255 255 255", 0.12),
                            background: rgba(theme?.bg || "0 0 0", 0.25),
                            color: rgba(theme?.fg || "255 255 255", 0.85),
                          }}
                        >
                          [&#123; month: "YYYY-MM", label: "Jan", deposits: Number, withdrawals: Number &#125;]
                        </code>{" "}
                        and optional <code>data.totals</code>.
                      </InfoNote>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Row 3: IB Withdrawal Report */}
          <section style={sectionStyle}>
            <CardContent className="p-6">
              <h2
                className="text-lg mb-4 font-semibold"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${rgb(theme?.gradientTo || "147 51 234")}, ${rgb(theme?.accent || "59 130 246")})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                IB Withdrawal Report
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { t: "Approved", v: ibApproved },
                  { t: "Pending", v: ibPending },
                  { t: "Rejected", v: ibRejected },
                  { t: "Today Approved", v: ibTodayApproved },
                  { t: "Last Week Approved", v: ibLastWeekApproved },
                  { t: "Last Month Approved", v: ibLastMonthApproved },
                  { t: "Total", v: ibTotal },
                ].map((x, i) => (
                  <div
                    key={i}
                    className="p-3 border"
                    style={{
                      borderRadius: radius,
                      borderColor: rgba(theme?.border || "255 255 255", 0.12),
                      background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.45),
                    }}
                  >
                    <div className="text-[12px]" style={{ color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.7) }}>
                      {x.t}
                    </div>
                    <div className="text-lg font-extrabold" style={{ color: rgba(theme?.fg || "255 255 255", 0.95) }}>
                      {formatNumber(x.v)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </section>

          {/* IB Withdrawal (Status) */}
          <Card style={sectionStyle}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                  IB Withdrawal (Status)
                </h2>
              </div>

              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ibBarData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ibBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={rgba(theme?.gradientTo || "147 51 234", 0.95)} stopOpacity={0.95} />
                        <stop offset="95%" stopColor={rgba(theme?.gradientTo || "147 51 234", 0.2)} stopOpacity={0.25} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="name" stroke={tickStroke} tickLine={false} axisLine={false} />
                    <YAxis stroke={tickStroke} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.95),
                        border: `1px solid ${rgba(theme?.gradientTo || "147 51 234", 0.5)}`,
                        borderRadius: 10,
                        color: rgb(theme?.fg || "255 255 255"),
                      }}
                      formatter={(v) => [formatNumber(v), "Count"]}
                    />
                    <Bar dataKey="value" fill="url(#ibBar)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Row 4: MT5 Accounts Report */}
          <Card style={sectionStyle}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                  MT5 Accounts Report
                </h2>
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider" style={chipStyle}>
                  % of total users
                </span>
              </div>

              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="35%" outerRadius="95%" startAngle={90} endAngle={-270} barCategoryGap="15%" data={mt5Radial}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="pct" cornerRadius={8} />
                    <Legend
                      iconSize={10}
                      layout="horizontal"
                      verticalAlign="bottom"
                      wrapperStyle={{ color: rgb(theme?.fg || "255 255 255") }}
                      formatter={(value, entry) => (
                        <span style={{ color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.8) }}>
                          {value}:{" "}
                          <b style={{ color: entry?.payload?.fill }}>
                            {entry?.payload?.pct}%
                          </b>
                        </span>
                      )}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Withdrawal Summary */}
          <section style={sectionStyle}>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                📤 Withdrawal Summary
              </h2>

              <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {[
                  { label: "Total", value: wdrTotal },
                  { label: "Approved", value: wdrApproved },
                  { label: "Pending", value: wdrPending },
                  { label: "Rejected", value: wdrRejected },
                ].map((x) => (
                  <li
                    key={x.label}
                    className="p-3 border"
                    style={{
                      borderRadius: radius,
                      borderColor: rgba(theme?.border || "255 255 255", 0.12),
                      background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.45),
                    }}
                  >
                    <div style={{ color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.7) }}>{x.label}</div>
                    <div className="text-lg font-extrabold" style={{ color: rgba(theme?.fg || "255 255 255", 0.95) }}>
                      {formatNumber(x.value)}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </section>
        </div>

        {/* Loading overlay */}
        <motion.div
          initial={false}
          animate={{ opacity: loading ? 1 : 0, pointerEvents: loading ? "auto" : "none" }}
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{ background: rgba(theme?.bg || "0 0 0", 0.55) }}
        >
          <div
            className="px-6 py-4 border shadow-xl"
            style={{
              borderRadius: radius,
              borderColor: rgba(theme?.border || "255 255 255", 0.12),
              background: rgba(theme?.card || theme?.surface2 || "18 18 18", 0.75),
              color: rgba(theme?.fg || "255 255 255", 0.92),
              boxShadow: `0 18px 60px ${rgba(theme?.shadowColor || "0 0 0", 0.45)}`,
            }}
          >
            Loading dashboard…
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
