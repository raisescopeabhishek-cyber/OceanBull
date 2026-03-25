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
} from "lucide-react";
import { backendApi ,adminApi } from "../../utils/apiClients";
import { setLoggedUser } from "../../redux/user/userSlice";
import ModernHeading from "../lib/ModernHeading";
import UseUserHook from "@/hooks/user/UseUserHook";
import { fetchCurrentUser } from "@/redux/AsyncThunk/fetchCurrentUser";

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

/* ============================ THEME PRIMITIVES ============================ */
const containerVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98, rotateX: 6 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: { duration: 0.8, when: "beforeChildren", staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, rotateX: 6, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 190, damping: 20, duration: 0.5 },
  },
};

const AnimatedGrid = ({ theme }) => {
  const grid = theme?.accent || theme?.ring || "34 197 94";
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.1,
          backgroundImage: `linear-gradient(${rgba(
            grid,
            0.2
          )} 1px, transparent 1px), linear-gradient(90deg, ${rgba(
            grid,
            0.2
          )} 1px, transparent 1px)`,
          backgroundSize: "42px 42px",
          maskImage:
            "radial-gradient(ellipse at center, black 55%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 55%, transparent 85%)",
        }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          opacity: 0.2,
          background: `repeating-linear-gradient(90deg, ${rgba(
            theme?.info || theme?.gradientTo || "59 130 246",
            0.12
          )} 0 2px, transparent 2px 8px)`,
        }}
      />
    </div>
  );
};

