import { useMemo, useState } from "react";
import {
  Lock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Shield,
  KeyRound,
  Loader2,
  ChevronDown,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { backendApi, userApi } from "../../utils/apiClients";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const getTheme = (isDark) => ({
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

  option: isDark ? "bg-slate-900 text-white" : "bg-amber-50 text-slate-900",

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

  buttonDisabled: isDark
    ? "bg-slate-600 text-white/60"
    : "bg-slate-300 text-slate-600",

  progressTrack: isDark ? "bg-white/10" : "bg-amber-100",
});

const HeaderCard = ({ children, theme, isDark }) => (
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

const Card = ({ children, theme, className = "" }) => (
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

const HeaderStatBox = ({ icon, label, value, theme }) => (
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

const PasswordInput = ({
  theme,
  label,
  name,
  value,
  onChange,
  show,
  onToggle,
  error,
}) => (
  <div>
    <label
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
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        required
        placeholder={`Enter ${label.toLowerCase()}`}
        className={cx(
          "w-full rounded-2xl border py-3 pl-10 pr-12 text-sm outline-none transition-all duration-200 focus:ring-4",
          theme.input,
          error && "border-red-400 focus:border-red-400 focus:ring-red-400/20"
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

const UserInvesterPassword = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const loggedUser = useSelector((store) => store.user?.loggedUser);

  const isDark = mode === "dark";
  const theme = useMemo(() => getTheme(isDark), [isDark]);

  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({
    new: "",
    confirm: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [currentAccount, setCurrentAccount] = useState(
    loggedUser?.accounts?.[0] || null
  );

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?]).{8,}$/;

    return passwordRegex.test(password);
  };

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

  const handleChange = (e) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const customContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Investor Password Updated</title>
</head>
<body>
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background:#f59e0b;color:#fff;padding:18px;border-radius:10px 10px 0 0;text-align:center;">
      <h2 style="margin:0;">Investor Password Updated</h2>
    </div>
    <div style="padding:20px;border:1px solid #fde68a;">
      <p>Dear ${loggedUser?.firstName || ""} ${loggedUser?.lastName || ""},</p>
      <p>Your trading account investor password has been updated successfully.</p>
      <p><strong>Account No:</strong> ${currentAccount?.accountNumber || ""}</p>
      <p>If this was not done by you, please contact support immediately.</p>
      <p>Best regards,<br/>${import.meta.env.VITE_WEBSITE_NAME || "Forex"} Team</p>
    </div>
  </div>
</body>
</html>`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentAccount?.accountNumber) {
      toast.error("Please select an account.");
      return;
    }

    if (!validatePassword(passwords.new)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special symbol."
      );
      toast.error("Invalid password format");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match. Please try again.");
      toast.error("Passwords do not match");
      return;
    }

    const toastId = toast.loading("Please wait...");
    setIsLoading(true);

    try {
      const res = await userApi.get(
        `/server-master-password-change?Account=${currentAccount.accountNumber}&password=${passwords.confirm}`
      );

      await backendApi.post("/update-investor-password", {
        userId: loggedUser._id,
        accountId: currentAccount._id,
        newPassword: passwords.confirm,
      });

      await backendApi.post("/custom-mail", {
        email: loggedUser.email,
        content: customContent,
        subject: "Investor Password Changed",
      });

      toast.success(
        res?.data?.MESSAGE ||
          res?.data?.data?.MESSAGE ||
          "Investor password changed",
        { id: toastId }
      );

      setPasswords({
        new: "",
        confirm: "",
      });
      setError("");
      navigate("/user/dashboard");
    } catch (error) {
      toast.error("An error occurred. Please try again.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const ruleClass = (ok) => (ok ? theme.successBadge : theme.badge);

  return (
    <div
      className={cx(
        "min-h-screen w-full p-4 sm:p-6",
        theme.pageBg,
        theme.pageText
      )}
    >
      <div className="mx-auto max-w-6xl space-y-5">
        <HeaderCard theme={theme} isDark={isDark}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={cx(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                  theme.headerIcon
                )}
              >
                <KeyRound className="h-6 w-6" />
              </div>

              <div>
                <div
                  className={cx(
                    "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                    theme.headerBadge
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Trading Security
                </div>

                <h1
                  className={cx(
                    "text-2xl font-bold tracking-tight sm:text-3xl",
                    theme.headerText
                  )}
                >
                  Change Investor Password
                </h1>

                <p
                  className={cx(
                    "mt-2 max-w-2xl text-sm leading-6",
                    theme.headerMuted
                  )}
                >
                  Update the investor password for your selected trading account.
                  Investor access is generally used for read-only monitoring.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <HeaderStatBox
                theme={theme}
                icon={<Shield className="h-4 w-4" />}
                label="Access"
                value="View-only"
              />
              <HeaderStatBox
                theme={theme}
                icon={<Lock className="h-4 w-4" />}
                label="Mode"
                value="Investor"
              />
              <HeaderStatBox
                theme={theme}
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Status"
                value="Active"
              />
            </div>
          </div>
        </HeaderCard>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Card theme={theme} className="lg:col-span-4">
            <div className="mb-5 flex items-start gap-3">
              <div
                className={cx(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
                  theme.iconBox
                )}
              >
                <Lock className="h-5 w-5" />
              </div>

              <div>
                <h2 className={cx("text-lg font-semibold", theme.text)}>
                  Selected Account
                </h2>
                <p className={cx("mt-1 text-sm leading-6", theme.muted)}>
                  Choose the trading account where the investor password should
                  be changed.
                </p>
              </div>
            </div>

            {loggedUser?.accounts?.length > 0 ? (
              <div>
                <label
                  className={cx(
                    "mb-2 block text-xs font-semibold uppercase tracking-[0.14em]",
                    theme.muted
                  )}
                >
                  Select Account
                </label>

                <div className="relative">
                  <select
                    value={currentAccount?.accountNumber || ""}
                    onChange={(e) => {
                      const selectedValue = loggedUser.accounts?.find(
                        (value) => value.accountNumber === e.target.value
                      );
                      setCurrentAccount(selectedValue || null);
                    }}
                    className={cx(
                      "w-full appearance-none rounded-2xl border px-4 py-3 pr-10 text-sm outline-none transition-all duration-200 focus:ring-4",
                      theme.input
                    )}
                  >
                    <option value="" disabled className={theme.option}>
                      Select Account
                    </option>

                    {loggedUser.accounts?.map((value, index) => (
                      <option
                        key={index}
                        value={value.accountNumber}
                        className={theme.option}
                      >
                        {value.accountNumber}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
                </div>

                <div
                  className={cx("mt-5 rounded-2xl border p-4", theme.cardSoft)}
                >
                  <p
                    className={cx(
                      "text-xs uppercase tracking-[0.14em]",
                      theme.muted
                    )}
                  >
                    Active Account
                  </p>
                  <p
                    className={cx(
                      "mt-1 font-mono text-lg font-bold",
                      theme.text
                    )}
                  >
                    #{currentAccount?.accountNumber || "—"}
                  </p>
                </div>

                <div
                  className={cx(
                    "mt-4 rounded-2xl border px-4 py-3 text-sm leading-6",
                    theme.successBadge
                  )}
                >
                  Investor password gives read-only access for account monitoring.
                </div>
              </div>
            ) : (
              <div
                className={cx(
                  "rounded-2xl border px-4 py-3 text-sm",
                  theme.dangerBadge
                )}
              >
                No trading account found.
              </div>
            )}
          </Card>

          <Card theme={theme} className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <PasswordInput
                theme={theme}
                label="New Investor Password"
                name="new"
                value={passwords.new}
                onChange={handleChange}
                show={showPasswords.new}
                onToggle={() => togglePasswordVisibility("new")}
                error={!!error}
              />

              <div>
                <PasswordInput
                  theme={theme}
                  label="Confirm Investor Password"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handleChange}
                  show={showPasswords.confirm}
                  onToggle={() => togglePasswordVisibility("confirm")}
                  error={!!error}
                />

                <div className="mt-3">
                  <div
                    className={cx(
                      "h-2 overflow-hidden rounded-full",
                      theme.progressTrack
                    )}
                  >
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

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div
                  className={cx(
                    "rounded-2xl border px-4 py-3 text-sm",
                    ruleClass(passwords.new.length >= 8)
                  )}
                >
                  Minimum 8 characters
                </div>
                <div
                  className={cx(
                    "rounded-2xl border px-4 py-3 text-sm",
                    ruleClass(/[A-Z]/.test(passwords.new))
                  )}
                >
                  At least one uppercase letter
                </div>
                <div
                  className={cx(
                    "rounded-2xl border px-4 py-3 text-sm",
                    ruleClass(/[0-9]/.test(passwords.new))
                  )}
                >
                  At least one number
                </div>
                <div
                  className={cx(
                    "rounded-2xl border px-4 py-3 text-sm",
                    ruleClass(/[^A-Za-z0-9]/.test(passwords.new))
                  )}
                >
                  At least one special symbol
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={cx(
                      "flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm",
                      theme.dangerBadge
                    )}
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to="/user/dashboard"
                  className={cx(
                    "inline-flex items-center justify-center rounded-2xl border px-6 py-3 text-sm font-semibold transition",
                    theme.ghostButton
                  )}
                >
                  Cancel
                </Link>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className={cx(
                    "inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3 text-sm font-bold outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70",
                    isLoading ? theme.buttonDisabled : theme.button
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  {isLoading ? "Updating..." : "Change Password"}
                </motion.button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserInvesterPassword;