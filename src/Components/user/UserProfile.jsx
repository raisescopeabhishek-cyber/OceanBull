import React, { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
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
  ShieldCheck,
  User,
  UserCog,
  Wallet,
} from "lucide-react";
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

const getTheme = (isDark) => ({
  pageText: isDark ? "text-white" : "text-slate-900",
  text: isDark ? "text-white" : "text-slate-900",
  muted: isDark ? "text-white/55" : "text-slate-500",
  softText: isDark ? "text-white/70" : "text-slate-600",

  header: isDark
    ? "border-white/10 bg-[linear-gradient(135deg,rgba(30,41,59,1),rgba(15,23,42,1))] shadow-[0_18px_55px_rgba(0,0,0,0.38)]"
    : "border-orange-300/40 bg-[linear-gradient(135deg,#f97316,#ea580c)] shadow-[0_18px_45px_rgba(249,115,22,0.22)]",

  headerText: "text-white",
  headerMuted: isDark ? "text-white/65" : "text-white/80",
  headerBadge: "border-white/20 bg-white/10 text-white",
  headerIcon: "border-white/20 bg-white/10 text-white",
  headerStat: "border-white/20 bg-white/10 text-white backdrop-blur-xl",
  headerStatMuted: "text-white/75",

  card: isDark
    ? "border-white/10 bg-white/[0.045] shadow-[0_18px_55px_rgba(0,0,0,0.38)]"
    : "border-orange-100/90 bg-white/80 shadow-[0_18px_45px_rgba(251,146,60,0.12)]",

  cardSoft: isDark
    ? "border-white/10 bg-white/[0.035]"
    : "border-orange-100/80 bg-white/70",

  input: isDark
    ? "border-white/10 bg-white/[0.055] text-white placeholder:text-white/35 focus:border-blue-400/50 focus:ring-blue-400/20"
    : "border-orange-300 bg-orange-50/80 text-slate-900 placeholder:text-orange-400 shadow-[0_0_0_3px_rgba(251,146,60,0.08)] focus:border-orange-500 focus:bg-white focus:ring-orange-300/70",

  readOnlyInput: isDark
    ? "border-white/10 bg-white/[0.035] text-white/65 placeholder:text-white/25"
    : "border-orange-200 bg-orange-50/55 text-slate-600 placeholder:text-slate-400",

  iconBox: isDark
    ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
    : "border-orange-200 bg-orange-50 text-orange-600",

  badge: isDark
    ? "border-white/10 bg-white/[0.05] text-white/60"
    : "border-orange-100 bg-white/80 text-orange-600",

  successBadge: isDark
    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
    : "border-emerald-200 bg-emerald-50 text-emerald-700",

  warningBadge: isDark
    ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
    : "border-amber-200 bg-amber-50 text-amber-700",

  button: isDark
    ? "bg-blue-500 text-white hover:bg-blue-400 focus:ring-blue-400/30"
    : "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-300",

  buttonDisabled: isDark
    ? "bg-slate-600 text-white/60"
    : "bg-slate-300 text-slate-600",

  progressTrack: isDark ? "bg-white/10" : "bg-orange-100",
  progress: isDark
    ? "bg-gradient-to-r from-blue-400 to-cyan-300"
    : "bg-gradient-to-r from-orange-400 to-orange-600",
});

