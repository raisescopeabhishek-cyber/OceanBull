import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { adminApi } from "../../../utils/apiClients.js";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DashboardPage,
  DataTable,
  EmptyState,
  EquityCurve,
  FlowBars,
  Meter,
  SegmentedControl,
  Skeleton,
} from "@/Components/ui";

/**
 * Admin report dashboard.
 *
 * This page used to carry its own private design system — a gradient hero, an
 * `IconBox`, and local `StatCard`, `Panel`, `StatusList`, `CashflowChart`,
 * `RecentTrendTable` and `SnapshotRow` components, each branching on `isDark`
 * by hand. All of that is now the shared design system, so the page is the
 * data and the layout only, and it follows the theme without knowing about it.
 *
 * The layout is the overview archetype: net cashflow is the one headline
 * figure, the money queues sit in the main column, and the operational
 * panels stack to the right.
 */

const RANGE_OPTIONS = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "180d", label: "180D" },
  { value: "365d", label: "1Y" },
  { value: "all", label: "All" },
];

const REPORT_ENDPOINTS = [
  "/report-dashboard/overview",
  "/admin/report-dashboard/overview",
];

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const money = (value) =>
  "$" +
  toNumber(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const count = (value) => toNumber(value).toLocaleString("en-US");

const shortDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
};

const getPayloadData = (response) => {
  const payload = response?.data || {};
  return payload?.data || payload;
};

/** The endpoint moved once; try both and only swallow a 404. */
async function getReportDashboard(params) {
  let lastError = null;

  for (const endpoint of REPORT_ENDPOINTS) {
    try {
      const response = await adminApi.get(endpoint, { params });
      return getPayloadData(response);
    } catch (error) {
      lastError = error;

      if (error?.response?.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError;
}

/**
 * A titled panel. `Panel` in the design system is an alias of `Card` and
 * carries no header, so the header, divider and body padding live here once
 * instead of being repeated at every call site.
 */
const Section = ({ title, actions, bare = false, children, className }) => (
  <Card className={className}>
    <CardHeader title={title} actions={actions} className="px-3.5 py-2.5" />
    {bare ? children : <div className="p-3.5">{children}</div>}
  </Card>
);

/**
 * A status breakdown as meters rather than a list of pills: the bar lengths
 * make "most of these are pending" readable without comparing numbers.
 */
const StatusMeters = ({ items = [], loading, onOpen, emptyText }) => {
  if (loading) {
    return (
      <div className="space-y-2.5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9" />
        ))}
      </div>
    );
  }

  if (!items?.length) {
    return (
      <p className="text-xs text-subtle">{emptyText || "No data found"}</p>
    );
  }

  const max = Math.max(...items.map((item) => toNumber(item?.count)), 1);

  const toneFor = (label) => {
    const key = label.toLowerCase();
    if (key.includes("approve") || key.includes("pass") || key.includes("resolved"))
      return "profit";
    if (key.includes("reject") || key.includes("fail")) return "loss";
    if (key.includes("pending") || key.includes("open")) return "warning";
    return "primary";
  };

  return (
    <div className="space-y-2.5">
      {items.slice(0, 6).map((item, index) => {
        const label = String(item?._id || "Unknown").replaceAll("_", " ");
        const value = toNumber(item?.count);

        return (
          <Meter
            key={`${label}-${index}`}
            label={label}
            value={count(value)}
            pct={(value / max) * 100}
            tone={toneFor(label)}
          />
        );
      })}

      {onOpen ? (
        <Button size="sm" variant="soft" className="w-full" onClick={onOpen}>
          Open queue
        </Button>
      ) : null}
    </div>
  );
};

