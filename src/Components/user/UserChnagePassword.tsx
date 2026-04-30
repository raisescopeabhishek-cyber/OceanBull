import { useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  AlertCircle,
  Shield,
  Sparkles,
  Loader2,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { backendApi } from "../../utils/apiClients";
import UseUserHook from "../../hooks/user/UseUserHook";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const getTheme = (isDark: boolean) => ({
  pageText: isDark ? "text-white" : "text-slate-900",
  text: isDark ? "text-white" : "text-slate-900",
  muted: isDark ? "text-white/55" : "text-slate-500",
  softText: isDark ? "text-white/70" : "text-slate-600",

  pageBg: isDark ? "bg-[#0b1120]" : "bg-[#fffaf5]",

  header: isDark
    ? "border-white/10 bg-[linear-gradient(135deg,rgba(30,41,59,1),rgba(15,23,42,1))] shadow-[0_18px_55px_rgba(0,0,0,0.38)]"
    : "border-amber-300/40 bg-[linear-gradient(135deg,#fb923c,#f59e0b)] shadow-[0_18px_45px_rgba(245,158,11,0.16)]",

  headerText: "text-white",
  headerMuted: "text-white/80",
  headerBadge: "border-white/20 bg-white/10 text-white",
  headerIcon: "border-white/20 bg-white/10 text-white",
  headerStat: "border-white/20 bg-white/10 text-white backdrop-blur-xl",
  headerStatMuted: "text-white/75",

  card: isDark
    ? "border-white/10 bg-white/[0.045] shadow-[0_18px_55px_rgba(0,0,0,0.38)]"
    : "border-amber-100/90 bg-white/80 shadow-[0_18px_45px_rgba(245,158,11,0.08)]",

  cardSoft: isDark
    ? "border-white/10 bg-white/[0.035]"
    : "border-amber-100/80 bg-white/70",

  input: isDark
    ? "border-white/10 bg-white/[0.055] text-white placeholder:text-white/35 focus:border-blue-400/50 focus:ring-blue-400/20"
    : "border-amber-300 bg-amber-50/80 text-slate-900 placeholder:text-amber-400 shadow-[0_0_0_3px_rgba(245,158,11,0.06)] focus:border-amber-500 focus:bg-white focus:ring-amber-300/60",

  iconBox: isDark
    ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
    : "border-amber-200 bg-amber-50 text-amber-600",

  badge: isDark
    ? "border-white/10 bg-white/[0.05] text-white/60"
    : "border-amber-100 bg-white/80 text-amber-600",

  successBadge: isDark
    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
    : "border-emerald-200 bg-emerald-50 text-emerald-700",

  dangerBadge: isDark
    ? "border-red-400/20 bg-red-500/10 text-red-300"
    : "border-red-200 bg-red-50 text-red-700",

  warningBadge: isDark
    ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
    : "border-amber-200 bg-amber-50 text-amber-700",

  button: isDark
    ? "bg-blue-500 text-white hover:bg-blue-400 focus:ring-blue-400/30"
    : "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-300/70",

  ghostButton: isDark
    ? "border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.08]"
    : "border-amber-100 bg-white/75 text-slate-600 hover:bg-amber-50",

  progressTrack: isDark ? "bg-white/10" : "bg-amber-100",
});

const HeaderCard = ({
  children,
  theme,
  isDark,
}: {
  children: React.ReactNode;
  theme: ReturnType<typeof getTheme>;
  isDark: boolean;
}) => (
  <div
    className={cx(
      "relative overflow-hidden rounded-[26px] border p-5 transition-all duration-300 sm:p-6",
      theme.header
    )}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background: isDark
          ? "radial-gradient(circle at top left, rgba(59,130,246,0.20), transparent 36%), radial-gradient(circle at bottom right, rgba(34,211,238,0.10), transparent 32%)"
          : "radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 30%), radial-gradient(circle at bottom right, rgba(255,251,235,0.22), transparent 36%)",
      }}
    />
    <div className="relative z-[1]">{children}</div>
  </div>
);