/* -------------------- shared ui -------------------- */
const Card = ({ children, className = "", theme }) => (
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

const HeaderCard = ({ children, className = "", theme }) => (
  <div
    className={cx(
      "relative overflow-hidden rounded-[26px] border p-5 transition-all duration-300 sm:p-6",
      theme.header,
      className
    )}
  >
    {children}
  </div>
);

const SoftCard = ({ children, className = "", theme }) => (
  <div className={cx("rounded-2xl border p-4", theme.cardSoft, className)}>
    {children}
  </div>
);

const IconBox = ({ children, theme, className = "" }) => (
  <div
    className={cx(
      "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
      theme.iconBox,
      className
    )}
  >
    {children}
  </div>
);

const HeaderIconBox = ({ children, theme }) => (
  <div
    className={cx(
      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
      theme.headerIcon
    )}
  >
    {children}
  </div>
);

const StatBox = ({ icon, label, value, theme, tone = "default" }) => {
  const toneClass =
    tone === "success"
      ? theme.successBadge
      : tone === "warning"
      ? theme.warningBadge
      : theme.badge;

  return (
    <div className={cx("rounded-2xl border px-4 py-3", theme.cardSoft)}>
      <div className="flex items-center gap-3">
        <div
          className={cx(
            "flex h-10 w-10 items-center justify-center rounded-xl border",
            toneClass
          )}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className={cx("text-xs", theme.muted)}>{label}</p>
          <p className={cx("mt-1 truncate text-base font-bold", theme.text)}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

const HeaderStatBox = ({ icon, label, value, theme }) => (
  <div className={cx("rounded-2xl border px-4 py-3", theme.headerStat)}>
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10">
        {icon}
      </div>

      <div className="min-w-0">
        <p className={cx("text-xs", theme.headerStatMuted)}>{label}</p>
        <p className="mt-1 truncate text-base font-bold text-white">{value}</p>
      </div>
    </div>
  </div>
);

const SectionHeader = ({ icon, title, subtitle, theme }) => (
  <div className="mb-5 flex items-start gap-3">
    <IconBox theme={theme}>{icon}</IconBox>

    <div>
      <h2 className={cx("text-lg font-semibold", theme.text)}>{title}</h2>
      {subtitle ? (
        <p className={cx("mt-1 text-sm leading-6", theme.muted)}>{subtitle}</p>
      ) : null}
    </div>
  </div>
);

const InputField = ({
  theme,
  label,
  icon,
  value,
  onChange,
  name,
  required = false,
  placeholder,
  readOnly = false,
}) => (
  <div>
    <label
      className={cx(
        "mb-2 block text-xs font-semibold uppercase tracking-[0.14em]",
        theme.muted
      )}
    >
      {label}
      {required ? <span className="ml-1 text-orange-500">*</span> : null}
    </label>

    <div className="relative">
      <div
        className={cx(
          "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2",
          readOnly ? theme.muted : "text-orange-500"
        )}
      >
        {icon}
      </div>

      <input
        type="text"
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        readOnly={readOnly}
        placeholder={placeholder}
        className={cx(
          "w-full rounded-2xl border py-3 pl-10 text-sm outline-none transition-all duration-200 focus:ring-4",
          readOnly ? "pr-20" : "pr-4",
          readOnly ? theme.readOnlyInput : theme.input,
          readOnly && "cursor-not-allowed"
        )}
      />

      {readOnly ? (
        <span
          className={cx(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
            theme.badge
          )}
        >
          locked
        </span>
      ) : null}
    </div>
  </div>
);

const InfoRow = ({ label, value, theme }) => (
  <div
    className={cx(
      "flex items-start justify-between gap-4 rounded-2xl border px-4 py-3",
      theme.cardSoft
    )}
  >
    <span className={cx("text-xs uppercase tracking-[0.14em]", theme.muted)}>
      {label}
    </span>
    <span
      className={cx(
        "max-w-[190px] break-words text-right text-sm font-semibold",
        theme.text
      )}
    >
      {value}
    </span>
  </div>
);

/* -------------------- main component -------------------- */
const UserProfile = () => {
  const loggedUser = useSelector((store) => store?.user?.loggedUser) || {};
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";
  const theme = useMemo(() => getTheme(isDark), [isDark]);

  const [formData, setFormData] = useState({
    firstName: loggedUser.firstName || "",
    lastName: loggedUser.lastName || "",
    email: loggedUser.email || "",
    mobileNumber: loggedUser.phone || loggedUser.mobileNumber || "",
    address: loggedUser.address || "",
    state: loggedUser.state || "",
    zipCode: loggedUser.zipCode || "",
    city: loggedUser.city || "",
    country: loggedUser.country || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const { getUpdateLoggedUser } = UseUserHook();

  useEffect(() => {
    setFormData({
      firstName: loggedUser.firstName || "",
      lastName: loggedUser.lastName || "",
      email: loggedUser.email || "",
      mobileNumber: loggedUser.phone || loggedUser.mobileNumber || "",
      address: loggedUser.address || "",
      state: loggedUser.state || "",
      zipCode: loggedUser.zipCode || "",
      city: loggedUser.city || "",
      country: loggedUser.country || "",
    });
  }, [loggedUser]);

  const fullName =
    `${formData.firstName || ""} ${formData.lastName || ""}`.trim() ||
    loggedUser?.username ||
    "User";

  const initials = getInitials(
    formData.firstName,
    formData.lastName,
    formData.email
  );

  const completion = useMemo(() => getCompletion(formData), [formData]);

  const profileStats = [
    {
      label: "Profile Score",
      value: `${completion}%`,
      icon: <BadgeCheck size={17} />,
      tone: "success",
    },
    {
      label: "User Status",
      value: loggedUser?.status || "Active",
      icon: <ShieldCheck size={17} />,
      tone: "default",
    },
    {
      label: "Joined",
      value: formatDate(loggedUser?.createdAt),
      icon: <CalendarDays size={17} />,
      tone: "warning",
    },
  ];

  const fields = [
    {
      section: "Identity Details",
      icon: <CircleUserRound size={18} />,
      description: "Basic profile information linked with your account.",
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
      tone: formData.email ? "success" : "warning",
    },
    {
      label: "Phone Access",
      value: formData.mobileNumber ? "Connected" : "Missing",
      icon: <Phone size={16} />,
      tone: formData.mobileNumber ? "success" : "warning",
    },
    {
      label: "Country",
      value: formData.country || "Not set",
      icon: <Globe2 size={16} />,
      tone: "default",
    },
    {
      label: "User ID",
      value: loggedUser?._id ? "Available" : "Pending",
      icon: <IdCard size={16} />,
      tone: loggedUser?._id ? "default" : "warning",
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
    <div className={cx("w-full space-y-5", theme.pageText)}>
      {/* Header */}
      <HeaderCard theme={theme}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(circle at top left, rgba(59,130,246,0.20), transparent 36%), radial-gradient(circle at bottom right, rgba(34,211,238,0.10), transparent 32%)"
              : "radial-gradient(circle at top left, rgba(255,255,255,0.20), transparent 30%), radial-gradient(circle at bottom right, rgba(255,237,213,0.22), transparent 36%)",
          }}
        />

        <div className="relative z-[1] flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <HeaderIconBox theme={theme}>
              <UserCog className="h-6 w-6" />
            </HeaderIconBox>

            <div>
              <div
                className={cx(
                  "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                  theme.headerBadge
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Account Profile
              </div>

              <h1 className={cx("text-2xl font-bold tracking-tight sm:text-3xl", theme.headerText)}>
                Profile Settings
              </h1>

              <p className={cx("mt-2 max-w-2xl text-sm leading-6", theme.headerMuted)}>
                Update your personal information and review your account security details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
            {profileStats.map((item) => (
              <HeaderStatBox
                key={item.label}
                theme={theme}
                icon={item.icon}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
        </div>
      </HeaderCard>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        {/* Left Profile Summary */}
        <div className="space-y-5">
          <Card theme={theme} className="text-center">
            <div
              className={cx(
                "mx-auto flex h-28 w-28 items-center justify-center rounded-[30px] border text-4xl font-black",
                theme.iconBox
              )}
            >
              {initials}
            </div>

            <h2 className={cx("mt-5 truncate text-2xl font-bold", theme.text)}>
              {fullName}
            </h2>

            <p className={cx("mt-1 truncate font-mono text-sm", theme.muted)}>
              {formData.email || "No email available"}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
                  theme.successBadge
                )}
              >
                <CheckCircle2 size={14} />
                Verified
              </span>

              <span
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
                  theme.badge
                )}
              >
                <LockKeyhole size={14} />
                Secure
              </span>
            </div>

            <SoftCard theme={theme} className="mt-5 text-left">
              <div className="mb-2 flex items-center justify-between">
                <p className={cx("text-sm font-semibold", theme.text)}>
                  Profile Completion
                </p>
                <p className="text-sm font-bold text-orange-500">{completion}%</p>
              </div>

              <div className={cx("h-2 overflow-hidden rounded-full", theme.progressTrack)}>
                <div
                  className={cx("h-full rounded-full transition-all duration-500", theme.progress)}
                  style={{ width: `${completion}%` }}
                />
              </div>

              <p className={cx("mt-3 text-xs leading-5", theme.muted)}>
                Complete your personal and location details to keep your profile updated.
              </p>
            </SoftCard>
          </Card>

          <Card theme={theme}>
            <SectionHeader
              theme={theme}
              icon={<ShieldCheck size={18} />}
              title="Security Details"
              subtitle="Locked account information and verification status."
            />

            <div className="space-y-3">
              {securityItems.map((item) => {
                const badgeClass =
                  item.tone === "success"
                    ? theme.successBadge
                    : item.tone === "warning"
                    ? theme.warningBadge
                    : theme.badge;

                return (
                  <div
                    key={item.label}
                    className={cx(
                      "flex items-center justify-between gap-3 rounded-2xl border p-3",
                      theme.cardSoft
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cx(
                          "flex h-9 w-9 items-center justify-center rounded-xl border",
                          badgeClass
                        )}
                      >
                        {item.icon}
                      </div>

                      <div className="min-w-0">
                        <p className={cx("text-xs", theme.muted)}>{item.label}</p>
                        <p className={cx("truncate text-sm font-semibold", theme.text)}>
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card theme={theme}>
            <SectionHeader
              theme={theme}
              icon={<Wallet size={18} />}
              title="Profile Meta"
              subtitle="Basic metadata from your account session."
            />

            <div className="space-y-3">
              <InfoRow
                theme={theme}
                label="Username"
                value={loggedUser?.username || "Not available"}
              />
              <InfoRow
                theme={theme}
                label="Last Updated"
                value={formatDate(loggedUser?.updatedAt)}
              />
            </div>
          </Card>
        </div>

        {/* Right Form */}
        <Card theme={theme}>
          <SectionHeader
            theme={theme}
            icon={<UserCog size={18} />}
            title="Update Personal Profile"
            subtitle="Email, phone, and country are locked. You can update name and address details."
          />

          <form onSubmit={handleSubmit}>
            <div className="space-y-7">
              {fields.map((section, sectionIndex) => (
                <div key={section.section}>
                  <div className="mb-4 flex items-start gap-3">
                    <IconBox theme={theme} className="h-10 w-10 rounded-xl">
                      {section.icon}
                    </IconBox>

                    <div>
                      <h3 className={cx("text-base font-semibold", theme.text)}>
                        {section.section}
                      </h3>
                      <p className={cx("mt-1 text-sm", theme.muted)}>
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {section.items.map((field) => (
                      <InputField
                        key={field.name}
                        theme={theme}
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
                    <div
                      className={cx(
                        "my-7 h-px w-full",
                        isDark ? "bg-white/10" : "bg-orange-100"
                      )}
                    />
                  ) : null}
                </div>
              ))}
            </div>

            <div
              className={cx(
                "mt-8 flex flex-col gap-4 rounded-[24px] border p-4 sm:flex-row sm:items-center sm:justify-between",
                theme.cardSoft
              )}
            >
              <div className="flex items-start gap-3">
                <IconBox theme={theme} className="h-10 w-10 rounded-xl">
                  <LockKeyhole size={18} />
                </IconBox>

                <div>
                  <p className={cx("text-sm font-semibold", theme.text)}>
                    Secure profile update
                  </p>
                  <p className={cx("mt-1 max-w-xl text-xs leading-5", theme.muted)}>
                    Changes will be saved to your account and synced after update.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cx(
                  "inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3 text-sm font-bold outline-none transition focus:ring-4 disabled:cursor-not-allowed",
                  isLoading ? theme.buttonDisabled : theme.button
                )}
              >
                {isLoading ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                {isLoading ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;