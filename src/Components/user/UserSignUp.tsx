import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  Mail,
  Lock,
  User as UserIcon,
  Globe,
  Check,
  MapPin,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Sun,
  Moon,
} from "lucide-react";
import { getData } from "country-list";
import { useDispatch, useSelector } from "react-redux";
import { backendApi } from "../../utils/apiClients";
import { toggleUserTheme } from "../../redux/userThemeSlice";
import ModernHeading from "../lib/ModernHeading";
import sidebarBg from "@/assets/sidebar.png";

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

const AnimatedGrid = ({ theme, isDark }: { theme: any; isDark: boolean }) => {
  const grid = theme?.accent || theme?.ring || "34 197 94";
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          opacity: isDark ? 0.1 : 0.07,
          backgroundImage: `linear-gradient(${rgba(
            grid,
            isDark ? 0.2 : 0.12
          )} 1px, transparent 1px), linear-gradient(90deg, ${rgba(
            grid,
            isDark ? 0.2 : 0.12
          )} 1px, transparent 1px)`,
          backgroundSize: "46px 46px",
          maskImage:
            "radial-gradient(ellipse at 50% 25%, black 60%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 25%, black 60%, transparent 85%)",
        }}
      />
    </div>
  );
};

const FloatingOrbs = ({ theme, isDark }: { theme: any; isDark: boolean }) => {
  const effects = theme?.effectsEnabled !== false;
  if (!effects) return null;

  const c1 = theme?.accent || "16 185 129";
  const c2 = theme?.info || theme?.gradientFrom || "34 211 238";
  const c3 = theme?.gradientTo || theme?.primary || "99 102 241";

  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 7 }).map((_, i) => {
        const c = i % 3 === 0 ? c1 : i % 3 === 1 ? c2 : c3;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{
              width: 160,
              height: 160,
              left: `${(i * 133) % 100}%`,
              top: `${(i * 77) % 100}%`,
              background: `radial-gradient(circle at center, ${rgba(
                c,
                isDark ? 0.22 : 0.12
              )}, transparent 60%)`,
            }}
            animate={{
              y: [0, i % 2 ? -16 : 16, 0],
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
        );
      })}
    </div>
  );
};

const GlassCard = ({
  theme,
  isDark,
  className = "",
  children,
}: {
  theme: any;
  isDark: boolean;
  className?: string;
  children: any;
}) => {
  const border = theme?.border || theme?.inputBorder || "255 255 255";
  const card = theme?.card || theme?.surface2 || "18 18 18";
  const glow = theme?.glow || theme?.accent || "59 130 246";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className={`relative rounded-2xl backdrop-blur-xl ${className}`}
      style={{
        border: `1px solid ${rgba(border, isDark ? 0.14 : 0.1)}`,
        background: isDark
          ? `linear-gradient(135deg, ${rgba(card, 0.72)}, ${rgba(
              card,
              0.32
            )}, ${rgba(card, 0.72)})`
          : `linear-gradient(135deg, rgba(255,255,255,0.84), rgba(255,247,240,0.62), rgba(255,255,255,0.84))`,
        boxShadow: isDark
          ? `0 0 80px ${rgba(glow, 0.08)}`
          : `0 20px 70px rgba(251,146,60,0.12)`,
      }}
    >
      <div
        className="absolute inset-px rounded-[calc(1rem-1px)] pointer-events-none"
        style={{
          background: isDark
            ? `linear-gradient(135deg, ${rgba(
                theme?.gradientFrom || theme?.accent || "59 130 246",
                0.06
              )}, ${rgba(theme?.gradientTo || theme?.info || "34 211 238", 0.06)})`
            : `linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,247,240,0.25))`,
        }}
      />
      {children}
    </motion.div>
  );
};

