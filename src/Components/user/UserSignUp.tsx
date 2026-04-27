import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowRight,
  Phone,
  BarChart3,
  Globe,
  MapPin,
  Building2,
  UsersRound,
  Network,
  ShieldCheck,
  Quote,
  ChevronDown,
  Check,
  LineChart,
  Rocket,
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

const getImageUrl = (value: any) => {
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

const normalizeSiteConfig = (value: any) => {
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

const extractSiteConfigFromResponse = (res: any) => {
  const payload = res?.data?.data ?? res?.data ?? res;

  if (!payload) return null;

  if (Array.isArray(payload)) return payload[0] || null;

  if (payload?.data && typeof payload.data === "object") {
    return Array.isArray(payload.data) ? payload.data[0] || null : payload.data;
  }

  return payload;
};

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
    theme?.accent || orange,
  ];

  return {
    score: clamp,
    label: labels[clamp],
    color: colors[clamp],
  };
}

/* -------------------- background -------------------- */
const ForexBackground = ({ isDark }: { isDark: boolean }) => {
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
const ThemeToggle = ({ isDark }: { isDark: boolean }) => {
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
const BrandMark = ({
  logo,
  baseHeight = 4,
  isDark,
  websiteName,
}: {
  logo?: any;
  baseHeight?: number;
  isDark: boolean;
  websiteName?: string;
}) => {
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
            console.log("Signup logo failed:", e.currentTarget.src);
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
const FeatureCard = ({
  icon: Icon,
  title,
  desc,
  isDark,
}: {
  icon: any;
  title: string;
  desc: string;
  isDark: boolean;
}) => {
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

const QuoteBox = ({ isDark }: { isDark: boolean }) => (
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
      Create your Forex CRM account and start managing clients, IBs, leads, and
      trading operations from one secure workspace.
    </p>
  </motion.div>
);

const StatStrip = ({ isDark }: { isDark: boolean }) => {
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

/* -------------------- form field styling -------------------- */
const FieldBox = ({
  children,
  active,
  isDark,
}: {
  children: React.ReactNode;
  active: boolean;
  isDark: boolean;
}) => {
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

const SignupField = ({
  icon: Icon,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
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
  isDark: boolean;
  rightAction?: React.ReactNode;
  autoComplete?: string;
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

const CountryField = ({
  value,
  onChange,
  countriesArray,
  isDark,
}: {
  value: string;
  onChange: (e: any) => void;
  countriesArray: any[];
  isDark: boolean;
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div variants={itemVariants}>
      <FieldBox active={focused} isDark={isDark}>
        <label className="relative block">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2"
           style={{
  color: isDark ? "rgba(255,255,255,0.46)" : "rgba(249,115,22,0.70)",
}}
          >
            <Globe size={19} strokeWidth={1.8} />
          </span>

          <select
            name="country"
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="h-[58px] w-full appearance-none rounded-2xl bg-transparent pl-12 pr-11 text-sm font-semibold outline-none"
            style={{
              color: value
                ? isDark
                  ? "rgba(255,255,255,0.92)"
                  : "rgba(15,23,42,0.92)"
                : isDark
                ? "rgba(255,255,255,0.45)"
                : "rgba(15,23,42,0.50)",
            }}
            required
          >
            <option value="">Country</option>

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

          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
            style={{
              color: isDark ? "rgba(255,255,255,0.46)" : "rgba(15,23,42,0.48)",
            }}
          />
        </label>
      </FieldBox>
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
        isDark={isDark}
        autoComplete="new-password"
        rightAction={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 transition hover:opacity-80"
            style={{
              color: isDark ? "rgba(255,255,255,0.50)" : "rgba(15,23,42,0.50)",
            }}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
      />

      {showStrength && (
        <motion.div variants={itemVariants} className="mt-2 px-1">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full"
            style={{
              background: isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.10)",
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
              color: isDark ? "rgba(255,255,255,0.52)" : "rgba(71,85,105,0.85)",
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
  isDark,
}: {
  value: string;
  onChange: (phone: any) => void;
  isDark: boolean;
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div variants={itemVariants}>
      <FieldBox active={focused} isDark={isDark}>
        <div
          className="relative"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <span
            className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2"
            style={{
              color: focused
                ? rgb(orange)
                : isDark
                ? "rgba(255,255,255,0.46)"
                : "rgba(15,23,42,0.48)",
            }}
          >
            <Phone size={19} strokeWidth={1.8} />
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
      </FieldBox>
    </motion.div>
  );
};

/* -------------------- main component -------------------- */
const UserSignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: routeId } = useParams();

  const themeConfig = useSelector((state: any) => state.user.themeConfig);
  const reduxSiteConfig = useSelector((state: any) => state.user.siteConfig);
  const mode = useSelector((state: any) => state.userTheme?.mode || "light");

  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const isDark = mode === "dark";

  const [publicSiteConfig, setPublicSiteConfig] = useState<any>({});
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const inviteId =
    routeId &&
    routeId !== "undefined" &&
    routeId !== "null" &&
    String(routeId).trim() !== ""
      ? routeId
      : null;

  const countriesArray = useMemo(() => getData(), []);

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

    if (!acceptedTerms) {
      return setError({
        type: "validation",
        message: "Please agree to the Terms of Service and Privacy Policy.",
      });
    }

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

      toast.success(res.data?.message || "Account created successfully.", {
        id: toastId,
      });

      navigate(res.data?.redirectTo || "/auth/login");
    } catch (err: any) {
      let message = "Unable to create your account right now.";

      if (err?.response?.data?.msg) message = err.response.data.msg;
      else if (err?.response?.data?.message) message = err.response.data.message;
      else if (!err?.response) message = "Network issue: please check your connection.";
      else if (err?.response?.status >= 500) message = "Server is busy. Please try again later.";
      else if (err?.response?.status === 401) message = "Unauthorized request.";
      else if (err?.response?.status === 403) message = "You do not have permission for this action.";
      else if (err?.message) message = err.message;

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
    const textColor = isDark ? "rgba(255,255,255,0.92)" : "rgba(15,23,42,0.92)";
    const placeholderColor = isDark
      ? "rgba(255,255,255,0.45)"
      : "rgba(15,23,42,0.50)";

    const phoneBg = isDark ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.82)";

    return `
      .forex-signup-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgba(249,115,22,0.38) transparent;
      }

      .forex-signup-scroll::-webkit-scrollbar {
        width: 5px;
      }

      .forex-signup-scroll::-webkit-scrollbar-track {
        background: transparent;
      }

      .forex-signup-scroll::-webkit-scrollbar-thumb {
        background: rgba(249,115,22,0.35);
        border-radius: 999px;
      }

      .PhoneInput {
        width: 100%;
        height: 58px;
        display: flex !important;
        align-items: center !important;
        gap: 0.48rem !important;
        padding-left: 3rem !important;
        padding-right: 0.95rem !important;
        background: transparent !important;
        border-radius: 1rem !important;
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
        height: 58px !important;
        background: transparent !important;
        border: none !important;
        color: ${textColor} !important;
        padding: 0 !important;
        margin: 0 !important;
        border-radius: 1rem !important;
        outline: none !important;
        font-size: 0.875rem !important;
        font-weight: 600 !important;
        font-family: ${fontStack} !important;
        box-shadow: none !important;
        -webkit-text-fill-color: ${textColor} !important;
      }

      .PhoneInputInput::placeholder {
        color: ${placeholderColor} !important;
        font-weight: 500 !important;
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

      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px ${phoneBg} inset !important;
        box-shadow: 0 0 0 1000px ${phoneBg} inset !important;
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
      <style>{phoneInputCustomStyles}</style>
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
                  Create Account for
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
                  Join your CRM workspace and manage clients, leads, IBs, and performance
                  from one powerful platform.
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
                  title="Secure Signup Access"
                  desc="Protected onboarding for your CRM workspace."
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

            <div className="relative mx-auto flex min-h-[680px] w-full max-w-[560px] flex-col justify-center">
              <motion.div variants={itemVariants} className="mb-3">
                <BrandMark
                  logo={siteConfig?.logo}
                  baseHeight={baseHeight}
                  isDark={isDark}
                  websiteName={siteConfig?.websiteName}
                />
              </motion.div>

              <AnimatePresence>
                {error?.message && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    className="mb-4 rounded-2xl px-4 py-3 text-sm font-bold"
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
                className="forex-signup-scroll grid max-h-[560px] grid-cols-2 gap-4 overflow-y-auto pr-1"
              >
                <SignupField
                  icon={UserIcon}
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  isDark={isDark}
                  autoComplete="given-name"
                />

                <SignupField
                  icon={UserIcon}
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  isDark={isDark}
                  autoComplete="family-name"
                />

                <div className="col-span-2 sm:col-span-1">
                  <SignupField
                    icon={Mail}
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    isDark={isDark}
                    autoComplete="email"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <PhoneField
                    value={formData.phone}
                    onChange={handlePhoneChange}
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
                    isDark={isDark}
                    autoComplete="street-address"
                  />
                </div>

                <div className="col-span-2">
                  <CountryField
                    value={formData.country}
                    onChange={handleChange}
                    countriesArray={countriesArray}
                    isDark={isDark}
                  />
                </div>

                <SignupField
                  icon={MapPin}
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  isDark={isDark}
                  autoComplete="address-level1"
                />

                <SignupField
                  icon={MapPin}
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
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

                <motion.label
                  variants={itemVariants}
                  className="col-span-2 mt-1 flex cursor-pointer items-start gap-3 text-sm font-medium"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.68)" : "rgba(15,23,42,0.74)",
                  }}
                >
                  <span className="relative mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />

                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-md border transition peer-focus:ring-4"
                      style={{
                        borderColor: acceptedTerms
                          ? "rgba(249,115,22,0.90)"
                          : isDark
                          ? "rgba(255,255,255,0.30)"
                          : "rgba(15,23,42,0.35)",
                        background: acceptedTerms ? rgb(orange) : "transparent",
                      }}
                    >
                      {acceptedTerms && <Check size={14} className="text-white" />}
                    </span>
                  </span>

                  <span>
                    I agree to the{" "}
                    <a
                      href={siteConfig?.tNcLink || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold transition hover:opacity-80"
                      style={{ color: rgb(orange) }}
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href={siteConfig?.privacyPolicyLink || siteConfig?.tNcLink || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold transition hover:opacity-80"
                      style={{ color: rgb(orange) }}
                    >
                      Privacy Policy
                    </a>
                  </span>
                </motion.label>

                <motion.button
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="group relative col-span-2 mt-3 flex h-[64px] items-center justify-center gap-3 overflow-hidden rounded-2xl text-lg font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-65"
                  style={{
                    background: `linear-gradient(135deg, ${rgb(amber)}, ${rgb(deepOrange)})`,
                    boxShadow: "0 18px 40px rgba(249,115,22,0.32)",
                  }}
                >
                  <span className="absolute inset-0 -translate-x-full bg-white/20 transition duration-700 group-hover:translate-x-full" />

                  {submitting ? "Creating Account..." : "Create Account"}

                  {submitting ? (
                    <motion.span
                      className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        ease: "linear",
                      }}
                    />
                  ) : (
                    <ArrowRight size={24} className="transition group-hover:translate-x-1" />
                  )}
                </motion.button>
              </form>

              <p
                className="mt-6 text-center text-sm font-semibold"
                style={{
                  color: isDark ? "rgba(255,255,255,0.56)" : "rgba(15,23,42,0.58)",
                }}
              >
                Already have an account?{" "}
                <Link
                  to="/auth/login"
                  className="font-black transition hover:opacity-80"
                  style={{ color: rgb(orange) }}
                >
                  Sign In
                </Link>
              </p>
            </div>
          </motion.section>
        </div>

        <StatStrip isDark={isDark} />
      </section>
    </motion.main>
  );
};

export default UserSignUp;