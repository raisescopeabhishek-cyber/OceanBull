import React, { useMemo, useState } from "react";
import { User, Mail, Phone, MapPin, Flag, Shield, Cpu, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import UseUserHook from "../../hooks/user/UseUserHook";
import { userApi } from "../../utils/apiClients";
import ModernHeading from "../lib/ModernHeading";
import { FloatingParticles } from "../../utils/FloatingParticles";

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

/* =========================== DECOR (DYNAMIC THEME) ============================ */

const AnimatedGrid = ({ theme }) => {
  const grid = theme?.accent || theme?.ring || "34 197 94";
  const stripe = theme?.info || theme?.gradientFrom || "34 211 238";
  const effects = theme?.effectsEnabled !== false;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.1 }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${rgba(grid, 0.15)} 1px, transparent 1px),
                            linear-gradient(90deg, ${rgba(grid, 0.15)} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black 60%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 60%, transparent 100%)",
        }}
      />
      {effects && (
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          style={{
            background: `repeating-linear-gradient(90deg,
              ${rgba(stripe, 0.06)} 0px,
              ${rgba(stripe, 0.06)} 2px,
              transparent 2px,
              transparent 6px
            )`,
          }}
        />
      )}
    </div>
  );
};

const FloatingOrbs = ({ theme }) => {
  const a = theme?.accent || "16 185 129";
  const b = theme?.info || theme?.gradientFrom || "34 211 238";
  const c = theme?.gradientTo || theme?.primary || "99 102 241";
  const effects = theme?.effectsEnabled !== false;

  if (!effects) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => {
        const color = i % 3 === 0 ? a : i % 3 === 1 ? b : c;
        const alpha = i % 3 === 2 ? 0.22 : 0.25;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{
              width: 140,
              height: 140,
              background: `radial-gradient(circle at center, ${rgba(color, alpha)}, transparent 60%)`,
              left: `${(i * 83) % 100}%`,
              top: `${(i * 47) % 100}%`,
            }}
            animate={{
              y: [0, i % 2 ? -20 : 20, 0],
              x: [0, i % 2 ? 10 : -10, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ duration: 6 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
          />
        );
      })}
    </div>
  );
};

const GlassCard = ({ theme, children, className = "" }) => {
  const cardBg = theme?.card || theme?.surface2 || "18 18 18";
  const border = theme?.border || theme?.inputBorder || "255 255 255";
  const a = theme?.accent || theme?.gradientFrom || "16 185 129";
  const b = theme?.gradientTo || theme?.info || "34 211 238";
  const glow = theme?.glow || a;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`relative rounded-2xl backdrop-blur-xl ${className}`}
      style={{
        border: `1px solid ${rgba(border, 0.14)}`,
        background: `linear-gradient(135deg, ${rgba(cardBg, 0.62)}, ${rgba(cardBg, 0.32)}, ${rgba(cardBg, 0.62)})`,
        boxShadow: `0 0 80px ${rgba(glow, 0.08)}`,
      }}
    >
      <div
        className="absolute inset-px rounded-[calc(1rem-1px)] pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${rgba(a, 0.06)}, ${rgba(b, 0.06)}, ${rgba(a, 0.06)})`,
        }}
      />
      {children}
    </motion.div>
  );
};

/* =========================== MAIN COMPONENT ============================ */

