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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { backendApi, userApi } from "../../utils/apiClients";

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

  button: isDark
    ? "bg-blue-500 text-white hover:bg-blue-400 focus:ring-blue-400/30"
    : "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-300/70",

  ghostButton: isDark
    ? "border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.08]"
    : "border-amber-100 bg-white/75 text-slate-600 hover:bg-amber-50",
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

const PasswordInput = ({
  theme,
  label,
  name,
  value,
  onChange,
  error,
}: {
  theme: ReturnType<typeof getTheme>;
  label: string;
  name: "new" | "confirm";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: boolean;
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
        type="password"
        name={name}
        value={value}
        onChange={onChange}
        required
        placeholder={`Enter ${label.toLowerCase()}`}
        className={cx(
          "w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none transition-all duration-200 focus:ring-4",
          theme.input,
          error && "border-red-400 focus:border-red-400 focus:ring-red-400/20"
        )}
      />
    </div>
  </div>
);

const UserMasterPassword = () => {
  const mode = useSelector((store: any) => store.userTheme?.mode || "light");
  const loggedUser = useSelector((store: any) => store.user.loggedUser);

  const isDark = mode === "dark";
  const theme = useMemo(() => getTheme(isDark), [isDark]);

  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({
    new: "",
    confirm: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [currentAccount, setCurrentAccount] = useState(
    loggedUser?.accounts?.[0] || null
  );

  const validatePassword = (password: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?]).{8,}$/;

    return passwordRegex.test(password);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const customContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Master Password Updated</title>
</head>
<body>
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background:#f59e0b;color:#fff;padding:18px;border-radius:10px 10px 0 0;text-align:center;">
      <h2 style="margin:0;">Master Password Updated</h2>
    </div>
    <div style="padding:20px;border:1px solid #fde68a;">
      <p>Dear ${loggedUser?.firstName || ""} ${loggedUser?.lastName || ""},</p>
      <p>Your trading account master password has been updated.</p>
      <p><strong>Account No:</strong> ${currentAccount?.accountNumber || ""}</p>
      <p>If this was not done by you, please contact support immediately.</p>
      <p>Best regards,<br/>${import.meta.env.VITE_WEBSITE_NAME || "Forex"} Team</p>
    </div>
  </div>
</body>
</html>`;

  const handleSubmit = async (e: React.FormEvent) => {
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
        `/server-master-password-change&Account=${currentAccount.accountNumber}&password=${passwords.confirm}`
      );

      await backendApi.post("/update-master-password", {
        userId: loggedUser._id,
        accountId: currentAccount._id,
        newPassword: passwords.confirm,
      });

      await backendApi.post("/custom-mail", {
        email: loggedUser.email,
        content: customContent,
        subject: "Master password changed",
      });

      toast.success(res?.data?.data?.MESSAGE || "Master password changed", {
        id: toastId,
      });

      setPasswords({ new: "", confirm: "" });
      setError("");
      navigate("/user/dashboard");
    } catch (err) {
      toast.error("An error occurred. Please try again.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cx("min-h-screen w-full p-4 sm:p-6", theme.pageBg, theme.pageText)}>
      <div className="mx-auto max-w-6xl space-y-5">
        <HeaderCard theme={theme} isDark={isDark}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className={cx("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border", theme.headerIcon)}>
                <KeyRound className="h-6 w-6" />
              </div>

              <div>
                <div className={cx("mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]", theme.headerBadge)}>
                  <Sparkles className="h-3.5 w-3.5" />
                  Trading Security
                </div>

                <h1 className={cx("text-2xl font-bold tracking-tight sm:text-3xl", theme.headerText)}>
                  Change Master Password
                </h1>

                <p className={cx("mt-2 max-w-2xl text-sm leading-6", theme.headerMuted)}>
                  Update the master password for your selected trading account.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <HeaderStatBox theme={theme} icon={<Shield className="h-4 w-4" />} label="Protection" value="High" />
              <HeaderStatBox theme={theme} icon={<Lock className="h-4 w-4" />} label="Mode" value="Master" />
              <HeaderStatBox theme={theme} icon={<CheckCircle2 className="h-4 w-4" />} label="Status" value="Active" />
            </div>
          </div>
        </HeaderCard>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Card theme={theme} className="lg:col-span-4">
            <div className="mb-5 flex items-start gap-3">
              <div className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border", theme.iconBox)}>
                <Lock className="h-5 w-5" />
              </div>

              <div>
                <h2 className={cx("text-lg font-semibold", theme.text)}>
                  Selected Account
                </h2>
                <p className={cx("mt-1 text-sm leading-6", theme.muted)}>
                  Choose the trading account where the master password should be changed.
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
                        (value: any) => value.accountNumber === e.target.value
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

                    {loggedUser.accounts?.map((value: any, index: number) => (
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

                <div className={cx("mt-5 rounded-2xl border p-4", theme.cardSoft)}>
                  <p className={cx("text-xs uppercase tracking-[0.14em]", theme.muted)}>
                    Active Account
                  </p>
                  <p className={cx("mt-1 font-mono text-lg font-bold", theme.text)}>
                    #{currentAccount?.accountNumber || "—"}
                  </p>
                </div>
              </div>
            ) : (
              <div className={cx("rounded-2xl border px-4 py-3 text-sm", theme.dangerBadge)}>
                No trading account found.
              </div>
            )}
          </Card>

          <Card theme={theme} className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <PasswordInput
                theme={theme}
                label="New Master Password"
                name="new"
                value={passwords.new}
                onChange={handleChange}
                error={!!error}
              />

              <PasswordInput
                theme={theme}
                label="Confirm Master Password"
                name="confirm"
                value={passwords.confirm}
                onChange={handleChange}
                error={!!error}
              />

              <div className={cx("rounded-2xl border px-4 py-3 text-sm leading-6", theme.successBadge)}>
                Master password must include uppercase, lowercase, number, special symbol, and minimum 8 characters.
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={cx("flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm", theme.dangerBadge)}
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
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

export default UserMasterPassword;