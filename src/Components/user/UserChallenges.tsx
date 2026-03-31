import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  Loader2,
  Wallet,
  TrendingUp,
  Gauge,
  CircleDollarSign,
  ShieldCheck,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MonitorSmartphone,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
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
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

/* -------------------- theme helpers -------------------- */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0")
    .trim()
    .replace(/,/g, " ");
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

function Money({
  value,
  currency = true,
  className = "",
}: {
  value: any;
  currency?: boolean;
  className?: string;
}) {
  if (typeof value !== "number") {
    return <Loader2 className={`inline animate-spin ${className}`} size={16} />;
  }

  const formatted = value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });

  return <span className={className}>{currency ? `$${formatted}` : formatted}</span>;
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
          border: isDark
            ? rgba(theme?.border || "255 255 255", 0.12)
            : "rgba(251,146,60,0.14)",
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

function ToolbarButton({
  children,
  onClick,
  disabled,
  theme,
  isDark,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  theme: any;
  isDark: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        borderColor: isDark
          ? rgba(theme?.border || "255 255 255", 0.12)
          : "rgba(251,146,60,0.16)",
        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.82)",
        color: isDark
          ? rgba(theme?.fg || "255 255 255", 0.92)
          : "rgba(30,41,59,0.96)",
      }}
    >
      {children}
    </button>
  );
}

