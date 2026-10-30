import React, { useEffect, useMemo, useState } from "react";
import { Coins, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { motion, animate } from "framer-motion";
import { userApi} from "@/utils/apiClients";
import { useGetInfoByAccounts } from "../../../hooks/user/UseGetInfoByAccounts";

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

/* --- Ambient grid (theme driven) --- */
const AmbientGrid = ({ theme }: { theme: any }) => {
  const line = theme?.accent || "59 130 246";
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.1,
          backgroundImage: `
            linear-gradient(${rgba(line, 0.22)} 1px, transparent 1px),
            linear-gradient(90deg, ${rgba(line, 0.22)} 1px, transparent 1px)
          `,
          backgroundSize: "42px 42px",
          maskImage: "radial-gradient(ellipse at center, black 55%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 55%, transparent 85%)",
        }}
      />
    </div>
  );
};

/* --- Animated number --- */
const AnimatedNumber = ({ value = 0, decimals = 0, suffix = "" }: any) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, Number(value || 0), {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span>
      {Number(display).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

/* --- Card shell (theme driven) --- */
const NeonCard = ({ children, delay = 0, theme }: any) => {
  const border = `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`;
  const bg = `linear-gradient(135deg,
    ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.78)},
    ${rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.86)},
    ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.78)}
  )`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl p-4"
      style={{
        border,
        background: bg,
        boxShadow: `0 0 60px ${rgba(theme?.shadowColor || "0 0 0", 0.35)}`,
      }}
    >
      {/* inner glow border */}
      <div
        className="pointer-events-none absolute inset-px rounded-[calc(1rem-1px)]"
        style={{
          background: `linear-gradient(135deg,
            ${rgba(theme?.accent || "59 130 246", 0.06)},
            ${rgba(theme?.gradientTo || theme?.accent || "147 51 234", 0.05)},
            ${rgba(theme?.accent || "59 130 246", 0.06)}
          )`,
        }}
      />
      {/* sheen */}
      <span
        className="pointer-events-none absolute -inset-x-8 -top-1/2 h-1/2 rotate-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${rgba(theme?.fg || "255 255 255", 0.18)}, transparent)`,
        }}
      />
      {children}
    </motion.div>
  );
};

/* --- Accent chooser for icon bubbles --- */
const getAccentPair = (key: string, theme: any, isPositive?: boolean) => {
  const accent = theme?.accent || "59 130 246";
  const a2 = theme?.gradientTo || "147 51 234";
  const success = theme?.success || theme?.primary || "34 197 94";
  const danger = theme?.danger || "244 63 94";
  const info = theme?.info || accent;
  const warning = theme?.warning || "234 179 8";

  switch (key) {
    case "accounts":
      return [accent, a2];
    case "balance":
      return isPositive ? [success, accent] : [danger, warning];
    case "deposits":
      return [info, a2];
    case "withdrawals":
      return [a2, info];
    case "transfer":
      return [accent, info];
    case "ib":
      return [warning, accent];
    default:
      return [accent, a2];
  }
};

