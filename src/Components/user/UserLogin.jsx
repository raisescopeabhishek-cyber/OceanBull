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
  Sun,
  Moon,
  Shield,
  BadgeCheck,
  Zap,
  LayoutDashboard,
  MessageSquare,
  CalendarDays,
  BarChart3,
  CircleDot,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { backendApi } from "../../utils/apiClients";
import { toggleUserTheme } from "../../redux/userThemeSlice";
import UseUserHook from "@/hooks/user/UseUserHook";
import { fetchCurrentUser } from "@/redux/AsyncThunk/fetchCurrentUser";

/* -------------------- theme helpers -------------------- */
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

/* -------------------- animation -------------------- */
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.55,
      when: "beforeChildren",
      staggerChildren: 0.035,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.42, ease: "easeOut" },
  },
};

const fontStack =
  '"Inter", "Plus Jakarta Sans", "Manrope", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/* -------------------- background -------------------- */
const CRMBackground = ({ theme, isDark }) => {
  const accent = theme?.accent || theme?.gradientFrom || "59 130 246";
  const info = theme?.info || theme?.gradientTo || "37 99 235";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? `
              radial-gradient(circle at 12% 18%, ${rgba(accent, 0.18)}, transparent 28%),
              radial-gradient(circle at 80% 10%, ${rgba(info, 0.16)}, transparent 26%),
              radial-gradient(circle at 50% 100%, rgba(255,255,255,0.045), transparent 34%),
              linear-gradient(135deg, #060606 0%, #101010 46%, #050505 100%)
            `
            : `
              radial-gradient(circle at 12% 18%, rgba(59,130,246,0.14), transparent 28%),
              radial-gradient(circle at 80% 10%, rgba(251,146,60,0.14), transparent 26%),
              linear-gradient(135deg, #fffaf7 0%, #f8fafc 46%, #fff7ed 100%)
            `,
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage: isDark
            ? `
              linear-gradient(120deg, rgba(255,255,255,0.06) 0px, transparent 1px),
              linear-gradient(35deg, rgba(255,255,255,0.04) 0px, transparent 1px)
            `
            : `
              linear-gradient(120deg, rgba(15,23,42,0.06) 0px, transparent 1px),
              linear-gradient(35deg, rgba(15,23,42,0.04) 0px, transparent 1px)
            `,
          backgroundSize: "46px 46px",
          maskImage: "radial-gradient(circle at center, black 45%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 45%, transparent 82%)",
        }}
      />

      <div
        className="absolute -left-28 top-1/4 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: rgba(accent, isDark ? 0.11 : 0.09) }}
      />

      <div
        className="absolute -right-28 bottom-0 h-[30rem] w-[30rem] rounded-full blur-3xl"
        style={{ background: rgba(info, isDark ? 0.1 : 0.08) }}
      />

      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/35 to-transparent" />
    </div>
  );
};

