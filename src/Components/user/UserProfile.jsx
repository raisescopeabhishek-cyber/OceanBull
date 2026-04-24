import React, { useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Flag,
  Globe2,
  Hash,
  Home,
  IdCard,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  UserCog,
  Wallet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import UseUserHook from "../../hooks/user/UseUserHook";
import { userApi } from "../../utils/apiClients";

/* -------------------- helpers -------------------- */
const cx = (...classes) => classes.filter(Boolean).join(" ");

const getInitials = (firstName = "", lastName = "", email = "") => {
  const name = `${firstName || ""} ${lastName || ""}`.trim();

  if (name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase())
      .join("");
  }

  return email ? email[0]?.toUpperCase() : "U";
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getCompletion = (formData) => {
  const keys = [
    "firstName",
    "lastName",
    "email",
    "mobileNumber",
    "address",
    "state",
    "zipCode",
    "city",
    "country",
  ];

  const filled = keys.filter((key) => String(formData?.[key] || "").trim()).length;
  return Math.round((filled / keys.length) * 100);
};

/* -------------------- pattern theme helpers -------------------- */
const getPatternTheme = (isDark) => {
  if (isDark) {
    return {
      shell: "border-white/10 bg-white/[0.035] shadow-[0_20px_70px_rgba(0,0,0,0.45)]",
      card: "border-white/10 bg-white/[0.045] shadow-[0_25px_80px_rgba(0,0,0,0.35)]",
      cardSoft: "border-white/10 bg-white/[0.035]",
      input: "border-white/10 bg-white/[0.045] text-white placeholder:text-white/25",
      text: "text-white",
      muted: "text-white/55",
      faint: "text-white/35",
      accentText: "text-blue-300",
      accentTextStrong: "text-cyan-300",
      accentBg: "bg-blue-500/10",
      accentBorder: "border-blue-400/20",
      successText: "text-emerald-300",
      successBg: "bg-emerald-500/10",
      successBorder: "border-emerald-400/20",
      warningText: "text-amber-300",
      warningBg: "bg-amber-500/10",
      warningBorder: "border-amber-400/20",
      topLine: "bg-gradient-to-r from-transparent via-blue-300/30 to-transparent",
      divider: "bg-gradient-to-r from-transparent via-white/20 to-transparent",
      heroBg:
        "bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]",
      panelBg:
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]",
      glowOne: "bg-blue-500/10",
      glowTwo: "bg-cyan-400/10",
      button:
        "bg-blue-500 text-white hover:bg-blue-400 shadow-[0_18px_45px_rgba(59,130,246,0.22)]",
      buttonDisabled: "bg-slate-500 text-white/70",
      progress: "bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300",
      progressTrack: "bg-white/10",
    };
  }

  return {
    shell: "border-orange-100/80 bg-white/60 shadow-[0_16px_50px_rgba(251,146,60,0.10)]",
    card: "border-orange-100/80 bg-white/75 shadow-[0_20px_60px_rgba(251,146,60,0.10)]",
    cardSoft: "border-orange-100/80 bg-white/70",
    input: "border-orange-100 bg-white/85 text-slate-900 placeholder:text-slate-400",
    text: "text-slate-900",
    muted: "text-slate-600",
    faint: "text-slate-500",
    accentText: "text-orange-700",
    accentTextStrong: "text-orange-600",
    accentBg: "bg-orange-50",
    accentBorder: "border-orange-200",
    successText: "text-emerald-700",
    successBg: "bg-emerald-50",
    successBorder: "border-emerald-200",
    warningText: "text-amber-700",
    warningBg: "bg-amber-50",
    warningBorder: "border-amber-200",
    topLine: "bg-gradient-to-r from-transparent via-orange-300/70 to-transparent",
    divider: "bg-gradient-to-r from-transparent via-orange-200 to-transparent",
    heroBg:
      "bg-[linear-gradient(135deg,rgba(255,255,255,0.85),rgba(255,247,240,0.80))]",
    panelBg: "bg-white/45",
    glowOne: "bg-orange-300/20",
    glowTwo: "bg-amber-200/25",
    button:
      "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_18px_45px_rgba(251,146,60,0.25)]",
    buttonDisabled: "bg-slate-300 text-slate-600",
    progress: "bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500",
    progressTrack: "bg-orange-100",
  };
};

