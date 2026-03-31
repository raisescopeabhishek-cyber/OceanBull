import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  Loader2,
  Wallet,
  TrendingUp,
  Gauge,
  CircleDollarSign,
  ShieldCheck,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CFcalculateTimeSinceJoined,
  CFformatDate,
} from "../../utils/CustomFunctions";
import { useGetInfoByAccounts } from "../../hooks/user/UseGetInfoByAccounts";

/* -------------------- theme helpers -------------------- */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0").trim().replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) =>
    Number.isFinite(n) ? n : 0
  );
  return { r, g, b };
};

const rgba = (v: any, a = 1) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

function SectionCard({
  children,
  theme,
  isDark,
  className = "",
}: {
  children: React.ReactNode;
  theme: any;
  isDark: boolean;
  className?: string;
}) {
  return (
    <div
      className={["rounded-[24px] border transition-all duration-300", className].join(
        " "
      )}
      style={{
        borderColor: isDark
          ? rgba(theme?.border || "255 255 255", 0.1)
          : "rgba(251,146,60,0.14)",
        background: isDark
          ? "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))"
          : "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,250,246,0.82))",
        boxShadow: isDark
          ? "0 18px 50px rgba(0,0,0,0.28)"
          : "0 14px 40px rgba(251,146,60,0.10)",
        backdropFilter: "blur(10px)",
      }}
    >
      {children}
    </div>
  );
}

function Money({ value }: { value: any }) {
  return typeof value === "number" ? (
    <>{value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</>
  ) : (
    <Loader2 className="inline animate-spin" size={16} />
  );
}

function StatCard({
  icon,
  label,
  value,
  prefix = "",
  tone = "default",
  isDark,
  theme,
}: any) {
  const toneStyles =
    tone === "success"
      ? {
          iconBg: isDark ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.10)",
          iconColor: isDark ? "rgba(52,211,153,0.95)" : "rgba(5,150,105,0.95)",
          border: isDark ? "rgba(16,185,129,0.18)" : "rgba(16,185,129,0.16)",
        }
      : tone === "danger"
      ? {
          iconBg: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.10)",
          iconColor: isDark ? "rgba(248,113,113,0.95)" : "rgba(220,38,38,0.95)",
          border: isDark ? "rgba(239,68,68,0.18)" : "rgba(239,68,68,0.16)",
        }
      : tone === "info"
      ? {
          iconBg: isDark ? "rgba(59,130,246,0.12)" : "rgba(249,115,22,0.10)",
          iconColor: isDark ? "rgba(96,165,250,0.95)" : "rgba(249,115,22,0.95)",
          border: isDark ? "rgba(59,130,246,0.18)" : "rgba(251,146,60,0.16)",
        }
      : {
          iconBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)",
          iconColor: isDark ? "rgba(255,255,255,0.88)" : "rgba(51,65,85,0.92)",
          border: isDark ? rgba(theme?.border || "255 255 255", 0.12) : "rgba(251,146,60,0.14)",
        };

  return (
    <SectionCard theme={theme} isDark={isDark} className="p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl border"
          style={{
            background: toneStyles.iconBg,
            color: toneStyles.iconColor,
            borderColor: toneStyles.border,
          }}
        >
          {icon}
        </div>

        <div>
          <div
            className="text-xs"
            style={{
              color: isDark
                ? rgba(theme?.fg || "255 255 255", 0.58)
                : "rgba(100,116,139,0.96)",
            }}
          >
            {label}
          </div>
          <div
            className="text-lg font-bold"
            style={{
              color: isDark
                ? rgba(theme?.fg || "255 255 255", 0.94)
                : "rgba(15,23,42,0.98)",
            }}
          >
            {prefix}
            {value}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function DataRow({
  label,
  value,
  prefix,
  theme,
  isDark,
  valueStyle,
}: any) {
  return (
    <div
      className="flex items-center justify-between rounded-2xl border px-4 py-3"
      style={{
        borderColor: isDark
          ? rgba(theme?.border || "255 255 255", 0.1)
          : "rgba(251,146,60,0.14)",
        background: isDark ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.80)",
      }}
    >
      <span
        className="text-sm"
        style={{
          color: isDark
            ? rgba(theme?.fg || "255 255 255", 0.58)
            : "rgba(100,116,139,0.96)",
        }}
      >
        {label}
      </span>

      <span
        className="text-sm font-semibold"
        style={
          valueStyle || {
            color: isDark
              ? rgba(theme?.fg || "255 255 255", 0.92)
              : "rgba(30,41,59,0.96)",
          }
        }
      >
        {prefix ? (
          <>
            {prefix}
            {value}
          </>
        ) : (
          value
        )}
      </span>
    </div>
  );
}