export default function DashboardBase() {
  const navigate = useNavigate();

  const [range, setRange] = useState("30d");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const goTo = (path) => {
    if (!path) return;
    navigate(path);
  };

  const loadDashboard = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      setError("");

      const data = await getReportDashboard({ range });
      setDashboard(data);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load report dashboard";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const overview = dashboard?.overview || {};
  const statuses = dashboard?.statuses || {};
  const trends = dashboard?.trends?.performance || [];

  const users = overview?.users || {};
  const cashflow = overview?.cashflow || {};
  const challenges = overview?.challenges || {};
  const trading = overview?.trading || {};
  const bonus = overview?.bonus || {};
  const insurance = overview?.insurance || {};

  const approvedDeposits = cashflow?.approvedDeposits || {};
  const approvedWithdrawals = cashflow?.approvedWithdrawals || {};
  const ibWithdrawals = cashflow?.ibWithdrawals || {};
  const openTrades = trading?.openTrades || {};
  const closedTrades = trading?.closedTrades || {};

  const netCashflow = toNumber(cashflow?.netCashflow);
  const isPositiveCashflow = netCashflow >= 0;

  /* The chart beside the headline figure shows net flow per day around a zero
     axis, which is the shape of the number the hero reports. */
  const flowSeries = useMemo(
    () =>
      trends.slice(-24).map((row) => ({
        label: shortDate(row?.date),
        value: toNumber(row?.net),
      })),
    [trends]
  );

  const depositSeries = useMemo(
    () =>
      trends.slice(-24).map((row) => ({
        label: shortDate(row?.date),
        value: toNumber(row?.deposits),
      })),
    [trends]
  );

  const userSeries = useMemo(
    () =>
      trends.slice(-24).map((row) => ({
        label: shortDate(row?.date),
        value: toNumber(row?.users),
      })),
    [trends]
  );

  const trendRows = useMemo(() => [...trends].slice(-10).reverse(), [trends]);

  const trendColumns = [
    {
      key: "date",
      header: "Date",
      primary: true,
      cell: (row) => shortDate(row?.date),
    },
    {
      key: "deposits",
      header: "Deposits",
      align: "right",
      numeric: true,
      cell: (row) => money(row?.deposits),
    },
    {
      key: "withdrawals",
      header: "Withdrawals",
      align: "right",
      numeric: true,
      cell: (row) => money(row?.withdrawals),
    },
    {
      key: "net",
      header: "Net",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (row) => (
        <span
          className={
            toNumber(row?.net) >= 0
              ? "font-semibold text-profit"
              : "font-semibold text-loss"
          }
        >
          {money(row?.net)}
        </span>
      ),
    },
    {
      key: "users",
      header: "New users",
      align: "right",
      numeric: true,
      cell: (row) => count(row?.users),
    },
    {
      key: "tradingProfit",
      header: "Trading P&L",
      align: "right",
      numeric: true,
      cell: (row) => (
        <span
          className={
            toNumber(row?.tradingProfit) >= 0 ? "text-profit" : "text-loss"
          }
        >
          {money(row?.tradingProfit)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {/* Range and refresh: the only controls on the page, so they sit above it. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <nav className="lbl">Admin / Reports</nav>
          <h1 className="truncate text-base font-bold text-text">
            Report dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <SegmentedControl
            options={RANGE_OPTIONS}
            value={range}
            onChange={setRange}
          />

          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadDashboard({ silent: true })}
            disabled={loading}
            loading={refreshing}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border-danger bg-danger-soft p-3">
          <p className="text-sm font-semibold text-danger">
            Unable to load dashboard
          </p>
          <p className="mt-1 text-xs text-danger/90">{error}</p>
          <Button
            variant="danger"
            size="sm"
            className="mt-3"
            onClick={() => loadDashboard()}
          >
            Try again
          </Button>
        </Card>
      ) : null}

      <DashboardPage
        hero={{
          label: `Net cashflow · ${range.toUpperCase()}`,
          value: loading ? "—" : money(netCashflow),
          delta: isPositiveCashflow ? "Net inflow" : "Net outflow",
          trend: isPositiveCashflow ? "up" : "down",
          breakdown: [
            {
              label: "Deposits in",
              value: money(approvedDeposits?.totalAmount),
              tone: "profit",
            },
            {
              label: "Withdrawals out",
              value: money(approvedWithdrawals?.totalAmount),
              tone: "loss",
            },
            {
              label: "IB payouts",
              value: money(ibWithdrawals?.totalAmount),
              tone: "loss",
            },
            {
              label: "Bonus paid",
              value: money(bonus?.payouts?.totalAmount),
            },
            {
              label: "Insurance claims",
              value: money(insurance?.claims?.totalAmount),
            },
          ],
        }}
        chart={
          loading ? (
            <Skeleton className="h-[110px]" />
          ) : (
            <FlowBars
              data={flowSeries}
              ariaLabel="Net cashflow per day over the selected range"
            />
          )
        }
        readouts={[
          {
            key: "deposits",
            label: "Approved deposits",
            value: money(approvedDeposits?.totalAmount),
            helper: `${count(approvedDeposits?.count)} records`,
            trend: "up",
            tone: "ok",
          },
          {
            key: "withdrawals",
            label: "Approved withdrawals",
            value: money(approvedWithdrawals?.totalAmount),
            helper: `${count(approvedWithdrawals?.count)} payouts`,
            trend: "down",
            tone: "bad",
          },
          {
            key: "users",
            label: "New users",
            value: count(users?.new),
            helper: `${count(users?.total)} total`,
            tone: "brand",
          },
          {
            key: "kyc",
            label: "KYC verified",
            value: count(users?.verifiedKyc),
            helper: `${count(users?.pendingKyc)} pending`,
            tone: users?.pendingKyc ? "warn" : "ok",
          },
          {
            key: "pnl",
            label: "Trading P&L",
            value: money(closedTrades?.totalProfit),
            helper: `${count(closedTrades?.winRate)}% win rate`,
            trend: toNumber(closedTrades?.totalProfit) >= 0 ? "up" : "down",
            tone: toNumber(closedTrades?.totalProfit) >= 0 ? "ok" : "bad",
          },
          {
            key: "open",
            label: "Open trades",
            value: count(openTrades?.count),
            helper: `${count(openTrades?.totalLot)} lots`,
            tone: "brand",
          },
        ]}
        aside={
          <>
            <Section
              title="Deposit queue"
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => goTo("/admin/deposit")}
                >
                  Open
                </Button>
              }
            >
              <StatusMeters
                items={statuses?.deposits}
                loading={loading}
                emptyText="No deposit records in range"
                onOpen={() => goTo("/admin/deposit")}
              />
            </Section>

            <Section
              title="Withdrawal queue"
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => goTo("/admin/withdrawal")}
                >
                  Open
                </Button>
              }
            >
              <StatusMeters
                items={statuses?.withdrawals}
                loading={loading}
                emptyText="No withdrawal records in range"
                onOpen={() => goTo("/admin/withdrawal")}
              />
            </Section>

            <Section title="Support tickets">
              <StatusMeters
                items={statuses?.tickets}
                loading={loading}
                emptyText="No tickets in range"
                onOpen={() => goTo("/admin/customerSupport/tickets")}
              />
            </Section>

            <Section title="New users">
              <div>
                {loading ? (
                  <Skeleton className="h-[120px]" />
                ) : (
                  <EquityCurve
                    data={userSeries}
                    ariaLabel="New users per day over the selected range"
                  />
                )}
              </div>
            </Section>
          </>
        }
      >
        <Section
          bare
          title="Daily report rows"
          action={
            <Badge tone="neutral" dot={false}>
              {range.toUpperCase()}
            </Badge>
          }
        >
          <DataTable
            columns={trendColumns}
            rows={trendRows}
            loading={loading}
            empty={
              <EmptyState
                title="No report rows"
                description="Nothing was recorded in the selected range."
              />
            }
          />
        </Section>

        <Section title="Deposit volume">
          <div>
            {loading ? (
              <Skeleton className="h-[120px]" />
            ) : (
              <EquityCurve
                data={depositSeries}
                ariaLabel="Approved deposit volume per day"
              />
            )}
          </div>
        </Section>

        <Section
          bare
          title="Challenges"
          action={
            <Button
              size="sm"
              variant="ghost"
              onClick={() => goTo("/admin/setup-challenges")}
            >
              Manage
            </Button>
          }
        >
          <div className="grid gap-2 p-3 sm:grid-cols-2">
            <div className="rounded-field border border-line bg-surface-2 p-2.5">
              <span className="lbl">Active</span>
              <div className="numeric mt-0.5 text-lg font-bold text-text">
                {count(challenges?.active)}
              </div>
              <span className="text-xs text-subtle">
                of {count(challenges?.total)} total
              </span>
            </div>

            <div className="rounded-field border border-line bg-surface-2 p-2.5">
              <span className="lbl">Passed / failed</span>
              <div className="numeric mt-0.5 text-lg font-bold">
                <span className="text-profit">{count(challenges?.passed)}</span>
                <span className="text-subtle"> / </span>
                <span className="text-loss">{count(challenges?.failed)}</span>
              </div>
              <span className="text-xs text-subtle">Closed outcomes</span>
            </div>

            <StatusMeters
              items={statuses?.challenges}
              loading={loading}
              emptyText="No challenge activity in range"
            />
          </div>
        </Section>

        <Section bare title="Partner and cover programmes">
          <div className="grid gap-2 p-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => goTo("/admin/ib-withdrawal")}
              className="tap rounded-field border border-line bg-surface-2 p-2.5 text-left hover:border-primary"
            >
              <span className="lbl">IB payouts</span>
              <div className="numeric mt-0.5 text-base font-bold text-text">
                {money(ibWithdrawals?.totalAmount)}
              </div>
              <span className="text-xs text-subtle">
                {count(ibWithdrawals?.count)} records
              </span>
            </button>

            <button
              type="button"
              onClick={() => goTo("/admin/BonusReports")}
              className="tap rounded-field border border-line bg-surface-2 p-2.5 text-left hover:border-primary"
            >
              <span className="lbl">Bonus payouts</span>
              <div className="numeric mt-0.5 text-base font-bold text-text">
                {money(bonus?.payouts?.totalAmount)}
              </div>
              <span className="text-xs text-subtle">
                {count(bonus?.payouts?.count)} records
              </span>
            </button>

            <button
              type="button"
              onClick={() => goTo("/admin/insurance-report")}
              className="tap rounded-field border border-line bg-surface-2 p-2.5 text-left hover:border-primary"
            >
              <span className="lbl">Insurance claims</span>
              <div className="numeric mt-0.5 text-base font-bold text-text">
                {money(insurance?.claims?.totalAmount)}
              </div>
              <span className="text-xs text-subtle">
                {count(insurance?.activeCoverage)} active covers
              </span>
            </button>
          </div>
        </Section>
      </DashboardPage>
    </div>
  );
}