/* -------------------- shared ui -------------------- */
const PatternCard = ({ children, className = "", isDark, hover = false }) => {
  const t = getPatternTheme(isDark);

  return (
    <motion.div
      whileHover={hover ? { y: -3 } : undefined}
      className={cx(
        "relative overflow-hidden rounded-[30px] border backdrop-blur-xl transition-all duration-300",
        t.card,
        className
      )}
    >
      <div className={cx("pointer-events-none absolute inset-x-0 top-0 h-px", t.topLine)} />

      <div
        aria-hidden
        className={cx(
          "pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl",
          t.glowOne
        )}
      />

      <div
        aria-hidden
        className={cx(
          "pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full blur-3xl",
          t.glowTwo
        )}
      />

      <div className="relative z-[1]">{children}</div>
    </motion.div>
  );
};

const SoftPanel = ({ children, className = "", isDark }) => {
  const t = getPatternTheme(isDark);

  return (
    <div
      className={cx(
        "rounded-[24px] border backdrop-blur-md transition-all duration-300",
        t.cardSoft,
        className
      )}
    >
      {children}
    </div>
  );
};

const IconBox = ({ children, isDark, tint = "accent", className = "" }) => {
  const t = getPatternTheme(isDark);

  const tone =
    tint === "success"
      ? `${t.successBg} ${t.successText} ${t.successBorder}`
      : tint === "warning"
      ? `${t.warningBg} ${t.warningText} ${t.warningBorder}`
      : `${t.accentBg} ${t.accentText} ${t.accentBorder}`;

  return (
    <div
      className={cx(
        "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border",
        tone,
        className
      )}
    >
      {children}
    </div>
  );
};

const SectionTitle = ({ isDark, icon, eyebrow, title, subtitle }) => {
  const t = getPatternTheme(isDark);

  return (
    <div className="flex items-start gap-3">
      <IconBox isDark={isDark}>{icon}</IconBox>

      <div className="min-w-0">
        {eyebrow ? (
          <p
            className={cx(
              "text-[11px] font-semibold uppercase tracking-[0.22em]",
              t.accentText
            )}
          >
            {eyebrow}
          </p>
        ) : null}

        <h2
          className={cx("mt-1 text-xl font-bold tracking-tight", t.text)}
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {title}
        </h2>

        {subtitle ? (
          <p className={cx("mt-1 text-sm leading-6", t.muted)}>{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
};

const StatusPill = ({ isDark, icon, label, tint = "accent" }) => {
  const t = getPatternTheme(isDark);

  const tone =
    tint === "success"
      ? `${t.successBg} ${t.successText} ${t.successBorder}`
      : tint === "warning"
      ? `${t.warningBg} ${t.warningText} ${t.warningBorder}`
      : `${t.accentBg} ${t.accentText} ${t.accentBorder}`;

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]",
        tone
      )}
    >
      {icon}
      {label}
    </span>
  );
};

const MiniMetric = ({ isDark, icon, label, value, tint = "accent" }) => {
  const t = getPatternTheme(isDark);

  return (
    <SoftPanel isDark={isDark} className="p-4">
      <div className="flex items-center gap-3">
        <IconBox isDark={isDark} tint={tint} className="h-10 w-10 rounded-xl">
          {icon}
        </IconBox>

        <div className="min-w-0">
          <p className={cx("text-xs", t.muted)}>{label}</p>
          <p className={cx("mt-1 truncate text-base font-bold", t.text)}>{value}</p>
        </div>
      </div>
    </SoftPanel>
  );
};

const NeonDivider = ({ isDark }) => {
  const t = getPatternTheme(isDark);

  return (
    <div className="relative my-5 w-full">
      <div className={cx("h-px w-full", t.divider)} />
    </div>
  );
};

/* -------------------- form controls -------------------- */
const LabelCaps = ({ isDark, children, required }) => {
  const t = getPatternTheme(isDark);

  return (
    <div className="mb-2 flex items-center gap-2">
      <span className={cx("text-[11px] font-semibold uppercase tracking-[0.22em]", t.accentText)}>
        {children}
      </span>
      {required ? <span className={t.accentTextStrong}>*</span> : null}
    </div>
  );
};

