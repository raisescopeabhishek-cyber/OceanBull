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
  BarChart3,
  Globe,
  UsersRound,
  Network,
  ShieldCheck,
  Quote,
  LineChart,
  Rocket,
  Check,
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

const orange = "249 115 22";
const deepOrange = "234 88 12";
const amber = "251 146 60";

const fontStack =
  '"Inter", "Plus Jakarta Sans", "Manrope", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

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

/* -------------------- asset helpers -------------------- */
const getBackendOrigin = () => {
  const baseURL =
    backendApi?.defaults?.baseURL ||
    import.meta.env.VITE_BACKEND_URL ||
    "https://server.oceanbullfx.com";

  try {
    return new URL(baseURL, window.location.origin).origin;
  } catch {
    return "https://server.oceanbullfx.com";
  }
};

const getImageUrl = (value) => {
  if (!value) return "";

  let url = value;

  if (typeof url === "object") {
    url = url?.url || url?.path || url?.src || "";
  }

  url = String(url).trim();

  if (!url || url === "undefined" || url === "null") return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  return `${getBackendOrigin().replace(/\/$/, "")}/${url.replace(/^\/+/, "")}`;
};

const normalizeSiteConfig = (value) => {
  if (!value) return {};

  if (value?.data) {
    if (Array.isArray(value.data)) return value.data[0] || {};
    return value.data;
  }

  if (Array.isArray(value)) {
    return value[0] || {};
  }

  return value;
};

const extractSiteConfigFromResponse = (res) => {
  const payload = res?.data?.data ?? res?.data ?? res;

  if (!payload) return null;

  if (Array.isArray(payload)) return payload[0] || null;

  if (payload?.data && typeof payload.data === "object") {
    return Array.isArray(payload.data) ? payload.data[0] || null : payload.data;
  }

  return payload;
};

/* -------------------- background -------------------- */
const ForexBackground = ({ isDark }) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? `
              radial-gradient(circle at 10% 5%, rgba(249,115,22,0.18), transparent 28%),
              radial-gradient(circle at 95% 18%, rgba(251,146,60,0.12), transparent 25%),
              radial-gradient(circle at 70% 96%, rgba(249,115,22,0.14), transparent 28%),
              linear-gradient(135deg, #090604 0%, #120b07 48%, #070504 100%)
            `
            : `
              radial-gradient(circle at 10% 5%, rgba(249,115,22,0.13), transparent 30%),
              radial-gradient(circle at 92% 18%, rgba(251,146,60,0.12), transparent 24%),
              radial-gradient(circle at 72% 96%, rgba(249,115,22,0.10), transparent 28%),
              linear-gradient(135deg, #fffaf6 0%, #fffefd 45%, #fff7ed 100%)
            `,
        }}
      />

      <div
        className="absolute -left-20 -top-28 h-72 w-72 rounded-full border opacity-40"
        style={{
          borderColor: isDark ? "rgba(251,146,60,0.14)" : "rgba(249,115,22,0.18)",
        }}
      />

      <div
        className="absolute -left-28 -top-36 h-96 w-96 rounded-full border opacity-35"
        style={{
          borderColor: isDark ? "rgba(251,146,60,0.11)" : "rgba(249,115,22,0.14)",
        }}
      />

      <div
        className="absolute right-10 top-8 h-36 w-36 opacity-45"
        style={{
          backgroundImage: `radial-gradient(${
            isDark ? "rgba(251,146,60,0.24)" : "rgba(249,115,22,0.18)"
          } 1px, transparent 1px)`,
          backgroundSize: "12px 12px",
        }}
      />

      <div
        className="absolute left-[52%] top-[7%] h-72 w-72 rounded-full blur-3xl"
        style={{ background: "rgba(249,115,22,0.08)" }}
      />

      <div
        className="absolute bottom-0 right-0 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "rgba(251,146,60,0.12)" }}
      />
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
        borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(249,115,22,0.18)",
        background: isDark ? "rgba(20,12,8,0.72)" : "rgba(255,255,255,0.82)",
        color: isDark ? "rgba(255,255,255,0.88)" : "rgba(15,23,42,0.88)",
        boxShadow: isDark
          ? "0 18px 45px rgba(0,0,0,0.45)"
          : "0 18px 45px rgba(249,115,22,0.13)",
      }}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

