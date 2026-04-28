// Components/user/bonus/BonusLayout.jsx
import React, { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  BadgeDollarSign,
  Gift,
  LayoutDashboard,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import BonusMiniSidebar from "./components/BonusMiniSidebar";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const getTheme = (isDark) => ({
  pageBg: isDark ? "#0b1120" : "#fffaf5",
  pageText: isDark ? "text-white" : "text-slate-900",

  text: isDark ? "text-white" : "text-slate-900",
  muted: isDark ? "text-white/60" : "text-slate-500",
  softText: isDark ? "text-white/75" : "text-slate-600",

  shell: isDark
    ? "border-white/10 bg-white/[0.035] shadow-[0_18px_55px_rgba(0,0,0,0.38)]"
    : "border-orange-100/80 bg-white/85 shadow-[0_14px_34px_rgba(251,146,60,0.08)]",

  header: isDark
    ? "border-white/10 bg-[linear-gradient(135deg,rgba(30,41,59,1),rgba(15,23,42,1))]"
    : "border-orange-200/60 bg-[linear-gradient(135deg,#fb923c,#f97316)]",

  headerText: "text-white",
  headerMuted: isDark ? "text-white/65" : "text-white/85",
  headerBadge: "border-white/20 bg-white/10 text-white",
  headerIcon: "border-white/20 bg-white/10 text-white",
  headerStat: "border-white/18 bg-white/10 text-white backdrop-blur-xl",
  headerStatMuted: "text-white/78",

  card: isDark
    ? "border-white/10 bg-white/[0.045]"
    : "border-orange-100/70 bg-white/75",

  button: isDark
    ? "border-white/10 bg-white/[0.05] text-white/80 hover:bg-white/[0.09]"
    : "border-orange-200/80 bg-white/90 text-orange-600 hover:bg-orange-50/80",

  orangeButton: isDark
    ? "border-blue-400/20 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15"
    : "border-orange-200 bg-orange-50/70 text-orange-600 shadow-[0_0_0_3px_rgba(251,146,60,0.05)] hover:bg-orange-100/60",

  contentBg: isDark ? "bg-white/[0.015]" : "bg-orange-50/20",
});

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

const getPageMeta = (pathname) => {
  if (pathname.includes("/deposits")) {
    return {
      title: "Bonus Deposits",
      subtitle: "Track deposits that are eligible for bonus rewards.",
      icon: <ReceiptText className="h-6 w-6" />,
      active: "Deposits",
    };
  }

  if (pathname.includes("/ledger")) {
    return {
      title: "Bonus Ledger",
      subtitle: "Review all bonus credit, debit, and adjustment entries.",
      icon: <WalletCards className="h-6 w-6" />,
      active: "Ledger",
    };
  }

  if (pathname.includes("/payouts")) {
    return {
      title: "Bonus Payouts",
      subtitle: "Monitor payout requests and payout eligibility status.",
      icon: <BadgeDollarSign className="h-6 w-6" />,
      active: "Payouts",
    };
  }

  if (pathname.includes("/trades")) {
    return {
      title: "Bonus Trades",
      subtitle: "Review trades linked with bonus activity and conditions.",
      icon: <TrendingUp className="h-6 w-6" />,
      active: "Trades",
    };
  }

  return {
    title: "Bonus Dashboard",
    subtitle: "View your bonus summary, rewards, ledger, and payout progress.",
    icon: <Gift className="h-6 w-6" />,
    active: "Dashboard",
  };
};

const BonusLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";
  const theme = useMemo(() => getTheme(isDark), [isDark]);

  const pageMeta = useMemo(
    () => getPageMeta(location.pathname),
    [location.pathname]
  );

  return (
    <div
      className={cx("min-h-screen w-full p-3 sm:p-4", theme.pageText)}
      style={{ background: theme.pageBg }}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <BonusMiniSidebar isDark={isDark} />

        <div
          className={cx(
            "min-h-[720px] overflow-hidden rounded-[28px] border backdrop-blur-xl",
            theme.shell
          )}
        >
          {/* Soft Orange Header */}
          <div
            className={cx(
              "relative overflow-hidden border-b px-4 py-5 sm:px-6",
              theme.header
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at top left, rgba(255,255,255,0.16), transparent 30%), radial-gradient(circle at bottom right, rgba(255,237,213,0.12), transparent 38%)",
              }}
            />

            <div className="relative z-[1] flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <HeaderIconBox theme={theme}>{pageMeta.icon}</HeaderIconBox>

                <div>
                  <div
                    className={cx(
                      "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                      theme.headerBadge
                    )}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Bonus · Rewards · Wallet
                  </div>

                  <h1
                    className={cx(
                      "text-2xl font-bold tracking-tight sm:text-3xl",
                      theme.headerText
                    )}
                  >
                    {pageMeta.title}
                  </h1>

                  <p
                    className={cx(
                      "mt-2 max-w-2xl text-sm leading-6",
                      theme.headerMuted
                    )}
                  >
                    {pageMeta.subtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                <HeaderStatBox
                  theme={theme}
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  label="Section"
                  value={pageMeta.active}
                />

                <HeaderStatBox
                  theme={theme}
                  icon={<Gift className="h-4 w-4" />}
                  label="Bonus"
                  value="Rewards"
                />

                <HeaderStatBox
                  theme={theme}
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Status"
                  value="Secure"
                />
              </div>
            </div>
          </div>

          {/* Utility Bar */}
          <div
            className={cx(
              "flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6",
              isDark ? "border-white/10" : "border-orange-100/80"
            )}
          >
            <button
              type="button"
              onClick={() => navigate("/user/dashboard")}
              className={cx(
                "inline-flex w-fit items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all",
                theme.button
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            <div
              className={cx(
                "inline-flex w-fit items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-semibold",
                theme.orangeButton
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              Bonus module is synced with your user account
            </div>
          </div>

          {/* Page Content */}
          <div className={cx("min-h-[560px] p-3 sm:p-4", theme.contentBg)}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BonusLayout;