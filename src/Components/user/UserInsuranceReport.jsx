import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  Filter,
  RefreshCcw,
  Search,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { userApi } from "@/utils/apiClients";

const ENDPOINT = "/insurance/report";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const toNumber = (value, fallback = 0) => {
  const num = Number(value ?? fallback);
  return Number.isFinite(num) ? num : fallback;
};

const money = (value) => {
  const num = toNumber(value, 0);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const formatDate = (iso) => {
  if (!iso) return "N/A";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "N/A";

  return `${date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}, ${date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`;
};

const getStatusTone = (status) => {
  const s = String(status || "").toLowerCase();

  if (s === "active") return "active";
  if (s === "claimed") return "claimed";
  if (s === "credited") return "credited";
  if (s === "failed") return "failed";
  if (s === "requested") return "requested";

  return "default";
};

function StatCard({ icon, label, value, hint, tone = "default", isDark }) {
  const toneClass =
    tone === "success"
      ? isDark
        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
        : "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "warning"
      ? isDark
        ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
        : "border-amber-200 bg-amber-50 text-amber-700"
      : tone === "danger"
      ? isDark
        ? "border-rose-400/20 bg-rose-500/10 text-rose-300"
        : "border-rose-200 bg-rose-50 text-rose-700"
      : isDark
      ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <div
      className={cx(
        "rounded-[24px] border p-4 backdrop-blur-xl transition-all duration-300",
        isDark
          ? "border-white/10 bg-white/[0.045] shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
          : "border-amber-100 bg-white/85 shadow-[0_16px_42px_rgba(245,158,11,0.08)]"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cx(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
            toneClass
          )}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p
            className={cx(
              "text-xs font-medium",
              isDark ? "text-white/55" : "text-slate-500"
            )}
          >
            {label}
          </p>

          <p
            className={cx(
              "mt-1 truncate text-xl font-bold",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            {value}
          </p>

          {hint ? (
            <p
              className={cx(
                "mt-1 truncate text-[11px]",
                isDark ? "text-white/45" : "text-slate-500"
              )}
            >
              {hint}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, isDark }) {
  const tone = getStatusTone(status);

  const className =
    tone === "active"
      ? isDark
        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
        : "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "claimed" || tone === "credited"
      ? isDark
        ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
        : "border-blue-200 bg-blue-50 text-blue-700"
      : tone === "failed"
      ? isDark
        ? "border-rose-400/20 bg-rose-500/10 text-rose-300"
        : "border-rose-200 bg-rose-50 text-rose-700"
      : tone === "requested"
      ? isDark
        ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
        : "border-amber-200 bg-amber-50 text-amber-700"
      : isDark
      ? "border-white/10 bg-white/[0.04] text-white/70"
      : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span
      className={cx(
        "inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]",
        className
      )}
    >
      {status || "N/A"}
    </span>
  );
}

function EmptyState({ isDark }) {
  return (
    <div className="py-16 text-center">
      <div
        className={cx(
          "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border",
          isDark
            ? "border-white/10 bg-white/[0.04] text-white/50"
            : "border-amber-100 bg-amber-50 text-amber-500"
        )}
      >
        <ShieldCheck size={28} />
      </div>

      <h3
        className={cx(
          "text-lg font-bold",
          isDark ? "text-white" : "text-slate-900"
        )}
      >
        No insurance records found
      </h3>

      <p
        className={cx(
          "mt-2 text-sm",
          isDark ? "text-white/55" : "text-slate-500"
        )}
      >
        Try changing filters or refresh the report.
      </p>
    </div>
  );
}

function DetailModal({ row, onClose, isDark }) {
  if (!row) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={cx(
            "max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[28px] border shadow-2xl",
            isDark
              ? "border-white/10 bg-slate-950 text-white"
              : "border-amber-100 bg-white text-slate-900"
          )}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={cx(
              "border-b px-6 py-5",
              isDark
                ? "border-white/10 bg-white/[0.03]"
                : "border-amber-100 bg-amber-50/50"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className={cx(
                    "text-xs font-bold uppercase tracking-[0.18em]",
                    isDark ? "text-blue-300" : "text-amber-600"
                  )}
                >
                  Insurance Coverage
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  MT5 #{row.mt5Account}
                </h2>

                <div className="mt-3">
                  <StatusBadge status={row.status} isDark={isDark} />
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className={cx(
                  "flex h-10 w-10 items-center justify-center rounded-full border transition",
                  isDark
                    ? "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
                    : "border-amber-100 bg-white text-slate-600 hover:bg-amber-50"
                )}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoBlock
                label="Insurance Charge"
                value={`$${money(row.insuranceChargeAmount)}`}
                isDark={isDark}
              />
              <InfoBlock
                label="Claim Amount"
                value={`$${money(row.claimAmount)}`}
                isDark={isDark}
              />
              <InfoBlock
                label="Coverage Created"
                value={formatDate(row.coverageCreatedAt)}
                isDark={isDark}
              />
              <InfoBlock
                label="Claimed At"
                value={formatDate(row.claimedAt)}
                isDark={isDark}
              />
            </div>

            <div className="mt-5">
              <SectionTitle title="Deposit Details" isDark={isDark} />

              {row.deposit ? (
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoBlock
                    label="Deposit Amount"
                    value={`$${money(row.deposit.depositAmount)}`}
                    isDark={isDark}
                  />
                  <InfoBlock
                    label="Base Deposit Amount"
                    value={`$${money(row.deposit.baseDepositAmount)}`}
                    isDark={isDark}
                  />
                  <InfoBlock
                    label="Method"
                    value={row.deposit.method || "N/A"}
                    isDark={isDark}
                  />
                  <InfoBlock
                    label="Deposit Status"
                    value={row.deposit.status || "N/A"}
                    isDark={isDark}
                  />
                  <InfoBlock
                    label="Transaction ID"
                    value={row.deposit.transactionId || "—"}
                    isDark={isDark}
                  />
                  <InfoBlock
                    label="Order ID"
                    value={row.deposit.orderId || "—"}
                    isDark={isDark}
                  />
                  <InfoBlock
                    label="Approved At"
                    value={formatDate(row.deposit.approvedAt)}
                    isDark={isDark}
                  />
                  <InfoBlock
                    label="Deposit Created"
                    value={formatDate(row.deposit.createdAt)}
                    isDark={isDark}
                  />
                </div>
              ) : (
                <p
                  className={cx(
                    "mt-3 text-sm",
                    isDark ? "text-white/50" : "text-slate-500"
                  )}
                >
                  Deposit details not available.
                </p>
              )}
            </div>

            <div className="mt-5">
              <SectionTitle title="Claim Details" isDark={isDark} />

              {row.claim ? (
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoBlock
                    label="Claim Type"
                    value={row.claim.claimType || "N/A"}
                    isDark={isDark}
                  />
                  <InfoBlock
                    label="Claim Status"
                    value={row.claim.status || "N/A"}
                    isDark={isDark}
                  />
                  <InfoBlock
                    label="Total Claim Amount"
                    value={`$${money(row.claim.totalClaimAmount)}`}
                    isDark={isDark}
                  />
                  <InfoBlock
                    label="Credit Transaction ID"
                    value={row.claim.creditTransactionId || "—"}
                    isDark={isDark}
                  />
                  <InfoBlock
                    label="Credited At"
                    value={formatDate(row.claim.creditedAt)}
                    isDark={isDark}
                  />
                  <InfoBlock
                    label="Claim Created"
                    value={formatDate(row.claim.createdAt)}
                    isDark={isDark}
                  />
                </div>
              ) : (
                <p
                  className={cx(
                    "mt-3 text-sm",
                    isDark ? "text-white/50" : "text-slate-500"
                  )}
                >
                  Claim not created yet.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function SectionTitle({ title, isDark }) {
  return (
    <h3
      className={cx(
        "text-sm font-bold uppercase tracking-[0.16em]",
        isDark ? "text-white/70" : "text-slate-600"
      )}
    >
      {title}
    </h3>
  );
}

function InfoBlock({ label, value, isDark }) {
  return (
    <div
      className={cx(
        "rounded-2xl border px-4 py-3",
        isDark
          ? "border-white/10 bg-white/[0.04]"
          : "border-amber-100 bg-amber-50/35"
      )}
    >
      <p
        className={cx(
          "text-[11px] font-semibold uppercase tracking-[0.14em]",
          isDark ? "text-white/45" : "text-slate-500"
        )}
      >
        {label}
      </p>
      <p
        className={cx(
          "mt-1 break-words text-sm font-semibold",
          isDark ? "text-white" : "text-slate-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function InfoMini({ label, value, isDark }) {
  return (
    <div
      className={cx(
        "rounded-2xl border px-3 py-3",
        isDark
          ? "border-white/10 bg-white/[0.035]"
          : "border-amber-100 bg-amber-50/40"
      )}
    >
      <p
        className={cx(
          "text-[10px] font-bold uppercase tracking-[0.14em]",
          isDark ? "text-white/45" : "text-slate-500"
        )}
      >
        {label}
      </p>
      <p
        className={cx(
          "mt-1 break-words text-sm font-bold",
          isDark ? "text-white" : "text-slate-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default function UserInsuranceReport() {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const loggedUser = useSelector((store) => store.user?.loggedUser);

  const isDark = mode === "dark";

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({
    totalRecords: 0,
    activeCount: 0,
    claimedCount: 0,
    totalInsuranceChargeAmount: 0,
    totalClaimAmount: 0,
    totalCreditedClaimAmount: 0,
  });
  const [accountSummary, setAccountSummary] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    totalRecords: 0,
  });

  const [filters, setFilters] = useState({
    status: "",
    mt5Account: "",
    fromDate: "",
    toDate: "",
    search: "",
  });

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  const accountOptions = useMemo(() => {
    return Array.isArray(loggedUser?.accounts)
      ? loggedUser.accounts
          .map((item) => String(item?.accountNumber || "").trim())
          .filter(Boolean)
      : [];
  }, [loggedUser?.accounts]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.status ||
        filters.mt5Account ||
        filters.fromDate ||
        filters.toDate ||
        filters.search
    );
  }, [filters]);

  const buildParams = useCallback(() => {
    const params = new URLSearchParams();

    params.set("page", String(pagination.page || 1));
    params.set("limit", String(pagination.limit || 20));

    if (filters.status) params.set("status", filters.status);
    if (filters.mt5Account) params.set("mt5Account", filters.mt5Account);
    if (filters.fromDate) params.set("fromDate", filters.fromDate);
    if (filters.toDate) params.set("toDate", filters.toDate);
    if (filters.search) params.set("search", filters.search);

    return params.toString();
  }, [filters, pagination.page, pagination.limit]);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setErrorText("");

      const query = buildParams();
      const res = await userApi.get(`${ENDPOINT}?${query}`);
      const payload = res?.data || {};

      setRows(Array.isArray(payload.data) ? payload.data : []);
      setSummary(payload.summary || {});
      setAccountSummary(
        Array.isArray(payload.accountSummary) ? payload.accountSummary : []
      );
      setPagination((prev) => ({
        ...prev,
        page: payload.pagination?.page || prev.page,
        limit: payload.pagination?.limit || prev.limit,
        totalPages: payload.pagination?.totalPages || 1,
        totalRecords:
          payload.pagination?.totalRecords ||
          payload.summary?.totalRecords ||
          0,
      }));
    } catch (error) {
      console.error("Insurance report fetch failed:", error);
      setRows([]);
      setErrorText(
        error?.response?.data?.message ||
          "Unable to fetch insurance report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const updateFilter = (key, value) => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applySearch = () => {
    updateFilter("search", searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    setFilters({
      status: "",
      mt5Account: "",
      fromDate: "",
      toDate: "",
      search: "",
    });
  };

  const goPage = (nextPage) => {
    const resolvedPage = Math.min(
      Math.max(Number(nextPage) || 1, 1),
      pagination.totalPages || 1
    );

    setPagination((prev) => ({
      ...prev,
      page: resolvedPage,
    }));
  };

  const pageShell = cx(
    "relative overflow-hidden px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6",
    isDark ? "text-white" : "text-slate-900"
  );

  return (
    <motion.div
      className={pageShell}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cx(
          "overflow-hidden rounded-[30px] border",
          isDark
            ? "border-white/10 bg-white/[0.04] shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
            : "border-amber-100 bg-white/75 shadow-[0_20px_60px_rgba(245,158,11,0.08)]"
        )}
      >
        <div
          className={cx(
            "relative overflow-hidden px-5 py-6 sm:px-6",
            isDark
              ? "bg-[linear-gradient(135deg,rgba(30,41,59,1),rgba(15,23,42,1))]"
              : "bg-[linear-gradient(135deg,#fb923c,#f59e0b)]"
          )}
        >
          <div className="relative z-[1] flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                <ShieldCheck size={14} />
                Insurance · Report
              </div>

              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Insurance Report
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                View your active and claimed insurance coverage, linked deposits,
                claim amount, and credited claim history.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchReport}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15 disabled:opacity-60"
            >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-20 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="p-4 sm:p-5 lg:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              isDark={isDark}
              icon={<Activity size={22} />}
              label="Total Records"
              value={summary?.totalRecords || 0}
              hint="All coverage entries"
              tone="default"
            />
            <StatCard
              isDark={isDark}
              icon={<ShieldCheck size={22} />}
              label="Active"
              value={summary?.activeCount || 0}
              hint="Claimable coverage"
              tone="success"
            />
            <StatCard
              isDark={isDark}
              icon={<CheckCircle2 size={22} />}
              label="Claimed"
              value={summary?.claimedCount || 0}
              hint="Already claimed"
              tone="default"
            />
            <StatCard
              isDark={isDark}
              icon={<Wallet size={22} />}
              label="Insurance Charges"
              value={`$${money(summary?.totalInsuranceChargeAmount)}`}
              hint="Total charge paid"
              tone="warning"
            />
            <StatCard
              isDark={isDark}
              icon={<CircleDollarSign size={22} />}
              label="Claim Amount"
              value={`$${money(summary?.totalClaimAmount)}`}
              hint="Total claim value"
              tone="success"
            />
          </div>

          <div
            className={cx(
              "mt-5 overflow-hidden rounded-[24px] border",
              isDark
                ? "border-white/10 bg-white/[0.035]"
                : "border-amber-100 bg-amber-50/35"
            )}
          >
            <button
              type="button"
              onClick={() => setFiltersOpen((prev) => !prev)}
              className={cx(
                "flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition",
                isDark ? "hover:bg-white/[0.035]" : "hover:bg-amber-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cx(
                    "flex h-10 w-10 items-center justify-center rounded-2xl border",
                    isDark
                      ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
                      : "border-amber-200 bg-white text-amber-600"
                  )}
                >
                  <Filter size={17} />
                </div>

                <div>
                  <h2 className="text-base font-bold">Filters</h2>
                  <p
                    className={cx(
                      "mt-1 text-xs",
                      isDark ? "text-white/45" : "text-slate-500"
                    )}
                  >
                    {filtersOpen
                      ? "Click to collapse filters"
                      : "Click to expand filters"}
                    {hasActiveFilters ? " · Active filters applied" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hasActiveFilters ? (
                  <span
                    className={cx(
                      "hidden rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] sm:inline-flex",
                      isDark
                        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    )}
                  >
                    Active
                  </span>
                ) : null}

                <ChevronDown
                  size={20}
                  className={cx(
                    "transition-transform duration-300",
                    filtersOpen ? "rotate-180" : "rotate-0",
                    isDark ? "text-white/60" : "text-amber-600"
                  )}
                />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {filtersOpen ? (
                <motion.div
                  key="filters-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div
                    className={cx(
                      "border-t p-4",
                      isDark ? "border-white/10" : "border-amber-100"
                    )}
                  >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
                      <div className="xl:col-span-2">
                        <label
                          className={cx(
                            "mb-1 block text-xs font-semibold",
                            isDark ? "text-white/55" : "text-slate-500"
                          )}
                        >
                          Search
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Search
                              size={16}
                              className={cx(
                                "absolute left-3 top-1/2 -translate-y-1/2",
                                isDark ? "text-white/40" : "text-amber-500"
                              )}
                            />
                            <input
                              value={searchInput}
                              onChange={(e) => setSearchInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") applySearch();
                              }}
                              placeholder="Txn ID, order ID, method..."
                              className={cx(
                                "w-full rounded-2xl border py-3 pl-10 pr-3 text-sm outline-none",
                                isDark
                                  ? "border-white/10 bg-slate-950/70 text-white placeholder:text-white/30"
                                  : "border-amber-200 bg-white text-slate-900 placeholder:text-amber-300"
                              )}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={applySearch}
                            className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-600"
                          >
                            Go
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          className={cx(
                            "mb-1 block text-xs font-semibold",
                            isDark ? "text-white/55" : "text-slate-500"
                          )}
                        >
                          Status
                        </label>
                        <select
                          value={filters.status}
                          onChange={(e) =>
                            updateFilter("status", e.target.value)
                          }
                          className={cx(
                            "w-full rounded-2xl border px-3 py-3 text-sm outline-none",
                            isDark
                              ? "border-white/10 bg-slate-950/70 text-white"
                              : "border-amber-200 bg-white text-slate-900"
                          )}
                        >
                          <option value="">All</option>
                          <option value="active">Active</option>
                          <option value="claimed">Claimed</option>
                        </select>
                      </div>

                      <div>
                        <label
                          className={cx(
                            "mb-1 block text-xs font-semibold",
                            isDark ? "text-white/55" : "text-slate-500"
                          )}
                        >
                          MT5 Account
                        </label>
                        <select
                          value={filters.mt5Account}
                          onChange={(e) =>
                            updateFilter("mt5Account", e.target.value)
                          }
                          className={cx(
                            "w-full rounded-2xl border px-3 py-3 text-sm outline-none",
                            isDark
                              ? "border-white/10 bg-slate-950/70 text-white"
                              : "border-amber-200 bg-white text-slate-900"
                          )}
                        >
                          <option value="">All Accounts</option>
                          {accountOptions.map((account) => (
                            <option key={account} value={account}>
                              {account}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          className={cx(
                            "mb-1 block text-xs font-semibold",
                            isDark ? "text-white/55" : "text-slate-500"
                          )}
                        >
                          From Date
                        </label>
                        <input
                          type="date"
                          value={filters.fromDate}
                          onChange={(e) =>
                            updateFilter("fromDate", e.target.value)
                          }
                          className={cx(
                            "w-full rounded-2xl border px-3 py-3 text-sm outline-none",
                            isDark
                              ? "border-white/10 bg-slate-950/70 text-white"
                              : "border-amber-200 bg-white text-slate-900"
                          )}
                        />
                      </div>

                      <div>
                        <label
                          className={cx(
                            "mb-1 block text-xs font-semibold",
                            isDark ? "text-white/55" : "text-slate-500"
                          )}
                        >
                          To Date
                        </label>
                        <input
                          type="date"
                          value={filters.toDate}
                          onChange={(e) =>
                            updateFilter("toDate", e.target.value)
                          }
                          className={cx(
                            "w-full rounded-2xl border px-3 py-3 text-sm outline-none",
                            isDark
                              ? "border-white/10 bg-slate-950/70 text-white"
                              : "border-amber-200 bg-white text-slate-900"
                          )}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={clearFilters}
                        className={cx(
                          "rounded-2xl border px-4 py-2.5 text-sm font-bold transition",
                          isDark
                            ? "border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.08]"
                            : "border-amber-200 bg-white text-amber-600 hover:bg-amber-50"
                        )}
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div
            className={cx(
              "mt-5 overflow-hidden rounded-[24px] border",
              isDark
                ? "border-white/10 bg-white/[0.035]"
                : "border-amber-100 bg-white/85"
            )}
          >
            <div
              className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              style={{
                borderColor: isDark
                  ? "rgba(255,255,255,0.10)"
                  : "rgba(245,158,11,0.14)",
              }}
            >
              <div>
                <h2 className="text-lg font-bold">Insurance Records</h2>
                <p
                  className={cx(
                    "mt-1 text-sm",
                    isDark ? "text-white/50" : "text-slate-500"
                  )}
                >
                  {pagination.totalRecords || 0} total record(s)
                </p>
              </div>

              {filters.search ? (
                <div
                  className={cx(
                    "rounded-full border px-3 py-1 text-xs font-semibold",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white/70"
                      : "border-amber-200 bg-amber-50 text-amber-600"
                  )}
                >
                  Search: {filters.search}
                </div>
              ) : null}
            </div>

            {loading ? (
              <div className="flex min-h-[280px] items-center justify-center">
                <div className="text-center">
                  <RefreshCcw className="mx-auto h-8 w-8 animate-spin text-amber-500" />
                  <p
                    className={cx(
                      "mt-3 text-sm font-semibold",
                      isDark ? "text-white/60" : "text-slate-500"
                    )}
                  >
                    Loading insurance report...
                  </p>
                </div>
              </div>
            ) : errorText ? (
              <div className="p-6 text-center">
                <p className="font-semibold text-rose-500">{errorText}</p>
                <button
                  type="button"
                  onClick={fetchReport}
                  className="mt-4 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-white hover:bg-amber-600"
                >
                  Retry
                </button>
              </div>
            ) : rows.length === 0 ? (
              <EmptyState isDark={isDark} />
            ) : (
              <>
                <div className="hidden overflow-x-auto xl:block">
                  <table className="w-full text-sm">
                    <thead
                      className={
                        isDark ? "bg-white/[0.035]" : "bg-amber-50/80"
                      }
                    >
                      <tr>
                        {[
                          "MT5 Account",
                          "Insurance Charge",
                          "Claim Amount",
                          "Status",
                          "Deposit",
                          "Claim",
                          "Created",
                          "Action",
                        ].map((head) => (
                          <th
                            key={head}
                            className={cx(
                              "px-4 py-4 text-center text-[11px] font-bold uppercase tracking-[0.14em]",
                              isDark ? "text-white/50" : "text-slate-500"
                            )}
                          >
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((row, index) => (
                        <tr
                          key={row.coverageId || index}
                          className={cx(
                            "border-t",
                            isDark ? "border-white/10" : "border-amber-100"
                          )}
                        >
                          <td className="px-4 py-4 text-center font-mono font-bold">
                            #{row.mt5Account}
                          </td>

                          <td className="px-4 py-4 text-center font-semibold">
                            ${money(row.insuranceChargeAmount)}
                          </td>

                          <td className="px-4 py-4 text-center font-semibold">
                            ${money(row.claimAmount)}
                          </td>

                          <td className="px-4 py-4 text-center">
                            <StatusBadge status={row.status} isDark={isDark} />
                          </td>

                          <td className="px-4 py-4 text-center">
                            {row.deposit ? (
                              <div>
                                <p className="font-semibold">
                                  ${money(row.deposit.depositAmount)}
                                </p>
                                <p
                                  className={cx(
                                    "mt-1 text-xs",
                                    isDark
                                      ? "text-white/45"
                                      : "text-slate-500"
                                  )}
                                >
                                  {row.deposit.method || "N/A"}
                                </p>
                              </div>
                            ) : (
                              <span
                                className={
                                  isDark ? "text-white/40" : "text-slate-400"
                                }
                              >
                                —
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 text-center">
                            {row.claim ? (
                              <div>
                                <StatusBadge
                                  status={row.claim.status}
                                  isDark={isDark}
                                />
                                <p
                                  className={cx(
                                    "mt-1 text-xs",
                                    isDark
                                      ? "text-white/45"
                                      : "text-slate-500"
                                  )}
                                >
                                  ${money(row.claim.totalClaimAmount)}
                                </p>
                              </div>
                            ) : (
                              <span
                                className={
                                  isDark ? "text-white/40" : "text-slate-400"
                                }
                              >
                                —
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 text-center">
                            <div className="inline-flex items-center gap-2">
                              <Clock3
                                size={14}
                                className={
                                  isDark ? "text-white/45" : "text-amber-500"
                                }
                              />
                              <span>{formatDate(row.coverageCreatedAt)}</span>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedRow(row)}
                              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-amber-600"
                            >
                              <Eye size={15} />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-4 p-4 xl:hidden">
                  {rows.map((row, index) => (
                    <div
                      key={row.coverageId || index}
                      className={cx(
                        "rounded-[22px] border p-4",
                        isDark
                          ? "border-white/10 bg-white/[0.04]"
                          : "border-amber-100 bg-white"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p
                            className={cx(
                              "text-xs uppercase tracking-[0.16em]",
                              isDark ? "text-white/45" : "text-slate-500"
                            )}
                          >
                            MT5 Account
                          </p>
                          <p className="mt-1 font-mono text-lg font-bold">
                            #{row.mt5Account}
                          </p>
                        </div>
                        <StatusBadge status={row.status} isDark={isDark} />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <InfoMini
                          label="Insurance"
                          value={`$${money(row.insuranceChargeAmount)}`}
                          isDark={isDark}
                        />
                        <InfoMini
                          label="Claim"
                          value={`$${money(row.claimAmount)}`}
                          isDark={isDark}
                        />
                        <InfoMini
                          label="Deposit"
                          value={
                            row.deposit
                              ? `$${money(row.deposit.depositAmount)}`
                              : "—"
                          }
                          isDark={isDark}
                        />
                        <InfoMini
                          label="Created"
                          value={formatDate(row.coverageCreatedAt)}
                          isDark={isDark}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedRow(row)}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-amber-600"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div
              className={cx(
                "flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
                isDark ? "border-white/10" : "border-amber-100"
              )}
            >
              <p
                className={cx(
                  "text-sm",
                  isDark ? "text-white/50" : "text-slate-500"
                )}
              >
                Page {pagination.page} of {pagination.totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => goPage(pagination.page - 1)}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white"
                      : "border-amber-200 bg-white text-amber-600"
                  )}
                >
                  <ChevronLeft size={16} />
                  Prev
                </button>

                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => goPage(pagination.page + 1)}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white"
                      : "border-amber-200 bg-white text-amber-600"
                  )}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DetailModal
        row={selectedRow}
        onClose={() => setSelectedRow(null)}
        isDark={isDark}
      />
    </motion.div>
  );
}