const UserProfile = () => {
  const loggedUser = useSelector((store) => store?.user?.loggedUser) || {};

  // ✅ dynamic theme
  const themeConfig = useSelector((s) => s?.user?.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const bg = theme?.bg || "0 0 0";
  const surface1 = theme?.surface1 || theme?.bg || "0 0 0";
  const accent = theme?.accent || theme?.gradientFrom || "16 185 129";
  const accent2 = theme?.gradientTo || theme?.info || "34 211 238";
  const fg = theme?.fg || "255 255 255";
  const mutedFg = theme?.mutedFg || theme?.fg || "255 255 255";

  const [formData, setFormData] = useState({
    firstName: loggedUser.firstName || "",
    lastName: loggedUser.lastName || "",
    email: loggedUser.email || "",
    mobileNumber: loggedUser.phone || "",
    address: loggedUser.address || "",
    state: loggedUser.state || "",
    zipCode: loggedUser.zipCode || "",
    city: loggedUser.city || "",
    country: loggedUser.country || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const { getUpdateLoggedUser } = UseUserHook();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((d) => ({ ...d, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loggedUser?._id) {
      toast.error("Please sign in to update your profile.");
      return;
    }
    const toastID = toast.loading("Syncing to chain…");
    setIsLoading(true);
    try {
      await userApi.put("/update-user", {
        id: loggedUser._id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        state: formData.state,
        city: formData.city,
        zipCode: formData.zipCode,
      });
      toast.success("Profile updated ✨", { id: toastID });
      getUpdateLoggedUser();
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("Update failed. Try again.", { id: toastID });
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { name: "firstName", label: "First Name", icon: <User size={16} />, required: true },
    { name: "lastName", label: "Last Name", icon: <User size={16} />, required: true },
    { name: "email", label: "E-mail Address", icon: <Mail size={16} />, readOnly: true },
    { name: "mobileNumber", label: "Mobile Number", icon: <Phone size={16} />, readOnly: true },
    { name: "address", label: "Address", icon: <MapPin size={16} /> },
    { name: "state", label: "State", icon: <MapPin size={16} /> },
    { name: "zipCode", label: "Zip Code", icon: <MapPin size={16} /> },
    { name: "city", label: "City", icon: <MapPin size={16} /> },
    { name: "country", label: "Country", icon: <Flag size={16} />, readOnly: true },
  ];

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
      <AnimatedGrid theme={theme} />
      <FloatingParticles />
      <FloatingOrbs theme={theme} />

      {/* soft corner glows */}
      <div className="pointer-events-none absolute inset-0" style={{ opacity: 0.18 }}>
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(60% 70% at 10% 0%, ${rgba(accent, 0.45)}, transparent 60%),
                         radial-gradient(60% 70% at 90% 100%, ${rgba(accent2, 0.35)}, transparent 60%)`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:px-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles style={{ color: rgba(accent, 0.9) }} size={20} />
            <span
              className="uppercase tracking-[0.25em] text-xs font-semibold"
              style={{ color: rgba(accent, 0.75) }}
            >
              account · identity · wallet
            </span>
          </div>

          <motion.div
            className="inline-block"
            initial={{ scale: 0.98, rotateX: 10, opacity: 0 }}
            animate={{ scale: 1, rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <ModernHeading text="⚡ Update Profile" />
          </motion.div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* Left */}
          <GlassCard theme={theme} className="p-6 lg:col-span-1">
            <div className="relative flex flex-col items-center text-center gap-4">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02, rotate: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
              >
                <div
                  className="w-28 h-28 rounded-2xl grid place-items-center"
                  style={{
                    background: `linear-gradient(135deg, ${rgba(accent, 0.2)}, ${rgba(accent2, 0.18)}, ${rgba(accent, 0.2)})`,
                    border: `1px solid ${rgba(theme?.ring || accent, 0.28)}`,
                    boxShadow: `0 0 60px ${rgba(theme?.glow || accent, 0.22)}`,
                  }}
                >
                  <User style={{ color: rgba(accent, 0.85) }} size={40} />
                </div>

                {theme?.effectsEnabled !== false && (
                  <motion.div
                    className="absolute -inset-2 -z-10 rounded-3xl"
                    animate={{
                      boxShadow: [
                        `0 0 0 ${rgba(accent, 0)}`,
                        `0 0 32px ${rgba(accent, 0.35)}`,
                        `0 0 0 ${rgba(accent, 0)}`,
                      ],
                    }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              <div>
                <h3 className="text-xl font-semibold" style={{ color: rgba(fg, 0.95) }}>
                  {formData.firstName || "First"} {formData.lastName || "Last"}
                </h3>
                <p className="text-sm font-mono" style={{ color: rgba(accent, 0.7) }}>
                  {formData.email || "—"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full mt-2">
                <BadgeStat theme={theme} icon={<Cpu size={14} />} label="Status" value="Verified" tint="success" />
                <BadgeStat theme={theme} icon={<Shield size={14} />} label="2FA" value="Enabled" tint="info" />
                <BadgeStat theme={theme} icon={<Flag size={14} />} label="Region" value={formData.country || "—"} tint="accent" />
              </div>

              <NeonDivider theme={theme} />
            </div>
          </GlassCard>

          {/* Right */}
          <GlassCard theme={theme} className="p-6 lg:col-span-2">
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.04 } },
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {fields.map((f) => (
                  <motion.div
                    key={f.name}
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  >
                    {f.readOnly ? (
                      <ReadOnlyField theme={theme} label={f.label} icon={f.icon} value={formData[f.name]} />
                    ) : (
                      <InputField
                        theme={theme}
                        label={f.label}
                        icon={f.icon}
                        value={formData[f.name]}
                        onChange={handleInputChange}
                        name={f.name}
                        required={f.required}
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center pt-2">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className="relative group inline-flex items-center gap-2 px-10 py-3 rounded-full font-semibold"
                  style={{
                    color: rgb(theme?.primaryFg || "0 0 0"),
                    background: `linear-gradient(90deg,
                      ${rgb(theme?.gradientFrom || accent)},
                      ${rgb(theme?.accent || theme?.primary || accent)},
                      ${rgb(theme?.gradientTo || accent2)}
                    )`,
                    boxShadow: `0 10px 40px ${rgba(theme?.glow || accent, 0.28)}`,
                  }}
                >
                  <span className="relative z-10">{isLoading ? "Updating…" : "Update Profile"}</span>

                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background:
                        "radial-gradient(120% 120% at 50% 10%, rgba(255,255,255,0.35), transparent 40%)",
                    }}
                  />
                </motion.button>
              </div>
            </motion.form>

            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 flex justify-center"
                >
                  <motion.div
                    className="h-1 w-52 rounded-full overflow-hidden"
                    style={{ background: rgba(accent, 0.18) }}
                  >
                    <motion.div
                      className="h-full w-1/3"
                      style={{ background: rgb(theme?.accent || accent) }}
                      animate={{ x: ["0%", "200%"] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
};

/* =========================== SUB-COMPONENTS (DYNAMIC) ============================ */

const LabelCaps = ({ theme, children, required }) => {
  const accent = theme?.accent || theme?.gradientFrom || "16 185 129";
  return (
    <div className="flex items-center gap-2 mb-1">
      <span
        className="text-[11px] tracking-[0.25em] uppercase font-semibold"
        style={{ color: rgba(accent, 0.65) }}
      >
        {children}
      </span>
      {required ? <span style={{ color: rgba(accent, 0.8) }}>*</span> : null}
    </div>
  );
};

const InputField = ({ theme, label, icon, value, onChange, name, required = false }) => {
  const fg = theme?.fg || "255 255 255";
  const accent = theme?.accent || theme?.ring || "16 185 129";
  const inputBg = theme?.input || theme?.surface2 || theme?.card || "18 18 18";
  const border = theme?.inputBorder || theme?.border || "255 255 255";
  const effects = theme?.effectsEnabled !== false;

  return (
    <div className="relative">
      <LabelCaps theme={theme} required={required}>
        {label}
      </LabelCaps>

      <div className="relative">
        <div
          className="absolute inset-y-0 left-3 flex items-center pointer-events-none"
          style={{ color: rgba(accent, 0.75) }}
        >
          {icon}
        </div>

        <motion.input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          whileFocus={{ scale: 1.01 }}
          className="w-full pl-10 pr-3 py-3 rounded-xl outline-none transition"
          style={{
            color: rgba(fg, 0.9),
            background: `linear-gradient(135deg, ${rgba(inputBg, 0.72)}, ${rgba(inputBg, 0.35)})`,
            border: `1px solid ${rgba(border, 0.16)}`,
            boxShadow: `0 0 0 0 ${rgba(accent, 0)}`,
          }}
        />

        {effects && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-xl"
            initial={false}
            animate={{
              boxShadow: [
                `0 0 0px ${rgba(accent, 0)}`,
                `0 0 16px ${rgba(accent, 0.22)}`,
                `0 0 0px ${rgba(accent, 0)}`,
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  );
};

const ReadOnlyField = ({ theme, label, icon, value }) => {
  const fg = theme?.fg || "255 255 255";
  const accent = theme?.accent || theme?.ring || "16 185 129";
  const inputBg = theme?.input || theme?.surface2 || theme?.card || "18 18 18";
  const border = theme?.inputBorder || theme?.border || "255 255 255";

  return (
    <div className="relative">
      <LabelCaps theme={theme}>{label}</LabelCaps>

      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center" style={{ color: rgba(accent, 0.55) }}>
          {icon}
        </div>

        <input
          type="text"
          value={value ?? ""}
          readOnly
          className="w-full pl-10 pr-3 py-3 rounded-xl cursor-not-allowed"
          style={{
            color: rgba(fg, 0.6),
            background: `linear-gradient(135deg, ${rgba(inputBg, 0.62)}, ${rgba(inputBg, 0.25)})`,
            border: `1px solid ${rgba(border, 0.1)}`,
          }}
        />
      </div>
    </div>
  );
};

const BadgeStat = ({ theme, icon, label, value, tint = "accent" }) => {
  const fg = theme?.fg || "255 255 255";
  const border = theme?.border || theme?.inputBorder || "255 255 255";

  const colorMap = {
    accent: theme?.accent || theme?.gradientFrom || "16 185 129",
    success: theme?.success || "34 197 94",
    info: theme?.info || theme?.gradientTo || "59 130 246",
    warning: theme?.warning || "234 179 8",
    danger: theme?.danger || "244 63 94",
  };

  const c = colorMap[tint] || colorMap.accent;

  return (
    <div
      className="rounded-xl px-3 py-2 text-center border"
      style={{
        borderColor: rgba(border, 0.14),
        background: `linear-gradient(135deg, ${rgba(c, 0.16)}, ${rgba(c, 0.08)})`,
        color: rgba(fg, 0.9),
      }}
    >
      <div className="flex items-center gap-1 justify-center text-xs opacity-80" style={{ color: rgba(c, 0.85) }}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-semibold text-sm" style={{ color: rgba(fg, 0.92) }}>
        {value}
      </div>
    </div>
  );
};

const NeonDivider = ({ theme }) => {
  const c = theme?.accent || theme?.ring || "16 185 129";
  const effects = theme?.effectsEnabled !== false;

  return (
    <div className="relative w-full my-4">
      <div
        className="h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${rgba(c, 0.5)}, transparent)`,
        }}
      />
      {effects && (
        <motion.div
          className="absolute -top-[3px] left-0 h-[7px] w-16 rounded-full blur-md"
          style={{ background: rgba(c, 0.6) }}
          animate={{ left: ["0%", "100%"] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
};

export default UserProfile;
