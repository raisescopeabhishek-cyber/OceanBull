import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { adminApi } from "../../../utils/apiClients";
import { Badge, BlotterPage, Button, EmptyState } from "@/Components/ui";

const PAGE_LIMIT = 10;

/**
 * Login logs.
 *
 * Read-only, so there is no row action and no selection column — the width
 * goes to the device and location detail instead. Filtering and paging stay
 * client-side, as the endpoint returns the whole log.
 */

const formatDate = (isoDateString?: string) => {
  if (!isoDateString) return "--";
  const date = new Date(isoDateString);
  if (Number.isNaN(date.getTime())) return "--";

  const formattedDate = date.toLocaleDateString("en-GB", {
    year: "numeric",
    day: "2-digit",
    month: "2-digit",
  });

  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return `${formattedDate}, ${formattedTime}`;
};

const timeSince = (isoDateString?: string) => {
  if (!isoDateString) return "--";
  const then = new Date(isoDateString);
  if (Number.isNaN(then.getTime())) return "--";

  const diff = Date.now() - then.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);

  return parts.length ? `${parts.join(", ")} ago` : "less than a minute ago";
};

const LoginLogs = () => {
  const [logsData, setLogsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    search: "",
    window: "all",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const updateFilter = (key: string, value: string) => {
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setCurrentPage(1);
    setFilters({
      search: "",
      window: "all",
    });
    setDebouncedSearch("");
  };

  const fetchLogsData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(`/logs`);
      setLogsData((res.data?.data || []).reverse());
    } catch (error) {
      console.log("error in fetch login logs", error);
      toast.error("Data fetching failed!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const withinWindow = (item: any) => {
    if (filters.window === "all") return true;

    const stamp = new Date(item?.updatedAt);
    if (Number.isNaN(stamp.getTime())) return false;

    const hours = filters.window === "24h" ? 24 : 24 * 7;
    return Date.now() - stamp.getTime() <= hours * 60 * 60 * 1000;
  };

  const filteredData = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();

    return (logsData || []).filter((item: any) => {
      if (!withinWindow(item)) return false;
      if (!term) return true;

      return [
        item?.userId?.firstName,
        item?.userId?.lastName,
        item?.userId?.email,
        item?.userId?.phone,
        item?.ip,
        item?.browser,
        item?.os,
        item?.country,
      ].some((field) => field?.toLowerCase?.()?.includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsData, debouncedSearch, filters.window]);

  const totalPages = Math.max(
    1,
    Math.ceil((filteredData?.length || 0) / PAGE_LIMIT)
  );

  const startIndex = (currentPage - 1) * PAGE_LIMIT;
  const paginatedData = filteredData?.slice(startIndex, startIndex + PAGE_LIMIT);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const fullName = (item: any) =>
    [item?.userId?.firstName, item?.userId?.lastName]
      .filter(Boolean)
      .join(" ") || "Unknown user";

  const columns = [
    {
      key: "user",
      header: "User",
      primary: true,
      cell: (item: any) => (
        <div className="min-w-0">
          <div className="truncate font-semibold text-text">
            {fullName(item)}
          </div>
          <div className="numeric mt-0.5 truncate text-xs text-subtle">
            {item?.userId?.email || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      secondary: true,
      numeric: true,
      cell: (item: any) => item?.userId?.phone || "—",
    },
    {
      key: "ip",
      header: "IP",
      numeric: true,
      cell: (item: any) => item?.ip || "—",
    },
    {
      key: "country",
      header: "Country",
      cell: (item: any) =>
        item?.country ? (
          <Badge tone="neutral" dot={false}>
            {item.country}
          </Badge>
        ) : (
          <span className="text-subtle">—</span>
        ),
    },
    {
      key: "device",
      header: "Device",
      cell: (item: any) => (
        <div className="min-w-0">
          <div className="truncate text-xs text-text">{item?.os || "—"}</div>
          <div className="truncate text-[11px] text-subtle">
            {item?.browser || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "updatedAt",
      header: "When",
      align: "right",
      trailing: true,
      cell: (item: any) => (
        <div className="min-w-0">
          <div className="numeric truncate text-xs text-text">
            {formatDate(item?.updatedAt)}
          </div>
          <div className="truncate text-[11px] text-subtle">
            {timeSince(item?.updatedAt)}
          </div>
        </div>
      ),
    },
  ];

  const uniqueUsers = new Set(
    (filteredData || []).map((item: any) => item?.userId?.email).filter(Boolean)
  ).size;

  const uniqueIps = new Set(
    (filteredData || []).map((item: any) => item?.ip).filter(Boolean)
  ).size;

  return (
    <BlotterPage
      breadcrumb="Security / Login logs"
      title="Login logs"
      description="Every sign-in, with the device, address and location it came from."
      actions={
        <Button variant="secondary" onClick={fetchLogsData} loading={loading}>
          Refresh
        </Button>
      }
      readouts={[
        {
          key: "events",
          label: "Sign-ins shown",
          value: (filteredData?.length || 0).toLocaleString("en-US"),
          helper: `${logsData.length.toLocaleString("en-US")} on record`,
          tone: "brand",
        },
        {
          key: "users",
          label: "Distinct users",
          value: uniqueUsers.toLocaleString("en-US"),
        },
        {
          key: "ips",
          label: "Distinct addresses",
          value: uniqueIps.toLocaleString("en-US"),
          helper: uniqueIps > uniqueUsers ? "More IPs than users" : undefined,
          tone: uniqueIps > uniqueUsers * 2 ? "warn" : undefined,
        },
      ]}
      filter={{
        search: filters.search,
        onSearchChange: (v: string) => updateFilter("search", v),
        searchPlaceholder: "name, email, IP, device",
        activeChip: filters.window,
        onChipChange: (key: string) => updateFilter("window", key),
        chips: [
          { key: "all", label: "All time", tone: "primary" },
          { key: "24h", label: "Last 24h", tone: "warning" },
          { key: "7d", label: "Last 7 days", tone: "neutral" },
        ],
        summary: `${(filteredData?.length || 0).toLocaleString("en-US")} events`,
      }}
      columns={columns}
      rows={paginatedData}
      loading={loading}
      empty={
        <EmptyState
          title="No sign-ins found"
          description="Nothing matches that search in the selected period."
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
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={handlePreviousPage}
              disabled={currentPage <= 1 || loading}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || loading}
            >
              Next
            </Button>
          </div>
        </>
      }
    />
  );
};

export default LoginLogs;
