import React, { useMemo, useState } from "react";
import { CreditCard, User, Wallet, ShieldCheck, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import UserBankDetails from "./accountDetails/UserBankDetails";
import UserKycDetails from "./accountDetails/UserKycDetails";
import UserWalletDetails from "./accountDetails/UserWalletDetails";

/* -------------------- helpers -------------------- */
const cx = (...classes) => classes.filter(Boolean).join(" ");

const getTheme = (isDark) => ({
  pageText: isDark ? "text-white" : "text-slate-900",
  text: isDark ? "text-white" : "text-slate-900",
  muted: isDark ? "text-white/55" : "text-slate-500",
  softText: isDark ? "text-white/70" : "text-slate-600",

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

  tab: isDark
    ? "border-white/10 bg-white/[0.035] text-white/70 hover:bg-white/[0.06]"
    : "border-amber-100 bg-white/75 text-slate-600 hover:bg-amber-50",

  activeTab: isDark
    ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
    : "border-amber-300 bg-amber-50 text-amber-700 shadow-[0_0_0_3px_rgba(245,158,11,0.06)]",

  iconBox: isDark
    ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
    : "border-amber-200 bg-amber-50 text-amber-600",

  badge: isDark
    ? "border-white/10 bg-white/[0.05] text-white/60"
    : "border-amber-100 bg-white/80 text-amber-600",

  successBadge: isDark
    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
    : "border-emerald-200 bg-emerald-50 text-emerald-700",
});

/* -------------------- shared ui -------------------- */
const HeaderCard = ({ children, theme }) => (
  <div
    className={cx(
      "relative overflow-hidden rounded-[26px] border p-5 transition-all duration-300 sm:p-6",
      theme.header
    )}
  >
    {children}
  </div>
);

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

const TabButton = ({ active, onClick, icon: Icon, label, theme }) => (
  <button
    type="button"
    onClick={onClick}
    className={cx(
      "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200",
      active ? theme.activeTab : theme.tab
    )}
  >
    <span
      className={cx(
        "flex h-9 w-9 items-center justify-center rounded-xl border",
        active ? theme.activeTab : theme.badge
      )}
    >
      <Icon className="h-4 w-4" />
    </span>

    <span>{label}</span>
  </button>
);

const Chip = ({ children, theme }) => (
  <span
    className={cx(
      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
      theme.badge
    )}
  >
    {children}
  </span>
);

/* -------------------- main component -------------------- */
const UserAccountDetails = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";
  const theme = useMemo(() => getTheme(isDark), [isDark]);

  const tabs = useMemo(
    () => [
      {
        id: "personal",
        label: "KYC Details",
        icon: User,
        description: "Manage your identity verification details.",
      },
      {
        id: "account",
        label: "Bank Details",
        icon: CreditCard,
        description: "Manage your bank account information.",
      },
      {
        id: "wallet",
        label: "Wallet Details",
        icon: Wallet,
        description: "Manage your crypto wallet addresses.",
      },
    ],
    []
  );

  const [activeTab, setActiveTab] = useState("personal");

  const activeTabData = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  const renderContent = () => {
    if (activeTab === "personal") return <UserKycDetails />;
    if (activeTab === "account") return <UserBankDetails />;
    return <UserWalletDetails />;
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
              : "radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 30%), radial-gradient(circle at bottom right, rgba(255,251,235,0.22), transparent 36%)",
          }}
        />

        <div className="relative z-[1] flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <HeaderIconBox theme={theme}>
              <Wallet className="h-6 w-6" />
            </HeaderIconBox>

            <div>
              <div
                className={cx(
                  "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                  theme.headerBadge
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Profile · Finance · Wallet
              </div>

              <h1
                className={cx(
                  "text-2xl font-bold tracking-tight sm:text-3xl",
                  theme.headerText
                )}
              >
                Account Details
              </h1>

              <p className={cx("mt-2 max-w-2xl text-sm leading-6", theme.headerMuted)}>
                Update and review your KYC, bank, and wallet details from one secure place.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
            <HeaderStatBox
              theme={theme}
              icon={<User className="h-4 w-4" />}
              label="KYC"
              value="Identity"
            />

            <HeaderStatBox
              theme={theme}
              icon={<CreditCard className="h-4 w-4" />}
              label="Bank"
              value="Details"
            />

            <HeaderStatBox
              theme={theme}
              icon={<Wallet className="h-4 w-4" />}
              label="Wallet"
              value="Secure"
            />
          </div>
        </div>
      </HeaderCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Sidebar Tabs */}
        <Card theme={theme} className="lg:col-span-4 xl:col-span-3">
          <div className="mb-5">
            <h2 className={cx("text-lg font-semibold", theme.text)}>
              Account Sections
            </h2>
            <p className={cx("mt-1 text-sm leading-6", theme.muted)}>
              Choose the section you want to update.
            </p>
          </div>

          <div className="space-y-3">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                theme={theme}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                icon={tab.icon}
                label={tab.label}
              />
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Chip theme={theme}>Verified KYC</Chip>
            <Chip theme={theme}>Bank Linked</Chip>
            <Chip theme={theme}>Secure Wallet</Chip>
          </div>

          <div className={cx("mt-5 rounded-2xl border p-4", theme.cardSoft)}>
            <div className="flex items-start gap-3">
              <div
                className={cx(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                  theme.successBadge
                )}
              >
                <ShieldCheck className="h-4 w-4" />
              </div>

              <div>
                <p className={cx("text-sm font-semibold", theme.text)}>
                  Secure Information
                </p>
                <p className={cx("mt-1 text-xs leading-5", theme.muted)}>
                  Your financial details are used only for deposits, withdrawals, and verification.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Content */}
        <Card theme={theme} className="lg:col-span-8 xl:col-span-9">
          <div className="mb-5 flex items-start gap-3">
            <div
              className={cx(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
                theme.iconBox
              )}
            >
              <activeTabData.icon className="h-5 w-5" />
            </div>

            <div>
              <h2 className={cx("text-lg font-semibold", theme.text)}>
                {activeTabData.label}
              </h2>
              <p className={cx("mt-1 text-sm leading-6", theme.muted)}>
                {activeTabData.description}
              </p>
            </div>
          </div>

          <div
            className={cx(
              "rounded-[22px] border p-3 sm:p-4",
              isDark
                ? "border-white/10 bg-white/[0.025]"
                : "border-amber-100 bg-amber-50/35"
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserAccountDetails;