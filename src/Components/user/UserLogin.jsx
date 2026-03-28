import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  Mail,
  Lock,
  LogIn,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  Sun,
  Moon,
  BadgeCheck,
  Fingerprint,
  Rocket,
  TrendingUp,
} from "lucide-react";
import { backendApi } from "../../utils/apiClients";
import { toggleUserTheme } from "../../redux/userThemeSlice";
import UseUserHook from "@/hooks/user/UseUserHook";
import { fetchCurrentUser } from "@/redux/AsyncThunk/fetchCurrentUser";
import sidebarBg from "@/assets/sidebar.png";

/* -------------------- theme helpers (RGB strings -> css) ------------------- */
const safeRgbParts = (v) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) =>
    Number.isFinite(n) ? n : 0
  );
  return { r, g, b };
};

const rgb = (v) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgb(${r}, ${g}, ${b})`;
};

const rgba = (v, a = 1) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const containerVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 180, damping: 18 },
  },
};

const AmbientBackground = ({ theme, isDark }) => {
  const bg = theme?.bg || "0 0 0";
  const surface1 = theme?.surface1 || theme?.bg || "0 0 0";
  const accent = theme?.accent || theme?.gradientFrom || "59 130 246";
  const info = theme?.info || theme?.gradientTo || "34 211 238";
  const effects = theme?.effectsEnabled !== false;

  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? `linear-gradient(135deg, ${rgb(bg)} 0%, ${rgb(surface1)} 45%, ${rgb(bg)} 100%)`
            : "linear-gradient(180deg, #fffaf7 0%, #fff7f2 42%, #fff1e8 100%)",
        }}
      />

      {!isDark && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.14]"
          style={{ backgroundImage: `url(${sidebarBg})` }}
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? `
              radial-gradient(circle at 12% 18%, ${rgba(accent, 0.15)}, transparent 24%),
              radial-gradient(circle at 88% 8%, ${rgba(info, 0.12)}, transparent 22%),
              radial-gradient(circle at 50% 100%, rgba(255,255,255,0.04), transparent 36%)
            `
            : `
              radial-gradient(circle at 14% 16%, rgba(251,146,60,0.18), transparent 24%),
              radial-gradient(circle at 86% 2%, rgba(255,255,255,0.9), transparent 28%),
              radial-gradient(circle at 80% 76%, rgba(251,191,36,0.10), transparent 18%)
            `,
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            opacity: isDark ? 0.12 : 0.07,
            backgroundImage: `linear-gradient(${rgba(
              accent,
              isDark ? 0.18 : 0.12
            )} 1px, transparent 1px), linear-gradient(90deg, ${rgba(
              accent,
              isDark ? 0.18 : 0.12
            )} 1px, transparent 1px)`,
            backgroundSize: "36px 36px",
            maskImage:
              "radial-gradient(ellipse at center, black 58%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 58%, transparent 85%)",
          }}
        />
      </div>

      {isDark && (
        <div
          className="absolute inset-0 opacity-[0.10] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
      )}

      {effects && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => {
            const color =
              i % 3 === 0 ? accent : i % 3 === 1 ? info : theme?.gradientTo || accent;

            return (
              <motion.div
                key={i}
                className="absolute rounded-full blur-3xl"
                style={{
                  width: i % 2 === 0 ? 220 : 160,
                  height: i % 2 === 0 ? 220 : 160,
                  left: `${(i * 17 + 8) % 100}%`,
                  top: `${(i * 13 + 6) % 100}%`,
                  background: `radial-gradient(circle at center, ${rgba(
                    color,
                    isDark ? 0.18 : 0.12
                  )}, transparent 68%)`,
                }}
                animate={{
                  x: [0, i % 2 ? 26 : -20, 0],
                  y: [0, i % 2 ? -28 : 22, 0],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 8 + (i % 4),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

const MarketPulse = ({ theme, isDark }) => {
  const accent = theme?.accent || "59 130 246";
  const border = theme?.border || theme?.inputBorder || "255 255 255";
  const fg = theme?.fg || "255 255 255";
  const success = theme?.success || "34 197 94";
  const danger = theme?.danger || "244 63 94";

  const coins = [
    { s: "BTC", p: 61234.12, c: +2.14 },
    { s: "ETH", p: 2431.78, c: -0.86 },
    { s: "SOL", p: 162.45, c: +4.21 },
    { s: "XRP", p: 0.62, c: +1.37 },
    { s: "DOGE", p: 0.146, c: -2.05 },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border backdrop-blur-xl"
      style={{
        borderColor: rgba(border, isDark ? 0.16 : 0.1),
        background: isDark
          ? `linear-gradient(135deg, ${rgba("18 18 18", 0.6)}, ${rgba(
              accent,
              0.05
            )}, ${rgba("18 18 18", 0.45)})`
          : "linear-gradient(135deg, rgba(255,255,255,0.82), rgba(255,247,240,0.72), rgba(255,255,255,0.82))",
        boxShadow: isDark
          ? `0 10px 40px ${rgba(accent, 0.08)}`
          : "0 12px 30px rgba(249,115,22,0.08)",
      }}
    >
      <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: rgba(border, isDark ? 0.14 : 0.08) }}>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{
            background: isDark ? rgba(accent, 0.14) : "rgba(249,115,22,0.10)",
            color: isDark ? rgb(accent) : "rgb(249,115,22)",
          }}
        >
          <TrendingUp className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: isDark ? rgba(fg, 0.96) : "rgba(15,23,42,0.96)" }}>
            Market Pulse
          </p>
          <p className="text-xs" style={{ color: isDark ? rgba(fg, 0.6) : "rgba(71,85,105,0.85)" }}>
            Live-style snapshot for a polished dashboard feel
          </p>
        </div>
      </div>

      <div className="overflow-hidden py-3">
        <motion.div
          className="flex w-max gap-6 px-4 text-xs font-medium"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 18, ease: "linear", repeat: Infinity }}
          style={{ color: isDark ? rgba(fg, 0.82) : "rgba(51,65,85,0.92)" }}
        >
          {[...coins, ...coins].map((coin, i) => (
            <div
              key={`${coin.s}-${i}`}
              className="flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{
                background: isDark ? rgba("255 255 255", 0.04) : "rgba(255,255,255,0.72)",
                border: `1px solid ${rgba(border, isDark ? 0.12 : 0.08)}`,
              }}
            >
              <span className="font-mono">{coin.s}</span>
              <span className="font-semibold" style={{ color: isDark ? rgba(fg, 0.96) : "rgba(15,23,42,0.96)" }}>
                {coin.p < 1 ? coin.p.toFixed(4) : coin.p.toLocaleString()}
              </span>
              <span style={{ color: coin.c >= 0 ? rgb(success) : rgb(danger) }}>
                {coin.c >= 0 ? "▲" : "▼"} {Math.abs(coin.c)}%
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

const Field = ({
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  isDark,
  theme,
  rightNode,
}) => {
  const fg = theme?.fg || "255 255 255";
  const accent = theme?.accent || theme?.gradientFrom || "59 130 246";
  const ring = theme?.ring || theme?.accent || accent;
  const border = theme?.border || theme?.inputBorder || "255 255 255";
  const inputBg = theme?.input || theme?.surface2 || "18 18 18";
  const surface1 = theme?.surface1 || theme?.bg || "0 0 0";

  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
        style={{ color: isDark ? rgba(accent, 0.9) : "rgba(249,115,22,0.92)" }}
      />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="h-14 w-full rounded-2xl border pl-11 pr-12 text-sm outline-none transition placeholder:text-current/50"
        style={{
          color: isDark ? rgba(fg, 0.96) : "rgba(15,23,42,0.96)",
          background: isDark
            ? `linear-gradient(135deg, ${rgba(inputBg, 0.65)}, ${rgba(surface1, 0.28)})`
            : "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,247,240,0.75))",
          borderColor: rgba(border, isDark ? 0.16 : 0.1),
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = rgba(ring, 0.56);
          e.currentTarget.style.boxShadow = `0 0 0 4px ${rgba(ring, 0.16)}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = rgba(border, isDark ? 0.16 : 0.1);
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {rightNode && <div className="absolute inset-y-0 right-3 flex items-center">{rightNode}</div>}
    </div>
  );
};

