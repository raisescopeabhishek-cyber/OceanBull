import { useState, useMemo } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  AlertCircle,
  Shield,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ModernHeading from "../lib/ModernHeading";
import { backendApi } from "../../utils/apiClients";
import UseUserHook from "../../hooks/user/UseUserHook";
import { FloatingParticles } from "../../utils/FloatingParticles";

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

/* ============================== DECOR (DYNAMIC) ============================== */

const AnimatedGrid = ({ theme }: { theme: any }) => {
  const grid = theme?.accent || theme?.ring || "34 197 94";
  const stripe = theme?.info || theme?.gradientFrom || "59 130 246";
  const effects = theme?.effectsEnabled !== false;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.1,
          backgroundImage: `linear-gradient(${rgba(grid, 0.2)} 1px, transparent 1px),
                            linear-gradient(90deg, ${rgba(grid, 0.2)} 1px, transparent 1px)`,
          backgroundSize: "42px 42px",
          maskImage: "radial-gradient(ellipse at center, black 55%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 55%, transparent 85%)",
        }}
      />
      {effects && (
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: 0.2,
            background: `repeating-linear-gradient(90deg, ${rgba(stripe, 0.08)} 0 2px, transparent 2px 8px)`,
          }}
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
};

const FloatingOrbs = ({ theme }: { theme: any }) => {
  const a = theme?.accent || "16 185 129";
  const b = theme?.info || theme?.gradientFrom || "34 211 238";
  const c = theme?.gradientTo || theme?.primary || "99 102 241";
  const effects = theme?.effectsEnabled !== false;

  if (!effects) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 10 }).map((_, i) => {
        const color = i % 3 === 0 ? a : i % 3 === 1 ? b : c;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{
              width: 140,
              height: 140,
              left: `${(i * 97) % 100}%`,
              top: `${(i * 53) % 100}%`,
              background: `radial-gradient(circle at center, ${rgba(
                color,
                0.25
              )}, transparent 60%)`,
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
        );
      })}
    </div>
  );
};

