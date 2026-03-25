import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Wallet,
  CreditCard,
  ArrowLeftRight,
  Users,
  BoxIcon,
  Mail,
  MapPin,
  Calendar,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import UserInfoForm from "../user-detail/UserForm";
import { useParams } from "react-router-dom";
import UserTradeAccounts from "../user-detail/UserTradeAccounts";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { adminApi} from "../../../utils/apiClients";
import { CFformatDate } from "../../../utils/CustomFunctions";

// Ambient visuals
import { FloatingParticles } from "../../../utils/FloatingParticles";
import { AnimatedGrid } from "../../../utils/AnimatedGrid";

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

const containerVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

// ---------- small helpers ----------
const money = (n: any, d = 2) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })}`;

const initials = (first?: string, last?: string) => (first?.[0] || "") + (last?.[0] || "");

/* ------------------------- Themed building blocks ------------------------- */
const StatCard = ({
  icon,
  amount,
  label,
  theme,
  radius,
}: {
  icon: JSX.Element;
  amount: string;
  label: string;
  theme: any;
  radius: string;
}) => {
  const cardStyle = {
    borderRadius: "24px",
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    background: `linear-gradient(135deg,
      ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.70)},
      ${rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.85)},
      ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.70)}
    )`,
    color: rgba(theme?.fg || "255 255 255", 0.92),
    boxShadow: `0 18px 60px ${rgba(theme?.shadowColor || "0 0 0", 0.45)}`,
  } as React.CSSProperties;

  const glowOverlay = {
    background: `linear-gradient(90deg,
      ${rgba(theme?.gradientFrom || theme?.accent || "59 130 246", 0.35)},
      ${rgba(theme?.gradientTo || "147 51 234", 0.35)}
    )`,
    opacity: 0.18,
    filter: "blur(14px)",
  } as React.CSSProperties;

  const iconWrap = {
    width: 44,
    height: 44,
    borderRadius: radius,
    background: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "59 130 246")}, ${rgb(
      theme?.gradientTo || "147 51 234"
    )})`,
    boxShadow: `0 0 24px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.18)}`,
  } as React.CSSProperties;

  return (
    <motion.div
      variants={cardVariants}
      className="relative p-4 overflow-hidden transition-all"
      style={cardStyle}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${rgba(
          theme?.glow || theme?.accent || "59 130 246",
          0.18
        )}, 0 18px 70px ${rgba(theme?.shadowColor || "0 0 0", 0.55)}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 18px 60px ${rgba(theme?.shadowColor || "0 0 0", 0.45)}`;
      }}
    >
      <div className="absolute -inset-px rounded-[24px]" style={glowOverlay} />
      <div className="relative flex items-center gap-3">
        <div className="grid place-items-center" style={iconWrap}>
          {icon}
        </div>
        <div>
          <p className="text-xs" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.62) }}>
            {label}
          </p>
          <p className="text-xl font-semibold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
            {amount}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const Panel = ({
  title,
  subtitle,
  right,
  children,
  className = "",
  theme,
  radius,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  theme: any;
  radius: string;
}) => {
  const panelStyle = {
    borderRadius: "24px",
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    background: `linear-gradient(135deg,
      ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.72)},
      ${rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.88)},
      ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.72)}
    )`,
    boxShadow: `0 18px 60px ${rgba(theme?.shadowColor || "0 0 0", 0.5)}`,
    overflow: "hidden",
  } as React.CSSProperties;

  const headerStyle = {
    borderBottom: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12)}`,
    background: rgba(theme?.headerRow || theme?.surface3 || "30 30 30", 0.45),
  } as React.CSSProperties;

  return (
    <div className={className} style={panelStyle}>
      <div className="flex items-start justify-between px-5 sm:px-6 py-4" style={headerStyle}>
        <div>
          <h3 className="font-semibold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.62) }}>
              {subtitle}
            </p>
          )}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
      <div className="p-5 sm:p-6" style={{ borderRadius: radius }}>
        {children}
      </div>
    </div>
  );
};

const UserDetailDashboard = () => {
  const { id } = useParams();

  // Theme from Redux (same as LoginLogs)
  const themeConfig = useSelector((state: any) => state.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const radius = theme?.radius || "14px";

  const [userData, setUserData] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [equityLoading, setEquityLoading] = useState(false);

  const accountsRef = useRef<HTMLDivElement | null>(null);

  const totalTransactions = useMemo(() => [...deposits, ...withdrawals], [deposits, withdrawals]);

  const totalInvestAmount = useMemo(
    () => deposits.reduce((t, v) => t + Number(v?.deposit || 0), 0),
    [deposits]
  );

  const totalWithdrawalAmount = useMemo(
    () => withdrawals.reduce((t, v) => t + Number(v?.amount || 0), 0),
    [withdrawals]
  );

  // ---------- data ----------
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [res, depRes, wRes] = await Promise.all([
        adminApi.get(`/get-user?id=${id}`),
        adminApi.get(`/deposits`),
        adminApi.get(`/withdrawals`),
      ]);

      const u = res?.data?.data;
      setUserData(u || null);

      const userId = u?._id;
      const userDeposits = (depRes?.data?.data || []).filter((d: any) => d?.userId?._id === userId);
      const userWithdrawals = (wRes?.data?.data || []).filter((w: any) => w?.userId?._id === userId);

      setDeposits(userDeposits);
      setWithdrawals(userWithdrawals);
    } catch (e) {
      toast.error("Failed to load user");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountsEquity = async (accounts: any[]) => {
    if (!accounts?.length) {
      setTotalBalance(0);
      return;
    }
    setEquityLoading(true);
    try {
      const results = await Promise.allSettled(
        accounts.map((acc) =>
          adminApi.get(
            `/server-logger-info`
          )
        )
      );

      const sum = results.reduce((t, r) => {
        if (r.status === "fulfilled") {
          const eq = Number(r.value?.data?.data?.Equity || 0);
          return t + (isFinite(eq) ? eq : 0);
        }
        return t;
      }, 0);

      setTotalBalance(Number(sum.toFixed(2)));
    } catch (e) {
      console.error("Equity fetch failed", e);
      toast.error("Could not update MT5 balances");
    } finally {
      setEquityLoading(false);
    }
  };

  const goToAccounts = () => {
    if (!accountsRef.current) return;
    const y = accountsRef.current.getBoundingClientRect().top + window.pageYOffset - 96;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    if (id) fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (userData?.accounts?.length) fetchAccountsEquity(userData.accounts);
    else setTotalBalance(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  // ---------- derived for header ----------
  const fullName = `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim();
  const email = userData?.email || "—";
  const country = userData?.country || "N/A";
  const joined = userData?.createdAt ? CFformatDate(userData.createdAt) : "—";

  // ---------- theme-driven page styles (same vibe as LoginLogs) ----------
  const pageBgStyle = {
    minHeight: "100vh",
    background: `radial-gradient(1200px 600px at 18% 0%, ${rgba(theme?.glow || theme?.accent, 0.16)}, transparent 60%),
                 radial-gradient(900px 480px at 82% 12%, ${rgba(theme?.gradientTo || theme?.accent, 0.12)}, transparent 55%),
                 linear-gradient(135deg, ${rgb(theme?.bg || "0 0 0")}, ${rgb(theme?.surface1 || theme?.bg || "0 0 0")}, ${rgb(
      theme?.bg || "0 0 0"
    )})`,
    color: rgb(theme?.fg || "255 255 255"),
  } as React.CSSProperties;

  const stickyHeaderStyle = {
    background: `linear-gradient(to bottom, ${rgba(theme?.bg || "0 0 0", 0.78)}, transparent)`,
    borderBottom: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
  } as React.CSSProperties;

  const buttonBaseStyle = {
    borderRadius: "999px",
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.18)}`,
    color: rgba(theme?.fg || "255 255 255", 0.9),
    background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.25),
  } as React.CSSProperties;

  const buttonHoverShadow = {
    boxShadow: `0 0 22px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.22)}`,
  } as React.CSSProperties;

  const chipStyle = {
    borderRadius: "999px",
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.16)}`,
    background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.22),
    color: rgba(theme?.fg || "255 255 255", 0.82),
  } as React.CSSProperties;

  const activityItemStyle = {
    borderRadius: radius,
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.22),
  } as React.CSSProperties;

  // ---------- UI ----------
  return (
    <div className="relative" style={pageBgStyle}>
      <AnimatedGrid />
      <FloatingParticles />

      <div className="max-w-7xl mx-auto pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Sticky header */}
        <div
          className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-4 backdrop-blur-md"
          style={stickyHeaderStyle}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-4 py-2 transition-all"
                style={buttonBaseStyle}
                onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, buttonHoverShadow)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = "none")}
              >
                <ArrowLeft size={18} />
                Back
              </button>

              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 grid place-items-center text-xl font-semibold"
                  style={{
                    borderRadius: radius,
                    background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.35),
                    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.18)}`,
                    color: rgba(theme?.fg || "255 255 255", 0.88),
                  }}
                >
                  {initials(userData?.firstName, userData?.lastName) || "U"}
                </div>

                <div>
                  <h1
                    className="text-2xl md:text-3xl font-bold drop-shadow"
                    style={{
                      backgroundImage: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "59 130 246")}, ${rgb(
                        theme?.gradientTo || "147 51 234"
                      )})`,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {fullName || "User Detail"}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mt-0.5" style={{ color: rgba(theme?.fg || "255 255 255", 0.78) }}>
                    <span className="inline-flex items-center gap-1" style={chipStyle}>
                      <span className="inline-flex items-center gap-1 px-2 py-1">
                        <Mail className="w-4 h-4" /> {email}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1" style={chipStyle}>
                      <span className="inline-flex items-center gap-1 px-2 py-1">
                        <MapPin className="w-4 h-4" /> {country}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1" style={chipStyle}>
                      <span className="inline-flex items-center gap-1 px-2 py-1">
                        <Calendar className="w-4 h-4" /> Joined {joined}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToAccounts}
                className="px-4 py-2.5 transition-all"
                style={{
                  borderRadius: radius,
                  border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.18)}`,
                  color: rgba(theme?.fg || "255 255 255", 0.9),
                  background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.25),
                }}
                onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, buttonHoverShadow)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = "none")}
                title="Jump to MT5 Accounts"
              >
                View MT5 Accounts
              </button>

              <button
                onClick={fetchUserData}
                disabled={loading}
                className="px-4 py-2.5 transition-all flex items-center gap-2"
                style={{
                  borderRadius: radius,
                  border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.18)}`,
                  color: rgba(theme?.fg || "255 255 255", loading ? 0.45 : 0.9),
                  background: loading
                    ? rgba(theme?.surface2 || theme?.card || "18 18 18", 0.18)
                    : rgba(theme?.surface2 || theme?.card || "18 18 18", 0.28),
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 22px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.22)}`;
                }}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = "none")}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6 mb-8"
        >
          <StatCard theme={theme} radius={radius} icon={<BoxIcon size={20} className="text-white" />} amount={`${userData?.accounts?.length || 0}`} label="Total MT5 Accounts" />
          <StatCard theme={theme} radius={radius} icon={<CreditCard size={20} className="text-white" />} amount={equityLoading ? "Updating…" : money(totalBalance)} label="Total Available Balance" />
          <StatCard theme={theme} radius={radius} icon={<Wallet size={20} className="text-white" />} amount={money(totalInvestAmount)} label="Total Deposits" />
          <StatCard theme={theme} radius={radius} icon={<ArrowLeftRight size={20} className="text-white" />} amount={money(totalWithdrawalAmount)} label="Total Withdrawals" />
          <StatCard theme={theme} radius={radius} icon={<ArrowLeftRight size={20} className="text-white" />} amount={`${totalTransactions.length}`} label="Transactions" />
          <StatCard theme={theme} radius={radius} icon={<Users size={20} className="text-white" />} amount={money(0)} label="Referral Commission" />
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: User form */}
          <Panel
            theme={theme}
            radius={radius}
            title="User Information"
            subtitle="View & update profile data"
            className="lg:col-span-2"
            right={
              <span className="text-xs" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
                User ID:&nbsp;
                <span style={{ color: rgba(theme?.fg || "255 255 255", 0.85) }}>{userData?._id || "—"}</span>
              </span>
            }
          >
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div style={{ height: 32, borderRadius: radius, background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.28) }} />
                <div style={{ height: 32, borderRadius: radius, background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.28) }} />
                <div style={{ height: 32, borderRadius: radius, background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.28) }} />
                <div style={{ height: 128, borderRadius: radius, background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.28) }} />
              </div>
            ) : (
              <UserInfoForm userData={userData} />
            )}
          </Panel>

          {/* Right: Recent activity */}
          <Panel theme={theme} radius={radius} title="Recent Activity" subtitle="Latest deposits & withdrawals">
            <div className="space-y-5">
              {/* Deposits */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium" style={{ color: rgba(theme?.fg || "255 255 255", 0.88) }}>
                    Recent Deposits
                  </h4>
                  <span className="text-xs" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.62) }}>
                    Total:&nbsp;{deposits.length}
                  </span>
                </div>

                {deposits.length ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                    {deposits.slice(0, 8).map((d) => (
                      <div key={d._id} className="flex items-center justify-between px-3 py-2" style={activityItemStyle}>
                        <div className="text-sm" style={{ color: rgba(theme?.fg || "255 255 255", 0.75) }}>
                          {CFformatDate(d?.createdAt)}
                        </div>
                        <div className="text-sm font-semibold" style={{ color: rgba(theme?.success || theme?.primary || "34 197 94", 0.95) }}>
                          {money(d?.deposit)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
                    No deposits yet.
                  </div>
                )}
              </div>

              {/* Withdrawals */}
              <div className="pt-2" style={{ borderTop: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12)}` }}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium" style={{ color: rgba(theme?.fg || "255 255 255", 0.88) }}>
                    Recent Withdrawals
                  </h4>
                  <span className="text-xs" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.62) }}>
                    Total:&nbsp;{withdrawals.length}
                  </span>
                </div>

                {withdrawals.length ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                    {withdrawals.slice(0, 8).map((w) => (
                      <div key={w._id} className="flex items-center justify-between px-3 py-2" style={activityItemStyle}>
                        <div className="text-sm" style={{ color: rgba(theme?.fg || "255 255 255", 0.75) }}>
                          {CFformatDate(w?.createdAt)}
                        </div>
                        <div className="text-sm font-semibold" style={{ color: rgba(theme?.danger || "244 63 94", 0.95) }}>
                          {money(w?.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
                    No withdrawals yet.
                  </div>
                )}
              </div>
            </div>
          </Panel>

          {/* Bottom full-width: MT5 Accounts */}
          <div ref={accountsRef} className="lg:col-span-3 scroll-mt-28">
            <Panel
              theme={theme}
              radius={radius}
              title="MT5 Accounts"
              subtitle="Manage & inspect user trading accounts"
              right={
                <button
                  onClick={() => userData?.accounts && fetchAccountsEquity(userData.accounts)}
                  disabled={equityLoading}
                  className="inline-flex items-center gap-2 px-3 py-2 transition-all"
                  style={{
                    borderRadius: radius,
                    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.16)}`,
                    background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.22),
                    color: rgba(theme?.fg || "255 255 255", equityLoading ? 0.55 : 0.9),
                    cursor: equityLoading ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!equityLoading) (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 22px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.22)}`;
                  }}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = "none")}
                >
                  <RefreshCw className={`w-4 h-4 ${equityLoading ? "animate-spin" : ""}`} />
                  {equityLoading ? "Updating balances…" : "Refresh balances"}
                </button>
              }
            >
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div style={{ height: 40, borderRadius: radius, background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.28) }} />
                  <div style={{ height: 40, borderRadius: radius, background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.28) }} />
                  <div style={{ height: 40, borderRadius: radius, background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.28) }} />
                </div>
              ) : (
                <UserTradeAccounts fetchUserData={fetchUserData} userData={userData} />
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailDashboard;
