import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { adminApi } from "../../../../utils/apiClients";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Wallet,
  BadgeDollarSign,
  CircleDollarSign,
  BarChart3,
  X,
  Users,
} from "lucide-react";

type ThemeStore = {
  adminTheme?: {
    mode?: "light" | "dark";
  };
};

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

const BonusReports = () => {
  const mode = useSelector(
    (store: ThemeStore) => store.adminTheme?.mode || "light"
  );
  const isDark = mode === "dark";

  const [activeTab, setActiveTab] = useState<TabKey>("payouts");
  const [filtersOpen, setFiltersOpen] = useState(true);

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

  const summaryCards = [
    {
      title: "Total Payouts",
      value: summary.totalPayouts,
      subtitle: `${summary.successCount} success / ${summary.failedCount} failed`,
      icon: BadgeDollarSign,
      accent: isDark
        ? "text-blue-300 bg-blue-500/10"
        : "text-blue-700 bg-blue-50",
    },
    {
      title: "Released Bonus",
      value: currency(summary.totalSuccessBonusAmount),
      subtitle: `Gross ${currency(summary.totalBonusAmount)}`,
      icon: CircleDollarSign,
      accent: isDark
        ? "text-emerald-300 bg-emerald-500/10"
        : "text-emerald-700 bg-emerald-50",
    },
    {
      title: "Wallet Debited",
      value: currency(summary.totalWalletDebit),
      subtitle: `${summary.ledgerCount} debit entries`,
      icon: Wallet,
      accent: isDark
        ? "text-violet-300 bg-violet-500/10"
        : "text-violet-700 bg-violet-50",
    },
    {
      title: "Lot Processed",
      value: number(summary.totalLotProcessed),
      subtitle: `${summary.skippedCount} skipped payouts`,
      icon: BarChart3,
      accent: isDark
        ? "text-amber-300 bg-amber-500/10"
        : "text-amber-700 bg-amber-50",
    },
  ];

  const tabs: { key: TabKey; label: string; count: number; icon: any }[] = [
    {
      key: "payouts",
      label: "Payout Report",
      count: payoutPagination.total,
      icon: BadgeDollarSign,
    },
    {
      key: "ledger",
      label: "Wallet Ledger",
      count: ledgerPagination.total,
      icon: Wallet,
    },
    {
      key: "users",
      label: "User Overview",
      count: userPagination.total,
      icon: Users,
    },
  ];

  return (
    <div className="w-full">
      <div className="space-y-4 lg:space-y-5">
        <div
          className={[
            "rounded-[24px] border backdrop-blur-xl transition-all duration-300",
            isDark
              ? "border-white/10 bg-white/[0.03] shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
              : "border-orange-200 bg-white/65 shadow-[0_16px_40px_rgba(251,146,60,0.10)]",
          ].join(" ")}
        >
          <div
            className={[
              "border-b px-4 py-4 sm:px-5 sm:py-5",
              isDark ? "border-white/10" : "border-orange-100/80",
            ].join(" ")}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => window.history.back()}
                  className={[
                    "inline-flex h-11 w-11 items-center justify-center rounded-xl border transition",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.07]"
                      : "border-orange-200 bg-white/80 text-slate-700 hover:bg-orange-50",
                  ].join(" ")}
                >
                  <ArrowLeft size={18} />
                </button>

                <div>
                  <h1
                    className={[
                      "text-xl font-bold sm:text-2xl",
                      isDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    Bonus Reports
                  </h1>
                  <p
                    className={[
                      "mt-1 text-sm leading-6",
                      isDark ? "text-white/45" : "text-slate-500",
                    ].join(" ")}
                  >
                    Track payout history, wallet movement, and user-wise bonus
                    overview.
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                <div className="relative w-full sm:min-w-[280px]">
                  <Search
                    size={18}
                    className={[
                      "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2",
                      isDark ? "text-white/35" : "text-slate-400",
                    ].join(" ")}
                  />
                  <input
                    type="text"
                    placeholder="Search user overview"
                    value={filters.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
                    className={[
                      "h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition",
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-blue-400/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-400/15"
                        : "border-orange-200 bg-white/80 text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-200/60",
                    ].join(" ")}
                  />
                </div>

                <button
                  onClick={resetFilters}
                  className={[
                    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.07]"
                      : "border-orange-200 bg-white/80 text-slate-700 hover:bg-orange-50",
                  ].join(" ")}
                >
                  <RotateCcw size={16} />
                  Reset
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={[
                    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
                    isDark
                      ? "border-blue-400/20 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15"
                      : "border-orange-200 bg-orange-500 text-white hover:bg-orange-600",
                  ].join(" ")}
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>

                <button
                  onClick={() => setFiltersOpen((prev) => !prev)}
                  className={[
                    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.07]"
                      : "border-orange-200 bg-white/80 text-slate-700 hover:bg-orange-50",
                  ].join(" ")}
                >
                  {filtersOpen ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {filtersOpen ? "Collapse" : "Expand"}
                </button>
              </div>
            </div>
          </div>

          <div
            className={[
              "overflow-hidden transition-all duration-300 ease-in-out",
              filtersOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0",
            ].join(" ")}
          >
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4 sm:p-5">
              <FilterInput
                label="User ID"
                value={filters.userId}
                onChange={(value) => updateFilter("userId", value)}
                placeholder="Enter user id"
                isDark={isDark}
              />

              <FilterInput
                label="MT5 Account"
                value={filters.mt5Account}
                onChange={(value) => updateFilter("mt5Account", value)}
                placeholder="Enter MT5 account"
                isDark={isDark}
              />

              <FilterSelect
                label="Payout Status"
                value={filters.status}
                onChange={(value) => updateFilter("status", value)}
                isDark={isDark}
                options={[
                  { label: "All Status", value: "" },
                  { label: "Success", value: "success" },
                  { label: "Failed", value: "failed" },
                  { label: "Skipped", value: "skipped" },
                ]}
              />

              <FilterSelect
                label="Ledger Type"
                value={filters.type}
                onChange={(value) => updateFilter("type", value)}
                isDark={isDark}
                options={[
                  { label: "All Types", value: "" },
                  { label: "deposit_bonus", value: "deposit_bonus" },
                  {
                    label: "trade_bonus_credit",
                    value: "trade_bonus_credit",
                  },
                  {
                    label: "trade_bonus_debit",
                    value: "trade_bonus_debit",
                  },
                  {
                    label: "manual_adjustment",
                    value: "manual_adjustment",
                  },
                ]}
              />

              <FilterInput
                label="Min Lot"
                value={filters.minLot}
                onChange={(value) => updateFilter("minLot", value)}
                placeholder="0"
                type="number"
                isDark={isDark}
              />

              <FilterInput
                label="Max Lot"
                value={filters.maxLot}
                onChange={(value) => updateFilter("maxLot", value)}
                placeholder="100"
                type="number"
                isDark={isDark}
              />

              <FilterInput
                label="Reference Model"
                value={filters.referenceModel}
                onChange={(value) => updateFilter("referenceModel", value)}
                placeholder="TradeBonusPayout"
                isDark={isDark}
              />

              <div className="grid grid-cols-2 gap-3">
                <FilterInput
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(value) => updateFilter("startDate", value)}
                  type="date"
                  isDark={isDark}
                />
                <FilterInput
                  label="End Date"
                  value={filters.endDate}
                  onChange={(value) => updateFilter("endDate", value)}
                  type="date"
                  isDark={isDark}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={[
                  "rounded-[24px] border p-5 backdrop-blur-xl",
                  isDark
                    ? "border-white/10 bg-white/[0.03] shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
                    : "border-orange-200 bg-white/65 shadow-[0_16px_40px_rgba(251,146,60,0.10)]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className={[
                        "text-sm font-medium",
                        isDark ? "text-white/45" : "text-slate-500",
                      ].join(" ")}
                    >
                      {card.title}
                    </p>
                    <h3
                      className={[
                        "mt-2 text-2xl font-bold",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {summaryLoading ? "--" : card.value}
                    </h3>
                    <p
                      className={[
                        "mt-1 text-sm",
                        isDark ? "text-white/40" : "text-slate-500",
                      ].join(" ")}
                    >
                      {summaryLoading ? "Loading..." : card.subtitle}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.accent}`}
                  >
                    <Icon size={22} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  "inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                  active
                    ? isDark
                      ? "border-blue-400/25 bg-blue-500/10 text-blue-300"
                      : "border-orange-200 bg-orange-500 text-white"
                    : isDark
                    ? "border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.05]"
                    : "border-orange-200 bg-white/80 text-slate-700 hover:bg-orange-50",
                ].join(" ")}
              >
                <Icon size={16} />
                {tab.label}
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-xs",
                    active
                      ? isDark
                        ? "bg-blue-500/15 text-blue-200"
                        : "bg-white/20 text-white"
                      : isDark
                      ? "bg-white/[0.06] text-white/60"
                      : "bg-orange-50 text-slate-600",
                  ].join(" ")}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {activeTab === "payouts" && (
          <PayoutTable
            rows={payoutRows}
            loading={tableLoading}
            isDark={isDark}
            onView={openPayoutDetail}
          />
        )}

        {activeTab === "ledger" && (
          <LedgerTable rows={ledgerRows} loading={tableLoading} isDark={isDark} />
        )}

        {activeTab === "users" && (
          <UsersTable rows={userRows} loading={tableLoading} isDark={isDark} />
        )}

        {!tableLoading && currentPagination.total > 0 && (
          <div
            className={[
              "rounded-[24px] border p-4 backdrop-blur-xl",
              isDark
                ? "border-white/10 bg-white/[0.03] shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
                : "border-orange-100/80 bg-white/65 shadow-[0_16px_40px_rgba(251,146,60,0.10)]",
            ].join(" ")}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p
                className={[
                  "text-sm",
                  isDark ? "text-white/45" : "text-slate-500",
                ].join(" ")}
              >
                Showing{" "}
                <span
                  className={[
                    "font-semibold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  {(currentPage - 1) * currentPagination.limit + 1}
                </span>{" "}
                to{" "}
                <span
                  className={[
                    "font-semibold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  {Math.min(
                    currentPage * currentPagination.limit,
                    currentPagination.total
                  )}
                </span>{" "}
                of{" "}
                <span
                  className={[
                    "font-semibold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  {currentPagination.total}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={buttonNavClass(isDark, currentPage === 1, false)}
                >
                  <ChevronLeft size={16} />
                  Prev
                </button>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === currentPagination.totalPages}
                  className={buttonNavClass(
                    isDark,
                    currentPage === currentPagination.totalPages,
                    true
                  )}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedPayoutId && (
        <PayoutDetailModal
          isDark={isDark}
          loading={detailLoading}
          detail={payoutDetail}
          onClose={closeDetail}
        />
      )}
    </div>
  );
};

const PayoutTable = ({
  rows,
  loading,
  isDark,
  onView,
}: {
  rows: PayoutRow[];
  loading: boolean;
  isDark: boolean;
  onView: (id: string) => void;
}) => {
  return (
    <>
      <div
        className={[
          "hidden overflow-hidden rounded-[24px] border backdrop-blur-xl lg:block",
          isDark
            ? "border-white/10 bg-white/[0.03] shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
            : "border-orange-200 bg-white/90 shadow-[0_16px_40px_rgba(251,146,60,0.10)]",
        ].join(" ")}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className={isDark ? "bg-white/[0.03]" : "bg-white/40"}>
              <tr
                className={[
                  "border-b",
                  isDark ? "border-white/10" : "border-orange-200",
                ].join(" ")}
              >
                {[
                  "User",
                  "Referral / MT5",
                  "Lot",
                  "Bonus",
                  "Status",
                  "Created",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={[
                      "px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]",
                      heading !== "User" ? "text-center" : "",
                      isDark ? "text-white/45" : "text-slate-500",
                    ].join(" ")}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <LoadingRow
                  colSpan={7}
                  isDark={isDark}
                  text="Loading payout report..."
                />
              ) : rows?.length ? (
                rows.map((row) => (
                  <tr
                    key={row._id}
                    className={[
                      "border-b transition",
                      isDark
                        ? "border-white/10 hover:bg-white/[0.03]"
                        : "border-orange-200 hover:bg-orange-50/40",
                    ].join(" ")}
                  >
                    <td className="px-5 py-4">
                      <p
                        className={[
                          "font-semibold",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        {fullName(row.userId)}
                      </p>
                      <p
                        className={[
                          "text-sm",
                          isDark ? "text-blue-300" : "text-primary-600",
                        ].join(" ")}
                      >
                        {row.userId?.email || "--"}
                      </p>
                    </td>

                    <td
                      className={[
                        "px-5 py-4 text-center",
                        isDark ? "text-white/80" : "text-slate-700",
                      ].join(" ")}
                    >
                      <div className="space-y-1">
                        <p>{row.userId?.referralAccount || "--"}</p>
                        <p
                          className={[
                            "text-sm",
                            isDark ? "text-white/40" : "text-slate-500",
                          ].join(" ")}
                        >
                          {row.mt5Account || "--"}
                        </p>
                      </div>
                    </td>

                    <td
                      className={[
                        "px-5 py-4 text-center font-medium",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {number(row.totalLot)}
                    </td>

                    <td
                      className={[
                        "px-5 py-4 text-center font-semibold",
                        isDark ? "text-emerald-300" : "text-emerald-700",
                      ].join(" ")}
                    >
                      {currency(row.bonusAmount)}
                    </td>

                    <td className="px-5 py-4 text-center">
                      {statusBadge(row.status, isDark)}
                    </td>

                    <td
                      className={[
                        "px-5 py-4 text-center text-sm",
                        isDark ? "text-white/70" : "text-slate-600",
                      ].join(" ")}
                    >
                      {formatDate(row.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => onView(row._id)}
                        className={[
                          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                          isDark
                            ? "bg-blue-500/10 text-blue-300 hover:bg-blue-500/15"
                            : "bg-orange-500 text-white hover:bg-orange-600",
                        ].join(" ")}
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyRow
                  colSpan={7}
                  isDark={isDark}
                  text="No payout records found"
                />
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {loading ? (
          <LoadingCard isDark={isDark} text="Loading payout report..." />
        ) : rows?.length ? (
          rows.map((row) => (
            <div
              key={row._id}
              className={[
                "rounded-[24px] border p-4 backdrop-blur-xl",
                isDark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-orange-100/80 bg-white/65",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3
                    className={[
                      "text-base font-semibold",
                      isDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    {fullName(row.userId)}
                  </h3>
                  <p
                    className={[
                      "text-sm",
                      isDark ? "text-blue-300" : "text-primary-600",
                    ].join(" ")}
                  >
                    {row.userId?.email || "--"}
                  </p>
                </div>
                {statusBadge(row.status, isDark)}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat
                  label="MT5"
                  value={row.mt5Account || "--"}
                  isDark={isDark}
                />
                <MiniStat
                  label="Lot"
                  value={number(row.totalLot)}
                  isDark={isDark}
                />
                <MiniStat
                  label="Bonus"
                  value={currency(row.bonusAmount)}
                  isDark={isDark}
                />
                <MiniStat
                  label="Created"
                  value={formatDate(row.createdAt)}
                  isDark={isDark}
                />
              </div>

              <button
                onClick={() => onView(row._id)}
                className={[
                  "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition",
                  isDark
                    ? "bg-blue-500/10 text-blue-300 hover:bg-blue-500/15"
                    : "bg-orange-500 text-white hover:bg-orange-600",
                ].join(" ")}
              >
                <Eye size={16} />
                View Detail
              </button>
            </div>
          ))
        ) : (
          <EmptyCard isDark={isDark} text="No payout records found" />
        )}
      </div>
    </>
  );
};

const LedgerTable = ({
  rows,
  loading,
  isDark,
}: {
  rows: LedgerRow[];
  loading: boolean;
  isDark: boolean;
}) => {
  return (
    <>
      <div
        className={[
          "hidden overflow-hidden rounded-[24px] border backdrop-blur-xl lg:block",
          isDark
            ? "border-white/10 bg-white/[0.03] shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
            : "border-orange-200 bg-white/90 shadow-[0_16px_40px_rgba(251,146,60,0.10)]",
        ].join(" ")}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className={isDark ? "bg-white/[0.03]" : "bg-white/40"}>
              <tr
                className={[
                  "border-b",
                  isDark ? "border-white/10" : "border-orange-200",
                ].join(" ")}
              >
                {[
                  "User",
                  "Type",
                  "Amount",
                  "Before",
                  "After",
                  "Reference",
                  "Created",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={[
                      "px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]",
                      heading !== "User" ? "text-center" : "",
                      isDark ? "text-white/45" : "text-slate-500",
                    ].join(" ")}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <LoadingRow
                  colSpan={7}
                  isDark={isDark}
                  text="Loading wallet ledger..."
                />
              ) : rows?.length ? (
                rows.map((row) => (
                  <tr
                    key={row._id}
                    className={[
                      "border-b transition",
                      isDark
                        ? "border-white/10 hover:bg-white/[0.03]"
                        : "border-orange-200 hover:bg-orange-50/40",
                    ].join(" ")}
                  >
                    <td className="px-5 py-4">
                      <p
                        className={[
                          "font-semibold",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        {fullName(row.userId)}
                      </p>
                      <p
                        className={[
                          "text-sm",
                          isDark ? "text-blue-300" : "text-primary-600",
                        ].join(" ")}
                      >
                        {row.userId?.email || "--"}
                      </p>
                    </td>

                    <td
                      className={[
                        "px-5 py-4 text-center",
                        isDark ? "text-white/75" : "text-slate-700",
                      ].join(" ")}
                    >
                      {typeBadge(row.type, isDark)}
                    </td>

                    <td
                      className={[
                        "px-5 py-4 text-center font-semibold",
                        isDark ? "text-emerald-300" : "text-emerald-700",
                      ].join(" ")}
                    >
                      {currency(row.amount)}
                    </td>

                    <td
                      className={[
                        "px-5 py-4 text-center",
                        isDark ? "text-white/75" : "text-slate-700",
                      ].join(" ")}
                    >
                      {currency(row.balanceBefore)}
                    </td>

                    <td
                      className={[
                        "px-5 py-4 text-center",
                        isDark ? "text-white/75" : "text-slate-700",
                      ].join(" ")}
                    >
                      {currency(row.balanceAfter)}
                    </td>

                    <td
                      className={[
                        "px-5 py-4 text-center text-sm",
                        isDark ? "text-white/60" : "text-slate-500",
                      ].join(" ")}
                    >
                      <div className="space-y-1">
                        <p>{row.referenceModel || "--"}</p>
                        <p>{row.note || "--"}</p>
                      </div>
                    </td>

                    <td
                      className={[
                        "px-5 py-4 text-center text-sm",
                        isDark ? "text-white/70" : "text-slate-600",
                      ].join(" ")}
                    >
                      {formatDate(row.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyRow
                  colSpan={7}
                  isDark={isDark}
                  text="No wallet ledger found"
                />
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {loading ? (
          <LoadingCard isDark={isDark} text="Loading wallet ledger..." />
        ) : rows?.length ? (
          rows.map((row) => (
            <div
              key={row._id}
              className={[
                "rounded-[24px] border p-4 backdrop-blur-xl",
                isDark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-orange-100/80 bg-white/65",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3
                    className={[
                      "text-base font-semibold",
                      isDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    {fullName(row.userId)}
                  </h3>
                  <p
                    className={[
                      "text-sm",
                      isDark ? "text-blue-300" : "text-primary-600",
                    ].join(" ")}
                  >
                    {row.userId?.email || "--"}
                  </p>
                </div>
                {typeBadge(row.type, isDark)}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat
                  label="Amount"
                  value={currency(row.amount)}
                  isDark={isDark}
                />
                <MiniStat
                  label="Before"
                  value={currency(row.balanceBefore)}
                  isDark={isDark}
                />
                <MiniStat
                  label="After"
                  value={currency(row.balanceAfter)}
                  isDark={isDark}
                />
                <MiniStat
                  label="Created"
                  value={formatDate(row.createdAt)}
                  isDark={isDark}
                />
              </div>

              <div className="mt-3 rounded-xl border border-dashed border-white/10 p-3">
                <p
                  className={[
                    "text-xs uppercase tracking-[0.14em]",
                    isDark ? "text-white/40" : "text-slate-400",
                  ].join(" ")}
                >
                  Reference
                </p>
                <p
                  className={[
                    "mt-1 text-sm",
                    isDark ? "text-white/75" : "text-slate-700",
                  ].join(" ")}
                >
                  {row.referenceModel || "--"}
                </p>
                <p
                  className={[
                    "mt-1 text-sm",
                    isDark ? "text-white/50" : "text-slate-500",
                  ].join(" ")}
                >
                  {row.note || "--"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <EmptyCard isDark={isDark} text="No wallet ledger found" />
        )}
      </div>
    </>
  );
};

const UsersTable = ({
  rows,
  loading,
  isDark,
}: {
  rows: UserOverviewRow[];
  loading: boolean;
  isDark: boolean;
}) => {
  return (
    <>
      <div
        className={[
          "hidden overflow-hidden rounded-[24px] border backdrop-blur-xl lg:block",
          isDark
            ? "border-white/10 bg-white/[0.03] shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
            : "border-orange-200 bg-white/90 shadow-[0_16px_40px_rgba(251,146,60,0.10)]",
        ].join(" ")}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className={isDark ? "bg-white/[0.03]" : "bg-white/40"}>
              <tr
                className={[
                  "border-b",
                  isDark ? "border-white/10" : "border-orange-200",
                ].join(" ")}
              >
                {[
                  "User",
                  "Referral",
                  "Bonus Wallet",
                  "Total Payouts",
                  "Successful",
                  "Released Bonus",
                  "Wallet Debited",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={[
                      "px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]",
                      heading !== "User" ? "text-center" : "",
                      isDark ? "text-white/45" : "text-slate-500",
                    ].join(" ")}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <LoadingRow
                  colSpan={7}
                  isDark={isDark}
                  text="Loading user overview..."
                />
              ) : rows?.length ? (
                rows.map((row) => (
                  <tr
                    key={row._id}
                    className={[
                      "border-b transition",
                      isDark
                        ? "border-white/10 hover:bg-white/[0.03]"
                        : "border-orange-200 hover:bg-orange-50/40",
                    ].join(" ")}
                  >
                    <td className="px-5 py-4">
                      <p
                        className={[
                          "font-semibold",
                          isDark ? "text-white" : "text-slate-900",
                        ].join(" ")}
                      >
                        {fullName(row)}
                      </p>
                      <p
                        className={[
                          "text-sm",
                          isDark ? "text-blue-300" : "text-primary-600",
                        ].join(" ")}
                      >
                        {row.email || "--"}
                      </p>
                    </td>

                    <td
                      className={[
                        "px-5 py-4 text-center",
                        isDark ? "text-white/75" : "text-slate-700",
                      ].join(" ")}
                    >
                      {row.referralAccount || "--"}
                    </td>

                    <td
                      className={[
                        "px-5 py-4 text-center font-semibold",
                        isDark ? "text-emerald-300" : "text-emerald-700",
                      ].join(" ")}
                    >
                      {currency(row.bonusWallet)}
                    </td>

                    <td
                      className={[
                        "px-5 py-4 text-center",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {number(row.totalPayouts)}
                    </td>

                    <td
                      className={[
                        "px-5 py-4 text-center",
                        isDark ? "text-white" : "text-slate-900",
                      ].join(" ")}
                    >
                      {number(row.totalSuccessfulPayouts)}
                    </td>

                    <td
                      className={[
                        "px-5 py-4 text-center font-semibold",
                        isDark ? "text-emerald-300" : "text-emerald-700",
                      ].join(" ")}
                    >
                      {currency(row.totalBonusReleased)}
                    </td>

                    <td
                      className={[
                        "px-5 py-4 text-center font-semibold",
                        isDark ? "text-violet-300" : "text-violet-700",
                      ].join(" ")}
                    >
                      {currency(row.totalWalletDebited)}
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyRow colSpan={7} isDark={isDark} text="No users found" />
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {loading ? (
          <LoadingCard isDark={isDark} text="Loading user overview..." />
        ) : rows?.length ? (
          rows.map((row) => (
            <div
              key={row._id}
              className={[
                "rounded-[24px] border p-4 backdrop-blur-xl",
                isDark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-orange-100/80 bg-white/65",
              ].join(" ")}
            >
              <div>
                <h3
                  className={[
                    "text-base font-semibold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  {fullName(row)}
                </h3>
                <p
                  className={[
                    "text-sm",
                    isDark ? "text-blue-300" : "text-primary-600",
                  ].join(" ")}
                >
                  {row.email || "--"}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat
                  label="Referral"
                  value={row.referralAccount || "--"}
                  isDark={isDark}
                />
                <MiniStat
                  label="Bonus Wallet"
                  value={currency(row.bonusWallet)}
                  isDark={isDark}
                />
                <MiniStat
                  label="Payouts"
                  value={number(row.totalPayouts)}
                  isDark={isDark}
                />
                <MiniStat
                  label="Success"
                  value={number(row.totalSuccessfulPayouts)}
                  isDark={isDark}
                />
                <MiniStat
                  label="Released"
                  value={currency(row.totalBonusReleased)}
                  isDark={isDark}
                />
                <MiniStat
                  label="Debited"
                  value={currency(row.totalWalletDebited)}
                  isDark={isDark}
                />
              </div>
            </div>
          ))
        ) : (
          <EmptyCard isDark={isDark} text="No users found" />
        )}
      </div>
    </>
  );
};

const PayoutDetailModal = ({
  isDark,
  loading,
  detail,
  onClose,
}: {
  isDark: boolean;
  loading: boolean;
  detail: PayoutDetailResponse | null;
  onClose: () => void;
}) => {
  const [mounted, setMounted] = useState(false);

  const payout = detail?.payout;
  const relatedLedger = detail?.relatedLedger || [];

  useEffect(() => {
    setMounted(true);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div
        className={[
          "max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[28px] border",
          isDark
            ? "border-white/10 bg-[#0f172a]"
            : "border-orange-200 bg-white",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center justify-between border-b px-5 py-4",
            isDark ? "border-white/10" : "border-orange-100",
          ].join(" ")}
        >
          <div>
            <h3
              className={[
                "text-lg font-semibold",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              Payout Detail
            </h3>
            <p
              className={[
                "text-sm",
                isDark ? "text-white/45" : "text-slate-500",
              ].join(" ")}
            >
              View payout record with related ledger entries.
            </p>
          </div>

          <button
            onClick={onClose}
            className={[
              "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition",
              isDark
                ? "border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.08]"
                : "border-orange-200 bg-white text-slate-700 hover:bg-orange-50",
            ].join(" ")}
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-5">
          {loading ? (
            <LoadingCard isDark={isDark} text="Loading payout detail..." />
          ) : !payout ? (
            <EmptyCard isDark={isDark} text="No payout detail found" />
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MiniStat
                  label="User"
                  value={fullName(payout.userId)}
                  isDark={isDark}
                />
                <MiniStat
                  label="MT5 Account"
                  value={payout.mt5Account || "--"}
                  isDark={isDark}
                />
                <MiniStat
                  label="Lot"
                  value={number(payout.totalLot)}
                  isDark={isDark}
                />
                <MiniStat
                  label="Bonus"
                  value={currency(payout.bonusAmount)}
                  isDark={isDark}
                />
                <MiniStat
                  label="Status"
                  value={String(payout.status || "--")}
                  isDark={isDark}
                />
                <MiniStat
                  label="Created"
                  value={formatDate(payout.createdAt)}
                  isDark={isDark}
                />
                <MiniStat
                  label="Updated"
                  value={formatDate(payout.updatedAt)}
                  isDark={isDark}
                />
                <MiniStat
                  label="Email"
                  value={payout.userId?.email || "--"}
                  isDark={isDark}
                />
              </div>

              <div
                className={[
                  "rounded-[24px] border p-4",
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-orange-100/80 bg-orange-50/30",
                ].join(" ")}
              >
                <p
                  className={[
                    "text-xs font-semibold uppercase tracking-[0.14em]",
                    isDark ? "text-white/45" : "text-slate-500",
                  ].join(" ")}
                >
                  Note
                </p>
                <p
                  className={[
                    "mt-2 text-sm leading-6",
                    isDark ? "text-white/80" : "text-slate-700",
                  ].join(" ")}
                >
                  {payout.note || "--"}
                </p>
              </div>

              <div
                className={[
                  "rounded-[24px] border p-4",
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-orange-100/80 bg-white/70",
                ].join(" ")}
              >
                <div className="mb-4">
                  <h4
                    className={[
                      "text-base font-semibold",
                      isDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    Related Ledger
                  </h4>
                </div>

                <div className="space-y-3">
                  {relatedLedger.length ? (
                    relatedLedger.map((item) => (
                      <div
                        key={item._id}
                        className={[
                          "rounded-2xl border p-4",
                          isDark
                            ? "border-white/10 bg-white/[0.02]"
                            : "border-orange-100 bg-orange-50/40",
                        ].join(" ")}
                      >
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                          <MiniStat
                            label="Type"
                            value={item.type || "--"}
                            isDark={isDark}
                          />
                          <MiniStat
                            label="Amount"
                            value={currency(item.amount)}
                            isDark={isDark}
                          />
                          <MiniStat
                            label="Before"
                            value={currency(item.balanceBefore)}
                            isDark={isDark}
                          />
                          <MiniStat
                            label="After"
                            value={currency(item.balanceAfter)}
                            isDark={isDark}
                          />
                        </div>

                        <div className="mt-3">
                          <p
                            className={[
                              "text-xs uppercase tracking-[0.14em]",
                              isDark ? "text-white/40" : "text-slate-400",
                            ].join(" ")}
                          >
                            Note
                          </p>
                          <p
                            className={[
                              "mt-1 text-sm",
                              isDark ? "text-white/70" : "text-slate-600",
                            ].join(" ")}
                          >
                            {item.note || "--"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyCard isDark={isDark} text="No related ledger found" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const FilterInput = ({
  label,
  value,
  onChange,
  placeholder,
  isDark,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDark: boolean;
  type?: string;
}) => {
  return (
    <div>
      <label
        className={[
          "mb-2 block text-xs font-semibold uppercase tracking-[0.14em]",
          isDark ? "text-white/45" : "text-slate-500",
        ].join(" ")}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          "h-11 w-full rounded-xl border px-4 text-sm outline-none transition",
          isDark
            ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-blue-400/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-400/15"
            : "border-orange-200 bg-white/80 text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-200/60",
        ].join(" ")}
      />
    </div>
  );
};

const FilterSelect = ({
  label,
  value,
  onChange,
  isDark,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isDark: boolean;
  options: { label: string; value: string }[];
}) => {
  return (
    <div>
      <label
        className={[
          "mb-2 block text-xs font-semibold uppercase tracking-[0.14em]",
          isDark ? "text-white/45" : "text-slate-500",
        ].join(" ")}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "h-11 w-full rounded-xl border px-4 text-sm outline-none transition",
          isDark
            ? "border-white/10 bg-white/[0.04] text-white focus:border-blue-400/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-400/15"
            : "border-orange-200 bg-white/80 text-slate-900 focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-200/60",
        ].join(" ")}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className={
              isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"
            }
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const MiniStat = ({
  label,
  value,
  isDark,
}: {
  label: string;
  value: ReactNode;
  isDark: boolean;
}) => {
  return (
    <div
      className={[
        "rounded-2xl border p-3",
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-orange-100 bg-orange-50/40",
      ].join(" ")}
    >
      <p
        className={[
          "text-xs uppercase tracking-[0.14em]",
          isDark ? "text-white/40" : "text-slate-400",
        ].join(" ")}
      >
        {label}
      </p>
      <p
        className={[
          "mt-2 text-sm font-semibold break-words",
          isDark ? "text-white" : "text-slate-900",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
};

const LoadingRow = ({
  colSpan,
  isDark,
  text,
}: {
  colSpan: number;
  isDark: boolean;
  text: string;
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-12">
        <div
          className={[
            "flex items-center justify-center gap-3",
            isDark ? "text-white/65" : "text-slate-600",
          ].join(" ")}
        >
          <Loader2 className="animate-spin" size={18} />
          <span>{text}</span>
        </div>
      </td>
    </tr>
  );
};

const EmptyRow = ({
  colSpan,
  isDark,
  text,
}: {
  colSpan: number;
  isDark: boolean;
  text: string;
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-12">
        <div className="text-center">
          <p
            className={[
              "text-sm",
              isDark ? "text-white/45" : "text-slate-500",
            ].join(" ")}
          >
            {text}
          </p>
        </div>
      </td>
    </tr>
  );
};

const LoadingCard = ({
  isDark,
  text,
}: {
  isDark: boolean;
  text: string;
}) => {
  return (
    <div
      className={[
        "rounded-[24px] border p-8 text-center backdrop-blur-xl",
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-orange-100/80 bg-white/65",
      ].join(" ")}
    >
      <div
        className={[
          "flex items-center justify-center gap-3",
          isDark ? "text-white/65" : "text-slate-600",
        ].join(" ")}
      >
        <Loader2 className="animate-spin" size={18} />
        <span>{text}</span>
      </div>
    </div>
  );
};

const EmptyCard = ({
  isDark,
  text,
}: {
  isDark: boolean;
  text: string;
}) => {
  return (
    <div
      className={[
        "rounded-[24px] border p-8 text-center backdrop-blur-xl",
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-orange-100/80 bg-white/65",
      ].join(" ")}
    >
      <p
        className={[
          "text-sm",
          isDark ? "text-white/45" : "text-slate-500",
        ].join(" ")}
      >
        {text}
      </p>
    </div>
  );
};

function fullName(user?: { firstName?: string; lastName?: string }) {
  const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  return name || "--";
}

function currency(value?: number) {
  const num = Number(value || 0);
  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function number(value?: number) {
  const num = Number(value || 0);
  return num.toLocaleString("en-US");
}

function formatDate(date?: string) {
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
    second: "2-digit",
    hour12: true,
  });

  return `${formattedDate}, ${formattedTime}`;
}

function statusBadge(status?: string, isDark?: boolean) {
  const normalized = (status || "").toLowerCase();

  const map: Record<string, string> = {
    success: isDark
      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/20"
      : "bg-emerald-50 text-emerald-700 border border-emerald-200",
    failed: isDark
      ? "bg-red-500/10 text-red-300 border border-red-400/20"
      : "bg-red-50 text-red-700 border border-red-200",
    skipped: isDark
      ? "bg-amber-500/10 text-amber-300 border border-amber-400/20"
      : "bg-amber-50 text-amber-700 border border-amber-200",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize",
        map[normalized] ||
          (isDark
            ? "border border-white/10 bg-white/[0.04] text-white/75"
            : "border border-slate-200 bg-slate-50 text-slate-700"),
      ].join(" ")}
    >
      {status || "--"}
    </span>
  );
}

function typeBadge(type?: string, isDark?: boolean) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        isDark
          ? "border border-white/10 bg-white/[0.04] text-white/80"
          : "border border-orange-200 bg-orange-50 text-slate-700",
      ].join(" ")}
    >
      {type || "--"}
    </span>
  );
}

function buttonNavClass(isDark: boolean, disabled: boolean, primary?: boolean) {
  if (disabled) {
    return [
      "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition cursor-not-allowed",
      isDark
        ? "border border-white/10 bg-white/[0.03] text-white/25"
        : "border border-orange-100 bg-white/60 text-slate-300",
    ].join(" ");
  }

  if (primary) {
    return [
      "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition",
      isDark
        ? "bg-blue-500/90 text-white hover:bg-blue-500"
        : "bg-orange-500 text-white hover:bg-orange-600",
    ].join(" ");
  }

  return [
    "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition",
    isDark
      ? "border border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.07]"
      : "border border-orange-100 bg-white/80 text-slate-700 hover:bg-orange-50",
  ].join(" ");
}

export default BonusReports;