const Card = ({
  children,
  theme,
  className = "",
}: {
  children: React.ReactNode;
  theme: ReturnType<typeof getTheme>;
  className?: string;
}) => (
  <div
    className={cx(
      "rounded-[26px] border p-4 transition-all duration-300 sm:p-5",
      theme.card,
      className
    )}
  >
    {children}
  </div>
);

const HeaderStatBox = ({
  icon,
  label,
  value,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  theme: ReturnType<typeof getTheme>;
}) => (
  <div className={cx("rounded-2xl border px-4 py-3", theme.headerStat)}>
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10">
        {icon}
      </div>
      <div>
        <p className={cx("text-xs", theme.headerStatMuted)}>{label}</p>
        <p className="mt-1 text-base font-bold text-white">{value}</p>
      </div>
    </div>
  </div>
);

const PasswordField = ({
  theme,
  label,
  name,
  value,
  show,
  onChange,
  onToggle,
}: {
  theme: ReturnType<typeof getTheme>;
  label: string;
  name: "current" | "new" | "confirm";
  value: string;
  show: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggle: () => void;
}) => (
  <div>
    <label
      htmlFor={name}
      className={cx(
        "mb-2 block text-xs font-semibold uppercase tracking-[0.14em]",
        theme.muted
      )}
    >
      {label}
    </label>

    <div className="relative">
      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />

      <input
        id={name}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        required
        placeholder={`Enter ${label.toLowerCase()}`}
        className={cx(
          "w-full rounded-2xl border py-3 pl-10 pr-12 text-sm outline-none transition-all duration-200 focus:ring-4",
          theme.input
        )}
      />

      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 transition hover:opacity-80"
        aria-label="Toggle password visibility"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

const UserChnagePassword = () => {
  const mode = useSelector((store: any) => store.userTheme?.mode || "light");
  const loggedUser = useSelector((store: any) => store.user.loggedUser);

  const isDark = mode === "dark";
  const theme = useMemo(() => getTheme(isDark), [isDark]);

  const navigate = useNavigate();
  const { getUpdateLoggedUser } = UseUserHook();

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
  const [isLoading, setIsLoading] = useState(false);

  const strength = useMemo(() => {
    const value = passwords.new;
    let score = 0;

    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    const labels = ["Very Weak", "Weak", "Good", "Strong", "Excellent"];

    return {
      score,
      label: labels[score],
      percent: (score / 4) * 100,
    };
  }, [passwords.new]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const customContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Password Updated</title>
</head>
<body>
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background:#f59e0b;color:#fff;padding:18px;border-radius:10px 10px 0 0;text-align:center;">
      <h2 style="margin:0;">Account Password Updated</h2>
    </div>
    <div style="padding:20px;border:1px solid #fde68a;">
      <p>Dear ${loggedUser?.firstName || ""} ${loggedUser?.lastName || ""},</p>
      <p>Your account password has been successfully updated.</p>
      <p>If this was not done by you, please contact support immediately.</p>
      <p>Best regards,<br/>${import.meta.env.VITE_WEBSITE_NAME || "Forex"} Team</p>
    </div>
  </div>
</body>
</html>`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match. Please try again.");
      toast.error("Passwords do not match");
      return;
    }

    const toastId = toast.loading("Please wait...");
    setIsLoading(true);

    try {
      const res = await backendApi.post("/update-password", {
        userId: loggedUser._id,
        currentPassword: passwords.current,
        newPassword: passwords.confirm,
      });

      await backendApi.post("/custom-mail", {
        email: loggedUser.email,
        content: customContent,
        subject: "Account Password Changed",
      });

      toast.success(res?.data?.msg || "Password updated", { id: toastId });
      getUpdateLoggedUser();
      navigate("/user/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ruleClass = (ok: boolean) => (ok ? theme.successBadge : theme.badge);

  return (
    <div className={cx("min-h-screen w-full p-4 sm:p-6", theme.pageBg, theme.pageText)}>
      <div className="mx-auto max-w-5xl space-y-5">
        <HeaderCard theme={theme} isDark={isDark}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className={cx("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border", theme.headerIcon)}>
                <KeyRound className="h-6 w-6" />
              </div>

              <div>
                <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]", theme.headerBadge)}>
                  <Sparkles className="h-3.5 w-3.5" />
                  Security Center
                </div>

                <h1 className={cx("text-2xl font-bold tracking-tight sm:text-3xl", theme.headerText)}>
                  Change Password
                </h1>

                <p className={cx("mt-2 max-w-2xl text-sm leading-6", theme.headerMuted)}>
                  Update your login password securely. Use a strong password that you do not use anywhere else.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <HeaderStatBox theme={theme} icon={<Shield className="h-4 w-4" />} label="Security" value="Protected" />
              <HeaderStatBox theme={theme} icon={<Lock className="h-4 w-4" />} label="Access" value="Login" />
              <HeaderStatBox theme={theme} icon={<CheckCircle2 className="h-4 w-4" />} label="Status" value="Active" />
            </div>
          </div>
        </HeaderCard>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Card theme={theme} className="lg:col-span-4">
            <div className="mb-5 flex items-start gap-3">
              <div className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border", theme.iconBox)}>
                <Shield className="h-5 w-5" />
              </div>

              <div>
                <h2 className={cx("text-lg font-semibold", theme.text)}>
                  Password Tips
                </h2>
                <p className={cx("mt-1 text-sm leading-6", theme.muted)}>
                  A strong password helps protect your dashboard and account activity.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className={cx("rounded-2xl border px-4 py-3 text-sm", ruleClass(passwords.new.length >= 8))}>
                Minimum 8 characters
              </div>
              <div className={cx("rounded-2xl border px-4 py-3 text-sm", ruleClass(/[A-Z]/.test(passwords.new)))}>
                At least one uppercase letter
              </div>
              <div className={cx("rounded-2xl border px-4 py-3 text-sm", ruleClass(/[0-9]/.test(passwords.new)))}>
                At least one number
              </div>
              <div className={cx("rounded-2xl border px-4 py-3 text-sm", ruleClass(/[^A-Za-z0-9]/.test(passwords.new)))}>
                At least one special symbol
              </div>
            </div>
          </Card>

          <Card theme={theme} className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <PasswordField
                theme={theme}
                label="Current Password"
                name="current"
                value={passwords.current}
                show={showPasswords.current}
                onChange={handleChange}
                onToggle={() => togglePasswordVisibility("current")}
              />

              <div>
                <PasswordField
                  theme={theme}
                  label="New Password"
                  name="new"
                  value={passwords.new}
                  show={showPasswords.new}
                  onChange={handleChange}
                  onToggle={() => togglePasswordVisibility("new")}
                />

                <div className="mt-3">
                  <div className={cx("h-2 overflow-hidden rounded-full", theme.progressTrack)}>
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                      initial={{ width: "0%" }}
                      animate={{ width: `${strength.percent}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    />
                  </div>

                  <p className={cx("mt-2 text-xs font-semibold", theme.muted)}>
                    Password strength:{" "}
                    <span className="text-amber-500">{strength.label}</span>
                  </p>
                </div>
              </div>

              <PasswordField
                theme={theme}
                label="Confirm Password"
                name="confirm"
                value={passwords.confirm}
                show={showPasswords.confirm}
                onChange={handleChange}
                onToggle={() => togglePasswordVisibility("confirm")}
              />

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={cx("flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm", theme.dangerBadge)}
                  >
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to="/user/dashboard"
                  className={cx("inline-flex items-center justify-center rounded-2xl border px-6 py-3 text-sm font-semibold transition", theme.ghostButton)}
                >
                  Cancel
                </Link>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className={cx("inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3 text-sm font-bold outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70", theme.button)}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {isLoading ? "Updating..." : "Update Password"}
                </motion.button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserChnagePassword;