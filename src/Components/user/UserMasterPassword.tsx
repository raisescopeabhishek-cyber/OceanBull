import { useState, useMemo } from "react";
import { Lock, CheckCircle, AlertCircle, Sparkles, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { backendApi,  userApi } from "../../utils/apiClients";
import ModernHeading from "../lib/ModernHeading";
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

/* =========================== DECOR / THEME (DYNAMIC) ============================ */

const AnimatedGrid = ({ theme }: { theme: any }) => {
  const grid = theme?.accent || theme?.ring || "34 197 94";
  const stripe = theme?.info || theme?.gradientFrom || "0 255 200";
  const effects = theme?.effectsEnabled !== false;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.1,
          backgroundImage: `linear-gradient(${rgba(grid, 0.15)} 1px, transparent 1px),
                            linear-gradient(90deg, ${rgba(grid, 0.15)} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse at center, black 60%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 60%, transparent 100%)",
        }}
      />
      {effects && (
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          style={{
            background: `repeating-linear-gradient(90deg, ${rgba(
              stripe,
              0.06
            )} 0px, ${rgba(stripe, 0.06)} 2px, transparent 2px, transparent 6px)`,
          }}
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
      {Array.from({ length: 12 }).map((_, i) => {
        const color = i % 3 === 0 ? a : i % 3 === 1 ? b : c;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{
              width: 140,
              height: 140,
              background: `radial-gradient(circle at center, ${rgba(
                color,
                0.25
              )}, transparent 60%)`,
              left: `${(i * 83) % 100}%`,
              top: `${(i * 47) % 100}%`,
            }}
            animate={{
              y: [0, i % 2 ? -20 : 20, 0],
              x: [0, i % 2 ? 10 : -10, 0],
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
      className={`relative rounded-2xl backdrop-blur-xl ${className}`}
      style={{
        border: `1px solid ${rgba(border, 0.14)}`,
        background: `linear-gradient(135deg, ${rgba(card, 0.66)}, ${rgba(
          card,
          0.32
        )}, ${rgba(card, 0.66)})`,
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

const LabelCaps = ({
  children,
  required,
  theme,
}: {
  children: any;
  required?: boolean;
  theme: any;
}) => (
  <div className="flex items-center gap-2 mb-1">
    <span
      className="text-[11px] tracking-[0.25em] uppercase"
      style={{ color: rgba(theme?.accent || "59 130 246", 0.7) }}
    >
      {children}
    </span>
    {required ? (
      <span style={{ color: rgba(theme?.accent || "59 130 246", 0.85) }}>*</span>
    ) : null}
  </div>
);

const InputField = ({
  theme,
  label,
  icon,
  value,
  onChange,
  name,
  type = "text",
  required = false,
  error,
}: any) => {
  const bg = theme?.bg || "0 0 0";
  const fg = theme?.fg || "255 255 255";
  const border = theme?.border || theme?.inputBorder || "255 255 255";
  const accent = theme?.accent || "59 130 246";
  const danger = theme?.danger || "239 68 68";

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
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          whileFocus={{ scale: 1.01 }}
          className="w-full pl-10 pr-3 py-3 rounded-xl outline-none transition"
          style={{
            color: rgba(fg, 0.9),
            background: `linear-gradient(135deg,
              ${rgba(theme?.input || theme?.surface2 || "18 18 18", 0.62)},
              ${rgba(theme?.surface1 || bg, 0.22)}
            )`,
            border: `1px solid ${rgba(border, error ? 0.35 : 0.14)}`,
            boxShadow: error
              ? `0 0 0 2px ${rgba(danger, 0.22)}`
              : `0 0 0 0px transparent`,
          }}
          required={required}
        />

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
    </div>
  );
};

const BadgeStat = ({ theme, icon, label, value }: any) => {
  const accent = theme?.accent || "59 130 246";
  const border = theme?.border || theme?.inputBorder || "255 255 255";
  return (
    <div
      className="rounded-xl px-3 py-2 text-center"
      style={{
        border: `1px solid ${rgba(border, 0.16)}`,
        background: `linear-gradient(135deg, ${rgba(accent, 0.14)}, ${rgba(
          accent,
          0.05
        )})`,
        color: rgba(theme?.fg || "255 255 255", 0.86),
      }}
    >
      <div className="flex items-center gap-1 justify-center text-xs opacity-80">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-semibold text-sm">{value}</div>
    </div>
  );
};

const NeonDivider = ({ theme }: any) => {
  const accent = theme?.accent || "59 130 246";
  const effects = theme?.effectsEnabled !== false;

  return (
    <div className="relative w-full my-4">
      <div
        className="h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${rgba(
            accent,
            0.5
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

/* =========================== MAIN COMPONENT ============================ */

const UserMasterPassword = () => {
  // ✅ dynamic theme
  const themeConfig = useSelector((s: any) => s.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);

  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const loggedUser = useSelector((store: any) => store.user.loggedUser);

  const [currentAccount, setCurrentAccount] = useState(
    loggedUser?.accounts?.[0] || "000"
  );

  const handleChange = (e: any) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setError("");
  };

  const validatePassword = (password: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?]).{8,}$/;
    return passwordRegex.test(password);
  };

  const customContent = `<!DOCTYPE html>
    <html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Master Password Updated</title></head>
    <body>
      <p>Dear ${loggedUser?.firstName + " " + loggedUser?.lastName},</p>
      <p>Your master password has been updated.</p>
      <p>Account No: ${currentAccount.accountNumber}</p>
      <p>Old password: ${currentAccount.masterPassword}</p>
      <p>New password: ${passwords.confirm}</p>
    </body></html>`;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const toastId = toast.loading("Please wait...");
    setIsLoading(true);

    if (!validatePassword(passwords.new)) {
      setError(
        "Password must be at least 8 characters long, including one uppercase letter, one lowercase letter, one number, and one special symbol."
      );
      toast.error("Invalid password format", { id: toastId });
      setIsLoading(false);
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match. Please try again.");
      toast.error("Passwords do not match", { id: toastId });
      setIsLoading(false);
      return;
    }

    try {
      const res = await userApi.get(
        `/server-master-password-change&Account=${currentAccount.accountNumber}&password=${passwords.confirm}`
      );

      await backendApi.post(`/update-master-password`, {
        userId: loggedUser._id,
        accountId: currentAccount._id,
        newPassword: passwords.confirm,
      });

      await backendApi.post(`/custom-mail`, {
        email: loggedUser.email,
        content: customContent,
        subject: "Master password changed",
      });

      toast.success(res.data.data.MESSAGE, { id: toastId });
      navigate("/user/dashboard");
    } catch (err) {
      toast.error("An error occurred. Please try again.", { id: toastId });
    } finally {
      setIsLoading(false);
    }

    setPasswords({ new: "", confirm: "" });
    setError("");
  };

  const fields = [
    { name: "new", label: "New Master Password" },
    { name: "confirm", label: "Confirm Master Password" },
  ];

  // page tokens
  const bg = theme?.bg || "0 0 0";
  const surface1 = theme?.surface1 || theme?.bg || "0 0 0";
  const fg = theme?.fg || "255 255 255";
  const accent = theme?.accent || theme?.gradientFrom || "59 130 246";
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
      <AnimatedGrid theme={theme} />
      <FloatingParticles />
      <FloatingOrbs theme={theme} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 md:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles style={{ color: rgba(accent, 0.9) }} size={20} />
              <span
                className="uppercase tracking-[0.25em] text-xs font-semibold"
                style={{ color: rgba(accent, 0.7) }}
              >
                security · vault · control
              </span>
            </div>

            <motion.div
              className="inline-block"
              initial={{ scale: 0.98, rotateX: 10, opacity: 0 }}
              animate={{ scale: 1, rotateX: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <ModernHeading text="Change Master Password" />
            </motion.div>
          </div>

          {/* Account Select */}
          <div className="md:w-64">
            {loggedUser?.accounts?.length > 0 && (
              <div>
                <LabelCaps theme={theme} required>
                  Select Account
                </LabelCaps>

                <div className="relative">
                  <select
                    onChange={(e) => {
                      const selectedValue = loggedUser.accounts?.find(
                        (value: any) => value.accountNumber === e.target.value
                      );
                      setCurrentAccount(selectedValue);
                    }}
                    id="accountNumber"
                    name="accountNumber"
                    className="w-full py-2.5 text-sm rounded-xl outline-none"
                    style={{
                      color: rgba(fg, 0.9),
                      background: `linear-gradient(135deg,
                        ${rgba(theme?.input || theme?.surface2 || "18 18 18", 0.62)},
                        ${rgba(theme?.surface1 || bg, 0.22)}
                      )`,
                      border: `1px solid ${rgba(border, 0.16)}`,
                    }}
                  >
                    <option disabled value="" style={{ background: "#0b1220", color: "#64748b" }}>
                      Select Account
                    </option>

                    {loggedUser.accounts?.map((value: any, index: number) => (
                      <option
                        key={index}
                        value={value.accountNumber}
                        style={{ background: "#0b1220", color: "#fff" }}
                      >
                        {value.accountNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Layout: Info card + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* Left: Account / security snapshot */}
          <GlassCard theme={theme} className="p-6 lg:col-span-1">
            <div className="relative flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl grid place-items-center"
                  style={{
                    border: `1px solid ${rgba(border, 0.16)}`,
                    background: `linear-gradient(135deg, ${rgba(accent, 0.16)}, ${rgba(
                      theme?.gradientTo || accent,
                      0.08
                    )})`,
                    boxShadow: `0 0 40px ${rgba(theme?.glow || accent, 0.22)}`,
                  }}
                >
                  <Lock style={{ color: rgba(accent, 0.9) }} size={22} />
                </div>

                <div>
                  <p
                    className="text-[11px] uppercase tracking-[0.25em]"
                    style={{ color: rgba(accent, 0.65) }}
                  >
                    active account
                  </p>
                  <p className="text-sm font-mono" style={{ color: rgba(fg, 0.9) }}>
                    {currentAccount?.accountNumber || "—"}
                  </p>
                </div>
              </div>

              <NeonDivider theme={theme} />

              <div className="space-y-2 text-sm">
                <p style={{ color: rgba(fg, 0.75) }}>
                  You’re updating the{" "}
                  <span style={{ color: rgba(accent, 0.92), fontWeight: 700 }}>
                    master password
                  </span>{" "}
                  linked to this trading account.
                </p>
                <p style={{ color: rgba(fg, 0.6) }} className="text-xs">
                  Keep this password private. It gives full control over trading operations.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-3">
                <BadgeStat theme={theme} icon={<Shield size={14} />} label="Protection" value="High" />
                <BadgeStat theme={theme} icon={<CheckCircle size={14} />} label="Status" value="Active" />
                <BadgeStat theme={theme} icon={<Lock size={14} />} label="Mode" value="Master" />
              </div>
            </div>
          </GlassCard>

          {/* Right: Form */}
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
              <div className="grid grid-cols-1 gap-5">
                {fields.map((field) => (
                  <motion.div
                    key={field.name}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <InputField
                      theme={theme}
                      label={field.label}
                      icon={<Lock size={16} />}
                      type="password"
                      name={field.name}
                      value={(passwords as any)[field.name]}
                      onChange={handleChange}
                      required
                      error={!!error}
                    />
                  </motion.div>
                ))}
              </div>

              {error && (
                <motion.div
                  className="flex items-center mt-1 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ color: rgba(danger, 0.95) }}
                >
                  <AlertCircle className="mr-2" size={18} />
                  {error}
                </motion.div>
              )}

              <div className="flex flex-col-reverse gap-4 sm:flex-row justify-between items-center pt-2">
                <Link
                  to={"/user/dashboard"}
                  className="w-full text-center sm:w-auto px-8 py-2.5 rounded-full transition"
                  style={{
                    color: rgba(fg, 0.85),
                    border: `1px solid ${rgba(danger, 0.35)}`,
                    background: rgba(danger, 0.10),
                  }}
                >
                  Cancel
                </Link>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isLoading}
                  className="relative group inline-flex items-center gap-2 px-10 py-2.5 rounded-full font-semibold disabled:opacity-70"
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
                  <span className="relative z-10 flex items-center gap-2">
                    <CheckCircle size={18} />
                    {isLoading ? "Updating…" : "Change Password"}
                  </span>

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

            {/* Loading shimmer */}
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
                      style={{ background: rgb(accent) }}
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

export default UserMasterPassword;
