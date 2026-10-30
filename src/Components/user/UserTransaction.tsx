import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  RefreshCcw,
  ArrowDownToLine,
  ArrowUpToLine,
  Repeat2,
  Search,
  Wallet,
  Gauge,
  TrendingUp,
  Activity,
} from "lucide-react";
import { userApi } from "../../utils/apiClients";
import {
  BlotterPage,
  Button,
  EmptyState as UiEmptyState,
  StatusBadge,
} from "@/Components/ui";

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

/* -------------------- helpers -------------------- */
function formatDate(iso: any) {
  if (!iso) return "N/A";
  const d = new Date(iso);

  const date = d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return `${date}, ${time}`;
}

function money(n: any) {
  const num = Number(n ?? 0);
  return Number.isFinite(num)
    ? num.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "0";
}

function statusTone(status: any) {
  const s = String(status || "").toLowerCase();

  if (s === "approved" || s === "completed") return "approved";
  if (s === "pending" || s === "processing") return "pending";
  if (s === "rejected" || s === "failed" || s === "reversed") return "rejected";

  return "unknown";
}

/* -------------------- shared cards -------------------- */
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
      className={["rounded-card border transition-all duration-300", className].join(
        " "
      )}
      style={{
        borderColor: isDark
          ? rgba(theme?.border || "255 255 255", 0.1)
          : "rgba(79, 125, 246,0.14)",
        background: isDark
          ? "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))"
          : "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,250,246,0.82))",
        boxShadow: isDark
          ? "0 18px 50px rgba(0,0,0,0.28)"
          : "0 14px 40px rgba(79, 125, 246,0.10)",
        backdropFilter: "blur(10px)",
      }}
    >
      {children}
    </div>
  );
}

