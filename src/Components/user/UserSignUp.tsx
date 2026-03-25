import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
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
} from "lucide-react";
import { getData } from "country-list";
import { useSelector } from "react-redux";
import { backendApi } from "../../utils/apiClients";
import ModernHeading from "../lib/ModernHeading";

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

const AnimatedGrid = ({ theme }: { theme: any }) => {
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

const FloatingOrbs = ({ theme }: { theme: any }) => {
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
                0.22
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
  className = "",
  children,
}: {
  theme: any;
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

const NeonDivider = ({ theme }: { theme: any }) => {
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

/* ---------- Password strength helper (dynamic colors) ---------- */
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
  // ✅ dynamic theme
  const themeConfig = useSelector((state: any) => state.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

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

  // ----- handle optional :id safely -----
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

      console.log("path->" , path);
      
      
      const res = await backendApi.post(path, formData);

      console.log("res->" , res);

      

      toast.success(res.data.message, { id: toastId });


      navigate(res.data.redirectTo);
    } catch (err: any) {

      
      let message = "Signup failed";
       if (err.message) message = err.message
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

  // tokens
  const bg = theme?.bg || "0 0 0";
  const surface1 = theme?.surface1 || theme?.bg || "0 0 0";
  const fg = theme?.fg || "255 255 255";
  const accent = theme?.accent || theme?.gradientFrom || "59 130 246";
  const ring = theme?.ring || theme?.accent || accent;
  const border = theme?.border || theme?.inputBorder || "255 255 255";
  const inputBg = theme?.input || theme?.surface2 || "18 18 18";

  // PhoneInput dynamic CSS
  const phoneInputCustomStyles = useMemo(() => {
    return `
      .PhoneInput { position: relative; width: 100%; }
      .PhoneInputInput {
        background: ${rgba(inputBg, 0.55)} !important;
        border: 1px solid ${rgba(border, 0.14)} !important;
        color: ${rgba(fg, 0.92)} !important;
        padding: 0.75rem 0.9rem 0.75rem 3rem !important;
        border-radius: 0.5rem !important;
        outline: none !important;
      }
      .PhoneInputInput::placeholder { color: ${rgba(fg, 0.45)} !important; }
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
      .PhoneInputCountrySelect { background-color: #0b1220 !important; color: #fff !important; }
    `;
  }, [inputBg, border, fg, ring]);

  const inputBase =
    "w-full pl-10 pr-12 py-3 rounded-lg outline-none transition";
  const iconWrap = "absolute top-3.5 left-3";

  const inputStyle: React.CSSProperties = {
    color: rgba(fg, 0.92),
    background: `linear-gradient(135deg, ${rgba(inputBg, 0.55)}, ${rgba(
      surface1,
      0.22
    )})`,
    border: `1px solid ${rgba(border, 0.14)}`,
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
        background: `linear-gradient(135deg, ${rgb(bg)}, ${rgb(surface1)}, ${rgb(bg)})`,
        color: rgba(fg, 0.92),
      }}
    >
      <style>{phoneInputCustomStyles}</style>

      {/* Background */}
      <AnimatedGrid theme={theme} />
      <FloatingOrbs theme={theme} />

      {/* Left hero */}
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
          style={{ color: rgba(accent, 0.8) }}
        >
          <Sparkles size={16} /> secure · fast · modern
        </div>

        <ModernHeading text="Join Our Platform" />

        <p className="mt-3 text-center max-w-md" style={{ color: rgba(fg, 0.72) }}>
          Start your journey with neon-speed onboarding and a sleek trading dashboard.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 text-sm" style={{ color: rgba(fg, 0.65) }}>
          <Shield className="w-4 h-4" /> Email verification • Encrypted transit • Session hardening
        </div>

        <NeonDivider theme={theme} />
      </div>

      {/* Right form */}
      <div className="flex justify-center items-center w-full lg:w-1/2 p-6 relative z-10">
        <GlassCard theme={theme} className="w-full max-w-3xl p-6 md:p-8">
          {/* Steps chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
            <span
              className="px-3 py-1 rounded-full"
              style={{
                background: rgba(theme?.accent || accent, 0.12),
                border: `1px solid ${rgba(theme?.accent || accent, 0.22)}`,
                color: rgba(theme?.accent || accent, 0.9),
              }}
            >
              1 · Personal
            </span>
            <span
              className="px-3 py-1 rounded-full"
              style={{
                background: rgba(theme?.info || theme?.gradientTo || accent, 0.12),
                border: `1px solid ${rgba(theme?.info || theme?.gradientTo || accent, 0.22)}`,
                color: rgba(theme?.info || theme?.gradientTo || accent, 0.9),
              }}
            >
              2 · Contact
            </span>
            <span
              className="px-3 py-1 rounded-full"
              style={{
                background: rgba(theme?.gradientTo || theme?.primary || accent, 0.12),
                border: `1px solid ${rgba(theme?.gradientTo || theme?.primary || accent, 0.22)}`,
                color: rgba(theme?.gradientTo || theme?.primary || accent, 0.9),
              }}
            >
              3 · Security
            </span>
          </div>

          <div className="mb-4">
            <ModernHeading text="Create an Account" />
            <p style={{ color: rgba(fg, 0.72) }} className="mt-1">
              It only takes a minute. We’ll email a verification link.
            </p>
            <NeonDivider theme={theme} />
          </div>

          {/* Error banner */}
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
                  color: rgba(fg, 0.92),
                }}
              >
                {error.message}
              </motion.div>
            )}
          </AnimatePresence>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
          >
            {/* First / Last */}
            <div className="relative">
              <UserIcon className={iconWrap} style={{ color: rgba(accent, 0.8) }} />
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
              <UserIcon className={iconWrap} style={{ color: rgba(accent, 0.8) }} />
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

            {/* Email / Phone */}
            <div className="relative">
              <Mail className={iconWrap} style={{ color: rgba(accent, 0.8) }} />
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

            {/* Country / Address */}
            <div className="relative">
              <Globe className={iconWrap} style={{ color: rgba(accent, 0.8) }} />
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
                  <option key={c.code} value={c.name} style={{ background: "#0b1220", color: "#fff" }}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <MapPin className={iconWrap} style={{ color: rgba(accent, 0.8) }} />
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

            {/* State / City */}
            <div className="relative">
              <MapPin className={iconWrap} style={{ color: rgba(accent, 0.8) }} />
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
              <MapPin className={iconWrap} style={{ color: rgba(accent, 0.8) }} />
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

            {/* Zip */}
            <div className="relative">
              <MapPin className={iconWrap} style={{ color: rgba(accent, 0.8) }} />
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

            {/* Password */}
            <div className="relative">
              <Lock className={iconWrap} style={{ color: rgba(accent, 0.8) }} />
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
                style={{ color: rgba(fg, 0.65) }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              {/* Strength meter */}
              <div className="mt-2">
                <div
                  className="h-1.5 w-full rounded overflow-hidden"
                  style={{ background: rgba(fg, 0.12) }}
                >
                  <motion.div
                    className="h-full"
                    style={{ background: rgb(strength.color) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(strength.score / 4) * 100}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  />
                </div>
                <div className="text-xs mt-1" style={{ color: rgba(fg, 0.7) }}>
                  {strength.label}
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className={iconWrap} style={{ color: rgba(accent, 0.8) }} />
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
                style={{ color: rgba(fg, 0.65) }}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Terms */}
            <div className="md:col-span-2 flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                className="rounded"
                style={{ accentColor: rgb(accent) as any }}
                required
              />
              <span className="text-sm" style={{ color: rgba(fg, 0.7) }}>
                I agree with the{" "}
                <a
                  href={siteConfig?.tNcLink}
                  className="font-semibold"
                  style={{ color: rgba(accent, 0.9) }}
                  target="_blank"
                  rel="noreferrer"
                >
                  Terms &amp; Conditions
                </a>
              </span>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="md:col-span-2 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold disabled:opacity-60"
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

          <p className="mt-6 text-center text-sm" style={{ color: rgba(fg, 0.7) }}>
            Already have an account?{" "}
            <Link
              to="/user/login"
              className="font-semibold"
              style={{ color: rgba(accent, 0.9) }}
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