/* -------------------- brand mark -------------------- */
const BrandMark = ({ logo, baseHeight = 4, isDark, websiteName }) => {
  const [imageError, setImageError] = useState(false);
  const logoUrl = useMemo(() => getImageUrl(logo), [logo]);

  useEffect(() => {
    setImageError(false);
  }, [logoUrl]);

  if (logoUrl && !imageError) {
    return (
      <div className="flex h-[118px] w-full items-center justify-center">
        <img
          key={logoUrl}
          src={logoUrl}
          alt={websiteName || "Logo"}
          className="block object-contain"
          style={{
            height: `${Number(baseHeight) || 4}rem`,
            maxHeight: "96px",
            maxWidth: "280px",
          }}
          referrerPolicy="no-referrer"
          onError={(e) => {
            console.log("Login logo failed:", e.currentTarget.src);
            setImageError(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-[118px] w-full items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12">
          <div
            className="absolute inset-1 rotate-[-8deg] rounded-[1.1rem]"
            style={{
              background: `linear-gradient(135deg, ${rgb(amber)}, ${rgb(deepOrange)})`,
              boxShadow: "0 16px 28px rgba(249,115,22,0.25)",
            }}
          />
          <Rocket className="absolute left-3 top-3 text-white" size={24} />
        </div>

        <div>
          <p
            className="text-3xl font-black leading-none tracking-[-0.06em]"
            style={{ color: isDark ? "#ffffff" : "#111827" }}
          >
            {websiteName || "Forex"}
            <span style={{ color: rgb(orange) }}>CRM</span>
          </p>

          <p
            className="mt-1 text-sm font-medium tracking-[-0.02em]"
            style={{
              color: isDark ? "rgba(255,255,255,0.64)" : "rgba(15,23,42,0.72)",
            }}
          >
            Trade. Manage. Grow.
          </p>
        </div>
      </div>
    </div>
  );
};

/* -------------------- left design -------------------- */
const FeatureCard = ({ icon: Icon, title, desc, isDark }) => {
  return (
    <motion.div
      variants={itemVariants}
      className="group flex items-center gap-4 rounded-2xl border p-4 transition hover:-translate-y-1"
      style={{
        borderColor: isDark ? "rgba(255,255,255,0.11)" : "rgba(249,115,22,0.15)",
        background: isDark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.76)",
        boxShadow: isDark
          ? "0 18px 45px rgba(0,0,0,0.24)"
          : "0 18px 40px rgba(249,115,22,0.08)",
      }}
    >
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${rgb(amber)}, ${rgb(deepOrange)})`,
          boxShadow: "0 14px 30px rgba(249,115,22,0.28)",
        }}
      >
        <Icon size={25} />
      </span>

      <div>
        <h3
          className="text-[15px] font-extrabold tracking-[-0.03em]"
          style={{
            color: isDark ? "rgba(255,255,255,0.92)" : "rgba(17,24,39,0.96)",
          }}
        >
          {title}
        </h3>

        <p
          className="mt-1 text-sm font-medium leading-5"
          style={{
            color: isDark ? "rgba(255,255,255,0.58)" : "rgba(15,23,42,0.66)",
          }}
        >
          {desc}
        </p>
      </div>
    </motion.div>
  );
};

const QuoteBox = ({ isDark }) => (
  <motion.div
    variants={itemVariants}
    className="relative mt-4 flex items-start gap-3 rounded-2xl border px-5 py-4"
    style={{
      borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(249,115,22,0.15)",
      background: isDark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.78)",
      boxShadow: isDark
        ? "0 18px 45px rgba(0,0,0,0.18)"
        : "0 18px 40px rgba(249,115,22,0.08)",
    }}
  >
    <Quote className="mt-1 shrink-0" size={22} style={{ color: rgb(orange) }} />

    <p
      className="text-sm font-semibold leading-6"
      style={{
        color: isDark ? "rgba(255,255,255,0.72)" : "rgba(15,23,42,0.75)",
      }}
    >
      Securely access your Forex CRM workspace and manage your business without friction.
    </p>
  </motion.div>
);

const StatStrip = ({ isDark }) => {
  const stats = [
    { icon: UsersRound, value: "500+", label: "Happy Clients" },
    { icon: LineChart, value: "1M+", label: "Leads Managed" },
    { icon: Globe, value: "30+", label: "Countries" },
    { icon: ShieldCheck, value: "99.9%", label: "Uptime & Secure" },
  ];

  return (
    <motion.div
      variants={itemVariants}
      className="relative z-10 mx-auto mt-7 grid w-full max-w-6xl grid-cols-2 overflow-hidden rounded-3xl border backdrop-blur-xl sm:grid-cols-4"
      style={{
        borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(249,115,22,0.14)",
        background: isDark ? "rgba(20,12,8,0.72)" : "rgba(255,255,255,0.82)",
        boxShadow: isDark
          ? "0 25px 70px rgba(0,0,0,0.38)"
          : "0 25px 70px rgba(249,115,22,0.13)",
      }}
    >
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="flex items-center justify-center gap-3 px-5 py-5"
          style={{
            borderRight:
              index !== stats.length - 1
                ? isDark
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid rgba(249,115,22,0.12)"
                : undefined,
          }}
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border"
            style={{
              borderColor: "rgba(249,115,22,0.20)",
              background: "rgba(249,115,22,0.08)",
              color: rgb(orange),
            }}
          >
            <stat.icon size={22} />
          </span>

          <div>
            <p className="text-2xl font-black leading-none" style={{ color: rgb(orange) }}>
              {stat.value}
            </p>
            <p
              className="mt-1 text-xs font-semibold"
              style={{
                color: isDark ? "rgba(255,255,255,0.58)" : "rgba(15,23,42,0.60)",
              }}
            >
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

/* -------------------- input fields -------------------- */
const FieldBox = ({ children, active, isDark }) => {
  return (
    <div
      className="relative rounded-2xl border transition-all duration-200"
      style={{
        borderWidth: "1.5px",
        borderColor: active
          ? "rgba(249,115,22,0.92)"
          : isDark
          ? "rgba(255,255,255,0.12)"
          : "rgba(249,115,22,0.42)",
        background: isDark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.92)",
        boxShadow: active
          ? isDark
            ? "0 0 0 4px rgba(249,115,22,0.16), 0 14px 32px rgba(0,0,0,0.16)"
            : "0 0 0 4px rgba(249,115,22,0.18), 0 14px 34px rgba(249,115,22,0.16)"
          : isDark
          ? "0 12px 28px rgba(0,0,0,0.14)"
          : "0 10px 28px rgba(249,115,22,0.10)",
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
  isDark,
  rightAction,
  autoComplete,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div variants={itemVariants}>
      <FieldBox active={focused} isDark={isDark}>
        <div className="relative">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2"
           style={{
  color: focused
    ? rgb(orange)
    : isDark
    ? "rgba(255,255,255,0.46)"
    : "rgba(249,115,22,0.72)",
}}
          >
            <Icon size={19} strokeWidth={1.8} />
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
            className="h-[58px] w-full rounded-2xl bg-transparent pl-12 pr-11 text-sm font-semibold outline-none placeholder:font-medium"
            style={{
              color: isDark ? "rgba(255,255,255,0.92)" : "rgba(15,23,42,0.92)",
            }}
            required
          />

          {rightAction}
        </div>
      </FieldBox>
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
  const reduxSiteConfig = useSelector((state) => state.user.siteConfig);
  const mode = useSelector((state) => state.userTheme?.mode || "light");

  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const isDark = mode === "dark";

  const [publicSiteConfig, setPublicSiteConfig] = useState({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);

  const siteConfig = useMemo(() => {
    const apiConfig = normalizeSiteConfig(publicSiteConfig);
    const storeConfig = normalizeSiteConfig(reduxSiteConfig);

    return {
      ...storeConfig,
      ...apiConfig,
    };
  }, [publicSiteConfig, reduxSiteConfig]);

  const baseHeight = Number(siteConfig?.logoSize) || 4;
  const fg = theme?.fg || "255 255 255";

  useEffect(() => {
    let mounted = true;

    const fetchPublicSiteConfig = async () => {
      try {
        const res = await backendApi.get("/site-config");
        const config = extractSiteConfigFromResponse(res);

        if (!mounted) return;

        setPublicSiteConfig(config || {});
      } catch (error) {
        console.error("Public site config fetch error:", error);
      }
    };

    fetchPublicSiteConfig();

    return () => {
      mounted = false;
    };
  }, []);

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
      const res = await backendApi.post("/auth/send-reset-link", {
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

  const customStyles = useMemo(() => {
    const textColor = isDark ? "rgba(255,255,255,0.92)" : "rgba(15,23,42,0.92)";
    const bg = isDark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.82)";

    return `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px ${bg} inset !important;
        box-shadow: 0 0 0 1000px ${bg} inset !important;
        -webkit-text-fill-color: ${textColor} !important;
        caret-color: ${textColor} !important;
        transition: background-color 9999s ease-in-out 0s !important;
      }
    `;
  }, [isDark]);

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8"
      style={{
        color: isDark ? rgba(fg, 0.92) : "rgba(15,23,42,0.94)",
        fontFamily: fontStack,
      }}
    >
      <style>{customStyles}</style>
      <Toaster position="top-right" />

      <ForexBackground isDark={isDark} />
      <ThemeToggle isDark={isDark} />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-center">
        <div className="grid w-full items-stretch gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          {/* Left Side */}
          <motion.aside
            variants={itemVariants}
            className="relative hidden overflow-hidden rounded-[2rem] border p-8 lg:block"
            style={{
              borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(249,115,22,0.13)",
              background: isDark
                ? "linear-gradient(145deg, rgba(22,14,9,0.70), rgba(10,7,5,0.78))"
                : "linear-gradient(145deg, rgba(255,255,255,0.64), rgba(255,247,237,0.55))",
              boxShadow: isDark
                ? "0 32px 90px rgba(0,0,0,0.42)"
                : "0 32px 90px rgba(249,115,22,0.10)",
            }}
          >
            <div className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />

            <div className="relative">
              <div className="pt-10">
                <motion.h1
                  variants={itemVariants}
                  className="max-w-[470px] text-5xl font-black leading-[1.12] tracking-[-0.075em]"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.94)" : "rgba(17,24,39,0.98)",
                  }}
                >
                  Welcome Back to
                  <br />
                  your <span style={{ color: rgb(orange) }}>Forex Business</span>
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="mt-5 max-w-[430px] text-base font-medium leading-7"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.62)" : "rgba(15,23,42,0.68)",
                  }}
                >
                  Securely access your leads, clients, IBs, performance insights and broker
                  operations from one powerful platform.
                </motion.p>
              </div>

              <div className="mt-8 grid max-w-[430px] gap-4">
                <FeatureCard
                  icon={UsersRound}
                  title="Lead & Client Management"
                  desc="Track, manage and convert leads efficiently."
                  isDark={isDark}
                />
                <FeatureCard
                  icon={Network}
                  title="IB & Partner System"
                  desc="Access your partner and referral network."
                  isDark={isDark}
                />
                <FeatureCard
                  icon={BarChart3}
                  title="Analytics & Reports"
                  desc="View real-time business and trading insights."
                  isDark={isDark}
                />
                <FeatureCard
                  icon={ShieldCheck}
                  title="Secure Login Access"
                  desc="Protected access for your CRM workspace."
                  isDark={isDark}
                />
              </div>

              <QuoteBox isDark={isDark} />
            </div>
          </motion.aside>

          {/* Right Side */}
          <motion.section
            variants={itemVariants}
            className="relative overflow-hidden rounded-[2rem] border p-4 sm:p-6 lg:p-8"
            style={{
              borderColor: isDark ? "rgba(255,255,255,0.11)" : "rgba(249,115,22,0.13)",
              background: isDark
                ? "linear-gradient(145deg, rgba(22,14,9,0.82), rgba(10,7,5,0.86))"
                : "linear-gradient(145deg, rgba(255,255,255,0.92), rgba(255,253,251,0.90))",
              boxShadow: isDark
                ? "0 32px 90px rgba(0,0,0,0.46)"
                : "0 32px 90px rgba(249,115,22,0.12)",
            }}
          >
            <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="relative mx-auto flex min-h-[680px] w-full max-w-[520px] flex-col justify-center">
              <motion.div variants={itemVariants} className="mb-3">
                <BrandMark
                  logo={siteConfig?.logo}
                  baseHeight={baseHeight}
                  isDark={isDark}
                  websiteName={siteConfig?.websiteName}
                />
              </motion.div>

              <AnimatePresence mode="wait">
                {!showForgotPassword ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.22 }}
                  >
                    <form onSubmit={handleLogin} className="grid grid-cols-1 gap-4">
                      <LoginField
                        icon={Mail}
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        isDark={isDark}
                        autoComplete="current-password"
                        rightAction={
                          <button
                            type="button"
                            onClick={() => setShowPass((s) => !s)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 transition hover:opacity-80"
                            style={{
                              color: isDark ? "rgba(255,255,255,0.50)" : "rgba(15,23,42,0.50)",
                            }}
                            aria-label={showPass ? "Hide password" : "Show password"}
                          >
                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        }
                      />

                      <div className="mt-1 flex items-center justify-between gap-3 text-sm">
                        <label
                          className="inline-flex cursor-pointer select-none items-center gap-2 font-semibold"
                          style={{
                            color: isDark ? "rgba(255,255,255,0.62)" : "rgba(15,23,42,0.62)",
                          }}
                        >
                          <span className="relative flex h-5 w-5 items-center justify-center">
                            <input
                              type="checkbox"
                              checked={remember}
                              onChange={() => setRemember((v) => !v)}
                              className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            />

                            <span
                              className="flex h-5 w-5 items-center justify-center rounded-md border transition"
                              style={{
                                borderColor: remember
  ? "rgba(249,115,22,0.90)"
  : isDark
  ? "rgba(255,255,255,0.30)"
  : "rgba(249,115,22,0.55)",
                                background: remember ? rgb(orange) : "transparent",
                              }}
                            >
                              {remember && <Check size={14} className="text-white" />}
                            </span>
                          </span>
                          Remember me
                        </label>

                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="font-bold transition hover:opacity-80"
                          style={{ color: rgb(orange) }}
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
                        className="group relative mt-3 flex h-[64px] items-center justify-center gap-3 overflow-hidden rounded-2xl text-lg font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-65"
                        style={{
                          background: `linear-gradient(135deg, ${rgb(amber)}, ${rgb(deepOrange)})`,
                          boxShadow: "0 18px 40px rgba(249,115,22,0.32)",
                        }}
                      >
                        <span className="absolute inset-0 -translate-x-full bg-white/20 transition duration-700 group-hover:translate-x-full" />

                        {isLoading ? "Signing In..." : "Sign In"}

                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <LogIn size={22} className="transition group-hover:translate-x-1" />
                        )}
                      </motion.button>
                    </form>

                    <div
                      className="mt-6 rounded-2xl border p-4"
                      style={{
                        borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(249,115,22,0.14)",
                        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,247,237,0.58)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                          style={{
                            background: "rgba(249,115,22,0.10)",
                            color: rgb(orange),
                          }}
                        >
                          <Shield size={18} />
                        </span>

                        <div>
                          <p
                            className="text-sm font-bold"
                            style={{
                              color: isDark ? "rgba(255,255,255,0.88)" : "rgba(15,23,42,0.9)",
                            }}
                          >
                            Protected trading workspace
                          </p>

                          <p
                            className="mt-1 text-xs font-medium leading-5"
                            style={{
                              color: isDark ? "rgba(255,255,255,0.48)" : "rgba(15,23,42,0.56)",
                            }}
                          >
                            Access your CRM dashboard, client pipeline, IB network and financial
                            activity securely.
                          </p>
                        </div>
                      </div>
                    </div>

                    <p
                      className="mt-6 text-center text-sm font-semibold"
                      style={{
                        color: isDark ? "rgba(255,255,255,0.56)" : "rgba(15,23,42,0.58)",
                      }}
                    >
                      Don&apos;t have an account?{" "}
                      <Link
                        to="/auth/signup"
                        className="font-black transition hover:opacity-80"
                        style={{ color: rgb(orange) }}
                      >
                        Create Account
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
                      className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition hover:opacity-85"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(249,115,22,0.08)",
                        color: rgb(orange),
                        border: `1px solid ${
                          isDark ? "rgba(255,255,255,0.1)" : "rgba(249,115,22,0.15)"
                        }`,
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to login
                    </button>

                    <form onSubmit={handleForgotPassword} className="grid grid-cols-1 gap-4">
                      <LoginField
                        icon={Mail}
                        name="resetEmail"
                        type="email"
                        placeholder="Email Address"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        isDark={isDark}
                        autoComplete="email"
                      />

                      <motion.button
                        variants={itemVariants}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isResetLoading}
                        className="group relative mt-3 flex h-[64px] items-center justify-center gap-3 overflow-hidden rounded-2xl text-lg font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-65"
                        style={{
                          background: `linear-gradient(135deg, ${rgb(amber)}, ${rgb(deepOrange)})`,
                          boxShadow: "0 18px 40px rgba(249,115,22,0.32)",
                        }}
                      >
                        <span className="absolute inset-0 -translate-x-full bg-white/20 transition duration-700 group-hover:translate-x-full" />

                        {isResetLoading ? "Sending..." : "Send Reset Link"}

                        {isResetLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <ArrowRight size={22} className="transition group-hover:translate-x-1" />
                        )}
                      </motion.button>
                    </form>

                    <div
                      className="mt-6 rounded-2xl border p-4"
                      style={{
                        borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(249,115,22,0.14)",
                        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,247,237,0.58)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                          style={{
                            background: "rgba(249,115,22,0.10)",
                            color: rgb(orange),
                          }}
                        >
                          <BadgeCheck size={18} />
                        </span>

                        <div>
                          <p
                            className="text-sm font-bold"
                            style={{
                              color: isDark ? "rgba(255,255,255,0.88)" : "rgba(15,23,42,0.9)",
                            }}
                          >
                            Quick account recovery
                          </p>

                          <p
                            className="mt-1 text-xs font-medium leading-5"
                            style={{
                              color: isDark ? "rgba(255,255,255,0.48)" : "rgba(15,23,42,0.56)",
                            }}
                          >
                            We&apos;ll send a secure reset link so you can return to your Forex CRM
                            without friction.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>

        <StatStrip isDark={isDark} />
      </section>
    </motion.main>
  );
};

export default UserLogin;