const UserLogin = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getReset } = UseUserHook();

  const themeConfig = useSelector((state) => state.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const siteConfig = useSelector((state) => state.user.siteConfig);
  const mode = useSelector((state) => state.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);

  const baseHeight = siteConfig?.logoSize || 4;

  const fg = theme?.fg || "255 255 255";
  const accent = theme?.accent || theme?.gradientFrom || "59 130 246";
  const gradientFrom = theme?.gradientFrom || accent;
  const gradientTo = theme?.gradientTo || theme?.info || accent;
  const glow = theme?.glow || accent;
  const border = theme?.border || theme?.inputBorder || "255 255 255";
  const primaryFg = theme?.primaryFg || "255 255 255";

  const panelStyle = {
    borderColor: rgba(border, isDark ? 0.16 : 0.1),
    background: isDark
      ? `linear-gradient(145deg, ${rgba("18 18 18", 0.72)}, ${rgba(
          "18 18 18",
          0.42
        )}, ${rgba("18 18 18", 0.72)})`
      : "linear-gradient(145deg, rgba(255,255,255,0.82), rgba(255,247,240,0.68), rgba(255,255,255,0.85))",
    boxShadow: isDark
      ? `0 24px 80px ${rgba(glow, 0.12)}`
      : "0 24px 80px rgba(249,115,22,0.12)",
  };

  const secondaryPanelStyle = {
    borderColor: rgba(border, isDark ? 0.16 : 0.1),
    background: isDark
      ? `linear-gradient(160deg, ${rgba("18 18 18", 0.7)}, ${rgba(
          gradientFrom,
          0.06
        )}, ${rgba("18 18 18", 0.55)})`
      : "linear-gradient(160deg, rgba(255,255,255,0.82), rgba(255,248,243,0.72), rgba(255,255,255,0.9))",
    boxShadow: isDark
      ? `0 30px 90px ${rgba(glow, 0.09)}`
      : "0 25px 80px rgba(249,115,22,0.10)",
  };

  const buttonStyle = {
    color: isDark ? rgb(primaryFg) : "#fff",
    background: isDark
      ? `linear-gradient(90deg, ${rgb(gradientFrom)}, ${rgb(accent)}, ${rgb(gradientTo)})`
      : "linear-gradient(90deg, rgba(249,115,22,0.98), rgba(251,146,60,0.96))",
    boxShadow: isDark
      ? `0 16px 40px ${rgba(glow, 0.24)}`
      : "0 16px 40px rgba(249,115,22,0.22)",
  };

  const pillStyle = {
    borderColor: rgba(border, isDark ? 0.14 : 0.08),
    background: isDark ? rgba("255 255 255", 0.05) : "rgba(255,255,255,0.75)",
    color: isDark ? rgba(fg, 0.85) : "rgba(51,65,85,0.9)",
  };

  const headingGradient = {
    backgroundImage: isDark
      ? `linear-gradient(90deg, ${rgba(fg, 0.98)}, ${rgb(accent)}, ${rgb(gradientTo)})`
      : "linear-gradient(90deg, rgba(15,23,42,1), rgba(249,115,22,0.98), rgba(251,146,60,0.95))",
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await backendApi.post("/auth/login", { email, password, remember });
      await dispatch(fetchCurrentUser());
      toast.success(`Welcome 👋🏽 ${res.data.userName}`);
      setTimeout(() => navigate(res.data.redirectTo), 600);
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Login failed! Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsResetLoading(true);
    try {
      const res = await backendApi.post(`/auth/send-reset-link`, { email: resetEmail });
      if (!res?.data) {
        toast.error("Unexpected response from server.");
        return;
      }
      toast.success(res.data.message || "Reset link sent successfully!");
      setResetEmail("");
      setShowForgotPassword(false);
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to send reset email!";
      toast.error(message);
    } finally {
      setIsResetLoading(false);
    }
  };

  useEffect(() => {
    const userRedirectHandler = async (id) => {
      try {
        getReset();
        const res = await backendApi.post("/auth/impersonate", { userId: id });
        await dispatch(fetchCurrentUser());
        toast.success(`Welcome 👋🏽 ${res.data.userName}`);
        setTimeout(() => navigate(res.data.redirectTo), 600);
      } catch (e) {
        toast.error("Impersonation failed");
        console.error(e);
      }
    };

    if (userId) userRedirectHandler(userId);
  }, [userId, dispatch, getReset, navigate]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen overflow-hidden"
      style={{ color: isDark ? rgba(fg, 0.96) : "rgba(15,23,42,0.96)" }}
    >
      <Toaster position="top-right" />
      <AmbientBackground theme={theme} isDark={isDark} />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        <motion.div variants={itemVariants} className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] backdrop-blur-xl"
              style={pillStyle}
            >
              <Sparkles className="h-3.5 w-3.5" />
              secure access
            </div>
            <div
              className="hidden rounded-full border px-3 py-2 text-xs font-medium sm:inline-flex"
              style={pillStyle}
            >
              Theme: {isDark ? "Dark" : "Light"}
            </div>
          </div>

          <button
            onClick={() => dispatch(toggleUserTheme())}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-xl transition hover:scale-[1.03]"
            style={{
              borderColor: rgba(border, isDark ? 0.16 : 0.1),
              background: isDark ? rgba("255 255 255", 0.05) : "rgba(255,255,255,0.82)",
              color: isDark ? rgba(fg, 0.92) : "rgba(249,115,22,0.98)",
              boxShadow: isDark
                ? "0 12px 30px rgba(0,0,0,0.32)"
                : "0 12px 28px rgba(249,115,22,0.12)",
            }}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <MarketPulse theme={theme} isDark={isDark} />
        </motion.div>

        <div className="grid flex-1 items-stretch gap-6 py-6 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div variants={itemVariants} className="hidden lg:block">
            <div
              className="relative h-full overflow-hidden rounded-[32px] border p-8 xl:p-10 backdrop-blur-2xl"
              style={secondaryPanelStyle}
            >
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: `linear-gradient(${rgba(
                    accent,
                    isDark ? 0.3 : 0.16
                  )} 1px, transparent 1px), linear-gradient(90deg, ${rgba(
                    accent,
                    isDark ? 0.3 : 0.16
                  )} 1px, transparent 1px)`,
                  backgroundSize: "34px 34px",
                }}
              />

              <div
                className="absolute inset-y-0 right-0 w-1/2 opacity-[0.08]"
                style={{
                  background: `radial-gradient(circle at center, ${rgba(
                    gradientTo,
                    0.5
                  )}, transparent 60%)`,
                }}
              />

              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  {siteConfig?.logo ? (
                    <motion.img
                      src={siteConfig.logo}
                      alt="Logo"
                      className="mb-8 object-contain"
                      initial={{ rotate: 0 }}
                      whileHover={{ rotate: -3, scale: 1.04 }}
                      transition={{ type: "spring", stiffness: 220 }}
                      style={{ height: `${baseHeight}rem` }}
                    />
                  ) : (
                    <div
                      className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl"
                      style={{
                        background: isDark ? rgba(accent, 0.12) : "rgba(249,115,22,0.12)",
                        color: isDark ? rgb(accent) : "rgb(249,115,22)",
                      }}
                    >
                      <Shield className="h-8 w-8" />
                    </div>
                  )}

                  <div
                    className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]"
                    style={pillStyle}
                  >
                    <Sparkles className="h-4 w-4" />
                    secure · sleek · fast
                  </div>

                  <h1
                    className="max-w-xl bg-clip-text text-4xl font-black leading-tight text-transparent xl:text-6xl"
                    style={headingGradient}
                  >
                    Sign in to a cleaner, smarter trading experience.
                  </h1>

                  <p
                    className="mt-5 max-w-xl text-base leading-7"
                    style={{ color: isDark ? rgba(fg, 0.72) : "rgba(71,85,105,0.92)" }}
                  >
                    A fresh authentication UI that still respects your current theme mode, theme
                    colors, and brand setup. Same logic, sharper presence.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        icon: Shield,
                        title: "Protected sessions",
                        text: "Encrypted transit and hardened auth flow.",
                      },
                      {
                        icon: Fingerprint,
                        title: "Identity first",
                        text: "Built for secure access and confident sign-ins.",
                      },
                      {
                        icon: BadgeCheck,
                        title: "Trusted workflow",
                        text: "Smooth recovery and consistent user state sync.",
                      },
                      {
                        icon: Rocket,
                        title: "Fast and modern",
                        text: "Polished micro-interactions without extra clutter.",
                      },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={i}
                          className="rounded-3xl border p-4 backdrop-blur-xl"
                          style={{
                            borderColor: rgba(border, isDark ? 0.14 : 0.08),
                            background: isDark
                              ? rgba("255 255 255", 0.04)
                              : "rgba(255,255,255,0.72)",
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl"
                              style={{
                                background: isDark ? rgba(accent, 0.14) : "rgba(249,115,22,0.10)",
                                color: isDark ? rgb(accent) : "rgb(249,115,22)",
                              }}
                            >
                              <Icon className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <p className="font-semibold">{item.title}</p>
                              <p
                                className="mt-1 text-sm leading-6"
                                style={{
                                  color: isDark ? rgba(fg, 0.66) : "rgba(71,85,105,0.88)",
                                }}
                              >
                                {item.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-3 gap-3">
                  {[
                    { value: "99.9%", label: "uptime" },
                    { value: "2FA", label: "ready" },
                    { value: "24/7", label: "access" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="rounded-3xl border p-4 text-center"
                      style={{
                        borderColor: rgba(border, isDark ? 0.14 : 0.08),
                        background: isDark ? rgba("255 255 255", 0.04) : "rgba(255,255,255,0.72)",
                      }}
                    >
                      <p
                        className="text-2xl font-black"
                        style={{ color: isDark ? rgba(fg, 0.98) : "rgba(15,23,42,0.96)" }}
                      >
                        {stat.value}
                      </p>
                      <p
                        className="mt-1 text-xs uppercase tracking-[0.22em]"
                        style={{ color: isDark ? rgba(fg, 0.58) : "rgba(100,116,139,0.88)" }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex min-h-[calc(100vh-11rem)] items-center justify-center lg:min-h-0"
          >
            <div
              className="relative w-full max-w-xl overflow-hidden rounded-[30px] border p-5 backdrop-blur-2xl sm:p-7"
              style={panelStyle}
            >
              <div
                className="absolute inset-x-0 top-0 h-32"
                style={{
                  background: `linear-gradient(180deg, ${rgba(
                    accent,
                    isDark ? 0.14 : 0.12
                  )}, transparent)`,
                }}
              />

              <div className="relative z-10">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <div
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]"
                      style={pillStyle}
                    >
                      <Shield className="h-3.5 w-3.5" />
                      member access
                    </div>
                    <h2
                      className="mt-4 bg-clip-text text-3xl font-black text-transparent sm:text-4xl"
                      style={headingGradient}
                    >
                      {showForgotPassword ? "Reset access" : "Welcome back"}
                    </h2>
                    <p
                      className="mt-2 text-sm leading-6"
                      style={{ color: isDark ? rgba(fg, 0.7) : "rgba(71,85,105,0.92)" }}
                    >
                      {showForgotPassword
                        ? "Enter your email and we’ll send a secure reset link."
                        : "Use your account credentials to continue to your dashboard."}
                    </p>
                  </div>

                  <div className="hidden sm:block">
                    {siteConfig?.logo ? (
                      <motion.img
                        src={siteConfig.logo}
                        alt="Logo"
                        className="object-contain"
                        initial={{ rotate: 0 }}
                        whileHover={{ rotate: -4, scale: 1.03 }}
                        transition={{ type: "spring", stiffness: 220 }}
                        style={{ height: `${Math.max(baseHeight - 0.5, 3)}rem` }}
                      />
                    ) : (
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{
                          background: isDark ? rgba(accent, 0.14) : "rgba(249,115,22,0.12)",
                          color: isDark ? rgb(accent) : "rgb(249,115,22)",
                        }}
                      >
                        <Sparkles className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="mb-6 rounded-2xl border p-3"
                  style={{
                    borderColor: rgba(border, isDark ? 0.14 : 0.08),
                    background: isDark ? rgba("255 255 255", 0.04) : "rgba(255,255,255,0.68)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          background: isDark ? rgb(accent) : "rgb(249,115,22)",
                          boxShadow: `0 0 14px ${rgba(accent, 0.6)}`,
                        }}
                      />
                      <span style={{ color: isDark ? rgba(fg, 0.84) : "rgba(51,65,85,0.92)" }}>
                        Current theme mode
                      </span>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-1 font-semibold"
                      style={{
                        background: isDark ? rgba(accent, 0.14) : "rgba(249,115,22,0.10)",
                        color: isDark ? rgb(accent) : "rgb(249,115,22)",
                      }}
                    >
                      {isDark ? "Dark mode" : "Light mode"}
                    </span>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {!showForgotPassword ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      transition={{ duration: 0.22 }}
                    >
                      <form onSubmit={handleLogin} className="space-y-4">
                        <Field
                          icon={Mail}
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email address"
                          isDark={isDark}
                          theme={theme}
                        />

                        <Field
                          icon={Lock}
                          type={showPass ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          isDark={isDark}
                          theme={theme}
                          rightNode={
                            <button
                              type="button"
                              onClick={() => setShowPass((s) => !s)}
                              className="rounded-xl p-2 transition hover:scale-105"
                              style={{
                                color: isDark ? rgba(fg, 0.68) : "rgba(100,116,139,0.92)",
                              }}
                              aria-label={showPass ? "Hide password" : "Show password"}
                            >
                              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          }
                        />

                        <div className="flex items-center justify-between gap-3 pt-1 text-sm">
                          <label className="inline-flex cursor-pointer items-center gap-2 select-none">
                            <input
                              type="checkbox"
                              checked={remember}
                              onChange={() => setRemember((v) => !v)}
                              className="h-4 w-4 rounded"
                              style={{
                                accentColor: isDark ? rgb(accent) : "rgb(249,115,22)",
                              }}
                            />
                            <span
                              style={{
                                color: isDark ? rgba(fg, 0.8) : "rgba(51,65,85,0.9)",
                              }}
                            >
                              Remember me
                            </span>
                          </label>

                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="font-medium transition hover:opacity-80"
                            style={{
                              color: isDark ? rgba(accent, 0.92) : "rgba(249,115,22,0.96)",
                            }}
                          >
                            Forgot password?
                          </button>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.985 }}
                          type="submit"
                          disabled={isLoading}
                          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-semibold disabled:opacity-70"
                          style={buttonStyle}
                        >
                          {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <LogIn className="h-5 w-5" />
                          )}
                          Sign in
                        </motion.button>
                      </form>

                      <div
                        className="mt-5 rounded-2xl border p-4"
                        style={{
                          borderColor: rgba(border, isDark ? 0.14 : 0.08),
                          background: isDark ? rgba("255 255 255", 0.035) : "rgba(255,255,255,0.62)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                            style={{
                              background: isDark ? rgba(accent, 0.14) : "rgba(249,115,22,0.10)",
                              color: isDark ? rgb(accent) : "rgb(249,115,22)",
                            }}
                          >
                            <Shield className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="font-semibold">Protected sign-in</p>
                            <p
                              className="mt-1 text-sm leading-6"
                              style={{
                                color: isDark ? rgba(fg, 0.68) : "rgba(71,85,105,0.9)",
                              }}
                            >
                              Your session uses current theme-aware styling without changing the
                              auth logic. Nice and tidy, like a well-behaved div.
                            </p>
                          </div>
                        </div>
                      </div>

                      <p
                        className="mt-6 text-center text-sm"
                        style={{ color: isDark ? rgba(fg, 0.68) : "rgba(100,116,139,0.9)" }}
                      >
                        Don&apos;t have an account?{" "}
                        <Link
                          to="/auth/signup"
                          className="font-semibold"
                          style={{
                            color: isDark ? rgba(accent, 0.94) : "rgba(249,115,22,0.96)",
                          }}
                        >
                          Sign up
                        </Link>
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="forgot"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      transition={{ duration: 0.22 }}
                    >
                      <button
                        onClick={() => setShowForgotPassword(false)}
                        className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition hover:opacity-85"
                        style={{
                          background: isDark ? rgba("255 255 255", 0.05) : "rgba(255,255,255,0.72)",
                          color: isDark ? rgba(accent, 0.92) : "rgba(249,115,22,0.96)",
                          border: `1px solid ${rgba(border, isDark ? 0.14 : 0.08)}`,
                        }}
                      >
                        <ArrowLeft className="h-4 w-4" /> Back to login
                      </button>

                      <form onSubmit={handleForgotPassword} className="space-y-4">
                        <Field
                          icon={Mail}
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="Email address"
                          isDark={isDark}
                          theme={theme}
                        />

                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.985 }}
                          type="submit"
                          disabled={isResetLoading}
                          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-semibold disabled:opacity-70"
                          style={buttonStyle}
                        >
                          {isResetLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Mail className="h-5 w-5" />
                          )}
                          Send reset link
                        </motion.button>
                      </form>

                      <div
                        className="mt-5 rounded-2xl border p-4"
                        style={{
                          borderColor: rgba(border, isDark ? 0.14 : 0.08),
                          background: isDark ? rgba("255 255 255", 0.035) : "rgba(255,255,255,0.62)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                            style={{
                              background: isDark ? rgba(accent, 0.14) : "rgba(249,115,22,0.10)",
                              color: isDark ? rgb(accent) : "rgb(249,115,22)",
                            }}
                          >
                            <BadgeCheck className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="font-semibold">Quick recovery</p>
                            <p
                              className="mt-1 text-sm leading-6"
                              style={{
                                color: isDark ? rgba(fg, 0.68) : "rgba(71,85,105,0.9)",
                              }}
                            >
                              We’ll email a secure reset link so users can get back in without
                              friction.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserLogin;