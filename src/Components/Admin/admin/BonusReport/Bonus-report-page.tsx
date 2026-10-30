import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { adminApi } from "../../../../utils/apiClients";
import {
  Badge,
  BlotterPage,
  Button,
  DataTable,
  EmptyState,
  Field,
  Input,
  Modal,
  Skeleton,
  StatusBadge,
  Tabs,
  Well,
} from "@/Components/ui";

/**
 * Bonus reports.
 *
 * Three views of the same data — payouts, the wallet ledger, and a per-user
 * roll-up — so this is one blotter with a tab bar rather than three pages or
 * three hand-built tables. Each tab supplies its own column set, rows and
 * pagination; the shell, filters, readouts and footer are shared.
 *
 * The page previously carried eleven local components (`PayoutTable`,
 * `LedgerTable`, `UsersTable`, `FilterInput`, `MiniStat`, `LoadingRow`,
 * `EmptyRow`, `LoadingCard`, `EmptyCard`, a portal modal and more), each
 * branching on `isDark`. All of that is the design system now.
 */

type SummaryResponse = {
  totalPayouts: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  totalBonusAmount: number;
  totalSuccessBonusAmount: number;
  totalLotProcessed: number;
  totalWalletDebit: number;
  ledgerCount: number;
};

type UserLite = {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  referralAccount?: string;
  bonusWallet?: number;
};

type PayoutRow = {
  _id: string;
  userId?: UserLite;
  mt5Account?: string;
  totalLot?: number;
  bonusAmount?: number;
  status?: "success" | "failed" | "skipped" | string;
  createdAt?: string;
  updatedAt?: string;
  note?: string;
};

type LedgerRow = {
  _id: string;
  userId?: UserLite;
  type?: string;
  amount?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  referenceId?: string;
  referenceModel?: string;
  note?: string;
  createdAt?: string;
};

type UserOverviewRow = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  referralAccount?: string;
  bonusWallet?: number;
  totalPayouts?: number;
  totalSuccessfulPayouts?: number;
  totalBonusReleased?: number;
  totalWalletDebited?: number;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type PayoutDetailResponse = {
  payout?: PayoutRow;
  relatedLedger?: LedgerRow[];
};

type TabKey = "payouts" | "ledger" | "users";

const PAGE_LIMIT = 10;

const defaultSummary: SummaryResponse = {
  totalPayouts: 0,
  successCount: 0,
  failedCount: 0,
  skippedCount: 0,
  totalBonusAmount: 0,
  totalSuccessBonusAmount: 0,
  totalLotProcessed: 0,
  totalWalletDebit: 0,
  ledgerCount: 0,
};

const defaultPagination: Pagination = {
  total: 0,
  page: 1,
  limit: PAGE_LIMIT,
  totalPages: 1,
};

const fullName = (user?: { firstName?: string; lastName?: string }) => {
  const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  return name || "--";
};

const currency = (value?: number) => {
  const num = Number(value || 0);
  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const number = (value?: number) => Number(value || 0).toLocaleString("en-US");

const formatDate = (date?: string) => {
  if (!date) return "--";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "--";

  const formattedDate = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const formattedTime = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${formattedDate}, ${formattedTime}`;
};

/** A labelled value inside the detail modal. */
const DetailRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex items-baseline justify-between gap-3 border-b border-line py-1.5 last:border-b-0">
    <span className="lbl shrink-0">{label}</span>
    <span className="numeric min-w-0 truncate text-xs text-text">
      {value ?? "--"}
    </span>
  </div>
);

const BonusReports = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("payouts");

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [summary, setSummary] = useState<SummaryResponse>(defaultSummary);

  const [payoutRows, setPayoutRows] = useState<PayoutRow[]>([]);
  const [ledgerRows, setLedgerRows] = useState<LedgerRow[]>([]);
  const [userRows, setUserRows] = useState<UserOverviewRow[]>([]);

  const [payoutPagination, setPayoutPagination] =
    useState<Pagination>(defaultPagination);
  const [ledgerPagination, setLedgerPagination] =
    useState<Pagination>(defaultPagination);
  const [userPagination, setUserPagination] =
    useState<Pagination>(defaultPagination);

  const [payoutPage, setPayoutPage] = useState(1);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [payoutDetail, setPayoutDetail] =
    useState<PayoutDetailResponse | null>(null);

  const [filters, setFilters] = useState({
    userId: "",
    mt5Account: "",
    status: "",
    minLot: "",
    maxLot: "",
    type: "",
    referenceModel: "",
    search: "",
    startDate: "",
    endDate: "",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setPayoutPage(1);
    setLedgerPage(1);
    setUserPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setPayoutPage(1);
    setLedgerPage(1);
    setUserPage(1);
    setFilters({
      userId: "",
      mt5Account: "",
      status: "",
      minLot: "",
      maxLot: "",
      type: "",
      referenceModel: "",
      search: "",
      startDate: "",
      endDate: "",
    });
    setDebouncedSearch("");
  };

  const commonQuery = useMemo(
    () => ({
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    }),
    [filters.startDate, filters.endDate]
  );

  const payoutQuery = useMemo(
    () => ({
      ...commonQuery,
      page: payoutPage,
      limit: PAGE_LIMIT,
      userId: filters.userId || undefined,
      mt5Account: filters.mt5Account || undefined,
      status: filters.status || undefined,
      minLot: filters.minLot || undefined,
      maxLot: filters.maxLot || undefined,
    }),
    [
      commonQuery,
      payoutPage,
      filters.userId,
      filters.mt5Account,
      filters.status,
      filters.minLot,
      filters.maxLot,
    ]
  );

  const ledgerQuery = useMemo(
    () => ({
      ...commonQuery,
      page: ledgerPage,
      limit: PAGE_LIMIT,
      userId: filters.userId || undefined,
      type: filters.type || undefined,
      referenceModel: filters.referenceModel || undefined,
    }),
    [
      commonQuery,
      ledgerPage,
      filters.userId,
      filters.type,
      filters.referenceModel,
    ]
  );

  const usersQuery = useMemo(
    () => ({
      page: userPage,
      limit: PAGE_LIMIT,
      search: debouncedSearch || undefined,
    }),
    [userPage, debouncedSearch]
  );

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await adminApi.get("/bonus-report/summary", {
        params: {
          ...commonQuery,
          userId: filters.userId || undefined,
          mt5Account: filters.mt5Account || undefined,
          status: filters.status || undefined,
          minLot: filters.minLot || undefined,
          maxLot: filters.maxLot || undefined,
          type: filters.type || undefined,
          referenceModel: filters.referenceModel || undefined,
        },
      });

      setSummary(res?.data?.data || defaultSummary);
    } catch (error) {
      console.error("Failed to fetch summary", error);
      toast.error("Failed to load summary");
    } finally {
      setSummaryLoading(false);
    }
  }, [
    commonQuery,
    filters.userId,
    filters.mt5Account,
    filters.status,
    filters.minLot,
    filters.maxLot,
    filters.type,
    filters.referenceModel,
  ]);

  const fetchPayouts = useCallback(async () => {
    setTableLoading(true);
    try {
      const res = await adminApi.get("/bonus-report/payouts", {
        params: payoutQuery,
      });
      setPayoutRows(res?.data?.data || []);
      setPayoutPagination(res?.data?.pagination || defaultPagination);
    } catch (error) {
      console.error("Failed to fetch payouts", error);
      toast.error("Failed to load payout report");
    } finally {
      setTableLoading(false);
    }
  }, [payoutQuery]);

  const fetchLedger = useCallback(async () => {
    setTableLoading(true);
    try {
      const res = await adminApi.get("/bonus-report/ledger", {
        params: ledgerQuery,
      });
      setLedgerRows(res?.data?.data || []);
      setLedgerPagination(res?.data?.pagination || defaultPagination);
    } catch (error) {
      console.error("Failed to fetch ledger", error);
      toast.error("Failed to load ledger report");
    } finally {
      setTableLoading(false);
    }
  }, [ledgerQuery]);

  const fetchUsers = useCallback(async () => {
    setTableLoading(true);
    try {
      const res = await adminApi.get("/bonus-report/users", {
        params: usersQuery,
      });
      setUserRows(res?.data?.data || []);
      setUserPagination(res?.data?.pagination || defaultPagination);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to load wallet overview");
    } finally {
      setTableLoading(false);
    }
  }, [usersQuery]);

  const fetchActiveTabData = useCallback(async () => {
    if (activeTab === "payouts") return fetchPayouts();
    if (activeTab === "ledger") return fetchLedger();
    return fetchUsers();
  }, [activeTab, fetchPayouts, fetchLedger, fetchUsers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchSummary(), fetchActiveTabData()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchActiveTabData();
  }, [fetchActiveTabData]);

  const openPayoutDetail = async (id: string) => {
    setSelectedPayoutId(id);
    setDetailLoading(true);
    try {
      const res = await adminApi.get(`/bonus-report/payouts/${id}`);
      setPayoutDetail(res?.data?.data || null);
    } catch (error) {
      console.error("Failed to fetch payout detail", error);
      toast.error("Failed to load payout detail");
      setSelectedPayoutId(null);
      setPayoutDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedPayoutId(null);
    setPayoutDetail(null);
    setDetailLoading(false);
  };

  const currentPagination =
    activeTab === "payouts"
      ? payoutPagination
      : activeTab === "ledger"
      ? ledgerPagination
      : userPagination;

  const currentPage =
    activeTab === "payouts"
      ? payoutPage
      : activeTab === "ledger"
      ? ledgerPage
      : userPage;

  const setCurrentPage = (page: number) => {
    if (activeTab === "payouts") setPayoutPage(page);
    else if (activeTab === "ledger") setLedgerPage(page);
    else setUserPage(page);
  };

  /* ---- the three column sets ---------------------------------------- */

  const userCell = (user?: UserLite) => (
    <div className="min-w-0">
      <div className="truncate font-semibold text-text">{fullName(user)}</div>
      <div className="numeric mt-0.5 truncate text-xs text-subtle">
        {user?.email || "--"}
      </div>
    </div>
  );

  const payoutColumns = [
    {
      key: "user",
      header: "User",
      primary: true,
      cell: (row: PayoutRow) => userCell(row?.userId),
    },
    {
      key: "account",
      header: "Referral / MT5",
      secondary: true,
      numeric: true,
      cell: (row: PayoutRow) =>
        `${row?.userId?.referralAccount || "--"} · ${row?.mt5Account || "--"}`,
    },
    {
      key: "totalLot",
      header: "Lot",
      align: "right",
      numeric: true,
      cell: (row: PayoutRow) => number(row?.totalLot),
    },
    {
      key: "bonusAmount",
      header: "Bonus",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (row: PayoutRow) => (
        <span className="font-semibold">{currency(row?.bonusAmount)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row: PayoutRow) => <StatusBadge status={row?.status} />,
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row: PayoutRow) => (
        <span className="numeric text-xs text-subtle">
          {formatDate(row?.createdAt)}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      cardFull: true,
      cell: (row: PayoutRow) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e: any) => {
              e.stopPropagation();
              openPayoutDetail(row._id);
            }}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  const ledgerColumns = [
    {
      key: "user",
      header: "User",
      primary: true,
      cell: (row: LedgerRow) => userCell(row?.userId),
    },
    {
      key: "type",
      header: "Type",
      secondary: true,
      cell: (row: LedgerRow) => (
        <Badge tone="neutral" dot={false}>
          {row?.type || "--"}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (row: LedgerRow) => (
        <span
          className={
            Number(row?.amount || 0) < 0
              ? "font-semibold text-loss"
              : "font-semibold text-profit"
          }
        >
          {currency(row?.amount)}
        </span>
      ),
    },
    {
      key: "balanceBefore",
      header: "Before",
      align: "right",
      numeric: true,
      cell: (row: LedgerRow) => currency(row?.balanceBefore),
    },
    {
      key: "balanceAfter",
      header: "After",
      align: "right",
      numeric: true,
      cell: (row: LedgerRow) => currency(row?.balanceAfter),
    },
    {
      key: "reference",
      header: "Reference",
      cell: (row: LedgerRow) => (
        <div className="min-w-0">
          <div className="numeric truncate text-xs text-text">
            {row?.referenceModel || "--"}
          </div>
          <div className="numeric truncate text-[11px] text-subtle">
            {String(row?.referenceId || "--").slice(-10)}
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row: LedgerRow) => (
        <span className="numeric text-xs text-subtle">
          {formatDate(row?.createdAt)}
        </span>
      ),
    },
  ];

  const userColumns = [
    {
      key: "user",
      header: "User",
      primary: true,
      cell: (row: UserOverviewRow) => userCell(row),
    },
    {
      key: "referralAccount",
      header: "Referral",
      secondary: true,
      numeric: true,
      cell: (row: UserOverviewRow) => row?.referralAccount || "--",
    },
    {
      key: "bonusWallet",
      header: "Bonus wallet",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (row: UserOverviewRow) => (
        <span className="font-semibold">{currency(row?.bonusWallet)}</span>
      ),
    },
    {
      key: "totalPayouts",
      header: "Total payouts",
      align: "right",
      numeric: true,
      cell: (row: UserOverviewRow) => number(row?.totalPayouts),
    },
    {
      key: "totalSuccessfulPayouts",
      header: "Successful",
      align: "right",
      numeric: true,
      cell: (row: UserOverviewRow) => (
        <span className="text-profit">
          {number(row?.totalSuccessfulPayouts)}
        </span>
      ),
    },
    {
      key: "totalBonusReleased",
      header: "Released bonus",
      align: "right",
      numeric: true,
      cell: (row: UserOverviewRow) => currency(row?.totalBonusReleased),
    },
    {
      key: "totalWalletDebited",
      header: "Wallet debited",
      align: "right",
      numeric: true,
      cell: (row: UserOverviewRow) => currency(row?.totalWalletDebited),
    },
  ];

  const tabConfig: Record<
    TabKey,
    { columns: any[]; rows: any[]; onRowClick?: (row: any) => void }
  > = {
    payouts: {
      columns: payoutColumns,
      rows: payoutRows,
      onRowClick: (row: PayoutRow) => openPayoutDetail(row._id),
    },
    ledger: { columns: ledgerColumns, rows: ledgerRows },
    users: { columns: userColumns, rows: userRows },
  };

  const active = tabConfig[activeTab];

  /* Each tab filters on different fields, so the extra controls change with
     it rather than offering filters the endpoint will ignore. */
  const extraControls =
    activeTab === "payouts" ? (
      <>
        <Field label="MT5" className="w-[110px]">
          <Input
            value={filters.mt5Account}
            onChange={(e: any) => updateFilter("mt5Account", e.target.value)}
            placeholder="Account"
            aria-label="MT5 account"
            className="!min-h-8"
          />
        </Field>
        <Field label="Min lot" className="w-[90px]">
          <Input
            value={filters.minLot}
            onChange={(e: any) => updateFilter("minLot", e.target.value)}
            placeholder="0"
            aria-label="Minimum lot"
            className="!min-h-8"
          />
        </Field>
        <Field label="Max lot" className="w-[90px]">
          <Input
            value={filters.maxLot}
            onChange={(e: any) => updateFilter("maxLot", e.target.value)}
            placeholder="∞"
            aria-label="Maximum lot"
            className="!min-h-8"
          />
        </Field>
      </>
    ) : activeTab === "ledger" ? (
      <>
        <Field label="Type" className="w-[130px]">
          <Input
            value={filters.type}
            onChange={(e: any) => updateFilter("type", e.target.value)}
            placeholder="credit, debit"
            aria-label="Ledger type"
            className="!min-h-8"
          />
        </Field>
        <Field label="Model" className="w-[130px]">
          <Input
            value={filters.referenceModel}
            onChange={(e: any) =>
              updateFilter("referenceModel", e.target.value)
            }
            placeholder="Reference model"
            aria-label="Reference model"
            className="!min-h-8"
          />
        </Field>
      </>
    ) : null;

  const dateControls = (
    <>
      <Field label="From" className="w-[140px]">
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e: any) => updateFilter("startDate", e.target.value)}
          aria-label="Start date"
          className="!min-h-8"
        />
      </Field>
      <Field label="To" className="w-[140px]">
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e: any) => updateFilter("endDate", e.target.value)}
          aria-label="End date"
          className="!min-h-8"
        />
      </Field>
    </>
  );

  const detailPayout = payoutDetail?.payout;

  return (
    <>
      <BlotterPage
        breadcrumb="Reports / Bonus"
        title="Bonus reports"
        description="Lot-based bonus payouts, the wallet ledger behind them, and a per-user roll-up."
        actions={
          <Button
            variant="secondary"
            onClick={handleRefresh}
            loading={refreshing || summaryLoading}
          >
            Refresh
          </Button>
        }
        readouts={[
          {
            key: "payouts",
            label: "Total payouts",
            value: number(summary.totalPayouts),
            helper: `${summary.successCount} ok · ${summary.failedCount} failed`,
            tone: summary.failedCount ? "warn" : "brand",
          },
          {
            key: "released",
            label: "Released bonus",
            value: currency(summary.totalSuccessBonusAmount),
            helper: `Gross ${currency(summary.totalBonusAmount)}`,
            tone: "ok",
          },
          {
            key: "debited",
            label: "Wallet debited",
            value: currency(summary.totalWalletDebit),
            helper: `${summary.ledgerCount} entries`,
            tone: "bad",
          },
          {
            key: "lots",
            label: "Lot processed",
            value: number(summary.totalLotProcessed),
            helper: `${summary.skippedCount} skipped`,
          },
        ]}
        filter={{
          search: filters.search,
          onSearchChange: (v: string) => updateFilter("search", v),
          searchPlaceholder:
            activeTab === "users" ? "name, email, referral" : "user id",
          activeChip: activeTab === "payouts" ? filters.status : undefined,
          onChipChange:
            activeTab === "payouts"
              ? (key: string) => updateFilter("status", key)
              : undefined,
          chips:
            activeTab === "payouts"
              ? [
                  { key: "", label: "All", tone: "primary" },
                  {
                    key: "success",
                    label: "Success",
                    tone: "success",
                    count: summary.successCount,
                  },
                  {
                    key: "failed",
                    label: "Failed",
                    tone: "danger",
                    count: summary.failedCount,
                  },
                  {
                    key: "skipped",
                    label: "Skipped",
                    tone: "neutral",
                    count: summary.skippedCount,
                  },
                ]
              : [],
          extra: (
            <>
              {extraControls}
              {dateControls}
            </>
          ),
          summary: `${number(currentPagination.total)} records`,
        }}
        filterPanel={
          <div className="space-y-3">
            {extraControls}
            {dateControls}
            <Field label="User id">
              <Input
                value={filters.userId}
                onChange={(e: any) => updateFilter("userId", e.target.value)}
                placeholder="Exact user id"
              />
            </Field>
            <Button variant="soft" className="w-full" onClick={resetFilters}>
              Reset filters
            </Button>
          </div>
        }
        columns={active.columns}
        rows={active.rows}
        loading={tableLoading}
        onRowClick={active.onRowClick}
        rowEdge={(row: any) =>
          activeTab === "payouts" && row?.status === "failed" ? "danger" : null
        }
        empty={
          <EmptyState
            title="No records"
            description="Nothing matches the current filters for this tab."
            action={
              <Button variant="soft" onClick={resetFilters}>
                Reset filters
              </Button>
            }
          />
        }
        footer={
          <>
            <span className="numeric text-xs text-subtle">
              Page {currentPage} of {currentPagination.totalPages || 1}
            </span>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage <= 1 || tableLoading}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setCurrentPage(
                    Math.min(
                      currentPage + 1,
                      currentPagination.totalPages || 1
                    )
                  )
                }
                disabled={
                  currentPage >= (currentPagination.totalPages || 1) ||
                  tableLoading
                }
              >
                Next
              </Button>
            </div>
          </>
        }
      >
        <Tabs
          className="mb-2"
          value={activeTab}
          onChange={(key: string) => setActiveTab(key as TabKey)}
          tabs={[
            {
              key: "payouts",
              label: "Payout report",
              count: payoutPagination.total,
            },
            {
              key: "ledger",
              label: "Wallet ledger",
              count: ledgerPagination.total,
            },
            {
              key: "users",
              label: "User overview",
              count: userPagination.total,
            },
          ]}
        />
      </BlotterPage>

      <Modal
        open={!!selectedPayoutId}
        onClose={closeDetail}
        title="Payout detail"
        size="lg"
      >
        {detailLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6" />
            <Skeleton className="h-24" />
            <Skeleton className="h-32" />
          </div>
        ) : detailPayout ? (
          <div className="space-y-4">
            <Well>
              <DetailRow label="User" value={fullName(detailPayout.userId)} />
              <DetailRow label="Email" value={detailPayout.userId?.email} />
              <DetailRow
                label="Referral"
                value={detailPayout.userId?.referralAccount}
              />
              <DetailRow label="MT5 account" value={detailPayout.mt5Account} />
              <DetailRow label="Lot" value={number(detailPayout.totalLot)} />
              <DetailRow
                label="Bonus"
                value={currency(detailPayout.bonusAmount)}
              />
              <DetailRow
                label="Status"
                value={<StatusBadge status={detailPayout.status} />}
              />
              <DetailRow
                label="Created"
                value={formatDate(detailPayout.createdAt)}
              />
              <DetailRow
                label="Updated"
                value={formatDate(detailPayout.updatedAt)}
              />
            </Well>

            {detailPayout.note ? (
              <div>
                <span className="lbl">Note</span>
                <p className="mt-1 text-sm text-muted">{detailPayout.note}</p>
              </div>
            ) : null}

            <div>
              <span className="lbl">Related ledger entries</span>
              <div className="mt-1.5">
                <DataTable
                  columns={[
                    {
                      key: "type",
                      header: "Type",
                      primary: true,
                      cell: (row: LedgerRow) => row?.type || "--",
                    },
                    {
                      key: "amount",
                      header: "Amount",
                      align: "right",
                      numeric: true,
                      trailing: true,
                      cell: (row: LedgerRow) => currency(row?.amount),
                    },
                    {
                      key: "balanceAfter",
                      header: "After",
                      align: "right",
                      numeric: true,
                      cell: (row: LedgerRow) => currency(row?.balanceAfter),
                    },
                    {
                      key: "createdAt",
                      header: "Created",
                      cell: (row: LedgerRow) => formatDate(row?.createdAt),
                    },
                  ]}
                  rows={payoutDetail?.relatedLedger || []}
                  empty={
                    <EmptyState
                      title="No ledger entries"
                      description="This payout did not move the bonus wallet."
                    />
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title="Nothing to show"
            description="The payout detail could not be loaded."
          />
        )}
      </Modal>
    </>
  );
};

export default BonusReports;
