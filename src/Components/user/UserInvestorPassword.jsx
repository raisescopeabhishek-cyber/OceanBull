import { useState } from "react";
import { Lock, CheckCircle, AlertCircle, Sparkles, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { backendApi,  userApi } from "../../utils/apiClients";
import ModernHeading from "../lib/ModernHeading";
import { FloatingParticles } from "../../utils/FloatingParticles";

/* =========================== DECOR / THEME (same as above) ============================ */

const AnimatedGrid = () => (
  <div className="absolute inset-0 pointer-events-none opacity-10">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(34,197,94,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.15) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        maskImage: "radial-gradient(ellipse at center, black 60%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 60%, transparent 100%)",
      }}
    />
    <motion.div
      className="absolute inset-0"
      animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      style={{
        background:
          "repeating-linear-gradient(90deg, rgba(0,255,200,0.06) 0px, rgba(0,255,200,0.06) 2px, transparent 2px, transparent 6px)",
      }}
    />
  </div>
);

const FloatingOrbs = () => (
  <div className="absolute inset-0 pointer-events-none">
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full blur-2xl"
        style={{
          width: 140,
          height: 140,
          background:
            i % 3 === 0
              ? "radial-gradient(circle at center, rgba(16,185,129,0.25), transparent 60%)"
              : i % 3 === 1
              ? "radial-gradient(circle at center, rgba(34,211,238,0.25), transparent 60%)"
              : "radial-gradient(circle at center, rgba(99,102,241,0.22), transparent 60%)",
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
    ))}
  </div>
);

const GlassCard = ({ children, className = "" }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`relative rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-slate-900/60 via-slate-900/30 to-slate-900/60 backdrop-blur-xl shadow-[0_0_80px_rgba(16,185,129,0.08)] ${className}`}
  >
    <div className="absolute inset-px rounded-[calc(1rem-1px)] bg-gradient-to-br from-emerald-300/5 via-cyan-300/5 to-indigo-300/5 pointer-events-none" />
    {children}
  </motion.div>
);

const LabelCaps = ({ children, required }) => (
  <div className="flex items-center gap-2 mb-1">
    <span className="text-[11px] tracking-[0.25em] uppercase text-emerald-300/70">{children}</span>
    {required ? <span className="text-emerald-300/80">*</span> : null}
  </div>
);

const InputField = ({ label, icon, value, onChange, name, type = "text", required = false, error }) => (
  <div className="relative">
    <LabelCaps required={required}>{label}</LabelCaps>
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center text-emerald-300/80 pointer-events-none">
        {icon}
      </div>
      <motion.input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        whileFocus={{ scale: 1.01 }}
        className={`w-full pl-10 pr-3 py-3 rounded-xl outline-none text-white/90
        bg-gradient-to-br from-slate-900/70 to-slate-900/30 border border-emerald-400/20
        focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400/50 transition
        ${error ? "border-red-400/70 ring-1 ring-red-500/60" : ""}`}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl"
        initial={false}
        animate={{
          boxShadow: [
            "0 0 0px rgba(16,185,129,0)",
            "0 0 16px rgba(16,185,129,0.25)",
            "0 0 0px rgba(16,185,129,0)",
          ],
        }}
        transition={{ duration: 2.2, repeat: Infinity }}
      />
    </div>
  </div>
);

const BadgeStat = ({ icon, label, value }) => (
  <div className="rounded-xl px-3 py-2 text-center border border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 to-emerald-400/5 text-emerald-200">
    <div className="flex items-center gap-1 justify-center text-xs opacity-80">
      {icon}
      <span>{label}</span>
    </div>
    <div className="font-semibold text-sm">{value}</div>
  </div>
);

const NeonDivider = () => (
  <div className="relative w-full my-4">
    <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
    <motion.div
      className="absolute -top-[3px] left-0 h-[7px] w-16 rounded-full bg-emerald-400/60 blur-md"
      animate={{ left: ["0%", "100%"] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

/* =========================== MAIN COMPONENT ============================ */

const UserInvesterPassword = () => {
  const [passwords, setPasswords] = useState({
    new: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const loggedUser = useSelector((store) => store.user.loggedUser);
  
  const [currentAccount, setCurrentAccount] = useState(
    loggedUser.accounts[0] || "000"
  );

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setError("");
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?]).{8,}$/;
    return passwordRegex.test(password);
  };

  const customContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Withdrawal Request Confirmation - Arena Trade</title>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 5px;
          background-color: #ffffff;
        }
        .header {
          background-color: #19422df2;
          color: #ffffff;
          padding: 20px 15px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 22px;
          letter-spacing: 1px;
        }
        .content {
          padding: 10px 20px;
        }
        .cta-button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #2d6a4f;
          color: #FFFFFF;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 10px 0;
        }
        .footer {
          background-color: #19422df2;
          color: #ffffff;
          text-align: center;
          padding: 5px 10px;
          font-size: 12px;
          border-radius: 0 0 10px 10px;
        }
        .footer-info {
          margin-top: 6px;
        }
        .footer-info a {
          color: #B6D0E2;
          text-decoration: none;
        }
        .withdrawal-details {
          background-color: #f8f8f8;
          border-left: 4px solid #2d6a4f;
          padding: 15px;
          margin: 20px 0;
        }
        .withdrawal-details p {
          margin: 5px 0;
        }
        .highlight {
          font-weight: bold;
          color: #0a2342;
        }
        .risk-warning {
          color: #C70039;
          padding: 5px;
          font-size: 12px;
          line-height: 1.4;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Investor Password Updated</h1>
        </div>
        <div class="content">
          <p>Dear ${loggedUser?.firstName + " " + loggedUser?.lastName},</p>
          <p>Your account's investor password has been successfully updated.</p>
          <div class="withdrawal-details">
            <p>Account No: <span class="highlight">${currentAccount.accountNumber}</span></p>
            <p>Old password: <span class="highlight">${currentAccount.investorPassword}</span></p>
            <p>New password: <span class="highlight">${passwords.confirm}</span></p>
          </div>
          <p>Thank you for choosing us.</p>
          <p>Happy trading!</p>
          <p>Best regards,<br>${import.meta.env.VITE_WEBSITE_NAME} Team</p>
          <hr>
          <div class="risk-warning">
            <strong>Risk Warning:</strong> Trading CFDs carries high risk and may result in losses beyond your initial investment. Trade only with money you can afford to lose and understand the risks.  
            <br><br>
            ${import.meta.env.VITE_WEBSITE_NAME} Trade’s services are not for U.S. citizens or in jurisdictions where they violate local laws.
          </div>
        </div>
        <div class="footer">
          <div class="footer-info">
            <p>Website: <a href="https://${import.meta.env.VITE_EMAIL_WEBSITE}"> ${
    import.meta.env.VITE_EMAIL_WEBSITE
  } </a> | E-mail: <a href="mailto:${import.meta.env.VITE_EMAIL_EMAIL || ""}">${
    import.meta.env.VITE_EMAIL_EMAIL || ""
  }</a></p>
            <p>© 2025 ${import.meta.env.VITE_WEBSITE_NAME || ""}. All Rights Reserved</p>
          </div>
        </div>
      </div>
    </body>
    </html>`;

  const handleSubmit = async (e) => {
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
        `/server-master-password-change?Account=${currentAccount.accountNumber}&password=${passwords.confirm}`
      );

      const backendRes = await backendApi.post(`/update-investor-password`, {
        userId: loggedUser._id,
        accountId: currentAccount._id,
        newPassword: passwords.confirm,
      });
      console.log("backendRes--", backendRes);

      await backendApi.post(`/custom-mail`, {
        email: loggedUser.email,
        content: customContent,
        subject: "Investor Password Changed",
      });

      toast.success(res.data.MESSAGE, { id: toastId });
      navigate("/user/dashboard");
    } catch (error) {
      toast.error("An error occurred. Please try again.", { id: toastId });
    } finally {
      setIsLoading(false);
    }

    setPasswords({ new: "", confirm: "" });
    setError("");
  };

  const fields = [
    { name: "new", label: "New Investor Password" },
    { name: "confirm", label: "Confirm Investor Password" },
  ];

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatedGrid />
      <FloatingParticles />
      <FloatingOrbs />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 md:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="text-emerald-400" size={20} />
              <span className="uppercase tracking-[0.25em] text-xs text-emerald-400/80 font-semibold">
                security · view-only · shield
              </span>
            </div>
            <motion.div
              className="inline-block"
              initial={{ scale: 0.98, rotateX: 10, opacity: 0 }}
              animate={{ scale: 1, rotateX: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <ModernHeading text="Change Investor Password" />
            </motion.div>
          </div>

          {/* Account Select */}
          <div className="md:w-64">
            {loggedUser?.accounts.length > 0 && (
              <div>
                <LabelCaps required>Select Account</LabelCaps>
                <div className="relative">
                  <select
                    onChange={(e) => {
                      const selectedValue = loggedUser.accounts?.find(
                        (value) => value.accountNumber === e.target.value
                      );
                      setCurrentAccount(selectedValue);
                    }}
                    id="accountNumber"
                    name="accountNumber"
                    className="w-full py-2.5 text-sm rounded-xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-emerald-400/30 text-white/90 px-3 outline-none focus:ring-2 focus:ring-emerald-400/40"
                  >
                    <option
                      disabled
                      className="bg-slate-900 text-gray-500"
                      value=""
                    >
                      Select Account
                    </option>
                    {loggedUser.accounts?.map((value, index) => (
                      <option
                        key={index}
                        className="bg-slate-900 font-semibold text-white"
                        value={value.accountNumber}
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
          <GlassCard className="p-6 lg:col-span-1">
            <div className="relative flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl border border-emerald-400/40 bg-gradient-to-br from-emerald-400/20 via-cyan-400/20 to-indigo-400/20 grid place-items-center shadow-[0_0_40px_rgba(16,185,129,0.35)]">
                  <Lock className="text-emerald-300" size={22} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-300/70">
                    active account
                  </p>
                  <p className="text-sm text-emerald-100/90 font-mono">
                    {currentAccount?.accountNumber || "—"}
                  </p>
                </div>
              </div>

              <NeonDivider />

              <div className="space-y-2 text-sm">
                <p className="text-slate-300/80">
                  You’re updating the{" "}
                  <span className="text-emerald-300 font-semibold">
                    investor password
                  </span>{" "}
                  for this account.
                </p>
                <p className="text-slate-400 text-xs">
                  Investor password is typically <span className="font-semibold">read-only</span>,
                  ideal for sharing with auditors, partners, or monitoring tools.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-3">
                <BadgeStat
                  icon={<Shield size={14} />}
                  label="Access"
                  value="View-only"
                />
                <BadgeStat
                  icon={<CheckCircle size={14} />}
                  label="Status"
                  value="Active"
                />
                <BadgeStat
                  icon={<Lock size={14} />}
                  label="Mode"
                  value="Investor"
                />
              </div>
            </div>
          </GlassCard>

          {/* Right: Form */}
          <GlassCard className="p-6 lg:col-span-2">
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { staggerChildren: 0.04 },
                },
              }}
            >
              <div className="grid grid-cols-1 gap-5">
                {fields.map((field, idx) => (
                  <motion.div
                    key={field.name}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <InputField
                      label={field.label}
                      icon={<Lock size={16} />}
                      type="password"
                      name={field.name}
                      value={passwords[field.name]}
                      onChange={handleChange}
                      required
                      error={!!error}
                    />
                  </motion.div>
                ))}
              </div>

              {error && (
                <motion.div
                  className="text-red-400 flex items-center mt-1 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="mr-2" size={18} />
                  {error}
                </motion.div>
              )}

              <div className="flex flex-col-reverse gap-4 sm:flex-row justify-between items-center pt-2">
                <Link
                  to={"/user/dashboard"}
                  type="button"
                  className="w-full text-center sm:w-auto px-8 py-2.5 rounded-full border border-red-400/40 bg-red-500/10 text-red-100 hover:bg-red-500/20 hover:border-red-400/70 transition"
                >
                  Cancel
                </Link>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={isLoading}
                className="relative group inline-flex items-center gap-2 px-10 py-2.5 rounded-full font-semibold text-black
                  bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400
                  shadow-[0_10px_40px_rgba(16,185,129,0.35)] disabled:opacity-70"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <CheckCircle size={18} />
                  {isLoading ? "Updating…" : "Change Password"}
                </span>
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                  bg-[radial-gradient(120%_120%_at_50%_10%,rgba(255,255,255,0.35),transparent_40%)]"
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
                    className="h-1 w-52 rounded-full bg-emerald-500/20 overflow-hidden"
                    animate={{}}
                  >
                    <motion.div
                      className="h-full w-1/3 bg-emerald-400"
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

export default UserInvesterPassword;
