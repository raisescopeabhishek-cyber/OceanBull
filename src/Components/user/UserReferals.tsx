// UserReferal.tsx  ✅ updated with dynamic theme (same pattern as LoginLogs / UserNewChallenge)
import { useEffect, useMemo, useRef, useState, Fragment, type CSSProperties } from "react";
import {
  Copy,
  Check,
  Smile,
  Users,
  ArrowRight,
  ChartBar,
  Wallet as WalletIcon,
  Gift,
  Share2Icon,
  Shield,
  Link as LinkIcon,
  TrendingUp,
  Zap,
  Award,
  DollarSign,
  Loader2,
  ArrowLeft,
  BadgeDollarSign,
  WalletCardsIcon,
  RefreshCw,
  Calendar,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Globe,
} from "lucide-react";
import { FaFacebookF, FaShareAlt, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import UseUserHook from "@/hooks/user/UseUserHook";
import toast from "react-hot-toast";
import { CFgenerateRandomNumber } from "../../utils/CustomFunctions";
import { userApi } from "../../utils/apiClients";
import { FloatingParticles } from "../../utils/FloatingParticles";
import { AnimatedGrid } from "../../utils/AnimatedGrid";
import { PageHeader } from "@/Components/ui";

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

/* ----------------------------- Animation helpers ---------------------------- */
const fadeIn = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
  transition: { duration: 0.35 },
};

const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.35, delay },
});