function InfoLine({
  label,
  value,
  theme,
  isDark,
}: {
  label: string;
  value: React.ReactNode;
  theme: any;
  isDark: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span
        style={{
          color: isDark
            ? rgba(theme?.fg || "255 255 255", 0.58)
            : "rgba(100,116,139,0.96)",
        }}
      >
        {label}
      </span>
      <span
        className="text-right"
        style={{
          color: isDark
            ? rgba(theme?.fg || "255 255 255", 0.92)
            : "rgba(30,41,59,0.96)",
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

const UserChallenges = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const siteConfig = useSelector((store: any) => store.user?.siteConfig);
  const loggedUser = useSelector((store: any) => store.user?.loggedUser);
  const mode = useSelector((store: any) => store.userTheme?.mode || "light");
  const themeConfig = useSelector((store: any) => store.user?.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const isDark = mode === "dark";

  const accountIds =
    loggedUser?.accounts?.map((acc: any) => +acc.accountNumber) || [];

  useGetInfoByAccounts(accountIds, "accounts");
  const { accountsData } = useSelector((store: any) => store.user);

  const handleMoreInfo = (value: any) => {
    setSelectedChallenge(value);
    setIsDialogOpen(true);
  };

  const stats = useMemo(() => {
    const list = (loggedUser?.accounts || []).map((acc: any) => {
      const info = accountsData?.find(
        (item: any) => item.MT5Account === +acc.accountNumber
      );
      return {
        balance: info?.Balance ?? null,
        equity: info?.Equity ?? null,
        profit: info?.Profit ?? null,
      };
    });

    const sum = (arr: any[], key: string) =>
      arr.reduce(
        (total, item) => (typeof item[key] === "number" ? total + item[key] : total),
        0
      );

    const totalBalance = sum(list, "balance");
    const totalEquity = sum(list, "equity");
    const totalPL = sum(list, "profit");

    return {
      accounts: (loggedUser?.accounts || []).length,
      totalBalance: isFinite(totalBalance) ? totalBalance : null,
      totalEquity: isFinite(totalEquity) ? totalEquity : null,
      totalPL: isFinite(totalPL) ? totalPL : null,
    };
  }, [loggedUser?.accounts, accountsData]);

  const titleColor = isDark
    ? rgba(theme?.fg || "255 255 255", 0.96)
    : "rgba(15,23,42,0.98)";

  const mutedTextColor = isDark
    ? rgba(theme?.fg || "255 255 255", 0.62)
    : "rgba(100,116,139,0.96)";

  const accentColor = isDark
    ? "rgba(96,165,250,0.95)"
    : "rgba(249,115,22,0.95)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <SectionCard theme={theme} isDark={isDark} className="overflow-hidden">
        <div
          className="border-b px-5 py-4 sm:px-6"
          style={{
            borderColor: isDark
              ? rgba(theme?.border || "255 255 255", 0.1)
              : "rgba(251,146,60,0.12)",
            background: isDark
              ? "rgba(255,255,255,0.02)"
              : "rgba(255,255,255,0.38)",
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" style={{ color: accentColor }} />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: mutedTextColor }}
            >
              mt5 · accounts · live
            </span>
          </div>

          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: titleColor, fontFamily: "'Poppins', sans-serif" }}
          >
            MT5 Accounts
          </h1>

          <p className="mt-2 text-sm sm:text-[15px]" style={{ color: mutedTextColor }}>
            Real-time balances, equity, and profit overview for your active
            trading accounts.
          </p>
        </div>

        <div className="p-4 sm:p-5 md:p-6">
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              theme={theme}
              isDark={isDark}
              icon={<Wallet className="h-5 w-5" />}
              label="Accounts"
              value={stats.accounts}
              tone="default"
            />
            <StatCard
              theme={theme}
              isDark={isDark}
              icon={<CircleDollarSign className="h-5 w-5" />}
              label="Total Balance"
              value={<Money value={stats.totalBalance} />}
              prefix="$"
              tone="info"
            />
            <StatCard
              theme={theme}
              isDark={isDark}
              icon={<Gauge className="h-5 w-5" />}
              label="Total Equity"
              value={<Money value={stats.totalEquity} />}
              prefix="$"
              tone="info"
            />
            <StatCard
              theme={theme}
              isDark={isDark}
              icon={<TrendingUp className="h-5 w-5" />}
              label="Total P/L"
              value={<Money value={stats.totalPL} />}
              prefix="$"
              tone={
                typeof stats.totalPL === "number" && stats.totalPL < 0
                  ? "danger"
                  : "success"
              }
            />
          </div>

          {loggedUser?.accounts?.length ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {loggedUser.accounts
                .slice()
                .reverse()
                .map((value: any, index: number) => {
                  const info = accountsData?.find(
                    (item: any) => item.MT5Account === +value?.accountNumber
                  );

                  const profitPositive =
                    typeof info?.Profit === "number" ? info.Profit >= 0 : true;

                  return (
                    <motion.div
                      key={value?.accountNumber || index}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <SectionCard
                        theme={theme}
                        isDark={isDark}
                        className="h-full p-4 sm:p-5"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <div
                              className="text-[11px] uppercase tracking-[0.18em]"
                              style={{ color: mutedTextColor }}
                            >
                              Account Number
                            </div>
                            <div
                              className="mt-1 text-base font-semibold"
                              style={{ color: titleColor }}
                            >
                              {value?.accountNumber}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleMoreInfo(value)}
                            className="grid h-10 w-10 place-items-center rounded-xl border transition-all duration-300"
                            style={{
                              borderColor: isDark
                                ? rgba(theme?.border || "255 255 255", 0.12)
                                : "rgba(251,146,60,0.14)",
                              background: isDark
                                ? "rgba(255,255,255,0.03)"
                                : "rgba(255,255,255,0.80)",
                              color: accentColor,
                            }}
                            title="More info"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-2">
                          <span
                            className="rounded-full border px-3 py-1 text-[11px] font-semibold"
                            style={{
                              borderColor: isDark
                                ? "rgba(16,185,129,0.18)"
                                : "rgba(16,185,129,0.16)",
                              background: isDark
                                ? "rgba(16,185,129,0.10)"
                                : "rgba(16,185,129,0.08)",
                              color: isDark
                                ? "rgba(52,211,153,0.95)"
                                : "rgba(5,150,105,0.95)",
                            }}
                          >
                            {value?.accountType || "Account"}
                          </span>

                          <span
                            className="rounded-full border px-3 py-1 text-[11px] font-semibold"
                            style={{
                              borderColor: isDark
                                ? "rgba(59,130,246,0.18)"
                                : "rgba(251,146,60,0.16)",
                              background: isDark
                                ? "rgba(59,130,246,0.10)"
                                : "rgba(255,237,213,0.70)",
                              color: isDark
                                ? "rgba(96,165,250,0.95)"
                                : "rgba(194,65,12,0.95)",
                            }}
                          >
                            Lev {value?.leverage}
                          </span>

                          {value?.platform ? (
                            <span
                              className="rounded-full border px-3 py-1 text-[11px] font-semibold"
                              style={{
                                borderColor: isDark
                                  ? rgba(theme?.border || "255 255 255", 0.12)
                                  : "rgba(251,146,60,0.14)",
                                background: isDark
                                  ? "rgba(255,255,255,0.04)"
                                  : "rgba(255,255,255,0.80)",
                                color: titleColor,
                              }}
                            >
                              {value.platform}
                            </span>
                          ) : null}
                        </div>

                        <div className="space-y-3">
                          <DataRow
                            label="Balance"
                            value={<Money value={info?.Balance} />}
                            prefix="$"
                            theme={theme}
                            isDark={isDark}
                          />

                          <DataRow
                            label="Live Equity"
                            value={<Money value={info?.Equity} />}
                            prefix="$"
                            theme={theme}
                            isDark={isDark}
                          />

                          <DataRow
                            label="P/L"
                            value={
                              typeof info?.Profit === "number" ? (
                                `$${Math.abs(info.Profit).toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}`
                              ) : (
                                <Loader2 className="inline animate-spin" size={16} />
                              )
                            }
                            theme={theme}
                            isDark={isDark}
                            valueStyle={{
                              color:
                                typeof info?.Profit === "number"
                                  ? profitPositive
                                    ? isDark
                                      ? "rgba(52,211,153,0.95)"
                                      : "rgba(5,150,105,0.95)"
                                    : isDark
                                    ? "rgba(248,113,113,0.95)"
                                    : "rgba(220,38,38,0.95)"
                                  : titleColor,
                              fontWeight: 600,
                            }}
                          />
                        </div>

                        <div
                          className="mt-4 border-t pt-4 text-[11px]"
                          style={{
                            borderColor: isDark
                              ? rgba(theme?.border || "255 255 255", 0.08)
                              : "rgba(251,146,60,0.10)",
                            color: mutedTextColor,
                          }}
                        >
                          <p>{CFformatDate(value?.createdAt)}</p>
                          <p className="mt-1">{CFcalculateTimeSinceJoined(value?.createdAt)}</p>
                        </div>
                      </SectionCard>
                    </motion.div>
                  );
                })}
            </div>
          ) : (
            <SectionCard theme={theme} isDark={isDark} className="p-8 text-center">
              <h3
                className="text-lg font-semibold"
                style={{ color: titleColor, fontFamily: "'Poppins', sans-serif" }}
              >
                No Accounts Found
              </h3>
              <p className="mt-2 text-sm" style={{ color: mutedTextColor }}>
                Your created MT5 accounts will appear here.
              </p>
            </SectionCard>
          )}
        </div>
      </SectionCard>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AnimatePresence>
          {isDialogOpen && selectedChallenge && (
            <AlertDialogContent
              as={motion.div as any}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="max-w-lg"
              style={{
                borderRadius: "24px",
                border: isDark
                  ? `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`
                  : "1px solid rgba(251,146,60,0.16)",
                background: isDark
                  ? "linear-gradient(180deg, rgba(17,24,39,0.96), rgba(10,15,23,0.98))"
                  : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,247,240,0.96))",
                boxShadow: isDark
                  ? "0 20px 60px rgba(0,0,0,0.42)"
                  : "0 20px 60px rgba(251,146,60,0.16)",
              }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle
                  className="text-xl font-bold"
                  style={{ color: titleColor, fontFamily: "'Poppins', sans-serif" }}
                >
                  Account Info
                </AlertDialogTitle>

                <AlertDialogDescription className="mt-4 space-y-3">
                  <InfoLine
                    label="Trade Platform"
                    value={selectedChallenge?.platform}
                    theme={theme}
                    isDark={isDark}
                  />
                  <InfoLine
                    label="Server Name"
                    value={siteConfig?.serverName}
                    theme={theme}
                    isDark={isDark}
                  />
                  <InfoLine
                    label="Trading Account"
                    value={selectedChallenge?.accountNumber}
                    theme={theme}
                    isDark={isDark}
                  />
                  <InfoLine
                    label="Leverage"
                    value={selectedChallenge?.leverage}
                    theme={theme}
                    isDark={isDark}
                  />
                  <InfoLine
                    label="Master Password"
                    value={
                      <>
                        {selectedChallenge?.masterPassword}{" "}
                        <Link
                          to="/user/master-password"
                          style={{ color: accentColor }}
                          className="ml-2 hover:opacity-90"
                        >
                          change
                        </Link>
                      </>
                    }
                    theme={theme}
                    isDark={isDark}
                  />
                  <InfoLine
                    label="Investor Password"
                    value={
                      <>
                        {selectedChallenge?.investorPassword}{" "}
                        <Link
                          to="/user/investor-password"
                          style={{ color: accentColor }}
                          className="ml-2 hover:opacity-90"
                        >
                          change
                        </Link>
                      </>
                    }
                    theme={theme}
                    isDark={isDark}
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter className="mt-5">
                <AlertDialogCancel
                  className="rounded-xl px-4 py-2"
                  style={{
                    borderRadius: "14px",
                    background: isDark
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(255,255,255,0.88)",
                    border: isDark
                      ? `1px solid ${rgba(theme?.border || "255 255 255", 0.12)}`
                      : "1px solid rgba(251,146,60,0.16)",
                    color: titleColor,
                  }}
                >
                  Close
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
        </AnimatePresence>
      </AlertDialog>
    </motion.div>
  );
};

export default UserChallenges;