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

  option:"bg-surface text-text",

  iconBox:"border-line bg-primary-soft text-primary",

  badge:"border-line bg-surface-2 text-subtle",

  successBadge:"border-success bg-success-soft text-success",

  dangerBadge:"border-danger bg-danger-soft text-danger",

  button:"bg-primary text-text hover:bg-primary focus:ring-primary",

  ghostButton:"border-line bg-surface-2 text-muted hover:bg-surface-2",
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
      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />

      <input
        type="password"
        name={name}
        value={value}
        onChange={onChange}
        required
        placeholder={`Enter ${label.toLowerCase()}`}
        className={cx(
          "w-full rounded-card border py-3 pl-10 pr-4 text-sm outline-none transition-all duration-200 focus:ring-4",
          theme.input,
          error && "border-danger focus:border-danger focus:ring-danger"
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
    <div style="background:#2a56dc;color:#fff;padding:18px;border-radius:10px 10px 0 0;text-align:center;">
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
    <div className={cx("w-full", theme.pageText)}>
      <div className="mx-auto max-w-6xl space-y-5">
        <PageHeader
          breadcrumb="Account / Security"
          title="Master password"
          description="Update the master password for a trading account. It gives full trading access."
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Card theme={theme} className="lg:col-span-4">
            <div className="mb-5 flex items-start gap-3">
              <div className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-card border", theme.iconBox)}>
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
                      "w-full appearance-none rounded-card border px-4 py-3 pr-10 text-sm outline-none transition-all duration-200 focus:ring-4",
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

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                </div>

                <div className={cx("mt-5 rounded-card border p-4", theme.cardSoft)}>
                  <p className={cx("text-xs uppercase tracking-[0.14em]", theme.muted)}>
                    Active Account
                  </p>
                  <p className={cx("mt-1 font-mono text-lg font-bold", theme.text)}>
                    #{currentAccount?.accountNumber || "—"}
                  </p>
                </div>
              </div>
            ) : (
              <div className={cx("rounded-card border px-4 py-3 text-sm", theme.dangerBadge)}>
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

              <div className={cx("rounded-card border px-4 py-3 text-sm leading-6", theme.successBadge)}>
                Master password must include uppercase, lowercase, number, special symbol, and minimum 8 characters.
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={cx("flex items-start gap-2 rounded-card border px-4 py-3 text-sm", theme.dangerBadge)}
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
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