/* --------------------------------- Utils --------------------------------- */
const money = (n: number | string = 0, d = 2) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })}`;

const methodNice = (m?: string) => {
  switch ((m || "").toLowerCase()) {
    case "usdttrc20":
    case "usdt(trc20)":
    case "usdt_trc20":
    case "usdt-trc20":
    case "usdt trc20":
      return "USDT (TRC20)";
    case "usdtbep20":
    case "usdt(bep20)":
    case "usdt_bep20":
    case "usdt-bep20":
    case "usdt bep20":
      return "USDT (BEP20)";
    case "binanceid":
    case "binance id":
      return "Binance ID";
    case "btcaddress":
    case "btc address":
      return "BTC Address";
    case "bank":
    case "bank transfer":
      return "Bank Transfer";
    default:
      return m || "—";
  }
};

const formatDate = (iso?: string) => {
  if (!iso) return "--";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-GB", { year: "numeric", day: "2-digit", month: "2-digit" }) +
    ", " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
  );
};

const since = (iso?: string) => {
  if (!iso) return "--";
  const joinDate = new Date(iso);
  const today = new Date();
  const diff = Math.max(0, today.getTime() - joinDate.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  return parts.length ? `${parts.join(", ")} ago` : "less than a minute ago";
};

/* -------------------------------- Main Component -------------------------------- */
type TabKey = "overview" | "referrals" | "commission" | "withdraw" | "withdrawal-history" | "referrals-details";

const UserReferal = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const loggedUser = useSelector((store: any) => store.user.loggedUser);
  const siteConfig = useSelector((state: any) => state.user.siteConfig);

  // ✅ dynamic theme (same as LoginLogs)
  const themeConfig = useSelector((state: any) => state.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const radius = theme?.radius || "14px";

  const { getUpdateLoggedUser } = UseUserHook();
  const hasAnimatedRef = useRef(false);
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const extractedUrl = currentUrl ? new URL(currentUrl).origin : "";

  const [commissionsData, setCommissionsData] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loadingWd, setLoadingWd] = useState(false);

  /* --------------------------- Theme styles --------------------------- */
  const pageBgStyle: CSSProperties = {
    minHeight: "100vh",
    background: `radial-gradient(1200px 600px at 18% 0%, ${rgba(theme?.glow || theme?.accent, 0.16)}, transparent 60%),
                 radial-gradient(900px 480px at 82% 12%, ${rgba(theme?.gradientTo || theme?.accent, 0.12)}, transparent 55%),
                 linear-gradient(135deg, ${rgb(theme?.bg || "0 0 0")}, ${rgb(theme?.surface1 || theme?.bg || "0 0 0")}, ${rgb(
      theme?.bg || "0 0 0"
    )})`,
    color: rgb(theme?.fg || "255 255 255"),
  };

  const mutedText: CSSProperties = { color: rgba(theme?.mutedFg || theme?.fg, 0.7) };
  const subtleText: CSSProperties = { color: rgba(theme?.mutedFg || theme?.fg, 0.6) };
  const iconAccent: CSSProperties = { color: rgba(theme?.accent || theme?.gradientFrom || "79 125 246", 0.95) };

  const inputStyle: CSSProperties = {
    width: "100%",
    borderRadius: radius,
    background: rgba(theme?.input || theme?.surface2 || "15 24 41", 0.35),
    border: `1px solid ${rgba(theme?.inputBorder || theme?.border || "255 255 255", 0.18)}`,
    color: rgb(theme?.fg || "255 255 255"),
    outline: "none",
  };

  const selectStyle: CSSProperties = {
    ...inputStyle,
    padding: "12px 12px",
  };

  const focusOn = (el: HTMLInputElement | HTMLSelectElement) => {
    el.style.boxShadow = `0 0 0 3px ${rgba(theme?.ring || theme?.accent || "79 125 246", 0.25)}`;
    el.style.borderColor = rgba(theme?.ring || theme?.accent || "79 125 246", 0.45);
  };
  const focusOff = (el: HTMLInputElement | HTMLSelectElement) => {
    el.style.boxShadow = "none";
    el.style.borderColor = rgba(theme?.inputBorder || theme?.border || "255 255 255", 0.18);
  };

  const chipStyle = (s?: string): CSSProperties => {
    const st = String(s || "").toLowerCase();
    if (st === "pending")
      return {
        background: rgba(theme?.warning || "42 86 220", 0.14),
        border: `1px solid ${rgba(theme?.warning || "42 86 220", 0.26)}`,
        color: rgba(theme?.warningFg || theme?.fg || "255 255 255", 0.92),
      };
    if (st === "approved")
      return {
        background: rgba(theme?.success || "15 159 110", 0.14),
        border: `1px solid ${rgba(theme?.success || "15 159 110", 0.26)}`,
        color: rgba(theme?.successFg || theme?.fg || "255 255 255", 0.92),
      };
    if (st === "rejected")
      return {
        background: rgba(theme?.danger || "220 58 58", 0.14),
        border: `1px solid ${rgba(theme?.danger || "220 58 58", 0.26)}`,
        color: rgba(theme?.dangerFg || theme?.fg || "255 255 255", 0.92),
      };
    return {
      background: rgba(theme?.muted || theme?.surface2 || "163 177 198", 0.12),
      border: `1px solid ${rgba(theme?.border || "255 255 255", 0.14)}`,
      color: rgba(theme?.fg || "255 255 255", 0.85),
    };
  };

  /* ------------------------------ UI components ------------------------------ */
  const GlassCard = ({
    children,
    className = "",
    tone = "neutral",
  }: {
    children: React.ReactNode;
    className?: string;
    tone?: "neutral" | "accent";
  }) => {
    const toneBg =
      tone === "accent"
        ? `linear-gradient(135deg,
            ${rgba(theme?.gradientFrom || theme?.accent || "79 125 246", 0.18)},
            ${rgba(theme?.surface2 || theme?.card || "15 24 41", 0.68)},
            ${rgba(theme?.gradientTo || "23 157 166", 0.14)})`
        : `linear-gradient(135deg,
            ${rgba(theme?.surface2 || theme?.card || "15 24 41", 0.72)},
            ${rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.78)},
            ${rgba(theme?.surface2 || theme?.card || "15 24 41", 0.72)})`;

    const cardStyle: CSSProperties = {
      borderRadius: "24px",
      border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
      background: toneBg,
      boxShadow: `0 18px 70px ${rgba(theme?.shadowColor || "0 0 0", 0.55)}`,
      backdropFilter: "blur(18px)",
    };

    const innerGlow: CSSProperties = {
      position: "absolute",
      inset: "1px",
      borderRadius: "calc(24px - 1px)",
      background: `linear-gradient(135deg,
        ${rgba(theme?.gradientFrom || theme?.accent || "79 125 246", 0.08)},
        ${rgba(theme?.accent || "79 125 246", 0.05)},
        ${rgba(theme?.gradientTo || "23 157 166", 0.08)}
      )`,
      pointerEvents: "none",
    };

    return (
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
        className={`relative p-6 shadow-2xl ${className}`}
        style={cardStyle}
      >
        <div style={innerGlow} />
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    variant = "accent",
    delay = 0,
  }: {
    icon: any;
    label: string;
    value: string | number;
    variant?: "accent" | "success" | "info" | "warning";
    delay?: number;
  }) => {
    const token =
      variant === "success"
        ? theme?.success || "15 159 110"
        : variant === "warning"
        ? theme?.warning || "42 86 220"
        : variant === "info"
        ? theme?.info || theme?.accent || "79 125 246"
        : theme?.accent || "79 125 246";

    return (
      <motion.div
        {...scaleIn(delay)}
        whileHover={{ scale: 1.02 }}
        className="rounded-card p-5"
        style={{
          borderRadius: "18px",
          border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
          background: `linear-gradient(135deg, ${rgba(token, 0.16)}, ${rgba(theme?.surface2 || "15 24 41", 0.22)})`,
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="p-2 rounded-card"
            style={{
              background: rgba(token, 0.18),
              border: `1px solid ${rgba(token, 0.22)}`,
            }}
          >
            <Icon className="w-5 h-5" style={{ color: rgba(token, 0.95) }} />
          </div>
          <TrendingUp className="w-4 h-4" style={{ color: rgba(token, 0.85) }} />
        </div>

        <div className="text-2xl font-bold mb-1" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
          {value}
        </div>
        <div className="text-sm" style={subtleText}>
          {label}
        </div>
      </motion.div>
    );
  };

  /** ModernHeading — inline (no external import) */
  const ModernHeading = ({ text }: { text: string }) => (
    <div className="modern-heading relative inline-block">
      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text relative"
        style={{
          backgroundImage: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "79 125 246")}, ${rgb(
            theme?.accent || theme?.primary || "15 159 110"
          )}, ${rgb(theme?.gradientTo || "23 157 166")})`,
        }}
      >
        {text}
      </motion.h1>

      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }} className="mt-1">
        <svg width="100%" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
          <defs>
            <linearGradient id="neonGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={rgb(theme?.gradientFrom || theme?.accent || "79 125 246")} />
              <stop offset="50%" stopColor={rgb(theme?.accent || theme?.primary || "15 159 110")} />
              <stop offset="100%" stopColor={rgb(theme?.gradientTo || "23 157 166")} />
            </linearGradient>
          </defs>
          <path d="M0,8 C25,0 75,0 100,8" fill="none" stroke="url(#neonGradient)" strokeWidth="2" />
        </svg>
      </motion.div>
    </div>
  );

  const SmallStat = ({
    icon: Icon,
    title,
    value,
    subtitle,
    token = theme?.accent || "79 125 246",
  }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    token?: any;
  }) => (
    <div
      className="relative rounded-card p-4 transition-all"
      style={{
        borderRadius: "18px",
        background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.22),
        border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
      }}
    >
      <div
        className="absolute -inset-px rounded-card blur-md"
        style={{ opacity: 0.18, background: `linear-gradient(90deg, ${rgba(token, 0.5)}, ${rgba(theme?.gradientTo || token, 0.45)})` }}
      />
      <div className="relative flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-card flex items-center justify-center"
          style={{
            background: `linear-gradient(90deg, ${rgba(token, 0.9)}, ${rgba(theme?.gradientTo || token, 0.9)})`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color: rgba(theme?.primaryFg || "255 255 255", 0.95) }} />
        </div>
        <div className="flex-1">
          <p className="text-xs" style={subtleText}>
            {title}
          </p>
          <p className="text-lg font-semibold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.55) }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  /* --------------------------------- Effects -------------------------------- */
  useEffect(() => {
    if (!hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      getUpdateLoggedUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loggedUser?.referralAccount) {
      fetchCommissions();
      fetchWithdrawals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedUser?.referralAccount]);

  /* --------------------------------- Data --------------------------------- */
  const fetchCommissions = async () => {
    if (!loggedUser?.referralAccount) return;
    try {
      const res = await userApi.get(`/user-zone-ibs/${loggedUser?.referralAccount}`);
      setCommissionsData(res?.data?.data || []);
    } catch {
      // silent
    }
  };

  const fetchWithdrawals = async () => {
    if (!loggedUser?._id) return;
    setLoadingWd(true);
    try {
      const res = await userApi.get(`/ib-withdrawals/${loggedUser._id}`);
      setWithdrawals((res.data?.data || []).reverse());
    } catch {
      // ignore
    } finally {
      setLoadingWd(false);
    }
  };

  const totalCommission = useMemo(() => {
    const direct = commissionsData.reduce((s, r) => s + Number(r?.commission || 0), 0);
    const perUser = commissionsData.reduce((s, r) => s + Number(r?.totalCommission || 0), 0);
    return direct > 0 ? direct : perUser;
  }, [commissionsData]);

  const approvedWithdrawalAmount = useMemo(
    () =>
      withdrawals
        .filter((w: any) => String(w?.status).toLowerCase() === "approved")
        .reduce((s, w) => s + Number(w?.amount || 0), 0),
    [withdrawals]
  );

  /* -------------------------------- Actions -------------------------------- */
  const generateHandler = async () => {
    const randomNumber = CFgenerateRandomNumber(7);
    const toastId = toast.loading("Generating..");
    try {
      await userApi.put(`/update-user`, {
        id: loggedUser._id,
        referralAccount: randomNumber,
      });
      toast.success("Affiliate account created", { id: toastId });
      getUpdateLoggedUser();
      setActiveTab("overview");
    } catch (error: any) {
      toast.error(`Please try again later. ${error?.response?.data?.code ?? ""}`, { id: toastId });
    }
  };

  /* ------------------------------- Small UI ------------------------------- */
  const ReferralLinkInput = ({ referralLink }: { referralLink: string }) => {
    const [isCopied, setIsCopied] = useState(false);
    const copyToClipboard = () => {
      navigator.clipboard.writeText(referralLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1800);
    };

    return (
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="text-sm font-medium"
            style={{ ...inputStyle, padding: "14px 112px 14px 14px" }}
            onFocus={(e) => focusOn(e.currentTarget)}
            onBlur={(e) => focusOff(e.currentTarget)}
          />
          <button
            onClick={copyToClipboard}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-card font-semibold text-sm transition-all duration-300 flex items-center gap-2"
            style={
              isCopied
                ? {
                    background: rgba(theme?.success || "15 159 110", 0.16),
                    border: `1px solid ${rgba(theme?.success || "15 159 110", 0.28)}`,
                    color: rgba(theme?.successFg || theme?.fg, 0.92),
                  }
                : {
                    background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.22),
                    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
                    color: rgba(theme?.fg || "255 255 255", 0.88),
                  }
            }
          >
            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {isCopied ? "Copied" : "Copy"}
          </button>
        </div>

        <SharePopover referralLink={referralLink} />
      </div>
    );
  };

  const SharePopover = ({ referralLink }: { referralLink: string }) => {
    const [open, setOpen] = useState(false);
    const shareOnPlatform = (platform: "whatsapp" | "facebook" | "twitter" | "native") => {
      const shareText = `Join me and earn with this broker — sign up here: ${referralLink}`;
      if (platform === "native" && (navigator as any).share) {
        (navigator as any).share({ title: "Referral Link", text: "Check out this awesome referral link!", url: referralLink }).catch(() => {});
        setOpen(false);
        return;
      }
      const urls: Record<string, string> = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      };
      if (platform !== "native") window.open(urls[platform], "_blank");
      setOpen(false);
    };

    const shareBtnStyle: CSSProperties = {
      borderRadius: "18px",
      padding: "12px 18px",
      fontWeight: 700,
      color: rgb(theme?.primaryFg || "0 0 0"),
      background: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "79 125 246")}, ${rgb(
        theme?.accent || theme?.primary || "15 159 110"
      )}, ${rgb(theme?.gradientTo || "23 157 166")})`,
      border: `1px solid ${rgba(theme?.ring || theme?.accent || "79 125 246", 0.22)}`,
      boxShadow: `0 14px 36px ${rgba(theme?.glow || theme?.accent || "79 125 246", 0.22)}`,
    };

    return (
      <div className="relative">
        <motion.button onClick={() => setOpen((v) => !v)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={shareBtnStyle} className="flex items-center gap-2">
          <Share2Icon className="w-4 h-4" /> Share
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute z-10 mt-2 w-56 p-3 rounded-card"
              style={{
                background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.92),
                border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="grid grid-cols-4 gap-2" style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}>
                <button onClick={() => shareOnPlatform("whatsapp")} className="p-2 rounded-field" style={{ background: rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.25) }}>
                  <FaWhatsapp size={22} />
                </button>
                <button onClick={() => shareOnPlatform("facebook")} className="p-2 rounded-field" style={{ background: rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.25) }}>
                  <FaFacebookF size={22} />
                </button>
                <button onClick={() => shareOnPlatform("twitter")} className="p-2 rounded-field" style={{ background: rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.25) }}>
                  <FaXTwitter size={22} />
                </button>
                <button onClick={() => shareOnPlatform("native")} className="p-2 rounded-field" style={{ background: rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.25) }}>
                  <FaShareAlt size={22} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const EmptyState = ({ onGenerate }: { onGenerate: () => void }) => (
    <motion.div {...fadeIn} className="text-center py-12">
      <div
        className="w-20 h-20 rounded-full grid place-items-center mx-auto mb-6"
        style={{
          background: `linear-gradient(135deg, ${rgba(theme?.accent || "79 125 246", 0.18)}, ${rgba(theme?.gradientTo || "23 157 166", 0.14)})`,
          border: `1px solid ${rgba(theme?.border || "255 255 255", 0.14)}`,
        }}
      >
        <Users className="w-10 h-10" style={iconAccent} />
      </div>
      <h3 className="text-2xl font-bold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
        Start Your Affiliate Journey
      </h3>
      <p className="mt-2 mb-8 max-w-md mx-auto" style={mutedText}>
        Generate your unique affiliate account and start earning commissions on every trade your referrals make.
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onGenerate}
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold"
        style={{
          color: rgb(theme?.primaryFg || "0 0 0"),
          background: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "79 125 246")}, ${rgb(
            theme?.accent || theme?.primary || "15 159 110"
          )}, ${rgb(theme?.gradientTo || "23 157 166")})`,
          boxShadow: `0 16px 46px ${rgba(theme?.glow || theme?.accent || "79 125 246", 0.26)}`,
        }}
      >
        <Zap className="w-5 h-5" />
        Generate Affiliate Account
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );

  /* ------------------------------- Subviews ------------------------------- */
  const OverviewView = () => {
    const totalReferrals = loggedUser?.referredUsers?.length || 0;
    const activeReferrals = commissionsData.length;
    const referralLink = loggedUser?.referralAccount && `${extractedUrl}/user/signup/${loggedUser?.referralAccount}`;

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={DollarSign} label="Total Earned" value={money(totalCommission)} variant="success" />
          <StatCard icon={Users} label="Total Referrals" value={totalReferrals} variant="info" delay={0.05} />
          <StatCard icon={TrendingUp} label="Active Traders" value={activeReferrals} variant="accent" delay={0.1} />
          <StatCard icon={Award} label="Commission Rate" value={`${siteConfig?.commissionPercent ?? "10%"}`} variant="warning" delay={0.15} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2">
            <GlassCard>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="p-3 rounded-card"
                  style={{
                    background: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "79 125 246")}, ${rgb(theme?.gradientTo || "23 157 166")})`,
                    color: rgb(theme?.primaryFg || "255 255 255"),
                  }}
                >
                  <LinkIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                    Your Affiliate Program
                  </h2>
                  <p className="text-sm" style={mutedText}>
                    Share and earn unlimited commissions
                  </p>
                </div>
              </div>

              {loggedUser?.referralAccount ? (
                <div className="space-y-4">
                  <div
                    className="rounded-card p-4"
                    style={{
                      background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.22),
                      border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
                    }}
                  >
                    <label className="text-sm mb-2 block" style={mutedText}>
                      Your Referral Link
                    </label>
                    {referralLink && <ReferralLinkInput referralLink={referralLink} />}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab("referrals-details")}
                      className="px-4 py-2 rounded-card transition"
                      style={{
                        background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.18),
                        border: `1px solid ${rgba(theme?.border || "255 255 255", 0.14)}`,
                        color: rgba(theme?.fg || "255 255 255", 0.88),
                      }}
                    >
                      View Referrals
                    </button>
                    <button
                      onClick={() => setActiveTab("commission")}
                      className="px-4 py-2 rounded-card transition"
                      style={{
                        background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.18),
                        border: `1px solid ${rgba(theme?.border || "255 255 255", 0.14)}`,
                        color: rgba(theme?.fg || "255 255 255", 0.88),
                      }}
                    >
                      Commission Dashboard
                    </button>
                    <button
                      onClick={() => setActiveTab("withdraw")}
                      className="px-4 py-2 rounded-card font-semibold transition"
                      style={{
                        color: rgb(theme?.primaryFg || "0 0 0"),
                        background: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "79 125 246")}, ${rgb(
                          theme?.accent || theme?.primary || "15 159 110"
                        )}, ${rgb(theme?.gradientTo || "23 157 166")})`,
                      }}
                    >
                      Withdraw Earnings
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyState onGenerate={generateHandler} />
              )}
            </GlassCard>
          </div>

          {/* Right */}
          <div className="space-y-4">
            {loggedUser?.referralAccount && (
              <GlassCard tone="accent">
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                  <Share2Icon className="w-5 h-5" style={iconAccent} />
                  Quick Share
                </h3>
                {referralLink && (
                  <div className="flex items-center gap-3" style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Join me and earn with this broker — sign up here: ${referralLink}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-card"
                      style={{ background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.22), border: `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}` }}
                    >
                      <FaWhatsapp size={22} />
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-card"
                      style={{ background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.22), border: `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}` }}
                    >
                      <FaFacebookF size={22} />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me and earn with this broker — sign up here: ${referralLink}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-card"
                      style={{ background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.22), border: `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}` }}
                    >
                      <FaXTwitter size={22} />
                    </a>
                  </div>
                )}
              </GlassCard>
            )}

            {loggedUser?.referralAccount && (
              <GlassCard>
                <div className="text-center">
                  <div className="text-xs mb-1" style={mutedText}>
                    Your Affiliate ID
                  </div>
                  <div className="text-2xl font-mono font-bold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                    {loggedUser?.referralAccount}
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 text-sm" style={{ color: rgba(theme?.success || "15 159 110", 0.95) }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: rgba(theme?.success || "15 159 110", 0.95) }} />
                    Active
                  </div>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ------------------------- Withdraw (inline view) ------------------------- */
  const WithdrawalsFormView = () => {
    const [selectedGateway, setSelectedGateway] = useState("Bank Transfer");
    const [apiLoader, setApiLoader] = useState(false);
    const [error, setError] = useState("");
    const [amount, setAmount] = useState("");
    const [selectWallet, setSelectWallet] = useState("usdtTrc20");
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const balance = Number(loggedUser?.ibBalance || 0).toFixed(4);

    const currentDateTime = new Date();
    const formattedDateTime =
      currentDateTime.toLocaleDateString("en-GB") +
      ", " +
      currentDateTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

    const customContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Withdrawal Request Confirmation</title></head>
<body><div><h2>Commission Withdrawal Requested</h2>
<p>Dear ${loggedUser?.firstName || ""} ${loggedUser?.lastName || ""},</p>
<p>We received your commission withdrawal request.</p>
<p><b>Username:</b> ${loggedUser?.email}</p>
<p><b>Total Amount:</b> ${balance}</p>
<p><b>Withdrawal Amount:</b> ${amount}</p>
<p><b>Updated:</b> ${formattedDateTime}</p></div></body></html>`;

    const withdrawalHandler = async (e: any) => {
      e.preventDefault();
      if (isWithdrawing) return;

      setApiLoader(true);
      setError("");
      setIsWithdrawing(true);

      try {
        const balNum = Number(balance);
        const amtNum = Number(amount);

        if (balNum <= 0) setError(`You don't have sufficient balance for withdrawal.`);
        else if (Number.isNaN(amtNum) || amtNum <= 0) setError(`Enter a valid withdrawal amount.`);
        else if (amtNum > balNum) setError(`Amount must be less than or equal to $${balance}`);
        else {
          await userApi.post(`/add-referral-withdrawal`, {
            referralId: loggedUser.referralAccount,
            method: selectedGateway === "Bank Transfer" ? selectedGateway : selectWallet,
            amount: amtNum,
            status: "pending",
            userId: loggedUser._id,
            managerIndex: import.meta.env.VITE_MANAGER_INDEX,
            totalBalance: balance,
            level: 1,
          });

          try {
            await userApi.post(`/custom-mail`, { email: loggedUser.email, content: customContent, subject: "IB Withdrawal Requested" });
          } catch {
            // ignore
          }

          toast.success("Withdrawal Requested");
          setAmount("");
          fetchWithdrawals();
          getUpdateLoggedUser();
        }
      } catch (error) {
        toast.error("Something went wrong!!");
        // eslint-disable-next-line no-console
        console.log("error while withdraw", error);
      } finally {
        setApiLoader(false);
        setIsWithdrawing(false);
      }
    };

    return (
      <div className="space-y-6">
        <GlassCard>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("commission")}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
                style={{
                  border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.16)}`,
                  background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.18),
                  color: rgba(theme?.fg || "255 255 255", 0.85),
                }}
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <ModernHeading text="Withdraw IB Commission" />
            </div>

            <div className="text-right">
              <h1 className="font-semibold text-sm" style={mutedText}>
                Withdrawable amount
              </h1>
              <div
                className="px-4 py-1 rounded-full mt-1"
                style={{
                  background: rgba(theme?.warning || theme?.accent || "42 86 220", 0.12),
                  border: `1px solid ${rgba(theme?.warning || theme?.accent || "42 86 220", 0.22)}`,
                }}
              >
                <p className="font-semibold text-sm" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                  ${balance}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={withdrawalHandler} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full">
                <label htmlFor="gateway" className="block text-sm font-medium mb-2" style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}>
                  Method
                </label>
                <select
                  id="gateway"
                  value={selectedGateway}
                  onChange={(e) => setSelectedGateway(e.target.value)}
                  style={selectStyle}
                  onFocus={(e) => focusOn(e.currentTarget)}
                  onBlur={(e) => focusOff(e.currentTarget)}
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Wallet Transfer">Wallet Transfer</option>
                </select>
              </div>

              {selectedGateway === "Wallet Transfer" && (
                <div className="w-full">
                  <label htmlFor="account" className="block text-sm font-medium mb-2" style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}>
                    Choose Wallet
                  </label>
                  <select
                    id="account"
                    value={selectWallet}
                    onChange={(e) => setSelectWallet(e.target.value)}
                    style={selectStyle}
                    onFocus={(e) => focusOn(e.currentTarget)}
                    onBlur={(e) => focusOff(e.currentTarget)}
                  >
                    <option value="usdtTrc20">USDT (Trc20)</option>
                    <option value="usdtBep20">USDT (Bep20)</option>
                    <option value="binanceId">Binance ID</option>
                    <option value="btcAddress">BTC Address</option>
                  </select>
                </div>
              )}
            </div>

            <div
              className="rounded-card p-5"
              style={{
                background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.18),
                border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-10 h-10 rounded-card flex items-center justify-center"
                  style={{ background: rgba(theme?.accent || "79 125 246", 0.12), border: `1px solid ${rgba(theme?.accent || "79 125 246", 0.18)}` }}
                >
                  <WalletCardsIcon className="w-5 h-5" style={iconAccent} />
                </div>
                <h2 className="font-semibold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                  Account details
                </h2>
              </div>

              {selectedGateway === "Bank Transfer" ? (
                <div className="grid sm:grid-cols-2 gap-3" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.72) }}>
                  <p>
                    Bank Name: <span style={{ color: rgba(theme?.fg || "255 255 255", 0.92), fontWeight: 700 }}>{loggedUser?.bankDetails?.bankName}</span>
                  </p>
                  <p>
                    Holder Name: <span style={{ color: rgba(theme?.fg || "255 255 255", 0.92), fontWeight: 700 }}>{loggedUser?.bankDetails?.holderName}</span>
                  </p>
                  <p>
                    Account Number: <span style={{ color: rgba(theme?.fg || "255 255 255", 0.92), fontWeight: 700 }}>{loggedUser?.bankDetails?.accountNumber}</span>
                  </p>
                  <p>
                    IFSC Code: <span style={{ color: rgba(theme?.fg || "255 255 255", 0.92), fontWeight: 700 }}>{loggedUser?.bankDetails?.ifscCode}</span>
                  </p>
                  <p>
                    Swift Code: <span style={{ color: rgba(theme?.fg || "255 255 255", 0.92), fontWeight: 700 }}>{loggedUser?.bankDetails?.swiftCode}</span>
                  </p>
                  <p>
                    UPI ID: <span style={{ color: rgba(theme?.fg || "255 255 255", 0.92), fontWeight: 700 }}>{loggedUser?.bankDetails?.upiId}</span>
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.72) }}>
                  {selectWallet === "usdtTrc20" && (
                    <p>
                      USDT TRC20: <span style={{ color: rgba(theme?.fg || "255 255 255", 0.92), fontWeight: 700 }}>{loggedUser?.walletDetails?.tetherAddress}</span>
                    </p>
                  )}
                  {selectWallet === "usdtBep20" && (
                    <p>
                      USDT BEP20: <span style={{ color: rgba(theme?.fg || "255 255 255", 0.92), fontWeight: 700 }}>{loggedUser?.walletDetails?.ethAddress}</span>
                    </p>
                  )}
                  {selectWallet === "binanceId" && (
                    <p>
                      Binance ID: <span style={{ color: rgba(theme?.fg || "255 255 255", 0.92), fontWeight: 700 }}>{loggedUser?.walletDetails?.accountNumber}</span>
                    </p>
                  )}
                  {selectWallet === "btcAddress" && (
                    <p>
                      BTC Address: <span style={{ color: rgba(theme?.fg || "255 255 255", 0.92), fontWeight: 700 }}>{loggedUser?.walletDetails?.trxAddress}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-2" style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}>
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BadgeDollarSign className="h-5 w-5" style={iconAccent} />
                </div>
                <input
                  type="text"
                  id="amount"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ ...inputStyle, padding: "12px 14px 12px 44px" }}
                  onFocus={(e) => focusOn(e.currentTarget)}
                  onBlur={(e) => focusOff(e.currentTarget)}
                />
              </div>
              <style>{`#amount::placeholder{ color: ${rgba(theme?.placeholder || theme?.mutedFg || theme?.fg, 0.55)}; }`}</style>
            </div>

            <motion.button
              type="submit"
              disabled={isWithdrawing}
              whileHover={{ scale: isWithdrawing ? 1 : 1.01 }}
              whileTap={{ scale: isWithdrawing ? 1 : 0.99 }}
              className="w-full flex justify-center items-center gap-2 py-3 font-semibold transition-all"
              style={{
                borderRadius: radius,
                color: rgb(theme?.primaryFg || "0 0 0"),
                background: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "79 125 246")}, ${rgb(
                  theme?.accent || theme?.primary || "15 159 110"
                )}, ${rgb(theme?.gradientTo || "23 157 166")})`,
                border: `1px solid ${rgba(theme?.ring || theme?.accent || "79 125 246", 0.22)}`,
                boxShadow: `0 14px 36px ${rgba(theme?.glow || theme?.accent || "79 125 246", 0.24)}`,
                opacity: isWithdrawing ? 0.65 : 1,
                cursor: isWithdrawing ? "not-allowed" : "pointer",
              }}
            >
              {isWithdrawing ? "Processing..." : "Submit Withdrawal"}
              {(apiLoader || isWithdrawing) && <Loader2 className="animate-spin" />}
            </motion.button>

            {error && (
              <div className="text-center">
                <p style={{ color: rgba(theme?.danger || "248 113 113", 0.95), fontWeight: 700 }}>{error}</p>
              </div>
            )}
          </form>
        </GlassCard>
      </div>
    );
  };


    /* ------------------------- IB Details (inline view) ------------------------- */
  const ReferralsDetailsView = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedEmails, setExpandedEmails] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 10;

    const refresh = async () => {
      setIsLoading(true);
      try {
        await fetchCommissions();
      } finally {
        setIsLoading(false);
      }
    };

    const toggleDropdown = (email: string) =>
      setExpandedEmails((prev) => ({ ...prev, [email]: !prev[email] }));

    const filteredData = useMemo(() => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return commissionsData;
      return commissionsData.filter(
        (item: any) =>
          (item.email || "").toLowerCase().includes(q) ||
          (item.name || "").toLowerCase().includes(q) ||
          (item.country || "").toLowerCase().includes(q) ||
          String(item.accountNumber || "").toLowerCase().includes(q)
      );
    }, [commissionsData, searchTerm]);

    const groupedData = useMemo(() => {
      return filteredData.reduce((acc: Record<string, any[]>, item: any) => {
        const key = item.email || "unknown";
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});
    }, [filteredData]);

    const emails = useMemo(() => Object.keys(groupedData), [groupedData]);

    useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.max(1, Math.ceil(emails.length / ITEMS_PER_PAGE));

    const paginatedEmails = useMemo(() => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      return emails.slice(start, start + ITEMS_PER_PAGE);
    }, [emails, currentPage]);

    const stats = useMemo(() => {
      const totalUsers = commissionsData.length;
      const uniqueEmails = new Set(commissionsData.map((u: any) => u.email)).size;
      const totalCommission = commissionsData.reduce((s: number, u: any) => s + Number(u.totalCommission || 0), 0);
      const totalVolume = commissionsData.reduce((s: number, u: any) => s + Number(u.totalLot || 0), 0);

      const activeUsers = commissionsData.filter(
        (u: any) => Number(u.totalCommission || 0) > 0 || Number(u.totalLot || 0) > 0
      ).length;

      const countryDistribution = commissionsData.reduce((acc: Record<string, number>, u: any) => {
        const c = u.country === "Unknown" ? "Unknown" : u.country || "Unknown";
        acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {});
      const topCountry =
        Object.entries(countryDistribution).sort(([, a], [, b]) => Number(b) - Number(a))[0] || ["Unknown", 0];

      const avgCommission = totalUsers ? totalCommission / totalUsers : 0;
      const avgVolume = totalUsers ? totalVolume / totalUsers : 0;

      return {
        totalUsers,
        uniqueEmails,
        totalCommission,
        totalVolume,
        activeUsers,
        topCountry,
        avgCommission,
        avgVolume,
        activeRate: totalUsers ? (activeUsers / totalUsers) * 100 : 0,
      };
    }, [commissionsData]);

    return (
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("commission")}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
              style={{
                border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.16)}`,
                background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.18),
                color: rgba(theme?.fg || "255 255 255", 0.85),
              }}
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <ModernHeading text="IB Users" />
          </div>

          <div className="flex items-stretch gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                placeholder="Search name, email, country or account…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ ...inputStyle, padding: "12px 42px 12px 14px" }}
                onFocus={(e) => focusOn(e.currentTarget)}
                onBlur={(e) => focusOff(e.currentTarget)}
              />
              <style>{`input::placeholder{ color:${rgba(theme?.placeholder || theme?.mutedFg || theme?.fg, 0.55)}; }`}</style>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.7) }}
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={refresh}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-card transition-all flex items-center gap-2"
              style={{
                background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.18),
                border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
                color: rgba(theme?.fg || "255 255 255", 0.88),
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <SmallStat
            icon={Users}
            title="Total Users"
            value={stats.totalUsers || 0}
            subtitle={`${stats.uniqueEmails || 0} unique`}
            token={theme?.info || theme?.accent || "79 125 246"}
          />
          <SmallStat
            icon={DollarSign}
            title="Total Commission"
            value={Number(stats.totalCommission || 0).toFixed(4)}
            subtitle={`${Number(stats.avgCommission || 0).toFixed(4)}/user`}
            token={theme?.success || "15 159 110"}
          />
          <SmallStat
            icon={BarChart3}
            title="Total Volume"
            value={Number(stats.totalVolume || 0).toFixed(4)}
            subtitle={`${Number(stats.avgVolume || 0).toFixed(4)}/user`}
            token={theme?.accent || "79 125 246"}
          />
          <SmallStat
            icon={Globe}
            title="Top Country"
            value={String(stats.topCountry?.[0] || "Unknown")}
            subtitle={`${stats.topCountry?.[1] || 0} users`}
            token={theme?.warning || "42 86 220"}
          />
          <SmallStat
            icon={TrendingUp}
            title="Active Rate"
            value={`${Number(stats.activeRate || 0).toFixed(0)}%`}
            subtitle={`${stats.activeUsers || 0} active`}
            token={theme?.gradientTo || theme?.accent || "23 157 166"}
          />
        </div>

        {/* Table */}
        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] whitespace-nowrap table-stack">
              <thead>
                <tr
                  style={{
                    background: rgba(theme?.headerRow || theme?.surface2 || "15 24 41", 0.28),
                    borderBottom: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
                  }}
                >
                  <th className="p-3 text-left font-medium" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.8) }}>
                    Name / Email
                  </th>
                  <th className="p-3 text-center font-medium" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.8) }}>
                    Country
                  </th>
                  <th className="p-3 text-center font-medium" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.8) }}>
                    AC No
                  </th>
                  <th className="p-3 text-center font-medium" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.8) }}>
                    Level
                  </th>
                  <th className="p-3 text-center font-medium" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.8) }}>
                    Total Volume
                  </th>
                  <th className="p-3 text-center font-medium" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.8) }}>
                    Total Earned
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedEmails.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="inline-flex items-center gap-2" style={mutedText}>
                        <Info className="w-5 h-5" style={{ color: rgba(theme?.warning || theme?.accent || "42 86 220", 0.9) }} />
                        No data found
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedEmails.map((email) => {
                    const users = groupedData[email] || [];
                    const first = users[0] || {};
                    const isExpanded = !!expandedEmails[email];

                    return (
                      <Fragment key={email}>
                        <tr
                          className="transition-colors"
                          style={{
                            borderBottom: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12)}`,
                            background: rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.18),
                            cursor: users.length > 1 ? "pointer" : "default",
                          }}
                          onClick={() => users.length > 1 && toggleDropdown(email)}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = rgba(theme?.rowHover || theme?.surface2 || "15 24 41", 0.24))}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.18))}
                        >
                          <td data-label="Name / Email" className="pl-6 pr-3 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate" style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}>
                                  {first?.name || "-"}
                                </p>
                                <p className="truncate text-sm" style={subtleText}>
                                  {email}
                                </p>
                              </div>
                              {users.length > 1 && (
                                <span style={subtleText}>{isExpanded ? <ChevronUp /> : <ChevronDown />}</span>
                              )}
                            </div>
                          </td>
                          <td data-label="Country" className="p-3 text-center" style={mutedText}>
                            {first?.country || "-"}
                          </td>
                          <td data-label="AC No" className="p-3 text-center" style={mutedText}>
                            {first?.accountNumber || "-"}
                          </td>
                          <td data-label="Level" className="p-3 text-center" style={mutedText}>
                            {first?.level ?? "-"}
                          </td>
                          <td data-label="Total Volume" className="p-3 text-center" style={mutedText}>
                            {Number(first?.totalLot || 0).toFixed(4)}
                          </td>
                          <td data-label="Total Earned" className="p-3 text-center" style={mutedText}>
                            {Number(first?.totalCommission || 0).toFixed(4)}
                          </td>
                        </tr>

                        {isExpanded &&
                          users.slice(1).map((u: any, idx: number) => (
                            <tr
                              key={`${email}-${idx}`}
                              className="transition-colors"
                              style={{
                                borderBottom: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.10)}`,
                                background: rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.12),
                              }}
                              onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = rgba(theme?.rowHover || theme?.surface2 || "15 24 41", 0.20))}
                              onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.12))}
                            >
                              <td data-label="Name / Email" className="pl-12 pr-3 py-2">
                                <p style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}>{u?.name || "-"}</p>
                                <p className="text-sm" style={subtleText}>
                                  {u?.email || "-"}
                                </p>
                              </td>
                              <td data-label="Country" className="p-2 text-center" style={mutedText}>
                                {u?.country || "-"}
                              </td>
                              <td data-label="AC No" className="p-2 text-center" style={mutedText}>
                                {u?.accountNumber || "-"}
                              </td>
                              <td data-label="Level" className="p-2 text-center" style={mutedText}>
                                {u?.level ?? "-"}
                              </td>
                              <td data-label="Total Volume" className="p-2 text-center" style={mutedText}>
                                {Number(u?.totalLot || 0).toFixed(4)}
                              </td>
                              <td data-label="Total Earned" className="p-2 text-center" style={mutedText}>
                                {Number(u?.totalCommission || 0).toFixed(4)}
                              </td>
                            </tr>
                          ))}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex justify-center items-center gap-4 py-4 mt-4"
              style={{
                borderTop: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
              }}
            >
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-1.5 rounded-full"
                style={{
                  background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.18),
                  border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
                  color: rgba(theme?.fg || "255 255 255", 0.88),
                  opacity: currentPage === 1 ? 0.45 : 1,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                Prev
              </button>
              <span style={mutedText}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-1.5 rounded-full"
                style={{
                  background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.18),
                  border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
                  color: rgba(theme?.fg || "255 255 255", 0.88),
                  opacity: currentPage === totalPages ? 0.45 : 1,
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    );
  };


  const ReferralsView = () => {
  const referredUsers = loggedUser?.referredUsers || [];
  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
              Your Referrals
            </h2>
            <p className="text-sm" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
              {referredUsers.length} total referrals
            </p>
          </div>

          <div
            className="px-4 py-2 rounded-full"
            style={{
              background: rgba(theme?.accent || "79 125 246", 0.14),
              border: `1px solid ${rgba(theme?.accent || "79 125 246", 0.22)}`,
              color: rgba(theme?.accent || "79 125 246", 0.9),
              fontWeight: 800,
            }}
          >
            {referredUsers.length}
          </div>
        </div>

        {referredUsers.length > 0 ? (
          <div className="space-y-3">
            {referredUsers.map((user: any, idx: number) => (
              <div
                key={idx}
                className="rounded-card p-4 flex items-center justify-between transition"
                style={{
                  background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.18),
                  border: `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`,
                }}
              >
                <div className="min-w-0">
                  <div className="font-medium truncate" style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}>
                    {user.name || user.email || "User"}
                  </div>
                  <div className="text-sm truncate" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.6) }}>
                    {user.email || "No email"}
                  </div>
                </div>
                <div style={{ color: rgba(theme?.success || "15 159 110", 0.9), fontWeight: 800 }}>Active</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
            <p>No referrals yet</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};


  /* ---------------------- Withdrawal History (inline view) ---------------------- */
  const WithdrawalsHistoryView = () => {
    const stats = useMemo(() => {
      const total = withdrawals.length;
      const pending = withdrawals.filter((x: any) => x.status === "pending");
      const approved = withdrawals.filter((x: any) => x.status === "approved");
      const rejected = withdrawals.filter((x: any) => x.status === "rejected");
      const sum = (arr: any[], key: "amount" | "totalBalance") => arr.reduce((s, v) => s + Number(v?.[key] || 0), 0);

      const totalRequested = sum(withdrawals, "amount");
      const pendingAmount = sum(pending, "amount");
      const approvedAmount = sum(approved, "amount");
      const lastUpdated = withdrawals[0]?.updatedAt ? new Date(withdrawals[0].updatedAt) : null;

      return {
        total,
        pendingCount: pending.length,
        approvedCount: approved.length,
        rejectedCount: rejected.length,
        totalRequested,
        pendingAmount,
        approvedAmount,
        lastUpdated,
      };
    }, [withdrawals]);

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("commission")}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
              style={{
                border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.16)}`,
                background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.18),
                color: rgba(theme?.fg || "255 255 255", 0.85),
              }}
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <ModernHeading text="IB Withdrawal History" />
          </div>

          <button
            onClick={fetchWithdrawals}
            disabled={loadingWd}
            className="px-4 py-2.5 rounded-card transition-all flex items-center gap-2"
            style={{
              background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.18),
              border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
              color: rgba(theme?.fg || "255 255 255", 0.88),
              cursor: loadingWd ? "not-allowed" : "pointer",
              opacity: loadingWd ? 0.7 : 1,
            }}
          >
            <RefreshCw className={`w-4 h-4 ${loadingWd ? "animate-spin" : ""}`} />
            {loadingWd ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <SmallStat icon={DollarSign} title="Total Requests" value={stats.total} subtitle={money(stats.totalRequested)} token={theme?.info || theme?.accent || "79 125 246"} />
          <SmallStat icon={Clock} title="Pending" value={stats.pendingCount} subtitle={money(stats.pendingAmount)} token={theme?.warning || "42 86 220"} />
          <SmallStat icon={TrendingUp} title="Approved" value={stats.approvedCount} subtitle={money(stats.approvedAmount)} token={theme?.success || "15 159 110"} />
          <SmallStat icon={Info} title="Rejected" value={stats.rejectedCount} subtitle="—" token={theme?.danger || "220 58 58"} />
          <SmallStat icon={Calendar} title="Last Updated" value={stats.lastUpdated ? formatDate(stats.lastUpdated.toISOString()) : "--"} subtitle="—" token={theme?.accent || "79 125 246"} />
        </div>

        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] whitespace-nowrap table-stack">
              <thead>
                <tr
                  style={{
                    background: rgba(theme?.headerRow || theme?.surface2 || "15 24 41", 0.28),
                    borderBottom: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
                  }}
                >
                  <th className="p-3 text-left font-medium" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.8) }}>
                    Total Amount
                  </th>
                  <th className="p-3 text-center font-medium" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.8) }}>
                    Withdrawal Amount
                  </th>
                  <th className="p-3 text-center font-medium" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.8) }}>
                    Method
                  </th>
                  <th className="p-3 text-center font-medium" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.8) }}>
                    Updated At
                  </th>
                  <th className="p-3 text-center font-medium" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.8) }}>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {loadingWd ? (
                  <tr>
                    <td colSpan={5} className="py-10">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: rgba(theme?.accent || "79 125 246", 0.85) }} />
                      </div>
                    </td>
                  </tr>
                ) : withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      <div className="flex gap-2 mx-auto justify-center items-center" style={mutedText}>
                        <Info className="w-5 h-5" style={{ color: rgba(theme?.warning || theme?.accent || "42 86 220", 0.9) }} />
                        <p>No withdrawal history available.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((v: any, idx: number) => (
                    <tr
                      key={v._id || idx}
                      className="transition-colors"
                      style={{
                        borderBottom: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12)}`,
                        background: rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.18),
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = rgba(theme?.rowHover || theme?.surface2 || "15 24 41", 0.24))}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.18))}
                    >
                      <td data-label="Total Amount" className="p-3 pl-6" style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}>
                        {money(v?.totalBalance || 0)}
                      </td>
                      <td data-label="Withdrawal Amount" className="p-3 text-center" style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}>
                        {money(v?.amount || 0)}
                      </td>
                      <td data-label="Method" className="p-3 text-center" style={mutedText}>
                        {methodNice(v?.method) || "--"}
                      </td>
                      <td data-label="Updated At" className="p-3 text-center">
                        <div style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}>{formatDate(v?.updatedAt)}</div>
                        <div className="text-xs" style={subtleText}>
                          {since(v?.updatedAt)}
                        </div>
                      </td>
                      <td data-label="Status" className="p-3 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold" style={chipStyle(v?.status)}>
                          {String(v?.status || "--").toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {withdrawals.length > 0 && !loadingWd && (
            <div
              className="flex items-center justify-between px-4 sm:px-6 py-3"
              style={{
                borderTop: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
                background: rgba(theme?.surface1 || theme?.bg || "0 0 0", 0.16),
              }}
            >
              <div className="text-xs sm:text-sm" style={subtleText}>
                Showing {withdrawals.length} record{withdrawals.length > 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm" style={subtleText}>
                <Clock className="w-4 h-4" />
                Data updates as requests are processed
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    );
  };

  /* ------------------------- Commission View (kept structure, themed cards) ------------------------- */
  const CommissionView = () => {
    const ibBalance = Number(loggedUser?.ibBalance || 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <GlassCard>
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium" style={mutedText}>
                  Total Commission
                </span>
                <span className="text-2xl font-bold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                  {money(totalCommission, 4)}
                </span>
              </div>
              <div
                className="p-3 rounded-full"
                style={{ background: rgba(theme?.success || "15 159 110", 0.16), border: `1px solid ${rgba(theme?.success || "15 159 110", 0.22)}` }}
              >
                <DollarSign className="w-6 h-6" style={{ color: rgba(theme?.success || "15 159 110", 0.9) }} />
              </div>
            </div>
            <div className="mt-4 text-sm" style={{ color: rgba(theme?.success || "15 159 110", 0.75) }}>
              Lifetime Commission Earnings
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium" style={mutedText}>
                  Withdrawals History
                </span>
                <span className="text-2xl font-bold" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                  {money(approvedWithdrawalAmount, 4)}
                </span>
              </div>
              <div
                className="p-3 rounded-full"
                style={{ background: rgba(theme?.info || theme?.accent || "79 125 246", 0.16), border: `1px solid ${rgba(theme?.info || theme?.accent || "79 125 246", 0.22)}` }}
              >
                <WalletIcon className="w-6 h-6" style={iconAccent} />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setActiveTab("withdrawal-history")}
                className="text-sm transition-all inline-flex items-center gap-1"
                style={{ color: rgba(theme?.accent || "79 125 246", 0.9) }}
              >
                <span>Withdrawal History</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium" style={mutedText}>
                  Withdrawable balance
                </span>
                <span className="text-2xl font-bold" style={{ color: rgba(theme?.success || "15 159 110", 0.75) }}>
                  {money(ibBalance, 4)}
                </span>
              </div>
              <div
                className="p-3 rounded-full"
                style={{ background: rgba(theme?.accent || "79 125 246", 0.14), border: `1px solid ${rgba(theme?.accent || "79 125 246", 0.2)}` }}
              >
                <WalletCardsIcon className="w-6 h-6" style={iconAccent} />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setActiveTab("withdraw")}
                className="w-full py-2 px-4 rounded-full font-medium"
                style={{
                  borderRadius: "999px",
                  color: rgb(theme?.primaryFg || "0 0 0"),
                  background: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "79 125 246")}, ${rgb(
                    theme?.accent || theme?.primary || "15 159 110"
                  )}, ${rgb(theme?.gradientTo || "23 157 166")})`,
                }}
              >
                Withdraw
              </button>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium" style={mutedText}>
                  IB Details
                </span>
                <span className="text-sm py-2" style={subtleText}>
                  Users with IB&apos;s
                </span>
              </div>
              <div
                className="p-3 rounded-full"
                style={{ background: rgba(theme?.accent || "79 125 246", 0.14), border: `1px solid ${rgba(theme?.accent || "79 125 246", 0.2)}` }}
              >
                <Users className="w-6 h-6" style={iconAccent} />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setActiveTab("referrals-details")}
                className="w-full py-2 px-4 rounded-full font-medium"
                style={{
                  borderRadius: "999px",
                  color: rgb(theme?.primaryFg || "0 0 0"),
                  background: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "79 125 246")}, ${rgb(
                    theme?.accent || theme?.primary || "15 159 110"
                  )}, ${rgb(theme?.gradientTo || "23 157 166")})`,
                }}
              >
                View Details
              </button>
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <h2 className="text-2xl font-bold mb-4" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
            Commission Summary
          </h2>
          <div style={mutedText}>
            <p>
              Total Earned: <span style={{ color: rgba(theme?.success || "15 159 110", 0.9), fontWeight: 800 }}>{money(totalCommission, 4)}</span>
            </p>
            <p className="text-sm mt-2" style={subtleText}>
              Tip: Use <span style={{ color: rgba(theme?.fg || "255 255 255", 0.9) }}>IB Details</span> to inspect per-user lots & earnings.
            </p>
          </div>
        </GlassCard>
      </div>
    );
  };

  /* ------------------------- Placeholder: keep your existing ReferralsView + ReferralsDetailsView ------------------------- */
  // Your ReferralsView / ReferralsDetailsView logic is huge—leave it as-is if you want.
  // If you want me to theme those tables + search input fully too, paste the remaining parts (ReferralsView + ReferralsDetailsView) you want updated.

  /* ----------------------------- Main Render ----------------------------- */
  const tabWrapStyle: CSSProperties = {
    background: rgba(theme?.surface2 || theme?.card || "15 24 41", 0.18),
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    borderRadius: "18px",
    backdropFilter: "blur(12px)",
  };

  const tabBtnBase: CSSProperties = {
    borderRadius: "14px",
    fontWeight: 700,
    transition: "all 180ms ease",
  };

  const tabBtnActive: CSSProperties = {
    color: rgb(theme?.primaryFg || "0 0 0"),
    background: `linear-gradient(90deg, ${rgb(theme?.gradientFrom || theme?.accent || "79 125 246")}, ${rgb(
      theme?.accent || theme?.primary || "15 159 110"
    )}, ${rgb(theme?.gradientTo || "23 157 166")})`,
    boxShadow: `0 14px 36px ${rgba(theme?.glow || theme?.accent || "79 125 246", 0.22)}`,
  };

  const tabBtnInactive: CSSProperties = {
    color: rgba(theme?.mutedFg || theme?.fg, 0.7),
    background: "transparent",
  };

  return (
    <div className="relative overflow-hidden" style={pageBgStyle}>
      <AnimatedGrid />
      <FloatingParticles />

      <div className="relative z-10 w-full">
        <PageHeader
          breadcrumb="Partners"
          title="Affiliate & referrals"
          description="Earn commission by inviting traders. Track your network and payouts."
        />

        <motion.div {...scaleIn(0.05)} className="flex flex-wrap gap-2 mb-8 p-2 w-fit mx-auto" style={tabWrapStyle}>
          {[
            { key: "overview" as TabKey, label: "Overview", icon: ChartBar },
            { key: "commission" as TabKey, label: "Commission", icon: DollarSign },
            { key: "withdraw" as TabKey, label: "Withdraw", icon: WalletIcon },
            { key: "withdrawal-history" as TabKey, label: "Withdrawal History", icon: RefreshCw },
            { key: "referrals-details" as TabKey, label: "IB Details", icon: BarChart3 },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="px-6 py-3 flex items-center gap-2"
              style={{
                ...tabBtnBase,
                ...(activeTab === key ? tabBtnActive : tabBtnInactive),
              }}
            >
              <Icon className="w-4 h-4" style={activeTab === key ? { color: rgba(theme?.primaryFg || "255 255 255", 0.95) } : iconAccent} />
              {label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} {...fadeIn}>


                  {activeTab === "overview" && <OverviewView />}
            {activeTab === "referrals" && <ReferralsView />}
            {activeTab === "commission" && <CommissionView />}
            {activeTab === "withdraw" && <WithdrawalsFormView />}
            {activeTab === "withdrawal-history" && <WithdrawalsHistoryView />}
            {activeTab === "referrals-details" && <ReferralsDetailsView />}



          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserReferal;
