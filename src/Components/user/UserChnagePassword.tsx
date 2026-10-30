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
import { PageHeader } from "@/Components/ui";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const getTheme = (isDark: boolean) => ({
  pageText:"text-text",
  text:"text-text",
  muted:"text-subtle",
  softText:"text-muted",

  pageBg:"bg-surface",

  header:"border-line",

  headerText: "text-text",
  headerMuted: "text-muted",
  headerBadge: "border-line bg-surface-2 text-text",
  headerIcon: "border-line bg-surface-2 text-text",
  headerStat: "border-line bg-surface-2 text-text backdrop-blur-xl",
  headerStatMuted: "text-muted",

  card:"border-line bg-surface-2",

  cardSoft:"border-line bg-surface-2",

  input:"border-line bg-surface-2 text-text placeholder:text-subtle focus:border-line focus:ring-primary",

  iconBox:"border-line bg-primary-soft text-primary",

  badge:"border-line bg-surface-2 text-subtle",

  successBadge:"border-success bg-success-soft text-success",

  dangerBadge:"border-danger bg-danger-soft text-danger",

  warningBadge:"border-line bg-primary-soft text-primary",

  button:"bg-primary text-text hover:bg-primary focus:ring-primary",

  ghostButton:"border-line bg-surface-2 text-muted hover:bg-surface-2",

  progressTrack:"bg-surface-2",
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
      "relative overflow-hidden rounded-card border p-5 transition-all duration-300 sm:p-6",
      theme.header
    )}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background: isDark
          ? "radial-gradient(circle at top left, rgba(79, 125, 246,0.20), transparent 36%), radial-gradient(circle at bottom right, rgba(34,211,238,0.10), transparent 32%)"
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
      "rounded-card border p-4 transition-all duration-300 sm:p-5",
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
  <div className={cx("rounded-card border px-4 py-3", theme.headerStat)}>
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-card border border-line bg-surface-2">
        {icon}
      </div>
      <div>
        <p className={cx("text-xs", theme.headerStatMuted)}>{label}</p>
        <p className="mt-1 text-base font-bold text-text">{value}</p>
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
      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />

      <input
        id={name}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        required
        placeholder={`Enter ${label.toLowerCase()}`}
        className={cx(
          "w-full rounded-card border py-3 pl-10 pr-12 text-sm outline-none transition-all duration-200 focus:ring-4",
          theme.input
        )}
      />

      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary transition hover:opacity-80"
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
    <div style="background:#2a56dc;color:#fff;padding:18px;border-radius:10px 10px 0 0;text-align:center;">
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
    <div className={cx("w-full", theme.pageText)}>
      <div className="mx-auto max-w-5xl space-y-5">
        <PageHeader
          breadcrumb="Account / Security"
          title="Change password"
          description="Update your login password. Use one you do not use anywhere else."
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Card theme={theme} className="lg:col-span-4">
            <div className="mb-5 flex items-start gap-3">
              <div className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-card border", theme.iconBox)}>
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
              <div className={cx("rounded-card border px-4 py-3 text-sm", ruleClass(passwords.new.length >= 8))}>
                Minimum 8 characters
              </div>
              <div className={cx("rounded-card border px-4 py-3 text-sm", ruleClass(/[A-Z]/.test(passwords.new)))}>
                At least one uppercase letter
              </div>
              <div className={cx("rounded-card border px-4 py-3 text-sm", ruleClass(/[0-9]/.test(passwords.new)))}>
                At least one number
              </div>
              <div className={cx("rounded-card border px-4 py-3 text-sm", ruleClass(/[^A-Za-z0-9]/.test(passwords.new)))}>
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
                      className="h-full rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${strength.percent}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    />
                  </div>

                  <p className={cx("mt-2 text-xs font-semibold", theme.muted)}>
                    Password strength:{" "}
                    <span className="text-primary">{strength.label}</span>
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
                    className={cx("flex items-center gap-2 rounded-card border px-4 py-3 text-sm", theme.dangerBadge)}
                  >
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to="/user/dashboard"
                  className={cx("inline-flex items-center justify-center rounded-card border px-6 py-3 text-sm font-semibold transition", theme.ghostButton)}
                >
                  Cancel
                </Link>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className={cx("inline-flex items-center justify-center gap-2 rounded-card px-7 py-3 text-sm font-bold outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70", theme.button)}
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