const InputField = ({
  isDark,
  label,
  icon,
  value,
  onChange,
  name,
  required = false,
  placeholder,
  readOnly = false,
}) => {
  const t = getPatternTheme(isDark);

  return (
    <div className="relative">
      <LabelCaps isDark={isDark} required={required}>
        {label}
      </LabelCaps>

      <div className="group relative">
        <div
          className={cx(
            "pointer-events-none absolute inset-y-0 left-3 flex items-center",
            readOnly ? t.faint : t.accentText
          )}
        >
          {icon}
        </div>

        <motion.input
          type="text"
          name={name}
          value={value ?? ""}
          onChange={onChange}
          required={required}
          readOnly={readOnly}
          placeholder={placeholder}
          whileFocus={readOnly ? undefined : { scale: 1.01 }}
          className={cx(
            "w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none transition-all duration-300",
            t.input,
            readOnly && "cursor-not-allowed opacity-80",
            !readOnly &&
              (isDark
                ? "focus:border-blue-300/40 focus:bg-white/[0.06]"
                : "focus:border-orange-300 focus:bg-white")
          )}
        />

        {readOnly ? (
          <div
            className={cx(
              "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
              isDark ? "bg-white/5 text-white/35" : "bg-orange-50 text-slate-500"
            )}
          >
            locked
          </div>
        ) : null}
      </div>
    </div>
  );
};

const MetaRow = ({ isDark, label, value }) => {
  const t = getPatternTheme(isDark);

  return (
    <div
      className={cx(
        "flex items-start justify-between gap-4 rounded-2xl border px-4 py-3",
        t.cardSoft
      )}
    >
      <span className={cx("text-xs uppercase tracking-[0.18em]", t.faint)}>
        {label}
      </span>
      <span className={cx("max-w-[190px] break-words text-right text-sm font-semibold", t.text)}>
        {value}
      </span>
    </div>
  );
};

/* -------------------- main component -------------------- */
const UserProfile = () => {
  const loggedUser = useSelector((store) => store?.user?.loggedUser) || {};
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";
  const t = getPatternTheme(isDark);

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

  const fullName =
    `${formData.firstName || ""} ${formData.lastName || ""}`.trim() ||
    loggedUser?.username ||
    "User";

  const initials = getInitials(formData.firstName, formData.lastName, formData.email);
  const completion = useMemo(() => getCompletion(formData), [formData]);

  const profileStats = [
    {
      label: "Profile Score",
      value: `${completion}%`,
      icon: <BadgeCheck size={17} />,
      tint: "success",
    },
    {
      label: "User Status",
      value: loggedUser?.status || "Active",
      icon: <ShieldCheck size={17} />,
      tint: "accent",
    },
    {
      label: "Joined",
      value: formatDate(loggedUser?.createdAt),
      icon: <CalendarDays size={17} />,
      tint: "warning",
    },
  ];

  const fields = [
    {
      section: "Identity Details",
      icon: <CircleUserRound size={18} />,
      description: "Your basic profile information visible across your account.",
      items: [
        {
          name: "firstName",
          label: "First Name",
          icon: <User size={16} />,
          required: true,
          placeholder: "Enter first name",
        },
        {
          name: "lastName",
          label: "Last Name",
          icon: <User size={16} />,
          required: true,
          placeholder: "Enter last name",
        },
        {
          name: "email",
          label: "E-mail Address",
          icon: <Mail size={16} />,
          readOnly: true,
        },
        {
          name: "mobileNumber",
          label: "Mobile Number",
          icon: <Phone size={16} />,
          readOnly: true,
        },
      ],
    },
    {
      section: "Location Details",
      icon: <MapPin size={18} />,
      description: "Keep your billing and residential information updated.",
      items: [
        {
          name: "address",
          label: "Address",
          icon: <Home size={16} />,
          placeholder: "Enter address",
        },
        {
          name: "state",
          label: "State",
          icon: <Building2 size={16} />,
          placeholder: "Enter state",
        },
        {
          name: "zipCode",
          label: "Zip Code",
          icon: <Hash size={16} />,
          placeholder: "Enter zip code",
        },
        {
          name: "city",
          label: "City",
          icon: <MapPin size={16} />,
          placeholder: "Enter city",
        },
        {
          name: "country",
          label: "Country",
          icon: <Flag size={16} />,
          readOnly: true,
        },
      ],
    },
  ];

  const securityItems = [
    {
      label: "Email Access",
      value: formData.email ? "Connected" : "Missing",
      icon: <Mail size={16} />,
      tint: formData.email ? "success" : "warning",
    },
    {
      label: "Phone Access",
      value: formData.mobileNumber ? "Connected" : "Missing",
      icon: <Phone size={16} />,
      tint: formData.mobileNumber ? "success" : "warning",
    },
    {
      label: "Country Lock",
      value: formData.country || "Not set",
      icon: <Globe2 size={16} />,
      tint: "accent",
    },
    {
      label: "User ID",
      value: loggedUser?._id ? "Available" : "Pending",
      icon: <IdCard size={16} />,
      tint: loggedUser?._id ? "accent" : "warning",
    },
  ];

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

    const toastID = toast.loading("Updating profile...");
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

      toast.success("Profile updated successfully.", { id: toastID });
      getUpdateLoggedUser();
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("Update failed. Try again.", { id: toastID });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="relative overflow-hidden rounded-[28px]">
        <div
          aria-hidden
          className={cx(
            "pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full blur-3xl",
            t.glowOne
          )}
        />

        <div
          aria-hidden
          className={cx(
            "pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl",
            t.glowTwo
          )}
        />

        {isDark ? (
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.10]"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
        ) : (
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.50]"
            aria-hidden
            style={{
              background:
                "radial-gradient(circle at 15% 20%, rgba(251,146,60,0.12), transparent 24%), radial-gradient(circle at 85% 0%, rgba(255,255,255,0.85), transparent 30%)",
            }}
          />
        )}

        <div className="relative z-[1] space-y-6 p-3 sm:p-4 md:p-5">
          {/* Top hero */}
          <PatternCard isDark={isDark} className="p-5 sm:p-6 lg:p-7">
            <div className={cx("absolute inset-0 pointer-events-none", t.heroBg)} />

            <div className="relative z-[1] flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles size={18} className={t.accentTextStrong} />
                  <span
                    className={cx(
                      "text-[11px] font-semibold uppercase tracking-[0.25em]",
                      t.accentText
                    )}
                  >
                    account · identity · profile
                  </span>
                </div>

                <h1
                  className={cx("text-3xl font-bold tracking-tight sm:text-4xl", t.text)}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Profile Control Center
                </h1>

                <p className={cx("mt-3 max-w-2xl text-sm leading-6 sm:text-[15px]", t.muted)}>
                  Update your personal information, check account security status,
                  and keep your profile details synced with your trading account.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                {profileStats.map((item) => (
                  <MiniMetric
                    key={item.label}
                    isDark={isDark}
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                    tint={item.tint}
                  />
                ))}
              </div>
            </div>
          </PatternCard>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
            {/* Left profile rail */}
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="space-y-6"
            >
              <PatternCard isDark={isDark} className="overflow-hidden">
                <div className={cx("relative px-6 py-7 text-center", t.heroBg)}>
                  <div className={cx("absolute inset-x-0 top-0 h-px", t.topLine)} />

                  <motion.div
                    className={cx(
                      "mx-auto grid h-32 w-32 place-items-center rounded-[34px] border text-4xl font-black",
                      isDark
                        ? "border-blue-300/25 bg-blue-500/10 text-blue-200 shadow-[0_0_70px_rgba(59,130,246,0.18)]"
                        : "border-orange-200 bg-orange-50 text-orange-700 shadow-[0_0_70px_rgba(251,146,60,0.16)]"
                    )}
                    whileHover={{ scale: 1.03, rotate: 1 }}
                    transition={{ type: "spring", stiffness: 180, damping: 16 }}
                  >
                    {initials}
                  </motion.div>

                  <h2
                    className={cx("mt-5 truncate text-2xl font-bold", t.text)}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {fullName}
                  </h2>

                  <p className={cx("mt-1 truncate font-mono text-sm", t.accentText)}>
                    {formData.email || "No email available"}
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <StatusPill
                      isDark={isDark}
                      icon={<CheckCircle2 size={13} />}
                      label="Verified"
                      tint="success"
                    />
                    <StatusPill
                      isDark={isDark}
                      icon={<Shield size={13} />}
                      label="Secure"
                      tint="accent"
                    />
                  </div>
                </div>

                <div className="p-6">
                  <SoftPanel isDark={isDark} className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className={cx("text-sm font-semibold", t.text)}>
                        Profile Completion
                      </p>
                      <p className={cx("text-sm font-bold", t.accentTextStrong)}>
                        {completion}%
                      </p>
                    </div>

                    <div className={cx("h-2 overflow-hidden rounded-full", t.progressTrack)}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completion}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className={cx("h-full rounded-full", t.progress)}
                      />
                    </div>

                    <p className={cx("mt-3 text-xs leading-5", t.muted)}>
                      Complete your personal and location details to keep your account
                      profile clean and up to date.
                    </p>
                  </SoftPanel>

                  <NeonDivider isDark={isDark} />

                  <div className="grid grid-cols-1 gap-3">
                    {securityItems.map((item) => (
                      <div
                        key={item.label}
                        className={cx(
                          "flex items-center justify-between gap-3 rounded-2xl border p-3",
                          t.cardSoft
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <IconBox
                            isDark={isDark}
                            tint={item.tint}
                            className="h-9 w-9 rounded-xl"
                          >
                            {item.icon}
                          </IconBox>

                          <div className="min-w-0">
                            <p className={cx("text-xs", t.muted)}>{item.label}</p>
                            <p className={cx("truncate text-sm font-semibold", t.text)}>
                              {item.value}
                            </p>
                          </div>
                        </div>

                        <ChevronRight size={16} className={t.faint} />
                      </div>
                    ))}
                  </div>
                </div>
              </PatternCard>

              <PatternCard isDark={isDark} className="p-5">
                <SectionTitle
                  isDark={isDark}
                  icon={<Wallet size={18} />}
                  eyebrow="account snapshot"
                  title="Profile Meta"
                  subtitle="Basic locked metadata from your account session."
                />

                <div className="mt-5 space-y-3">
                  <MetaRow
                    isDark={isDark}
                    label="User ID"
                    value={loggedUser?._id || "Not available"}
                  />
                  <MetaRow
                    isDark={isDark}
                    label="Username"
                    value={loggedUser?.username || "Not available"}
                  />
                  <MetaRow
                    isDark={isDark}
                    label="Last Updated"
                    value={formatDate(loggedUser?.updatedAt)}
                  />
                </div>
              </PatternCard>
            </motion.div>

            {/* Right form area */}
            <motion.div
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <PatternCard isDark={isDark} className="overflow-hidden">
                <div className={cx("border-b px-5 py-5 sm:px-6", isDark ? "border-white/10" : "border-orange-100/80")}>
                  <SectionTitle
                    isDark={isDark}
                    icon={<UserCog size={18} />}
                    eyebrow="editable information"
                    title="Update Personal Profile"
                    subtitle="Email, phone, and country are locked. You can update name and address details."
                  />
                </div>

                <form onSubmit={handleSubmit} className="p-5 sm:p-6">
                  <div className="space-y-7">
                    {fields.map((section, sectionIndex) => (
                      <motion.div
                        key={section.section}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: sectionIndex * 0.08 }}
                      >
                        <div className="mb-4 flex items-start gap-3">
                          <IconBox
                            isDark={isDark}
                            tint={sectionIndex === 0 ? "accent" : "success"}
                          >
                            {section.icon}
                          </IconBox>

                          <div>
                            <h3
                              className={cx("text-lg font-semibold", t.text)}
                              style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                              {section.section}
                            </h3>
                            <p className={cx("mt-1 text-sm", t.muted)}>
                              {section.description}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          {section.items.map((field) => (
                            <InputField
                              key={field.name}
                              isDark={isDark}
                              label={field.label}
                              icon={field.icon}
                              value={formData[field.name]}
                              onChange={handleInputChange}
                              name={field.name}
                              required={field.required}
                              readOnly={field.readOnly}
                              placeholder={field.placeholder}
                            />
                          ))}
                        </div>

                        {sectionIndex !== fields.length - 1 ? (
                          <NeonDivider isDark={isDark} />
                        ) : null}
                      </motion.div>
                    ))}
                  </div>

                  <div
                    className={cx(
                      "mt-8 flex flex-col gap-4 rounded-[24px] border p-4 sm:flex-row sm:items-center sm:justify-between",
                      isDark
                        ? "border-white/10 bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(255,255,255,0.03),rgba(34,211,238,0.08))]"
                        : "border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(255,255,255,0.78),rgba(254,243,199,0.75))]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <IconBox isDark={isDark} tint="success">
                        <LockKeyhole size={18} />
                      </IconBox>

                      <div>
                        <p className={cx("text-sm font-semibold", t.text)}>
                          Secure profile update
                        </p>
                        <p className={cx("mt-1 max-w-xl text-xs leading-5", t.muted)}>
                          Changes will be saved to your account and synced after the
                          update completes.
                        </p>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: isLoading ? 1 : 1.03 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      disabled={isLoading}
                      className={cx(
                        "relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-bold transition disabled:cursor-not-allowed",
                        isLoading ? t.buttonDisabled : t.button
                      )}
                    >
                      {isLoading ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Save size={17} />
                      )}
                      {isLoading ? "Updating..." : "Save Changes"}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {isLoading ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="mt-5 flex justify-center"
                      >
                        <div
                          className={cx("h-1.5 w-64 overflow-hidden rounded-full", t.progressTrack)}
                        >
                          <motion.div
                            className={cx("h-full w-1/3 rounded-full", t.progress)}
                            animate={{ x: ["-100%", "320%"] }}
                            transition={{
                              duration: 1.4,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </form>
              </PatternCard>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;