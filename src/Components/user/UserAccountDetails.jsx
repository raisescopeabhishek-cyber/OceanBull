import React, { useMemo, useState } from "react";
import { CreditCard, User, Wallet, ShieldCheck, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import UserBankDetails from "./accountDetails/UserBankDetails";
import UserKycDetails from "./accountDetails/UserKycDetails";
import UserWalletDetails from "./accountDetails/UserWalletDetails";
import { PageHeader } from "@/Components/ui";

/* -------------------- helpers -------------------- */
const cx = (...classes) => classes.filter(Boolean).join(" ");

const getTheme = (isDark) => ({
  pageText:"text-text",
  text:"text-text",
  muted:"text-subtle",
  softText:"text-muted",

  header:"border-line",

  headerText: "text-text",
  headerMuted: "text-muted",
  headerBadge: "border-line bg-surface-2 text-text",
  headerIcon: "border-line bg-surface-2 text-text",
  headerStat: "border-line bg-surface-2 text-text backdrop-blur-xl",
  headerStatMuted: "text-muted",

  card:"border-line bg-surface-2",

  cardSoft:"border-line bg-surface-2",

  tab:"border-line bg-surface-2 text-muted hover:bg-surface-2",

  activeTab:"border-line bg-primary-soft text-primary",

  iconBox:"border-line bg-primary-soft text-primary",

  badge:"border-line bg-surface-2 text-subtle",

  successBadge:"border-success bg-success-soft text-success",
});

/* -------------------- shared ui -------------------- */
const HeaderCard = ({ children, theme }) => (
  <div
    className={cx(
      "relative overflow-hidden rounded-card border p-5 transition-all duration-300 sm:p-6",
      theme.header
    )}
  >
    {children}
  </div>
);

const Card = ({ children, className = "", theme }) => (
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

const HeaderIconBox = ({ children, theme }) => (
  <div
    className={cx(
      "flex h-12 w-12 shrink-0 items-center justify-center rounded-card border",
      theme.headerIcon
    )}
  >
    {children}
  </div>
);

const HeaderStatBox = ({ icon, label, value, theme }) => (
  <div className={cx("rounded-card border px-4 py-3", theme.headerStat)}>
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-card border border-line bg-surface-2">
        {icon}
      </div>

      <div className="min-w-0">
        <p className={cx("text-xs", theme.headerStatMuted)}>{label}</p>
        <p className="mt-1 truncate text-base font-bold text-text">{value}</p>
      </div>
    </div>
  </div>
);

const TabButton = ({ active, onClick, icon: Icon, label, theme }) => (
  <button
    type="button"
    onClick={onClick}
    className={cx(
      "flex w-full items-center gap-3 rounded-card border px-4 py-3 text-sm font-semibold transition-all duration-200",
      active ? theme.activeTab : theme.tab
    )}
  >
    <span
      className={cx(
        "flex h-9 w-9 items-center justify-center rounded-card border",
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
      <PageHeader
        breadcrumb="Account / Details"
        title="Account details"
        description="Update and review your KYC, bank and wallet details in one place."
      />

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

          <div className={cx("mt-5 rounded-card border p-4", theme.cardSoft)}>
            <div className="flex items-start gap-3">
              <div
                className={cx(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-card border",
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
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-card border",
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
              "rounded-card border p-3 sm:p-4","border-line bg-surface-2"
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