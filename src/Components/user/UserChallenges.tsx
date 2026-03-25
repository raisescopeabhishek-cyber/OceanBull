import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Loader2, Sparkles, Wallet, TrendingUp, Gauge, CircleDollarSign } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { CFcalculateTimeSinceJoined, CFformatDate } from "../../utils/CustomFunctions";
import { useGetInfoByAccounts } from "../../hooks/user/UseGetInfoByAccounts";
import ModernHeading from "../lib/ModernHeading";

// ✅ USE THE DYNAMIC EFFECTS COMPONENTS (pattern + effectsEnabled aware)
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

/* --------------------------- Small UI bits ---------------------------- */
const Money = ({ value }: { value: any }) =>
  typeof value === "number" ? (
    <>{value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</>
  ) : (
    <Loader2 className="inline animate-spin" size={16} />
  );

const UserChallenges = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const siteConfig = useSelector((store: any) => store.user.siteConfig);
  const loggedUser = useSelector((store: any) => store.user.loggedUser);

  // ✅ theme from redux
  const themeConfig = useSelector((s: any) => s.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const radius = theme?.radius || "14px";

  const accountIds = loggedUser?.accounts?.map((acc: any) => +acc.accountNumber) || [];
  useGetInfoByAccounts(accountIds, "accounts");
  const { accountsData } = useSelector((store: any) => store.user);

  const handleMoreInfo = (value: any) => {
    setSelectedChallenge(value);
    setIsDialogOpen(true);
  };

  const stats = useMemo(() => {
    const list = (loggedUser?.accounts || []).map((acc: any) => {
      const info = accountsData?.find((i: any) => i.MT5Account === +acc.accountNumber);
      return {
        balance: info?.Balance ?? null,
        equity: info?.Equity ?? null,
        profit: info?.Profit ?? null,
      };
    });

    const sum = (arr: any[], key: string) =>
      arr.reduce((s, x) => (typeof x[key] === "number" ? s + x[key] : s), 0);

    const totalBalance = sum(list, "balance");
    const totalEquity = sum(list, "equity");
    const totalPL = sum(list, "profit");

    return {
      accounts: (loggedUser?.accounts || []).length,
      totalBalance: isFinite(totalBalance) ? totalBalance : null,
      totalEquity: isFinite(totalEquity) ? totalEquity : null,
      totalPL: isFinite(totalPL) ? totalPL : null,
    };
  }, [loggedUser?.accounts, accountsData]);

  const container = {
    hidden: { opacity: 0, y: 30, scale: 0.98, rotateX: 6 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: { duration: 0.8, when: "beforeChildren", staggerChildren: 0.06 },
    },
  };

  // ✅ page bg (same style as LoginLogs)
  const pageBgStyle = {
    minHeight: "100vh",
    background: `radial-gradient(1200px 600px at 18% 0%, ${rgba(theme?.glow || theme?.accent, 0.16)}, transparent 60%),
                 radial-gradient(900px 480px at 82% 12%, ${rgba(theme?.gradientTo || theme?.accent, 0.12)}, transparent 55%),
                 linear-gradient(135deg, ${rgb(theme?.bg || "0 0 0")}, ${rgb(theme?.surface1 || theme?.bg || "0 0 0")}, ${rgb(theme?.bg || "0 0 0")})`,
    color: rgb(theme?.fg || "255 255 255"),
  } as React.CSSProperties;

  // ✅ theme palette shortcuts
  const C = useMemo(
    () => ({
      accent: theme?.accent || "59 130 246",
      primary: theme?.primary || theme?.accent || "147 51 234",
      info: theme?.info || theme?.accent || "59 130 246",
      success: theme?.success || "34 197 94",
      warning: theme?.warning || "234 179 8",
      danger: theme?.danger || "244 63 94",
      border: theme?.border || theme?.inputBorder || "255 255 255",
      card: theme?.surface2 || theme?.card || "18 18 18",
      card2: theme?.surface1 || theme?.bg || "0 0 0",
      mutedFg: theme?.mutedFg || theme?.fg || "255 255 255",
    }),
    [theme]
  );

  const pillStyle = (tone: "emerald" | "cyan" | "indigo" | "red" | "yellow") => {
    const map: any = {
      emerald: C.success,
      cyan: C.info,
      indigo: C.primary,
      red: C.danger,
      yellow: C.warning,
    };
    const col = map[tone] || C.accent;
    return {
      borderRadius: "999px",
      background: rgba(col, 0.12),
      border: `1px solid ${rgba(col, 0.28)}`,
      color: rgba(col, 0.92),
    } as React.CSSProperties;
  };

  const cardShellStyle = {
    borderRadius: "24px",
    border: `1px solid ${rgba(C.border, 0.18)}`,
    background: `linear-gradient(135deg, ${rgba(C.card, 0.78)}, ${rgba(C.card2, 0.86)}, ${rgba(C.card, 0.78)})`,
    boxShadow: `0 18px 60px ${rgba(theme?.shadowColor || "0 0 0", 0.45)}`,
  } as React.CSSProperties;

  return (
    <div className="relative overflow-hidden" style={pageBgStyle}>
      {/* ✅ effects (auto on/off via theme.effectsEnabled + theme.pattern) */}
      <AnimatedGrid />
      <FloatingParticles />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-6 md:px-10 py-10 max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} style={{ color: rgba(C.accent, 0.95) }} />
            <span
              className="uppercase tracking-[0.25em] text-xs font-semibold"
              style={{ color: rgba(C.mutedFg, 0.72) }}
            >
              mt5 · accounts · live
            </span>
          </div>

          {/* ✅ ModernHeading itself is now theme-driven (see file below) */}
          <ModernHeading text="MT5 Accounts" />

          <p className="mt-1" style={{ color: rgba(C.mutedFg, 0.65) }}>
            Real-time balances & equity at a glance. Tap the “i” to view secure credentials.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard
            theme={theme}
            icon={<Wallet />}
            label="Accounts"
            value={stats.accounts}
            tone="emerald"
          />
          <StatCard
            theme={theme}
            icon={<CircleDollarSign />}
            label="Total Balance"
            value={<Money value={stats.totalBalance} />}
            prefix="$"
            tone="cyan"
          />
          <StatCard
            theme={theme}
            icon={<Gauge />}
            label="Total Equity"
            value={<Money value={stats.totalEquity} />}
            prefix="$"
            tone="indigo"
          />
          <StatCard
            theme={theme}
            icon={<TrendingUp />}
            label="Total P/L"
            value={<Money value={stats.totalPL} />}
            prefix="$"
            tone={typeof stats.totalPL === "number" && stats.totalPL < 0 ? "red" : "emerald"}
          />
        </div>

        {/* Accounts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {loggedUser?.accounts
            ?.slice()
            .reverse()
            .map((value: any, index: number) => {
              const info = accountsData?.find((item: any) => item.MT5Account === +value?.accountNumber);
              const profitPos = typeof info?.Profit === "number" ? info?.Profit >= 0 : true;

              return (
                <motion.div
                  key={value?.accountNumber || index}
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 140, damping: 18 }}
                  whileHover={{ y: -4 }}
                  className="relative overflow-hidden"
                  style={cardShellStyle}
                >
                  {/* Glow ring */}
                  <motion.div
                    className="absolute -inset-px pointer-events-none"
                    style={{ borderRadius: "24px" }}
                    animate={{
                      boxShadow: [
                        `0 0 0 ${rgba(C.accent, 0)}`,
                        `0 0 40px ${rgba(C.accent, 0.22)}`,
                        `0 0 0 ${rgba(C.accent, 0)}`,
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />

                  <div className="p-5">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-xs" style={{ color: rgba(C.mutedFg, 0.65) }}>
                        <span className="opacity-70">AC NO</span>:{" "}
                        <span className="font-mono" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                          {value?.accountNumber}
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.15, rotate: 6 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMoreInfo(value)}
                        aria-label="More info"
                        title="More info"
                        style={{ color: rgba(C.accent, 0.92) }}
                      >
                        <Info size={18} />
                      </motion.button>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2.5 py-1 text-[11px] font-semibold" style={pillStyle("emerald")}>
                        {value?.accountType || "Account"}
                      </span>
                      <span className="px-2.5 py-1 text-[11px] font-semibold" style={pillStyle("cyan")}>
                        Lev {value?.leverage}
                      </span>
                      {value?.platform ? (
                        <span className="px-2.5 py-1 text-[11px] font-semibold" style={pillStyle("indigo")}>
                          {value.platform}
                        </span>
                      ) : null}
                    </div>

                    {/* Figures */}
                    <div className="space-y-2">
                      <Row theme={theme} label="Balance" value={<Money value={info?.Balance} />} prefix="$" />
                      <Row theme={theme} label="Live Equity" value={<Money value={info?.Equity} />} prefix="$" />
                      <Row
                        theme={theme}
                        label="P/L"
                        value={
                          typeof info?.Profit === "number" ? (
                            <span style={{ color: profitPos ? rgba(C.success, 0.95) : rgba(C.danger, 0.95) }}>
                              ${Math.abs(info?.Profit).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <Loader2 className="inline animate-spin" style={{ color: rgba(C.mutedFg, 0.6) }} size={16} />
                          )
                        }
                      />
                    </div>

                    {/* Meta */}
                    <div className="mt-4 text-[11px]" style={{ color: rgba(C.mutedFg, 0.5) }}>
                      <p>{CFformatDate(value?.createdAt)}</p>
                      <p>{CFcalculateTimeSinceJoined(value?.createdAt)}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* Modal */}
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AnimatePresence>
            {isDialogOpen && selectedChallenge && (
              <AlertDialogContent
                as={motion.div as any}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                className="max-w-lg mx-auto text-white"
                style={{
                  borderRadius: "24px",
                  border: `1px solid ${rgba(C.border, 0.18)}`,
                  background: `linear-gradient(135deg, ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.88)}, ${rgba(
                    theme?.surface1 || theme?.bg || "0 0 0",
                    0.92
                  )})`,
                  boxShadow: `0 20px 80px ${rgba(theme?.shadowColor || "0 0 0", 0.55)}`,
                }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-extrabold flex items-center gap-2">
                    <Sparkles style={{ color: rgba(C.accent, 0.92) }} /> Account Info
                  </AlertDialogTitle>

                  <AlertDialogDescription className="mt-3 space-y-2" style={{ color: rgba(C.mutedFg, 0.75) }}>
                    <Line theme={theme} label="Trade Platform" value={selectedChallenge?.platform} />
                    <Line theme={theme} label="Server Name" value={siteConfig?.serverName} />
                    <Line theme={theme} label="Trading Account" value={selectedChallenge?.accountNumber} />
                    <Line theme={theme} label="Leverage" value={selectedChallenge?.leverage} />
                    <Line
                      theme={theme}
                      label="Master Password"
                      value={
                        <>
                          {selectedChallenge?.masterPassword}{" "}
                          <Link
                            to="/user/master-password"
                            style={{ color: rgba(C.accent, 0.92) }}
                            className="hover:opacity-90 ml-2"
                          >
                            change
                          </Link>
                        </>
                      }
                    />
                    <Line
                      theme={theme}
                      label="Investor Password"
                      value={
                        <>
                          {selectedChallenge?.investorPassword}{" "}
                          <Link
                            to="/user/investor-password"
                            style={{ color: rgba(C.accent, 0.92) }}
                            className="hover:opacity-90 ml-2"
                          >
                            change
                          </Link>
                        </>
                      }
                    />
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="mt-5">
                  <AlertDialogCancel
                    className="px-4 py-2 rounded-xl transition-all"
                    style={{
                      borderRadius: radius,
                      background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.22),
                      border: `1px solid ${rgba(C.border, 0.16)}`,
                      color: rgba(theme?.fg || "255 255 255", 0.9),
                    }}
                  >
                    Close
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            )}
          </AnimatePresence>
        </AlertDialog>
      </motion.div>
    </div>
  );
};

export default UserChallenges;

/* --------------------------- Subcomponents --------------------------- */

function StatCard({
  icon,
  label,
  value,
  prefix = "",
  tone = "emerald",
  theme,
}: any) {
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

  const map: any = {
    emerald: theme?.success || "34 197 94",
    cyan: theme?.info || theme?.accent || "59 130 246",
    indigo: theme?.primary || theme?.accent || "147 51 234",
    red: theme?.danger || "244 63 94",
    yellow: theme?.warning || "234 179 8",
  };
  const col = map[tone] || theme?.accent || "59 130 246";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="p-4 flex items-center gap-3"
      style={{
        borderRadius: "24px",
        border: `1px solid ${rgba(col, 0.28)}`,
        background: `linear-gradient(135deg, ${rgba(col, 0.14)}, ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.22)})`,
      }}
    >
      <div
        className="p-2 rounded-xl border"
        style={{
          background: rgba(col, 0.10),
          borderColor: rgba(col, 0.20),
          color: rgba(col, 0.92),
        }}
      >
        {icon}
      </div>
      <div>
        <div className="text-xs" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
          {label}
        </div>
        <div className="text-lg font-bold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
          {prefix}
          {value}
        </div>
      </div>
    </motion.div>
  );
}

function Row({ label, value, prefix, theme }: any) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2"
      style={{
        borderRadius: "14px",
        border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12)}`,
        background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.20),
      }}
    >
      <span style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.6) }}>{label}</span>
      <span style={{ color: rgba(theme?.fg || "255 255 255", 0.9), fontWeight: 600 }}>
        {prefix ? (
          <>
            {prefix}
            {value}
          </>
        ) : (
          value
        )}
      </span>
    </div>
  );
}

function Line({ label, value, theme }: any) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.6) }}>{label}</span>
      <span style={{ color: rgba(theme?.fg || "255 255 255", 0.9), textAlign: "right" }}>
        {value || "—"}
      </span>
    </div>
  );
}