const UserChallenges = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const [isStatsOpen, setIsStatsOpen] = useState(false);

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

  const titleColor = isDark
    ? rgba(theme?.fg || "255 255 255", 0.96)
    : "rgba(15,23,42,0.98)";

  const mutedTextColor = isDark
    ? rgba(theme?.fg || "255 255 255", 0.62)
    : "rgba(100,116,139,0.96)";

  const accentColor = isDark
    ? "rgba(96,165,250,0.95)"
    : "rgba(249,115,22,0.95)";

  const tableBorder = isDark
    ? rgba(theme?.border || "255 255 255", 0.1)
    : "rgba(251,146,60,0.12)";

  const mergedAccounts = useMemo(() => {
    return (loggedUser?.accounts || [])
      .slice()
      .reverse()
      .map((acc: any, index: number) => {
        const info = accountsData?.find(
          (item: any) => item.MT5Account === +acc.accountNumber
        );

        return {
          ...acc,
          rowId: `${acc?.accountNumber || index}`,
          balance: typeof info?.Balance === "number" ? info.Balance : null,
          equity: typeof info?.Equity === "number" ? info.Equity : null,
          profit: typeof info?.Profit === "number" ? info.Profit : null,
          createdDate: acc?.createdAt,
        };
      });
  }, [loggedUser?.accounts, accountsData]);

  const filteredAccounts = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return mergedAccounts;

    return mergedAccounts.filter((acc: any) => {
      return [acc?.accountNumber, acc?.accountType, acc?.platform, acc?.leverage]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [mergedAccounts, search]);

  const stats = useMemo(() => {
    const sum = (arr: any[], key: string) =>
      arr.reduce(
        (total, item) => (typeof item[key] === "number" ? total + item[key] : total),
        0
      );

    const totalBalance = sum(mergedAccounts, "balance");
    const totalEquity = sum(mergedAccounts, "equity");
    const totalPL = sum(mergedAccounts, "profit");

    return {
      accounts: mergedAccounts.length,
      totalBalance: isFinite(totalBalance) ? totalBalance : null,
      totalEquity: isFinite(totalEquity) ? totalEquity : null,
      totalPL: isFinite(totalPL) ? totalPL : null,
    };
  }, [mergedAccounts]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "accountNumber",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 font-semibold"
          >
            Account No.
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="min-w-[140px]">
            <div className="font-semibold" style={{ color: titleColor }}>
              {row.original.accountNumber}
            </div>
            <div className="mt-1 text-xs" style={{ color: mutedTextColor }}>
              {CFformatDate(row.original.createdDate)}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "accountType",
        header: "Type",
        cell: ({ row }) => (
          <span
            className="inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold"
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
            {row.original.accountType || "Account"}
          </span>
        ),
      },
      {
        accessorKey: "platform",
        header: "Platform",
        cell: ({ row }) => (
          <span style={{ color: titleColor }}>{row.original.platform || "—"}</span>
        ),
      },
      {
        accessorKey: "leverage",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 font-semibold"
          >
            Leverage
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <span
            className="inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold"
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
            1:{row.original.leverage || "—"}
          </span>
        ),
      },
      {
        accessorKey: "balance",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 font-semibold"
          >
            Balance
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold" style={{ color: titleColor }}>
            <Money value={row.original.balance} />
          </span>
        ),
      },
      {
        accessorKey: "equity",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 font-semibold"
          >
            Equity
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold" style={{ color: titleColor }}>
            <Money value={row.original.equity} />
          </span>
        ),
      },
      {
        accessorKey: "profit",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 font-semibold"
          >
            P/L
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => {
          const profit = row.original.profit;
          const positive = typeof profit === "number" ? profit >= 0 : true;

          return (
            <span
              className="font-bold"
              style={{
                color:
                  typeof profit === "number"
                    ? positive
                      ? isDark
                        ? "rgba(52,211,153,0.95)"
                        : "rgba(5,150,105,0.95)"
                      : isDark
                      ? "rgba(248,113,113,0.95)"
                      : "rgba(220,38,38,0.95)"
                    : titleColor,
              }}
            >
              {typeof profit === "number" ? (
                `${profit >= 0 ? "+" : "-"}$${Math.abs(profit).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}`
              ) : (
                <Loader2 className="inline animate-spin" size={16} />
              )}
            </span>
          );
        },
      },
      {
        id: "duration",
        header: "Created",
        cell: ({ row }) => (
          <div className="min-w-[120px]">
            <div style={{ color: titleColor }}>
              {CFformatDate(row.original.createdDate)}
            </div>
            <div className="mt-1 text-xs" style={{ color: mutedTextColor }}>
              {CFcalculateTimeSinceJoined(row.original.createdDate)}
            </div>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => handleMoreInfo(row.original)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-all duration-300"
            style={{
              borderColor: isDark
                ? rgba(theme?.border || "255 255 255", 0.12)
                : "rgba(251,146,60,0.14)",
              background: isDark
                ? "rgba(255,255,255,0.03)"
                : "rgba(255,255,255,0.82)",
              color: accentColor,
            }}
          >
            <Info className="h-4 w-4" />
            Details
          </button>
        ),
      },
    ],
    [accentColor, isDark, mutedTextColor, theme, titleColor]
  );

  const table = useReactTable({
    data: filteredAccounts,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <SectionCard theme={theme} isDark={isDark} className="overflow-hidden">
        <div
          className="relative border-b px-5 py-5 sm:px-6"
          style={{
            borderColor: tableBorder,
            background: isDark
              ? "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))"
              : "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,247,240,0.75))",
          }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute -right-10 top-0 h-36 w-36 rounded-full blur-3xl"
              style={{
                background: isDark
                  ? "rgba(59,130,246,0.10)"
                  : "rgba(249,115,22,0.12)",
              }}
            />
          </div>

          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" style={{ color: accentColor }} />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: mutedTextColor }}
              >
                mt5 · accounts · live
              </span>
            </div>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1
                  className="text-3xl font-bold tracking-tight sm:text-4xl"
                  style={{ color: titleColor, fontFamily: "'Poppins', sans-serif" }}
                >
                  MT5 Accounts
                </h1>

                <p
                  className="mt-2 max-w-2xl text-sm sm:text-[15px]"
                  style={{ color: mutedTextColor }}
                >
                  Premium desktop overview with searchable tabular view, real-time
                  balances, equity, and profit tracking for all active trading
                  accounts.
                </p>
              </div>

              <div
                className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm"
                style={{
                  borderColor: tableBorder,
                  background: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(255,255,255,0.72)",
                  color: titleColor,
                }}
              >
                <MonitorSmartphone className="h-4 w-4" style={{ color: accentColor }} />
                Desktop Table + Mobile Cards
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6">
          {/* Expandable Stats Section */}
          <SectionCard theme={theme} isDark={isDark} className="mb-6 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsStatsOpen((prev) => !prev)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(255,255,255,0.45)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border"
                  style={{
                    borderColor: tableBorder,
                    background: isDark
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(255,255,255,0.82)",
                    color: accentColor,
                  }}
                >
                  <LayoutDashboard className="h-5 w-5" />
                </div>

                <div>
                  <h2
                    className="text-base font-semibold sm:text-lg"
                    style={{ color: titleColor, fontFamily: "'Poppins', sans-serif" }}
                  >
                    Accounts Summary
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: mutedTextColor }}>
                    {isStatsOpen
                      ? "Click to collapse overview cards"
                      : "Click to expand overview cards"}
                  </p>
                </div>
              </div>

              <div
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium"
                style={{
                  borderColor: tableBorder,
                  background: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(255,255,255,0.85)",
                  color: titleColor,
                }}
              >
                {isStatsOpen ? "Collapse" : "Expand"}
                {isStatsOpen ? (
                  <ChevronUp className="h-4 w-4" style={{ color: accentColor }} />
                ) : (
                  <ChevronDown className="h-4 w-4" style={{ color: accentColor }} />
                )}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isStatsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div
                    className="border-t p-4 sm:p-5"
                    style={{ borderColor: tableBorder }}
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                        tone="info"
                      />
                      <StatCard
                        theme={theme}
                        isDark={isDark}
                        icon={<Gauge className="h-5 w-5" />}
                        label="Total Equity"
                        value={<Money value={stats.totalEquity} />}
                        tone="info"
                      />
                      <StatCard
                        theme={theme}
                        isDark={isDark}
                        icon={<TrendingUp className="h-5 w-5" />}
                        label="Total P/L"
                        value={<Money value={stats.totalPL} />}
                        tone={
                          typeof stats.totalPL === "number" && stats.totalPL < 0
                            ? "danger"
                            : "success"
                        }
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </SectionCard>

          {!!loggedUser?.accounts?.length && (
            <SectionCard theme={theme} isDark={isDark} className="mb-5 overflow-hidden">
              <div
                className="flex flex-col gap-3 border-b px-4 py-4 md:flex-row md:items-center md:justify-between"
                style={{
                  borderColor: tableBorder,
                  background: isDark
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(255,255,255,0.45)",
                }}
              >
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: titleColor, fontFamily: "'Poppins', sans-serif" }}
                  >
                    Accounts Overview
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: mutedTextColor }}>
                    Search, sort, and inspect account performance in one place.
                  </p>
                </div>

                <div className="relative w-full md:max-w-sm">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: mutedTextColor }}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      table.setPageIndex(0);
                    }}
                    placeholder="Search by account no, type, platform, leverage..."
                    className="h-11 w-full rounded-2xl border pl-10 pr-4 text-sm outline-none transition-all"
                    style={{
                      borderColor: tableBorder,
                      background: isDark
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(255,255,255,0.88)",
                      color: titleColor,
                    }}
                  />
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden xl:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1180px] border-separate border-spacing-0">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header, index) => (
                            <th
                              key={header.id}
                              className="border-b px-4 py-4 text-left text-sm font-semibold"
                              style={{
                                borderColor: tableBorder,
                                color: mutedTextColor,
                                background: isDark
                                  ? "rgba(255,255,255,0.02)"
                                  : "rgba(255,255,255,0.35)",
                                borderTopLeftRadius: index === 0 ? "18px" : 0,
                                borderTopRightRadius:
                                  index === headerGroup.headers.length - 1
                                    ? "18px"
                                    : 0,
                              }}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>

                    <tbody>
                      {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                          <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                              <td
                                key={cell.id}
                                className="border-b px-4 py-4 align-middle text-sm"
                                style={{
                                  borderColor: isDark
                                    ? "rgba(255,255,255,0.06)"
                                    : "rgba(251,146,60,0.10)",
                                  color: titleColor,
                                  background: isDark
                                    ? "rgba(255,255,255,0.015)"
                                    : "rgba(255,255,255,0.68)",
                                }}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="px-4 py-14 text-center text-sm"
                            style={{ color: mutedTextColor }}
                          >
                            No matching accounts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div
                  className="flex flex-col gap-3 border-t px-4 py-4 md:flex-row md:items-center md:justify-between"
                  style={{
                    borderColor: tableBorder,
                    background: isDark
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(255,255,255,0.40)",
                  }}
                >
                  <p className="text-sm" style={{ color: mutedTextColor }}>
                    Showing{" "}
                    <span style={{ color: titleColor }}>
                      {table.getRowModel().rows.length}
                    </span>{" "}
                    of{" "}
                    <span style={{ color: titleColor }}>{filteredAccounts.length}</span>{" "}
                    filtered accounts
                  </p>

                  <div className="flex items-center gap-2">
                    <ToolbarButton
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      theme={theme}
                      isDark={isDark}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </ToolbarButton>

                    <div className="px-3 text-sm" style={{ color: mutedTextColor }}>
                      Page{" "}
                      <span style={{ color: titleColor }}>
                        {table.getState().pagination.pageIndex + 1}
                      </span>{" "}
                      of{" "}
                      <span style={{ color: titleColor }}>
                        {table.getPageCount() || 1}
                      </span>
                    </div>

                    <ToolbarButton
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      theme={theme}
                      isDark={isDark}
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </ToolbarButton>
                  </div>
                </div>
              </div>

              {/* Tablet / Mobile Cards */}
              <div className="grid grid-cols-1 gap-4 p-4 xl:hidden">
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row, index) => {
                    const value = row.original;
                    const profitPositive =
                      typeof value?.profit === "number" ? value.profit >= 0 : true;

                    return (
                      <motion.div
                        key={value?.rowId || index}
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
                              value={<Money value={value?.balance} />}
                              theme={theme}
                              isDark={isDark}
                            />

                            <DataRow
                              label="Live Equity"
                              value={<Money value={value?.equity} />}
                              theme={theme}
                              isDark={isDark}
                            />

                            <DataRow
                              label="P/L"
                              value={
                                typeof value?.profit === "number" ? (
                                  `${value.profit >= 0 ? "+" : "-"}$${Math.abs(
                                    value.profit
                                  ).toLocaleString(undefined, {
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
                                  typeof value?.profit === "number"
                                    ? profitPositive
                                      ? isDark
                                        ? "rgba(52,211,153,0.95)"
                                        : "rgba(5,150,105,0.95)"
                                      : isDark
                                      ? "rgba(248,113,113,0.95)"
                                      : "rgba(220,38,38,0.95)"
                                    : titleColor,
                                fontWeight: 700,
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
                            <p>{CFformatDate(value?.createdDate)}</p>
                            <p className="mt-1">
                              {CFcalculateTimeSinceJoined(value?.createdDate)}
                            </p>
                          </div>
                        </SectionCard>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="py-10 text-center text-sm" style={{ color: mutedTextColor }}>
                    No matching accounts found.
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {!loggedUser?.accounts?.length && (
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
                      <div className="inline-flex items-center gap-2">
                        <span>{selectedChallenge?.masterPassword || "—"}</span>
                        <Link
                          to="/user/master-password"
                          style={{ color: accentColor }}
                          className="hover:opacity-90"
                        >
                          change
                        </Link>
                      </div>
                    }
                    theme={theme}
                    isDark={isDark}
                  />
                  <InfoLine
                    label="Investor Password"
                    value={
                      <div className="inline-flex items-center gap-2">
                        <span>{selectedChallenge?.investorPassword || "—"}</span>
                        <Link
                          to="/user/investor-password"
                          style={{ color: accentColor }}
                          className="hover:opacity-90"
                        >
                          change
                        </Link>
                      </div>
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