const FloatingOrbs = ({ theme }) => {
  const effects = theme?.effectsEnabled !== false;
  if (!effects) return null;

  const c1 = theme?.accent || "16 185 129";
  const c2 = theme?.info || theme?.gradientFrom || "34 211 238";
  const c3 = theme?.gradientTo || theme?.primary || "99 102 241";

  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-2xl"
          style={{
            width: 150,
            height: 150,
            left: `${(i * 97) % 100}%`,
            top: `${(i * 53) % 100}%`,
            background:
              i % 3 === 0
                ? `radial-gradient(circle at center, ${rgba(c1, 0.25)}, transparent 60%)`
                : i % 3 === 1
                ? `radial-gradient(circle at center, ${rgba(c2, 0.25)}, transparent 60%)`
                : `radial-gradient(circle at center, ${rgba(c3, 0.25)}, transparent 60%)`,
          }}
          animate={{
            y: [0, i % 2 ? -22 : 22, 0],
            x: [0, i % 2 ? 12 : -12, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 6 + (i % 5),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

const GlassCard = ({ theme, className = "", children }) => {
  const border = theme?.border || theme?.inputBorder || "255 255 255";
  const card = theme?.card || theme?.surface2 || "18 18 18";
  const glow = theme?.glow || theme?.accent || "59 130 246";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className={`relative rounded-2xl backdrop-blur-xl ${className}`}
      style={{
        border: `1px solid ${rgba(border, 0.14)}`,
        background: `linear-gradient(135deg, ${rgba(card, 0.72)}, ${rgba(
          card,
          0.32
        )}, ${rgba(card, 0.72)})`,
        boxShadow: `0 0 80px ${rgba(glow, 0.08)}`,
      }}
    >
      <div
        className="absolute inset-px rounded-[calc(1rem-1px)] pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${rgba(
            theme?.gradientFrom || theme?.accent || "59 130 246",
            0.06
          )}, ${rgba(theme?.gradientTo || theme?.info || "34 211 238", 0.06)})`,
        }}
      />
      {children}
    </motion.div>
  );
};

const NeonDivider = ({ theme }) => {
  const effects = theme?.effectsEnabled !== false;
  const accent = theme?.accent || theme?.ring || "59 130 246";
  return (
    <div className="relative w-full my-4">
      <div
        className="h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${rgba(
            accent,
            0.55
          )}, transparent)`,
        }}
      />
      {effects && (
        <motion.div
          className="absolute -top-[3px] left-0 h-[7px] w-16 rounded-full blur-md"
          style={{ background: rgba(accent, 0.6) }}
          animate={{ left: ["0%", "100%"] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
};

/* -------------------- Ticker (mocked) -------------------- */
const Ticker = ({ theme }) => {
  const coins = [
    { s: "BTC", p: 61234.12, c: +2.14 },
    { s: "ETH", p: 2431.78, c: -0.86 },
    { s: "SOL", p: 162.45, c: +4.21 },
    { s: "XRP", p: 0.62, c: +1.37 },
    { s: "DOGE", p: 0.146, c: -2.05 },
  ];

  const border = theme?.border || theme?.inputBorder || "255 255 255";
  const fg = theme?.fg || "255 255 255";
  const success = theme?.success || theme?.accent || "34 197 94";
  const danger = theme?.danger || "244 63 94";

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        borderBottom: `1px solid ${rgba(border, 0.14)}`,
        background: `linear-gradient(90deg, transparent, ${rgba(
          theme?.accent || success,
          0.06
        )}, transparent)`,
      }}
    >
      <motion.div
        className="flex gap-6 whitespace-nowrap py-2 text-xs px-3"
        animate={{ x: ["0%", "-100%"] }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity }}
        style={{ color: rgba(fg, 0.85) }}
      >
        {[...coins, ...coins].map((c, i) => (
          <span key={i} className="font-mono" title={`${c.s} ${c.p.toLocaleString()}`}>
            {c.s}:{" "}
            <span style={{ color: rgba(fg, 0.92) }}>
              {c.p < 1 ? c.p.toFixed(4) : c.p.toLocaleString()}
            </span>{" "}
            <span style={{ color: c.c >= 0 ? rgb(success) : rgb(danger) }}>
              {c.c >= 0 ? "▲" : "▼"} {Math.abs(c.c)}%
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

const UserLogin = () => {
  //impersonate
  const {userId} = useParams();
 
  

  // ✅ dynamic theme
  const themeConfig = useSelector((state) => state.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const { getReset } = UseUserHook();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const siteConfig = useSelector((state) => state.user.siteConfig);
  const baseHeight = siteConfig?.logoSize || 4;

  // tokens
  const bg = theme?.bg || "0 0 0";
  const surface1 = theme?.surface1 || theme?.bg || "0 0 0";
  const fg = theme?.fg || "255 255 255";
  const accent = theme?.accent || theme?.gradientFrom || "59 130 246";
  const ring = theme?.ring || theme?.accent || accent;
  const border = theme?.border || theme?.inputBorder || "255 255 255";
  const inputBg = theme?.input || theme?.surface2 || "18 18 18";

  const inputWrap = "relative";
  const inputBase = "w-full pl-10 pr-12 py-3 rounded-lg outline-none transition";

  const inputStyle = {
    color: rgba(fg, 0.92),
    background: `linear-gradient(135deg, ${rgba(inputBg, 0.55)}, ${rgba(
      surface1,
      0.22
    )})`,
    border: `1px solid ${rgba(border, 0.14)}`,
    boxShadow: "none",
  };

  const inputFocusStyle = (focused) =>
    focused
      ? { borderColor: rgba(ring, 0.5), boxShadow: `0 0 0 2px ${rgba(ring, 0.22)}` }
      : {};

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

  useEffect(()=>{
    console.log("Impersonate Mode On ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️");
    

    const userRedirectHandler = async (userId) => {
      try {
        getReset();
        // api/auth/impersonate
    
        const res = await backendApi.post("/auth/impersonate", { userId: userId });
             await dispatch(fetchCurrentUser());
      toast.success(`Welcome 👋🏽 ${res.data.userName}`);
      setTimeout(() => navigate(res.data.redirectTo), 600);
      } catch (e) {
        toast.error("Impersonation failed");
        console.error(e);
      }
    };

    if(userId) userRedirectHandler(userId);



  },[userId])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${rgb(bg)}, ${rgb(surface1)}, ${rgb(bg)})`,
        color: rgba(fg, 0.92),
      }}
    >
      <Toaster position="top-right" />
      <AnimatedGrid theme={theme} />
      <FloatingOrbs theme={theme} />

      {/* Ticker */}
      <Ticker theme={theme} />

      <div className="flex flex-1">
        {/* Left promo */}
        <div className="hidden xl:flex flex-col justify-center items-center w-1/2 px-14 relative z-10">
          <motion.img
            src={siteConfig?.logo}
            alt="Logo"
            className="object-contain mb-6"
            initial={{ rotate: 0 }}
            whileHover={{ rotate: -3, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
            style={{ height: `${baseHeight}rem` }}
          />

          <div className="text-center">
            <div
              className="inline-flex items-center gap-2 uppercase tracking-[0.25em] text-xs font-semibold"
              style={{ color: rgba(accent, 0.8) }}
            >
              <Sparkles size={16} /> secure · fast · modern
            </div>

            <ModernHeading text="Welcome to Our Platform" />

            <p className="mt-3 max-w-md" style={{ color: rgba(fg, 0.72) }}>
              Trade smarter with real-time performance, encrypted access, and a sleek web app UX.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 text-sm" style={{ color: rgba(fg, 0.65) }}>
              <Shield className="w-4 h-4" /> 2FA ready • Encrypted transit • Session hardening
            </div>

            <NeonDivider theme={theme} />
          </div>
        </div>

        {/* Right: Auth card */}
        <div className="flex justify-center items-center w-full xl:w-1/2 p-6 relative z-10">
          <GlassCard theme={theme} className="w-full max-w-md p-8 md:p-10">
            <AnimatePresence mode="wait">
              {!showForgotPassword ? (
                <motion.div
                  key="login"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex flex-col items-center mb-6">
                    <motion.img
                      src={siteConfig?.logo}
                      alt="Logo"
                      className="object-contain"
                      initial={{ rotate: 0 }}
                      whileHover={{ rotate: -3, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      style={{ height: `${baseHeight}rem` }}
                    />
                    <ModernHeading text="Welcome Back" />
                    <p className="mt-2" style={{ color: rgba(fg, 0.72) }}>
                      Enter your credentials to access your account
                    </p>
                    <NeonDivider theme={theme} />
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email */}
                    <div className={inputWrap}>
                      <Mail className="absolute top-3.5 left-3" style={{ color: rgba(accent, 0.8) }} />
                      <input
                        type="email"
                        className={inputBase}
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={inputStyle}
                        onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle(true))}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "";
                          e.currentTarget.style.boxShadow = "";
                        }}
                      />
                    </div>

                    {/* Password */}
                    <div className={inputWrap}>
                      <Lock className="absolute top-3.5 left-3" style={{ color: rgba(accent, 0.8) }} />
                      <input
                        type={showPass ? "text" : "password"}
                        className={inputBase}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                        onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle(true))}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "";
                          e.currentTarget.style.boxShadow = "";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((s) => !s)}
                        className="absolute right-3 top-3.5 hover:opacity-100 transition"
                        style={{ color: rgba(fg, 0.65) }}
                        aria-label={showPass ? "Hide password" : "Show password"}
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Row: remember + forgot */}
                    <div className="flex items-center justify-between text-sm">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={remember}
                          onChange={() => setRemember((v) => !v)}
                          className="rounded"
                          style={{ accentColor: rgb(accent) }}
                        />
                        <span style={{ color: rgba(fg, 0.8) }}>Remember me</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        style={{ color: rgba(accent, 0.9) }}
                        className="hover:opacity-90"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Submit */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex gap-2 items-center justify-center py-3 px-4 rounded-lg font-semibold disabled:opacity-60"
                      style={{
                        color: rgb(theme?.primaryFg || "0 0 0"),
                        background: `linear-gradient(90deg,
                          ${rgb(theme?.gradientFrom || accent)},
                          ${rgb(theme?.accent || theme?.primary || accent)},
                          ${rgb(theme?.gradientTo || accent)}
                        )`,
                        boxShadow: `0 10px 30px ${rgba(theme?.glow || accent, 0.28)}`,
                      }}
                    >
                      <LogIn size={20} />
                      Sign in
                      {isLoading && <Loader2 className="animate-spin" />}
                    </motion.button>
                  </form>

                  <p className="mt-6 text-center text-sm" style={{ color: rgba(fg, 0.7) }}>
                    Don&apos;t have an account?{" "}
                    <Link to="/user/signup" className="font-semibold" style={{ color: rgba(accent, 0.9) }}>
                      Sign up
                    </Link>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="forgot"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="flex items-center mb-6 hover:opacity-90"
                    style={{ color: rgba(accent, 0.9) }}
                  >
                    <ArrowLeft size={20} className="mr-2" /> Back to login
                  </button>

                  <div className="mb-2">
                    <ModernHeading text="Forgot Password" />
                    <p className="mt-2" style={{ color: rgba(fg, 0.72) }}>
                      Enter your email and we’ll send you a secure reset link.
                    </p>
                    <NeonDivider theme={theme} />
                  </div>

                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div className="relative">
                      <Mail className="absolute top-3.5 left-3" style={{ color: rgba(accent, 0.8) }} />
                      <input
                        type="email"
                        className={inputBase}
                        placeholder="Email address"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        style={inputStyle}
                        onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle(true))}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "";
                          e.currentTarget.style.boxShadow = "";
                        }}
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isResetLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold disabled:opacity-60"
                      style={{
                        color: rgb(theme?.primaryFg || "0 0 0"),
                        background: `linear-gradient(90deg,
                          ${rgb(theme?.gradientFrom || accent)},
                          ${rgb(theme?.accent || theme?.primary || accent)},
                          ${rgb(theme?.gradientTo || accent)}
                        )`,
                        boxShadow: `0 10px 30px ${rgba(theme?.glow || accent, 0.28)}`,
                      }}
                    >
                      Send reset link
                      {isResetLoading && <Loader2 className="animate-spin" />}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
};

export default UserLogin;
