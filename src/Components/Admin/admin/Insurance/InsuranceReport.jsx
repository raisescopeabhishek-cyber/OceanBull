import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { adminApi } from "../../../../utils/apiClients";
import {
  Badge,
  BlotterPage,
  Button,
  EmptyState,
  Field,
  Input,
  StatusBadge,
} from "@/Components/ui";

const API_ENDPOINT = "/insurance/report";

/**
 * Insurance report.
 *
 * A blotter: one column set drives the desktop table and the phone rows, and
 * the deposit a policy was bought against is a secondary line on the row
 * rather than its own wide column group. The date range and MT5 account are
 * in the filter bar's `extra` slot on a desktop and in its drawer on a phone.
 */

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

const getUserName = (row) =>
  row?.user?.name?.trim() || row?.user?.email || "Unknown User";

const hasDepositData = (row) => Boolean(row?.deposit?.id || row?.deposit?._id);

const InsuranceReport = () => {
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

  const columns = [
    {
      key: "user",
      header: "User",
      primary: true,
      cell: (row) => (
        <div className="min-w-0">
          <div className="truncate font-semibold text-text">
            {getUserName(row)}
          </div>
          <div className="numeric mt-0.5 truncate text-xs text-subtle">
            {row?.user?.email || "—"}
            {row?.user?.phone ? ` · ${row.user.phone}` : ""}
          </div>
        </div>
      ),
    },
    {
      key: "mt5Account",
      header: "MT5 account",
      secondary: true,
      numeric: true,
      cell: (row) => row?.mt5Account || "—",
    },
    {
      key: "insuranceAmount",
      header: "Cover",
      align: "right",
      numeric: true,
      cell: (row) => formatAmount(row?.insuranceAmount),
    },
    {
      key: "claimAmount",
      header: "Claimed",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (row) =>
        row?.claimAmount ? (
          <span className="font-semibold text-loss">
            {formatAmount(row.claimAmount)}
          </span>
        ) : (
          <span className="text-subtle">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row?.status} />,
    },
    {
      key: "deposit",
      header: "Bought against",
      cell: (row) =>
        hasDepositData(row) ? (
          <div className="min-w-0">
            <div className="numeric truncate text-xs text-text">
              {formatAmount(row?.deposit?.depositAmount)}
              {row?.deposit?.method ? ` · ${row.deposit.method}` : ""}
            </div>
            <div className="numeric truncate text-[11px] text-subtle">
              {row?.deposit?.transactionId || row?.deposit?.orderId || "—"}
            </div>
          </div>
        ) : (
          <span className="text-subtle">No deposit linked</span>
        ),
    },
    {
      key: "dateTime",
      header: "Opened",
      cell: (row) => (
        <span className="numeric text-xs text-subtle">
          {formatDateTime(row?.dateTime)}
        </span>
      ),
    },
    {
      key: "claimedAt",
      header: "Claimed at",
      cell: (row) =>
        row?.claimedAt ? (
          <span className="numeric text-xs text-subtle">
            {formatDateTime(row.claimedAt)}
          </span>
        ) : (
          <span className="text-subtle">—</span>
        ),
    },
  ];

  /* The same controls serve the desktop filter bar and the phone drawer. */
  const rangeControls = (
    <>
      <Field label="MT5" className="w-[120px]">
        <Input
          value={filters.mt5Account}
          onChange={(e) => handleFilterChange("mt5Account", e.target.value)}
          placeholder="Account"
          aria-label="MT5 account"
          className="!min-h-8"
        />
      </Field>
      <Field label="From" className="w-[140px]">
        <Input
          type="date"
          value={filters.fromDate}
          onChange={(e) => handleFilterChange("fromDate", e.target.value)}
          aria-label="From date"
          className="!min-h-8"
        />
      </Field>
      <Field label="To" className="w-[140px]">
        <Input
          type="date"
          value={filters.toDate}
          onChange={(e) => handleFilterChange("toDate", e.target.value)}
          aria-label="To date"
          className="!min-h-8"
        />
      </Field>
    </>
  );

  return (
    <BlotterPage
      breadcrumb="Reports / Insurance"
      title="Insurance report"
      description="Cover bought against deposits, and the claims made against it."
      actions={
        <>
          <Button
            variant="secondary"
            onClick={handleExportCsv}
            disabled={!reportRows.length}
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            onClick={fetchInsuranceReport}
            loading={loading}
          >
            Refresh
          </Button>
        </>
      }
      readouts={[
        {
          key: "records",
          label: "Policies",
          value: summary.totalRecords.toLocaleString("en-US"),
          helper: `${pagination.totalPages} pages`,
          tone: "brand",
        },
        {
          key: "cover",
          label: "Total cover",
          value: formatAmount(summary.totalInsuranceAmount),
          tone: "ok",
        },
        {
          key: "claims",
          label: "Total claimed",
          value: formatAmount(summary.totalClaimAmount),
          tone: "bad",
        },
        {
          key: "split",
          label: "Active / claimed",
          value: `${summary.activeCount} / ${summary.claimedCount}`,
          helper: summary.claimedCount ? "Claims settled" : "No claims yet",
        },
      ]}
      filter={{
        search: filters.search,
        onSearchChange: (v) => handleFilterChange("search", v),
        searchPlaceholder: "name, email, MT5 account",
        activeChip: filters.status,
        onChipChange: (key) => handleFilterChange("status", key),
        chips: [
          { key: "", label: "All", tone: "primary" },
          {
            key: "active",
            label: "Active",
            tone: "success",
            count: summary.activeCount,
          },
          {
            key: "claimed",
            label: "Claimed",
            tone: "warning",
            count: summary.claimedCount,
          },
        ],
        extra: rangeControls,
        summary: `${summary.totalRecords.toLocaleString("en-US")} policies`,
      }}
      filterPanel={<div className="space-y-3">{rangeControls}</div>}
      columns={columns}
      rows={reportRows}
      loading={loading}
      rowEdge={(row) =>
        String(row?.status).toLowerCase() === "claimed" ? "warning" : null
      }
      empty={
        <EmptyState
          title="No insurance records"
          description="Nothing matches the current search, status or date range."
          action={
            <Button variant="soft" onClick={handleResetFilters}>
              Reset filters
            </Button>
          }
        />
      }
      footer={
        <>
          <span className="numeric text-xs text-subtle">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Badge tone="neutral" dot={false}>
              {reportRows.length} shown
            </Badge>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="secondary"
                onClick={goToPreviousPage}
                disabled={pagination.page <= 1 || loading}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={goToNextPage}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      }
    />
  );
};

export default InsuranceReport;