/* -------------------- theme toggle -------------------- */
const ThemeToggle = ({ isDark }) => {
  const dispatch = useDispatch();

  return (
    <button
      onClick={() => dispatch(toggleUserTheme())}
      className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-xl transition hover:-translate-y-0.5"
      style={{
        borderColor: isDark ? "rgba(255,255,255,0.13)" : "rgba(15,23,42,0.12)",
        background: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.82)",
        color: isDark ? "rgba(255,255,255,0.88)" : "rgba(15,23,42,0.88)",
        boxShadow: isDark
          ? "0 18px 45px rgba(0,0,0,0.45)"
          : "0 18px 45px rgba(15,23,42,0.1)",
      }}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

/* -------------------- dashboard mockup -------------------- */
const MiniDashboard = ({ theme, isDark }) => {
  const accent = theme?.accent || theme?.gradientFrom || "59 130 246";
  const info = theme?.info || theme?.gradientTo || accent;
  const fg = theme?.fg || "255 255 255";

  return (
    <motion.div
      variants={itemVariants}
      className="relative mx-auto mt-9 w-full max-w-[560px] overflow-hidden rounded-[1.4rem] border p-3 shadow-2xl"
      style={{
        borderColor: isDark ? "rgba(255,255,255,0.09)" : "rgba(15,23,42,0.12)",
        background: isDark
          ? "linear-gradient(145deg, rgba(20,20,20,0.92), rgba(8,8,8,0.92))"
          : "linear-gradient(145deg, rgba(255,255,255,0.92), rgba(248,250,252,0.92))",
        boxShadow: isDark
          ? `0 28px 90px rgba(0,0,0,0.55), 0 0 60px ${rgba(accent, 0.08)}`
          : "0 28px 90px rgba(15,23,42,0.12)",
      }}
    >
      <div className="grid grid-cols-[48px_1fr] gap-3">
        <div
          className="flex flex-col items-center gap-3 rounded-2xl py-4"
          style={{
            background: isDark ? "rgba(255,255,255,0.035)" : "rgba(15,23,42,0.04)",
          }}
        >
          {[LayoutDashboard, MessageSquare, BarChart3, CalendarDays].map((Icon, i) => (
            <span
              key={i}
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{
                background: i === 0 ? rgba(accent, 0.16) : "transparent",
                color:
                  i === 0
                    ? rgb(accent)
                    : isDark
                    ? "rgba(255,255,255,0.45)"
                    : "rgba(15,23,42,0.48)",
              }}
            >
              <Icon size={15} />
            </span>
          ))}
        </div>

        <div className="space-y-3">
          <div
            className="rounded-2xl border p-3"
            style={{
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
              background: isDark ? "rgba(255,255,255,0.035)" : "rgba(15,23,42,0.03)",
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p
                className="text-xs font-black uppercase tracking-[0.18em]"
                style={{ color: isDark ? rgba(fg, 0.62) : "rgba(15,23,42,0.62)" }}
              >
                Client Pipeline
              </p>

              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {["Leads", "KYC", "Deposits", "IB"].map((item, i) => (
                <div key={item}>
                  <p
                    className="mb-1 text-[9px] font-bold"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.52)" : "rgba(15,23,42,0.52)",
                    }}
                  >
                    {item}
                  </p>

                  <div
                    className="h-2 overflow-hidden rounded-full"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
                    }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        width: `${[78, 64, 88, 52][i]}%`,
                        background:
                          i === 2
                            ? `linear-gradient(90deg, ${rgb(info)}, ${rgb(accent)})`
                            : rgb(accent),
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${[78, 64, 88, 52][i]}%` }}
                      transition={{ duration: 0.9, delay: 0.2 + i * 0.08 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[1.15fr_0.85fr] gap-3">
            <div
              className="rounded-2xl border p-3"
              style={{
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
                background: isDark ? "rgba(255,255,255,0.035)" : "rgba(15,23,42,0.03)",
              }}
            >
              <div className="space-y-2">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <div
                      className="h-6 w-6 shrink-0 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${rgba(accent, 0.9)}, ${rgba(
                          info,
                          0.7
                        )})`,
                      }}
                    />

                    <div className="flex-1 space-y-1">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: i === 1 ? "86%" : "68%",
                          background:
                            i === 1
                              ? rgba(accent, 0.78)
                              : isDark
                              ? "rgba(255,255,255,0.09)"
                              : "rgba(15,23,42,0.09)",
                        }}
                      />

                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: i === 2 ? "54%" : "74%",
                          background: isDark
                            ? "rgba(255,255,255,0.07)"
                            : "rgba(15,23,42,0.07)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <div
                className="rounded-2xl border p-3"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
                  background: isDark ? "rgba(255,255,255,0.035)" : "rgba(15,23,42,0.03)",
                }}
              >
                <p
                  className="text-[10px] font-bold"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.48)" : "rgba(15,23,42,0.48)",
                  }}
                >
                  Trading Activity
                </p>

                <div className="mt-3 flex h-14 items-end gap-1.5">
                  {[24, 36, 42, 62, 82, 54].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t-lg"
                      style={{
                        height: `${h}%`,
                        background: i === 4 ? rgb(accent) : rgba(accent, 0.32),
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.7, delay: 0.25 + i * 0.05 }}
                    />
                  ))}
                </div>
              </div>

              <div
                className="rounded-2xl border p-3"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
                  background: isDark ? "rgba(255,255,255,0.035)" : "rgba(15,23,42,0.03)",
                }}
              >
                <p
                  className="text-[10px] font-bold"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.48)" : "rgba(15,23,42,0.48)",
                  }}
                >
                  Pending KYC
                </p>

                <p className="mt-1 text-2xl font-black" style={{ color: rgb(accent) }}>
                  5
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* -------------------- input field -------------------- */
const DarkFieldBox = ({ children, active, theme, isDark }) => {
  const accent = theme?.accent || theme?.gradientFrom || "59 130 246";

  return (
    <div
      className="relative rounded-xl border transition-all duration-200"
      style={{
        borderColor: active
          ? rgba(accent, 0.72)
          : isDark
          ? "rgba(255,255,255,0.14)"
          : "rgba(15,23,42,0.14)",
        background: isDark ? "rgba(8,8,8,0.52)" : "rgba(255,255,255,0.84)",
        boxShadow: active ? `0 0 0 3px ${rgba(accent, 0.16)}` : "none",
      }}
    >
      {children}
    </div>
  );
};