function EmptyState({
  title = "No data found",
  subtitle = "Try another tab or refresh the records.",
  theme,
  isDark,
}: any) {
  return (
    <div className="py-12 text-center">
      <div
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border"
        style={{
          borderColor: isDark
            ? rgba(theme?.border || "255 255 255", 0.12)
            : "rgba(79, 125, 246,0.14)",
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.78)",
          color: isDark
            ? rgba(theme?.fg || "255 255 255", 0.7)
            : "rgba(123, 135, 154,0.9)",
        }}
      >
        ⚪
      </div>

      <p
        className="font-semibold"
        style={{
          color: isDark
            ? rgba(theme?.fg || "255 255 255", 0.92)
            : "rgba(15, 24, 41,0.96)",
        }}
      >
        {title}
      </p>

      <p
        className="mt-1 text-sm"
        style={{
          color: isDark
            ? rgba(theme?.fg || "255 255 255", 0.58)
            : "rgba(123, 135, 154,0.95)",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  prefix = "",
  tone = "default",
  theme,
  isDark,
}: any) {
  const toneStyles =
    tone === "success"
      ? {
          iconBg: isDark ? "rgba(15, 159, 110,0.12)" : "rgba(15, 159, 110,0.10)",
          iconColor: isDark ? "rgba(52,211,153,0.95)" : "rgba(5,150,105,0.95)",
          border: isDark ? "rgba(15, 159, 110,0.18)" : "rgba(15, 159, 110,0.16)",
        }
      : tone === "danger"
      ? {
          iconBg: isDark ? "rgba(220, 58, 58,0.12)" : "rgba(220, 58, 58,0.10)",
          iconColor: isDark ? "rgba(248,113,113,0.95)" : "rgba(220,38,38,0.95)",
          border: isDark ? "rgba(220, 58, 58,0.18)" : "rgba(220, 58, 58,0.16)",
        }
      : tone === "info"
      ? {
          iconBg: isDark ? "rgba(79, 125, 246,0.12)" : "rgba(42, 86, 220,0.10)",
          iconColor: isDark ? "rgba(79, 125, 246,0.95)" : "rgba(42, 86, 220,0.95)",
          border: isDark ? "rgba(79, 125, 246,0.18)" : "rgba(79, 125, 246,0.16)",
        }
      : tone === "warning"
      ? {
          iconBg: isDark ? "rgba(42, 86, 220,0.12)" : "rgba(42, 86, 220,0.10)",
          iconColor: isDark ? "rgba(224, 191, 108,0.95)" : "rgba(34, 69, 180,0.95)",
          border: isDark ? "rgba(42, 86, 220,0.18)" : "rgba(42, 86, 220,0.16)",
        }
      : {
          iconBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)",
          iconColor: isDark ? "rgba(255,255,255,0.88)" : "rgba(51,65,85,0.92)",
          border: isDark
            ? rgba(theme?.border || "255 255 255", 0.12)
            : "rgba(79, 125, 246,0.14)",
        };

  return (
    <SectionCard theme={theme} isDark={isDark} className="p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-card border"
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
                : "rgba(123, 135, 154,0.96)",
            }}
          >
            {label}
          </div>

          <div
            className="text-lg font-bold"
            style={{
              color: isDark
                ? rgba(theme?.fg || "255 255 255", 0.94)
                : "rgba(15, 24, 41,0.98)",
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

function SkeletonTable({
  cols,
  rows = 6,
  theme,
  isDark,
}: {
  cols: number;
  rows?: number;
  theme: any;
  isDark: boolean;
}) {
  return (
    <div
      className="overflow-x-auto rounded-card border"
      style={{
        borderColor: isDark
          ? rgba(theme?.border || "255 255 255", 0.12)
          : "rgba(79, 125, 246,0.14)",
      }}
    >
      <table className="w-full text-sm">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr
              key={i}
              style={{
                borderBottom: `1px solid ${
                  isDark
                    ? rgba(theme?.border || "255 255 255", 0.08)
                    : "rgba(79, 125, 246,0.10)"
                }`,
              }}
            >
              {Array.from({ length: cols }).map((__, j) => (
                <td key={j} className="p-3">
                  <div
                    className="h-4 w-full animate-pulse rounded"
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(255,255,255,0.9)",
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------- component -------------------- */
export default function UserTransaction() {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdrawal" | "account">(
    "deposit"
  );
  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const loggedUser = useSelector((s: any) => s?.user?.loggedUser);
  const mode = useSelector((s: any) => s.userTheme?.mode || "light");
  const themeConfig = useSelector((s: any) => s.user?.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const isDark = mode === "dark";

  async function fetchTransactionData(tradeType: typeof activeTab, signal?: AbortSignal) {
    setLoading(true);
    setError(null);

    try {
      if (!loggedUser?._id) {
        setTransactionData([]);
        setError("Please sign in to view your transactions.");
        return;
      }

      let res: any;

      if (tradeType === "withdrawal") {
        res = await userApi.get(
          `/withdrawals/${loggedUser._id}`,
          signal ? { signal } : undefined
        );

        const payload = res?.data?.data;

        if (!Array.isArray(payload) || payload.length === 0) {
          setTransactionData([]);
          setError("No withdrawal data available.");
          return;
        }

        const normalized = payload.map((item: any) => ({
          _id: item._id ?? item.id,
          bonusDetails: item.bonusDetails,
          mt5Account: item.mt5Account || item.accountNumber || item.account || "N/A",
          accountType: item.accountType || item.type || "N/A",
          amount: item.amount ?? 0,
          method: (item.method || "N/A").toString(),
          createdAt: item.createdAt || item.created_at || item.created || null,
          updatedAt: item.updatedAt || item.updated_at || item.updated || null,
          lastBalance: item.lastBalance ?? item.balance ?? 0,
          status: item.status || "unknown",
        }));

        setTransactionData(normalized);
        return;
      }

      if (tradeType === "deposit") {
        res = await userApi.get(
          `/deposit/${loggedUser._id}`,
          signal ? { signal } : undefined
        );

        const payload = res?.data?.data;

        if (!Array.isArray(payload) || payload.length === 0) {
          setTransactionData([]);
          setError("No deposit data available.");
          return;
        }

        const normalized = payload.map((item: any) => ({
          _id: item._id ?? item.id,
          bonusDetails: item.bonusDetails,
          mt5Account: item.mt5Account || item.accountNumber || item.account || "N/A",
          accountType: item.accountType || item.type || "N/A",
          deposit: item.deposit ?? item.amount ?? 0,
          method: (item.method || "N/A").toString(),
          createdAt: item.createdAt || item.created_at || item.created || null,
          updatedAt: item.updatedAt || item.updated_at || item.updated || null,
          depositSS: item.depositSS || item.attachment || item.file || null,
          status: item.status || "unknown",
        }));

        setTransactionData(normalized);
        return;
      }

      res = await userApi.get("/account-txn", signal ? { signal } : undefined);
      const payload = res?.data?.data;

      if (!Array.isArray(payload) || payload.length === 0) {
        setTransactionData([]);
        setError("No account transaction data available.");
        return;
      }

      const normalized = payload.map((item: any) => ({
        _id: item._id,
        direction: item.direction || "unknown",
        fromAccountNumber: item.fromAccountNumber || "—",
        toAccountNumber: item.toAccountNumber || "—",
        amount: Number(item.amount || 0),
        status: item.status || "unknown",
        note: item.note || "",
        failureReason: item.failureReason || null,
        createdAt: item.createdAt || null,
        updatedAt: item.updatedAt || null,
      }));

      setTransactionData(normalized);
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.message === "canceled") return;

      setTransactionData([]);
      setError(`Failed to fetch ${tradeType} data. Please try again.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    fetchTransactionData(activeTab, controller.signal);
    return () => controller.abort();
  }, [activeTab, loggedUser?._id]);

  const filtered = useMemo(() => {
    if (!q.trim()) return transactionData;

    const term = q.trim().toLowerCase();

    return transactionData.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? "").toLowerCase().includes(term)
      )
    );
  }, [q, transactionData]);

  const stats = useMemo(() => {
    if (activeTab === "deposit") {
      const total = filtered.reduce((sum, item: any) => sum + (Number(item.deposit) || 0), 0);
      const approved = filtered.filter(
        (item: any) => String(item.status).toLowerCase() === "approved"
      ).length;
      const pending = filtered.filter(
        (item: any) => String(item.status).toLowerCase() === "pending"
      ).length;

      return {
        total,
        a: approved,
        b: pending,
        title: "Deposits",
        aLabel: "Approved",
        bLabel: "Pending",
      };
    }

    if (activeTab === "withdrawal") {
      const total = filtered.reduce((sum, item: any) => sum + (Number(item.amount) || 0), 0);
      const approved = filtered.filter(
        (item: any) => String(item.status).toLowerCase() === "approved"
      ).length;
      const pending = filtered.filter(
        (item: any) => String(item.status).toLowerCase() === "pending"
      ).length;

      return {
        total,
        a: approved,
        b: pending,
        title: "Withdrawals",
        aLabel: "Approved",
        bLabel: "Pending",
      };
    }

    const totalAmount = filtered.reduce(
      (sum, item: any) => sum + (Number(item.amount) || 0),
      0
    );
    const sentCount = filtered.filter(
      (item: any) => String(item.direction).toLowerCase() === "sent"
    ).length;
    const receivedCount = filtered.filter(
      (item: any) => String(item.direction).toLowerCase() === "received"
    ).length;

    return {
      total: totalAmount,
      a: sentCount,
      b: receivedCount,
      title: "Account Transfers",
      aLabel: "Sent",
      bLabel: "Received",
    };
  }, [filtered, activeTab]);


  const tabs = [
    { key: "deposit", label: "Deposits" },
    { key: "withdrawal", label: "Withdrawals" },
    { key: "account", label: "Account Transfers" },
  ];
  const accountColumn = {
    key: "mt5Account",
    header: "MT5 Account",
    primary: true,
    cell: (r: any) => r?.mt5Account ?? "—",
  };

  const depositColumns = [
    accountColumn,
    {
      key: "accountType",
      header: "Type",
      secondary: true,
      cell: (r: any) => r?.accountType || r?.groupName || "—",
    },
    {
      key: "deposit",
      header: "Deposit",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (r: any) => (
        <span className="font-semibold">{money(r?.deposit ?? r?.amount)}</span>
      ),
    },
    {
      key: "method",
      header: "Method",
      cell: (r: any) => r?.method || "—",
    },
    {
      key: "bonus",
      header: "Bonus",
      align: "right",
      numeric: true,
      cell: (r: any) =>
        Number(r?.bonusDetails?.bonusAmount || 0) > 0 ? (
          <span className="text-primary-text">
            +{money(r.bonusDetails.bonusAmount)}
          </span>
        ) : (
          <span className="text-subtle">—</span>
        ),
    },
    {
      key: "createdAt",
      header: "Requested",
      cell: (r: any) => (
        <span className="text-subtle">{formatDate(r?.createdAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r: any) => <StatusBadge status={r?.status} />,
    },
  ];

  const withdrawalColumns = [
    accountColumn,
    {
      key: "accountType",
      header: "Type",
      secondary: true,
      cell: (r: any) => r?.accountType || r?.groupName || "—",
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (r: any) => (
        <span className="font-semibold">{money(r?.amount)}</span>
      ),
    },
    {
      key: "method",
      header: "Method",
      cell: (r: any) => r?.method || "—",
    },
    {
      key: "lastBalance",
      header: "Balance after",
      align: "right",
      numeric: true,
      cell: (r: any) =>
        r?.lastBalance != null ? money(r.lastBalance) : <span className="text-subtle">—</span>,
    },
    {
      key: "createdAt",
      header: "Requested",
      cell: (r: any) => (
        <span className="text-subtle">{formatDate(r?.createdAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r: any) => <StatusBadge status={r?.status} />,
    },
  ];

  const accountColumns = [
    {
      key: "direction",
      header: "Direction",
      primary: true,
      cell: (r: any) => {
        const sent = String(r?.direction).toLowerCase() === "sent";
        return (
          <span
            className={`font-semibold ${sent ? "text-loss" : "text-profit"}`}
          >
            {sent ? "Sent" : "Received"}
          </span>
        );
      },
    },
    {
      key: "from",
      header: "From",
      secondary: true,
      numeric: true,
      cell: (r: any) => `#${r?.fromAccountNumber ?? r?.fromAccount ?? r?.from ?? "—"}`,
    },
    {
      key: "to",
      header: "To",
      numeric: true,
      cell: (r: any) => `#${r?.toAccountNumber ?? r?.toAccount ?? r?.to ?? "—"}`,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (r: any) => (
        <span className="font-semibold">{money(r?.amount)}</span>
      ),
    },
    {
      key: "createdAt",
      header: "When",
      cell: (r: any) => (
        <span className="text-subtle">{formatDate(r?.createdAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r: any) => <StatusBadge status={r?.status || "completed"} />,
    },
  ];

  const columns =
    activeTab === "deposit"
      ? depositColumns
      : activeTab === "withdrawal"
      ? withdrawalColumns
      : accountColumns;

  return (
    <BlotterPage
      title="Transactions"
      description="Your deposits, payouts and transfers between accounts."
      actions={
        <Button
          variant="secondary"
          onClick={() => fetchTransactionData(activeTab)}
          loading={loading}
          leftIcon={<RefreshCcw className="h-4 w-4" />}
        >
          Refresh
        </Button>
      }
      readouts={[
        {
          key: "total",
          label: `${stats.title} total`,
          value: money(stats.total),
          tone: "brand",
          icon: <Wallet className="h-4 w-4" />,
        },
        {
          key: "a",
          label: stats.aLabel,
          value: String(stats.a),
          tone: activeTab === "account" ? "warn" : "ok",
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          key: "b",
          label: stats.bLabel,
          value: String(stats.b),
          tone: activeTab === "account" ? "ok" : "warn",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          key: "count",
          label: "Records",
          value: String(filtered.length),
          tone: "info",
          icon: <Gauge className="h-4 w-4" />,
        },
      ]}
      filter={{
        search: q,
        onSearchChange: setQ,
        searchPlaceholder: "account, method, reference",
        activeChip: activeTab,
        onChipChange: (key: any) => setActiveTab(key),
        chips: tabs.map((t) => ({
          key: t.key,
          label: t.label,
          tone: "primary",
        })),
        summary: `${filtered.length} of ${transactionData.length}`,
      }}
      columns={columns}
      rows={filtered}
      keyField="_id"
      loading={loading}
      empty={
        <UiEmptyState
          title={error ? "Could not load transactions" : `No ${activeTab} records`}
          description={
            error ||
            "Records appear here once you deposit, withdraw or transfer."
          }
          action={
            <Button
              variant="soft"
              onClick={() => fetchTransactionData(activeTab)}
            >
              Try again
            </Button>
          }
        />
      }
    />
  );
}
