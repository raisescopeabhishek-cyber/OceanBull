import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  BadgeDollarSign,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../../../utils/apiClients";

const API_ENDPOINT = "/insurance/report";

const formatAmount = (value, currency = "USD") => {
  if (value === undefined || value === null || value === "") return "-";

  const amount = Number(value);

  if (!Number.isFinite(amount)) return "-";

  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getUserName = (row) => {
  return row?.user?.name?.trim() || row?.user?.email || "Unknown User";
};

const hasDepositData = (row) => {
  return Boolean(row?.deposit?.id || row?.deposit?._id);
};

const getStatusClasses = (status, isDark) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "active") {
    return isDark
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "claimed") {
    return isDark
      ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
      : "border-blue-200 bg-blue-50 text-blue-700";
  }

  return isDark
    ? "border-white/10 bg-white/[0.06] text-white/70"
    : "border-slate-200 bg-slate-50 text-slate-600";
};

const StatCard = ({ icon, label, value, helper, isDark }) => {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl border p-4 transition-all duration-300",
        isDark
          ? "border-white/10 bg-white/[0.04] shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
          : "border-orange-100 bg-white shadow-[0_14px_34px_rgba(251,146,60,0.10)]",
      ].join(" ")}
    >
      <div
        className={[
          "absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl",
          isDark ? "bg-blue-500/10" : "bg-orange-300/20",
        ].join(" ")}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p
            className={[
              "text-xs font-semibold uppercase tracking-[0.16em]",
              isDark ? "text-white/45" : "text-slate-500",
            ].join(" ")}
          >
            {label}
          </p>

          <h3
            className={[
              "mt-2 text-2xl font-bold",
              isDark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            {value}
          </h3>

          {helper && (
            <p
              className={[
                "mt-1 text-xs",
                isDark ? "text-white/40" : "text-slate-500",
              ].join(" ")}
            >
              {helper}
            </p>
          )}
        </div>

        <div
          className={[
            "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border",
            isDark
              ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
              : "border-orange-200 bg-orange-50 text-orange-700",
          ].join(" ")}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const InsuranceReport = () => {
  const mode = useSelector((store) => store.adminTheme?.mode || "light");
  const isDark = mode === "dark";

  const [loading, setLoading] = useState(false);
  const [reportRows, setReportRows] = useState([]);
  const [summary, setSummary] = useState({
    totalRecords: 0,
    activeCount: 0,
    claimedCount: 0,
    totalInsuranceAmount: 0,
    totalClaimAmount: 0,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    mt5Account: "",
    fromDate: "",
    toDate: "",
  });

  const requestParams = useMemo(() => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (String(value || "").trim()) {
        params[key] = String(value).trim();
      }
    });

    return params;
  }, [filters, pagination.page, pagination.limit]);

  const fetchInsuranceReport = useCallback(async () => {
    setLoading(true);

    try {
      const response = await adminApi.get(API_ENDPOINT, {
        params: requestParams,
      });

      const payload = response?.data || {};

      setReportRows(Array.isArray(payload?.data) ? payload.data : []);

      setSummary({
        totalRecords: payload?.summary?.totalRecords || 0,
        activeCount: payload?.summary?.activeCount || 0,
        claimedCount: payload?.summary?.claimedCount || 0,
        totalInsuranceAmount: payload?.summary?.totalInsuranceAmount || 0,
        totalClaimAmount: payload?.summary?.totalClaimAmount || 0,
      });

      setPagination((prev) => ({
        ...prev,
        page: payload?.pagination?.page || prev.page,
        limit: payload?.pagination?.limit || prev.limit,
        totalPages: payload?.pagination?.totalPages || 1,
      }));
    } catch (error) {
      console.error("Insurance report fetch error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to fetch insurance report"
      );
    } finally {
      setLoading(false);
    }
  }, [requestParams]);

  useEffect(() => {
    fetchInsuranceReport();
  }, [fetchInsuranceReport]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "",
      mt5Account: "",
      fromDate: "",
      toDate: "",
    });

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleExportCsv = () => {
    if (!reportRows.length) {
      toast.error("No insurance records available to export");
      return;
    }

    const headers = [
      "User",
      "Email",
      "Phone",
      "MT5 Account",
      "Insurance Amount",
      "Claim Amount",
      "Status",
      "Date & Time",
      "Claimed At",
      "Deposit Amount",
      "Deposit Status",
      "Method",
      "Transaction ID",
      "Order ID",
    ];

    const rows = reportRows.map((row) => {
      const depositExists = hasDepositData(row);

      return [
        getUserName(row),
        row?.user?.email || "-",
        row?.user?.phone || "-",
        row?.mt5Account || "-",
        row?.insuranceAmount ?? "-",
        row?.claimAmount ?? "-",
        row?.status || "-",
        formatDateTime(row?.dateTime),
        formatDateTime(row?.claimedAt),
        depositExists ? row?.deposit?.depositAmount ?? "-" : "-",
        depositExists ? row?.deposit?.status || "-" : "-",
        depositExists ? row?.deposit?.method || "-" : "-",
        depositExists ? row?.deposit?.transactionId || "-" : "-",
        depositExists ? row?.deposit?.orderId || "-" : "-",
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `insurance-report-${Date.now()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const goToPreviousPage = () => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(prev.page - 1, 1),
    }));
  };

  const goToNextPage = () => {
    setPagination((prev) => ({
      ...prev,
      page: Math.min(prev.page + 1, prev.totalPages || 1),
    }));
  };

  return (
    <div
      className={[
        "min-h-full rounded-[22px] p-2 transition-all duration-300 sm:p-3",
        isDark ? "text-white" : "text-slate-900",
      ].join(" ")}
    >
      <div
        className={[
          "relative overflow-hidden rounded-[26px] border p-5",
          isDark
            ? "border-white/10 bg-white/[0.035]"
            : "border-orange-100 bg-white",
        ].join(" ")}
      >
        <div
          aria-hidden
          className={[
            "absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl",
            isDark ? "bg-blue-500/10" : "bg-orange-300/20",
          ].join(" ")}
        />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div
              className={[
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                isDark
                  ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                  : "border-orange-200 bg-orange-50 text-orange-700",
              ].join(" ")}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Insurance Section
            </div>

            <h1
              className={[
                "mt-3 text-2xl font-bold tracking-tight sm:text-3xl",
                isDark ? "text-white" : "text-slate-950",
              ].join(" ")}
            >
              Insurance Report
            </h1>

            <p
              className={[
                "mt-1 max-w-2xl text-sm",
                isDark ? "text-white/45" : "text-slate-500",
              ].join(" ")}
            >
              Track user insurance charges, claimable amount, coverage status,
              deposit source, and claim activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={fetchInsuranceReport}
              disabled={loading}
              className={[
                "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition",
                isDark
                  ? "border-white/10 bg-white/[0.05] text-white/80 hover:bg-white/[0.08]"
                  : "border-orange-100 bg-white text-slate-700 hover:bg-orange-50",
                loading ? "cursor-not-allowed opacity-60" : "",
              ].join(" ")}
            >
              <RefreshCw
                className={["h-4 w-4", loading ? "animate-spin" : ""].join(
                  " "
                )}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className={[
                "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition",
                isDark
                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
              ].join(" ")}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="relative mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            isDark={isDark}
            label="Total Records"
            value={summary.totalRecords}
            helper="All insurance coverages"
            icon={<ShieldCheck className="h-5 w-5" />}
          />

          <StatCard
            isDark={isDark}
            label="Active"
            value={summary.activeCount}
            helper="Available for claim"
            icon={<WalletCards className="h-5 w-5" />}
          />

          <StatCard
            isDark={isDark}
            label="Claimed"
            value={summary.claimedCount}
            helper="Already claimed"
            icon={<CalendarDays className="h-5 w-5" />}
          />

          <StatCard
            isDark={isDark}
            label="Insurance Amount"
            value={formatAmount(summary.totalInsuranceAmount)}
            helper={`Claim total: ${formatAmount(summary.totalClaimAmount)}`}
            icon={<BadgeDollarSign className="h-5 w-5" />}
          />
        </div>
      </div>

      <div
        className={[
          "mt-5 rounded-[24px] border p-4",
          isDark
            ? "border-white/10 bg-white/[0.035]"
            : "border-orange-100 bg-white",
        ].join(" ")}
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div className="xl:col-span-2">
            <label
              className={[
                "mb-1 block text-xs font-semibold uppercase tracking-[0.14em]",
                isDark ? "text-white/45" : "text-slate-500",
              ].join(" ")}
            >
              Search
            </label>

            <div
              className={[
                "flex items-center gap-2 rounded-xl border px-3 py-2",
                isDark
                  ? "border-white/10 bg-black/20"
                  : "border-orange-100 bg-orange-50/40",
              ].join(" ")}
            >
              <Search
                className={
                  isDark
                    ? "h-4 w-4 text-white/40"
                    : "h-4 w-4 text-slate-400"
                }
              />

              <input
                value={filters.search}
                onChange={(event) =>
                  handleFilterChange("search", event.target.value)
                }
                placeholder="User, email, phone, order, transaction..."
                className={[
                  "w-full bg-transparent text-sm outline-none",
                  isDark
                    ? "text-white placeholder:text-white/30"
                    : "text-slate-800 placeholder:text-slate-400",
                ].join(" ")}
              />
            </div>
          </div>

          <div>
            <label
              className={[
                "mb-1 block text-xs font-semibold uppercase tracking-[0.14em]",
                isDark ? "text-white/45" : "text-slate-500",
              ].join(" ")}
            >
              Status
            </label>

            <select
              value={filters.status}
              onChange={(event) =>
                handleFilterChange("status", event.target.value)
              }
              className={[
                "h-[42px] w-full rounded-xl border px-3 text-sm outline-none",
                isDark
                  ? "border-white/10 bg-[#0b1018] text-white"
                  : "border-orange-100 bg-orange-50/40 text-slate-800",
              ].join(" ")}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="claimed">Claimed</option>
            </select>
          </div>

          <div>
            <label
              className={[
                "mb-1 block text-xs font-semibold uppercase tracking-[0.14em]",
                isDark ? "text-white/45" : "text-slate-500",
              ].join(" ")}
            >
              MT5 Account
            </label>

            <input
              value={filters.mt5Account}
              onChange={(event) =>
                handleFilterChange("mt5Account", event.target.value)
              }
              placeholder="Account no."
              className={[
                "h-[42px] w-full rounded-xl border px-3 text-sm outline-none",
                isDark
                  ? "border-white/10 bg-black/20 text-white placeholder:text-white/30"
                  : "border-orange-100 bg-orange-50/40 text-slate-800 placeholder:text-slate-400",
              ].join(" ")}
            />
          </div>

          <div>
            <label
              className={[
                "mb-1 block text-xs font-semibold uppercase tracking-[0.14em]",
                isDark ? "text-white/45" : "text-slate-500",
              ].join(" ")}
            >
              From Date
            </label>

            <input
              type="date"
              value={filters.fromDate}
              onChange={(event) =>
                handleFilterChange("fromDate", event.target.value)
              }
              className={[
                "h-[42px] w-full rounded-xl border px-3 text-sm outline-none",
                isDark
                  ? "border-white/10 bg-[#0b1018] text-white"
                  : "border-orange-100 bg-orange-50/40 text-slate-800",
              ].join(" ")}
            />
          </div>

          <div>
            <label
              className={[
                "mb-1 block text-xs font-semibold uppercase tracking-[0.14em]",
                isDark ? "text-white/45" : "text-slate-500",
              ].join(" ")}
            >
              To Date
            </label>

            <input
              type="date"
              value={filters.toDate}
              onChange={(event) =>
                handleFilterChange("toDate", event.target.value)
              }
              className={[
                "h-[42px] w-full rounded-xl border px-3 text-sm outline-none",
                isDark
                  ? "border-white/10 bg-[#0b1018] text-white"
                  : "border-orange-100 bg-orange-50/40 text-slate-800",
              ].join(" ")}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p
            className={[
              "text-xs",
              isDark ? "text-white/40" : "text-slate-500",
            ].join(" ")}
          >
            Showing page {pagination.page} of {pagination.totalPages}
          </p>

          <button
            type="button"
            onClick={handleResetFilters}
            className={[
              "rounded-xl border px-4 py-2 text-sm font-semibold transition",
              isDark
                ? "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
                : "border-orange-100 bg-white text-slate-600 hover:bg-orange-50",
            ].join(" ")}
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div
        className={[
          "mt-5 overflow-hidden rounded-[24px] border",
          isDark
            ? "border-white/10 bg-white/[0.025]"
            : "border-orange-100 bg-white",
        ].join(" ")}
      >
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full border-collapse">
            <thead
              className={[
                isDark
                  ? "bg-white/[0.04] text-white/55"
                  : "bg-orange-50/80 text-slate-500",
              ].join(" ")}
            >
              <tr>
                {[
                  "User",
                  "MT5 Account",
                  "Insurance Amount",
                  "Claim Amount",
                  "Status",
                  "Date & Time",
                  "Deposit",
                  "Claim Info",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw
                        className={[
                          "h-7 w-7 animate-spin",
                          isDark ? "text-blue-300" : "text-orange-600",
                        ].join(" ")}
                      />

                      <p
                        className={[
                          "text-sm font-medium",
                          isDark ? "text-white/60" : "text-slate-500",
                        ].join(" ")}
                      >
                        Loading insurance report...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : reportRows.length ? (
                reportRows.map((row) => {
                  const depositExists = hasDepositData(row);

                  return (
                    <tr
                      key={row?.coverageId || row?._id}
                      className={[
                        "border-t transition",
                        isDark
                          ? "border-white/10 hover:bg-white/[0.035]"
                          : "border-orange-100 hover:bg-orange-50/50",
                      ].join(" ")}
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p
                            className={[
                              "text-sm font-semibold",
                              isDark ? "text-white" : "text-slate-900",
                            ].join(" ")}
                          >
                            {getUserName(row)}
                          </p>

                          <p
                            className={[
                              "mt-1 text-xs",
                              isDark ? "text-white/40" : "text-slate-500",
                            ].join(" ")}
                          >
                            {row?.user?.email || "-"}
                          </p>

                          <p
                            className={[
                              "mt-0.5 text-xs",
                              isDark ? "text-white/35" : "text-slate-400",
                            ].join(" ")}
                          >
                            {row?.user?.phone || "-"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={[
                            "rounded-xl border px-3 py-1.5 text-xs font-semibold",
                            isDark
                              ? "border-white/10 bg-white/[0.04] text-white/75"
                              : "border-slate-200 bg-slate-50 text-slate-700",
                          ].join(" ")}
                        >
                          {row?.mt5Account || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <p
                          className={[
                            "text-sm font-bold",
                            isDark ? "text-emerald-300" : "text-emerald-700",
                          ].join(" ")}
                        >
                          {formatAmount(row?.insuranceAmount)}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p
                          className={[
                            "text-sm font-bold",
                            isDark ? "text-blue-300" : "text-blue-700",
                          ].join(" ")}
                        >
                          {formatAmount(row?.claimAmount)}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize",
                            getStatusClasses(row?.status, isDark),
                          ].join(" ")}
                        >
                          {row?.status || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <p
                          className={[
                            "text-sm",
                            isDark ? "text-white/70" : "text-slate-700",
                          ].join(" ")}
                        >
                          {formatDateTime(row?.dateTime)}
                        </p>

                        {row?.claimedAt && (
                          <p
                            className={[
                              "mt-1 text-xs",
                              isDark ? "text-white/35" : "text-slate-400",
                            ].join(" ")}
                          >
                            Claimed: {formatDateTime(row.claimedAt)}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {depositExists ? (
                          <>
                            <p
                              className={[
                                "text-sm font-semibold",
                                isDark ? "text-white/80" : "text-slate-800",
                              ].join(" ")}
                            >
                              {formatAmount(row?.deposit?.depositAmount)}
                            </p>

                            <p
                              className={[
                                "mt-1 text-xs",
                                isDark ? "text-white/40" : "text-slate-500",
                              ].join(" ")}
                            >
                              {row?.deposit?.method || "-"} •{" "}
                              {row?.deposit?.status || "-"}
                            </p>

                            <p
                              className={[
                                "mt-0.5 text-xs",
                                isDark ? "text-white/30" : "text-slate-400",
                              ].join(" ")}
                            >
                              TXN: {row?.deposit?.transactionId || "-"}
                            </p>
                          </>
                        ) : (
                          <div>
                            <p
                              className={[
                                "text-sm font-semibold",
                                isDark ? "text-red-300" : "text-red-600",
                              ].join(" ")}
                            >
                              No deposit found
                            </p>

                            <p
                              className={[
                                "mt-1 text-xs",
                                isDark ? "text-white/35" : "text-slate-400",
                              ].join(" ")}
                            >
                              Deposit link missing
                            </p>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {row?.claim?.id ? (
                          <div>
                            <p
                              className={[
                                "text-sm font-semibold capitalize",
                                isDark ? "text-white/80" : "text-slate-800",
                              ].join(" ")}
                            >
                              {row?.claim?.status || "-"}
                            </p>

                            <p
                              className={[
                                "mt-1 text-xs",
                                isDark ? "text-white/40" : "text-slate-500",
                              ].join(" ")}
                            >
                              Type: {row?.claim?.claimType || "-"}
                            </p>

                            <p
                              className={[
                                "mt-0.5 text-xs",
                                isDark ? "text-white/35" : "text-slate-400",
                              ].join(" ")}
                            >
                              Credit TXN:{" "}
                              {row?.claim?.creditTransactionId || "-"}
                            </p>
                          </div>
                        ) : (
                          <span
                            className={[
                              "text-sm",
                              isDark ? "text-white/35" : "text-slate-400",
                            ].join(" ")}
                          >
                            No claim
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p
                      className={[
                        "text-sm font-semibold",
                        isDark ? "text-white/70" : "text-slate-700",
                      ].join(" ")}
                    >
                      No insurance records found
                    </p>

                    <p
                      className={[
                        "mt-1 text-xs",
                        isDark ? "text-white/35" : "text-slate-400",
                      ].join(" ")}
                    >
                      Try changing filters or refreshing the report.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          className={[
            "flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
            isDark ? "border-white/10" : "border-orange-100",
          ].join(" ")}
        >
          <p
            className={[
              "text-xs",
              isDark ? "text-white/40" : "text-slate-500",
            ].join(" ")}
          >
            Total records: {summary.totalRecords}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={pagination.page <= 1 || loading}
              className={[
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-white/70 disabled:opacity-40"
                  : "border-orange-100 bg-white text-slate-700 disabled:opacity-40",
              ].join(" ")}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span
              className={[
                "rounded-xl px-3 py-2 text-sm font-bold",
                isDark
                  ? "bg-white/[0.04] text-white/70"
                  : "bg-orange-50 text-slate-700",
              ].join(" ")}
            >
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              type="button"
              onClick={goToNextPage}
              disabled={pagination.page >= pagination.totalPages || loading}
              className={[
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                isDark
                  ? "border-white/10 bg-white/[0.04] text-white/70 disabled:opacity-40"
                  : "border-orange-100 bg-white text-slate-700 disabled:opacity-40",
              ].join(" ")}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceReport;