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
  Check,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowRight,
  Phone,
  BarChart3,
  MessageSquare,
  CalendarDays,
  LayoutDashboard,
  CircleDot,
  Zap,
  Globe,
  MapPin,
  Building2,
} from "lucide-react";
import { getData } from "country-list";
import { useDispatch, useSelector } from "react-redux";
import { backendApi } from "../../utils/apiClients";
import { toggleUserTheme } from "../../redux/userThemeSlice";

/* -------------------- theme helpers -------------------- */
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

/* -------------------- password strength -------------------- */
function getPasswordStrength(pw = "", theme: any) {
  let score = 0;

  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const clamp = Math.min(score, 4);

  const labels = ["Weak", "Basic", "Good", "Strong", "Excellent"];
  const colors = [
    theme?.danger || "239 68 68",
    theme?.warning || "245 158 11",
    theme?.info || "234 179 8",
    theme?.success || "34 197 94",
    theme?.accent || theme?.gradientFrom || "59 130 246",
  ];

  return {
    score: clamp,
    label: labels[clamp],
    color: colors[clamp],
  };
}

/* -------------------- background -------------------- */
const CRMBackground = ({ theme, isDark }: { theme: any; isDark: boolean }) => {
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
const ThemeToggle = ({ isDark }: { isDark: boolean }) => {
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
const MiniDashboard = ({ theme, isDark }: { theme: any; isDark: boolean }) => {
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

/* -------------------- form inputs -------------------- */
const DarkFieldBox = ({
  children,
  active,
  theme,
  isDark,
}: {
  children: React.ReactNode;
  active: boolean;
  theme: any;
  isDark: boolean;
}) => {
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

const SignupField = ({
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
}: {
  icon: any;
  name: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: any) => void;
  theme: any;
  isDark: boolean;
  rightAction?: React.ReactNode;
  autoComplete?: string;
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

const CountryField = ({
  value,
  onChange,
  countriesArray,
  theme,
  isDark,
}: {
  value: string;
  onChange: (e: any) => void;
  countriesArray: any[];
  theme: any;
  isDark: boolean;
}) => {
  const [focused, setFocused] = useState(false);
  const fg = theme?.fg || "255 255 255";
  const accent = theme?.accent || theme?.gradientFrom || "59 130 246";

  return (
    <motion.div variants={itemVariants}>
      <DarkFieldBox active={focused} theme={theme} isDark={isDark}>
        <label className="relative block">
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
            <Globe size={16} />
          </span>

          <select
            name="country"
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="h-11 w-full appearance-none rounded-xl bg-transparent pl-10 pr-10 text-xs font-semibold outline-none"
            style={{
              color: value
                ? isDark
                  ? rgba(fg, 0.92)
                  : "rgba(15,23,42,0.94)"
                : isDark
                ? "rgba(255,255,255,0.42)"
                : "rgba(15,23,42,0.42)",
            }}
            required
          >
            <option value="">Select Country</option>

            {countriesArray.map((c) => (
              <option
                key={c.code}
                value={c.name}
                style={{
                  background: isDark ? "#111111" : "#ffffff",
                  color: isDark ? "#ffffff" : "#0f172a",
                }}
              >
                {c.name}
              </option>
            ))}
          </select>

          <ArrowRight
            size={14}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90"
            style={{
              color: isDark ? "rgba(255,255,255,0.42)" : "rgba(15,23,42,0.42)",
            }}
          />
        </label>
      </DarkFieldBox>
    </motion.div>
  );
};

const PasswordField = ({
  name,
  placeholder,
  value,
  onChange,
  theme,
  isDark,
  show,
  setShow,
  showStrength = false,
}: {
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: any) => void;
  theme: any;
  isDark: boolean;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  showStrength?: boolean;
}) => {
  const fg = theme?.fg || "255 255 255";
  const strength = getPasswordStrength(value, theme);

  return (
    <div>
      <SignupField
        icon={Lock}
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        theme={theme}
        isDark={isDark}
        autoComplete="new-password"
        rightAction={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 transition hover:opacity-80"
            style={{
              color: isDark ? rgba(fg, 0.5) : "rgba(15,23,42,0.5)",
            }}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      {showStrength && (
        <motion.div variants={itemVariants} className="mt-2 px-1">
          <div
            className="h-1 w-full overflow-hidden rounded-full"
            style={{
              background: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.12)",
            }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: rgb(strength.color),
              }}
              initial={{ width: 0 }}
              animate={{
                width: `${(strength.score / 4) * 100}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 18,
              }}
            />
          </div>

          <p
            className="mt-1 text-[10px] font-semibold"
            style={{
              color: isDark ? rgba(fg, 0.52) : "rgba(71,85,105,0.85)",
            }}
          >
            Password strength: <span className="font-black">{strength.label}</span>
          </p>
        </motion.div>
      )}
    </div>
  );
};

const PhoneField = ({
  value,
  onChange,
  theme,
  isDark,
}: {
  value: string;
  onChange: (phone: any) => void;
  theme: any;
  isDark: boolean;
}) => {
  const [focused, setFocused] = useState(false);
  const accent = theme?.accent || theme?.gradientFrom || "59 130 246";

  return (
    <motion.div variants={itemVariants}>
      <DarkFieldBox active={focused} theme={theme} isDark={isDark}>
        <div
          className="relative"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <span
            className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2"
            style={{
              color: focused
                ? rgb(accent)
                : isDark
                ? "rgba(255,255,255,0.42)"
                : "rgba(15,23,42,0.42)",
            }}
          >
            <Phone size={16} />
          </span>

          <PhoneInput
            placeholder="Phone Number"
            value={value}
            onChange={onChange}
            defaultCountry="IN"
            international
            required
          />
        </div>
      </DarkFieldBox>
    </motion.div>
  );
};

/* -------------------- main component -------------------- */
const UserSignUp = () => {
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
  const baseHeight = siteConfig?.logoSize || 3.2;

  const countriesArray = useMemo(() => getData(), []);

  const fg = theme?.fg || "255 255 255";
  const accent = theme?.accent || theme?.gradientFrom || "59 130 246";
  const info = theme?.info || theme?.gradientTo || accent;

  const handleChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhoneChange = (phone: any) => {
    setFormData((prev) => ({
      ...prev,
      phone: phone || "",
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      return setError({
        type: "validation",
        message: "Password and confirm password must match.",
      });
    }

    if (!formData.phone?.trim()) {
      return setError({
        type: "validation",
        message: "Please enter your phone number.",
      });
    }

    setSubmitting(true);

    const toastId = toast.loading("Creating your account...");

    try {
      const path = inviteId
        ? `/auth/signup/${encodeURIComponent(inviteId)}`
        : "/auth/signup";

      const res = await backendApi.post(path, formData);

      toast.success(res.data.message, { id: toastId });
      navigate(res.data.redirectTo);
    } catch (err: any) {
      let message = "Unable to create your account right now.";

      if (err.message) message = err.message;
      else if (!err.response) message = "Network issue: please check your connection.";
      else if (err.response.status >= 500)
        message = "Server is busy. Please try again later.";
      else if (err.response.status === 401) message = "Unauthorized request.";
      else if (err.response.status === 403)
        message = "You do not have permission for this action.";
      else if (err.response.data?.msg) message = err.response.data.msg;

      setError({
        type: "http",
        message,
      });

      toast.error(message, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const phoneInputCustomStyles = useMemo(() => {
    const textColor = isDark ? rgba(fg, 0.92) : "rgba(15,23,42,0.94)";
    const placeholderColor = isDark
      ? "rgba(255,255,255,0.42)"
      : "rgba(15,23,42,0.42)";

    const phoneBg = isDark ? "rgba(8,8,8,0.52)" : "rgba(255,255,255,0.84)";

    return `
      .crm-signup-scroll {
        scrollbar-width: thin;
        scrollbar-color: ${rgba(accent, 0.4)} transparent;
      }

      .crm-signup-scroll::-webkit-scrollbar {
        width: 5px;
      }

      .crm-signup-scroll::-webkit-scrollbar-track {
        background: transparent;
      }

      .crm-signup-scroll::-webkit-scrollbar-thumb {
        background: ${rgba(accent, 0.35)};
        border-radius: 999px;
      }

      .PhoneInput {
        width: 100%;
        height: 2.75rem;
        display: flex !important;
        align-items: center !important;
        gap: 0.45rem !important;
        padding-left: 2.45rem !important;
        padding-right: 0.875rem !important;
        background: transparent !important;
        border-radius: 0.75rem !important;
      }

      .PhoneInputCountry {
        position: static !important;
        transform: none !important;
        margin: 0 !important;
        display: flex !important;
        align-items: center !important;
        flex-shrink: 0 !important;
        background: transparent !important;
        border: none !important;
        height: 100% !important;
      }

      .PhoneInputCountryIcon {
        width: 1.35rem !important;
        height: 0.95rem !important;
        box-shadow: none !important;
        background: transparent !important;
        border-radius: 0.15rem !important;
        overflow: hidden !important;
      }

      .PhoneInputCountryIconImg {
        display: block !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
      }

      .PhoneInputCountrySelectArrow {
        margin-left: 0.3rem !important;
        opacity: 0.55 !important;
        color: ${placeholderColor} !important;
      }

      .PhoneInputInput {
        flex: 1 !important;
        min-width: 0 !important;
        width: auto !important;
        height: 2.75rem !important;
        background: transparent !important;
        border: none !important;
        color: ${textColor} !important;
        padding: 0 !important;
        margin: 0 !important;
        border-radius: 0.75rem !important;
        outline: none !important;
        font-size: 0.75rem !important;
        font-weight: 700 !important;
        font-family: ${fontStack} !important;
        box-shadow: none !important;
        -webkit-text-fill-color: ${textColor} !important;
      }

      .PhoneInputInput::placeholder {
        color: ${placeholderColor} !important;
        font-weight: 700 !important;
        opacity: 1 !important;
      }

      .PhoneInputInput:-webkit-autofill,
      .PhoneInputInput:-webkit-autofill:hover,
      .PhoneInputInput:-webkit-autofill:focus,
      .PhoneInputInput:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px ${phoneBg} inset !important;
        box-shadow: 0 0 0 1000px ${phoneBg} inset !important;
        -webkit-text-fill-color: ${textColor} !important;
        caret-color: ${textColor} !important;
        transition: background-color 9999s ease-in-out 0s !important;
      }

      .PhoneInputCountrySelect {
        background-color: ${isDark ? "#111111" : "#ffffff"} !important;
        color: ${isDark ? "#ffffff" : "#0f172a"} !important;
      }
    `;
  }, [fg, isDark, accent]);

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
      <style>{phoneInputCustomStyles}</style>

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
          <div className="grid min-h-[720px] overflow-hidden rounded-[1.85rem] lg:grid-cols-[1.25fr_0.78fr]">
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
                  Broker CRM onboarding
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
                  Manage leads, clients, IB referrals, deposits, withdrawals and account
                  activity from one powerful CRM.
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
                    Create Access
                  </h2>

                  <p
                    className="mt-3 text-center text-xs font-medium"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.48)" : "rgba(15,23,42,0.52)",
                    }}
                  >
                    Set up your trading CRM workspace
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
                          I'm setting up
                          <br />
                          a trading CRM
                        </p>
                      </div>

                      <div className="flex -space-x-2">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="h-8 w-8 rounded-full border-2 border-white/70"
                            style={{
                              background: `linear-gradient(135deg, ${rgba(
                                i === 0 ? "251 191 36" : i === 1 ? "59 130 246" : "236 72 153",
                                0.95
                              )}, ${rgba("15 23 42", 0.8)})`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>

                <AnimatePresence>
                  {error?.message && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      className="mb-4 rounded-xl px-4 py-3 text-xs font-bold"
                      style={{
                        border: `1px solid ${rgba(theme?.danger || "239 68 68", 0.34)}`,
                        background: rgba(theme?.danger || "239 68 68", isDark ? 0.14 : 0.1),
                        color: isDark ? rgba(fg, 0.92) : "rgba(127,29,29,0.96)",
                      }}
                    >
                      {error.message}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form
                  onSubmit={handleSubmit}
                  className="crm-signup-scroll grid max-h-[430px] grid-cols-2 gap-2.5 overflow-y-auto pr-1"
                >
                  <SignupField
                    icon={UserIcon}
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    theme={theme}
                    isDark={isDark}
                    autoComplete="given-name"
                  />

                  <SignupField
                    icon={UserIcon}
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    theme={theme}
                    isDark={isDark}
                    autoComplete="family-name"
                  />

                  <div className="col-span-2">
                    <SignupField
                      icon={Mail}
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      theme={theme}
                      isDark={isDark}
                      autoComplete="email"
                    />
                  </div>

                  <div className="col-span-2">
                    <PhoneField
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      theme={theme}
                      isDark={isDark}
                    />
                  </div>

                  <div className="col-span-2">
                    <CountryField
                      value={formData.country}
                      onChange={handleChange}
                      countriesArray={countriesArray}
                      theme={theme}
                      isDark={isDark}
                    />
                  </div>

                  <div className="col-span-2">
                    <SignupField
                      icon={Building2}
                      name="address"
                      placeholder="Address"
                      value={formData.address}
                      onChange={handleChange}
                      theme={theme}
                      isDark={isDark}
                      autoComplete="street-address"
                    />
                  </div>

                  <SignupField
                    icon={MapPin}
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    theme={theme}
                    isDark={isDark}
                    autoComplete="address-level1"
                  />

                  <SignupField
                    icon={MapPin}
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    theme={theme}
                    isDark={isDark}
                    autoComplete="address-level2"
                  />

                  <div className="col-span-2">
                    <SignupField
                      icon={MapPin}
                      name="zipCode"
                      placeholder="Zip Code"
                      value={formData.zipCode}
                      onChange={handleChange}
                      theme={theme}
                      isDark={isDark}
                      autoComplete="postal-code"
                    />
                  </div>

                  <div className="col-span-2">
                    <PasswordField
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      theme={theme}
                      isDark={isDark}
                      show={showPass}
                      setShow={setShowPass}
                      showStrength
                    />
                  </div>

                  <div className="col-span-2">
                    <PasswordField
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      theme={theme}
                      isDark={isDark}
                      show={showConfirm}
                      setShow={setShowConfirm}
                    />
                  </div>

                  <motion.button
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="group relative col-span-2 mx-auto mt-3 flex min-w-[145px] items-center justify-center gap-2 overflow-hidden rounded-lg px-6 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-65"
                    style={{
                      color: isDark ? rgb(theme?.primaryFg || "255 255 255") : "#ffffff",
                      background: `linear-gradient(135deg, ${rgb(accent)}, ${rgb(info)})`,
                      boxShadow: `0 14px 34px ${rgba(accent, 0.26)}`,
                    }}
                  >
                    <span className="absolute inset-0 -translate-x-full bg-white/20 transition duration-700 group-hover:translate-x-full" />

                    {submitting ? "Creating Access..." : "Create Access"}

                    {submitting ? (
                      <motion.span
                        className="inline-block h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          ease: "linear",
                        }}
                      />
                    ) : (
                      <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                    )}
                  </motion.button>
                </form>

                <p
                  className="mx-auto mt-6 max-w-[280px] text-center text-[10px] font-medium leading-5"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.42)" : "rgba(15,23,42,0.5)",
                  }}
                >
                  By continuing, you accept our{" "}
                  <a
                    href={siteConfig?.tNcLink || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.68)" : "rgba(15,23,42,0.72)",
                    }}
                  >
                    Privacy Policy
                  </a>{" "}
                  and Terms of Use.
                </p>

                <p
                  className="mt-5 text-center text-xs font-semibold"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.52)" : "rgba(15,23,42,0.56)",
                  }}
                >
                  Already have an account?{" "}
                  <Link
                    to="/user/login"
                    className="font-black transition hover:opacity-80"
                    style={{
                      color: rgb(accent),
                    }}
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </motion.main>
  );
};

export default UserSignUp;