const GlassCard = ({
  theme,
  children,
  className = "",
}: {
  theme: any;
  children: any;
  className?: string;
}) => {
  const card = theme?.card || theme?.surface2 || "18 18 18";
  const border = theme?.border || theme?.inputBorder || "255 255 255";
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
          0.34
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

/* ============================== COMPONENT ================================ */

const UserChnagePassword = () => {
  // ✅ dynamic theme
  const themeConfig = useSelector((s: any) => s.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [error, setError] = useState("");

  const loggedUser = useSelector((store: any) => store.user.loggedUser);
  const navigate = useNavigate();
  const { getUpdateLoggedUser } = UseUserHook();

  const handleChange = (e: any) => {
    setPasswords((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((s) => ({ ...s, [field]: !s[field] }));
  };

  const currentDateTime = new Date();
  const formattedDateTime =
    currentDateTime.toLocaleDateString("en-GB") +
    ", " +
    currentDateTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  /* NOTE: plaintext passwords in email is risky. Keeping as-is per your API. */
  const customContent = `<!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Updated - ${import.meta.env.VITE_WEBSITE_NAME || "Forex"}</title>
      <style>
        body, html { margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; padding: 5px; background-color: #ffffff; }
        .header { background-color: #19422df2; color: #ffffff; padding: 20px 15px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 22px; letter-spacing: 1px; }
        .content { padding: 10px 20px; }
        .footer { background-color: #19422df2; color: #ffffff; text-align: center; padding: 5px 10px; font-size: 12px; border-radius: 0 0 10px 10px; }
        .withdrawal-details { background-color: #f8f8f8; border-left: 4px solid #2d6a4f; padding: 15px; margin: 20px 0; }
        .withdrawal-details p { margin: 5px 0; }
        .highlight { font-weight: bold; color: #0a2342; }
        .risk-warning { color: #C70039; padding: 5px; font-size: 12px; line-height: 1.4; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>Account Password Updated</h1></div>
        <div class="content">
          <p>Dear ${loggedUser?.firstName + " " + loggedUser?.lastName},</p>
          <p>Your account password has been successfully updated.</p>
          <div class="withdrawal-details">
            <p>New password: <span class="highlight">${passwords.confirm}</span></p>
            <p>Updated Date: <span class="highlight">${formattedDateTime}</span></p>
          </div>
          <p>Best regards,<br/>The ${import.meta.env.VITE_WEBSITE_NAME || "Forex"} Team</p>
          <hr/>
          <div class="risk-warning">
            <strong>Risk Warning:</strong> Trading CFDs carries high risk and may result in losses beyond your initial investment.
          </div>
        </div>
        <div class="footer">
          <p>© 2025 ${import.meta.env.VITE_WEBSITE_NAME || ""}. All Rights Reserved</p>
        </div>
      </div>
    </body>
    </html>`;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const toastId = toast.loading("Please wait…");

    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match. Please try again.");
      toast.error("Passwords do not match", { id: toastId });
      return;
    }

    try {
      const res = await backendApi.post(`/update-password`, {
        userId: loggedUser._id,
        currentPassword: passwords.current,
        newPassword: passwords.confirm,
      });

      await backendApi.post(`/custom-mail`, {
        email: loggedUser.email,
        content: customContent,
        subject: "Account Password Changed",
      });

      toast.success(res?.data?.msg || "Password updated", { id: toastId });
      navigate("/user/dashboard");
      getUpdateLoggedUser();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed", { id: toastId });
    }
  };

  /* ------------------------- Password strength ------------------------- */
  const strength = useMemo(() => {
    const v = passwords.new;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;

    const labels = ["Very Weak", "Weak", "Good", "Strong", "Excellent"];
    const c0 = theme?.danger || "239 68 68";
    const c1 = theme?.warning || "245 158 11";
    const c2 = theme?.success || "34 197 94";
    const c3 = theme?.accent || "16 185 129";
    const c4 = theme?.info || theme?.gradientTo || "6 182 212";
    const colors = [rgb(c0), rgb(c1), rgb(c2), rgb(c3), rgb(c4)];

    return { score, label: labels[score], color: colors[score] };
  }, [passwords.new, theme]);

  const rule = (ok: boolean) =>
    ok ? "text-white" : "text-white/50";

  // page tokens
  const bg = theme?.bg || "0 0 0";
  const surface1 = theme?.surface1 || theme?.bg || "0 0 0";
  const fg = theme?.fg || "255 255 255";
  const accent = theme?.accent || theme?.gradientFrom || "59 130 246";
  const ring = theme?.ring || theme?.accent || "59 130 246";
  const border = theme?.border || theme?.inputBorder || "255 255 255";
  const danger = theme?.danger || "239 68 68";

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: `linear-gradient(135deg, ${rgb(bg)}, ${rgb(surface1)}, ${rgb(bg)})`,
        color: rgba(fg, 0.92),
      }}
    >
      <FloatingParticles />
      <AnimatedGrid theme={theme} />
      <FloatingOrbs theme={theme} />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10 md:px-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} style={{ color: rgba(accent, 0.9) }} />
            <span
              className="uppercase tracking-[0.25em] text-xs font-semibold"
              style={{ color: rgba(accent, 0.7) }}
            >
              security · identity · wallet
            </span>
          </div>

          <motion.div
            initial={{ scale: 0.98, rotateX: 10, opacity: 0 }}
            animate={{ scale: 1, rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block"
          >
            <ModernHeading text="⚡ Change Password" />
          </motion.div>
        </div>

        {/* Card */}
        <GlassCard theme={theme} className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {(["current", "new", "confirm"] as const).map((field) => (
              <motion.div
                key={field}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor={field}
                    className="text-[11px] tracking-[0.25em] uppercase"
                    style={{ color: rgba(accent, 0.72) }}
                  >
                    {field} password
                  </label>

                  {field === "new" && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: rgba(fg, 0.6) }}>
                      <Shield size={14} style={{ color: rgba(accent, 0.8) }} />
                      <span className="font-mono">Strength:</span>
                      <span style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                </div>

                <div className="relative group">
                  <div
                    className="absolute inset-y-0 left-3 flex items-center pointer-events-none"
                    style={{ color: rgba(accent, 0.75) }}
                  >
                    <Lock size={18} />
                  </div>

                  <motion.input
                    type={showPasswords[field] ? "text" : "password"}
                    id={field}
                    name={field}
                    value={passwords[field]}
                    onChange={handleChange}
                    whileFocus={{ scale: 1.01 }}
                    className="w-full pl-10 pr-10 py-3 rounded-xl outline-none transition"
                    style={{
                      color: rgba(fg, 0.9),
                      background: `linear-gradient(135deg,
                        ${rgba(theme?.input || theme?.surface2 || "18 18 18", 0.55)},
                        ${rgba(theme?.surface1 || bg, 0.22)}
                      )`,
                      border: `1px solid ${rgba(border, 0.14)}`,
                      boxShadow: error ? `0 0 0 2px ${rgba(danger, 0.22)}` : "none",
                    }}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(field)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                    style={{ color: rgba(accent, 0.72) }}
                    aria-label="Toggle password visibility"
                  >
                    {showPasswords[field] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>

                  <motion.div
                    className="pointer-events-none absolute inset-0 rounded-xl"
                    initial={false}
                    animate={{
                      boxShadow: [
                        `0 0 0px ${rgba(accent, 0)}`,
                        `0 0 16px ${rgba(accent, 0.14)}`,
                        `0 0 0px ${rgba(accent, 0)}`,
                      ],
                    }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                  />
                </div>

                {/* Strength bar only for 'new' */}
                {field === "new" && (
                  <div className="mt-3">
                    <div
                      className="h-2 w-full rounded-full overflow-hidden"
                      style={{ background: rgba(fg, 0.1) }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg,
                            ${rgb(theme?.success || "34 197 94")},
                            ${rgb(theme?.info || theme?.gradientTo || "6 182 212")}
                          )`,
                        }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${(strength.score / 4) * 100}%` }}
                        transition={{ type: "spring", stiffness: 120, damping: 18 }}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                      <span className={rule(passwords.new.length >= 8)}>• 8+ chars</span>
                      <span className={rule(/[A-Z]/.test(passwords.new))}>• Uppercase</span>
                      <span className={rule(/[0-9]/.test(passwords.new))}>• Number</span>
                      <span className={rule(/[^A-Za-z0-9]/.test(passwords.new))}>• Symbol</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            <AnimatePresence>
              {error && (
                <motion.div
                  className="flex items-center mt-1"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: rgba(danger, 0.95) }}
                >
                  <AlertCircle className="mr-2" size={18} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col-reverse gap-4 sm:flex-row justify-between items-center mt-8">
              <Link
                to={"/user/dashboard"}
                className="w-full sm:w-auto text-center py-3 px-6 rounded-full transition"
                style={{
                  color: rgba(fg, 0.8),
                  border: `1px solid ${rgba(border, 0.14)}`,
                  background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.2),
                }}
              >
                Cancel
              </Link>

              <motion.button
                type="submit"
                className="w-full sm:w-auto relative inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold"
                initial={{ scale: 0.99 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  color: rgb(theme?.primaryFg || "0 0 0"),
                  background: `linear-gradient(90deg,
                    ${rgb(theme?.gradientFrom || accent)},
                    ${rgb(theme?.accent || theme?.primary || accent)},
                    ${rgb(theme?.gradientTo || accent)}
                  )`,
                  boxShadow: `0 10px 40px ${rgba(theme?.glow || accent, 0.28)}`,
                }}
              >
                <CheckCircle size={18} />
                Update Password
                <motion.span
                  className="absolute inset-0 rounded-full opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background:
                      "radial-gradient(120% 120% at 50% 10%, rgba(255,255,255,0.35), transparent 40%)",
                  }}
                />
              </motion.button>
            </div>
          </form>
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default UserChnagePassword;