const UserDashboardBalanceCards = () => {
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);

  const [totalTransfer, setTotalTransfer] = useState(0);
  const [totalIbCommission, setTotalIbCommission] = useState(0);


  const loggedUser = useSelector((store: any) => store.user.loggedUser);
  
  const accountIds = loggedUser?.accounts?.map((acc: any) => +acc.accountNumber) || [];
  const { stats: accountsStats, byLogin } = useGetInfoByAccounts(accountIds);
  const balancesLoaded = accountIds.every((id: number) => Number.isFinite(byLogin[String(id)]?.Equity));

  const availableBalance = Number(accountsStats?.totalEquity || 0);
  


  // ✅ theme
  const themeConfig = useSelector((s: any) => s.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const radius = theme?.radius || "14px";

  const isPositive = availableBalance >= 0;



    const fetchCommissions = async () => {
    if (!loggedUser?.referralAccount) return;
    try {
      const res = await userApi.get(`/user-zone-ibs/${loggedUser?.referralAccount}`);
      setTotalIbCommission(res?.data?.data || []);
    } catch {
      // silent
    }
  };


const fetch_TotalTransfer = async () => {
  try {
    const res = await userApi.get(`/transfer/stats`);
    const stats = res?.data?.data;

    // agar tum state me number store kar rahe ho:
    setTotalTransfer(stats?.totalSent ?? 0);

    // agar tum puri stats object store karna chahte ho:
    // setTotalTransfer(stats ?? { totalSent: 0, totalTransfers: 0, totalReceived: 0 });
  } catch (e) {
    // silent
  }
};


  const fetchTotalDeposits = async () => {
    try {
      const res = await userApi.get(`/deposit/${loggedUser._id}`);
      const balance = (res.data?.data || []).reduce((total: number, current: any) => total + Number(current.deposit || 0), 0);
      setTotalDeposits(balance);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTotalWithdrawals = async () => {
    try {
      const res = await userApi.get(`/withdrawals/${loggedUser._id}`);
      const balance = (res.data?.data || []).reduce((total: number, current: any) => total + Number(current.amount || 0), 0);
      console.log(balance);
      
      setTotalWithdrawals(balance);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTotalDeposits();
    fetchTotalWithdrawals();
    fetchCommissions();
    fetch_TotalTransfer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = useMemo(() => {
    return [
      {
        key: "accounts",
        title: "Total MT5 Accounts",
        value: loggedUser?.accounts?.length || 0,
        decimals: 0,
        Icon: Coins,
      },
      {
        key: "balance",
        title: "Available Balance",
        value: availableBalance,
        decimals: 2,
        suffix: " USD",
        Icon: isPositive ? TrendingUp : TrendingDown,
      },
      {
        key: "deposits",
        title: "Total Deposits",
        value: totalDeposits,
        decimals: 2,
        suffix: " USD",
        Icon: ArrowUpCircle,
      },
      {
        key: "withdrawals",
        title: "Total Withdrawals",
        value: totalWithdrawals,
        decimals: 2,
        suffix: " USD",
        Icon: ArrowDownCircle,
      },
      {
        key: "transfer",
        title: "Total Transfer",
        value: totalTransfer,
        decimals: 2,
        suffix: " USD",
        Icon: ArrowDownCircle,
      },
      {
        key: "ib",
        title: "Total IB Comission",
        value: totalIbCommission,
        decimals: 2,
        suffix: " USD",
        Icon: ArrowDownCircle,
      },
    ];
  }, [accountsStats?.totalEquity, isPositive, loggedUser?.accounts, totalDeposits, totalWithdrawals ,totalTransfer ,totalIbCommission]);

  // wrapper styles
  const wrapperStyle = {
    borderRadius: "24px",
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    background: `linear-gradient(135deg,
      ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.55)},
      ${rgba(theme?.bg || "0 0 0", 0.55)},
      ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.55)}
    )`,
    backdropFilter: "blur(16px)",
    color: rgb(theme?.fg || "255 255 255"),
    boxShadow: `0 18px 70px ${rgba(theme?.shadowColor || "0 0 0", 0.4)}`,
  } as React.CSSProperties;

  return (
    <div className="relative">
      <AmbientGrid theme={theme} />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-4" style={wrapperStyle}>
        {cards.map((c: any, i: number) => {
          const [c1, c2] = getAccentPair(c.key, theme, isPositive);

          return (
            <NeonCard key={c.title} delay={i * 0.05} theme={theme}>
              <div className="relative flex items-center gap-4">
                {/* icon bubble */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border shadow-inner"
                  style={{
                    borderColor: rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14),
                    borderRadius: radius,
                    background: `linear-gradient(135deg, ${rgba(c1, 0.22)}, ${rgba(c2, 0.18)})`,
                  }}
                >
                  <c.Icon style={{ color: rgba(theme?.fg || "255 255 255", 0.95) }} size={20} />
                </motion.div>

                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.62) }}>
                    {c.title}
                  </p>

                  <p className="text-lg font-extrabold leading-tight" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                    {c.key === "balance" && !balancesLoaded ? "--" : (
                      <AnimatedNumber value={c.value} decimals={c.decimals} suffix={c.suffix || ""} />
                    )}
                  </p>
                </div>
              </div>

              {/* bottom glow line */}
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.05 }}
                className="mt-4 h-[2px] rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${rgba(c1, 0.65)}, ${rgba(c2, 0.65)})`,
                  boxShadow: `0 0 18px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.18)}`,
                }}
              />
            </NeonCard>
          );
        })}
      </div>
    </div>
  );
};

export default UserDashboardBalanceCards;