const LoginField = ({
  icon: Icon,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  theme,
  isDark,
  rightAction,
  autoComplete,
}) => {
  const [focused, setFocused] = useState(false);
  const fg = theme?.fg || "255 255 255";
  const accent = theme?.accent || theme?.gradientFrom || "59 130 246";

  return (
    <motion.div variants={itemVariants}>
      <DarkFieldBox active={focused} theme={theme} isDark={isDark}>
        <div className="relative">
          <span
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{
              color: focused
                ? rgb(accent)
                : isDark
                ? "rgba(255,255,255,0.42)"
                : "rgba(15,23,42,0.42)",
            }}
          >
            <Icon size={16} />
          </span>

          <input
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete={autoComplete}
            className="h-11 w-full rounded-xl bg-transparent pl-10 pr-11 text-xs font-semibold outline-none placeholder:font-semibold"
            style={{
              color: isDark ? rgba(fg, 0.92) : "rgba(15,23,42,0.94)",
            }}
            required
          />

          {rightAction}
        </div>
      </DarkFieldBox>
    </motion.div>
  );
};

/* -------------------- main component -------------------- */
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

  const baseHeight = siteConfig?.logoSize || 3.2;

  const fg = theme?.fg || "255 255 255";
  const accent = theme?.accent || theme?.gradientFrom || "59 130 246";
  const info = theme?.info || theme?.gradientTo || accent;
  const primaryFg = theme?.primaryFg || "255 255 255";

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await backendApi.post("/auth/login", {
        email,
        password,
        remember,
      });

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
      const res = await backendApi.post(`/auth/send-reset-link`, {
        email: resetEmail,
      });

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

        const res = await backendApi.post("/auth/impersonate", {
          userId: id,
        });

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
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8"
      style={{
        color: isDark ? rgba(fg, 0.92) : "rgba(15,23,42,0.94)",
        fontFamily: fontStack,
      }}
    >
      <Toaster position="top-right" />

      <CRMBackground theme={theme} isDark={isDark} />
      <ThemeToggle isDark={isDark} />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <motion.div
          variants={itemVariants}
          className="relative w-full overflow-hidden rounded-[2.2rem] border p-3 shadow-2xl backdrop-blur-2xl sm:p-4"
          style={{
            borderColor: isDark ? "rgba(255,255,255,0.09)" : "rgba(15,23,42,0.12)",
            background: isDark
              ? "linear-gradient(145deg, rgba(27,27,27,0.92), rgba(14,14,14,0.92))"
              : "linear-gradient(145deg, rgba(255,255,255,0.94), rgba(248,250,252,0.92))",
            boxShadow: isDark
              ? "0 40px 120px rgba(0,0,0,0.62)"
              : "0 40px 120px rgba(15,23,42,0.14)",
          }}
        >
          <div className="grid min-h-[680px] overflow-hidden rounded-[1.85rem] lg:grid-cols-[1.25fr_0.78fr]">
            <div
              className="relative hidden overflow-hidden p-7 lg:block"
              style={{
                background: isDark
                  ? "linear-gradient(145deg, rgba(21,21,21,0.96), rgba(8,8,8,0.96))"
                  : "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(248,250,252,0.78))",
              }}
            >
              <div
                className="absolute -left-24 top-10 h-80 w-80 rounded-full blur-3xl"
                style={{ background: rgba(accent, isDark ? 0.12 : 0.08) }}
              />
              <div
                className="absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl"
                style={{ background: rgba(info, isDark ? 0.1 : 0.08) }}
              />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {siteConfig?.logo ? (
                    <img
                      src={siteConfig.logo}
                      alt="Logo"
                      className="object-contain"
                      style={{ height: `${baseHeight}rem` }}
                    />
                  ) : (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black"
                      style={{
                        color: isDark ? rgb(theme?.primaryFg || "0 0 0") : "#ffffff",
                        background: `linear-gradient(135deg, ${rgb(accent)}, ${rgb(info)})`,
                      }}
                    >
                      T
                    </div>
                  )}

                  <span
                    className="text-xs font-black tracking-[-0.03em]"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.78)" : "rgba(15,23,42,0.82)",
                    }}
                  >
                    TradingCRM
                  </span>
                </div>
              </div>

              <div className="relative mx-auto mt-16 max-w-2xl text-center">
                <motion.p
                  variants={itemVariants}
                  className="mb-3 inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.24em]"
                  style={{ color: rgb(accent) }}
                >
                  <Zap size={14} />
                  Broker CRM access
                </motion.p>

                <motion.h1
                  variants={itemVariants}
                  className="text-4xl font-medium leading-[1.08] tracking-[-0.06em] xl:text-5xl"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.92)" : "rgba(15,23,42,0.95)",
                  }}
                >
                  Trading CRM{" "}
                  <span style={{ color: rgb(accent) }}>Dashboard</span>
                  <br />
                  For Brokers &amp; IB Teams
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="mx-auto mt-4 max-w-xl text-xs font-medium leading-5"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.48)" : "rgba(15,23,42,0.54)",
                  }}
                >
                  Track leads, clients, IB referrals, deposits, withdrawals and user
                  activity from one secure trading CRM workspace.
                </motion.p>
              </div>

              <MiniDashboard theme={theme} isDark={isDark} />

              <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between">
                <div className="flex flex-1 items-center gap-2 pr-10">
                  {[0, 1, 2, 3, 4].map((_, i) => (
                    <span
                      key={i}
                      className="h-[3px] flex-1 rounded-full"
                      style={{
                        background:
                          i === 0
                            ? isDark
                              ? "rgba(255,255,255,0.86)"
                              : "rgba(15,23,42,0.8)"
                            : isDark
                            ? "rgba(255,255,255,0.16)"
                            : "rgba(15,23,42,0.16)",
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-end gap-1">
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.62)" : "rgba(15,23,42,0.58)",
                    }}
                  >
                    1/
                  </span>
                  <span className="text-3xl font-light" style={{ color: rgb(accent) }}>
                    2
                  </span>
                </div>
              </div>
            </div>

            <div
              className="relative flex items-center justify-center p-5 sm:p-8"
              style={{
                background: isDark
                  ? "linear-gradient(145deg, rgba(31,31,31,0.98), rgba(18,18,18,0.98))"
                  : "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98))",
              }}
            >
              <div className="w-full max-w-[390px]">
                <div className="mb-7 text-center lg:hidden">
                  {siteConfig?.logo ? (
                    <img
                      src={siteConfig.logo}
                      alt="Logo"
                      className="mx-auto object-contain"
                      style={{ height: `${baseHeight}rem` }}
                    />
                  ) : (
                    <div
                      className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black"
                      style={{
                        color: isDark ? rgb(theme?.primaryFg || "0 0 0") : "#ffffff",
                        background: `linear-gradient(135deg, ${rgb(accent)}, ${rgb(info)})`,
                      }}
                    >
                      T
                    </div>
                  )}
                </div>

                <motion.div variants={itemVariants} className="mb-6">
                  <h2
                    className="text-center text-4xl font-light tracking-[-0.07em]"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.94)" : "rgba(15,23,42,0.96)",
                    }}
                  >
                    {showForgotPassword ? "Reset Access" : "Welcome Back"}
                  </h2>

                  <p
                    className="mt-3 text-center text-xs font-medium"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.48)" : "rgba(15,23,42,0.52)",
                    }}
                  >
                    {showForgotPassword
                      ? "Recover your trading CRM account"
                      : "Sign in to your trading CRM workspace"}
                  </p>
                </motion.div>

                <div className="mb-5 grid gap-3">
                  <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-xl border p-4"
                    style={{
                      borderColor: rgba(accent, 0.55),
                      background: `linear-gradient(135deg, ${rgba(accent, 0.95)}, ${rgba(
                        info,
                        0.82
                      )})`,
                      color: "#ffffff",
                      boxShadow: `0 16px 36px ${rgba(accent, 0.22)}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-4 w-4 items-center justify-center rounded border border-white/70">
                        <CircleDot size={10} />
                      </span>

                      <div className="flex-1">
                        <p className="text-sm font-bold leading-tight">
                          Secure broker
                          <br />
                          CRM access
                        </p>
                      </div>

                      <div className="flex -space-x-2">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/70"
                            style={{
                              background: `linear-gradient(135deg, ${rgba(
                                i === 0 ? "251 191 36" : i === 1 ? "59 130 246" : "236 72 153",
                                0.95
                              )}, ${rgba("15 23 42", 0.8)})`,
                            }}
                          >
                            {i === 1 && <UserCheck size={13} />}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>

                <AnimatePresence mode="wait">
                  {!showForgotPassword ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.22 }}
                    >
                      <form onSubmit={handleLogin} className="grid grid-cols-1 gap-2.5">
                        <LoginField
                          icon={Mail}
                          name="email"
                          type="email"
                          placeholder="Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          theme={theme}
                          isDark={isDark}
                          autoComplete="email"
                        />

                        <LoginField
                          icon={Lock}
                          name="password"
                          type={showPass ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          theme={theme}
                          isDark={isDark}
                          autoComplete="current-password"
                          rightAction={
                            <button
                              type="button"
                              onClick={() => setShowPass((s) => !s)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 transition hover:opacity-80"
                              style={{
                                color: isDark ? rgba(fg, 0.5) : "rgba(15,23,42,0.5)",
                              }}
                              aria-label={showPass ? "Hide password" : "Show password"}
                            >
                              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          }
                        />

                        <div className="mt-1 flex items-center justify-between gap-3 text-xs">
                          <label className="inline-flex cursor-pointer select-none items-center gap-2">
                            <input
                              type="checkbox"
                              checked={remember}
                              onChange={() => setRemember((v) => !v)}
                              className="h-4 w-4 rounded"
                              style={{
                                accentColor: isDark ? rgb(accent) : "rgb(59,130,246)",
                              }}
                            />

                            <span
                              className="font-semibold"
                              style={{
                                color: isDark ? rgba(fg, 0.62) : "rgba(15,23,42,0.58)",
                              }}
                            >
                              Remember me
                            </span>
                          </label>

                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="font-bold transition hover:opacity-80"
                            style={{ color: rgb(accent) }}
                          >
                            Forgot password?
                          </button>
                        </div>

                        <motion.button
                          variants={itemVariants}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={isLoading}
                          className="group relative mx-auto mt-3 flex min-w-[145px] items-center justify-center gap-2 overflow-hidden rounded-lg px-6 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-65"
                          style={{
                            color: isDark ? rgb(primaryFg) : "#ffffff",
                            background: `linear-gradient(135deg, ${rgb(accent)}, ${rgb(info)})`,
                            boxShadow: `0 14px 34px ${rgba(accent, 0.26)}`,
                          }}
                        >
                          <span className="absolute inset-0 -translate-x-full bg-white/20 transition duration-700 group-hover:translate-x-full" />

                          {isLoading ? "Signing In..." : "Sign In"}

                          {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <LogIn size={14} className="transition group-hover:translate-x-1" />
                          )}
                        </motion.button>
                      </form>

                      <div
                        className="mt-5 rounded-xl border p-4"
                        style={{
                          borderColor: isDark
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(15,23,42,0.1)",
                          background: isDark ? "rgba(0,0,0,0.26)" : "rgba(15,23,42,0.035)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                            style={{
                              background: rgba(accent, isDark ? 0.14 : 0.1),
                              color: rgb(accent),
                            }}
                          >
                            <Shield size={16} />
                          </span>

                          <div>
                            <p
                              className="text-sm font-bold"
                              style={{
                                color: isDark ? rgba(fg, 0.88) : "rgba(15,23,42,0.9)",
                              }}
                            >
                              Protected trading workspace
                            </p>
                            <p
                              className="mt-1 text-xs font-medium leading-5"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.48)"
                                  : "rgba(15,23,42,0.52)",
                              }}
                            >
                              Access your CRM dashboard, client pipeline, IB network and financial
                              activity securely.
                            </p>
                          </div>
                        </div>
                      </div>

                      <p
                        className="mt-6 text-center text-xs font-semibold"
                        style={{
                          color: isDark ? "rgba(255,255,255,0.52)" : "rgba(15,23,42,0.56)",
                        }}
                      >
                        Don&apos;t have an account?{" "}
                        <Link
                          to="/auth/signup"
                          className="font-black transition hover:opacity-80"
                          style={{ color: rgb(accent) }}
                        >
                          Create Access
                        </Link>
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="forgot"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.22 }}
                    >
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(false)}
                        className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition hover:opacity-85"
                        style={{
                          background: isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.04)",
                          color: rgb(accent),
                          border: `1px solid ${
                            isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)"
                          }`,
                        }}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                      </button>

                      <form onSubmit={handleForgotPassword} className="grid grid-cols-1 gap-2.5">
                        <LoginField
                          icon={Mail}
                          name="resetEmail"
                          type="email"
                          placeholder="Email Address"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          theme={theme}
                          isDark={isDark}
                          autoComplete="email"
                        />

                        <motion.button
                          variants={itemVariants}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={isResetLoading}
                          className="group relative mx-auto mt-3 flex min-w-[160px] items-center justify-center gap-2 overflow-hidden rounded-lg px-6 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-65"
                          style={{
                            color: isDark ? rgb(primaryFg) : "#ffffff",
                            background: `linear-gradient(135deg, ${rgb(accent)}, ${rgb(info)})`,
                            boxShadow: `0 14px 34px ${rgba(accent, 0.26)}`,
                          }}
                        >
                          <span className="absolute inset-0 -translate-x-full bg-white/20 transition duration-700 group-hover:translate-x-full" />

                          {isResetLoading ? "Sending..." : "Send Reset Link"}

                          {isResetLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Mail size={14} className="transition group-hover:translate-x-1" />
                          )}
                        </motion.button>
                      </form>

                      <div
                        className="mt-5 rounded-xl border p-4"
                        style={{
                          borderColor: isDark
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(15,23,42,0.1)",
                          background: isDark ? "rgba(0,0,0,0.26)" : "rgba(15,23,42,0.035)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                            style={{
                              background: rgba(accent, isDark ? 0.14 : 0.1),
                              color: rgb(accent),
                            }}
                          >
                            <BadgeCheck size={16} />
                          </span>

                          <div>
                            <p
                              className="text-sm font-bold"
                              style={{
                                color: isDark ? rgba(fg, 0.88) : "rgba(15,23,42,0.9)",
                              }}
                            >
                              Quick account recovery
                            </p>
                            <p
                              className="mt-1 text-xs font-medium leading-5"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.48)"
                                  : "rgba(15,23,42,0.52)",
                              }}
                            >
                              We&apos;ll send a secure reset link so you can return to your trading
                              CRM without friction.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </motion.main>
  );
};

export default UserLogin;