const NeonDivider = ({ theme, isDark }: { theme: any; isDark: boolean }) => {
  const effects = theme?.effectsEnabled !== false;
  const accent = theme?.accent || theme?.ring || "59 130 246";
  return (
    <div className="relative w-full my-4">
      <div
        className="h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${rgba(
            accent,
            isDark ? 0.55 : 0.32
          )}, transparent)`,
        }}
      />
      {effects && (
        <motion.div
          className="absolute -top-[3px] left-0 h-[7px] w-16 rounded-full blur-md"
          style={{ background: rgba(accent, isDark ? 0.6 : 0.35) }}
          animate={{ left: ["0%", "100%"] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
};

function getPasswordStrength(pw = "", theme: any) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const clamp = Math.min(score, 4);
  const labels = ["Very weak", "Weak", "Good", "Strong", "Excellent"];

  const c0 = theme?.danger || "239 68 68";
  const c1 = theme?.warning || "245 158 11";
  const c2 = theme?.info || "234 179 8";
  const c3 = theme?.success || "34 197 94";
  const c4 = theme?.accent || theme?.gradientFrom || "16 185 129";
  const colors = [c0, c1, c2, c3, c4];

  return { score: clamp, label: labels[clamp], color: colors[clamp] };
}

const UserSignUp = () => {
  const dispatch = useDispatch();

  const themeConfig = useSelector((state: any) => state.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const mode = useSelector((state: any) => state.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    address: "",
    zipCode: "",
    country: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { id: routeId } = useParams();
  const inviteId =
    routeId &&
    routeId !== "undefined" &&
    routeId !== "null" &&
    String(routeId).trim() !== ""
      ? routeId
      : null;

  const navigate = useNavigate();
  const siteConfig = useSelector((state: any) => state.user.siteConfig);
  const baseHeight = siteConfig?.logoSize || 4;
  const countriesArray = getData();

  const handleChange = (e: any) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePhoneChange = (phone: any) =>
    setFormData((prev) => ({ ...prev, phone }));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      return setError({ type: "validation", message: "Passwords do not match." });
    }
    if (!formData.phone?.trim()) {
      return setError({ type: "validation", message: "Phone number is required." });
    }

    setSubmitting(true);
    const toastId = toast.loading("Creating account...");
    try {
      const path = inviteId ? `/auth/signup/${encodeURIComponent(inviteId)}` : `/auth/signup`;
      const res = await backendApi.post(path, formData);
      toast.success(res.data.message, { id: toastId });
      navigate(res.data.redirectTo);
    } catch (err: any) {
      let message = "Signup failed";
      if (err.message) message = err.message;
      else if (!err.response) message = "Network error: please check your internet connection.";
      else if (err.response.status >= 500) message = "Server error: please try again later.";
      else if (err.response.status === 401) message = "Unauthorized: invalid credentials.";
      else if (err.response.status === 403) message = "Forbidden: you do not have permission.";
      else if (err.response.data?.msg) message = err.response.data.msg;

      setError({ type: "http", message });
      toast.error(message, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const strength = getPasswordStrength(formData.password, theme);

  const bg = theme?.bg || "0 0 0";
  const surface1 = theme?.surface1 || theme?.bg || "0 0 0";
  const fg = theme?.fg || "255 255 255";
  const accent = theme?.accent || theme?.gradientFrom || "59 130 246";
  const ring = theme?.ring || theme?.accent || accent;
  const border = theme?.border || theme?.inputBorder || "255 255 255";
  const inputBg = theme?.input || theme?.surface2 || "18 18 18";

  const phoneInputCustomStyles = useMemo(() => {
    return `
      .PhoneInput { position: relative; width: 100%; }
      .PhoneInputInput {
        background: ${
          isDark
            ? rgba(inputBg, 0.55)
            : "linear-gradient(135deg, rgba(255,255,255,0.86), rgba(255,247,240,0.66))"
        } !important;
        border: 1px solid ${rgba(border, isDark ? 0.14 : 0.1)} !important;
        color: ${isDark ? rgba(fg, 0.92) : "rgba(15,23,42,0.92)"} !important;
        padding: 0.75rem 0.9rem 0.75rem 3rem !important;
        border-radius: 0.5rem !important;
        outline: none !important;
      }
      .PhoneInputInput::placeholder { color: ${isDark ? rgba(fg, 0.45) : "rgba(100,116,139,0.8)"} !important; }
      .PhoneInputInput:focus {
        border-color: ${rgba(ring, 0.45)} !important;
        box-shadow: 0 0 0 2px ${rgba(ring, 0.22)} !important;
      }
      .PhoneInputCountry {
        position: absolute;
        left: 0.5rem; top: 50%; transform: translateY(-50%);
        background: transparent !important;
        border: none !important;
      }
      .PhoneInputCountrySelect {
        background-color: ${isDark ? "#0b1220" : "#ffffff"} !important;
        color: ${isDark ? "#fff" : "#0f172a"} !important;
      }
    `;
  }, [inputBg, border, fg, ring, isDark]);

  const inputBase = "w-full pl-10 pr-12 py-3 rounded-lg outline-none transition";
  const iconWrap = "absolute top-3.5 left-3";

  const inputStyle: React.CSSProperties = {
    color: isDark ? rgba(fg, 0.92) : "rgba(15,23,42,0.92)",
    background: isDark
      ? `linear-gradient(135deg, ${rgba(inputBg, 0.55)}, ${rgba(surface1, 0.22)})`
      : "linear-gradient(135deg, rgba(255,255,255,0.86), rgba(255,247,240,0.66))",
    border: `1px solid ${rgba(border, isDark ? 0.14 : 0.1)}`,
    boxShadow: "none",
  };

  const inputFocusStyle = (focused: boolean) =>
    focused
      ? {
          borderColor: rgba(ring, 0.5),
          boxShadow: `0 0 0 2px ${rgba(ring, 0.22)}`,
        }
      : {};

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen flex overflow-hidden"
      style={{
        background: isDark
          ? `linear-gradient(135deg, ${rgb(bg)}, ${rgb(surface1)}, ${rgb(bg)})`
          : "linear-gradient(180deg, #fffaf7 0%, #fff7f2 45%, #fff1e8 100%)",
        color: isDark ? rgba(fg, 0.92) : "rgba(15,23,42,0.92)",
      }}
    >
      <style>{phoneInputCustomStyles}</style>

      {!isDark && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.20]"
          style={{ backgroundImage: `url(${sidebarBg})` }}
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? `
              radial-gradient(circle at 12% 18%, rgba(59,130,246,0.12), transparent 25%),
              radial-gradient(circle at 88% 5%, rgba(34,211,238,0.08), transparent 24%),
              radial-gradient(circle at 50% 100%, rgba(255,255,255,0.03), transparent 35%)
            `
            : `
              radial-gradient(circle at 15% 18%, rgba(251,146,60,0.14), transparent 24%),
              radial-gradient(circle at 85% 0%, rgba(255,255,255,0.85), transparent 28%),
              linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,247,240,0.25))
            `,
        }}
      />

      {isDark && (
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
      )}

      <AnimatedGrid theme={theme} isDark={isDark} />
      <FloatingOrbs theme={theme} isDark={isDark} />

      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={() => dispatch(toggleUserTheme())}
          className="flex items-center justify-center w-11 h-11 rounded-full border backdrop-blur-md transition hover:scale-105"
          style={{
            borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(251,146,60,0.16)",
            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.82)",
            color: isDark ? "rgba(255,255,255,0.88)" : "rgba(249,115,22,0.95)",
            boxShadow: isDark
              ? "0 12px 30px rgba(0,0,0,0.35)"
              : "0 12px 30px rgba(251,146,60,0.12)",
          }}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 px-12 relative z-10">
        <motion.img
          src={siteConfig?.logo}
          alt="Logo"
          className="object-contain mb-6"
          initial={{ rotate: 0 }}
          whileHover={{ rotate: -3, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
          style={{ height: `${baseHeight}rem` }}
        />

        <div
          className="inline-flex items-center gap-2 uppercase tracking-[0.25em] text-xs font-semibold"
          style={{ color: isDark ? rgba(accent, 0.8) : "rgba(249,115,22,0.9)" }}
        >
          <Sparkles size={16} /> secure · fast · modern
        </div>

        <ModernHeading text="Join Our Platform" />

        <p
          className="mt-3 text-center max-w-md"
          style={{ color: isDark ? rgba(fg, 0.72) : "rgba(71,85,105,0.92)" }}
        >
          Start your journey with neon-speed onboarding and a sleek trading dashboard.
        </p>

        <div
          className="mt-4 inline-flex items-center gap-2 text-sm"
          style={{ color: isDark ? rgba(fg, 0.65) : "rgba(100,116,139,0.9)" }}
        >
          <Shield className="w-4 h-4" /> Email verification • Encrypted transit • Session hardening
        </div>

        <NeonDivider theme={theme} isDark={isDark} />
      </div>

      <div className="flex justify-center items-center w-full lg:w-1/2 p-6 relative z-10">
        <GlassCard theme={theme} isDark={isDark} className="w-full max-w-3xl p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
            <span
              className="px-3 py-1 rounded-full"
              style={{
                background: rgba(theme?.accent || accent, isDark ? 0.12 : 0.08),
                border: `1px solid ${rgba(theme?.accent || accent, isDark ? 0.22 : 0.16)}`,
                color: isDark ? rgba(theme?.accent || accent, 0.9) : "rgba(249,115,22,0.95)",
              }}
            >
              1 · Personal
            </span>
            <span
              className="px-3 py-1 rounded-full"
              style={{
                background: rgba(theme?.info || theme?.gradientTo || accent, isDark ? 0.12 : 0.08),
                border: `1px solid ${rgba(theme?.info || theme?.gradientTo || accent, isDark ? 0.22 : 0.16)}`,
                color: isDark
                  ? rgba(theme?.info || theme?.gradientTo || accent, 0.9)
                  : "rgba(249,115,22,0.95)",
              }}
            >
              2 · Contact
            </span>
            <span
              className="px-3 py-1 rounded-full"
              style={{
                background: rgba(theme?.gradientTo || theme?.primary || accent, isDark ? 0.12 : 0.08),
                border: `1px solid ${rgba(theme?.gradientTo || theme?.primary || accent, isDark ? 0.22 : 0.16)}`,
                color: isDark
                  ? rgba(theme?.gradientTo || theme?.primary || accent, 0.9)
                  : "rgba(249,115,22,0.95)",
              }}
            >
              3 · Security
            </span>
          </div>

          <div className="mb-4">
            <ModernHeading text="Create an Account" />
            <p
              style={{ color: isDark ? rgba(fg, 0.72) : "rgba(71,85,105,0.92)" }}
              className="mt-1"
            >
              It only takes a minute. We’ll email a verification link.
            </p>
            <NeonDivider theme={theme} isDark={isDark} />
          </div>

          <AnimatePresence>
            {error?.message && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 rounded-lg px-4 py-3"
                style={{
                  border: `1px solid ${rgba(theme?.danger || "239 68 68", 0.35)}`,
                  background: rgba(theme?.danger || "239 68 68", 0.12),
                  color: isDark ? rgba(fg, 0.92) : "rgba(127,29,29,0.95)",
                }}
              >
                {error.message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="relative">
              <UserIcon className={iconWrap} style={{ color: isDark ? rgba(accent, 0.8) : "rgba(249,115,22,0.85)" }} />
              <input
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className={inputBase}
                style={inputStyle}
                required
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle(true))}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>

            <div className="relative">
              <UserIcon className={iconWrap} style={{ color: isDark ? rgba(accent, 0.8) : "rgba(249,115,22,0.85)" }} />
              <input
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className={inputBase}
                style={inputStyle}
                required
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle(true))}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>

            <div className="relative">
              <Mail className={iconWrap} style={{ color: isDark ? rgba(accent, 0.8) : "rgba(249,115,22,0.85)" }} />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={inputBase}
                style={inputStyle}
                required
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle(true))}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>

            <div className="relative">
              <PhoneInput
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handlePhoneChange}
                defaultCountry="IN"
                international
                required
              />
            </div>

            <div className="relative">
              <Globe className={iconWrap} style={{ color: isDark ? rgba(accent, 0.8) : "rgba(249,115,22,0.85)" }} />
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={inputBase}
                style={inputStyle}
                required
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle(true))}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <option value="">Select Country</option>
                {countriesArray.map((c) => (
                  <option
                    key={c.code}
                    value={c.name}
                    style={{
                      background: isDark ? "#0b1220" : "#ffffff",
                      color: isDark ? "#fff" : "#0f172a",
                    }}
                  >
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <MapPin className={iconWrap} style={{ color: isDark ? rgba(accent, 0.8) : "rgba(249,115,22,0.85)" }} />
              <input
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className={inputBase}
                style={inputStyle}
                required
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle(true))}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>

            <div className="relative">
              <MapPin className={iconWrap} style={{ color: isDark ? rgba(accent, 0.8) : "rgba(249,115,22,0.85)" }} />
              <input
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                className={inputBase}
                style={inputStyle}
                required
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle(true))}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>

            <div className="relative">
              <MapPin className={iconWrap} style={{ color: isDark ? rgba(accent, 0.8) : "rgba(249,115,22,0.85)" }} />
              <input
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className={inputBase}
                style={inputStyle}
                required
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle(true))}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>

            <div className="relative">
              <MapPin className={iconWrap} style={{ color: isDark ? rgba(accent, 0.8) : "rgba(249,115,22,0.85)" }} />
              <input
                name="zipCode"
                placeholder="Zip Code"
                value={formData.zipCode}
                onChange={handleChange}
                className={inputBase}
                style={inputStyle}
                required
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle(true))}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>

            <div className="relative">
              <Lock className={iconWrap} style={{ color: isDark ? rgba(accent, 0.8) : "rgba(249,115,22,0.85)" }} />
              <input
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={inputBase}
                style={inputStyle}
                required
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
                style={{ color: isDark ? rgba(fg, 0.65) : "rgba(100,116,139,0.9)" }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              <div className="mt-2">
                <div
                  className="h-1.5 w-full rounded overflow-hidden"
                  style={{ background: isDark ? rgba(fg, 0.12) : "rgba(148,163,184,0.25)" }}
                >
                  <motion.div
                    className="h-full"
                    style={{ background: rgb(strength.color) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(strength.score / 4) * 100}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  />
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: isDark ? rgba(fg, 0.7) : "rgba(71,85,105,0.9)" }}
                >
                  {strength.label}
                </div>
              </div>
            </div>

            <div className="relative">
              <Lock className={iconWrap} style={{ color: isDark ? rgba(accent, 0.8) : "rgba(249,115,22,0.85)" }} />
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputBase}
                style={inputStyle}
                required
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle(true))}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-3.5 hover:opacity-100 transition"
                style={{ color: isDark ? rgba(fg, 0.65) : "rgba(100,116,139,0.9)" }}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="md:col-span-2 flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                className="rounded"
                style={{ accentColor: isDark ? rgb(accent) : "rgb(249,115,22)" as any }}
                required
              />
              <span
                className="text-sm"
                style={{ color: isDark ? rgba(fg, 0.7) : "rgba(71,85,105,0.9)" }}
              >
                I agree with the{" "}
                <a
                  href={siteConfig?.tNcLink}
                  className="font-semibold"
                  style={{ color: isDark ? rgba(accent, 0.9) : "rgba(249,115,22,0.95)" }}
                  target="_blank"
                  rel="noreferrer"
                >
                  Terms &amp; Conditions
                </a>
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="md:col-span-2 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold disabled:opacity-60"
              style={{
                color: isDark ? rgb(theme?.primaryFg || "0 0 0") : "#fff",
                background: isDark
                  ? `linear-gradient(90deg,
                    ${rgb(theme?.gradientFrom || accent)},
                    ${rgb(theme?.accent || theme?.primary || accent)},
                    ${rgb(theme?.gradientTo || accent)}
                  )`
                  : "linear-gradient(90deg, rgba(249,115,22,0.96), rgba(251,146,60,0.92))",
                boxShadow: isDark
                  ? `0 10px 30px ${rgba(theme?.glow || accent, 0.28)}`
                  : "0 10px 30px rgba(249,115,22,0.20)",
              }}
            >
              <Check size={20} /> Create Account
              {submitting && (
                <motion.span
                  className="inline-block w-4 h-4 rounded-full border-2 border-black/70 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                />
              )}
            </motion.button>
          </form>

          <p
            className="mt-6 text-center text-sm"
            style={{ color: isDark ? rgba(fg, 0.7) : "rgba(100,116,139,0.9)" }}
          >
            Already have an account?{" "}
            <Link
              to="/user/login"
              className="font-semibold"
              style={{ color: isDark ? rgba(accent, 0.9) : "rgba(249,115,22,0.95)" }}
            >
              Log in
            </Link>
          </p>
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default UserSignUp;